'use client';
import { useEffect, useRef } from 'react';

// Full-screen three.js background behind every app screen: floating Green Coins, low-poly leaves and a slow
// wireframe globe. It never receives clicks, pauses in background tabs, honours "reduce motion", and silently
// does nothing (the CSS gradient stays) if WebGL is unavailable.
export default function Scene3D() {
  const host = useRef(null);
  useEffect(() => {
    let stop = false, undo = () => {};
    (async () => {
      let THREE; try { THREE = await import('three'); } catch { return; }
      if (stop || !host.current) return;
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); } catch { return; }
      const el = host.current, vw = () => window.innerWidth, vh = () => window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(vw(), vh());
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0xeaf6ef, 14, 36);
      const camera = new THREE.PerspectiveCamera(50, vw() / vh(), 0.1, 100);
      camera.position.set(0, 0, 14);
      scene.add(new THREE.AmbientLight(0xffffff, 1.0));
      const sun = new THREE.DirectionalLight(0xffffff, 1.5); sun.position.set(5, 8, 10); scene.add(sun);
      const warm = new THREE.PointLight(0xffd166, 60, 40); warm.position.set(-8, -4, 6); scene.add(warm);

      const small = vw() < 700, rnd = (a, b) => a + Math.random() * (b - a);
      const things = [], disposables = [];
      const keep = o => { disposables.push(o); return o; };

      // Coins: gold discs with a raised rim, facing the viewer and spinning on the vertical axis.
      const discGeo = keep(new THREE.CylinderGeometry(0.7, 0.7, 0.14, 40)); discGeo.rotateX(Math.PI / 2);
      const rimGeo = keep(new THREE.TorusGeometry(0.52, 0.05, 12, 40));
      const gold = keep(new THREE.MeshStandardMaterial({ color: 0xf2b632, metalness: 0.65, roughness: 0.3 }));
      const deep = keep(new THREE.MeshStandardMaterial({ color: 0xc98a12, metalness: 0.6, roughness: 0.35 }));
      for (let i = 0; i < (small ? 7 : 14); i++) {
        const coin = new THREE.Group();
        coin.add(new THREE.Mesh(discGeo, gold));
        const rim = new THREE.Mesh(rimGeo, deep); rim.position.z = 0.08; coin.add(rim);
        const s = rnd(0.7, 1.5); coin.scale.setScalar(s);
        coin.position.set(rnd(-15, 15), rnd(-9, 9), rnd(-14, 3));
        coin.rotation.set(rnd(-0.4, 0.4), rnd(0, 6), rnd(-0.3, 0.3));
        scene.add(coin);
        things.push({ o: coin, y: coin.position.y, spin: rnd(0.4, 1.1) * (Math.random() < 0.5 ? -1 : 1), bob: rnd(0.3, 0.8), ph: rnd(0, 6), amp: rnd(0.3, 0.7), tumble: 0 });
      }
      // Leaves: faceted green blobs drifting and tumbling.
      const leafGeo = keep(new THREE.IcosahedronGeometry(0.55, 0));
      const greens = [0x0f5c3c, 0x2e9e6b, 0x6fc79a, 0xa8e0b8].map(c => keep(new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.6, transparent: true, opacity: 0.88 })));
      for (let i = 0; i < (small ? 9 : 18); i++) {
        const leaf = new THREE.Mesh(leafGeo, greens[i % greens.length]);
        leaf.scale.set(rnd(0.6, 1.6), rnd(0.9, 2.1), rnd(0.4, 0.9));
        leaf.position.set(rnd(-16, 16), rnd(-10, 10), rnd(-15, 2));
        leaf.rotation.set(rnd(0, 6), rnd(0, 6), rnd(0, 6)); scene.add(leaf);
        things.push({ o: leaf, y: leaf.position.y, spin: 0, bob: rnd(0.2, 0.6), ph: rnd(0, 6), amp: rnd(0.4, 0.9), tumble: rnd(0.15, 0.5) });
      }
      // Globe: a large, faint wireframe planet far behind everything.
      const globe = new THREE.Mesh(keep(new THREE.IcosahedronGeometry(7, 2)), keep(new THREE.MeshBasicMaterial({ color: 0x0f5c3c, wireframe: true, transparent: true, opacity: 0.1 })));
      globe.position.set(small ? 3 : 8, -1, -13); scene.add(globe);

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const m = { x: 0, y: 0 }; let scrollY = window.scrollY, raf = 0, last = performance.now(), t = 0;
      const onMove = e => { m.x = (e.clientX / vw()) * 2 - 1; m.y = (e.clientY / vh()) * 2 - 1; };
      const onScroll = () => { scrollY = window.scrollY; if (reduce) draw(); };
      const draw = () => {
        camera.position.x += (m.x * 1.4 - camera.position.x) * 0.04;
        camera.position.y += (-m.y * 0.9 - scrollY * 0.004 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0); renderer.render(scene, camera);
      };
      const frame = now => {
        const dt = Math.min((now - last) / 1000, 0.05); last = now; t += dt;
        for (const k of things) {
          k.o.position.y = k.y + Math.sin(t * k.bob + k.ph) * k.amp;
          if (k.spin) k.o.rotation.y += dt * k.spin;
          if (k.tumble) { k.o.rotation.x += dt * k.tumble; k.o.rotation.z += dt * k.tumble * 0.6; }
        }
        globe.rotation.y += dt * 0.04; globe.rotation.x += dt * 0.015;
        draw(); raf = requestAnimationFrame(frame);
      };
      const start = () => { if (reduce || raf) return; last = performance.now(); raf = requestAnimationFrame(frame); };
      const pause = () => { cancelAnimationFrame(raf); raf = 0; };
      const onVis = () => (document.hidden ? pause() : start());
      const onResize = () => { renderer.setSize(vw(), vh()); camera.aspect = vw() / vh(); camera.updateProjectionMatrix(); if (reduce) draw(); };

      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      document.addEventListener('visibilitychange', onVis);
      draw(); start(); el.classList.add('on');

      undo = () => {
        pause();
        window.removeEventListener('pointermove', onMove); window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', onVis);
        disposables.forEach(d => d.dispose()); renderer.dispose(); renderer.domElement.remove();
      };
    })();
    return () => { stop = true; undo(); };
  }, []);
  return <div ref={host} className="scene3d" aria-hidden="true" />;
}
