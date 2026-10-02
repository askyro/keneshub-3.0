'use client';

import { useEffect, useMemo, useState } from 'react';
import { Briefcase, ChevronRight, MessageSquare, Search, TrendingDown } from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';

type Debt = { id: string; amount: number; status?: string | null; description?: string | null; borrower?: { name: string } };

export default function CollectorPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/debts').then((response) => response.json()).then((data) => setDebts(data.debts ?? [])).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => debts.filter((debt) => {
    const query = search.toLowerCase();
    return !query || debt.borrower?.name.toLowerCase().includes(query) || debt.description?.toLowerCase().includes(query);
  }), [debts, search]);
  const total = debts.reduce((sum, debt) => sum + debt.amount, 0);
  const openNegotiation = async (debtId: string) => {
    const response = await fetch('/api/negotiations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ debtId }) });
    if (response.ok) window.location.href = `/chat/${(await response.json()).negotiation.id}`;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto"><div className="max-w-[1200px] mx-auto px-8 md:px-12 py-12">
        <header className="mb-16"><div className="flex items-center gap-3 mb-3"><Briefcase size={18} className="text-zinc-400" /><span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Кабинет коллектора</span></div><h1 className="font-serif text-[48px] text-black">Портфель взыскания</h1></header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16"><div className="border-l border-zinc-200 pl-6"><p className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">Активные дела</p><p className="text-[32px] font-bold mt-2">{debts.length}</p></div><div className="border-l border-zinc-200 pl-6"><p className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">Общий портфель</p><p className="text-[32px] font-bold mt-2">₸{total.toLocaleString('ru-RU')}</p></div><div className="border-l border-zinc-200 pl-6"><p className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">Статус</p><p className="text-[32px] font-bold mt-2 flex items-center gap-2"><TrendingDown size={24} /> В работе</p></div></div>
        <section><div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100"><h2 className="text-[13px] font-bold uppercase tracking-widest">Реестр дел</h2><div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск по делу..." className="pl-9 pr-4 py-2 border-b border-zinc-200 outline-none focus:border-black text-sm bg-transparent" /></div></div>{loading ? <p className="py-12 text-zinc-400">Загрузка дел...</p> : filtered.length === 0 ? <p className="py-12 text-zinc-400">Назначенных дел пока нет.</p> : <div className="space-y-3">{filtered.map((debt) => <button key={debt.id} onClick={() => openNegotiation(debt.id)} className="w-full group flex items-center justify-between p-6 border border-transparent hover:border-zinc-100 hover:bg-[#fafafa] text-left transition-all"><div className="flex items-center gap-5"><div className="w-11 h-11 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center font-serif text-lg">{debt.borrower?.name?.[0] ?? '?'}</div><div><h3 className="font-serif text-[21px] italic">{debt.borrower?.name ?? 'Заёмщик'}</h3><p className="text-[13px] text-zinc-400 mt-1">{debt.description ?? 'Без описания'} · <span className="text-black font-semibold">{debt.status ?? 'active'}</span></p></div></div><div className="flex items-center gap-5"><span className="font-bold">₸{debt.amount.toLocaleString('ru-RU')}</span><ChevronRight size={18} className="text-zinc-300 group-hover:text-black" /></div></button>)}</div>}</section>
      </div></main>
    </div>
  );
}
