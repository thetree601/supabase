"use client";

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UrlManager } from '@/commons/constants/url';
import supabaseClient from '@/commons/providers/supabase/supabase.client';

type SubmitInput = {
  image: string; // ignored per requirements
  category: string;
  title: string;
  introduce: string; // maps to description
  content: string;
  tag: string; // space-separated, possibly with # prefixes
};

type MagazineRow = {
  id: number | string;
  image_url?: string | null;
  category: string;
  title: string;
  description: string;
  content: string;
  tags: string[] | null;
};

function buildTags(tagInput: string): string[] | null {
  if (!tagInput) return null;
  const tokens = tagInput
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .map((t) => (t.startsWith('#') ? t.slice(1) : t));
  return tokens.length > 0 ? tokens : null;
}

export function useMagazineSubmit() {
  const router = useRouter();

  const submit = useCallback(async (input: SubmitInput) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase 환경변수가 설정되어 있지 않습니다.');
      alert('환경설정 오류: Supabase 설정을 확인해주세요.');
      return;
    }

    // 1) 이미지 업로드 (vibecoding-storage / yyyy/mm/dd/{UUID}.jpg)
    let imageUrl: string | null = null;
    try {
      if (input.image) {
        const dataUrl = input.image;
        const matches = dataUrl.match(/^data:(.*?);base64,(.*)$/);
        if (!matches) {
          throw new Error('잘못된 이미지 데이터 형식입니다.');
        }
        const contentType = matches[1] || 'image/jpeg';
        const base64 = matches[2];
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i += 1) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: contentType });

        const now = new Date();
        const yyyy = String(now.getFullYear());
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const uuid = typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const path = `${yyyy}/${mm}/${dd}/${uuid}.jpg`;

        const { error: uploadError } = await supabaseClient
          .storage
          .from('videcoding-storage')
          .upload(path, blob, { contentType, upsert: false });

        if (uploadError) throw uploadError;

        const { data } = supabaseClient
          .storage
          .from('videcoding-storage')
          .getPublicUrl(path);
        imageUrl = data.publicUrl ?? null;
      }
    } catch (e) {
      console.error('이미지 업로드 실패:', e);
      alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
      return;
    }

    // Step 0: 로그인된 사용자 정보 가져오기
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      alert('로그인이 필요합니다.');
      return;
    }

    const payload = {
      image_url: imageUrl,
      category: input.category,
      title: input.title,
      description: input.introduce,
      content: input.content,
      tags: buildTags(input.tag),
      user_id: user.id, // 로그인된 user_id
    } satisfies Omit<MagazineRow, 'id'> & { user_id?: string };

    // 2) 테이블 insert (supabase-js 사용)
    const { data: rows, error: insertError } = await supabaseClient
      .from('magazine')
      .insert(payload)
      .select();

    if (insertError) {
      console.error('Supabase insert 실패', insertError);
      alert('등록에 실패하였습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const created = rows?.[0] as MagazineRow | undefined;
    if (!created?.id) {
      alert('등록은 되었으나 응답을 확인할 수 없습니다.');
      return;
    }

    alert('등록에 성공하였습니다.');
    const detailUrl = UrlManager.getMagazineDetailUrl(created.id);
    router.push(detailUrl);
  }, [router]);

  return { submit };
}


