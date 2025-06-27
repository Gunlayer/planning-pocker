import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { useRoomStore } from '@store/useRoomStore';

const Lobby = () => {
  const nav = useNavigate();

  const [name, setName] = useState('');
  const [roomList, setRoomList] = useState<string[]>([]);

  const setSelf = useRoomStore((s) => s.setSelf);
  const setRoomId = useRoomStore((s) => s.setRoomId);
  const roomId = useRoomStore((s) => s.roomId);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const roomId = roomList[0];
    if (roomId) {
      setSelf(name);
      setRoomId(roomId);
      nav(`/room/${roomId}`);
      return;
    }
    if (!roomId) {
      const newRoomId = uuid();
      setSelf(name);
      setRoomId(newRoomId);
      nav(`/room/${newRoomId}`);
    }
  };

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/lobby');

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'getRooms' }));
    };

    ws.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      if (type === 'rooms') {
        setRoomList(payload);
      }
    };

    ws.onclose = () => console.log('🔴 Lobby WebSocket closed');
    ws.onerror = (e) => console.error('WebSocket error:', e);

    return () => ws.close();
  }, [roomId]);

  return (
    <div className='h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900'>
      {roomList.length > 0 ? (
        <div className='mt-4 mb-4 w-80'>
          <h2 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Active Rooms
          </h2>
          <ul className='space-y-2'>
            {roomList.map((id) => (
              <li
                key={id}
                className='bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg flex justify-between items-center'
              >
                <span className='text-xs break-all text-gray-800 dark:text-gray-100'>{id}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className='mt-4 mb-4 text-xs text-gray-500 dark:text-gray-400'>No awalable rooms</p>
      )}
      <form
        onSubmit={handleSubmit}
        className='bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-80'
      >
        <h1 className='text-2xl font-semibold mb-6 text-center dark:text-gray-100'>
          Planning Poker
        </h1>
        <input
          className='w-full mb-4 px-4 py-2 rounded-lg border dark:bg-gray-700 dark:text-gray-100'
          placeholder='Your name'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className='w-full py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:bg-gray-400'
          disabled={!name}
        >
          {roomList.length ? `Join Room ${roomList[0]?.slice(0, 8)}` : 'Create'}
        </button>
      </form>
    </div>
  );
};

export default Lobby;
