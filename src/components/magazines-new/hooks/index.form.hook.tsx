"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { MAGAZINES_URL } from '@/commons/constants/url';
import { useMagazineSubmit } from '@/app/magazines/new/hooks/index.submit.hook';

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


export const useMagazineForm = () => {
  const router = useRouter();
  const { submit } = useMagazineSubmit();

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
    console.log('폼 제출 데이터:', data);
    void submit(data);
  };

  const goToList = () => {
    router.push(MAGAZINES_URL);
  };


  return {
    form,
    isFormValid,
    handleImageUpload,
    onSubmit,
    goToList,
    selectedImage,
  };
};