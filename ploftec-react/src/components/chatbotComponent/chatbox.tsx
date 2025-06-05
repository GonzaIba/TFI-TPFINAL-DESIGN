'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './chatbot.module.css';
import { SmartToy } from '@mui/icons-material';
import { mcpChatService } from '@/lib/services/mcp/mcpChatService';

type ChatMessage = { from: 'user' | 'bot'; content: string };

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: 'bot', content: '👋 Hola, ¿en qué puedo ayudarte?' }
  ]);
  const [input, setInput] = useState('');
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

    console.log(userMessage);
    const respuesta = await mcpChatService.sendMessage(userMessage.content);

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
        <SmartToy />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.chatWindow}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
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
