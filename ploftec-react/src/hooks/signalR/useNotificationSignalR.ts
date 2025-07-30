// src/hooks/usePublicationSignalR.ts
import { useEffect, useRef, useState } from 'react';
import { NewNotificationEvent, RemoveNotificationEvent } from '@/lib/types/events';
import * as signalR from '@microsoft/signalr';

interface NotificationSignalRProps {
  userId?: string;
  onNewNotificationAdded: (d: NewNotificationEvent) => void;
  onNotificationRemoved: (d: RemoveNotificationEvent) => void;
}

export function useNotificationSignalR(props: NotificationSignalRProps | null): string | null {
  const connectionRef   = useRef<signalR.HubConnection | null>(null);
  const roomIdRef       = useRef<string | null>(null);
  const [connId, setConnId] = useState<string | null>(null);

  useEffect(() => {
    //if (!props) return;

    if (connectionRef.current) return;

    const cleanupPrev = async () => {
      if (connectionRef.current) {
        try {
          if (connectionRef.current.state === signalR.HubConnectionState.Connected) {
            await connectionRef.current.invoke('LeavePublicationRoom', roomIdRef.current);
          }
        } finally {
          await connectionRef.current.stop();
          connectionRef.current = null;
          roomIdRef.current     = null;
          setConnId(null);
        }
      }
    };

    cleanupPrev().then(() => {
      const conn = new signalR.HubConnectionBuilder()
        .withUrl('https://localhost:44352/hubs/notifications', { withCredentials: true })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      connectionRef.current = conn;

      conn.on('newNotificationAdded', d => {
        props?.onNewNotificationAdded(d)
      });

      conn.on('notificationRemoved', d => {
        props?.onNotificationRemoved(d)
      });

      conn.start()
        .then(() => conn.invoke('JoinNotificationRoom'))
        .then(() => setConnId(conn.connectionId))        //  🆕  ← aquí tenés el id
        .catch(err => console.error('❌ Negotiation error', err));
    });

    return () => { cleanupPrev(); };
  }, []);

  return connId;
}
