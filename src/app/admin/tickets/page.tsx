import { getAllRequests, runAutoRefund, refundRequest, fulfillRequest, getRequestStats } from "@/app/actions/tickets";
import { AdminSidebarWrapper } from "@/components/layout/AdminSidebarWrapper";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChatWithUserButton } from "@/components/chat/ChatWithUserButton";
import { 
  Ticket, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  XCircle, 
  User, 
  Mail,
  Calendar,
  Zap,
  MoreVertical,
  ExternalLink,
  Coins,
  RefreshCw,
  Search,
  AlertTriangle,
  MessageCircle
} from "lucide-react";
import Link from "next/link";

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect('/auth');

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles, pseudo, avatar_url')
    .eq('id', authUser.id)
    .single();

  const roles = (profile?.roles as string[]) || [];
  if (!roles.includes('admin') && !roles.includes('superadmin')) redirect('/dashboard');

  const [requests, stats] = await Promise.all([
    getAllRequests(status),
    getRequestStats()
  ]);

  const totalRequests =
    "total" in stats
      ? stats.total
      : (stats.pending ?? 0) +
        (stats.fulfilled ?? 0) +
        (stats.refunded ?? 0) +
        (stats.expired ?? 0);

  const adminUser = {
    name: profile?.pseudo || 'Admin',
    subtitle: 'Administrateur',
    avatarUrl: profile?.avatar_url || undefined,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="flex items-center gap-1.5 text-amber-600 font-bold text-[10px] uppercase bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100"><Clock className="w-3.5 h-3.5" /> En attente</span>;
      case 'fulfilled': return <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100"><CheckCircle2 className="w-3.5 h-3.5" /> Satisfait</span>;
      case 'refunded': return <span className="flex items-center gap-1.5 text-indigo-600 font-bold text-[10px] uppercase bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100"><Coins className="w-3.5 h-3.5" /> Remboursé</span>;
      case 'expired': return <span className="flex items-center gap-1.5 text-red-600 font-bold text-[10px] uppercase bg-red-50 px-2.5 py-1 rounded-lg border border-red-100"><XCircle className="w-3.5 h-3.5" /> Expiré</span>;
      default: return <span className="text-slate-400">{status}</span>;
    }
  };

  return (
    <AdminSidebarWrapper user={adminUser}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black font-outfit tracking-tight text-slate-900 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
                <Ticket className="w-8 h-8" />
            </div>
            Demandes de Sujets
          </h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Gère les requêtes des utilisateurs et les remboursements.
          </p>
        </div>

        <div className="flex items-center gap-3">
            <form action={async () => { 'use server'; await runAutoRefund(); }}>
                <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                    <RefreshCw className="w-4 h-4" />
                    Lancer Remboursements Auto
                </button>
            </form>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Demandes</p>
            <p className="text-2xl font-black text-slate-900">{totalRequests}</p>
        </div>
        <div className="bg-amber-50 p-5 rounded-[24px] border border-amber-100 shadow-sm">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">En attente</p>
            <p className="text-2xl font-black text-amber-700">{stats.pending}</p>
        </div>
        <div className="bg-emerald-50 p-5 rounded-[24px] border border-emerald-100 shadow-sm">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Satisfaits</p>
            <p className="text-2xl font-black text-emerald-700">{stats.fulfilled}</p>
        </div>
        <div className="bg-indigo-50 p-5 rounded-[24px] border border-indigo-100 shadow-sm">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Remboursés</p>
            <p className="text-2xl font-black text-indigo-700">{stats.refunded}</p>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <Link href="/admin/tickets" className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!status ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:bg-white/50"}`}>
          Tous
        </Link>
        <Link href="/admin/tickets?status=pending" className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${status === 'pending' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "text-slate-500 hover:bg-white/50"}`}>
          En attente
        </Link>
        <Link href="/admin/tickets?status=fulfilled" className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${status === 'fulfilled' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:bg-white/50"}`}>
          Satisfaits
        </Link>
        <Link href="/admin/tickets?status=refunded" className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${status === 'refunded' ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:bg-white/50"}`}>
          Remboursés
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requests.data.length === 0 ? (
            <article className="mah-card py-20 text-center bg-white border-slate-200 rounded-[32px]">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Ticket className="w-10 h-10 text-slate-200" />
                </div>
                <p className="text-slate-400 italic font-medium">Aucun ticket trouvé dans cette catégorie.</p>
            </article>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {requests.data.map((req: any) => (
                    <article key={req.id} className="mah-card p-8 bg-white border-slate-200 shadow-xl rounded-[32px] hover:border-indigo-200 transition-all group">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">
                                    {req.matiere.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-lg">{req.matiere}</h3>
                                    <p className="text-sm text-slate-500 font-bold uppercase tracking-tighter">Année {req.year} {req.serie ? `• Série ${req.serie}` : ''}</p>
                                </div>
                            </div>
                            {getStatusBadge(req.status)}
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-xs font-bold text-slate-600">{req.user?.pseudo}</span>
                                    <ChatWithUserButton userId={req.user_id} pseudo={req.user?.pseudo} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-400">{new Date(req.created_at).toLocaleDateString('fr-FR')}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                <Mail className="w-3 h-3" />
                                {req.user?.email}
                            </div>
                        </div>

                        {req.status === 'pending' && (
                            <div className="flex items-center gap-3">
                                <Link 
                                    href={`/admin/subjects?requestId=${req.id}&matiere=${encodeURIComponent(req.matiere)}&year=${req.year}${req.serie ? `&serie=${encodeURIComponent(req.serie)}` : ''}`}
                                    className="flex-[2] py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Ajouter le sujet
                                </Link>
                                <form action={async () => { 'use server'; await refundRequest(req.id, 'Manual Refund by Admin'); }} className="flex-1">
                                    <button className="w-full py-3 bg-white border border-slate-200 text-red-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all">
                                        Rembourser
                                    </button>
                                </form>
                            </div>
                        )}

                        {req.status === 'fulfilled' && (
                            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100">
                                <CheckCircle2 className="w-4 h-4" />
                                Sujet ajouté : {req.subjects?.title}
                            </div>
                        )}

                        {req.status === 'refunded' && (
                            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-bold border border-indigo-100 italic">
                                &quot;{req.admin_comment}&quot;
                            </div>
                        )}
                    </article>
                ))}
            </div>
        )}
      </div>
    </AdminSidebarWrapper>
  );
}

function Plus({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
}
