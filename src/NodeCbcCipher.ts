import {
  AbstractCbcCipher,
  CbcDecryptInternalParams,
  CbcEncryptInternalParams,
  GenerateTagParams,
  RandomBytes,
} from 'aes-universal';
import crypto from 'crypto';

/**
 * Node.js implementation of CBC cipher using crypto module
 */
export class NodeCbcCipher extends AbstractCbcCipher {
  /**
   * Creates a new NodeCbcCipher instance
   * @param randomBytes - Function to generate random bytes
   */
  constructor(randomBytes: RandomBytes) {
    super(randomBytes);
  }

  /**
   * Encrypts data using AES-CBC
   * @param encRawKey - Raw encryption key
   * @param iv - Initialization vector
   * @param plaintext - Data to encrypt
   * @returns Encrypted data as Uint8Array
   */
  encryptInternal = async ({
    encRawKey,
    iv,
    plaintext,
  }: CbcEncryptInternalParams): Promise<Uint8Array> => {
    const keyLength = encRawKey.length * 8;
    const nodeCipher = crypto.createCipheriv(
      `aes-${keyLength}-cbc`,
      encRawKey,
      iv,
    );
    const nodeResult = Buffer.concat([
      nodeCipher.update(plaintext),
      nodeCipher.final(),
    ]);

    return new Uint8Array(nodeResult);
  };

  /**
   * Decrypts data using AES-CBC
   * @param encRawKey - Raw encryption key
   * @param iv - Initialization vector
   * @param ciphertext - Data to decrypt
   * @returns Decrypted data as Uint8Array
   */
  decryptInternal = async ({
    encRawKey,
    iv,
    ciphertext,
  }: CbcDecryptInternalParams): Promise<Uint8Array> => {
    const keyLength = encRawKey.length * 8;
    const nodeDecipher = crypto.createDecipheriv(
      `aes-${keyLength}-cbc`,
      encRawKey,
      iv,
    );
    const nodeResult = Buffer.concat([
      nodeDecipher.update(ciphertext),
      nodeDecipher.final(),
    ]);

    return new Uint8Array(nodeResult);
  };

  /**
   * Generates an HMAC tag for message authentication
   * @param macRawKey - Raw key for HMAC
   * @param macData - Data to authenticate
   * @param keyBitLength - The length of the key in bits
   * @returns HMAC tag as Uint8Array
   */
  generateTag = async ({
    macRawKey,
    macData,
    keyBitLength,
  }: GenerateTagParams): Promise<Uint8Array> => {
    const hash = `sha${keyBitLength << 1}` as 'sha256' | 'sha384' | 'sha512';
    const hmac = crypto.createHmac(hash, macRawKey);
    hmac.update(macData);
    return new Uint8Array(hmac.digest()).slice(0, keyBitLength >>> 3);
  };
}
