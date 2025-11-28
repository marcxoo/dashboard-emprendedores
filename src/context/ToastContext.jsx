import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-dismiss
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
              flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 animate-fade-in
              ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : ''}
              ${toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : ''}
              ${toast.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-200' : ''}
            `}
                    >
                        <span>
                            {toast.type === 'success' && '✅'}
                            {toast.type === 'error' && '❌'}
                            {toast.type === 'info' && 'ℹ️'}
                        </span>
                        {toast.message}
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-4 text-slate-400 hover:text-slate-600"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
