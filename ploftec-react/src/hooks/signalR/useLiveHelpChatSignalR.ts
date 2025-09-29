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
            try { await connectionRef.current.invoke('LeaveHelpRequestRoom', roomIdRef.current); } catch {}
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

      // Eventos estimados: ajustar a los nombres reales del Hub
      conn.on('ChatMessageAdded', (d) => { props?.onMessageAdded?.(d); });
      conn.on('ChatRead', (d) => { props?.onChatRead?.(d); });

      conn.start()
        .then(() => conn.invoke('JoinHelpRequestRoom', reqId))
        .then(() => setConnId(conn.connectionId))
        .catch(err => console.error('SignalR livehelp negotiation error', err));
    });

    return () => { cleanupPrev(); };
  }, [reqId]);

  return connId;
}

