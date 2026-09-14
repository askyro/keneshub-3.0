'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { User, Building2, Briefcase, Scale, Users, Check, ArrowUp } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useLanguage } from '@/lib/i18n';

const roles = [
  {
    id: 'borrower',
    label: 'Заёмщик',
    desc: 'У меня есть просроченный долг',
    icon: User,
    href: '/dashboard',
  },
  {
    id: 'creditor',
    label: 'Кредитор',
    desc: 'Банк или МФО',
    icon: Building2,
    href: '/creditor',
  },
  {
    id: 'collector',
    label: 'Коллектор',
    desc: 'Коллекторское агентство',
    icon: Briefcase,
    href: '/collector',
  },
  {
    id: 'lawyer',
    label: 'Юрист',
    desc: 'Правовая поддержка',
    icon: Scale,
    href: '/dashboard/legal',
  },
  {
    id: 'ombudsman',
    label: 'Омбудсмен',
    desc: 'Банковский медиатор',
    icon: Users,
    href: '/ombudsman',
  },
];

function RegisterForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || '';
  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const router = useRouter();

  const selected = roles.find((r) => r.id === selectedRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setLoading(true);
    
    try {
      // Сохраняем в реальную БД
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: selectedRole
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при регистрации');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('userName', data.user?.name || form.name);
        localStorage.setItem('userRole', selected?.label || 'Заёмщик');
        localStorage.setItem('userEmail', data.user?.email || form.email);
      }
      
      // Искусственная задержка для плавности анимации
      setTimeout(() => {
        setLoading(false);
        router.push(selected?.href || '/dashboard');
      }, 500);

    } catch (err) {
      console.error(err);
      alert('Ошибка регистрации. Возможно этот email уже используется.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[500px]"
      >
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Link href="/" className="flex items-center gap-2 group text-center mx-auto">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="black"/>
                <path d="M2 17L12 22L22 17" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[19px] font-bold tracking-tight text-black transition-opacity group-hover:opacity-70">
              Kenes<span className="font-medium opacity-50 italic">Hub</span>
            </span>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="font-serif text-[40px] text-black leading-tight tracking-tight">
            {t('Создать аккаунт')}
          </h1>
          <motion.p 
            animate={{ opacity: selectedRole ? 0.5 : 1 }}
            className="text-[14px] text-zinc-400 font-medium mt-2"
          >
            {selectedRole ? t('Ваша роль выбрана') : t('Выберите вашу роль в экосистеме')}
          </motion.p>
        </div>

        {/* Role selection - Minimalist List */}
        <div className="grid grid-cols-1 gap-3 mb-12">
          <AnimatePresence mode="wait">
            {!selectedRole ? (
              <motion.div
                key="role-list"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="grid grid-cols-1 gap-3"
              >
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 hover:border-zinc-300 bg-white transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-50 text-zinc-400">
                          <Icon size={18} strokeWidth={1.5} />
                        </div>
                        <div className="text-left">
                          <p className="text-[15px] font-bold text-zinc-500">{t(role.label)}</p>
                          <p className="text-[12px] text-zinc-400">{t(role.desc)}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="selected-role"
                initial={{ opacity: 0, scale: 0.98, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -5 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative"
              >
                <div className="flex items-center justify-between p-4 rounded-xl border border-black bg-zinc-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-black text-white">
                      {selected && <selected.icon size={18} strokeWidth={2} />}
                    </div>
                    <div className="text-left">
                      <p className="text-[15px] font-bold text-black">{t(selected?.label || '')}</p>
                      <p className="text-[12px] text-zinc-400">{t(selected?.desc || '')}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('')}
                    className="text-[11px] font-bold text-zinc-400 hover:text-black uppercase tracking-widest transition-colors"
                  >
                    {t('Изменить')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {selectedRole && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-widest text-zinc-400 ml-1">
                {t('ФИО')}
              </label>
              <div className="keneshub-input-pill p-[14px]">
                <input
                  type="text"
                  placeholder="Иван Иванов"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full bg-transparent border-none outline-none text-[15px] text-black placeholder:text-zinc-300 px-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-widest text-zinc-400 ml-1">
                {t('Email')}
              </label>
              <div className="keneshub-input-pill p-[14px]">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full bg-transparent border-none outline-none text-[15px] text-black placeholder:text-zinc-300 px-2"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-widest text-zinc-400 ml-1">
              {t('Пароль')}
            </label>
            <div className="keneshub-input-pill p-[14px]">
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                className="w-full bg-transparent border-none outline-none text-[15px] text-black placeholder:text-zinc-300 px-2"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedRole}
            className={`btn-keneshub btn-black w-full py-4 rounded-xl text-[14px] uppercase tracking-[0.2em] font-bold justify-center ${!selectedRole ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                {t('Создание...')}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {t('Инициализировать аккаунт')} <ArrowUp className="rotate-90" size={16} />
              </span>
            )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

        <p className="text-center text-[13px] mt-10 text-zinc-400 font-medium">
          {t('Уже есть аккаунт?')} {' '}
          <Link href="/auth/login" className="text-black font-bold border-b border-black pb-0.5">
            {t('Войти')}
          </Link>
        </p>

        <div className="mt-20 pt-10 border-t border-zinc-100 text-center">
          <Link href="/" className="text-[11px] font-bold text-zinc-300 hover:text-black uppercase tracking-[0.2em] transition-colors">
            {t('← Вернуться на главную')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen flex items-center justify-center bg-white">
         <div className="animate-pulse text-zinc-300 font-serif italic text-2xl">Загрузка...</div>
       </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
