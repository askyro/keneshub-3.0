'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Briefcase, ChevronRight, FileText, MessageSquare, Search } from 'lucide-react';
import Link from 'next/link';
import DashboardSidebar from '@/components/layout/DashboardSidebar';

type Debt = { id: string; amount: number; status?: string | null; description?: string | null; borrower?: { name: string } };
const statusLabels: Record<string, string> = { active: 'АКТИВНО', negotiation: 'ПЕРЕГОВОРЫ', resolved: 'ЗАКРЫТО', defaulted: 'ПРОСРОЧЕНО' };

export default function CreditorPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/debts').then((response) => response.json()).then((data) => {
      setDebts(data.debts ?? []);
      setSelectedId(data.debts?.[0]?.id ?? null);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => debts.filter((debt) => {
    const query = search.toLowerCase();
    return !query || debt.borrower?.name.toLowerCase().includes(query) || debt.description?.toLowerCase().includes(query);
  }), [debts, search]);
  const selected = filtered.find((debt) => debt.id === selectedId) ?? filtered[0];

  const openNegotiation = async () => {
    if (!selected) return;
    const response = await fetch('/api/negotiations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ debtId: selected.id }) });
    if (response.ok) {
      const data = await response.json();
      window.location.href = `/chat/${data.negotiation.id}`;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <DashboardSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="px-8 md:px-12 py-8 border-b border-zinc-100 flex items-center justify-between">
          <div><p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Кабинет кредитора</p><h1 className="font-serif text-[32px] text-black">Портфель дел</h1></div>
          <Link href="/dashboard/negotiations" className="btn-keneshub btn-black px-5"><MessageSquare size={16} /> Переговоры</Link>
        </header>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-full md:w-[400px] border-r border-zinc-100 overflow-y-auto bg-[#fafafa]">
            <div className="p-6 border-b border-zinc-200/50"><div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск по заёмщику..." className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-zinc-200 text-sm outline-none focus:border-black" /></div></div>
            {loading ? <p className="p-8 text-zinc-400">Загрузка дел...</p> : filtered.length === 0 ? <p className="p-8 text-zinc-400">Дел пока нет.</p> : filtered.map((debt) => <button key={debt.id} onClick={() => setSelectedId(debt.id)} className={`w-full text-left p-6 border-b border-zinc-100 transition-colors ${selected?.id === debt.id ? 'bg-white' : 'hover:bg-white/70'}`}><div className="flex items-center justify-between mb-2"><span className="text-[11px] font-bold tracking-widest text-zinc-400">{statusLabels[debt.status ?? 'active'] ?? debt.status}</span><span className="text-[14px] font-bold">₸{debt.amount.toLocaleString('ru-RU')}</span></div><div className="flex items-center justify-between"><p className="font-serif text-[20px]">{debt.borrower?.name ?? 'Заёмщик'}</p><ChevronRight size={18} /></div><p className="text-[13px] text-zinc-400 mt-2 truncate">{debt.description ?? 'Без описания'}</p></button>)}
          </div>
          <div className="hidden md:block flex-1 overflow-y-auto p-12">
            {selected ? <div className="max-w-[800px] mx-auto"><span className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">Детали дела</span><h2 className="font-serif text-[48px] text-black mt-2">{selected.borrower?.name ?? 'Заёмщик'}</h2><p className="text-zinc-400 mt-2">{selected.description ?? 'Без описания'}</p><div className="grid grid-cols-2 gap-12 mt-12"><div><h3 className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 pb-2">Финансовый статус</h3><p className="text-[30px] font-bold mt-5">₸{selected.amount.toLocaleString('ru-RU')}</p><p className="text-sm text-zinc-400">Текущая сумма задолженности</p></div><div><h3 className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 pb-2">Действия</h3><button onClick={openNegotiation} className="w-full mt-5 p-4 border border-zinc-100 bg-[#fafafa] hover:border-black flex items-center justify-between"><span className="flex items-center gap-3 font-bold"><MessageSquare size={18} /> Открыть переговоры</span><ArrowUpRight size={16} /></button><button className="w-full mt-3 p-4 border border-zinc-100 bg-[#fafafa] hover:border-black flex items-center justify-between"><span className="flex items-center gap-3 font-bold"><FileText size={18} /> Подготовить предложение</span><ArrowUpRight size={16} /></button></div></div></div> : <div className="text-zinc-400 flex items-center gap-3"><Briefcase size={18} /> Выберите дело</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
