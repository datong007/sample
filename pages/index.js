import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react'

const welcomeMessages = [
  { text: '欢迎来到样品采购平台', lang: 'zh' },
  { text: 'Welcome to Sample Procurement Platform', lang: 'en' },
  { text: 'サンプル調達プラットフォームへようこそ', lang: 'ja' },
  { text: '샘플 구매 플랫폼에 오신 것을 환영합니다', lang: 'ko' },
  { text: 'Добро пожаловать на платформу закупки образцов', lang: 'ru' },
  { text: 'Witamy na platformie zakupu próbek', lang: 'pl' },
  { text: 'Bienvenue sur la plateforme d\'achat d\'échantillons', lang: 'fr' },
  { text: 'Willkommen auf der Musterbeschaffungsplattform', lang: 'de' },
  { text: 'Bienvenido a la plataforma de adquisición de muestras', lang: 'es' },
  { text: 'ยินดีต้อนรับสู่แพลตฟอร์มการจัดซื้อตัวอย่าง', lang: 'th' },
  { text: 'Selamat datang ke platform perolehan sampel', lang: 'ms' }
];

export default function Home() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsChanging(true);
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % welcomeMessages.length);
        setIsChanging(false);
      }, 500); // 淡出动画持续时间
    }, 3000); // 每3秒切换一次

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cards = document.querySelectorAll(`.${styles.card}`);
    
    const handleMouseMove = (e, card) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--x', `${x}%`);
      card.style.setProperty('--y', `${y}%`);
    };

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => handleMouseMove(e, card));
    });

    return () => {
      cards.forEach(card => {
        card.removeEventListener('mousemove', handleMouseMove);
      });
    };
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>样品采购网站</title>
        <meta name="description" content="样品采购平台" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={`${styles.title} ${isChanging ? styles.titleFading : ''}`}>
          {welcomeMessages[currentMessageIndex].text}
        </h1>

        <div className={styles.grid}>
          <Link href="/products" className={styles.card}>
            <h2>浏览样品 &rarr;</h2>
            <p>查看所有可用的样品</p>
          </Link>

          <Link href="/sample-list" className={styles.card}>
            <h2>我的样品单 &rarr;</h2>
            <p>查看已选择的样品</p>
          </Link>
        </div>
      </main>
    </div>
  )
} 