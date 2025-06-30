import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore } from '@store/useRoomStore';
import Participants from '@components/Participants';
import CardDeck from '@components/CardDeck';
import { useWebSocket } from '../../WebSocketProvider';

const Room = () => {
  const nav = useNavigate();

  const { roomId } = useParams<{ roomId: string }>();
  const setRoomId = useRoomStore(({ setRoomId }) => setRoomId);
  const participants = useRoomStore(({ participants }) => participants);
  const self = useRoomStore(({ self }) => self);
  const vote = useRoomStore(({ vote }) => vote);
  const endTime = useRoomStore(({ endTime }) => endTime);

  const { send, ready } = useWebSocket();

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (roomId) setRoomId(roomId);
  }, [roomId, setRoomId, participants]);

  const handleVote = (card: string) => {
    send({ type: 'vote', card });
    vote(card);
  };
  const handleReset = () => {
    send({ type: 'reset' });
  };

  const handleQuit = () => {
    send({ type: 'quit' });
    nav('/');
  };

  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const remaining = Math.floor((endTime - Date.now()) / 1000);
      setSecondsLeft(remaining > 0 ? remaining : 0);
      console.log('⏳ Countdown tick:', remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const allVoted = participants.length > 0 && participants.every((participant) => participant.card);
  if (!ready) {
    return (
      <div className='h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900'>
        <p className='animate-pulse text-gray-500'>Connect to server...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col items-center py-10 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100'>
      <div className='flex mb-6 items-center'>
        <h2 className='text-3xl font-bold '>Room {roomId?.slice(0, 8)}</h2>
        <button
          className='ml-8 px-6 py-1 rounded-lg border dark:bg-gray-700 dark:text-gray-100'
          onClick={handleQuit}
        >
          Quit
        </button>
        {endTime !== null && endTime !== 0 && (
          <p className='animate-pulse dark:text-gray-100 text-xl ml-4'>{secondsLeft} sec left</p>
        )}
      </div>

      <Participants participants={participants} reveal={allVoted} self={self} />

      <CardDeck onVote={handleVote} disabled={allVoted} />

      <AnimatePresence>
        {allVoted && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className='mt-8 px-6 py-3 bg-red-600 rounded-xl text-white font-medium hover:bg-red-700'
            onClick={handleReset}
          >
            Reset Round
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Room;
