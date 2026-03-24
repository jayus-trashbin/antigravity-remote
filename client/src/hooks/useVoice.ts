import { useState, useRef, useEffect } from 'preact/hooks';

export function useVoice(onSilence?: () => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [volume, setVolume] = useState(0);
  
  const recognition = useRef<any>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyzer = useRef<AnalyserNode | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const silenceTimer = useRef<any>(null);
  const animationFrame = useRef<number>(0);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'pt-BR';

      recognition.current.onresult = (event: any) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
        
        // Reset timeout de silêncio (auto-encerra se configurado)
        if (onSilence) {
          clearTimeout(silenceTimer.current);
          silenceTimer.current = setTimeout(() => {
            stop();
            onSilence();
          }, 4000);
        }
      };

      recognition.current.onerror = () => stop();
      recognition.current.onend = () => stop();
    }
    
    return () => stop();
  }, [onSilence]);

  const monitorVolume = () => {
    if (!analyzer.current) return;
    const array = new Uint8Array(analyzer.current.frequencyBinCount);
    analyzer.current.getByteFrequencyData(array);
    let values = 0;
    const length = array.length;
    for (let i = 0; i < length; i++) values += array[i];
    setVolume(values / length);
    animationFrame.current = requestAnimationFrame(monitorVolume);
  };

  const start = async () => {
    setTranscript('');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = s;
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.current.createMediaStreamSource(s);
      analyzer.current = audioContext.current.createAnalyser();
      analyzer.current.fftSize = 256;
      source.connect(analyzer.current);
      monitorVolume();
      
      recognition.current?.start();
      setIsListening(true);
      
      if (onSilence) {
        clearTimeout(silenceTimer.current);
        silenceTimer.current = setTimeout(() => { stop(); onSilence(); }, 6000);
      }
    } catch {
      alert('Acesso ao microfone negado ou indisponível.');
    }
  };

  const stop = () => {
    setIsListening(false);
    setVolume(0);
    recognition.current?.stop();
    clearTimeout(silenceTimer.current);
    cancelAnimationFrame(animationFrame.current);
    
    stream.current?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
    if (audioContext.current?.state !== 'closed') {
      audioContext.current?.close();
    }
    
    analyzer.current = null;
    audioContext.current = null;
    stream.current = null;
  };

  const toggle = () => {
    if (!recognition.current) return alert('Reconhecimento de voz não suportado neste navegador.');
    if (isListening) stop();
    else start();
  };

  const reset = () => setTranscript('');

  return { 
    listening: isListening, 
    transcript, 
    toggle, 
    volume, 
    start,
    stop, 
    reset,
    supported: !!recognition.current 
  };
}
