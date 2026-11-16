// In-memory database for the no-database demo.
// It implements the small slice of the Prisma client API this project uses (find/create/update/upsert/count/
// groupBy/aggregate/$transaction, select/include, where with in/not/gt/gte/lt/lte/OR), so every route, rule and
// screen runs unchanged. Data lives in the server process: restarting `npm run dev` resets it to the demo seed.
import crypto from 'crypto';
import { seedDemo } from './demo-seed';

const uuid = () => crypto.randomUUID();
const now = () => new Date();
const MODELS = {
  user:       { defaults: () => ({ id: uuid(), role: 'CITIZEN', coins: 0, createdAt: now() }), unique: ['id', 'phone'] },
  otp:        { defaults: () => ({ attempts: 0, sends: [], profile: null }), unique: ['phone'] },
  submission: { defaults: () => ({ id: uuid(), coins: 0, confidence: null, reason: null, imageData: null, mime: null, createdAt: now(), decidedAt: null, decidedBy: null }), unique: ['id', 'imageHash'] },
  coinTxn:    { defaults: () => ({ id: uuid(), refId: null, note: null, createdAt: now() }), unique: ['id'] },
  shop:       { defaults: () => ({ id: uuid(), status: 'PENDING', offerText: '', coinCost: 20, dailyLimit: 20, paused: false, createdAt: now() }), unique: ['id', 'ownerId'] },
  redemption: { defaults: () => ({ id: uuid(), status: 'PENDING', createdAt: now(), redeemedAt: null }), unique: ['id', 'code'] },
  pickup:     { defaults: () => ({ id: uuid(), note: null, status: 'REQUESTED', workerId: null, assignedAt: null, collectedAt: null, collectedKg: null, verifiedAt: null, verifiedBy: null, coins: 0, createdAt: now() }), unique: ['id'] },
};
// relation name -> [target table, local key, 'one' | 'reverse']
const REL = {
  submission: { user: ['user', 'userId'] }, coinTxn: { user: ['user', 'userId'] }, shop: { owner: ['user', 'ownerId'] },
  redemption: { user: ['user', 'userId'], shop: ['shop', 'shopId'] }, pickup: { user: ['user', 'userId'], worker: ['user', 'workerId'] },
  user: { shop: ['shop', 'ownerId', 'reverse'] },
};
// Enum columns sort by declaration order in Postgres, not alphabetically.
const ENUM_ORDER = { status: ['PENDING', 'APPROVED', 'REJECTED', 'REQUESTED', 'ASSIGNED', 'COLLECTED', 'VERIFIED', 'CANCELLED'] };

const g = globalThis;
if (!g.__mem) { g.__mem = { t: Object.fromEntries(Object.keys(MODELS).map(k => [k, []])), lock: Promise.resolve() }; seedDemo(g.__mem.t); }
const db = g.__mem;

const val = v => (v instanceof Date ? v.getTime() : v);
const eq = (a, b) => (a == null || b == null ? a == b : val(a) === val(b));
const OPS = {
  equals: eq, in: (a, x) => x.some(y => eq(a, y)), notIn: (a, x) => !x.some(y => eq(a, y)), not: (a, x) => !eq(a, x),
  lt: (a, x) => a != null && val(a) < val(x), lte: (a, x) => a != null && val(a) <= val(x),
  gt: (a, x) => a != null && val(a) > val(x), gte: (a, x) => a != null && val(a) >= val(x),
};
function match(row, where = {}) {
  return Object.entries(where).every(([k, c]) => {
    if (c === undefined) return true;
    if (k === 'OR') return c.some(w => match(row, w));
    if (k === 'AND') return [].concat(c).every(w => match(row, w));
    if (k === 'NOT') return ![].concat(c).some(w => match(row, w));
    if (c === null || typeof c !== 'object' || c instanceof Date) return eq(row[k], c);
    return Object.entries(c).every(([op, x]) => { if (!OPS[op]) throw new Error(`demo db: unsupported operator ${op}`); return OPS[op](row[k], x); });
  });
}
function sorter(orderBy) {
  const keys = [].concat(orderBy || []).flatMap(o => Object.entries(o));
  return (a, b) => { for (const [f, dir] of keys) {
    let x = a[f], y = b[f];
    if (ENUM_ORDER[f] && ENUM_ORDER[f].includes(x) && ENUM_ORDER[f].includes(y)) { x = ENUM_ORDER[f].indexOf(x); y = ENUM_ORDER[f].indexOf(y); } else { x = val(x); y = val(y); }
    if (x === y) continue; if (x == null) return 1; if (y == null) return -1;
    return (x < y ? -1 : 1) * (dir === 'desc' ? -1 : 1);
  } return 0; };
}
function relation(model, name, row, args) {
  const [table, key, kind] = REL[model][name];
  const found = kind === 'reverse' ? db.t[table].find(r => r[key] === row.id) : db.t[table].find(r => r.id === row[key]);
  return found ? shape(table, found, args) : null;
}
// Applies select / include and returns a copy, so callers can never mutate stored rows by accident.
function shape(model, row, args = {}) {
  if (!row) return null;
  if (args.select) {
    const out = {};
    for (const [k, v] of Object.entries(args.select)) { if (!v) continue; out[k] = REL[model]?.[k] ? relation(model, k, row, v === true ? {} : v) : row[k]; }
    return out;
  }
  const out = { ...row };
  for (const [k, v] of Object.entries(args.include || {})) if (v) out[k] = relation(model, k, row, v === true ? {} : v);
  return out;
}
function applyData(row, data) {
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue;
    if (v && typeof v === 'object' && !(v instanceof Date) && !Buffer.isBuffer(v) && !Array.isArray(v) && ('increment' in v || 'decrement' in v)) row[k] = (row[k] || 0) + (v.increment || 0) - (v.decrement || 0);
    else row[k] = v;
  }
}
const dup = f => Object.assign(new Error(`Unique constraint failed on ${f}`), { code: 'P2002' });

