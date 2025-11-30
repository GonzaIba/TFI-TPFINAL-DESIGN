import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import animationData from './robotIntro.json';
import rocketAnimation from './rocketAnimated.json';
import { useWindowWidth } from '@/hooks';

export function RobotIntro({ onComplete }: { onComplete: () => void }) {
  const lottieRef = useRef(null);
  const [showBubble, setShowBubble] = useState(false);
  const [hideBubble, setHideBubble] = useState(false);
  const [startRobotExit, setStartRobotExit] = useState(false);

  const [showRocket, setShowRocket] = useState(true);
  const [showRobot, setShowRobot] = useState(false);
  const [chatStep, setChatStep] = useState<1 | 2>(1);

  const viewportWidth = useWindowWidth();
  const isMobile = viewportWidth > 0 && viewportWidth < 720;

  const handleShowBubble = () => {
    setTimeout(() => {
      setShowBubble(true);
      new Audio('/sounds/robot-pop.mp3').play();
    }, 2000);
  };

  const handleAccept = () => {
    setHideBubble(true);

    if (chatStep === 1) {
      setTimeout(() => {
        setChatStep(2);
        setHideBubble(false);
      }, 600);
    } else {
      setTimeout(() => {
        setStartRobotExit(true);
      }, 1500);
      setTimeout(() => {
        onComplete();
      }, 3000);
    }
  };

  const bubbleStyle = {
    ...styles.bubble,
    ...(isMobile
      ? {
          left: '50%',
          top: '112%',
          marginLeft: 0,
          transform: 'translateX(-50%)',
          width: 'min(92vw, 380px)',
          minWidth: '0',
          fontSize: '19.5px',
          lineHeight: 1.6,
          padding: '18px 22px',
          textAlign: 'center' as const,
          alignItems: 'center',
          gap: 12,
        }
      : {}),
  };

  const triangleStyle = {
    ...styles.triangle,
    ...(isMobile
      ? {
          left: '50%',
          top: -12,
          transform: 'translateX(-50%)',
          borderTop: '0 solid transparent',
          borderBottom: '12px solid white',
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
        }
      : {}),
  };

  const buttonStyle = {
    ...styles.button,
    ...(isMobile
      ? {
          alignSelf: 'center',
          width: '100%',
          fontSize: '19px',
          padding: '14px 21px',
        }
      : {}),
  };

  const robotAnimationStyle = isMobile
    ? { width: 250, height: 250 }
    : styles.animation;

  const rocketSize = isMobile ? { width: 260, height: 260 } : { width: 300, height: 300 };
  const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 - 60 : 0;
  const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 - 60 : 0;

  return (
    <div style={styles.overlay}>
      {showRocket && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, x: -100, y: -100 }}
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
              }, 400);
            }}
            style={rocketSize}
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
                  x: centerX,
                  y: centerY,
                }
              : { scale: isMobile ? 0.52 : 0.5, x: isMobile ? -32 : -100, y: isMobile ? 12 : 0 }
          }
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          style={styles.robotContainer}
        >
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop
            style={robotAnimationStyle}
          />

          <AnimatePresence>
            {!hideBubble && showBubble && (
              <motion.div
                className="speech-bubble"
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -60, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                style={bubbleStyle}
              >
                <p style={{ color: 'black', margin: 0 }}>
                  {chatStep === 1
                    ? '\u00a1Hola! Soy el robot Ploftec, un placer conocerte!'
                    : 'Estar\u00e9 aqu\u00ed para ayudarte con lo que necesites!'}
                </p>
                <button onClick={handleAccept} style={buttonStyle}>
                  Aceptar
                </button>
                <div style={triangleStyle}></div>
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
    position: 'fixed' as const,
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
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: 320,
    height: 320,
  },
  bubble: {
    position: 'absolute' as const,
    left: '100%',
    top: '25%',
    marginLeft: 24,
    backgroundColor: '#fff',
    padding: '24px 30px',
    borderRadius: 12,
    textAlign: 'left' as const,
    boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
    width: 480,
    maxWidth: 620,
    minWidth: 260,
    fontSize: '24px',
    lineHeight: 1.64,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 14,
    willChange: 'transform, opacity',
  },
  triangle: {
    content: '""',
    position: 'absolute' as const,
    left: -12,
    top: '30%',
    width: 0,
    height: 0,
    borderTop: '10px solid transparent',
    borderBottom: '10px solid transparent',
    borderRight: '12px solid white',
  },
  button: {
    alignSelf: 'flex-end' as const,
    padding: '13px 22px',
    borderRadius: 6,
    border: 'none',
    backgroundColor: '#3f51b5',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '19px',
    boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
  },
};
