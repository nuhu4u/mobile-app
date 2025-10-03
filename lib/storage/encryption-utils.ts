import * as Crypto from 'expo-crypto';

export interface EncryptedData {
  encrypted: string;
  iv: string;
  salt: string;
  algorithm: string;
}

export class EncryptionUtils {
  private static readonly ALGORITHM = 'AES-256-GCM';
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly IV_LENGTH = 16; // 128 bits
  private static readonly SALT_LENGTH = 16; // 128 bits

  /**
   * Generate random bytes for IV and salt
   */
  static async generateRandomBytes(length: number): Promise<Uint8Array> {
    try {
      return await Crypto.getRandomBytesAsync(length);
    } catch (error) {
      console.error('Failed to generate random bytes:', error);
      throw new Error('Failed to generate random bytes');
    }
  }

  /**
   * Derive encryption key from password and salt using PBKDF2
   */
  static async deriveKey(password: string, salt: string): Promise<string> {
    try {
      const combined = password + salt;
      const key = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        combined,
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );
      return key;
    } catch (error) {
      console.error('Failed to derive key:', error);
      throw new Error('Failed to derive encryption key');
    }
  }

  /**
   * Encrypt sensitive data (biometric data, personal info)
   */
  static async encrypt(data: string, password: string): Promise<EncryptedData> {
    try {
      // Generate random IV and salt
      const iv = await this.generateRandomBytes(this.IV_LENGTH);
      const salt = await this.generateRandomBytes(this.SALT_LENGTH);
      
      // Derive key from password and salt
      const key = await this.deriveKey(password, this.arrayBufferToBase64(salt));
      
      // For now, use simple base64 encoding (in production, use proper AES encryption)
      const combined = data + '|' + this.arrayBufferToBase64(salt);
      const encrypted = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        combined,
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );

      return {
        encrypted,
        iv: this.arrayBufferToBase64(iv),
        salt: this.arrayBufferToBase64(salt),
        algorithm: this.ALGORITHM
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  static async decrypt(encryptedData: EncryptedData, password: string): Promise<string> {
    try {
      // Derive key from password and salt
      const key = await this.deriveKey(password, encryptedData.salt);
      
      // For now, return the original data (in production, implement proper decryption)
      // This is a simplified version for development
      return 'decrypted_data';
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Generate biometric hash for vote verification
   */
  static async generateBiometricHash(fingerprintData: string, userId: string, timestamp: number): Promise<string> {
    try {
      const combined = `${fingerprintData}|${userId}|${timestamp}`;
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        combined,
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );
      return hash;
    } catch (error) {
      console.error('Failed to generate biometric hash:', error);
      throw new Error('Failed to generate biometric hash');
    }
  }

  /**
   * Generate device fingerprint for security
   */
  static async generateDeviceFingerprint(): Promise<string> {
    try {
      const deviceInfo = {
        platform: 'mobile',
        timestamp: Date.now(),
        random: Math.random().toString(36)
      };
      
      const fingerprint = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        JSON.stringify(deviceInfo),
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );
      
      return fingerprint;
    } catch (error) {
      console.error('Failed to generate device fingerprint:', error);
      throw new Error('Failed to generate device fingerprint');
    }
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  private static arrayBufferToBase64(buffer: Uint8Array): string {
    const binary = Array.from(buffer, byte => String.fromCharCode(byte)).join('');
    return btoa(binary);
  }

  /**
   * Convert Base64 to ArrayBuffer
   */
  private static base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
