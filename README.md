# Green Coins (no-database demo)

Next.js 14 (App Router) + React 18. **No database, no accounts, no API keys needed.**
All data lives in memory and is pre-filled with demo accounts, shops, localities and pickups.
Restarting the server resets everything to the demo data.

## Run it
```
npm install
npm run dev
```
Open http://localhost:3000

## Sign in
Go to **Log in**, tap a demo account, press **Send OTP**, then **Fill and verify** (no SMS is sent; the code is shown on screen).

| Account | Phone | What it shows |
|---|---|---|
| Citizen | 9999900101 | Earn (photo upload), Pickup requests, Wallet (85 coins), Community impact |
| Municipal officer | 9999900200 | `/municipal`: locality analytics, assign / verify pickups |
| Collection worker | 9999900201 | `/worker`: collect with the citizen's handover code |
| Admin | 9999900100 | `/admin`: photo review queue, approve partner shops |
| Shop owner | 9999900001 | `/shop`: verify redemption codes |

You can also **Create an account** with any 10-digit number starting 6-9.

## 3-minute demo script
1. **Citizen**: Earn tab, upload any photo, get coins. Wallet tab, redeem 20 coins at a shop, get a code.
2. **Shop owner** (another browser window): enter that code to verify it.
3. **Citizen**: Pickup tab, request a pickup. Note the handover code.
4. **Officer**: `/municipal`, Pickup management, assign it to the worker.
5. **Worker**: `/worker`, enter the handover code and a weight, mark collected.
6. **Citizen**: Confirm collection, coins are credited.
7. **Officer**: Locality analytics shows participation, overdue pickups and verified kg.

Tip: use a normal window plus a private/incognito window (and a second browser) so you can stay signed in as several roles at once.

## Notes
- The photo check runs in labelled **demo mode** (auto-approves) because no AI key is set. Add `ANTHROPIC_API_KEY` to `.env.local` to use real classification.
- `npm test` runs the unit tests for the program rules, pickup rules and analytics.
- The database layer is `lib/prisma.js` (an in-memory store with the same API as the Prisma client), seeded by `lib/demo-seed.js`. To use PostgreSQL instead, use the full project and its README.
