/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRoomStore } from './store/useRoomStore';

interface WSContextValue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send: (msg: any) => void;
  ready: boolean;
}

export const WSContext = createContext<WSContextValue | null>(null);

/**
 * Custom hook to access WebSocket context.
 * Throws an error if used outside of WebSocketProvider.
 */
export const useWebSocket = () => {
  const context = useContext(WSContext);
  if (!context) {
    throw new Error('WS context missing. Wrap your component tree with <WebSocketProvider>');
  }
  return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const roomId = useRoomStore((s) => s.roomId);
  const setParticipants = useRoomStore((s) => s.setParticipants);
  const self = useRoomStore((s) => s.self);

  const [ready, setReady] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // open/close on roomId change
  useEffect(() => {
    if (!roomId) return;
    const ws = new WebSocket(`ws://localhost:8080/${roomId}`);
    wsRef.current = ws;
    ws.onopen = () => {
      setReady(true);
      if (self && roomId) {
        ws.send(JSON.stringify({ type: 'join', user: self }));
      }
    };
    ws.onmessage = (e) => {
      const { type, payload } = JSON.parse(e.data);
      if (type === 'state') {
        setParticipants(payload.participants);
      }
    };
    ws.onclose = (e) => {
      console.log('🔴 WebSocket is closed', e.code, e.reason);
      setReady(false);
    };

    window.addEventListener('beforeunload', () => {
      ws.close(1000, 'Page is unloading');
    });

    return () => ws.close(1000, 'Component unmounted');
  }, [roomId, setParticipants, self]);

  const value = useMemo<WSContextValue>(
    () => ({
      send: (msg) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify(msg));
        } else {
          console.warn('🟡 WebSocket is not ready. readyState:', wsRef.current?.readyState);
        }
      },
      ready,
    }),
    [ready],
  );

  return <WSContext.Provider value={value}>{children}</WSContext.Provider>;
};
