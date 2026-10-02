'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUp, 
  Plus, 
  MessageSquare, 
  FileText, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import { TypingContributionGrid } from '@/components/ui/TypingContributionGrid';

export default function Dashboard() {
  const { t } = useLanguage();
  const router = useRouter();
  const [data, setData] = useState<{ user: any, debts: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetch('/api/debts')
      .then(res => res.json())
      .then((nextData) => {
        setData(nextData);
        setUserName(nextData.user?.name || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'negotiation': return '#f59e0b';
      case 'resolved': return '#10b981';
      case 'defaulted': return '#ef4444';
      default: return '#10b981';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'negotiation': return 'В процессе переговоров';
      case 'resolved': return 'Урегулировано';
      case 'defaulted': return 'Просрочено';
      default: return 'Активен';
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-6 md:px-12 py-12">
      
      {/* Hero Greeting (Manus Style) */}
      <section className="mb-20 text-center md:text-left">
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-[36px] md:text-[56px] text-black leading-tight mb-4 tracking-tighter"
        >
          {t('Чем я могу помочь вам сегодня')}{userName ? `, ${userName.split(' ')[0]}` : ''}?
        </motion.h1>
        <p className="text-[15px] md:text-[16px] text-zinc-400 font-medium">
          {t('У вас')} <span className="text-black font-bold">{data?.debts?.length || 0} {t('активных дела')}</span>, {t('требующих внимания')}.
        </p>
      </section>

      {/* Central AI-First Search / Action Pill */}
      <section className="mb-24">
        <div className="max-w-[800px] mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="keneshub-pill p-[18px] flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-black transition-colors">
              <Search size={24} strokeWidth={1} />
            </div>
            <input 
              type="text" 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && aiPrompt.trim()) {
                  router.push('/dashboard/ai?prompt=' + encodeURIComponent(aiPrompt.trim()));
                }
              }}
              placeholder="Опишите вашу ситуацию с задолженностью..."
              className="flex-1 bg-transparent border-none outline-none text-[20px] text-black placeholder:text-[#ccc] py-2"
            />
            <button 
              onClick={() => {
                if (aiPrompt.trim()) {
                  router.push('/dashboard/ai?prompt=' + encodeURIComponent(aiPrompt.trim()));
                }
              }}
              disabled={!aiPrompt.trim()}
              className="btn-keneshub btn-black rounded-[14px] px-5 sm:px-8 py-3.5 sm:py-4 justify-center disabled:opacity-50 whitespace-nowrap shrink-0 sm:min-w-[170px]"
            >
              <span className="sm:hidden text-[13px] tracking-wide">{t('Анализ')}</span>
              <span className="hidden sm:inline">{t('Анализировать')}</span>
            </button>
          </div>
          
          {/* GitHub Grid Animation */}
          <div className="mt-6">
            <TypingContributionGrid query={aiPrompt} />
          </div>
        </div>
      </section>

      {/* Two-Column Minimal Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
        
        {/* Left: Active Cases / Negotiations */}
        <div>
          <div className="flex items-center justify-between mb-8 border-b border-zinc-100 pb-4">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-zinc-400">Активные дела</h2>
            <Link href="/dashboard/negotiations" className="text-[13px] font-bold text-black border-b border-black pb-0.5">Все</Link>
          </div>
          <div className="space-y-10">
            {loading ? (
              <div className="text-zinc-300 animate-pulse">Загрузка данных...</div>
            ) : data?.debts?.length ? (
              data.debts.map((debt, i) => (
                <motion.div 
                  key={debt.id} 
                  initial={{ opacity: 0, x: -10 }} 
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                      <h3 className="font-serif italic text-[22px] text-black">{debt.description || 'Без названия'}</h3>
                      <span className="text-[15px] font-bold text-black">₸{debt.amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: getStatusColor(debt.status) }} />
                      <span className="text-[13px] font-medium text-zinc-400">{getStatusLabel(debt.status)}</span>
                      <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight size={14} /></span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-zinc-400 text-[14px]">Активных дел не найдено.</div>
            )}
          </div>
        </div>

        {/* Right: Recent Documents / Updates */}
        <div>
          <div className="flex items-center justify-between mb-8 border-b border-zinc-100 pb-4">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-zinc-400">Документы</h2>
            <Link href="/dashboard/documents" className="text-[13px] font-bold text-black border-b border-black pb-0.5">Все</Link>
          </div>
          <div className="space-y-8">
              <div className="p-8 text-center rounded-[20px] border border-dashed border-zinc-200 bg-[#fafafa]">
                 <FileText size={24} className="mx-auto text-zinc-300 mb-3" />
                 <p className="text-[14px] font-medium text-zinc-500">Нет последних документов</p>
                 <p className="text-[12px] text-zinc-400 mt-1">Здесь появятся ваши сгенерированные или загруженные файлы.</p>
              </div>
          </div>
        </div>

      </div>

      {/* Signature Phrase at bottom */}
      <div className="mt-48 pt-24 border-t border-zinc-100 text-center">
        <h2 className="font-serif italic text-[32px] md:text-[40px] text-zinc-200 tracking-tight">
            Сосредоточьтесь на решениях, а не на бюрократии.
        </h2>
      </div>

    </div>
  );
}
