import { describe, expect, it } from 'vitest'
import { decryptData, encryptData } from './encryption'

describe('AES-GCM encryption', () => {
  it('round trips data without exposing plaintext and uses a fresh IV', async () => {
    const value = { pan: 'ABCPD1234F', amount: 500001 }
    const first = await encryptData(value)
    const second = await encryptData(value)
    expect(JSON.stringify(first)).not.toContain(value.pan)
    expect(first.iv).toBeTruthy()
    expect(first.iv).not.toBe(second.iv)
    expect(await decryptData(first)).toEqual(value)
  })

  it('returns null for corrupted encrypted data', async () => {
    expect(await decryptData({ version: 1, iv: 'bad', data: 'bad' })).toBeNull()
  })
})
