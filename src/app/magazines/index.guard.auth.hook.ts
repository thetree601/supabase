import { useLoginLogoutStatus } from './index.login.logout.status.hook';

/**
 * 로그인 액션 가드 훅
 * 비로그인 사용자의 특정 액션을 차단하고 알림을 표시합니다.
 */
export const useGuardAuth = () => {
  const { isLoggedIn } = useLoginLogoutStatus();

  /**
   * 로그인 여부를 검사하고, 비로그인시 알림을 띄우고 작업을 중단합니다.
   * @returns 로그인된 경우 true, 비로그인인 경우 false
   */
  const guardAuthAction = (): boolean => {
    if (!isLoggedIn) {
      alert('로그인 후 이용 가능합니다');
      return false;
    }
    return true;
  };

  return {
    guardAuthAction,
  };
};

