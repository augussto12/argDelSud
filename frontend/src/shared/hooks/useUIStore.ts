import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface UIState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  theme: Theme;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleTheme: () => void;
}

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useUIStore = create<UIState>((set) => {
  const initialTheme = getInitialTheme();
  document.documentElement.setAttribute('data-theme', initialTheme);

  return {
    sidebarOpen: true, // desktop: expanded by default
    mobileSidebarOpen: false, // mobile: hidden by default
    theme: initialTheme,
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    openSidebar: () => set({ sidebarOpen: true }),
    closeSidebar: () => set({ sidebarOpen: false }),
    toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
    closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
    toggleTheme: () =>
      set((s) => {
        const next = s.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        return { theme: next };
      }),
  };
});
