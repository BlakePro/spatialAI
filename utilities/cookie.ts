import { to } from '@utilities/tools';

export const cookie = {
  name: to.string(process.env.cookieName),
  get: (name: string) => {
    const cookies = document.cookie.split(';').map((cookie) => cookie.trim().split('='));
    for (const [cookieName, cookieValue] of cookies) {
      if (cookieName === name) {
        return to.string(cookieValue);
      }
    }
    return '';
  },
  set: (name: string, value: string, expirationDays = 1) => {
    const date = new Date();
    date.setTime(date.getTime() + expirationDays * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
  },
  remove: (name: string) => {
    const date = new Date();
    date.setTime(date.getTime() - 1);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=;${expires};path=/`;
  },
};
