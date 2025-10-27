import styles from './styles.module.css';

export default function MagazinesNew() {
  return (
    <div className={styles.wrapper}>
      {/* Gap: full * 132 */}
      <div className={styles.gap}></div>
      
      {/* go-to-list-button: full * 24 */}
      <div className={styles.goToListButton}>
        <button>Go to List</button>
      </div>
      
      {/* Gap: full * 32 */}
      <div className={styles.gapMedium}></div>
      
      {/* new post: full * 56 */}
      <div className={styles.newPost}>
        <h1>New Post</h1>
      </div>
      
      {/* Gap: full * 40 */}
      <div className={styles.gapSmall}></div>
      
      {/* content: full * 1244 */}
      <div className={styles.content}>
        {/* Main content area */}
      </div>
      
      {/* Gap: full * 132 */}
      <div className={styles.gap}></div>
    </div>
  );
}
