import { useState } from 'preact/hooks';
import { apiFetch } from '../hooks/useApi';

const COMMON_MODELS = [
  { id: 'claude-3-7-sonnet', label: 'Claude 3.7 Sonnet' },
  { id: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  { id: 'deepseek-coder', label: 'DeepSeek Coder V2' },
  { id: 'gpt-4o', label: 'GPT-4o' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { id: 'o1-preview', label: 'OpenAI o1' },
];

interface Props {
  currentModel: string;
  onClose: () => void;
}

export function ModelSelector({ currentModel, onClose }: Props) {
  const [customModel, setCustomModel] = useState('');
  const [loading, setLoading] = useState(false);

  const selectModel = async (model: string) => {
    setLoading(true);
    try {
      await apiFetch('/api/chat/model', {
        method: 'POST',
        body: JSON.stringify({ model }),
      });
      // Fechar imediatamente após o pedido "sucesso"
      onClose();
    } catch {
      alert('Falha ao alterar modelo. O Antigravity IDE pode não estar respondendo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 60, display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease-out' }}
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{ marginTop: 'auto', background: 'var(--color-bg)', borderTop: '0.5px solid var(--color-border)', borderRadius: '24px 24px 0 0', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '22px', color: 'var(--color-text)' }}>Selecionar Modelo</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-dim)', fontSize: '20px', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {COMMON_MODELS.map(m => {
            const active = currentModel.toLowerCase().includes(m.id) || currentModel.toLowerCase().includes(m.label.toLowerCase());
            return (
              <button
                key={m.id}
                onClick={() => selectModel(m.label)} // Send label to search for in dropdown
                disabled={loading}
                style={{
                  padding: '12px 14px', borderRadius: '12px', textAlign: 'left',
                  background: active ? 'var(--color-accent-soft)' : 'var(--color-bg-alt)',
                  border: `0.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border-2)'}`,
                  color: active ? 'var(--color-accent)' : 'var(--color-text)',
                  fontSize: '13px', fontWeight: active ? 600 : 400, cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <input 
            value={customModel}
            onInput={(e) => setCustomModel((e.target as HTMLInputElement).value)}
            placeholder="Nome específico..."
            style={{ flex: 1, background: 'var(--color-bg-3)', border: '0.5px solid var(--color-border-2)', borderRadius: '12px', padding: '12px 14px', color: 'var(--color-text)', fontSize: '13px', outline: 'none' }}
          />
          <button
            onClick={() => selectModel(customModel)}
            disabled={!customModel.trim() || loading}
            style={{ padding: '0 20px', background: customModel.trim() ? 'var(--color-accent)' : 'var(--color-bg-alt)', border: 'none', borderRadius: '12px', color: customModel.trim() ? '#fff' : 'var(--color-text-dim)', fontWeight: 600, fontSize: '13px', cursor: customModel.trim() ? 'pointer' : 'not-allowed' }}
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
