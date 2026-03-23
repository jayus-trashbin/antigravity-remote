import { useState, useRef, useEffect } from 'preact/hooks';

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognition = useRef<any>(null);

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
      };

      recognition.current.onerror = () => setIsListening(false);
      recognition.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggle = () => {
    if (!recognition.current) return alert('Reconhecimento de voz não suportado');
    if (isListening) {
      recognition.current.stop();
    } else {
      setTranscript('');
      recognition.current.start();
      setIsListening(true);
    }
  };

  return { isListening, transcript, toggle, supported: !!recognition.current };
}
