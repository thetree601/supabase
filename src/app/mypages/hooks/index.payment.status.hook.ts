import { useState, useEffect } from "react";
import supabaseClient from "@/commons/providers/supabase/supabase.client";

/**
 * 결제 상태 조회 Hook
 * Supabase payment 테이블에서 현재 구독 상태를 조회합니다.
 */
export function usePaymentStatus() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<"subscribed" | "free">("free");
  const [transactionKey, setTransactionKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1-1) 로그인된 사용자 정보 확인
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
        
        if (authError || !user) {
          throw new Error(authError?.message || "로그인이 필요합니다.");
        }

        // 1-2) payment 테이블에서 내 결제 정보만 조회 (user_id 필터링)
        const { data: payments, error: selectError } = await supabaseClient
          .from("payment")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (selectError) {
          throw new Error(selectError.message || "결제 정보 조회에 실패했습니다.");
        }

        if (!payments || payments.length === 0) {
          setSubscriptionStatus("free");
          setTransactionKey(null);
          return;
        }

        // 2. transaction_key로 그룹화하고 각 그룹에서 created_at 최신 1건씩 추출
        // payments는 이미 created_at 내림차순으로 정렬되어 있으므로,
        // 각 transaction_key에 대해 처음 나오는 레코드만 저장하면 최신 레코드가 됩니다.
        const groupedByTransactionKey = new Map<string, typeof payments[0]>();
        
        for (const payment of payments) {
          const key = payment.transaction_key;
          if (!key) continue;

          // 이미 해당 transaction_key의 레코드가 있으면 스킵 (더 최신 레코드가 이미 저장됨)
          if (groupedByTransactionKey.has(key)) {
            continue;
          }

          // 각 transaction_key에 대해 처음 나오는 레코드만 저장 (최신 레코드)
          groupedByTransactionKey.set(key, payment);
        }

        // 3. 그룹 결과에서 status === "Paid"이고 start_at <= 현재시각 <= end_grace_at인 것만 필터링
        const now = new Date();
        const activePayments = Array.from(groupedByTransactionKey.values()).filter((payment) => {
          // status가 "Paid"인지 확인
          if (payment.status !== "Paid") {
            return false;
          }

          // start_at과 end_grace_at이 있는지 확인
          if (!payment.start_at || !payment.end_grace_at) {
            return false;
          }

          const startAt = new Date(payment.start_at);
          const endGraceAt = new Date(payment.end_grace_at);

          // 현재 시각이 start_at과 end_grace_at 사이인지 확인
          return startAt <= now && now <= endGraceAt;
        });

        // 4. 조회 결과에 따른 로직 처리
        if (activePayments.length > 0) {
          // 조회 결과 1건 이상: 구독중
          const latestPayment = activePayments[0]; // 가장 최신 결제 정보 사용
          setSubscriptionStatus("subscribed");
          setTransactionKey(latestPayment.transaction_key || null);
        } else {
          // 조회 결과 0건: Free
          setSubscriptionStatus("free");
          setTransactionKey(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
        setError(errorMessage);
        console.error("결제 상태 조회 오류:", err);
        // 에러 발생 시 기본값으로 설정
        setSubscriptionStatus("free");
        setTransactionKey(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentStatus();
  }, []);

  return {
    subscriptionStatus,
    transactionKey,
    isLoading,
    error,
  };
}

