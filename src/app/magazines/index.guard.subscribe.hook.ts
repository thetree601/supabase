"use client";

import { useCallback } from "react";
import supabaseClient from "@/commons/providers/supabase/supabase.client";

/**
 * 구독 Guard Hook
 * 구독 상태를 확인하고, 비구독시 알림을 띄우는 기능을 제공합니다.
 */
export const useSubscribeGuard = () => {
  /**
   * 구독 상태를 확인하고, 비구독시 알림을 띄우고 작업을 중단합니다.
   * @returns {Promise<boolean>} 구독중이면 true, 비구독이면 false
   */
  const checkSubscription = useCallback(async (): Promise<boolean> => {
    try {
      // 1-1) 로그인된 사용자 정보 확인
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      
      if (authError || !user) {
        alert("로그인이 필요합니다.");
        return false;
      }

      // 1-2) payment 테이블에서 내 결제 정보만 조회 (user_id 필터링)
      const { data: payments, error: selectError } = await supabaseClient
        .from("payment")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (selectError) {
        console.error("결제 정보 조회 오류:", selectError);
        alert("구독 상태 확인 중 오류가 발생했습니다.");
        return false;
      }

      if (!payments || payments.length === 0) {
        alert("구독 후 이용 가능합니다.");
        return false;
      }

      // 1-3) transaction_key로 그룹화하고 각 그룹에서 created_at 최신 1건씩 추출
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

      // 1-4) 위 그룹 결과에서 조회: status === "Paid" && start_at <= 현재시각 <= end_grace_at
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

      // 조회 결과 1건 이상: 구독중
      if (activePayments.length > 0) {
        return true;
      }

      // 조회 결과 0건: 비구독
      alert("구독 후 이용 가능합니다.");
      return false;
    } catch (err) {
      console.error("구독 상태 확인 오류:", err);
      alert("구독 상태 확인 중 오류가 발생했습니다.");
      return false;
    }
  }, []);

  return {
    checkSubscription,
  };
};

