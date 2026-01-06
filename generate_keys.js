import CryptoJS from 'crypto-js';

const SALT = 'logix-salt';

const encryptKey = (privateKey) => {
    return CryptoJS.AES.encrypt(privateKey, SALT).toString();
};

const keys = {
    ADMIN: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    BUYER: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    DRIVER: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca8713bd4c12d45a90e3f0d'
};

console.log('ADMIN_ENCRYPTED_KEY=' + encryptKey(keys.ADMIN));
console.log('BUYER_ENCRYPTED_KEY=' + encryptKey(keys.BUYER));
console.log('DRIVER_ENCRYPTED_KEY=' + encryptKey(keys.DRIVER));
