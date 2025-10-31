"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MAGAZINES_URL } from '@/commons/constants/url';

interface MagazineData {
  id: string;
  image: string;
  category: string;
  title: string;
  introduce: string;
  content: string;
  tag: string;
  createdAt: string;
}

export const useMagazineDetailBinding = (id: string) => {
  const [magazine, setMagazine] = useState<MagazineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMagazine = async () => {
      try {
        setLoading(true);

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          setError('Supabase 환경변수가 설정되지 않았습니다.');
          setLoading(false);
          return;
        }

        const endpoint = `${supabaseUrl}/rest/v1/magazine?select=id,category,title,description,content,tags,image_url&id=eq.${id}`;
        const response = await fetch(endpoint, {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const rows: Array<{
          id: string;
          category: string;
          title: string;
          description: string;
          content: string;
          tags: string[] | null;
          image_url: string | null;
        }> = await response.json();

        if (!rows || rows.length === 0) {
          setError('해당 매거진을 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        const row = rows[0];

        const mapped: MagazineData = {
          id: row.id,
          image: row.image_url && row.image_url.length > 0 ? row.image_url : '/images/react19.png',
          category: row.category,
          title: row.title,
          introduce: row.description,
          content: row.content,
          tag: Array.isArray(row.tags) ? row.tags.join(' ') : '',
          createdAt: new Date().toISOString(),
        };

        setMagazine(mapped);
        setLoading(false);
      } catch {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    fetchMagazine();
  }, [id]);

  const goToList = () => {
    router.push(MAGAZINES_URL);
  };

  return {
    magazine,
    loading,
    error,
    goToList,
  };
};
