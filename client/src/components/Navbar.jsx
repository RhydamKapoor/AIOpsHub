import React, { useContext } from 'react'
import { Outlet } from 'react-router-dom'
import ThemeSwitcher from './ThemeSwitcher'
import { ThemeContext } from '../context/ThemeContext';


export default function Navbar() {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`flex flex-col bg-[var(--color-base-300)] text-[var(--color-base-content)] h-screen overflow-hidden p-6 selection:bg-[var(--color-neutral-content)] ${theme === "dark" ? "bg-[url('./nightRobo.png')]" : "bg-[url('./robo.png')]"} bg-cover bg-center`}>
      <nav>
        <div className="flex justify-between items-center">
            <div className="flex">
                <h1 className='text-3xl font-bold'>AIOpsHub</h1>
            </div>
            <div className="flex">
                <ThemeSwitcher />
            </div>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}
