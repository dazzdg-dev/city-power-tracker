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

// Match the legacy tracker key so records already saved on the laptop are
// picked up on the first Google connection without changing or clearing them.
const KEY = 'city_power_tracker_v1';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const status = document.querySelector('#sync-status');
const connect = document.querySelector('#connect-google');
const disconnect = document.querySelector('#disconnect-google');
let activeUid = null;
let syncReady = false;
let stopListening = null;
let writeQueue = Promise.resolve();

function show(message, isError = false) {
  status.textContent = message;
  status.style.color = isError ? '#a23418' : '';
}

function localRecords() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function signature(record) {
  return JSON.stringify([
    record.date || '', record.time || '', record.provider || '', record.payment || '',
    Number(record.amount || 0), Number(record.vat || 0), Number(record.units || 0),
    record.meter || '', record.reference || '', record.token || '', record.notes || ''
  ]);
}

function recordsRef(uid = activeUid) {
  return collection(db, 'users', uid, 'purchases');
}

function publishCloud(records) {
  localStorage.setItem(KEY, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent('tracker-cloud-changed', { detail: records }));
}

async function commitInChunks(ref, records, deletedIds = []) {
  const operations = [
    ...records.map(record => ({ kind: 'set', record })),
    ...deletedIds.map(id => ({ kind: 'delete', id }))
  ];
  for (let start = 0; start < operations.length; start += 400) {
    const batch = writeBatch(db);
    for (const operation of operations.slice(start, start + 400)) {
      if (operation.kind === 'set') batch.set(doc(ref, operation.record.id), operation.record);
      else batch.delete(doc(ref, operation.id));
    }
    await batch.commit();
  }
}

async function mergeFirstConnection(uid) {
  const ref = recordsRef(uid);
  const snapshot = await getDocs(ref);
  const merged = new Map(snapshot.docs.map(item => [item.id, { id: item.id, ...item.data() }]));
  const signatures = new Set([...merged.values()].map(signature));

  for (const local of localRecords()) {
    if (!local || !local.id) continue;
    const remote = merged.get(local.id);
    if (remote) {
      const localTime = Date.parse(local.createdAt || '') || 0;
      const remoteTime = Date.parse(remote.createdAt || '') || 0;
      if (localTime > remoteTime) merged.set(local.id, local);
      continue;
    }
    const key = signature(local);
    if (!signatures.has(key)) {
      merged.set(local.id, local);
      signatures.add(key);
    }
  }

  const records = [...merged.values()];
  await commitInChunks(ref, records);
  publishCloud(records);
  activeUid = uid;
  syncReady = true;
  show(`Sync on · ${auth.currentUser?.email || 'Google account'}`);

  if (stopListening) stopListening();
  stopListening = onSnapshot(ref, cloudSnapshot => {
    const latest = cloudSnapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    publishCloud(latest);
    show(`Sync on · ${auth.currentUser?.email || 'Google account'}`);
  }, error => show(`Cloud sync paused: ${error.message}`, true));
}

async function writeLocalChanges(records, deletedIds = []) {
  if (!syncReady || !activeUid) return;
  await commitInChunks(recordsRef(activeUid), records, deletedIds);
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
  const { records = [], deletedIds = [] } = event.detail || {};
  writeQueue = writeQueue.then(() => writeLocalChanges(records, deletedIds)).catch(error => {
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
    await mergeFirstConnection(user.uid);
  } catch (error) {
    show(`Could not sync. Your device copy is still saved: ${error.message}`, true);
  }
});
