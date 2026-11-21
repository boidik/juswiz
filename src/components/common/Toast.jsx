import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  const isSuccess = toastMessage.type === 'success';
  const isError = toastMessage.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-m3-xl shadow-m3-3 bg-material-on-surface text-material-surface animate-fade-in max-w-md border border-neutral-700">
      {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
      {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
      {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
      
      <p className="text-sm font-medium leading-relaxed">{toastMessage.message}</p>
    </div>
  );
};
