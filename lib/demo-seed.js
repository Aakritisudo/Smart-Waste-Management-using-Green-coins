// Demo data loaded into memory at start-up. Sign in with any number below; the OTP is shown on screen.
//   9999900100  Admin (reviews photos, approves shops)      9999900101  Demo citizen (85 coins)
//   9999900200  Municipal officer                            9999900201 / 9999900202  Collection workers
//   9999900001 / 2 / 3  Partner shops (Gupta Kirana, Sukhdev Tea, Verma Medicos)
import crypto from 'crypto';

export const DEMO_ACCOUNTS = [
  ['Citizen', '9999900101'], ['Municipal officer', '9999900200'], ['Worker', '9999900201'], ['Admin', '9999900100'], ['Shop', '9999900001'],
];
const DAY = 864e5, IST = 5.5 * 3600e3;
const dayStart = off => new Date(Math.floor((Date.now() + IST) / DAY) * DAY - IST + off * DAY);
const ago = d => new Date(Date.now() - d * DAY);
const id = () => crypto.randomUUID();
const CATS = ['wet', 'dry', 'recyclable', 'hazardous', 'ewaste'];

export function seedDemo(t) {
  const user = (phone, name, locality, role = 'CITIZEN', coins = 0, city = 'Nawanshahr') => { const u = { id: id(), phone: '+91' + phone, name, city, locality, role, coins, createdAt: ago(30) }; t.user.push(u); return u; };
  const sub = (u, category, days, coins = 5) => t.submission.push({ id: id(), userId: u.id, category, status: 'APPROVED', coins, confidence: 0.95, reason: 'Demo data', imageHash: crypto.randomBytes(16).toString('hex'), imageData: null, mime: null, createdAt: ago(days), decidedAt: null, decidedBy: null });
  const txn = (u, delta, kind, note, days) => t.coinTxn.push({ id: id(), userId: u.id, delta, kind, refId: null, note, createdAt: ago(days) });

  user('9999900100', 'Demo Admin', 'Municipal Office', 'ADMIN');
  const officer = user('9999900200', 'Demo Officer', 'Municipal Office', 'MUNICIPAL');
  const worker = user('9999900201', 'Demo Worker', 'Depot', 'WORKER');
  user('9999900202', 'Demo Worker 2', 'Depot', 'WORKER');

  const me = user('9999900101', 'Demo Citizen', 'Civil Lines', 'CITIZEN', 85);
  [['dry', 6, 10], ['wet', 5, 5], ['recyclable', 3, 5]].forEach(([c, d, n]) => { sub(me, c, d, n); txn(me, n, 'EARN', `Approved ${c} photo`, d); });
  txn(me, 65, 'EARN', 'Welcome demo balance', 7);

  [['9999900001', 'Ramesh Gupta', 'Gupta Kirana Store', 'Main Market, Nawanshahr', 'PB-KIR-2041', '₹20 off on groceries above ₹200', 20, 'Main Market'],
   ['9999900002', 'Sukhdev Singh', 'Sukhdev Tea Stall', 'Bus Stand Road, Nawanshahr', 'PB-TEA-1187', 'One free tea', 20, 'Bus Stand Road'],
   ['9999900003', 'Anita Verma', 'Verma Medicos', 'Civil Lines, Nawanshahr', 'PB-PHM-7720', '5% off on non-prescription items', 40, 'Civil Lines']].forEach(([ph, owner, name, address, licence, offer, cost, area]) => {
    const o = user(ph, owner, area);
    t.shop.push({ id: id(), ownerId: o.id, name, ownerName: owner, phone: '+91' + ph, address, licence, status: 'APPROVED', offerText: offer, coinCost: cost, dailyLimit: 20, paused: false, createdAt: ago(20) });
  });

  // Localities with different participation so the municipal dashboard has something to show.
  // [name, households, active households]
  let n = 0;
  for (const [loc, total, active] of [['Civil Lines', 6, 5], ['Model Town', 6, 1], ['Bus Stand Road', 5, 3], ['Gandhi Nagar', 4, 0]]) {
    for (let i = 0; i < total; i++) {
      const u = user('99999' + String(n++ + 300).padStart(5, '0'), `${loc} Home ${i + 1}`, loc);
      if (i >= active) continue;
      sub(u, CATS[i % 5], i + 1);
      const k = i % 4, created = ago(6 - k), cat = CATS[(i + 1) % 5];
      const base = { id: id(), userId: u.id, category: cat, estKg: 3, note: null, city: 'Nawanshahr', locality: loc, handoverCode: 'DEMO' + (10 + n), workerId: null, assignedAt: null, collectedAt: null, collectedKg: null, verifiedAt: null, verifiedBy: null, coins: 0, createdAt: created, preferredDay: dayStart(-5 + k) };
      if (k === 0) t.pickup.push({ ...base, status: 'VERIFIED', workerId: worker.id, assignedAt: created, collectedAt: new Date(created.getTime() + 1.2 * DAY), collectedKg: 3.4, coins: 3, verifiedAt: ago(4), verifiedBy: officer.id });
      if (k === 1) t.pickup.push({ ...base, status: 'ASSIGNED', workerId: worker.id, assignedAt: created });           // overdue
      if (k === 2) t.pickup.push({ ...base, status: 'REQUESTED', preferredDay: dayStart(-1) });                          // overdue, unassigned
      if (k === 3) t.pickup.push({ ...base, status: 'COLLECTED', workerId: worker.id, collectedAt: ago(1), collectedKg: 2.1 });
    }
  }
}
