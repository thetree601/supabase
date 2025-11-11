import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import axios from "axios";

/**
 * POST /api/portone
 * PortOne v2를 사용한 구독 결제 완료 처리 및 다음달 구독 예약 API
 * Paid 시나리오: 결제 완료 처리 및 다음달 구독 예약
 * Cancelled 시나리오: 결제 취소 처리 및 다음달 구독 예약 취소
 */
export async function POST(request: NextRequest) {
  let requestBody: { payment_id?: string; tx_id?: string; status?: string } | null = null;
  try {
    // 1. 요청 데이터 파싱
    const body = await request.json();
    requestBody = body; // 에러 핸들링을 위해 저장
    
    // 디버깅: 받은 데이터 로깅
    console.log("포트원 웹훅 수신 데이터:", JSON.stringify(body, null, 2));
    
    const { payment_id, tx_id, status } = body;

    // 1-1. 필수 데이터 검증
    // payment_id 또는 tx_id 중 하나는 있어야 함
    const actualPaymentId = payment_id || tx_id;
    
    console.log("검증 데이터:", {
      payment_id,
      tx_id,
      actualPaymentId,
      status,
      hasPaymentId: !!payment_id,
      hasTxId: !!tx_id,
      hasStatus: !!status,
    });
    
    if (!actualPaymentId || !status) {
      console.error("필수 데이터 누락:", {
        actualPaymentId,
        status,
        body,
      });
      return NextResponse.json(
        { success: false, error: "payment_id(또는 tx_id)와 status가 필요합니다.", received: body },
        { status: 400 }
      );
    }

    if (status !== "Paid" && status !== "Cancelled") {
      return NextResponse.json(
        { success: false, error: "status는 'Paid' 또는 'Cancelled'여야 합니다." },
        { status: 400 }
      );
    }

    // 1-2. 환경 변수 확인
    const PORTONE_API_SECRET = process.env.PORTONE_API_SECRET;
    if (!PORTONE_API_SECRET) {
      return NextResponse.json(
        { success: false, error: "PORTONE_API_SECRET이 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { success: false, error: "Supabase 환경 변수가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // 2. 구독결제완료시나리오 (status === "Paid")
    if (status === "Paid") {
      // 2-1. paymentId의 결제정보를 조회
      const paymentResponse = await fetch(
        `https://api.portone.io/payments/${encodeURIComponent(actualPaymentId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `PortOne ${PORTONE_API_SECRET}`,
          },
        }
      );

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        console.error("PortOne 결제 조회 실패:", {
          paymentId: actualPaymentId,
          status: paymentResponse.status,
          error: errorData,
        });
        return NextResponse.json(
          {
            success: false,
            error: "결제 정보 조회 중 오류가 발생했습니다.",
            details: errorData,
          },
          { status: paymentResponse.status }
        );
      }

      const paymentInfo = await paymentResponse.json();
      
      console.log("PortOne 결제 정보 조회 성공:", {
        paymentId: actualPaymentId,
        hasAmount: !!paymentInfo.amount,
        hasBillingKey: !!paymentInfo.billingKey,
        hasOrderName: !!paymentInfo.order?.name,
        hasCustomerId: !!paymentInfo.customer?.id,
      });

      // 결제정보에서 필요한 데이터 추출
      const amount = paymentInfo.amount?.total || paymentInfo.amount;
      const billingKey = paymentInfo.billingKey;
      const orderName = paymentInfo.order?.name || paymentInfo.orderName;
      const customerId = paymentInfo.customer?.id;
      
      console.log("추출된 데이터:", {
        amount,
        billingKey,
        orderName,
        customerId,
      });

      if (!amount || !billingKey || !orderName || !customerId) {
        console.error("결제 정보 필수 데이터 누락:", {
          amount,
          billingKey,
          orderName,
          customerId,
          paymentInfo,
        });
        return NextResponse.json(
          {
            success: false,
            error: "결제 정보에 필수 데이터가 누락되었습니다.",
            missing: {
              amount: !amount,
              billingKey: !billingKey,
              orderName: !orderName,
              customerId: !customerId,
            },
          },
          { status: 400 }
        );
      }

      // 2-2. 시간 계산
      const now = new Date();
      const startAt = now;
      const endAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30일
      const endGraceAt = new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000); // +31일

      // next_schedule_at: end_at + 1일 오전 10시~11시 사이 임의 시각
      const nextScheduleBase = new Date(endAt.getTime() + 24 * 60 * 60 * 1000); // end_at + 1일
      nextScheduleBase.setHours(10, 0, 0, 0); // 오전 10시로 설정
      const randomMinutes = Math.floor(Math.random() * 60); // 0~59분 사이 랜덤
      const nextScheduleAt = new Date(
        nextScheduleBase.getTime() + randomMinutes * 60 * 1000
      );

      // next_schedule_id: 동기화되는 UUID 생성 (payment_id 기반)
      // payment_id를 기반으로 일관된 UUID 생성 (랜덤이 아닌 동기화되는 값)
      const hash = createHash("sha256")
        .update(`schedule_${actualPaymentId}`)
        .digest("hex");
      // UUID 형식으로 변환 (8-4-4-4-12)
      const nextScheduleId = `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;

      // 2-3. Supabase에 payment 테이블에 데이터 등록
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      const insertData = {
        transaction_key: actualPaymentId,
        amount: amount,
        status: "Paid",
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        end_grace_at: endGraceAt.toISOString(),
        next_schedule_at: nextScheduleAt.toISOString(),
        next_schedule_id: nextScheduleId,
      };
      
      console.log("Supabase 저장 시도:", insertData);

      const { error: insertError } = await supabase.from("payment").insert(insertData);

      if (insertError) {
        console.error("Supabase 저장 실패:", {
          error: insertError,
          paymentId: actualPaymentId,
          amount,
        });
        return NextResponse.json(
          {
            success: false,
            error: "결제 정보 저장 중 오류가 발생했습니다.",
            details: insertError.message,
          },
          { status: 500 }
        );
      }

      // 3. 다음달구독예약시나리오
      // 3-1. 포트원에 다음달 구독결제를 예약
      const scheduleResponse = await fetch(
        `https://api.portone.io/payments/${encodeURIComponent(
          nextScheduleId
        )}/schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `PortOne ${PORTONE_API_SECRET}`,
          },
          body: JSON.stringify({
            payment: {
              billingKey: billingKey,
              orderName: orderName,
              customer: {
                id: customerId,
              },
              amount: {
                total: amount,
              },
              currency: "KRW",
            },
            timeToPay: nextScheduleAt.toISOString(),
          }),
        }
      );

      if (!scheduleResponse.ok) {
        const scheduleErrorText = await scheduleResponse.text();
        let scheduleError;
        try {
          scheduleError = JSON.parse(scheduleErrorText);
        } catch {
          scheduleError = { message: scheduleErrorText };
        }
        console.error("PortOne 구독 예약 실패:", {
          nextScheduleId,
          status: scheduleResponse.status,
          error: scheduleError,
        });
        // 예약 실패해도 이미 payment는 저장되었으므로 경고만 로깅
        console.warn(
          "다음달 구독 예약에 실패했지만, 현재 결제 정보는 저장되었습니다."
        );
      }
    }

    // 4. 구독결제취소시나리오 (status === "Cancelled")
    if (status === "Cancelled") {
      // 4-1. paymentId의 결제정보를 조회
      const paymentResponse = await fetch(
        `https://api.portone.io/payments/${encodeURIComponent(actualPaymentId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `PortOne ${PORTONE_API_SECRET}`,
          },
        }
      );

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        console.error("PortOne 결제 조회 실패:", {
          paymentId: actualPaymentId,
          status: paymentResponse.status,
          error: errorData,
        });
        return NextResponse.json(
          {
            success: false,
            error: "결제 정보 조회 중 오류가 발생했습니다.",
            details: errorData,
          },
          { status: paymentResponse.status }
        );
      }

      const paymentInfo = await paymentResponse.json();
      console.log("PortOne 결제 정보 조회 성공 (취소):", {
        paymentId: actualPaymentId,
        hasBillingKey: !!paymentInfo.billingKey,
      });

      // 4-2. Supabase에서 기존 결제 정보 조회
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      console.log("Supabase에서 기존 결제 정보 조회 중...");
      const { data: existingPayment, error: selectError } = await supabase
        .from("payment")
        .select("*")
        .eq("transaction_key", actualPaymentId)
        .eq("status", "Paid")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (selectError || !existingPayment) {
        console.error("기존 결제 정보 조회 실패:", selectError);
        return NextResponse.json(
          {
            success: false,
            error: "취소할 결제 정보를 찾을 수 없습니다.",
            details: selectError?.message,
          },
          { status: 404 }
        );
      }

      console.log("기존 결제 정보 조회 성공:", existingPayment);

      // 4-3. Supabase payment 테이블에 취소 레코드 저장
      console.log("Supabase에 취소 정보 저장 중...");
      const { data: cancelRecord, error: cancelInsertError } = await supabase
        .from("payment")
        .insert({
          transaction_key: existingPayment.transaction_key,
          amount: -existingPayment.amount, // 음수로 저장
          status: "Cancel",
          start_at: existingPayment.start_at,
          end_at: existingPayment.end_at,
          end_grace_at: existingPayment.end_grace_at,
          next_schedule_at: existingPayment.next_schedule_at,
          next_schedule_id: existingPayment.next_schedule_id,
        })
        .select()
        .single();

      if (cancelInsertError) {
        console.error("Supabase 취소 정보 저장 실패:", cancelInsertError);
        return NextResponse.json(
          {
            success: false,
            error: "결제 취소 정보 저장 중 오류가 발생했습니다.",
            details: cancelInsertError.message,
          },
          { status: 500 }
        );
      }

      console.log("Supabase 취소 정보 저장 성공:", cancelRecord);

      // 4-4. 포트원에 다음 달 구독 예약 취소
      const billingKey = paymentInfo.billingKey;
      if (existingPayment.next_schedule_id && billingKey) {
        console.log("다음 달 구독 예약 취소 중...");

        // 4-4-1. 예약된 결제정보 조회
        // next_schedule_at의 전후 1일 범위로 필터링
        const nextScheduleAt = new Date(existingPayment.next_schedule_at);
        const fromDate = new Date(nextScheduleAt);
        fromDate.setDate(fromDate.getDate() - 1);
        const untilDate = new Date(nextScheduleAt);
        untilDate.setDate(untilDate.getDate() + 1);

        console.log("예약된 결제정보 조회 중:", {
          billingKey: billingKey,
          from: fromDate.toISOString(),
          until: untilDate.toISOString(),
        });

        // axios 사용: GET + body 지원 (표준은 아니지만 포트원 API 스펙)
        try {
          const schedulesResponse = await axios.get(
            `https://api.portone.io/payment-schedules`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `PortOne ${PORTONE_API_SECRET}`,
              },
              data: {
                filter: {
                  billingKey: billingKey,
                  from: fromDate.toISOString(),
                  until: untilDate.toISOString(),
                },
              },
            }
          );

          const schedulesData = schedulesResponse.data;
          console.log("예약 정보 조회 성공:", schedulesData);

          // 4-4-2. items를 순회하여 schedule 객체의 id 추출
          interface PaymentScheduleItem {
            id: string;
            paymentId: string;
            [key: string]: unknown;
          }

          const scheduleToCancel = schedulesData.items?.find(
            (item: PaymentScheduleItem) =>
              item.paymentId === existingPayment.next_schedule_id
          );

          if (scheduleToCancel) {
            console.log("취소할 스케줄 발견:", scheduleToCancel.id);

            // 4-4-3. 포트원에 다음달 구독예약 취소
            const deleteScheduleResponse = await fetch(
              `https://api.portone.io/payment-schedules`,
              {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `PortOne ${PORTONE_API_SECRET}`,
                },
                body: JSON.stringify({
                  scheduleIds: [scheduleToCancel.id],
                }),
              }
            );

            if (!deleteScheduleResponse.ok) {
              const errorText = await deleteScheduleResponse.text();
              console.error("포트원 스케줄 취소 실패:", errorText);
              // 스케줄 취소 실패는 로그만 남기고 성공 응답 반환 (취소 저장은 성공했으므로)
            } else {
              console.log("다음 달 구독 예약 취소 성공");
            }
          } else {
            console.log("취소할 스케줄을 찾을 수 없습니다.");
          }
        } catch (error) {
          console.error("포트원 예약 정보 조회 실패:", error);
          // 조회 실패는 로그만 남기고 계속 진행
        }
      } else {
        console.log(
          "next_schedule_id 또는 billingKey가 없어 구독 예약 취소를 건너뜁니다."
        );
      }

      // 성공 응답 반환
      return NextResponse.json({
        success: true,
        message: "결제 취소 처리 완료",
        payment: cancelRecord,
      });
    }

    // 5. 성공 응답 반환
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("API 처리 중 오류:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      body: requestBody,
    });
    return NextResponse.json(
      {
        success: false,
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

