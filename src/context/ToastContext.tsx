import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastCtx {
  toast: (message: string, kind?: ToastKind) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = nextId++;
    setToasts((ts) => [...ts.slice(-2), { id, kind, message }]);
    setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const icons: Record<ToastKind, ReactNode> = {
    success: <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0" aria-hidden />,
    error: <AlertCircle className="h-5 w-5 text-red-600 shrink-0" aria-hidden />,
    info: <Info className="h-5 w-5 text-sky-600 shrink-0" aria-hidden />,
  };

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div aria-live="polite" className="fixed bottom-20 md:bottom-6 inset-x-0 z-[70] flex flex-col items-center gap-2 px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              className="pointer-events-auto flex items-center gap-3 rounded-xl bg-ink-900 text-white shadow-lift px-4 py-3 max-w-md w-full sm:w-auto"
              role="status"
            >
              {icons[t.kind]}
              <p className="text-sm font-medium flex-1">{t.message}</p>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-white/60 hover:text-white transition-colors">
                <X className="h-4 w-4" aria-hidden />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  return useContext(Ctx);
}
