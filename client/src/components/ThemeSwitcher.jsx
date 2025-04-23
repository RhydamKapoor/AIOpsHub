import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <button
      className="cursor-pointer"
      onClick={toggleTheme}
    >
      {theme === 'light' ?  <Sun /> : <Moon />}
    </button>
  );
};

export default ThemeSwitcher;
