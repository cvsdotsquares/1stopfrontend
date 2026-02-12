import CryptoJS from 'crypto-js';

const AES_SECRET_KEY = 'DYhG93b0qyJuIp4kjlN8ltP9lj0wvniR2G0FgaC9mi';

export const encryptPassword = (password: string): string => {
  return CryptoJS.AES.encrypt(password, AES_SECRET_KEY).toString();
};
