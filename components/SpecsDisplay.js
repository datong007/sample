import styles from '../styles/SpecsDisplay.module.css';

export default function SpecsDisplay({ specs }) {
  if (!specs) return null;
  
  return (
    <div className={styles.specs}>
      {/* 渲染主要规格 */}
      {['材料', '尺寸', '克重'].map(key => {
        const value = specs[key];
        if (!value) return null;
        
        return (
          <span key={key} className={`${styles.spec} ${styles[key]}`}>
            <span className={styles.specLabel}>{key}:</span>
            <span className={styles.specValue}>{value}</span>
          </span>
        );
      })}
      
      {/* 渲染其他规格 */}
      {Object.entries(specs)
        .filter(([key]) => !['材料', '尺寸', '克重'].includes(key))
        .map(([key, value]) => (
          <span key={key} className={styles.spec}>
            <span className={styles.specLabel}>{key}:</span>
            <span className={styles.specValue}>{value}</span>
          </span>
        ))}
    </div>
  );
} 