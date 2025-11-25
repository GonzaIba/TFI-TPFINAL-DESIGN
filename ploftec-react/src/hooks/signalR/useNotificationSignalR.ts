// src/hooks/signalR/useNotificationSignalR.ts
import { useEffect, useRef, useState } from 'react';
import { NewNotificationEvent, RemoveNotificationEvent } from '@/lib/types/events';
import * as signalR from '@microsoft/signalr';

interface NotificationSignalRProps {
  userId?: string;
  onNewNotificationAdded: (d: NewNotificationEvent) => void;
  onNotificationRemoved: (d: RemoveNotificationEvent) => void;
}

export function useNotificationSignalR(props: NotificationSignalRProps | null): string | null {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const handlersRef = useRef<NotificationSignalRProps | null>(props);
  const [connId, setConnId] = useState<string | null>(null);

  handlersRef.current = props;

  useEffect(() => {
    let isActive = true;

    const cleanupPrev = async () => {
      const connection = connectionRef.current;
      if (!connection) return;

      try {
        await connection.stop();
      } catch {}
      finally {
        connectionRef.current = null;
        setConnId(null);
      }
    };

    if (!handlersRef.current) {
      // No debemos estar conectados → aseguramos cleanup.
      void cleanupPrev();
      return () => {
        isActive = false;
        void cleanupPrev();
      };
    }

    const startConnection = async () => {
      await cleanupPrev();
      if (!isActive) return;

      const conn = new signalR.HubConnectionBuilder()
        .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/hubs/notifications`, { withCredentials: true })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      connectionRef.current = conn;

      conn.on('newNotificationAdded', (d: NewNotificationEvent) => {
        handlersRef.current?.onNewNotificationAdded?.(d);
      });

      conn.on('notificationRemoved', (d: RemoveNotificationEvent) => {
        handlersRef.current?.onNotificationRemoved?.(d);
      });

      try {
        await conn.start();
        await conn.invoke('JoinNotificationRoom');
        if (!isActive) {
          await cleanupPrev();
          return;
        }
        setConnId(conn.connectionId ?? null);
      } catch (err) {
        console.error('❌ Notification hub negotiation error', err);
        await cleanupPrev();
      }
    };

    void startConnection();

    return () => {
      isActive = false;
      void cleanupPrev();
    };
  }, [Boolean(props)]);

  return connId;
}
