'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mcpChatService } from '@/lib/services/mcp/mcpChatService';
import { RobotAnimated } from './robotIcon/robotIcon';
import { useAuthStore } from "@/store/slices/authStore/authStore";
import styles from './chatbot.module.css';

type ChatMessage = { from: 'user' | 'bot'; content: string };

export function Chatbot({ showRobot }: { showRobot: boolean }) {
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: 'bot', content: `👋 Hola${user !== null ? " "+user.userName : ""}, ¿en qué puedo ayudarte?` }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { from: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    const respuesta = await mcpChatService.sendMessage(userMessage.content);
    setIsThinking(false);

    setMessages(prev => [
      ...prev,
      { from: 'bot', content: respuesta ?? "No se obtuvo respuesta del servidor." }
    ]);
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className={styles.chatbotContainer} ref={containerRef}>
      <motion.button
        className={styles.robotButton}
        onClick={() => setOpen(prev => !prev)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <RobotAnimated showImage={showRobot}></RobotAnimated>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.chatWindow}
            initial={{ opacity: 0, y: 100, scale: 0.3, rotate: -10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: 100, scale: 0.3, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <div className={styles.chatHeader}>Asistente Virtual</div>
            <div className={styles.chatBody}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`${styles.message} ${msg.from === 'user' ? styles.user : styles.bot}`}
                >
                  {msg.content}
                </div>
              ))}
              {isThinking && (
                <div className={`${styles.message} ${styles.bot}`}>
                  <TypingDots />
                </div>
              )}
            </div>
            <div className={styles.chatInputArea}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
              />
              <button onClick={handleSend}>Enviar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


export function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
      <style jsx>{`
        .dot {
          width: 6px;
          height: 6px;
          background-color: #ccc;
          border-radius: 50%;
          animation: blink 1.4s infinite both;
        }
        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
