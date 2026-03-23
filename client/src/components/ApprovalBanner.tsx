import { Check, X, AlertCircle } from 'lucide-preact';

interface PendingApproval {
  text: string;
}

export function ApprovalBanner({ pending, onApprove, onReject }: { 
  pending: PendingApproval | null, 
  onApprove: () => void, 
  onReject: () => void 
}) {
  if (!pending) return null;

  return (
    <div class="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top duration-300">
      <div class="glass p-4 rounded-2xl shadow-2xl flex flex-col gap-4 border-accent/20 bg-accent/5">
        <div class="flex items-start gap-3">
          <div class="p-2 bg-accent/20 rounded-full text-accent mt-0.5">
            <AlertCircle size={20} />
          </div>
          <div class="flex-1">
            <div class="text-xs font-bold text-accent uppercase tracking-wider mb-1">Ação Pendente</div>
            <div class="text-sm text-text leading-relaxed font-medium line-clamp-3">
              {pending.text}
            </div>
          </div>
        </div>
        
        <div class="flex gap-2">
          <button 
            onClick={onApprove}
            class="flex-1 bg-accent hover:bg-accent2 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <Check size={18} /> Aprovar
          </button>
          <button 
            onClick={onReject}
            class="px-6 bg-bg-alt hover:bg-bg3 text-text font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 border border-border"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
