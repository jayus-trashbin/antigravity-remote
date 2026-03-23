import { useEffect, useState } from 'preact/hooks';
import QRCode from 'qrcode';

export function QRConnect() {
  const [qr, setQr] = useState('');
  const url = window.location.origin;

  useEffect(() => {
    QRCode.toDataURL(url, { margin: 2, scale: 8 }, (err, url) => {
      if (!err) setQr(url);
    });
  }, []);

  return (
    <div class="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 class="font-serif text-4xl mb-4">Antigravity Remote</h1>
      <p class="text-text-muted mb-8">Escaneie para conectar seu celular à mesma rede</p>
      
      <div class="p-4 bg-white rounded-2xl mb-8 shadow-xl">
        {qr ? <img src={qr} alt="QR Code" class="w-64 h-64" /> : <div class="w-64 h-64 bg-bg-alt animate-pulse" />}
      </div>
      
      <code class="px-4 py-2 bg-bg-alt border border-border rounded-lg text-sm mb-4">
        {url}
      </code>
      
      <div class="text-xs text-text-muted max-w-xs">
        Dica: Você precisa estar na mesma rede Wi-Fi que este computador.
      </div>
    </div>
  );
}
