// netlify/functions/blob-helper.js
const { getStore } = require('@netlify/blobs');

let store = null;

async function getBlobStore() {
  if (!store) {
    store = getStore({ name: 'referral-store' });
  }
  return store;
}

async function readBlob(key) {
  const store = await getBlobStore();
  try {
    const data = await store.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

async function writeBlob(key, value) {
  const store = await getBlobStore();
  await store.set(key, JSON.stringify(value));
}

async function deleteBlob(key) {
  const store = await getBlobStore();
  await store.delete(key);
}

module.exports = { readBlob, writeBlob, deleteBlob };