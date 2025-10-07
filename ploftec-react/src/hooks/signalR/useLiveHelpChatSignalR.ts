import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';

interface LiveHelpChatSignalRProps {
  requestId: number;
  onMessageAdded?: (payload: any) => void;
  onChatRead?: (payload: any) => void;
}

export function useLiveHelpChatSignalR(props: LiveHelpChatSignalRProps | null): string | null {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const roomIdRef = useRef<number | null>(null);
  const [connId, setConnId] = useState<string | null>(null);

  const reqId = props?.requestId ?? 0;

  useEffect(() => {
    if (!props) return;
    if (connectionRef.current && roomIdRef.current === reqId) return;

    const cleanupPrev = async () => {
      if (connectionRef.current) {
        try {
          if (connectionRef.current.state === signalR.HubConnectionState.Connected) {
            // Intenta múltiples variantes de método de salida por compatibilidad
            try { await connectionRef.current.invoke('LeaveHelpRequestRoom', roomIdRef.current); } catch {}
            try { await connectionRef.current.invoke('LeaveRoom', roomIdRef.current); } catch {}
            try { await connectionRef.current.invoke('LeaveChatRoom', roomIdRef.current); } catch {}
          }
        } finally {
          await connectionRef.current.stop();
          connectionRef.current = null;
          roomIdRef.current = null;
          setConnId(null);
        }
      }
    };

    cleanupPrev().then(() => {
      const conn = new signalR.HubConnectionBuilder()
        .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/hubs/livehelp`, { withCredentials: true })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      connectionRef.current = conn;
      roomIdRef.current = reqId;

      // Eventos: soporta varios nombres posibles para compatibilidad
      const messageEvents = ['ChatMessageAdded', 'MessageAdded', 'MessageCreated', 'ReceiveMessage'];
      const readEvents = ['ChatRead', 'MessagesRead', 'ChatMarkedAsRead', 'Read'];

      messageEvents.forEach((evt) => conn.on(evt, (d) => { props?.onMessageAdded?.(d); }));
      readEvents.forEach((evt) => conn.on(evt, (d) => { props?.onChatRead?.(d); }));

      const tryJoin = async () => {
        try {
          await conn.start();
        } catch (err) {
          console.error('SignalR livehelp start error', err);
          // si no arranca, no seguimos
          return;
        }
        // Probar múltiples nombres de método para unirse a la sala
        const joinMethods = ['JoinHelpRequestRoom', 'JoinHelpRequest', 'JoinRoom', 'JoinChatRoom'];
        for (const m of joinMethods) {
          try {
            await conn.invoke(m, reqId);
            setConnId(conn.connectionId);
            return; // ok, unido
          } catch {}
        }
        console.warn('No se pudo invocar método de join en el hub (intentadas variantes).');
        setConnId(conn.connectionId ?? null);
      };

      tryJoin();
    });

    return () => { cleanupPrev(); };
  }, [reqId]);

  return connId;
}
