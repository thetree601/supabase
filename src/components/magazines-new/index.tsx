"use client";

import styles from './styles.module.css';
import { useMagazineForm } from './hooks/index.form.hook';

export default function MagazinesNew() {
  const { form, isFormValid, handleImageUpload, onSubmit, goToList, selectedImage } = useMagazineForm();
  const { register, handleSubmit, formState: { errors } } = form;

  const handleFormSubmit = (data: { image: string; category: string; title: string; introduce: string; content: string; tag: string }) => {
    console.log('폼 제출 핸들러 호출됨:', data);
    onSubmit(data);
  };

  console.log('컴포넌트 렌더링:', { isFormValid, errors });

  return (
    <div className={styles.wrapper}>
      {/* Gap: full * 132 */}
      <div className={styles.gap}></div>
      
      {/* go-to-list-button: full * 24 */}
      <div className={styles.goToListButton}>
        <button className={styles.backButton} onClick={goToList}>
          <img src="/icons/goback.png" alt="뒤로가기" className={styles.backIcon} />
          목록으로
        </button>
      </div>
      
      {/* Gap: full * 32 */}
      <div className={styles.gapMedium}></div>
      
      {/* new post: full * 56 */}
      <div className={styles.newPost}>
        <h1 className={styles.title}>새 아티클 등록</h1>
        <p className={styles.subtitle}>IT 매거진에 새로운 기술 아티클을 등록합니다</p>
      </div>
      
      {/* Gap: full * 40 */}
      <div className={styles.gapSmall}></div>
      
      {/* content: full * 1244 */}
      <div className={styles.content}>
        <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
          {/* 이미지 파일 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>이미지 파일</label>
            <div className={styles.imageUpload}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload" className={styles.imageUploadContent}>
                {selectedImage ? (
                  <div style={{ textAlign: 'center' }}>
                    <img 
                      src={selectedImage} 
                      alt="선택된 이미지" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px', 
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginBottom: '10px'
                      }} 
                    />
                    <p className={styles.uploadText}>이미지 변경하기</p>
                  </div>
                ) : (
                  <>
                    <img src="/icons/picture.png" alt="이미지 업로드" className={styles.uploadIcon} />
                    <p className={styles.uploadText}>클릭하여 이미지 선택</p>
                    <p className={styles.uploadSubtext}>또는 드래그 앤 드롭</p>
                    <p className={styles.uploadFormat}>JPG, PNG, GIF (최대 10MB)</p>
                  </>
                )}
              </label>
            </div>
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
          </div>

          {/* 카테고리 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              카테고리 <span className={styles.required}>*</span>
            </label>
            <div className={styles.selectContainer}>
              <select className={styles.select} {...register('category')}>
                <option value="">카테고리를 선택해주세요</option>
                <option value="frontend">프론트엔드</option>
                <option value="backend">백엔드</option>
                <option value="mobile">모바일</option>
                <option value="devops">DevOps</option>
                <option value="ai">AI/ML</option>
              </select>
              <svg className={styles.selectIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
          </div>

          {/* 제목 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>제목</label>
            <input 
              type="text" 
              className={styles.input}
              placeholder="예: 2025년 AI 트렌드: 생성형 AI의 진화"
              {...register('title')}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {/* 한줄 소개 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>한줄 소개</label>
            <input 
              type="text" 
              className={styles.input}
              placeholder="아티클을 간단히 소개해주세요 (1-2문장)"
              {...register('introduce')}
            />
            {errors.introduce && <p className="text-red-500 text-sm mt-1">{errors.introduce.message}</p>}
          </div>

          {/* 상세 내용 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>상세 내용</label>
            <textarea 
              className={styles.textarea}
              placeholder="아티클의 상세 내용을 작성해주세요..."
              rows={10}
              {...register('content')}
            />
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
          </div>

          {/* 태그 */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>태그</label>
            <input 
              type="text" 
              className={styles.input}
              placeholder="#React #TypeScript #JavaScript"
              {...register('tag')}
            />
            <p className={styles.tagHelp}>공백으로 구분하여 입력해주세요 (예: #React #Node.js #WebDev)</p>
            {errors.tag && <p className="text-red-500 text-sm mt-1">{errors.tag.message}</p>}
          </div>

          {/* 등록 버튼 */}
          <button 
            type="submit" 
            className={`${styles.submitButton} ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!isFormValid}
            onClick={() => console.log('등록 버튼 클릭됨, isFormValid:', isFormValid)}
          >
            아티클 등록하기
          </button>
        </form>
      </div>
      
      {/* Gap: full * 132 */}
      <div className={styles.gap}></div>
    </div>
  );
}
