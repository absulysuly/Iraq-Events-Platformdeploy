import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircleIcon, XCircleIcon, InfoIcon, XIcon } from './icons';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToasts = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToasts must be used within a ToastProvider');
  }
  return context;
};

const ICONS: Record<ToastType, React.FC<{className?: string}>> = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    info: InfoIcon
};

const COLORS: Record<ToastType, { bg: string, text: string, border: string }> = {
    success: { bg: 'bg-green-500/10', text: 'text-green-300', border: 'border-green-500/30' },
    error: { bg: 'bg-red-500/10', text: 'text-red-300', border: 'border-red-500/30' },
    info: { bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/30' },
};

interface ToastMessageProps {
    toast: Toast;
    onDismiss: (id: number) => void;
}

const ToastMessage: React.FC<ToastMessageProps> = ({ toast, onDismiss }) => {
    const Icon = ICONS[toast.type];
    const color = COLORS[toast.type];
    
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, 5000);

        return () => {
            clearTimeout(timer);
        };
    }, [toast.id, onDismiss]);

    return (
        <div 
            className={`toast-message flex items-start p-4 mb-3 w-full max-w-sm overflow-hidden rounded-lg shadow-lg backdrop-blur-md border ${color.bg} ${color.border}`}
            role="alert"
        >
            <div className="flex items-center">
                 <Icon className={`w-6 h-6 mr-3 ${color.text}`} />
            </div>
            <div className={`flex-1 text-sm font-medium ${color.text}`}>
                {toast.message}
            </div>
             <button onClick={() => onDismiss(toast.id)} className="ml-4 -mr-1 p-1">
                <XIcon className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
        </div>
    )
};


export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div 
        className="fixed top-5 right-5 z-[100] w-full max-w-sm"
        aria-live="assertive"
      >
        {toasts.map(toast => (
          <ToastMessage key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
      <style>{`
        .toast-message {
            animation: toast-in-right 0.5s;
        }

        @keyframes toast-in-right {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
