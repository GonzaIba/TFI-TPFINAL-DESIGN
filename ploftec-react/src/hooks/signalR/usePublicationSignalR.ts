// src/hooks/usePublicationSignalR.ts
import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';

interface PublicationSignalRProps {
  publicationId: number;
  onVotePublicationChanged: (newVotes: number) => void;
  onVoteAnswerChanged: (answerId: number, newVotes: number) => void;
  onCommentAdded: (newComment: any) => void;
  onCommentDeleted: (commentDeleted: any) => void;
  onCommentEdited: (payload: any) => void;
}

export function usePublicationSignalR(
  props: PublicationSignalRProps | null
): string | null {
  const connectionRef   = useRef<signalR.HubConnection | null>(null);
  const roomIdRef       = useRef<number | null>(null);
  const [connId, setConnId] = useState<string | null>(null);

  const pubId = props?.publicationId ?? 0;

  useEffect(() => {
    if (!props) return;

    if (connectionRef.current && roomIdRef.current === pubId) return;

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
        .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/hubs/publications`, { withCredentials: false })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      connectionRef.current = conn;
      roomIdRef.current = pubId;

      conn.on('VotePublicationChanged', d => {
        if (d.connectionId === conn.connectionId) return;  // ya la actualicé localmente
        if (d.codePublication === pubId) props.onVotePublicationChanged(d.newVoteCount)
      });
      conn.on('VoteAnswerChanged', d => {
        if (d.connectionId === conn.connectionId) return;  // ya la actualicé localmente
        if (d.codePublication === pubId) props.onVoteAnswerChanged(d.answerId, d.newVoteCount);
      });      
      conn.on('AnswerAdded', d => {
        if (d.connectionId === conn.connectionId) return;  // ya la actualicé localmente
        if (d.codePublication === pubId) props.onCommentAdded(d)
      });
      conn.on('AnswerDeleted', d => {
        if (d.connectionId === conn.connectionId) return;  // ya la actualicé localmente
        if (d.codePublication === pubId) props.onCommentDeleted(d.codeAnswer)
      });
      conn.on('AnswerEdited', d => {
        if (d.connectionId === conn.connectionId) return;  // ya la actualicé localmente
        if (d.codePublication === pubId) props.onCommentEdited(d)
      });

      conn.start()
        .then(() => conn.invoke('JoinPublicationRoom', pubId))
        .then(() => setConnId(conn.connectionId))        //  🆕  ← aquí tenés el id
        .catch(err => console.error('❌ Negotiation error', err));
    });

    return () => { cleanupPrev(); };

    // const connection = new signalR.HubConnectionBuilder()
    //   .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/hubs/publications`, {
    //     withCredentials: true,
    //   })
    //   .withAutomaticReconnect({
    //     nextRetryDelayInMilliseconds: (retryContext) => {
    //       if (retryContext.previousRetryCount === 0) {
    //         return 0;
    //       }
    //       return Math.min(10000, retryContext.previousRetryCount * 2000);
    //     },
    //   })
    //   .configureLogging(signalR.LogLevel.Information)
    //   .build();

    // connectionRef.current = connection;

    // connection.on('VotePublicationChanged', (data) => {
    //   console.log('🎯 VotePublicationChanged recibido:', data);
    //   if (data.publicationId === publicationId) {
    //     onVotePublicationChanged(data.newVoteCount);
    //   }
    // });

    // connection.on('VoteAnswerChanged', (data) => {
    //   console.log('🎯 VoteAnswerChanged recibido:', data);
    //   if (data.publicationId === publicationId) {
    //     onVoteAnswerChanged(data.answerId, data.newVoteCount);
    //   }
    // });

    // connection.on('AnswerAdded', (data) => {
    //   if (data.publicationId === publicationId) {
    //     onCommentAdded(data);
    //   }
    // });

    // connection.onclose((err) => {
    //   console.log('❌ Cierre de SignalR. Error:', err?.message ?? 'cerrado manual');
    // });

    // connection.onreconnecting(() => {
    //   console.log('🔄 SignalR reconectando...');
    // });

    // connection.onreconnected(() => {
    //   console.log('✅ SignalR reconectado');
    // });

    // connection
    //   .start()
    //   .then(() => {
    //     if (!isCancelled) {
    //       console.log('✅ SignalR conectado');
    //       return connection.invoke('JoinPublicationRoom', publicationId);
    //     }
    //   })
    //   .then(() => {
    //     console.log('📌 JoinPublicationRoom invocado para publicación', publicationId);
    //   })
    //   .catch((err) => {
    //     if (!isCancelled) {
    //       console.error('💥 Error al conectar con SignalR', err);
    //     }
    //   });

    // return () => {
    //   isCancelled = true;
    //   if (!connectionRef.current) return;

    //   const stopConnection = async () => {
    //     try {
    //       if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
    //         console.log('↩️ Abandonando grupo...');
    //         await connectionRef.current.invoke('LeavePublicationRoom', publicationId);
    //       }
    //     } catch (e) {
    //       console.warn('⚠️ No se pudo hacer LeavePublicationRoom:', e);
    //     } finally {
    //       await connectionRef.current?.stop();
    //       connectionRef.current = null;
    //     }
    //   };
    //   stopConnection();
    // };
  }, [pubId]);

  return connId;
}
