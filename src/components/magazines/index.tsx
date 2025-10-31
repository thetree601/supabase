"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';
import { useMagazinesBinding } from './hooks/index.binding.hook';

export default function Magazines() {
  const router = useRouter();
  const { magazines, loading, error, goToDetail } = useMagazinesBinding();
  
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
  
  const handleWriteClick = () => {
    router.push('/magazines/new');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.gap}></div>
        <div style={{ textAlign: 'center', padding: '50px' }}>로딩 중...</div>
        <div className={styles.gap}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.gap}></div>
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>{error}</div>
        <div className={styles.gap}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Gap: 1352 * 132 */}
      <div className={styles.gap}></div>
      
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>IT 매거진</h1>
            <p className={styles.subtitle}>최신 기술 트렌드와 인사이트를 전합니다</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.loginButton}>
              <Image src="/icons/login.png" alt="로그인" width={18} height={18} className={styles.buttonIcon} />
              로그인
            </button>
            <button className={styles.writeButton} onClick={handleWriteClick}>
              <Image src="/icons/write.png" alt="글쓰기" width={18} height={18} className={styles.buttonIcon} />
              글쓰기
            </button>
            <button className={styles.subscribeButton}>
              <Image src="/icons/subscribe.png" alt="구독하기" width={18} height={18} className={styles.buttonIcon} />
              구독하기
            </button>
          </div>
        </div>
      </div>
      
      {/* Gap: 1352 * 40 */}
      <div className={styles.gapSmall}></div>
      
      {/* Main: 1352 * 858 */}
      <div className={styles.main}>
        <div className={styles.magazinesGrid}>
          {magazines.map((magazine) => (
            <article key={magazine.id} className={styles.article} onClick={() => goToDetail(magazine.id)}>
              <div className={styles.articleImageContainer}>
                {magazine.category && (
                  <div
                    className={styles.categoryBadge}
                    style={{ backgroundColor: getCategoryBadgeBg(magazine.category) }}
                  >
                    {getCategoryDisplayLabel(magazine.category)}
                  </div>
                )}
                <Image 
                  src={magazine.image_url && magazine.image_url.trim().length > 0 ? magazine.image_url : "/icons/picture.png"}
                  alt={magazine.title}
                  width={323}
                  height={200}
                  className={styles.articleImage}
                />
              </div>
              <div className={styles.articleContent}>
                <h2 className={styles.articleTitle}>{magazine.title}</h2>
                <p className={styles.articleDescription}>{magazine.description}</p>
                <div className={styles.articleTags}>
                  {(magazine.tags ?? []).map((tag, index) => (
                    <span key={`${magazine.id}-tag-${index}`} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      
      {/* Gap: 1352 * 132 */}
      <div className={styles.gap}></div>
    </div>
  );
}
