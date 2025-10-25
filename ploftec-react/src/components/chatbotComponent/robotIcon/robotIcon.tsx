// components/RobotWaveIcon.tsx
import robotImage from './robotImage.png';
import styles from './robotIcon.module.css';

type RobotAnimatedProps = {
  showImage: boolean;
  size?: number;
  animated?: boolean;
};

export function RobotAnimated({ showImage, size = 80, animated = false }: RobotAnimatedProps) {
  if (!showImage) return null;

  return (
    <div
      className={styles.wrapper}
      style={{
        width: size,
        height: size,
      }}
    >
      <img
        src={robotImage.src}
        alt="Robot"
        className={`${styles.image} ${animated ? styles.animated : ''}`}
      />
    </div>
  );
}