function table(model) {
  const M = MODELS[model], rows = () => db.t[model];
  const find = where => rows().filter(r => match(r, where));
  const api = {
    findUnique: async a => shape(model, find(a.where)[0], a),
    findFirst: async a => shape(model, find(a.where).sort(sorter(a.orderBy))[0], a),
    findMany: async (a = {}) => { let r = find(a.where).sort(sorter(a.orderBy)); if (a.skip) r = r.slice(a.skip); if (a.take != null) r = r.slice(0, a.take); return r.map(x => shape(model, x, a)); },
    count: async (a = {}) => find(a.where).length,
    create: async a => {
      const row = { ...M.defaults(), ...a.data };
      for (const f of M.unique) if (row[f] != null && rows().some(r => eq(r[f], row[f]))) throw dup(f);
      rows().push(row); return shape(model, row, a);
    },
    update: async a => { const r = find(a.where)[0]; if (!r) throw Object.assign(new Error('Record not found'), { code: 'P2025' }); applyData(r, a.data); return shape(model, r, a); },
    updateMany: async a => { const r = find(a.where); r.forEach(x => applyData(x, a.data)); return { count: r.length }; },
    delete: async a => { const r = find(a.where)[0]; if (!r) throw Object.assign(new Error('Record not found'), { code: 'P2025' }); db.t[model] = rows().filter(x => x !== r); return shape(model, r, a); },
    upsert: async a => (find(a.where)[0] ? api.update({ where: a.where, data: a.update }) : api.create({ data: a.create })),
    aggregate: async a => {
      const r = find(a.where), out = {};
      if (a._sum) out._sum = Object.fromEntries(Object.keys(a._sum).map(f => [f, r.length ? r.reduce((n, x) => n + (x[f] || 0), 0) : null]));
      if (a._count) out._count = r.length;
      return out;
    },
    groupBy: async a => {
      const groups = new Map();
      for (const r of find(a.where)) { const k = JSON.stringify(a.by.map(f => val(r[f]))); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); }
      return [...groups.values()].map(rs => {
        const o = Object.fromEntries(a.by.map(f => [f, rs[0][f]]));
        if (a._count) o._count = rs.length;
        if (a._sum) o._sum = Object.fromEntries(Object.keys(a._sum).map(f => [f, rs.reduce((n, x) => n + (x[f] || 0), 0)]));
        return o;
      });
    },
  };
  return api;
}

export const prisma = Object.fromEntries(Object.keys(MODELS).map(m => [m, table(m)]));
// Transactions run one at a time and roll everything back if the callback throws, like the real database.
prisma.$transaction = async function (fn) {
  const run = async () => {
    const snap = structuredClone(db.t);
    try { return await fn(prisma); } catch (e) { db.t = snap; throw e; }
  };
  const result = db.lock.then(run, run);
  db.lock = result.catch(() => {});
  return result;
};
prisma.$disconnect = async () => {};
// Expose for tests/seed only.
export const __tables = () => db.t;
