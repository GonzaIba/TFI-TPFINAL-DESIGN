import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import animationData from './robotIntro.json';
import rocketAnimation from './rocketAnimated.json';

export function RobotIntro({ onComplete }: { onComplete: () => void }) {
  const lottieRef = useRef(null);
  const [showBubble, setShowBubble] = useState(false);
  const [hideBubble, setHideBubble] = useState(false);
  const [startRobotExit, setStartRobotExit] = useState(false);

  const [showRocket, setShowRocket] = useState(true);
  const [showRobot, setShowRobot] = useState(false);
  const [chatStep, setChatStep] = useState<1 | 2>(1);

  const handleShowBubble = () => {
    const timer = setTimeout(() => {
      setShowBubble(true);
      new Audio('/sounds/robot-pop.mp3').play(); ///////////////////////////////////////////
    }, 2000)
    return clearTimeout(timer)
  }

  const handleAccept = () => {
    setHideBubble(true);

    if (chatStep === 1) {
      // Mostrar segundo mensaje
      setTimeout(() => {
        setChatStep(2);
        setHideBubble(false);
      }, 600);
    }

    if (chatStep === 2) {
      // Animación final
      setTimeout(() => {
        setStartRobotExit(true);
      }, 1500);
      setTimeout(() => {
        onComplete();
      }, 3000);
    }
  };

  return (
    <div style={styles.overlay}>
      {showRocket && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, x:-100 ,y: -100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <Lottie
            animationData={rocketAnimation}
            loop={false}
            onComplete={() => {
              setShowRocket(false);
              setTimeout(() => {
                setShowRobot(true);
                handleShowBubble();
                new Audio('/sounds/robot-pop.mp3').play();
                setTimeout(() => setShowBubble(true), 1000);
              }, 400); // una leve pausa después del aterrizaje
            }}
            style={{ width: 300, height: 300 }}
          />
        </motion.div>
      )}

      {showRobot && (
        <motion.div
          initial={{ scale: 1, x: 100, y: -100 }}
          animate={
          startRobotExit
            ? {
              scale: 0.18,
              x: window.innerWidth / 2 - 60,
              y: window.innerHeight / 2 - 60,
            }
            : { scale: 0.5, x: -100, y: 0 }
          }
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          style={styles.robotContainer}
        >
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop={true}
            style={styles.animation}
          />

          <AnimatePresence>
            {!hideBubble && showBubble && (
              <motion.div
                className="speech-bubble"
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -60, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                style={styles.bubble}
              >
                <p style={{ color: 'black' }}>
                  {chatStep === 1
                  ? '¡Hola! Soy el robot Ploftec, un placer conocerte!'
                  : 'Estaré aquí para ayudarte con lo que necesites!'}
                </p>
                <button onClick={handleAccept} style={styles.button}>
                  Aceptar
                </button>
                <div style={styles.triangle}></div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}




const styles = {
  overlay: {
    position: 'fixed' as 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotContainer: {
    position: 'relative' as 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: 300,
    height: 300,
  },
  bubble: {
    position: 'absolute' as 'absolute',
    left: '100%',
    top: '25%',
    marginLeft: 24,
    backgroundColor: '#fff',
    padding: '20px 24px',
    borderRadius: 12,
    textAlign: 'left' as 'left',
    boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
    width: 600,
    minWidth: 260,
    fontSize: '32px',
    lineHeight: 1.5,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
    willChange: 'transform, opacity',
  },
  triangle: {
    content: '""',
    position: 'absolute' as 'absolute',
    left: -12,
    top: '30%',
    width: 0,
    height: 0,
    borderTop: '10px solid transparent',
    borderBottom: '10px solid transparent',
    borderRight: '12px solid white',
  },
  button: {
    alignSelf: 'flex-end',
    padding: '10px 18px',
    borderRadius: 6,
    border: 'none',
    backgroundColor: '#3f51b5',
    color: '#fff',
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: '24px',
  },
};
