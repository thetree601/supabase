'use client';

import Image from 'next/image';
import styles from './styles.module.css';
import { useMagazineDetailBinding } from './hooks/index.binding.hook';

interface MagazinesDetailProps {
  id: string;
}

export default function MagazinesDetail({ id }: MagazinesDetailProps) {
  const { magazine, loading, error, goToList } = useMagazineDetailBinding(id);

  const getCategoryBadgeBg = (category: string): string => {
    const key = (category || '').trim().toLowerCase();
    const synonymToId: Record<string, 'frontend' | 'backend' | 'mobile' | 'devops' | 'aiml' | 'other'> = {
      // 프론트엔드
      '프론트엔드': 'frontend',
      'frontend': 'frontend',
      // 백엔드
      '백엔드': 'backend',
      'backend': 'backend',
      // 모바일
      '모바일': 'mobile',
      'mobile': 'mobile',
      // 데브옵스
      '데브옵스': 'devops',
      'devops': 'devops',
      // 인공지능/머신러닝
      '인공지능': 'aiml',
      '머신러닝': 'aiml',
      'ai': 'aiml',
      'ai/ml': 'aiml',
      'aiml': 'aiml',
    };
    const id = synonymToId[key] ?? 'other';
    switch (id) {
      case 'frontend':
        return 'rgba(59, 130, 246, 0.9)'; // #3b82f6
      case 'backend':
        return 'rgba(34, 197, 94, 0.9)'; // #22c55e
      case 'mobile':
        return 'rgba(236, 72, 153, 0.9)'; // #ec4899
      case 'devops':
        return 'rgba(99, 102, 241, 0.9)'; // #6366f1
      case 'aiml':
        return 'rgba(139, 92, 246, 0.9)'; // #8b5cf6
      default:
        return 'rgba(17, 24, 39, 0.85)';
    }
  };

  const getCategoryDisplayLabel = (category: string): string => {
    const original = (category || '').trim();
    const key = original.toLowerCase();
    const enToKo: Record<string, string> = {
      frontend: '프론트엔드',
      backend: '백엔드',
      mobile: '모바일',
      devops: '데브옵스',
      aiml: '인공지능',
    };
    return enToKo[key] ?? original;
  };

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
          {magazine.category && (
            <div
              className={styles.categoryBadge}
              style={{ backgroundColor: getCategoryBadgeBg(magazine.category) }}
            >
              {getCategoryDisplayLabel(magazine.category)}
            </div>
          )}
          <Image 
            src={magazine.image} 
            alt={magazine.title} 
            width={852} 
            height={400} 
            className={styles.headerImage}
            style={{ objectFit: 'cover' }}
            unoptimized
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
