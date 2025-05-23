import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = Buffer.from('your-secret-key-must-be-32chars!', 'utf-8');

// Use a constant IV for AES-256-CBC (16 bytes of zeros)
const IV = Buffer.alloc(16, 0);

export function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(algorithm, secretKey, IV);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return encrypted.toString('hex'); // IV tidak perlu disimpan karena constant
}

export function decrypt(text: string): string {
  const encryptedText = Buffer.from(text, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, secretKey, IV);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString();
}
