// import { env } from 'cloudflare:test'
import { describe, it, expect } from 'vitest'
import app from '../index'

describe('Example', () => {
  it('Should return 200 response', async () => {
    const res = await app.request('/', {})

    expect(res.status).toBe(200)
  })
})