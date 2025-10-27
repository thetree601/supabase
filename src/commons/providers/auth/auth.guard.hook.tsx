import { useCallback } from 'react';

export const useAuthGuard = () => {
  const checkAuth = useCallback(() => {
    // 인증 확인 로직
    return true; // 임시로 항상 true 반환
  }, []);

  const checkPermission = useCallback(() => {
    // 권한 확인 로직
    return true; // 임시로 항상 true 반환
  }, []);

  return {
    checkAuth,
    checkPermission,
  };
};
