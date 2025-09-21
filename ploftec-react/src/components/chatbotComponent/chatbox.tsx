'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mcpChatService } from '@/lib/services/mcp/mcpChatService';
import { RobotAnimated } from './robotIcon/robotIcon';
import useAuthStore from "@/store/slices/authStore/authStore";
import styles from './chatbot.module.css';
import { Button, Input } from '@/components';
import { Minus } from 'lucide-react';

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
  const bodyRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    // Auto-scroll al final cuando llegan nuevos mensajes
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

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
            <div className={styles.chatHeader}>
              Asistente Virtual
              <div className={styles.minimizeBtn}>
                <Button
                  onClick={() => setOpen(false)}
                  icon={<Minus size={16} />}
                  transparent
                  backgroundColor="#f0f0f0"
                  width="28px"
                  height="28px"
                  borderRadius="6px"
                  ariaLabel="Minimizar"
                  title="Minimizar"
                />
              </div>
            </div>
            <div ref={bodyRef} className={styles.chatBody}>
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
              <div className={styles.inputWrapper}>
                <Input
                  value={input}
                  onInput={(e) => setInput((e.target as HTMLInputElement).value)}
                  submitFunction={handleSend}
                  placeHolder="Escribe un mensaje..."
                  useSearch={false}
                  showIcon={false}
                  useClear={true}
                  widthContainer="100%"
                  customStyle={{ height: '42px', fontSize: '14px', backgroundColor: '#333', color: '#fff' }}
                />
              </div>
              <Button
                onClick={handleSend}
                text={isThinking ? 'Enviando...' : 'Enviar'}
                disabled={isThinking || !input.trim()}
                width="110px"
                height="42px"
              />
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
