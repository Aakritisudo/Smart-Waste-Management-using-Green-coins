'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

async function post(url, body) {
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(d.error || 'Something went wrong. Please try again.'), { data: d });
  return d;
}
const EMPTY = Array(6).fill('');
// Demo build only: seeded accounts (see lib/demo-seed.js).
const DEMO = [['Citizen', '9999900101'], ['Municipal officer', '9999900200'], ['Collection worker', '9999900201'], ['Admin', '9999900100'], ['Shop owner', '9999900001']];

export default function AuthFlow({ mode }) {
  const isReg = mode === 'register';
  const router = useRouter();
  const [step, setStep] = useState('details');
  const [f, setF] = useState({ name: '', phone: '', city: '', locality: '', consent: false });
  const [digits, setDigits] = useState(EMPTY);
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false), [cool, setCool] = useState(0), [dev, setDev] = useState('');
  const refs = useRef([]);

  const set = k => e => setF(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  useEffect(() => { if (cool <= 0) return; const t = setTimeout(() => setCool(c => c - 1), 1000); return () => clearTimeout(t); }, [cool]);

  const phoneOk = /^[6-9]\d{9}$/.test(f.phone);
  const ready = phoneOk && (!isReg || (f.name.trim().length >= 2 && f.city.trim() && f.locality.trim() && f.consent));

  async function send(e) {
    e && e.preventDefault();
    if (!ready || busy) return;
    setBusy(true); setErr('');
    try {
      const d = await post('/api/auth/send-otp', { ...f, purpose: mode });
      setStep('otp'); setCool(d.cooldown || 30); setDev(d.devOtp || ''); setDigits(EMPTY);
      setTimeout(() => refs.current[0]?.focus(), 60);
    } catch (x) { if (x.data?.retryAfter) setCool(x.data.retryAfter); setErr(x.message); }
    finally { setBusy(false); }
  }
  async function verify(code) {
    if (busy) return;
    setBusy(true); setErr('');
    try { await post('/api/auth/verify-otp', { phone: f.phone, otp: code, purpose: mode }); router.replace('/dashboard'); router.refresh(); }
    catch (x) { setErr(x.message); setDigits(EMPTY); refs.current[0]?.focus(); setBusy(false); }
  }
  function onDigit(i, v) {
    const c = v.replace(/\D/g, '');
    const n = [...digits];
    if (!c) { n[i] = ''; setDigits(n); return; }
    c.split('').slice(0, 6 - i).forEach((ch, k) => { n[i + k] = ch; });
    setDigits(n); refs.current[Math.min(i + c.length, 5)]?.focus();
    if (n.every(Boolean)) verify(n.join(''));
  }
  function onKey(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus();
  }
  function onPaste(e) {
    const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!t) return; e.preventDefault();
    setDigits(EMPTY.map((_, k) => t[k] || '')); refs.current[Math.min(t.length, 5)]?.focus();
    if (t.length === 6) verify(t);
  }

  const masked = `+91 ${f.phone.slice(0, 2)}••••••${f.phone.slice(-2)}`;
  const stepper = <div className="steps" aria-hidden><i className="on" /><i className={step === 'otp' ? 'on' : ''} /></div>;

  if (step === 'otp') return (
    <div className="card">
      {stepper}
      <div className="eyebrow">Step 2 of 2</div>
      <h1>Verify your number</h1>
      <p className="sub">Enter the 6-digit code sent by SMS to <b>{masked}</b>. <button className="link" onClick={() => { setStep('details'); setErr(''); }}>Change number</button></p>
      {dev && <div className="dev">Demo mode: no SMS is sent. Your code is <b>{dev}</b>. <button type="button" className="link" disabled={busy} onClick={() => { setDigits(dev.split('')); verify(dev); }}>Fill and verify</button></div>}
      {err && <div className="err" role="alert">{err}</div>}
      <div className="otp" onPaste={onPaste}>
        {digits.map((d, i) => (
          <input key={i} ref={el => (refs.current[i] = el)} value={d} className={d ? 'f' : ''} inputMode="numeric" pattern="[0-9]*" maxLength={6}
            autoComplete={i === 0 ? 'one-time-code' : 'off'} aria-label={`Digit ${i + 1}`} disabled={busy}
            onChange={e => onDigit(i, e.target.value)} onKeyDown={e => onKey(i, e)} />
        ))}
      </div>
      <button className="btn full" disabled={busy || digits.some(d => !d)} onClick={() => verify(digits.join(''))}>
        {busy ? <span className="spin" /> : null}{isReg ? 'Verify and create account' : 'Verify and log in'}
      </button>
      <div className="row">
        <span>Didn’t get the code?</span>
        <button className="link" disabled={cool > 0 || busy} onClick={() => send()}>{cool > 0 ? `Resend in ${cool}s` : 'Resend code'}</button>
      </div>
    </div>
  );

  return (
    <form className="card" onSubmit={send} noValidate>
      {stepper}
      <div className="eyebrow">{isReg ? 'Step 1 of 2' : 'Welcome back'}</div>
      <h1>{isReg ? 'Create your account' : 'Log in with OTP'}</h1>
      <p className="sub">{isReg ? 'Register your household to start earning Green Coins. We’ll verify your mobile number with a one-time code.' : 'Enter your registered mobile number and we’ll send you a one-time code.'}</p>
      {err && <div className="err" role="alert">{err}{cool > 0 ? ` (${cool}s)` : ''}</div>}
      {isReg && <div className="field"><label htmlFor="name">Full name</label><input id="name" type="text" autoComplete="name" value={f.name} onChange={set('name')} placeholder="As on your ID" maxLength={60} /></div>}
      <div className="field"><label htmlFor="phone">Mobile number</label>
        <div className="phone"><span>+91</span>
          <input id="phone" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} value={f.phone} placeholder="98765 43210"
            onChange={e => setF(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} /></div></div>
      {isReg && <>
        <div className="two">
          <div className="field"><label htmlFor="city">City</label><input id="city" type="text" autoComplete="address-level2" value={f.city} onChange={set('city')} maxLength={60} /></div>
          <div className="field"><label htmlFor="loc">Mohalla / locality</label><input id="loc" type="text" value={f.locality} onChange={set('locality')} maxLength={80} /></div>
        </div>
        <label className="check"><input type="checkbox" checked={f.consent} onChange={set('consent')} />
          <span>I agree to the Green Coins program rules, including verified-photo contributions and daily limits.</span></label>
      </>}
      <button className="btn full" type="submit" disabled={!ready || busy} style={{ marginTop: isReg ? 0 : 10 }}>{busy ? <span className="spin" /> : null}Send OTP</button>
      {!isReg && <div className="demo"><small>Demo accounts. Tap one, then Send OTP</small><div>{DEMO.map(([l, p]) => <button type="button" key={p} className={'chip APPROVED' + (f.phone === p ? ' on' : '')} onClick={() => setF(x => ({ ...x, phone: p }))}>{l}</button>)}</div></div>}
      <div className="foot">{isReg ? <>Already registered? <Link href="/login">Log in</Link></> : <>New to Green Coins? <Link href="/register">Create an account</Link></>}</div>
    </form>
  );
}
