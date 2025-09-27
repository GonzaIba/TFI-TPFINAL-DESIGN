"use client";

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components';

export default function HelpDetailPanel() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const qs = sp.toString();
  const base = `/forum/liveHelp${qs ? `?${qs}` : ''}`;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.25 }}
        style={{
          position: 'fixed', right: 0, top: 80, height: 'calc(100dvh - 80px)', width: 'min(520px, 95vw)',
          background: '#0b0b0b', borderLeft: '1px solid rgba(255,255,255,0.08)',
          color: '#e5e5e5', zIndex: 45, boxShadow: '0 0 40px rgba(0,0,0,0.5)'
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Detalle #{id}</h3>
          <Button
            onClick={() => router.push(base)}
            transparent
            ariaLabel="Cerrar detalle"
            title="Cerrar"
            width="72px"
            height="32px"
            borderRadius="8px"
            text="Cerrar"
          />
        </header>

        <div style={{ padding: 16, overflowY: 'auto', height: 'calc(100% - 56px)', fontSize: 14 }}>
          <div style={{ color: '#cfcfcf' }}>
            (Detalle de la solicitud {id} aquí)
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
