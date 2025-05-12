import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = Buffer.from('your-secret-key-must-be-32chars!', 'utf-8');

// Buat IV dari input (deterministik, tapi tetap 16 bytes)
function generateIVFromInput(input: string): Buffer {
  return crypto.createHash('md5').update(input).digest(); // 16 bytes
}

export function encrypt(text: string): string {
  const iv = generateIVFromInput(text); // sekarang deterministik
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return encrypted.toString('hex'); // IV tidak perlu disimpan karena bisa direkonstruksi
}

export function decrypt(text: string): string {
  const iv = generateIVFromInput(text); // IV harus konsisten
  const encryptedText = Buffer.from(text, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString();
}
