import { useEffect, useState, type FC } from 'react';
import { Moon, Sun } from 'lucide-react';

interface DarkModeToggleProps {
  className: string;
}

const DarkModeToggle: FC<DarkModeToggleProps> = ({ className }) => {
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <button
      aria-label='Toggle dark mode'
      className={`p-2 rounded-full bg-white/70 dark:bg-gray-800 shadow ${className}`}
      onClick={() => setDark((d) => !d)}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default DarkModeToggle;
