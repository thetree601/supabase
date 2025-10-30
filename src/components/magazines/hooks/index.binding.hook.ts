"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/commons/providers/supabase/supabase.client';
import { getMagazineDetailUrl } from '@/commons/constants/url';

export interface MagazineListItem {
  id: string; // uuid
  category: string;
  title: string;
  description: string;
  tags: string[] | null;
}

interface UseMagazinesBindingReturn {
  magazines: MagazineListItem[];
  loading: boolean;
  error: string | null;
  goToDetail: (id: string) => void;
}

export const useMagazinesBinding = (): UseMagazinesBindingReturn => {
  const [magazines, setMagazines] = useState<MagazineListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let aborted = false;

    const fetchMagazines = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabaseClient
          .from('magazine')
          .select('id, category, title, description, tags')
          .limit(10);

        if (fetchError) {
          throw fetchError;
        }

        if (!aborted) {
          const normalized = (data ?? []).map((row: any) => ({
            id: String(row.id),
            category: row.category ?? '',
            title: row.title ?? '',
            description: row.description ?? '',
            tags: Array.isArray(row.tags) ? row.tags : row.tags == null ? null : [],
          })) as MagazineListItem[];

          setMagazines(normalized);
        }
      } catch (e: any) {
        if (!aborted) {
          setError(e?.message ?? '데이터 조회 중 오류가 발생했습니다.');
        }
      } finally {
        if (!aborted) {
          setLoading(false);
        }
      }
    };

    fetchMagazines();
    return () => {
      aborted = true;
    };
  }, []);

  const goToDetail = (id: string) => {
    router.push(getMagazineDetailUrl(id));
  };

  return { magazines, loading, error, goToDetail };
};


