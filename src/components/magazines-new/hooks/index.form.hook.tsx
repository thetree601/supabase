"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useModal } from '@/commons/providers/modal/modal.provider';
import { getMagazineDetailUrl, MAGAZINES_URL } from '@/commons/constants/url';

// 폼 스키마 정의
const magazineFormSchema = z.object({
  image: z.string().min(1, '이미지를 선택해주세요'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  title: z.string().min(1, '제목을 입력해주세요'),
  introduce: z.string().min(1, '한줄 소개를 입력해주세요'),
  content: z.string().min(1, '상세 내용을 입력해주세요'),
  tag: z.string().min(1, '태그를 입력해주세요'),
});

type MagazineFormData = z.infer<typeof magazineFormSchema>;

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

export const useMagazineForm = () => {
  const router = useRouter();
  const { openModal, closeModal } = useModal();

  const form = useForm<MagazineFormData>({
    resolver: zodResolver(magazineFormSchema),
    defaultValues: {
      image: '',
      category: '',
      title: '',
      introduce: '',
      content: '',
      tag: '',
    },
  });

  const { watch, formState: { isValid, errors } } = form;
  const watchedValues = watch();

  console.log('폼 상태:', { isValid, errors, watchedValues });

  // 모든 필드가 입력되었는지 확인 (더 간단하게)
  const isFormValid = watchedValues.image && 
    watchedValues.category && 
    watchedValues.title && 
    watchedValues.introduce && 
    watchedValues.content && 
    watchedValues.tag;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기가 너무 큽니다. 5MB 이하의 파일을 선택해주세요.');
        return;
      }

      // 파일을 base64로 변환하여 저장
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('이미지 크기:', result.length, 'bytes');
        form.setValue('image', result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 현재 선택된 이미지 URL 가져오기
  const selectedImage = form.watch('image');

  const onSubmit = (data: MagazineFormData) => {
    console.log('폼 제출 시작:', data);
    
    try {
      // 로컬스토리지에서 기존 magazines 데이터 가져오기
      const existingMagazines = localStorage.getItem('magazines');
      let magazines: MagazineData[] = existingMagazines ? JSON.parse(existingMagazines) : [];

      console.log('기존 magazines:', magazines);

      // 새로운 ID 생성 (기존 최대 ID + 1)
      const maxId = magazines.length > 0 ? Math.max(...magazines.map(m => m.id)) : 0;
      const newId = maxId + 1;

      console.log('새로운 ID:', newId);

      // 새로운 매거진 데이터 생성
      const newMagazine: MagazineData = {
        id: newId,
        image: data.image,
        category: data.category,
        title: data.title,
        introduce: data.introduce,
        content: data.content,
        tag: data.tag,
        createdAt: new Date().toISOString(),
      };

      console.log('새로운 매거진 데이터:', newMagazine);

      // magazines 배열에 추가
      magazines.push(newMagazine);

      // 로컬스토리지 용량 체크 및 저장
      const magazinesString = JSON.stringify(magazines);
      console.log('저장할 데이터 크기:', magazinesString.length, 'bytes');
      
      try {
        localStorage.setItem('magazines', magazinesString);
        console.log('로컬스토리지에 저장 완료');
      } catch (storageError) {
        console.error('로컬스토리지 용량 초과:', storageError);
        
        // 오래된 데이터 삭제 (최신 5개만 유지)
        if (magazines.length > 5) {
          magazines = magazines.slice(-5);
          console.log('오래된 데이터 삭제, 최신 5개만 유지');
          localStorage.setItem('magazines', JSON.stringify(magazines));
          console.log('로컬스토리지에 저장 완료 (데이터 정리 후)');
        } else {
          throw storageError;
        }
      }

      // 등록 완료 모달 표시
      const successModal = (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{ color: 'green', fontSize: '48px', marginBottom: '16px' }}>✓</div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>등록 완료!</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>아티클이 성공적으로 등록되었습니다.</p>
            <button
              onClick={() => {
                console.log('모달 확인 버튼 클릭');
                closeModal();
                router.push(getMagazineDetailUrl(newId));
              }}
              style={{
                backgroundColor: '#3B82F6',
                color: 'white',
                padding: '8px 24px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              확인
            </button>
          </div>
        </div>
      );

      console.log('모달 표시 시도');
      console.log('openModal 함수:', openModal);
      openModal(successModal);
      console.log('모달 표시 완료');

    } catch (error) {
      console.error('매거진 등록 중 오류 발생:', error);
      alert('등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const goToList = () => {
    router.push(MAGAZINES_URL);
  };

  // 로컬스토리지 정리 함수
  const clearOldMagazines = () => {
    try {
      const magazinesData = localStorage.getItem('magazines');
      if (magazinesData) {
        const magazines: MagazineData[] = JSON.parse(magazinesData);
        // 최신 3개만 유지
        const recentMagazines = magazines.slice(-3);
        localStorage.setItem('magazines', JSON.stringify(recentMagazines));
        console.log('로컬스토리지 정리 완료, 최신 3개만 유지');
      }
    } catch (error) {
      console.error('로컬스토리지 정리 중 오류:', error);
    }
  };

  return {
    form,
    isFormValid,
    handleImageUpload,
    onSubmit,
    goToList,
    selectedImage,
    clearOldMagazines,
  };
};