"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { 
    MessageSquare, 
    Send, 
    Loader2, 
    User,
    MoreVertical,
    Trash2,
    Flag
} from "lucide-react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    pseudo: string;
    avatar_url?: string;
    roles?: string[];
  };
}

export function SubjectComments({ subjectId }: { subjectId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('roles')
          .eq('id', user.id)
          .single();
        setUserRole(profile?.roles?.[0] || 'user');
      }

      const { data } = await supabase
        .from('subject_comments')
        .select(`
          *,
          user:profiles(pseudo, avatar_url, roles)
        `)
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: false });

      if (data) setComments(data as any);
      setLoading(false);
    }
    loadData();
  }, [subjectId, supabase]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || !currentUser || sending) return;

    setSending(true);
    const { data, error } = await supabase
      .from('subject_comments')
      .insert({
        subject_id: subjectId,
        user_id: currentUser.id,
        content: content.trim()
      })
      .select('*, user:user_id(pseudo, avatar_url)')
      .single();

    if (!error && data) {
      setComments([...comments, data]);
      setContent("");
    }
    setSending(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Supprimer ce commentaire ?")) return;
    const { error } = await supabase.from('subject_comments').delete().eq('id', commentId);
    if (!error) {
      setComments(comments.filter(c => c.id !== commentId));
    }
  };

  const canDelete = (userId: string) => {
    return currentUser?.id === userId || userRole === 'admin' || userRole === 'superadmin';
  };
  const getUserRoleLabel = (roles: string[] | undefined) => {
    const role = roles?.[0] || 'user';
    if (role === 'admin' || role === 'superadmin') return 'Admin';
    if (role === 'validator') return 'Validateur';
    if (role === 'contributor') return 'Contributeur';
    return 'Élève';
  };

  const getRoleBadgeStyles = (roles: string[] | undefined) => {
    const role = roles?.[0] || 'user';
    if (role === 'admin' || role === 'superadmin') return 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800';
    if (role === 'validator') return 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
    if (role === 'contributor') return 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
  };

  if (loading) return <div className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-300" /></div>;

  return (
    <div className="mt-12 border-t border-slate-100 dark:border-slate-800 pt-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600">
            <MessageSquare className="w-6 h-6" />
        </div>
        <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white font-outfit">Discussion & Astuces</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{comments.length} commentaires</p>
        </div>
      </div>

      <div className="space-y-6 mb-10">
        {comments.length > 0 ? comments.map((comment) => (
          <div key={comment.id} className="group flex gap-4">
            <div className="flex-shrink-0">
                {comment.user?.avatar_url ? (
                    <img src={comment.user.avatar_url} className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                        {comment.user?.pseudo?.charAt(0).toUpperCase() || '?'}
                    </div>
                )}
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white">{comment.user?.pseudo}</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                        </span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border ${getRoleBadgeStyles(comment.user?.roles)}`}>
                            {getUserRoleLabel(comment.user?.roles)}
                        </span>
                    </div>
                    {canDelete(comment.user_id) && (
                        <button 
                            onClick={() => handleDelete(comment.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 transition-all cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                </div>
            </div>
          </div>
        )) : (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-400 italic">Pas encore de commentaires. Sois le premier à en laisser un !</p>
            </div>
        )}
      </div>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="relative">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Partage une astuce ou pose une question..."
                className="w-full p-5 pb-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl outline-none focus:border-amber-400 dark:focus:border-amber-500 transition-all text-sm resize-none shadow-xl shadow-slate-200/50 dark:shadow-none"
                rows={3}
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">Entrée pour envoyer</p>
                <button
                    disabled={!content.trim() || sending}
                    className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl hover:bg-amber-500 dark:hover:bg-amber-400 transition-all disabled:opacity-50 cursor-pointer"
                >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
            </div>
        </form>
      ) : (
        <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-100 dark:border-amber-800 text-center">
            <p className="text-sm text-amber-800 dark:text-amber-400 font-bold mb-4">Connecte-toi pour participer à la discussion !</p>
            <Link href="/auth" className="inline-block px-6 py-3 bg-amber-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-amber-500/20">Se connecter</Link>
        </div>
      )}
    </div>
  );
}
