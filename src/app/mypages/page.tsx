"use client"

import { useRouter } from "next/navigation";
import { usePaymentCancel } from "./hooks/index.payment.cancel.hook";
import { usePaymentStatus } from "./hooks/index.payment.status.hook";
import { useProfile } from "./hooks/index.profile.hook";

function GlossaryMagazinesMypage() {
  const router = useRouter();
  const { profile, isLoading: isProfileLoading, error: profileError } = useProfile();
  const { cancelPayment, isLoading: isCancelLoading } = usePaymentCancel();
  const { subscriptionStatus, transactionKey, isLoading: isStatusLoading } = usePaymentStatus();

  const handleBackToList = () => {
    router.push('/magazines');
  };

  const handleCancelSubscription = async () => {
    if (!confirm("구독을 취소하시겠습니까?")) {
      return;
    }

    // transactionKey가 없는 경우 처리
    if (!transactionKey) {
      alert("결제 정보를 찾을 수 없습니다.");
      return;
    }

    // 포트원 결제 취소 API 호출
    const result = await cancelPayment(transactionKey);
    
    // 성공 시 페이지 새로고침하여 상태 재조회 (hook에서 자동으로 상태가 업데이트됨)
    if (result.success) {
      // hook에서 자동으로 상태가 업데이트되므로 별도 처리 불필요
    } else if (result.error) {
      alert(`구독 취소 실패: ${result.error}`);
    }
  };

  const handleSubscribe = () => {
    // 구독하기 버튼 클릭 시 구독 페이지로 이동
    router.push("/subscribe");
  };

  // hook에서 가져온 구독 상태 사용 (로딩 중이면 기본값 "free" 사용)
  const isSubscribed = !isStatusLoading && subscriptionStatus === "subscribed";
  const isLoading = isStatusLoading || isCancelLoading || isProfileLoading;

  // 프로필 로딩 중
  if (isProfileLoading) {
    return (
      <div className="mypage-wrapper">
        <div style={{ padding: "2rem", textAlign: "center" }}>로딩 중...</div>
      </div>
    );
  }

  // 프로필 에러 또는 프로필 없음
  if (profileError || !profile) {
    return (
      <div className="mypage-wrapper">
        <div style={{ padding: "2rem", textAlign: "center" }}>
          프로필을 불러올 수 없습니다: {profileError || "로그인이 필요합니다."}
        </div>
      </div>
    );
  }

  // 프로필 이미지가 없을 경우 기본 이미지 사용
  const profileImage = profile.profileImage || "https://via.placeholder.com/150";

  return (
    <div className="mypage-wrapper">
      <button className="mypage-back-btn" onClick={handleBackToList}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.5 15L7.5 10L12.5 5" />
        </svg>
        목록으로
      </button>

      <div className="mypage-header">
        <h1>IT 매거진 구독</h1>
        <p className="mypage-header-desc">프리미엄 콘텐츠를 제한 없이 이용하세요</p>
      </div>

      <div className="mypage-grid">
        {/* 프로필 카드 */}
        <div className="mypage-profile-card">
          <img 
            src={profileImage} 
            alt={profile.name}
            className="mypage-avatar"
          />
          <h2 className="mypage-name">{profile.name}</h2>
          <p className="mypage-bio-text">{profile.email}</p>
          <div className="mypage-join-date">가입일 {profile.joinDate}</div>
        </div>

        {/* 구독 플랜 카드 */}
        <div className={`mypage-subscription-card ${isSubscribed ? 'active' : ''}`}>
          <div className="mypage-subscription-header">
            <h3 className="mypage-card-title">구독 플랜</h3>
            {isSubscribed ? (
              <span className="mypage-badge-active">구독중</span>
            ) : (
              <span className="mypage-badge-inactive">Free</span>
            )}
          </div>

          {isSubscribed ? (
            <div className="mypage-subscription-active">
              <div className="mypage-plan-name">IT Magazine Premium</div>
              <div className="mypage-plan-features">
                <div className="mypage-feature-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3337 4L6.00033 11.3333L2.66699 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>모든 프리미엄 콘텐츠 무제한 이용</span>
                </div>
                <div className="mypage-feature-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3337 4L6.00033 11.3333L2.66699 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>매주 새로운 IT 트렌드 리포트</span>
                </div>
                <div className="mypage-feature-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3337 4L6.00033 11.3333L2.66699 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>광고 없는 깔끔한 읽기 환경</span>
                </div>
              </div>
              <button 
                className="mypage-cancel-btn"
                onClick={handleCancelSubscription}
                disabled={isLoading}
              >
                {isLoading ? "처리중..." : "구독 취소"}
              </button>
            </div>
          ) : (
            <div className="mypage-subscription-inactive">
              <div className="mypage-unsubscribed-message">
                구독하고 프리미엄 콘텐츠를 즐겨보세요
              </div>
              <div className="mypage-plan-preview">
                <div className="mypage-preview-item">✓ 모든 프리미엄 콘텐츠</div>
                <div className="mypage-preview-item">✓ 매주 트렌드 리포트</div>
                <div className="mypage-preview-item">✓ 광고 없는 환경</div>
              </div>
              <button 
                className="mypage-subscribe-btn"
                onClick={handleSubscribe}
                disabled={isLoading}
              >
                {isLoading ? "로딩중..." : "지금 구독하기"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GlossaryMagazinesMypage;

