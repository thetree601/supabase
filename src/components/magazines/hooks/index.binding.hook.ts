"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/commons/providers/supabase/supabase.client';
import { getMagazineDetailUrl } from '@/commons/constants/url';

export interface MagazineListItem {
  id: string; // uuid
  image_url: string;
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
          .select('id, image_url, category, title, description, tags')
          .limit(10);

        if (fetchError) {
          throw fetchError;
        }

        if (!aborted) {
          const normalized = (data ?? []).map((row: {
            id: string;
            image_url: string | null;
            category: string | null;
            title: string | null;
            description: string | null;
            tags: string[] | null;
          }) => ({
            id: String(row.id),
            image_url: row.image_url ?? '',
            category: row.category ?? '',
            title: row.title ?? '',
            description: row.description ?? '',
            tags: Array.isArray(row.tags) ? row.tags : row.tags == null ? null : [],
          })) as MagazineListItem[];

          setMagazines(normalized);
        }
      } catch (e: unknown) {
        if (!aborted) {
          let errorMessage = '데이터 조회 중 오류가 발생했습니다.';
          if (e instanceof Error) {
            errorMessage = e.message;
            // DNS 해석 실패나 네트워크 오류인 경우 더 명확한 메시지
            const errorStr = String(e.message || '');
            const errorDetails = (e as Error & { details?: string })?.details || '';
            if (
              errorStr.includes('Failed to fetch') || 
              errorStr.includes('ERR_NAME_NOT_RESOLVED') || 
              errorStr.includes('network') ||
              errorDetails.includes('ERR_NAME_NOT_RESOLVED') ||
              errorDetails.includes('Failed to fetch')
            ) {
              errorMessage = 'Supabase 서버에 연결할 수 없습니다.\n프로젝트가 삭제되었거나 일시 중지되었을 수 있습니다.\nSupabase 대시보드에서 프로젝트 상태를 확인해주세요.';
            }
          }
          console.error('Magazines 조회 오류:', e);
          setError(errorMessage);
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


