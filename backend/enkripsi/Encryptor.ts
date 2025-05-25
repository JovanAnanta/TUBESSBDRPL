import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = Buffer.from('your-secret-key-must-be-32chars!', 'utf-8');

// IV dibuat dari hash input agar selalu sama
function generateIVFromInput(input: string): Buffer {
  return crypto.createHash('md5').update(input).digest(); // 16 bytes
}

export function encrypt(text: string): string {
  const iv = generateIVFromInput(text); // deterministik
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return encrypted.toString('hex');
}

export function decrypt(text: string): string {
  const iv = generateIVFromInput(text); // sama seperti saat encrypt
  const encryptedText = Buffer.from(text, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString();
}

export const safeDecrypt = (val: string): string => {
  try {
    return decrypt(val);
  } catch {
    return val; // fallback to raw value if decryption fails
  }
};
