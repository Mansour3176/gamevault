'use client';

import { create } from 'zustand';

interface ToastStore {
  toasts: { id: number; msg: string }[];
  addToast: (msg: string) => void;
  removeToast: (id: number) => void;
}

let nextId = 0;

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (msg) => {
    const id = ++nextId;
    set(s => ({ toasts: [...s.toasts, { id, msg }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3500);
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

export function useToast() {
  return useToastStore(s => s.addToast);
}

export function Toaster() {
  const { toasts, removeToast } = useToastStore();
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} onClick={() => removeToast(t.id)}
          className="toast-slide bg-card2 border border-border border-l-[3px] border-l-accent text-gwhite px-5 py-3.5 rounded-md text-sm font-body shadow-xl pointer-events-auto cursor-pointer max-w-xs">
          {t.msg}
        </div>
      ))}
    </div>
  );
}
