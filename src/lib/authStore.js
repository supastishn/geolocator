import { writable } from 'svelte/store';
import { Client, Account, Functions } from 'appwrite';
import { base } from '$app/paths';

export const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('geolocatr');

export const account = new Account(client);
export const functions = new Functions(client);
export const auth = writable(null);

// Check session on initialization
account.get().then(user => auth.set(user)).catch(() => auth.set(null));

export const login = async (email, password) => {
  await account.createEmailPasswordSession(email, password);
  auth.set(await account.get());
};

export const register = async (email, password, name) => {
  const user = await account.create('unique()', email, password, name);
  await account.createEmailPasswordSession(email, password);
  auth.set(await account.get());  // Set auth to the logged-in user object
};

export const logout = async () => {
  await account.deleteSession('current');
  auth.set(null);
  // Add window.location redirect with base
  window.location.href = window.location.origin + base + '/';
};
