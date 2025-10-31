"use client";

import { createClient } from '@supabase/supabase-js';

// Browser Supabase client using public anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export const supabaseClient = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Create a dummy object to avoid runtime crashes during builds lacking envs
    // Consumers should handle errors from operations
    return createClient('https://example.supabase.co', 'public-anon-key');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
})();

export default supabaseClient;




