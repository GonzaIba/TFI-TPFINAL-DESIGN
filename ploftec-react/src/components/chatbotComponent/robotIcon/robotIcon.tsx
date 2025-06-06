// components/RobotWaveIcon.tsx
import { useRef } from 'react';
import Lottie from 'lottie-react';
import animationData from './robotIcon.json'; // Asegúrate de colocar el archivo JSON en la ruta correcta
import robotImage from './robotImage.png';

export function RobotAnimated({ showImage }: { showImage: boolean }) {
  return (
    <div style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {showImage && (
        <img
          src={robotImage.src}
          alt="Robot"
          style={{
            width: '100%', // usa el ancho máximo permitido
            height: 'auto', // mantiene proporción
            //objectFit: 'contain'
            paddingTop: 10
          }}
        />
      )}
    </div>
  );
}
