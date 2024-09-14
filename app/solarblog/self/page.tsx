import dynamic from 'next/dynamic';
import styles from './styles.module.scss'
const Deck = dynamic(() => import('./test'), {
  ssr: false, // 禁用服务器端渲染
});

export default function App() {
  return (
    <div className={`flex fill center ${styles.container}`}>
      <Deck />
    </div>
  );
}