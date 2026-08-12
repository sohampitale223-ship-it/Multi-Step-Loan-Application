const PASSPHRASE = 'loan-application-demo-passphrase-v1'
const encoder = new TextEncoder()
const decoder = new TextDecoder()

function toBase64(buffer) {
  let binary = ''
  new Uint8Array(buffer).forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}

function fromBase64(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
}

async function getKey() {
  const digest = await window.crypto.subtle.digest('SHA-256', encoder.encode(PASSPHRASE))
  return window.crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

export async function encryptData(data) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await getKey(), encoder.encode(JSON.stringify(data)))
  return { version: 1, iv: toBase64(iv), data: toBase64(encrypted), savedAt: Date.now() }
}

export async function decryptData(payload) {
  try {
    if (!payload || payload.version !== 1 || typeof payload.iv !== 'string' || typeof payload.data !== 'string') return null
    const decrypted = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(payload.iv) }, await getKey(), fromBase64(payload.data))
    return JSON.parse(decoder.decode(decrypted))
  } catch { return null }
}
