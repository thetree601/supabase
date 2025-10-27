'use client';

import Image from 'next/image';
import styles from './styles.module.css';
import { useMagazineDetailBinding } from './hooks/index.binding.hook';

interface MagazinesDetailProps {
  id: string;
}

export default function MagazinesDetail({ id }: MagazinesDetailProps) {
  const { magazine, loading, error, goToList } = useMagazineDetailBinding(id);

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !magazine) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p style={{ color: 'red' }}>{error || '매거진을 찾을 수 없습니다.'}</p>
          <button onClick={goToList} style={{ marginTop: '20px', padding: '10px 20px' }}>
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 태그 파싱
  const parseTags = (tagString: string) => {
    return tagString.split(' ').filter(tag => tag.trim() !== '');
  };

  return (
    <div className={styles.container}>
      {/* Gap 1 */}
      <div className={styles.gap1}></div>

      {/* Go to List Button */}
      <div className={styles.goToListButton}>
        <button className={styles.listButton} onClick={goToList}>
          <Image src="/icons/goback.png" alt="뒤로가기" width={18} height={18} className={styles.backIcon} />
          목록으로
        </button>
      </div>

      {/* Gap 2 */}
      <div className={styles.gap2}></div>

      {/* Article Container */}
      <div className={styles.articleContainer}>
        {/* Detail Image */}
        <div className={styles.detailImage}>
          <Image 
            src={magazine.image} 
            alt={magazine.title} 
            width={852} 
            height={400} 
            className={styles.headerImage}
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* Detail Content */}
        <div className={styles.detailContent}>
          <div className={styles.dateText}>{formatDate(magazine.createdAt)}</div>
          
          <h1 className={styles.title}>{magazine.title}</h1>
          
          <div className={styles.subtitleContainer}>
            <p className={styles.subtitle}>{magazine.introduce}</p>
          </div>

          <div className={styles.contentText}>
            {magazine.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className={styles.tagsContainer}>
            {parseTags(magazine.tag).map((tag, index) => (
              <div key={index} className={styles.tag}>{tag}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Gap 3 */}
      <div className={styles.gap3}></div>

      {/* Go to List Button Bottom */}
      <div className={styles.goToListButtonBottom}>
        <button className={styles.listButtonBottom} onClick={goToList}>
          목록으로 돌아가기
        </button>
      </div>

      {/* Gap 4 */}
      <div className={styles.gap4}></div>
    </div>
  );
}
