import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

/**
 * POST /api/portone
 * PortOne v2를 사용한 구독 결제 완료 처리 및 다음달 구독 예약 API
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 요청 데이터 파싱
    const body = await request.json();
    const { payment_id, status } = body;

    // 1-1. 필수 데이터 검증
    if (!payment_id || !status) {
      return NextResponse.json(
        { success: false, error: "payment_id와 status가 필요합니다." },
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
        `https://api.portone.io/payments/${encodeURIComponent(payment_id)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `PortOne ${PORTONE_API_SECRET}`,
          },
        }
      );

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        console.error("PortOne 결제 조회 실패:", errorData);
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

      // 결제정보에서 필요한 데이터 추출
      const amount = paymentInfo.amount?.total || paymentInfo.amount;
      const billingKey = paymentInfo.billingKey;
      const orderName = paymentInfo.order?.name || paymentInfo.orderName;
      const customerId = paymentInfo.customer?.id;

      if (!amount || !billingKey || !orderName || !customerId) {
        return NextResponse.json(
          {
            success: false,
            error: "결제 정보에 필수 데이터가 누락되었습니다.",
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
        .update(`schedule_${payment_id}`)
        .digest("hex");
      // UUID 형식으로 변환 (8-4-4-4-12)
      const nextScheduleId = `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;

      // 2-3. Supabase에 payment 테이블에 데이터 등록
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      const { error: insertError } = await supabase.from("payment").insert({
        transaction_key: payment_id,
        amount: amount,
        status: "Paid",
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        end_grace_at: endGraceAt.toISOString(),
        next_schedule_at: nextScheduleAt.toISOString(),
        next_schedule_id: nextScheduleId,
      });

      if (insertError) {
        console.error("Supabase 저장 실패:", insertError);
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
        const scheduleError = await scheduleResponse.json();
        console.error("PortOne 구독 예약 실패:", scheduleError);
        // 예약 실패해도 이미 payment는 저장되었으므로 경고만 로깅
        console.warn(
          "다음달 구독 예약에 실패했지만, 현재 결제 정보는 저장되었습니다."
        );
      }
    }

    // 4. 성공 응답 반환
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("API 처리 중 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "서버 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

