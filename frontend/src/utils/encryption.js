// Encryption utility using AES encryption
import CryptoJS from 'crypto-js';

// Secret key - In production, this should come from environment variable
const SECRET_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'shopfy-secret-key-2024-change-in-production';

/**
 * Encrypt data before sending to backend
 */
export const encryptData = (data) => {
    try {
        const jsonString = JSON.stringify(data);
        const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        return data;
    }
};

/**
 * Decrypt data received from backend
 */
export const decryptData = (encryptedData) => {
    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Decryption error:', error);
        return encryptedData;
    }
};

/**
 * Generate a random encryption key
 */
export const generateEncryptionKey = () => {
    return CryptoJS.lib.WordArray.random(256 / 8).toString();
};
