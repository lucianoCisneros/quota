import { createDecipheriv, createCipheriv, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

/**
 * Retrieve the master encryption key from environment variables.
 * Throws if not configured — this is intentional to fail fast.
 */
function getEncryptionKey(): Buffer {
  const key = process.env.MP_TOKEN_ENCRYPTION_KEY
  if (!key) {
    throw new Error(
      'MP_TOKEN_ENCRYPTION_KEY no está configurada. ' +
        'Generala con: openssl rand -hex 32',
    )
  }
  return Buffer.from(key, 'hex')
}

/**
 * Encrypt a plaintext string (Mercado Pago access/refresh token)
 * using AES-256-GCM.
 *
 * Output format: base64( iv (12 bytes) + ciphertext + authTag (16 bytes) )
 *
 * @param plaintext - The token string to encrypt
 * @returns Base64-encoded ciphertext
 */
export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf-8'),
    cipher.final(),
  ])

  const authTag = cipher.getAuthTag()

  // Concatenate: iv + ciphertext + authTag
  return Buffer.concat([iv, encrypted, authTag]).toString('base64')
}

/**
 * Decrypt a previously encrypted token.
 *
 * @param ciphertext - Base64-encoded encrypted data (iv + ciphertext + authTag)
 * @returns The original plaintext token string
 */
export function decryptToken(ciphertext: string): string {
  const key = getEncryptionKey()
  const raw = Buffer.from(ciphertext, 'base64')

  if (raw.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Formato de token encriptado inválido')
  }

  const iv = raw.subarray(0, IV_LENGTH)
  const authTag = raw.subarray(raw.length - AUTH_TAG_LENGTH)
  const encrypted = raw.subarray(IV_LENGTH, raw.length - AUTH_TAG_LENGTH)

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ])

  return decrypted.toString('utf-8')
}

/**
 * Check if the MP_TOKEN_ENCRYPTION_KEY is configured.
 * Useful for conditional UI rendering.
 */
export function isEncryptionConfigured(): boolean {
  return Boolean(process.env.MP_TOKEN_ENCRYPTION_KEY)
}
