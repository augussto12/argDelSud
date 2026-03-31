import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ToastContainer from '../ToastContainer';
import ConfirmModal from '../ConfirmModal';
import { useUIStore } from '../../hooks/useUIStore';
import { useEffect, useState } from 'react';

export default function MainLayout() {
  const { sidebarOpen } = useUIStore();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const handler = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsDesktop(window.innerWidth >= 1024), 150);
    };
    window.addEventListener('resize', handler);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handler);
    };
  }, []);

  const marginLeft = isDesktop ? (sidebarOpen ? 256 : 72) : 0;

  return (
    <div className="min-h-screen bg-page">
      <Sidebar />
      <div
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft }}
      >
        <Header />
        <main className="flex-1 p-4 lg:p-6 overflow-auto animate-fadeIn">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
      <ConfirmModal />
    </div>
  );
}
