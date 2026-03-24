import { useState, useEffect, useRef } from 'preact/hooks';
import { useVoice } from '../hooks/useVoice';

interface Props {
  onClose: () => void;
  onImprove: (text: string) => void;
  onSend: (text: string) => void;
}

export function VoiceInput({ onClose, onImprove, onSend }: Props) {
  const { transcript, listening, volume, start, stop, reset } = useVoice();
  const hasText = transcript.trim().length > 0;
  const barCount = 24;

  // Auto-start
  useEffect(() => { start(); return () => stop(); }, []);

  // Waveform bars — each gets a random-ish height driven by volume
  const bars = Array.from({ length: barCount }, (_, i) => {
    const phase = (i / barCount) * Math.PI * 2;
    const base = 0.15 + Math.abs(Math.sin(phase)) * 0.3;
    const h = listening ? Math.min(1, base + volume * (0.4 + Math.abs(Math.sin(phase * 3)) * 0.5)) : base * 0.4;
    return Math.round(h * 40);
  });

  return (
    // Full-screen overlay
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease-out' }}>
      
      {/* Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', gap: '32px' }}>
        
        {/* Status */}
        <p style={{ fontSize: '13px', color: 'var(--color-text-dim)', letterSpacing: '0.08em', textTransform: 'lowercase', margin: 0 }}>
          {listening ? 'ouvindo · para após silêncio' : 'parado · toque para gravar'}
        </p>

        {/* Mic button */}
        <div style={{ position: 'relative' }}>
          {/* Pulse rings */}
          {listening && [1, 2].map(i => (
            <div key={i} style={{ position: 'absolute', inset: `-${i * 14}px`, borderRadius: '50%', border: `1px solid rgba(242,110,34,${0.15 / i})`, animation: 'pulse 2s ease-in-out infinite', animationDelay: `${i * 0.4}s` }} />
          ))}
          <button
            onClick={listening ? stop : start}
            style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: listening ? 'var(--color-accent)' : 'var(--color-bg-3)',
              border: `0.5px solid ${listening ? 'var(--color-accent)' : 'var(--color-border-2)'}`,
              boxShadow: listening ? '0 0 40px var(--color-accent-glow)' : 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
              <rect x="9" y="2" width="6" height="11" rx="3"/>
              <path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6"/>
            </svg>
          </button>
        </div>

        {/* Waveform */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '48px' }}>
          {bars.map((h, i) => (
            <div
              key={i}
              style={{
                width: '3px', height: `${Math.max(4, h)}px`, borderRadius: '2px',
                background: listening ? 'var(--color-accent)' : 'var(--color-text-dim)',
                opacity: listening ? 0.7 + (h / 40) * 0.3 : 0.3,
                transition: 'height 0.1s ease-out, opacity 0.1s',
              }}
            />
          ))}
        </div>

        {/* Transcript */}
        {hasText && (
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '17px', color: 'var(--color-text)', textAlign: 'center', lineHeight: 1.5, margin: 0, maxWidth: '280px', animation: 'fadeIn 0.2s ease-out' }}>
            "{transcript}"
          </p>
        )}
        {!hasText && (
          <p style={{ fontSize: '12px', color: 'var(--color-text-dim)', textAlign: 'center', margin: 0 }}>
            {listening ? '' : '0:00 · toque • para melhorar'}
          </p>
        )}
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', gap: '12px', padding: '16px 24px', paddingBottom: 'max(env(safe-area-inset-bottom), 24px)', borderTop: '0.5px solid var(--color-border)' }}>
        <button
          onClick={() => { reset(); onClose(); }}
          style={{ flex: 1, padding: '14px', borderRadius: '14px', background: 'var(--color-bg-3)', border: '0.5px solid var(--color-border-2)', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
        >
          Descartar
        </button>
        {hasText && (
          <>
            <button
              onClick={() => { stop(); onImprove(transcript); }}
              style={{ flex: 1, padding: '14px', borderRadius: '14px', background: 'var(--color-accent-soft)', border: '0.5px solid var(--color-accent-glow)', color: 'var(--color-accent)', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              ★ Melhorar
            </button>
            <button
              onClick={() => { stop(); onSend(transcript); }}
              style={{ flex: 1, padding: '14px', borderRadius: '14px', background: 'var(--color-accent)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 16px var(--color-accent-glow)' }}
            >
              Enviar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
