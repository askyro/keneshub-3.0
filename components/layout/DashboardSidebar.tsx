'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Scale, 
  Settings, 
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const roleLabels: Record<string, string> = {
  borrower: 'Заёмщик',
  creditor: 'Кредитор',
  collector: 'Коллектор',
  lawyer: 'Юрист',
  ombudsman: 'Омбудсмен',
};

const menuItems = [
  { id: 'dashboard', label: 'Центр управления', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'ai', label: 'AI Консультант', icon: Sparkles, href: '/dashboard/ai' },
  { id: 'negotiations', label: 'Переговоры', icon: MessageSquare, href: '/dashboard/negotiations' },
  { id: 'documents', label: 'Документы', icon: FileText, href: '/dashboard/documents' },
  { id: 'court', label: 'Правовая помощь', icon: Scale, href: '/dashboard/legal' },
  { id: 'settings', label: 'Настройки', icon: Settings, href: '/dashboard/settings' },
];

export default function DashboardSidebar({ onClose }: { onClose?: () => void }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    setMounted(true);

    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then((data) => {
        setUserName(data.user?.name || '');
        setUserRole(roleLabels[data.user?.role] || data.user?.role || '');
      })
      .catch(() => {
        setUserName('');
        setUserRole('');
      });
  }, []);

  const displayInitial = mounted && userName ? userName[0].toUpperCase() : 'П';
  const displayUserName = mounted && userName ? userName : 'Пользователь';
  const displayUserRole = mounted && userRole ? userRole : 'Заёмщик';

  return (
    <aside className="w-[260px] h-full bg-white border-r border-[#e8e8e8] flex flex-col flex-shrink-0">
      {/* Sidebar Header */}
      <div className="px-8 py-10">
        <Link href="/" onClick={onClose} className="flex items-center gap-2 group">
          <div className="w-5 h-5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="black"/>
              <path d="M2 17L12 22L22 17" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[17px] font-bold tracking-tight text-black transition-opacity group-hover:opacity-60">
            Kenes<span className="font-medium opacity-50 italic">Hub</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-zinc-100 text-black' 
                  : 'text-zinc-500 hover:text-black hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-black' : 'text-zinc-400 group-hover:text-black'} strokeWidth={1.8} />
                <span className="text-[14px] font-medium tracking-tight">
                  {t(item.label)}
                </span>
              </div>
              {isActive && <ChevronRight size={14} className="text-zinc-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-6 border-t border-[#e8e8e8]">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-serif text-[16px] font-bold text-black border border-zinc-200">
            {displayInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-black truncate">{displayUserName}</p>
            <p className="text-[12px] text-zinc-400 truncate">{displayUserRole}</p>
          </div>
        </div>
        <button 
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userEmail');
            window.location.href = '/auth/login';
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-black transition-colors"
        >
          <LogOut size={16} />
          <span className="text-[13px] font-semibold uppercase tracking-wider">{t('Выйти')}</span>
        </button>
      </div>
    </aside>
  );
}
