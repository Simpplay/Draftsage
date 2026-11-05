import test from 'node:test'
import assert from 'node:assert/strict'
import { createCache } from '../../src/infrastructure/coachless/cache.js'

test('memo: comparte la petición en curso y cachea solo lo cacheable', async () => {
  const c = createCache({ ttlMs: 1000 })
  let calls = 0
  const slow = async () => { calls++; await new Promise((r) => setTimeout(r, 10)); return { ok: true, n: calls } }
  const [a, b] = await Promise.all([c.memo('k', slow, (v) => v.ok), c.memo('k', slow, (v) => v.ok)])
  assert.equal(calls, 1); assert.equal(a, b)
  await c.memo('k', slow, (v) => v.ok); assert.equal(calls, 1)    // vigente
  let fails = 0
  const bad = async () => { fails++; return { ok: false } }
  await c.memo('f', bad, (v) => v.ok); await c.memo('f', bad, (v) => v.ok)
  assert.equal(fails, 2)                                           // los fallos no se cachean
})

test('caducidad y límite de entradas', async () => {
  let t = 0
  const c = createCache({ ttlMs: 100, max: 2, now: () => t })
  c.set('a', 1); c.set('b', 2); c.set('c', 3)
  assert.equal(c.get('a'), undefined); assert.equal(c.get('c'), 3); assert.equal(c.size(), 2)
  t = 101
  assert.equal(c.get('c'), undefined)
})

test('una excepción no deja la clave bloqueada', async () => {
  const c = createCache()
  await assert.rejects(c.memo('x', async () => { throw new Error('boom') }))
  assert.equal(await c.memo('x', async () => 5), 5)
})
