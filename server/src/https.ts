import selfsigned from 'selfsigned';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const CERTS_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../certs');
const CERT_PATH = join(CERTS_DIR, 'cert.pem');
const KEY_PATH = join(CERTS_DIR, 'key.pem');

export function ensureCerts(): { cert: Buffer; key: Buffer } {
  if (!existsSync(CERTS_DIR)) mkdirSync(CERTS_DIR, { recursive: true });

  if (!existsSync(CERT_PATH) || !existsSync(KEY_PATH)) {
    console.log('[https] Gerando certificado auto-assinado...');
    const attrs = [{ name: 'commonName', value: 'antigravity-remote.local' }];
    const pems = selfsigned.generate(attrs, {
      days: 365,
      algorithm: 'sha256',
      keySize: 2048,
    });
    writeFileSync(CERT_PATH, pems.cert);
    writeFileSync(KEY_PATH, pems.private);
    console.log('[https] Certificado gerado em certs/');
  }

  return {
    cert: readFileSync(CERT_PATH),
    key: readFileSync(KEY_PATH),
  };
}
