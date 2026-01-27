"use client";

import { useState } from "react";
import { 
  MoreVertical, 
  Trash2, 
  Ban, 
  Unlock, 
  User, 
  ShieldCheck, 
  Loader2,
  AlertTriangle,
  X,
  UserCog
} from "lucide-react";
import { deleteUser, toggleBlockUser, updateUserRoles } from "@/app/actions/admin-users";
import { UserRole, ROLE_LABELS } from "@/lib/types/user";
import { Portal } from "@/components/ui/portal";

interface UserActionsMenuProps {
  user: {
    id: string;
    pseudo: string | null;
    is_blocked: boolean;
    roles: UserRole[];
  };
}

export function UserActionsMenu({ user }: UserActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggleBlock = async () => {
    setLoading(true);
    try {
      const result = await toggleBlockUser(user.id, !user.is_blocked);
      if (result.success) {
        setIsOpen(false);
      } else {
        alert(result.error);
      }
    } catch (e) {
      alert("Erreur lors de l'opération");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteUser(user.id);
      if (result.success) {
        setIsOpen(false);
        setShowDeleteConfirm(false);
      } else {
        alert(result.error);
      }
    } catch (e) {
      alert("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (newRole: UserRole) => {
    setLoading(true);
    try {
      const result = await updateUserRoles(user.id, [newRole]);
      if (result.success) {
        setIsOpen(false);
      } else {
        alert(result.error);
      }
    } catch (e) {
      alert("Erreur lors du changement de rôle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 group"
      >
        <UserCog className="w-5 h-5 group-hover:text-indigo-600 transition-colors" />
      </button>

      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-scale-in">
              {/* Header */}
              <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Actions de Gestion</h3>
                  <p className="text-sm text-slate-500 font-medium mt-0.5">Utilisateur : <span className="text-indigo-600 font-bold">{user.pseudo || 'Anonyme'}</span></p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8">
                {/* Horizontal Action Row */}
                <div className="flex flex-wrap gap-4 justify-center">
                  
                  {/* Voir Profil */}
                  <button 
                    onClick={() => { window.location.href = `/admin/users/${user.id}`; }}
                    className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 transition-all group flex-1 min-w-[140px]"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <User className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-indigo-600">Profil</span>
                  </button>

                  {/* Bloquer / Débloquer */}
                  <button 
                    onClick={handleToggleBlock}
                    disabled={loading}
                    className={`flex flex-col items-center gap-3 p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white transition-all group flex-1 min-w-[140px] ${user.is_blocked ? 'hover:border-emerald-200 hover:shadow-emerald-500/10' : 'hover:border-amber-200 hover:shadow-amber-500/10'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${user.is_blocked ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {user.is_blocked ? <Unlock className="w-6 h-6" /> : <Ban className="w-6 h-6" />}
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest ${user.is_blocked ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {user.is_blocked ? 'Débloquer' : 'Bloquer'}
                    </span>
                  </button>

                  {/* Supprimer */}
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-red-50 hover:border-red-200 hover:shadow-xl hover:shadow-red-500/10 transition-all group flex-1 min-w-[140px]"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-red-600">Supprimer</span>
                  </button>
                </div>

                {/* Role Selection Row */}
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6 text-center">Changer le rôle de l'utilisateur</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                      <button 
                        key={role}
                        onClick={() => handleChangeRole(role)}
                        disabled={loading}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${user.roles.includes(role) ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600"}`}
                      >
                        {ROLE_LABELS[role]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {loading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-50">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900">Mise à jour...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Portal>
      )}

      {showDeleteConfirm && (
        <Portal>
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] p-10 max-w-sm w-full shadow-2xl animate-scale-in text-center">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-[24px] flex items-center justify-center mx-auto mb-8">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Supprimer ?</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-10">Cette action supprimera définitivement le compte de <span className="font-bold text-slate-900">{user.pseudo}</span> ainsi que toutes ses données.</p>
              
              <div className="flex gap-4">
                <button 
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all uppercase text-xs tracking-widest"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Annuler
                </button>
                <button 
                  className="flex-1 py-4 rounded-2xl font-black text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Effacer"}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}