/**
 * Módulo de Criptografia
 *
 * Usa AES-256-GCM para criptografar tokens sensíveis
 * NUNCA exponha tokens não criptografados para o frontend
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Gera chave derivada do secret usando PBKDF2
 */
function getKey(salt: Buffer): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;

  if (!secret) {
    throw new Error('ENCRYPTION_SECRET não configurado');
  }

  return crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha256');
}

/**
 * Criptografa texto usando AES-256-GCM
 *
 * @param text - Texto para criptografar (ex: access token)
 * @returns String base64 no formato: salt:iv:authTag:encrypted
 */
export function encrypt(text: string): string {
  try {
    // Gerar salt e IV aleatórios
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    // Derivar chave do secret + salt
    const key = getKey(salt);

    // Criar cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Criptografar
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Pegar auth tag
    const authTag = cipher.getAuthTag();

    // Retornar tudo junto separado por ':'
    return [
      salt.toString('base64'),
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted,
    ].join(':');
  } catch (error: any) {
    console.error('❌ Erro ao criptografar:', error);
    throw new Error('Falha na criptografia');
  }
}

/**
 * Descriptografa texto criptografado
 *
 * @param encryptedData - String no formato: salt:iv:authTag:encrypted
 * @returns Texto original descriptografado
 */
export function decrypt(encryptedData: string): string {
  try {
    // Separar componentes
    const parts = encryptedData.split(':');

    if (parts.length !== 4) {
      throw new Error('Formato inválido de dado criptografado');
    }

    const [saltB64, ivB64, authTagB64, encrypted] = parts;

    // Converter de base64 para Buffer
    const salt = Buffer.from(saltB64, 'base64');
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');

    // Derivar chave
    const key = getKey(salt);

    // Criar decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Descriptografar
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error: any) {
    console.error('❌ Erro ao descriptografar:', error);
    throw new Error('Falha na descriptografia');
  }
}

/**
 * Valida se uma string está criptografada corretamente
 */
export function isEncrypted(data: string): boolean {
  const parts = data.split(':');
  return parts.length === 4;
}

/**
 * Gera ENCRYPTION_SECRET aleatório (usar apenas uma vez)
 * Execute: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
export function generateEncryptionSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}
