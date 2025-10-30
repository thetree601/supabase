"use client";

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UrlManager } from '@/commons/constants/url';

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

    const payload = {
      // image_url is ignored by requirement
      category: input.category,
      title: input.title,
      description: input.introduce,
      content: input.content,
      tags: buildTags(input.tag),
    } satisfies Omit<MagazineRow, 'id'>;

    const response = await fetch(`${supabaseUrl}/rest/v1/magazine`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Supabase insert 실패', response.status, errorText);
      alert('등록에 실패하였습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const rows = (await response.json()) as MagazineRow[];
    const created = rows?.[0];
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


