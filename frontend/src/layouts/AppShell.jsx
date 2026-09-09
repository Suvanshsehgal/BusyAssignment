import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar.jsx';
import { Header } from '../components/Header.jsx';

export const AppShell = ({ navItems }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F5F7FB] dark:bg-[#0F1115] text-[#4A4A4A] dark:text-[#AEB2BB] transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        navItems={navItems}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden min-h-screen">
        <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
