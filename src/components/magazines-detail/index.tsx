'use client';

import styles from './styles.module.css';

interface MagazinesDetailProps {
  id: string;
}

export default function MagazinesDetail({ id }: MagazinesDetailProps) {
  return (
    <div className={styles.container}>
      {/* Gap 1 */}
      <div className={styles.gap1}></div>

      {/* Go to List Button */}
      <div className={styles.goToListButton}>
        <button className={styles.listButton}>
          ← 목록으로
        </button>
      </div>

      {/* Gap 2 */}
      <div className={styles.gap2}></div>

      {/* Detail Image */}
      <div className={styles.detailImage}>
        <div className={styles.imagePlaceholder}>
          이미지 영역
        </div>
      </div>

      {/* Detail Content */}
      <div className={styles.detailContent}>
        <div className={styles.contentPlaceholder}>
          <h2>여행 포스트 제목</h2>
          <p>여행 포스트 상세 내용이 여기에 표시됩니다.</p>
          <p>포스트 ID: {id}</p>
        </div>
      </div>

      {/* Gap 3 */}
      <div className={styles.gap3}></div>

      {/* Go to List Button */}
      <div className={styles.goToListButtonBottom}>
        <button className={styles.listButton}>
          ← 목록으로
        </button>
      </div>

      {/* Gap 4 */}
      <div className={styles.gap4}></div>
    </div>
  );
}
