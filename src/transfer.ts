import type { Phrase } from './db';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const arrayBuffer = (bytes: Uint8Array): ArrayBuffer => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

type ExportPhrase = Omit<Phrase, 'audio'> & { audio?: { type: string; data: string } };
export type Backup = { version: 1; exportedAt: string; phrases: ExportPhrase[] };

function base64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

export async function makeBackup(phrases: Phrase[]): Promise<Backup> {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    phrases: await Promise.all(phrases.map(async ({ audio, ...phrase }) => ({
      ...phrase,
      ...(audio ? { audio: { type: audio.type, data: base64(new Uint8Array(await audio.arrayBuffer())) } } : {})
    })))
  };
}

export async function readBackup(value: unknown): Promise<Phrase[]> {
  const backup = value as Partial<Backup>;
  if (backup.version !== 1 || !Array.isArray(backup.phrases)) throw new Error('That is not a Personal Vocab Loop backup.');
  return backup.phrases.map(({ audio, ...phrase }) => {
    if (!phrase.id || !phrase.word || !phrase.sentence || !phrase.nextReview) throw new Error('A phrase in this backup is incomplete.');
    return { ...phrase, tag: phrase.tag || 'general', reviewStage: Number(phrase.reviewStage) || 0, audio: audio ? new Blob([arrayBuffer(fromBase64(audio.data))], { type: audio.type }) : undefined } as Phrase;
  });
}

async function keyFor(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: arrayBuffer(salt), iterations: 120000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function encryptBackup(backup: Backup, password: string): Promise<string> {
  if (password.length < 8) throw new Error('Choose a passphrase of at least 8 characters.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await keyFor(password, salt), encoder.encode(JSON.stringify(backup)));
  return JSON.stringify({ format: 'personal-vocab-loop-encrypted', version: 1, salt: base64(salt), iv: base64(iv), data: base64(new Uint8Array(encrypted)) }, null, 2);
}

export async function decryptBackup(text: string, password: string): Promise<Phrase[]> {
  const encrypted = JSON.parse(text) as { format?: string; salt?: string; iv?: string; data?: string };
  if (encrypted.format !== 'personal-vocab-loop-encrypted' || !encrypted.salt || !encrypted.iv || !encrypted.data) throw new Error('This is not an encrypted Vocab Loop backup.');
  try {
    const result = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: arrayBuffer(fromBase64(encrypted.iv)) }, await keyFor(password, fromBase64(encrypted.salt)), arrayBuffer(fromBase64(encrypted.data)));
    return readBackup(JSON.parse(decoder.decode(result)));
  } catch {
    throw new Error('That passphrase did not unlock this backup.');
  }
}

export function csvFor(phrases: Phrase[]): string {
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  return ['word,sentence,tag,created_at,next_review,review_stage,has_recording', ...phrases.map((phrase) => [phrase.word, phrase.sentence, phrase.tag, phrase.createdAt, phrase.nextReview, phrase.reviewStage, Boolean(phrase.audio)].map((value) => escape(String(value))).join(','))].join('\n');
}
