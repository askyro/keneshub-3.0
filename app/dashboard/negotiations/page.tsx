'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { 
  MessageSquare, 
  ChevronRight, 
  Search,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function NegotiationsPage() {
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/negotiations')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Не удалось загрузить диалоги')))
      .then((data) => setNegotiations(data.negotiations ?? []))
      .catch(() => setNegotiations([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredNegotiations = useMemo(() => negotiations.filter((negotiation) => {
    const query = search.toLowerCase();
    return !query || negotiation.partner?.name?.toLowerCase().includes(query) || negotiation.debt?.description?.toLowerCase().includes(query);
  }), [negotiations, search]);

  return (
    <div className="max-w-[1000px] mx-auto px-6 md:px-12 py-12">
      
      <header className="mb-16 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
         <div>
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare size={18} className="text-zinc-400" />
              <span className="text-[12px] font-bold uppercase tracking-widest text-[#999]">Система диалогов</span>
            </div>
            <h1 className="font-serif text-[48px] md:text-[60px] text-black leading-none tracking-tighter">Коммуникации</h1>
         </div>
         <button className="btn-keneshub btn-black rounded-full px-8 py-3 w-full md:w-auto text-[14px]">
            <Plus size={16} /> Новый диалог
         </button>
      </header>

      <section>
         <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-zinc-100 gap-6">
            <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar whitespace-nowrap">
               {['Все', 'Банки', 'Юристы'].map(f => (
                 <button key={f} className={`text-[12px] md:text-[13px] font-bold uppercase tracking-widest ${f === 'Все' ? 'text-black border-b border-black pb-1' : 'text-zinc-400 hover:text-black hover:bg-zinc-50 px-2 pb-1'}`}>
                    {f}
                 </button>
               ))}
            </div>
            <div className="relative w-full md:w-auto">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
               <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Найти партнера..." className="w-full md:w-[240px] pl-9 pr-4 py-1.5 border-b border-zinc-100 outline-none focus:border-black text-sm transition-all bg-transparent" />
            </div>
         </div>

         <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center text-zinc-400">Загрузка диалогов...</div>
            ) : filteredNegotiations.length > 0 ? (
              filteredNegotiations.map((n, i) => (
                <Link key={n.id} href={`/chat/${n.id}`}>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 rounded-[24px] md:rounded-[28px] border border-zinc-100 hover:border-black hover:bg-[#fafafa]/50 transition-all cursor-pointer bg-white gap-6"
                  >
                    <div className="flex items-center gap-4 md:gap-8">
                       <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center font-serif text-[18px] md:text-[20px] font-bold text-black italic flex-shrink-0">
                          {n.partner?.name?.[0] ?? '?'}
                       </div>
                       <div className="min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-serif text-[20px] md:text-[24px] text-black leading-tight truncate">{n.partner?.name ?? 'Участник дела'}</h3>
                             {n.unread && <div className="w-2 h-2 rounded-full bg-black animate-pulse flex-shrink-0" />}
                          </div>
                          <p className="text-[11px] md:text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-2 truncate">{n.debt?.description ?? 'Дело по задолженности'}</p>
                          <p className="text-[14px] md:text-[15px] text-zinc-500 italic font-serif truncate">"{n.lastMessage?.content ?? 'Диалог открыт'}"</p>
                       </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10 border-t md:border-t-0 pt-4 md:pt-0">
                       <div className="text-left md:text-right">
                          <p className="text-[11px] md:text-[12px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{n.lastMessage?.createdAt ? new Date(Number(n.lastMessage.createdAt) * 1000).toLocaleDateString('ru-RU') : 'Новое'}</p>
                          <span className="text-[10px] md:text-[11px] font-bold text-black border border-black rounded-full px-2 py-0.5">{n.status === 'open' ? 'ОТКРЫТ' : n.status}</span>
                       </div>
                       <ChevronRight className="text-zinc-200 group-hover:text-black transition-colors" />
                    </div>
                  </motion.div>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center rounded-[24px] border border-dashed border-zinc-200 bg-[#fafafa]">
                 <MessageSquare size={32} className="mx-auto text-zinc-300 mb-4" />
                 <p className="text-[15px] font-medium text-zinc-500">У вас пока нет активных диалогов.</p>
                 <p className="text-[13px] text-zinc-400 mt-2">Как только вы начнете взаимодействие с юристами или банками, переписки появятся здесь.</p>
              </div>
            )}
         </div>
      </section>

      <footer className="mt-24 md:mt-40 pt-16 md:pt-20 border-t border-zinc-100 text-center">
         <h2 className="font-serif italic text-[22px] md:text-[28px] text-zinc-200">Чёткая коммуникация, быстрое решение.</h2>
      </footer>

    </div>
  );
}
