"use client";

import { useEffect, useState } from "react";
import { Bell, X, Info, AlertTriangle, CheckCircle2, Sparkles, Trash2 } from "lucide-react";
import { getNotifications, markNotificationAsRead, deleteNotification, type Notification } from "@/app/actions/notifications";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    loadNotifications();

    // Real-time subscription for new notifications
    const channel = supabase
      .channel("new_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadNotifications() {
    const data = await getNotifications();
    setNotifications(data);
    setUnreadCount(data.filter(n => !n.is_read).length);
  }

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => notifications.find(n => n.id === id && !n.is_read) ? prev - 1 : prev);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'grit': return <Sparkles className="w-4 h-4 text-violet-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all relative cursor-pointer ${isOpen ? "ring-4 ring-slate-100 border-slate-300" : ""}`}
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce-soft border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-scale-in">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{unreadCount} non lues</span>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-slate-200" />
                  </div>
                  <p className="text-sm text-slate-400">Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id)}
                      className={`group p-4 flex gap-4 cursor-pointer transition-colors ${!n.is_read ? "bg-blue-50/30" : "hover:bg-slate-50"}`}
                    >
                      <div className="mt-1 flex-shrink-0">
                        {getTypeIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug mb-1 ${!n.is_read ? "font-bold text-slate-900" : "text-slate-600"}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {n.content}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">
                          {new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => handleDelete(e, n.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all self-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] font-bold text-slate-500 uppercase hover:text-slate-900 transition-colors"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
