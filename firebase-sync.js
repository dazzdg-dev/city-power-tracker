import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithRedirect, signOut } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import { getFirestore, collection, getDocs, onSnapshot, writeBatch, doc } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCFYecrtQoQR7SRcx4rIbdVwekBb-y2hBM',
  authDomain: 'city-power-tracker-sync.firebaseapp.com',
  projectId: 'city-power-tracker-sync',
  storageBucket: 'city-power-tracker-sync.firebasestorage.app',
  messagingSenderId: '286218156765',
  appId: '1:286218156765:web:367a29baf9260fbbdc7934'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const KEY = 'city-power-tracker-purchases-v1';
const status = document.querySelector('#sync-status');
const connect = document.querySelector('#connect-google');
const disconnect = document.querySelector('#disconnect-google');
let activeUid = null;
let syncReady = false;
let stopListening = null;
let writeQueue = Promise.resolve();

function show(message, isError = false) {
  status.textContent = message;
  status.style.color = isError ? '#a2341d' : '';
}

function getLocal() {
  try {
    const records = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

function fingerprint(p) {
  return [p.date, Number(p.amount), Number(p.units), Number(p.vat || 0), p.notes || ''].join('|');
}

function announceCloud(records) {
  localStorage.setItem(KEY, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent('tracker-cloud-changed', { detail: records }));
}

function purchasesRef(uid = activeUid) {
  return collection(db, 'users', uid, 'purchases');
}

async function mergeInitial(uid) {
  const ref = purchasesRef(uid);
  const server = await getDocs(ref);
  const merged = new Map(server.docs.map(item => [item.id, { id: item.id, ...item.data() }]));
  const fingerprints = new Set([...merged.values()].map(fingerprint));
  for (const purchase of getLocal()) {
    if (!purchase?.id) continue;
    const existing = merged.get(purchase.id);
    if (existing) continue;
    const fp = fingerprint(purchase);
    if (fingerprints.has(fp)) continue;
    merged.set(purchase.id, purchase);
    fingerprints.add(fp);
  }

  const batch = writeBatch(db);
  for (const purchase of merged.values()) {
    batch.set(doc(ref, purchase.id), purchase);
  }
  await batch.commit();
  announceCloud([...merged.values()]);
  syncReady = true;
  show(`Sync on · ${auth.currentUser.email}`);

  if (stopListening) stopListening();
  stopListening = onSnapshot(ref, snapshot => {
    const records = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    announceCloud(records);
    show(`Sync on · ${auth.currentUser?.email || 'Google account'}`);
  }, error => show(`Sync paused: ${error.message}`, true));
}

async function reconcileLocal(records, deletedIds = []) {
  if (!syncReady || !activeUid) return;
  const uid = activeUid;
  const ref = purchasesRef(uid);
  const batch = writeBatch(db);
  for (const purchase of records) batch.set(doc(ref, purchase.id), purchase);
  for (const id of deletedIds) batch.delete(doc(ref, id));
  await batch.commit();
}

connect.addEventListener('click', async () => {
  show('Opening Google sign-in…');
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    show(`Could not start Google sign-in: ${error.message}`, true);
  }
});

disconnect.addEventListener('click', async () => {
  show('Signing out…');
  try {
    await signOut(auth);
  } catch (error) {
    show(`Could not sign out: ${error.message}`, true);
  }
});

window.addEventListener('tracker-local-changed', event => {
  if (!syncReady || !activeUid) return;
  const { records, deletedIds = [] } = event.detail || {};
  writeQueue = writeQueue.then(() => reconcileLocal(records || [], deletedIds)).catch(error => {
    show(`Saved on this device; cloud sync failed: ${error.message}`, true);
  });
});

onAuthStateChanged(auth, async user => {
  connect.hidden = Boolean(user);
  disconnect.hidden = !user;
  if (stopListening) stopListening();
  stopListening = null;
  syncReady = false;
  activeUid = user?.uid || null;
  if (!user) {
    show('Sync is off. Your records stay on this device.');
    return;
  }
  show(`Connecting securely as ${user.email || 'your Google account'}…`);
  try {
    await mergeInitial(user.uid);
  } catch (error) {
    show(`Could not sync. Your device copy is still saved: ${error.message}`, true);
  }
});
