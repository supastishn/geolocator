import { writable } from 'svelte/store';
import { Client, Account } from 'appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('geolocatr');

export const account = new Account(client);
export const auth = writable(null);

// Check session on initialization
account.get().then(user => auth.set(user)).catch(() => auth.set(null));

export const login = async (email, password) => {
  await account.createEmailSession(email, password);
  auth.set(await account.get());
};

export const register = async (email, password, name) => {
  await account.create('unique()', email, password, name);
  await login(email, password);
};

export const logout = async () => {
  await account.deleteSession('current');
  auth.set(null);
};
