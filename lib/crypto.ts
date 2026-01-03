import CryptoJS from 'crypto-js';

const SALT = process.env.NEXT_PUBLIC_LOGIX_SALT || 'logix-salt';

export const encryptKey = (privateKey: string) => {
    return CryptoJS.AES.encrypt(privateKey, SALT).toString();
};

export const decryptKey = (encryptedKey: string) => {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, SALT);
    return bytes.toString(CryptoJS.enc.Utf8);
};

export const encryptHash = (hash: string) => {
    return CryptoJS.AES.encrypt(hash, SALT).toString();
};

export const decryptHash = (encryptedHash: string) => {
    const bytes = CryptoJS.AES.decrypt(encryptedHash, SALT);
    return bytes.toString(CryptoJS.enc.Utf8);
};
