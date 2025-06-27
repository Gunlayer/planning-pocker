import { motion } from 'framer-motion';
import type { FC } from 'react';

interface CardProps {
  value: string;
  selected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}

const Card: FC<CardProps> = ({ value, selected, onSelect, disabled }) => {
  return (
    <motion.div
      whileHover={!disabled ? { y: -6 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      className={`w-16 h-24 m-2 flex items-center justify-center rounded-2xl cursor-pointer select-none
          bg-white/90 dark:bg-gray-800 text-xl font-semibold shadow-md
          ${selected ? 'ring-4 ring-indigo-500' : ''}
          ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      onClick={!disabled ? onSelect : undefined}
    >
      {value}
    </motion.div>
  );
};

export default Card;
