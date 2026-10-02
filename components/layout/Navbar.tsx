'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/auth/me')
      .then((res) => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">

      {/* Main Bar */}
      <nav className="w-full bg-white/70 backdrop-blur-md px-6 md:px-12 py-3.5 flex items-center justify-between border-b border-zinc-100/50">
        <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between relative">
          
            <div />

          {/* Centered Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <nav className="flex items-center gap-10">
              {['Экосистема', 'Услуги', 'О платформе'].map((item) => (
                <Link 
                  key={item} 
                  href="#" 
                  className="text-[14px] font-bold text-[#666] hover:text-black transition-colors uppercase tracking-[0.15em] border-b-2 border-transparent hover:border-black/5 pb-1"
                >
                  {t(item)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-2.5 z-10">
            {mounted && isLoggedIn ? (
              <Link 
                href="/dashboard" 
                className="bg-black text-white px-[14px] py-[6px] rounded-[7px] text-[13.5px] font-semibold hover:opacity-85 transition-opacity"
              >
                {t('В личный кабинет')}
              </Link>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="bg-black text-white px-[14px] py-[6px] rounded-[7px] text-[13.5px] font-semibold hover:opacity-85 transition-opacity"
                >
                  {t('Войти')}
                </Link>
                <Link 
                  href="/auth/register" 
                  className="bg-white text-black border border-[#e2e2e2] px-[14px] py-[6px] rounded-[7px] text-[13.5px] font-semibold hover:bg-[#f9f9f9] transition-all"
                >
                  {t('Регистрация')}
                </Link>
              </>
            )}
          </div>

        </div>
      </nav>
    </div>
  );
}
