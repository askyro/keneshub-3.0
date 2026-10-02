'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Save, Check, Settings as SettingsIcon } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const tabs = [
  { id: 'profile', label: 'Профиль', icon: User },
  { id: 'notifications', label: 'Уведомления', icon: Bell },
  { id: 'security', label: 'Безопасность', icon: Shield },
];

export default function SettingsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [form, setForm] = useState({
    name: 'Алибек Нурланов',
    email: 'alibek@example.kz',
    about: 'Ориентирован на урегулирование задолженности и восстановление финансового здоровья.'
  });

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
        setForm(prev => ({
          ...prev,
          name: data.user?.name || prev.name,
          email: data.user?.email || prev.email
        }));
      })
      .catch(console.error);
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-[800px] mx-auto px-6 md:px-12 py-12">
      
      <header className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-5 h-5 text-zinc-400" />
            <span className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">{t('Персональная система')}</span>
          </div>
          <h1 className="font-serif text-[40px] md:text-[56px] text-black tracking-tight leading-none">{t('Настройки')}</h1>
      </header>

      <div className="flex gap-6 md:gap-12 border-b border-zinc-100 mb-12 md:mb-16 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 text-[13px] md:text-[14px] font-bold uppercase tracking-[0.15em] transition-all relative whitespace-nowrap ${
                activeTab === tab.id ? 'text-black' : 'text-zinc-400 hover:text-black'
              }`}
            >
              {t(tab.label)}
              {activeTab === tab.id && (
                <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </button>
          ))}
      </div>

      <section className="space-y-12 md:space-y-16">
          {activeTab === 'profile' && (
              <div className="space-y-8 md:space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                  <div className="space-y-3">
                      <label className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">{t('ФИО')}</label>
                      <input type="text" value={mounted ? form.name : ''} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full bg-transparent border-b border-zinc-200 py-3 outline-none focus:border-black transition-all text-[16px] font-medium" />
                  </div>
                  <div className="space-y-3">
                      <label className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">{t('Электронная почта')}</label>
                      <input type="email" value={mounted ? form.email : ''} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full bg-transparent border-b border-zinc-200 py-3 outline-none focus:border-black transition-all text-[16px] font-medium" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">{t('О себе')}</label>
                  <textarea className="w-full bg-transparent border-b border-zinc-200 py-3 outline-none focus:border-black transition-all text-[16px] font-medium min-h-[100px] resize-none" value={mounted ? form.about : ''} onChange={(e) => setForm({...form, about: e.target.value})} />
                </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8">
                {[
                  { label: 'Оповещения безопасности', desc: 'Критические изменения в безопасности вашей учетной записи.' },
                  { label: 'Обновления переговоров', desc: 'Оповещения в реальном времени при ответе кредитора.' },
                  { label: 'AI Аналитика', desc: 'Еженедельный отчет по вашей ситуации с долгами.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group gap-4">
                      <div>
                        <p className="text-[14px] md:text-[15px] font-bold text-black group-hover:italic transition-all">
                            {t(item.label)}
                        </p>
                        <p className="text-[12px] md:text-[13px] text-zinc-400 mt-1">{t(item.desc)}</p>
                      </div>
                      <div className="w-10 h-6 bg-zinc-100 rounded-full p-1 cursor-pointer transition-colors hover:bg-zinc-200 relative flex-shrink-0">
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                  </div>
                ))}
            </div>
          )}

          <div className="pt-12 flex flex-col md:flex-row items-center md:justify-between border-t border-zinc-100 gap-6">
            <button onClick={handleSave} className="btn-keneshub btn-black w-full md:w-auto px-12 py-4 rounded-xl uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                {saved ? <Check size={16} /> : <Save size={16} />}
                {saved ? t('Сохранено') : t('Сохранить изменения')}
            </button>
            <p className="text-[13px] text-zinc-400 font-medium italic">{t('Синхронизация: 2 минуты назад')}</p>
          </div>
      </section>

      <div className="mt-32 md:mt-40 text-center opacity-20">
          <h2 className="font-serif italic text-[20px] md:text-[24px] text-black">{t('Точность — это залог спокойствия.')}</h2>
      </div>

    </div>
  );
}
