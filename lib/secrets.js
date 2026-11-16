// Demo build: falls back to built-in dev secrets so `npm run dev` AND `npm start` work with zero setup.
export function secret(name, devFallback) { return process.env[name] || devFallback; }
