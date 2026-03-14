// Simple encryption for API keys stored in localStorage
// Note: This is obfuscation, not true security. For production, use a backend.

const ENCRYPTION_KEY = 'vibecode-dev-secure-key-2024';

export function encryptApiKey(apiKey: string): string {
  try {
    // Simple XOR encryption with base64 encoding
    const key = ENCRYPTION_KEY;
    let encrypted = '';
    for (let i = 0; i < apiKey.length; i++) {
      const charCode = apiKey.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      encrypted += String.fromCharCode(charCode);
    }
    return btoa(encrypted);
  } catch (error) {
    console.error('Encryption failed:', error);
    return '';
  }
}

export function decryptApiKey(encryptedKey: string): string {
  try {
    const key = ENCRYPTION_KEY;
    const encrypted = atob(encryptedKey);
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      decrypted += String.fromCharCode(charCode);
    }
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}

// Generate a secure random key for additional security
export function generateSecureKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}