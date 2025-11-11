"use client";

import { createClient } from '@supabase/supabase-js';

// Browser Supabase client using public anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export const supabaseClient = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다. 더미 클라이언트를 사용합니다.');
    // Create a dummy object to avoid runtime crashes during builds lacking envs
    // Consumers should handle errors from operations
    return createClient('https://example.supabase.co', 'public-anon-key');
  }
  
  // URL 유효성 검사
  try {
    const url = new URL(supabaseUrl);
    if (!url.hostname.includes('.supabase.co')) {
      console.warn('⚠️ Supabase URL 형식이 올바르지 않습니다:', supabaseUrl);
    }
  } catch {
    console.error('❌ Supabase URL이 유효하지 않습니다:', supabaseUrl);
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
})();

export default supabaseClient;










