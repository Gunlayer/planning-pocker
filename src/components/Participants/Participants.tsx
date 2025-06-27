import { motion } from 'framer-motion';
import type { FC } from 'react';
import type { Participant } from '@types';

interface ParticipantsProps {
  participants: Participant[];
  reveal: boolean;
}

const Participants: FC<ParticipantsProps> = ({ participants, reveal }) => {
  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10 px-4 w-full max-w-3xl'>
      {participants.map(({ id, name, card }) => (
        <motion.div
          key={id}
          layout
          className='flex flex-col items-center p-4 rounded-2xl bg-white dark:bg-gray-800 shadow'
        >
          <span className='font-medium mb-2 truncate max-w-[8rem]'>{name}</span>
          <motion.div
            initial={false}
            animate={{ rotateY: reveal ? 0 : 180 }}
            transition={{ duration: 0.6 }}
            className='w-12 h-16 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-lg font-bold backface-hidden'
            style={{ perspective: 800 }}
          >
            {reveal ? (card ?? '-') : '?'}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

export default Participants;
