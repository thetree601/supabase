import supabaseClient from '@/commons/providers/supabase/supabase.client';

export const useGoogleLogin = () => {
  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/login/success`,
        },
      });

      if (error) {
        console.error('구글 로그인 오류:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('구글 로그인 중 에러 발생:', error);
      throw error;
    }
  };

  return { handleGoogleLogin };
};

