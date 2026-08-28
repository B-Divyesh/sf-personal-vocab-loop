export type Phrase = {
  id: string;
  word: string;
  sentence: string;
  tag: string;
  createdAt: string;
  updatedAt: string;
  reviewStage: number;
  nextReview: string;
  lastReviewed?: string;
  audio?: Blob;
};

export const REAL_DATABASE = 'personal-vocab-loop';
export const DEMO_DATABASE = 'demo:personal-vocab-loop';
let databaseName = REAL_DATABASE;
const STORE = 'phrases';

export function useDatabase(name: typeof REAL_DATABASE | typeof DEMO_DATABASE): void {
  databaseName = name;
}

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Your device could not open its local phrase library.'));
  });
}

export async function allPhrases(): Promise<Phrase[]> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readonly');
    const request = transaction.objectStore(STORE).getAll();
    request.onsuccess = () => resolve((request.result as Phrase[]).sort((a, b) => a.nextReview.localeCompare(b.nextReview)));
    request.onerror = () => reject(new Error('Your phrases could not be read. Try exporting any visible data and reopening the app.'));
  });
}

export async function savePhrase(phrase: Phrase): Promise<void> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(phrase);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error('This phrase was not saved. Check available device storage and try again.'));
  });
}

export async function removePhrase(id: string): Promise<void> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error('This phrase could not be deleted.'));
  });
}

export async function replacePhrases(phrases: Phrase[]): Promise<void> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    const store = transaction.objectStore(STORE);
    phrases.forEach((phrase) => store.put(phrase));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error('Imported phrases could not be saved.'));
  });
}

export async function clearPhrases(): Promise<void> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).clear();
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error('The sample phrases could not be reset.'));
  });
}
