import { useEffect } from 'react';
import styles from '../styles/ImagePreview.module.css';

export default function ImagePreview({ image, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <img 
          src={image} 
          alt="预览图片" 
          className={styles.previewImage}
          onError={(e) => {
            if (!e.target.src.includes('placeholder.jpg')) {
              e.target.src = '/images/placeholder.jpg';
            }
          }}
        />
      </div>
    </div>
  );
} 