"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MAGAZINES_URL } from '@/commons/constants/url';

interface MagazineData {
  id: number;
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
    try {
      console.log('매거진 상세 데이터 로딩 시작, ID:', id);
      
      // 로컬스토리지에서 magazines 데이터 가져오기
      const magazinesData = localStorage.getItem('magazines');
      
      if (!magazinesData) {
        console.log('magazines 데이터가 없음');
        setError('매거진 데이터를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      const magazines: MagazineData[] = JSON.parse(magazinesData);
      console.log('로컬스토리지 magazines:', magazines);

      // ID와 일치하는 매거진 찾기
      const foundMagazine = magazines.find(m => m.id === parseInt(id));
      
      if (!foundMagazine) {
        console.log('해당 ID의 매거진을 찾을 수 없음:', id);
        setError('해당 매거진을 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      console.log('찾은 매거진:', foundMagazine);
      setMagazine(foundMagazine);
      setLoading(false);

    } catch (error) {
      console.error('매거진 데이터 로딩 중 오류:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
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
