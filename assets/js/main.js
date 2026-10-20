const PHOTOS = ["assets/photos/photo-01.jpg", "assets/photos/photo-02.jpg", "assets/photos/photo-03.jpg", "assets/photos/photo-04.jpg", "assets/photos/photo-05.jpg", "assets/photos/photo-06.jpg", "assets/photos/photo-07.jpg", "assets/photos/photo-08.jpg", "assets/photos/photo-09.jpg", "assets/photos/photo-10.jpg", "assets/photos/photo-11.jpg", "assets/photos/photo-12.jpg", "assets/photos/photo-13.jpg", "assets/photos/photo-14.jpg", "assets/photos/photo-15.jpg", "assets/photos/photo-16.jpg", "assets/photos/photo-17.jpg", "assets/photos/photo-18.jpg", "assets/photos/photo-19.jpg", "assets/photos/photo-20.jpg", "assets/photos/photo-21.jpg", "assets/photos/photo-22.jpg", "assets/photos/photo-23.jpg", "assets/photos/photo-24.jpg", "assets/photos/photo-25.jpg", "assets/photos/photo-26.jpg", "assets/photos/photo-27.jpg"];
    const WISHES = [
      "Chúc em luôn xinh đẹp, rạng rỡ và luôn tươi vui mỗi ngày.",
      "Chúc em luôn hạnh phúc và an yên với những gì mình đang có.",
      "Chúc em học thật tốt, gặt hái được nhiều thành tích như mong ước.",
      "Mong em mỗi sáng thức dậy đều ngập tràn niềm vui và sự lạc quan.",
      "Chúc em luôn tự tin, vững vàng trên mọi chặng đường phía trước.",
      "Dù cuộc sống có bận rộn đến đâu, mong em luôn giữ được nụ cười tỏa nắng.",
      "Mong em luôn khoẻ mạnh, ăn ngon ngủ ngoan và biết yêu thương chính mình.",
      "Chúc em ngày 20/10 nhẹ nhàng, ấm áp và ngập tràn hạnh phúc.",
      "Mong mọi may mắn và những điều dễ thương nhất luôn mỉm cười với Ngọc Mai.",
      "Cố gắng vừa đủ thôi, mệt thì nhớ nghỉ ngơi và đừng tạo áp lực cho mình nhé.",
      "Chúc em luôn hồn nhiên, trong trẻo và luôn an yên trong tâm hồn.",
      "Chúc em đạt được những mục tiêu và dự định mà em hằng ấp ủ."
    ];

    const canvas = document.getElementById('heartCanvas');
    const ctx = canvas.getContext('2d');
    const rebuildBtn = document.getElementById('rebuildBtn');
    const holdBtn = document.getElementById('holdBtn');
    const replayBtn = document.getElementById('replayBtn');
    const nextBtn = document.getElementById('nextBtn');
    const letterBtn = document.getElementById('letterBtn');
    const zoomUI = document.getElementById('zoomUI');
    const hint = document.getElementById('hint');
    const HINT_HEART = hint.textContent;
    const HINT_END = 'Cuộn chuột / chụm 2 ngón để phóng to – thu nhỏ hố đen • Chạm ảnh để xem';
    const pop = document.getElementById('pop');

    let width, height;
    function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize); resize();

    const clamp01 = x => Math.max(0, Math.min(1, x));
    const easeOut = x => 1 - Math.pow(1 - clamp01(x), 3);
    const rnd = (a, b) => a + Math.random() * (b - a);

    /* ================= SPRITES ================= */
    function createSprite(c1, c2, c3) {
      const s = document.createElement('canvas'); s.width = 32; s.height = 32;
      const g = s.getContext('2d');
      const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, c1); gr.addColorStop(0.4, c2); gr.addColorStop(0.75, c3); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(16, 16, 16, 0, Math.PI * 2); g.fill();
      return s;
    }
    const palette = [
      { spr: createSprite('rgba(255,235,244,1)', 'rgba(255,90,150,0.95)', 'rgba(255,40,100,0.25)'), rgb: '255,110,170' },
      { spr: createSprite('rgba(255,255,225,1)', 'rgba(255,205,70,0.95)', 'rgba(255,150,0,0.25)'), rgb: '255,210,90' },
      { spr: createSprite('rgba(255,242,215,1)', 'rgba(255,135,45,0.95)', 'rgba(230,70,0,0.25)'), rgb: '255,140,60' },
      { spr: createSprite('rgba(255,255,255,1)', 'rgba(225,242,255,0.9)', 'rgba(170,205,255,0.25)'), rgb: '220,235,255' }
    ];
    function getRandomColor() {
      const r = Math.random();
      if (r < .45) return palette[0]; if (r < .70) return palette[1]; if (r < .88) return palette[2]; return palette[3];
    }

    /* ================= NỀN VŨ TRỤ ================= */
    const nebulaClouds = [];
    for (let i = 0; i < 5; i++) nebulaClouds.push({
      x: (Math.random() - .5) * 600, y: (Math.random() - .5) * 600 - 100, radius: Math.random() * 350 + 250,
      color: i % 2 === 0 ? 'rgba(120,30,140,0.10)' : 'rgba(30,80,160,0.09)'
    });
    const starRailStars = [];
    for (let i = 0; i < 280; i++) {
      const radius = Math.random() * 950 + 80;
      starRailStars.push({ angle: Math.random() * Math.PI * 2, radius, z: (Math.random() - .5) * 1200, speed: 0.0004 + (1000 - radius) * 0.0000008, size: Math.random() * 1.8 + 0.5, alpha: Math.random() * .7 + .2 });
    }

    /* ================= TRÁI TIM ================= */
    const heartParticles = [];
    for (let i = 0; i < 2400; i++) {
      let x, y, z;
      while (true) {
        x = (Math.random() * 3 - 1.5) * 1.2; y = (Math.random() * 3 - 1.5) * 1.2; z = (Math.random() * 3 - 1.5) * 1.2;
        const a = x * x + (9 / 4) * y * y + z * z - 1;
        if (a * a * a - x * x * z * z * z - (9 / 80) * y * y * z * z * z <= 0) break;
      }
      const tx = x * 220, ty = -z * 220 - 140, tz = y * 220;
      heartParticles.push({ tx, ty, tz, x: tx, y: ty, z: tz, vx: 0, vy: 0, vz: 0, size: Math.random() * 2.2 + 1.2, alpha: Math.random() * .65 + .35, phase: Math.random() * Math.PI * 2, c: getRandomColor() });
    }
    let heartScreen = [];   // toạ độ màn hình của hạt tim -> hitbox chính xác

    /* ================= ĐĨA TRÒN ================= */
    const diskParticles = [];
    for (let i = 0; i < 1500; i++) {
      const radius = Math.random() * 260 + 20;
      diskParticles.push({ angle: Math.random() * Math.PI * 2, radius, y: 200 + (Math.random() - .5) * 16, size: Math.random() * 1.8 + .6, alpha: Math.random() * .55 + .25, speed: 0.004 + (280 - radius) * 0.00003, c: getRandomColor() });
    }

    /* ================= DÒNG ÁNH SÁNG ================= */
    const streams = [];
    function spawnStream(s) {
      s.angle = Math.random() * Math.PI * 2; s.r = 500 + Math.random() * 1000; s.y = (Math.random() - .5) * 1300 - 50;
      s.hist = []; s.c = getRandomColor(); s.w = Math.random() * 1.1 + 0.6; return s;
    }
    for (let i = 0; i < 190; i++) { const s = spawnStream({}); s.r = 40 + Math.random() * 1400; streams.push(s); }

    /* ================= ẢNH: bay quanh tim + theo dòng chảy hút về tim ================= */
    const photoObjs = [];
    const photoImgs = PHOTOS.map(src => { const im = new Image(); im.src = src; return im; });
    function spawnPhoto(o, initial) {
      if (o.mode === 'orbit') {
        o.ang = Math.random() * Math.PI * 2; o.r = rnd(330, 580); o.y = -140 + rnd(-300, 300);
        o.sp = rnd(0.0015, 0.0045) * (Math.random() < .5 ? -1 : 1); o.bob = Math.random() * 10;
      } else {
        o.ang = Math.random() * Math.PI * 2; o.r = initial ? rnd(160, 1200) : rnd(1000, 1500); o.y = -140 + rnd(-500, 500);
      }
      return o;
    }
    photoImgs.forEach((im, i) => { const m = i % 2 === 0 ? 'orbit' : 'stream', sz = rnd(34, 52); photoObjs.push(spawnPhoto({ i, im, mode: m, base: m, s: sz, s0: sz, gs: 1, fd: 1, delay: 0, x: 0, y: -140, z: 0, ring: 0, ringA0: 0, bob: 0 }, true)); });
    let photoRects = [];

    /* ================= CHỮ ================= */
    const wordList = ["Khoẻ mạnh", "Mơ ước", "Học giỏi", "Bình yên", "Đạt mục tiêu", "Giữ sức khoẻ", "Ngọc Mai", "Chăm sóc bản thân", "Nụ cười", "20/10", "Luôn vui nhé", "Ấm áp", "Cố lên nhé", "Nghỉ ngơi nhé", "Xinh nhất", "Mai ơi"];
    const wordObjects = [];
    for (let i = 0; i < 8; i++) wordObjects.push({ text: wordList[(i * 2) % 16], angle: (i / 8) * Math.PI * 2, radius: 235, y: 200, speed: 0.005, type: 'disk' });
    for (let i = 0; i < 14; i++) wordObjects.push({ text: wordList[(i * 3 + 1) % 16], angle: (i / 14) * Math.PI * 2 * 2.2, radius: i % 2 ? 300 : 350, y: -340 + i * 36, speed: i % 2 ? -0.006 : 0.0045, type: 'heart' });

    /* ================= CHỮ KÝ BAY VỤT QUA ================= */
    const flyers = []; let flyTimer = 1.2;
    const flyTexts = ["Ngọc Mai", "Ngọc Mai", "Ngọc Mai ♥", "Mai", "Khoẻ mạnh", "Bình yên", "Học giỏi", "20/10", "Mai ơi", "Luôn vui nhé"];
    const SCRIPT = 'italic 700 %spx "Segoe Script","Snell Roundhand","Brush Script MT","Lucida Handwriting",cursive';
    function spawnFlyer() {
      const side = Math.random();
      let x, y, ang;
      if (side < .4) { x = -150; y = rnd(0.1, 0.9) * height; ang = rnd(-0.45, 0.45); }
      else if (side < .8) { x = width + 150; y = rnd(0.1, 0.9) * height; ang = Math.PI + rnd(-0.45, 0.45); }
      else { x = rnd(0.1, 0.9) * width; y = -80; ang = Math.PI / 2 + rnd(-0.6, 0.6); }
      const sp = rnd(420, 800);
      flyers.push({ text: flyTexts[(Math.random() * flyTexts.length) | 0], x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, size: rnd(24, 42), rot: Math.atan2(Math.sin(ang), Math.cos(ang)) * 0.25, hist: [], hue: Math.random() < .5 ? '255,200,225' : '210,225,255' });
    }
    function drawFlyers(dt) {
      flyTimer -= dt;
      if (flyTimer <= 0 && flyers.length < 4) { spawnFlyer(); flyTimer = rnd(1.6, 3.2); }
      ctx.globalCompositeOperation = 'source-over'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let k = flyers.length - 1; k >= 0; k--) {
        const f = flyers[k];
        f.x += f.vx * dt; f.y += f.vy * dt;
        f.hist.push(f.x, f.y); if (f.hist.length > 20) f.hist.splice(0, 2);
        if (f.x < -400 || f.x > width + 400 || f.y < -300 || f.y > height + 300) { flyers.splice(k, 1); continue; }
        ctx.font = SCRIPT.replace('%s', f.size.toFixed(0));
        const n = f.hist.length / 2;
        for (let j = 0; j < n; j++) {
          const a = (j / n);
          ctx.globalAlpha = a * a * 0.5;
          ctx.fillStyle = 'rgb(' + f.hue + ')';
          ctx.save(); ctx.translate(f.hist[j * 2], f.hist[j * 2 + 1]); ctx.rotate(f.rot); ctx.fillText(f.text, 0, 0); ctx.restore();
        }
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot);
        ctx.globalAlpha = 0.9; ctx.strokeStyle = 'rgba(255,120,170,0.8)'; ctx.lineWidth = 2.4; ctx.strokeText(f.text, 0, 0);
        ctx.fillStyle = '#fff'; ctx.fillText(f.text, 0, 0); ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    /* ================= CAMERA + TAP ================= */
    let rotX = 0.12, rotY = 0, panX = 0, panY = 0, zoom = 550;
    let isDragging = false, dragButton = 0, prevMouseX = 0, prevMouseY = 0, downX = 0, downY = 0, lastTap = 0;

    canvas.addEventListener('mousedown', e => { isDragging = true; dragButton = e.button; prevMouseX = downX = e.clientX; prevMouseY = downY = e.clientY; });
    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX, dy = e.clientY - prevMouseY;
      if (dragButton === 0) { rotY += dx * 0.005; rotX += dy * 0.005; rotX = Math.max(-Math.PI / 2 + .01, Math.min(Math.PI / 2 - .01, rotX)); }
      else if (dragButton === 2) { panX += dx; panY += dy; }
      prevMouseX = e.clientX; prevMouseY = e.clientY;
    });
    window.addEventListener('mouseup', e => {
      const was = isDragging; isDragging = false;
      if (was && e.target === canvas && e.button === 0 && Math.hypot(e.clientX - downX, e.clientY - downY) < 6) handleTap(e.clientX, e.clientY);
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('wheel', e => { e.preventDefault(); if (phase === 'warp') bhZ(Math.exp(-e.deltaY * 0.0015)); else { zoom += e.deltaY * -0.55; zoom = Math.max(100, Math.min(1800, zoom)); } }, { passive: false });

    let touchStartDist = 0, touchStartTime = 0;
    canvas.addEventListener('touchstart', e => {
      touchStartTime = Date.now();
      if (e.touches.length === 1) { isDragging = true; dragButton = 0; prevMouseX = downX = e.touches[0].clientX; prevMouseY = downY = e.touches[0].clientY; }
      else if (e.touches.length === 2) { touchStartDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }
    });
    canvas.addEventListener('touchmove', e => {
      if (e.touches.length === 1 && isDragging) {
        rotY += (e.touches[0].clientX - prevMouseX) * 0.005; rotX += (e.touches[0].clientY - prevMouseY) * 0.005;
        rotX = Math.max(-Math.PI / 2 + .01, Math.min(Math.PI / 2 - .01, rotX));
        prevMouseX = e.touches[0].clientX; prevMouseY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        if (phase === 'warp') { if (touchStartDist > 0) bhZ(d / touchStartDist); } else { zoom += (d - touchStartDist) * 1.5; zoom = Math.max(100, Math.min(1800, zoom)); } touchStartDist = d;
      }
    });
    canvas.addEventListener('touchend', e => {
      isDragging = false;
      const t = e.changedTouches[0];
      if (t && e.touches.length === 0 && Date.now() - touchStartTime < 350 && Math.hypot(t.clientX - downX, t.clientY - downY) < 10) handleTap(t.clientX, t.clientY);
    });

    function handleTap(x, y) {
      const now = Date.now(); if (now - lastTap < 450 || pop.classList.contains('show')) return; lastTap = now;
      // 1) ảnh (cái nào gần camera nhất được ưu tiên)
      let best = null;
      for (const r of photoRects) if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h && (!best || r.z < best.z)) best = r;
      if (best) { openPopup(best.i); return; }
      // 2) hitbox trái tim: chỉ tính khi chạm trúng hạt của trái tim (không phải đĩa tròn)
      if (phase === 'heart' && !isExploding && !isRebuilding) {
        for (let k = 0; k < heartScreen.length; k += 2) {
          const dx = heartScreen[k] - x, dy = heartScreen[k + 1] - y;
          if (dx * dx + dy * dy < 256) { triggerBigBang(); return; }
        }
      }
    }
    function openPopup(i) {
      document.getElementById('popImg').src = PHOTOS[i];
      document.getElementById('popTx').textContent = WISHES[i % WISHES.length];
      pop.classList.add('show');
    }
    function closePopup() { pop.classList.remove('show'); lastTap = Date.now(); }
    pop.addEventListener('click', e => { if (e.target === pop) closePopup(); });
    document.getElementById('popX').addEventListener('click', closePopup);
    window.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });

    /* ================= TRẠNG THÁI ================= */
    let phase = 'heart';
    let phaseT = 0, clock = 0, beatTime = 0;
    let isExploding = false, isRebuilding = false, rebuildProgress = 0;

    function triggerBigBang() {
      isExploding = true; isRebuilding = false; ringPhotos();
      for (const p of heartParticles) {
        const dx = p.tx, dy = p.ty + 140, dz = p.tz, len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        const sp = Math.random() * 32 + 18;
        p.vx = (dx / len) * sp + (Math.random() - .5) * 12; p.vy = (dy / len) * sp + (Math.random() - .5) * 12; p.vz = (dz / len) * sp + (Math.random() - .5) * 12;
      }
    }
    rebuildBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (isRebuilding || phase !== 'heart') return;
      const wasExploding = isExploding;
      isExploding = false; isRebuilding = true; rebuildProgress = 0; restorePhotos();
      for (const p of heartParticles) {
        if (!wasExploding && Math.abs(p.x - p.tx) < 10) {
          const a = Math.random() * Math.PI * 2, d = Math.random() * 800 + 400;
          p.x = Math.cos(a) * d; p.y = (Math.random() - .5) * d - 140; p.z = Math.sin(a) * d;
        }
      }
    });

    let holding = false, holdStart = 0;
    function holdDown(e) { e.preventDefault(); e.stopPropagation(); if (phase !== 'heart') return; holding = true; holdStart = performance.now(); }
    function holdUp() { holding = false; holdBtn.style.setProperty('--p', 0); }
    holdBtn.addEventListener('pointerdown', holdDown);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => holdBtn.addEventListener(ev, holdUp));
    holdBtn.addEventListener('contextmenu', e => e.preventDefault());
    replayBtn.addEventListener('click', e => { e.stopPropagation(); resetToHeart(); });
    nextBtn.addEventListener('click', e => { e.stopPropagation(); triggerPetals(); });

    function setUI(mode) {
      rebuildBtn.style.display = holdBtn.style.display = (mode === 'heart') ? '' : 'none';
      replayBtn.style.display = letterBtn.style.display = zoomUI.style.display = (mode === 'end') ? '' : 'none';
      nextBtn.style.display = 'none';
      hint.textContent = (mode === 'end') ? HINT_END : HINT_HEART; hint.style.opacity = (mode === 'heart' || mode === 'end') ? 1 : 0;
    }

    function resetToHeart() {
      phase = 'heart'; phaseT = 0; isExploding = false; isRebuilding = false; holding = false;
      for (const p of heartParticles) { p.x = p.tx; p.y = p.ty; p.z = p.tz; p.vx = p.vy = p.vz = 0; }
      for (const s of streams) { spawnStream(s); s.r = 40 + Math.random() * 1400; }
      restorePhotos();
      holdBtn.style.setProperty('--p', 0);
      setUI('heart');
    }

    /* ================= CHIẾU 3D ================= */
    function project3D(x, y, z) {
      const cY = Math.cos(rotY), sY = Math.sin(rotY);
      const x1 = x * cY - z * sY, z1 = x * sY + z * cY;
      const cX = Math.cos(rotX), sX = Math.sin(rotX);
      const y2 = y * cX - z1 * sX, z2 = y * sX + z1 * cX;
      const scale = zoom / (zoom + z2 + 500);
      return { px: width / 2 + panX + x1 * scale, py: height / 2 + panY + y2 * scale, scale, z: z2 };
    }

    function drawBackground(dim) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = dim === undefined ? 1 : dim;
      for (const c of nebulaClouds) {
        const g = ctx.createRadialGradient(width / 2 + c.x, height / 2 + c.y, 0, width / 2 + c.x, height / 2 + c.y, c.radius);
        g.addColorStop(0, c.color); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(width / 2 + c.x, height / 2 + c.y, c.radius, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#fff';
      starRailStars.forEach((s, i) => {
        s.angle += s.speed;
        const pr = project3D(Math.cos(s.angle) * s.radius, s.z, Math.sin(s.angle) * s.radius);
        if (pr.px >= 0 && pr.px <= width && pr.py >= 0 && pr.py <= height) {
          ctx.globalAlpha = (dim === undefined ? 1 : dim) * s.alpha * (0.6 + Math.sin(beatTime + i) * 0.4);
          ctx.fillRect(pr.px, pr.py, s.size * pr.scale * 1.5, s.size * pr.scale * 1.5);
        }
      });
      ctx.globalAlpha = 1;
    }

    function roundRect(x, y, w, h, r) {
      ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }

    /* ================= CẢNH TRÁI TIM ================= */
    function drawHeartScene(f) {
      const pulse = 1 + Math.sin(beatTime * 2.2) * 0.04 + Math.pow(Math.sin(beatTime * 4.4), 2) * 0.025;
      ctx.globalCompositeOperation = 'lighter';

      if (isExploding) {
        for (const p of heartParticles) { p.x += p.vx; p.y += p.vy; p.z += p.vz; p.vx *= .985; p.vy *= .985; p.vz *= .985; }
      } else if (isRebuilding) {
        rebuildProgress += 0.015;
        for (const p of heartParticles) {
          const ca = rebuildProgress * Math.PI * 3 + p.phase, so = (1 - Math.min(1, rebuildProgress)) * 40;
          p.x += (p.tx * pulse + Math.cos(ca) * so - p.x) * 0.08;
          p.y += (p.ty * pulse + Math.sin(ca) * so - p.y) * 0.08;
          p.z += (p.tz * pulse - p.z) * 0.08;
        }
        if (rebuildProgress >= 1.2) isRebuilding = false;
      }

      const list = [];
      heartScreen.length = 0;
      for (const p of heartParticles) {
        let rx = p.x, ry = p.y, rz = p.z;
        if (!isExploding && !isRebuilding) { rx = p.tx * pulse; ry = p.ty * pulse; rz = p.tz * pulse; }
        const pr = project3D(rx, ry, rz);
        heartScreen.push(pr.px, pr.py);
        list.push({ proj: pr, size: p.size, alpha: p.alpha * (0.75 + Math.sin(beatTime * 3 + p.phase) * 0.25), sprite: p.c.spr });
      }
      for (let i = 0; i < diskParticles.length; i++) {
        const dp = diskParticles[i]; dp.angle += dp.speed;
        list.push({ proj: project3D(Math.cos(dp.angle) * dp.radius, dp.y, Math.sin(dp.angle) * dp.radius), size: dp.size, alpha: dp.alpha * (0.6 + Math.sin(beatTime * 2 + i) * 0.4), sprite: dp.c.spr });
      }

      ctx.lineCap = 'round';
      for (const s of streams) {
        s.r = s.r * Math.pow(0.985, f) - 1.2 * f;
        s.angle += (0.006 + 1.9 / (s.r + 90)) * f;
        s.y += (200 - s.y) * 0.02 * f;
        if (s.r < 18) { spawnStream(s); continue; }
        const pr = project3D(Math.cos(s.angle) * s.r, s.y, Math.sin(s.angle) * s.r);
        s.hist.push(pr.px, pr.py);
        if (s.hist.length > 28) s.hist.splice(0, 2);
        const n = s.hist.length / 2;
        const fadeIn = clamp01((1500 - s.r) / 300), fadeOut = clamp01((s.r - 18) / 120);
        ctx.strokeStyle = 'rgb(' + s.c.rgb + ')';
        for (let j = 1; j < n; j++) {
          ctx.globalAlpha = (j / n) * 0.75 * fadeIn * fadeOut;
          ctx.lineWidth = s.w * (0.3 + 0.7 * j / n) * Math.max(.5, pr.scale * 1.6);
          ctx.beginPath(); ctx.moveTo(s.hist[(j - 1) * 2], s.hist[(j - 1) * 2 + 1]); ctx.lineTo(s.hist[j * 2], s.hist[j * 2 + 1]); ctx.stroke();
        }
        list.push({ proj: pr, size: s.w * 1.3, alpha: 0.9 * fadeIn * fadeOut, sprite: s.c.spr });
      }

      list.sort((a, b) => b.proj.z - a.proj.z);
      for (const it of list) {
        const sz = it.size * it.proj.scale * 5.5;
        ctx.globalAlpha = it.alpha;
        ctx.drawImage(it.sprite, it.proj.px - sz / 2, it.proj.py - sz / 2, sz, sz);
      }

      // ảnh nhỏ: một nhóm bay quanh tim, một nhóm trôi theo dòng chảy hút về tim
      ctx.globalCompositeOperation = 'source-over';
      const pl = [];
      for (const o of photoObjs) {
        let a = 1, pr;
        if (o.mode === 'ring') {
          if (o.delay > 0) { o.delay -= f / 60; continue; }
          const tp = ringPos(o), kf = 1 - Math.pow(0.94, f);
          o.x += (tp.x - o.x) * kf; o.y += (tp.y - o.y) * kf; o.z += (tp.z - o.z) * kf;
          o.fd = Math.min(1, o.fd + 0.04 * f); o.gs += (1 - o.gs) * kf;
          pl.push({ o, pr: project3D(o.x, o.y, o.z), a: o.fd }); continue;
        }
        if (o.mode === 'orbit') {
          o.ang += o.sp * f;
          pr = project3D(Math.cos(o.ang) * o.r, o.y + Math.sin(beatTime * 0.9 + o.bob) * 14, Math.sin(o.ang) * o.r);
        } else {
          o.r = o.r * Math.pow(0.992, f) - 0.8 * f;
          o.ang += (0.004 + 1.3 / (o.r + 120)) * f;
          o.y += (-140 - o.y) * 0.015 * f;
          if (o.r < 150) { spawnPhoto(o, false); continue; }
          a = clamp01((o.r - 150) / 120) * clamp01((1500 - o.r) / 300);
          pr = project3D(Math.cos(o.ang) * o.r, o.y, Math.sin(o.ang) * o.r);
        }
        pl.push({ o, pr, a });
      }
      pl.sort((p, q) => q.pr.z - p.pr.z);
      photoRects.length = 0;
      for (const it of pl) {
        const im = it.o.im; if (!im.naturalWidth) continue;
        const ar = im.naturalWidth / im.naturalHeight, s = it.o.s * it.o.gs * Math.max(.45, it.pr.scale * 1.15);
        const w = ar >= 1 ? s : s * ar, h = ar >= 1 ? s / ar : s, x = it.pr.px - w / 2, y = it.pr.py - h / 2;
        ctx.globalAlpha = it.a * 0.95;
        ctx.save(); roundRect(x, y, w, h, 5); ctx.clip(); ctx.drawImage(im, x, y, w, h); ctx.restore();
        ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.5; roundRect(x, y, w, h, 5); ctx.stroke();
        if (it.a > 0.4) { const pad = Math.max(0, 26 - Math.min(w, h)) / 2; photoRects.push({ i: it.o.i, x: x - pad, y: y - pad, w: w + pad * 2, h: h + pad * 2, z: it.pr.z }); }
      }

      // Chữ
      ctx.font = 'bold 15px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const w of wordObjects) {
        w.angle += w.speed;
        let ry = w.y; if (w.type === 'heart') ry += Math.sin(beatTime * 2 + w.angle) * 14;
        const pr = project3D(Math.cos(w.angle) * w.radius, ry, Math.sin(w.angle) * w.radius);
        const a = Math.max(.25, Math.min(1, (pr.scale - .2) * 2.5));
        ctx.globalAlpha = 1;
        ctx.strokeStyle = `rgba(255,150,110,${a * 0.9})`; ctx.lineWidth = 2.2; ctx.strokeText(w.text, pr.px, pr.py);
        ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillText(w.text, pr.px, pr.py);
      }
      ctx.globalAlpha = 1;
    }

    /* ================= COLLAPSE ================= */
    const collapseParts = [];
    function flowerOrigin() { return { x: width / 2, y: height * 0.88 }; }

    function startCollapse() {
      phase = 'collapse'; phaseT = 0; holding = false; collapseParts.length = 0; flyers.length = 0; photoRects.length = 0; pFly.length = 0;
      setUI('seq');
      const B = flowerOrigin();
      const add = (x, y, z, c, size) => {
        const pr = project3D(x, y, z), dx = pr.px - B.x, dy = pr.py - B.y;
        collapseParts.push({ r0: Math.hypot(dx, dy), a0: Math.atan2(dy, dx), swirl: 2.2 + Math.random() * 1.8, delay: Math.random() * 0.9, dur: 1.5 + Math.random() * 0.6, spr: c.spr, stroke: 'rgba(' + c.rgb + ',0.65)', size: size * Math.max(.6, pr.scale) * 5.5, px: pr.px, py: pr.py });
      };
      for (const p of heartParticles) {
        const live = isExploding || isRebuilding;
        add(live ? p.x : p.tx, live ? p.y : p.ty, live ? p.z : p.tz, p.c, p.size);
      }
      for (const d of diskParticles) add(Math.cos(d.angle) * d.radius, d.y, Math.sin(d.angle) * d.radius, d.c, d.size);
      for (const s of streams) add(Math.cos(s.angle) * s.r, s.y, Math.sin(s.angle) * s.r, s.c, s.w * 1.3);
      isExploding = false; isRebuilding = false;
    }

    function drawCollapse() {
      const B = flowerOrigin(), t = phaseT;
      ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineWidth = 1.1;
      for (const p of collapseParts) {
        const u = clamp01((t - p.delay) / p.dur);
        if (u >= 1) continue;
        const e = Math.pow(u, 1.7), r = p.r0 * (1 - e), a = p.a0 + p.swirl * e;
        const x = B.x + Math.cos(a) * r, y = B.y + Math.sin(a) * r;
        if (u > 0) { ctx.globalAlpha = 0.8; ctx.strokeStyle = p.stroke; ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(x, y); ctx.stroke(); }
        p.px = x; p.py = y;
        ctx.globalAlpha = 0.95;
        ctx.drawImage(p.spr, x - p.size / 2, y - p.size / 2, p.size, p.size);
      }
      const g = clamp01(t / 2.7), rad = 8 + g * 50 * (1 + Math.sin(t * 14) * 0.05);
      ctx.globalAlpha = 0.5 + 0.5 * g;
      ctx.drawImage(palette[3].spr, B.x - rad, B.y - rad, rad * 2, rad * 2);
      ctx.drawImage(palette[0].spr, B.x - rad * 1.6, B.y - rad * 1.6, rad * 3.2, rad * 3.2);
      if (t > 2.6) {
        const k = clamp01((t - 2.6) / 0.5);
        ctx.globalAlpha = Math.sin(k * Math.PI) * 0.9;
        const R = 40 + k * Math.max(width, height) * 0.35;
        ctx.drawImage(palette[3].spr, B.x - R, B.y - R, R * 2, R * 2);
      }
      ctx.globalAlpha = 1;
      if (t >= 3.15) { phase = 'flower'; phaseT = 0; initFlower(); }
    }

    /* ================= HOA NỞ ================= */
    const GREET_START = 6.6, PETAL_END = 7.5, NEXT_SHOW = 12.0, AUTO_WAIT = 7.5;
    let petalStart = null;
    const easeBack = x => { x = clamp01(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

    const PALS = {
      pink: ['#ee5f9b', '#fde6f0', '#ffe58a'], magenta: ['#d23c8a', '#ffc2dc', '#ffd45e'], coral: ['#ff6a82', '#ffd8ca', '#ffe27a'],
      lavender: ['#8a6fdc', '#ece2ff', '#ffe58a'], white: ['#ffffff', '#f7a9c8', '#f5b932'], peach: ['#ff9a66', '#fff0cf', '#ffd66e'],
      sky: ['#3e8ef0', '#dff0ff', '#ffe58a'], red: ['#e8294f', '#ffb3c1', '#ffd45e'], yellow: ['#ffb81f', '#fff4b0', '#c4571a'],
      mint: ['#2fc8a0', '#e0fff4', '#ffe58a'], violet: ['#6a3fd0', '#d9c4ff', '#ffe58a'], orange: ['#ff7a2a', '#ffe0b5', '#fff0a0']
    };
    const FL_DEF = [
      { type: 'lotus', x0: 0, x1: 0, y1: -58, cx: -5, cy: -32, size: 1.1, delay: 1.0 },
      { type: 'blossom', x0: -3, x1: -22, y1: -42, cx: -5, cy: -26, size: 1.05, delay: 1.5 },
      { type: 'blossom', x0: 3, x1: 21, y1: -45, cx: 8, cy: -26, size: 1.05, delay: 1.8 },
      { type: 'tulip', x0: -6, x1: -38, y1: -28, cx: -14, cy: -12, size: 0.95, delay: 2.3 },
      { type: 'daisy', x0: 6, x1: 37, y1: -31, cx: 16, cy: -14, size: 0.9, delay: 2.5 },
      { type: 'daisy', x0: -1, x1: -10, y1: -52, cx: -8, cy: -32, size: 0.85, delay: 2.1 },
      { type: 'tulip', x0: 1, x1: 11, y1: -54, cx: 8, cy: -32, size: 0.85, delay: 2.7 },
      { type: 'lotus', x0: -5, x1: -33, y1: -46, cx: -20, cy: -22, size: 0.9, delay: 2.9 },
      { type: 'blossom', x0: 5, x1: 31, y1: -50, cx: 20, cy: -26, size: 0.95, delay: 3.1 },
      { type: 'bud', x0: -8, x1: -29, y1: -16, cx: -18, cy: -5, size: 1.0, delay: 3.0 },
      { type: 'bud', x0: 8, x1: 29, y1: -18, cx: 18, cy: -5, size: 1.0, delay: 3.3 },
      { type: 'daisy', x0: -4, x1: -48, y1: -18, cx: -26, cy: -8, size: 0.8, delay: 3.4 },
      { type: 'blossom', x0: 4, x1: 46, y1: -14, cx: 24, cy: -6, size: 0.85, delay: 3.6 },
      { type: 'tulip', x0: 0, x1: 2, y1: -66, cx: -3, cy: -38, size: 0.8, delay: 3.2 }
    ];
    const GRASS = ['#9a63b5', '#c27bb0', '#7e4fb0', '#3fae8f', '#2a8f86', '#e08ab8', '#b07be0'];
    let flowers = [], blades = [], leaves = [], bubbles = [], fireflies = [], motes = [], pals = {};
    let gTeal, gTeal2, gLeaflet;

    function makePetals(type) {
      const P = []; const add = (angs, len, wr, sharp, layer) => angs.forEach(a => P.push({ a, len, wr, sharp, layer }));
      if (type === 'blossom') { add([-78, -39, 0, 39, 78], 9, 0.5, 0.15, 0); add([-24, 24], 6.8, 0.46, 0.2, 1); add([0], 6, 0.42, 0.2, 2); }
      else if (type === 'tulip') { add([-30, 30], 8.8, 0.46, 0.55, 0); add([-14, 14], 9.4, 0.46, 0.55, 1); add([0], 9.8, 0.5, 0.6, 2); }
      else if (type === 'daisy') {
        const a1 = [], a2 = [];
        for (let i = 0; i < 13; i++) a1.push(-80 + i * (160 / 12));
        for (let i = 0; i < 10; i++) a2.push(-72 + i * (144 / 9));
        add(a1, 7.6, 0.14, 0.15, 0); add(a2, 6, 0.14, 0.15, 1);
      }
      else if (type === 'lotus') { add([-80, -40, 0, 40, 80], 10, 0.36, 0.85, 0); add([-62, -22, 22, 62], 8.6, 0.36, 0.85, 1); add([-38, 0, 38], 6.8, 0.34, 0.8, 2); }
      else { add([-12, 12], 4.4, 0.42, 0.6, 0); add([0], 4.8, 0.44, 0.6, 1); }
      P.sort((p, q) => p.layer - q.layer || Math.abs(q.a) - Math.abs(p.a));
      return P;
    }

    function initFlower() {
      petalStart = null;
      for (const k in PALS) {
        const a = PALS[k], g = ctx.createLinearGradient(0, 0, 1, 0);
        g.addColorStop(0, a[0]); g.addColorStop(1, a[1]);
        pals[k] = { g, center: a[2] };
      }
      gTeal = ctx.createLinearGradient(0, 0, 1, 0); gTeal.addColorStop(0, '#0a4f58'); gTeal.addColorStop(1, '#19b3a0');
      gTeal2 = ctx.createLinearGradient(0, 0, 1, 0); gTeal2.addColorStop(0, '#0b3a5a'); gTeal2.addColorStop(1, '#2bb0b8');
      gLeaflet = ctx.createLinearGradient(0, 0, 1, 0); gLeaflet.addColorStop(0, '#e98fb0'); gLeaflet.addColorStop(1, '#fbd0df');

      // mỗi bông một màu ngẫu nhiên, trộn thứ tự để các bông cạnh nhau khác màu
      const keys = Object.keys(PALS).sort(() => Math.random() - .5);
      flowers = FL_DEF.map((d, i) => ({
        d, pal: pals[keys[i % keys.length]], head: { x: d.x1, y: d.y1 }, vis: 0, bT: -1, w: 0.9 + Math.random() * 0.4,
        petals: makePetals(d.type).map(p => Object.assign({}, p, { detached: false, at: i * 0.18 + Math.random() * 0.7 + p.layer * 0.08, x: 0, y: 0, rot: 0, sz: 1, vr: 0, bx: 0, by: 0, t0: 0, tr: [], seed: Math.random() * 10 }))
      }));

      // cỏ dày hơn, cao thấp ngẫu nhiên, nhiều màu
      blades = [];
      for (let i = 0; i < 190; i++) {
        const x = (Math.random() + Math.random() + Math.random() - 1.5) * 64;
        blades.push({ x, h: 12 + Math.pow(Math.random(), 1.4) * 58, lean: (Math.random() - .5) * 26, w: 0.7 + Math.random() * 1.6, delay: Math.random() * 2.2, col: GRASS[(Math.random() * GRASS.length) | 0] });
      }
      blades.sort((a, b) => b.h - a.h);
      leaves = [];
      for (let i = 0; i < 38; i++) leaves.push({
        x: (i - 18.5) * 0.9, y: -Math.random() * 3,
        ang: (-172 + i * (164 / 37) + (Math.random() - .5) * 14) * Math.PI / 180, len: 10 + Math.random() * 14, delay: 0.4 + Math.random() * 1.6,
        g: Math.random() < 0.65 ? gTeal : gTeal2
      });
      bubbles = [{ x: -44, y: -48, r: 5.5, d: 3.4 }, { x: -20, y: -64, r: 3.4, d: 3.9 }, { x: 24, y: -66, r: 3, d: 4.1 },
      { x: 42, y: -52, r: 5, d: 3.7 }, { x: 12, y: -32, r: 2.6, d: 4.4 }, { x: 48, y: -22, r: 3.6, d: 4.6 }];
      fireflies = [];
      const fc = ['255,170,80', '255,220,120', '255,150,190', '255,255,255'];
      for (let i = 0; i < 60; i++) fireflies.push({ x: (Math.random() - .5) * 90, y: -10 - Math.random() * 70, ph: Math.random() * 10, c: fc[(Math.random() * 4) | 0], s: 0.25 + Math.random() * 0.3, d: 1.5 + Math.random() * 3 });
      motes = [];
      for (let i = 0; i < 50; i++) motes.push({ x: (Math.random() - .5) * 70, ph: Math.random() * 10, sp: 4 + Math.random() * 7, c: fc[(Math.random() * 4) | 0], s: 0.2 + Math.random() * 0.25 });
    }

    function triggerPetals() { if (phase !== 'flower' || petalStart !== null) return; petalStart = phaseT; nextBtn.style.display = 'none'; }

    function quad(p0, c, p1, t) { const m = 1 - t; return m * m * p0 + 2 * m * t * c + t * t * p1; }
    function heartPath(s) {
      ctx.beginPath(); ctx.moveTo(0, s * .9);
      ctx.bezierCurveTo(-s * 1.3, s * .1, -s * .7, -s * .9, 0, -s * .35);
      ctx.bezierCurveTo(s * .7, -s * .9, s * 1.3, s * .1, 0, s * .9); ctx.closePath();
    }
    function petalShape(wr, sharp) {
      const cx2 = 0.55 + 0.25 * (1 - sharp), cw = wr * (1 - 0.5 * sharp);
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.bezierCurveTo(0.12, -wr, cx2, -cw, 1, 0);
      ctx.bezierCurveTo(cx2, cw, 0.12, wr, 0, 0); ctx.closePath();
    }
    function drawPetal(pal, wr, sharp) {
      petalShape(wr, sharp); ctx.fillStyle = pal.g; ctx.fill();
      ctx.save(); ctx.scale(0.85, 0.55); petalShape(wr, sharp); ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fill(); ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 0.018; petalShape(wr, sharp); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0.06, 0); ctx.lineTo(0.72, 0); ctx.stroke();
    }
    function drawLeafShape(grad, wr, vein) {
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(0.4, -wr, 1, 0); ctx.quadraticCurveTo(0.4, wr, 0, 0); ctx.closePath();
      ctx.fillStyle = grad; ctx.fill();
      if (vein) { ctx.strokeStyle = 'rgba(170,255,235,0.35)'; ctx.lineWidth = 0.025; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0.88, 0); ctx.stroke(); }
    }

    function drawGreeting(alpha, tt) {
      const lines = ['Chúc em ngày 20/10', 'thật vui vẻ ♥'];
      const fs = Math.min(width * 0.075, 46);
      ctx.font = '700 ' + fs + 'px "Segoe UI",-apple-system,Roboto,sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      let idx = 0;
      lines.forEach((ln, li) => {
        const total = ctx.measureText(ln).width, sx = width / 2 - total / 2, y = height * 0.12 + li * fs * 1.35;
        for (let i = 0; i < ln.length; i++) {
          const a = clamp01((tt - idx * 0.07) / 0.45) * alpha; idx++;
          if (a <= 0) continue;
          const x = sx + ctx.measureText(ln.slice(0, i)).width;
          ctx.globalAlpha = a; ctx.fillStyle = li === 0 ? '#ffe3ee' : '#ffb8d3';
          ctx.fillText(ln[i], x, y + (1 - a) * 10);
        }
      });
      ctx.globalAlpha = 1;
    }

    function drawFlowerScene(dt) {
      const T = phaseT;
      // nút Liquid Glass: tự chuyển sau 5 giây nếu không bấm
      if (petalStart === null && T > NEXT_SHOW) {
        if (nextBtn.style.display === 'none') nextBtn.style.display = '';
        const p = clamp01((T - NEXT_SHOW) / AUTO_WAIT);
        nextBtn.style.setProperty('--p', p);
        if (p >= 1) triggerPetals();
      }
      const petalT = petalStart === null ? -1 : T - petalStart;
      const u = Math.min(width, height * 0.74) / 90, O = flowerOrigin();
      const fade = petalT > 0 ? 1 - clamp01((petalT - 0.8) / 3.2) : 1;
      ctx.globalCompositeOperation = 'source-over';

      ctx.save(); ctx.translate(O.x, O.y); ctx.scale(u, u);
      ctx.globalAlpha = fade; ctx.lineCap = 'round';

      for (const b of blades) {
        const g = easeOut((T - b.delay) / 1.8); if (g <= 0) continue;
        const sway = Math.sin(clock * 1.2 + b.x) * 1.6 * g, tipx = b.x + (b.lean + sway) * g, tipy = -b.h * g;
        ctx.fillStyle = b.col; ctx.beginPath();
        ctx.moveTo(b.x - b.w, 0); ctx.quadraticCurveTo(b.x + b.lean * 0.1 * g, tipy * 0.55, tipx, tipy);
        ctx.quadraticCurveTo(b.x + b.lean * 0.1 * g + b.w * 0.6, tipy * 0.5, b.x + b.w, 0); ctx.fill();
      }

      flowers.forEach((fl, i) => {
        const d = fl.d, tg = easeOut((T - d.delay) / 2.4);
        fl.vis = 0;
        if (tg <= 0) return;
        const sw = Math.sin(clock * 1.1 + i * 1.7) * 0.9 * tg;
        const cx = d.cx + sw * 0.5, x1 = d.x1 + sw, y1 = d.y1;
        ctx.strokeStyle = '#e9a8c6'; ctx.lineWidth = fl.w; ctx.beginPath(); ctx.moveTo(d.x0, 0);
        for (let t = 0.05; t < tg; t += 0.05) ctx.lineTo(quad(d.x0, cx, x1, t), quad(0, d.cy, y1, t));
        ctx.lineTo(quad(d.x0, cx, x1, tg), quad(0, d.cy, y1, tg)); ctx.stroke();
        for (let k = 0; k < 5; k++) {
          const tk = 0.22 + k * 0.14; if (tg < tk) continue;
          const side = k % 2 ? 1 : -1, s = easeBack((tg - tk) / 0.2);
          const m = 1 - tk, tx = 2 * m * (cx - d.x0) + 2 * tk * (x1 - cx), ty = 2 * m * d.cy + 2 * tk * (y1 - d.cy);
          ctx.save(); ctx.translate(quad(d.x0, cx, x1, tk), quad(0, d.cy, y1, tk));
          ctx.rotate(Math.atan2(ty, tx) + side * 0.85 + Math.sin(clock * 1.4 + i + k) * 0.05); ctx.scale(7 * s, 7 * s); drawLeafShape(gLeaflet, 0.28, false); ctx.restore();
        }
        fl.head.x = quad(d.x0, cx, x1, tg); fl.head.y = quad(0, d.cy, y1, tg);
        fl.vis = easeOut((tg - 0.7) / 0.3);
        fl.bT = T - (d.delay + 2.4);
      });

      leaves.forEach((l, i) => {
        const g = easeOut((T - l.delay) / 1.8); if (g <= 0) return;
        ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.ang + Math.sin(clock * 1.3 + i) * 0.03 * g);
        ctx.scale(l.len * g, l.len * g); drawLeafShape(l.g, 0.42, true); ctx.restore();
      });

      for (const b of bubbles) {
        const a = clamp01((T - b.d) / 1.0); if (a <= 0) continue;
        const by = b.y + Math.sin(clock * 0.9 + b.x) * 1.2, s = (1 + Math.sin(clock * 2 + b.x) * 0.06) * Math.max(0.01, easeBack(a));
        ctx.globalAlpha = fade * a * 0.95;
        ctx.fillStyle = 'rgba(20,10,40,0.6)'; ctx.strokeStyle = 'rgba(255,205,230,0.85)'; ctx.lineWidth = b.r > 4 ? 0.55 : 0.35;
        ctx.beginPath(); ctx.arc(b.x, by, b.r * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.save(); ctx.translate(b.x, by); heartPath(b.r * 0.52 * s); ctx.fillStyle = '#8f84d9'; ctx.fill(); ctx.restore();
      }

      if (T > 0.8) {
        ctx.globalCompositeOperation = 'lighter';
        for (const m of motes) {
          const q = ((clock * m.sp + m.ph * 20) % 80) / 80, a = Math.sin(Math.PI * q) * clamp01((T - 0.8) / 1.5);
          ctx.globalAlpha = fade * a * 0.9; ctx.fillStyle = 'rgb(' + m.c + ')';
          ctx.beginPath(); ctx.arc(m.x + Math.sin(clock + m.ph) * 2.5, -q * 80, m.s, 0, Math.PI * 2); ctx.fill();
        }
        for (const f of fireflies) {
          const a = clamp01((T - 2) / 2) * (0.4 + 0.6 * Math.abs(Math.sin(clock * f.d + f.ph)));
          ctx.globalAlpha = fade * a; ctx.fillStyle = 'rgb(' + f.c + ')';
          ctx.beginPath(); ctx.arc(f.x + Math.sin(clock * 0.6 + f.ph) * 2.5, f.y + Math.cos(clock * 0.5 + f.ph) * 2.5, f.s, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
      }

      flowers.forEach((fl, i) => {
        if (fl.vis <= 0) return;
        const d = fl.d, bT = fl.bT, maxOpen = d.type === 'bud' ? 0.5 : 1;
        const rotH = Math.sin(clock * 0.9 + i * 1.3) * 0.05, S = d.size * fl.vis;
        ctx.globalAlpha = 1;
        ctx.save(); ctx.translate(fl.head.x, fl.head.y); ctx.rotate(rotH); ctx.scale(S, S);
        for (const p of fl.petals) {
          if (p.detached) continue;
          const kn = easeBack((bT - p.layer * 0.2 - Math.abs(p.a) / 90 * 0.18) / 1.1), ko = kn * maxOpen;
          const ang = -Math.PI / 2 + p.a * Math.PI / 180 * (0.12 + 0.88 * ko) + Math.sin(clock * 1.6 + i + p.a) * 0.025 * ko;
          const lf = 0.55 + 0.45 * Math.min(kn, 1.1);
          if (petalT > p.at) {
            p.detached = true;
            p.x = O.x + u * fl.head.x; p.y = O.y + u * fl.head.y; p.rot = ang + rotH; p.sz = S * p.len * lf;
            p.vr = (Math.random() - .5) * 2.5;
            const sp = 200 + Math.random() * 180, dir = ang + rotH + (Math.random() - .5) * 0.9;
            p.bx = Math.cos(dir) * sp; p.by = Math.sin(dir) * sp; p.t0 = clock; p.tr = []; p.pal = fl.pal;
            continue;
          }
          ctx.save(); ctx.rotate(ang); ctx.scale(p.len * lf, p.len * lf); drawPetal(fl.pal, p.wr, p.sharp); ctx.restore();
        }
        ctx.globalAlpha = fade;
        const ck = easeOut(bT / 1.3);
        if (d.type === 'blossom') {
          ctx.fillStyle = fl.pal.center; ctx.beginPath(); ctx.ellipse(0, 0.4, 3.3 * ck, 1.7 * ck, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fff3c8'; ctx.beginPath(); ctx.ellipse(0, 0.1, 2.2 * ck, 0.9 * ck, 0, 0, Math.PI * 2); ctx.fill();
        } else if (d.type === 'daisy') {
          ctx.fillStyle = fl.pal.center; ctx.beginPath(); ctx.arc(0, -0.3, 1.9 * ck, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(150,90,20,0.55)'; ctx.beginPath(); ctx.arc(0, -0.3, 0.9 * ck, 0, Math.PI * 2); ctx.fill();
        } else if (d.type === 'lotus') {
          ctx.strokeStyle = fl.pal.center; ctx.fillStyle = fl.pal.center; ctx.lineWidth = 0.3;
          for (let j = -3; j <= 3; j++) {
            const a = -Math.PI / 2 + j * 0.24, l = 3.4 * ck, ex = Math.cos(a) * l, ey = Math.sin(a) * l;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ex, ey); ctx.stroke();
            ctx.beginPath(); ctx.arc(ex, ey, 0.4, 0, Math.PI * 2); ctx.fill();
          }
        }
        if (bT > 0.1 && bT < 1.6) {
          const st = (bT - 0.1) / 1.5;
          ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = fl.pal.center;
          for (let k = 0; k < 10; k++) {
            const a = k * 0.628 + i, dist = easeOut(st) * 13;
            ctx.globalAlpha = (1 - st) * 0.9;
            ctx.beginPath(); ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist - 4, 0.5 * (1 - st * 0.5), 0, Math.PI * 2); ctx.fill();
          }
          ctx.globalCompositeOperation = 'source-over';
        }
        ctx.restore();
      });
      ctx.restore();

      if (petalT > 0) {
        const margin = 90;
        for (const fl of flowers) for (const p of fl.petals) {
          if (!p.detached) continue;
          const age = clock - p.t0, burst = Math.exp(-age * 1.4);
          let vx = p.bx * burst + Math.sin(p.y * 0.006 + clock * 0.7 + p.seed) * 70 + Math.cos(p.seed * 3) * 20;
          let vy = p.by * burst + Math.cos(p.x * 0.005 + clock * 0.55 + p.seed * 1.7) * 50 - 14;
          if (p.x < margin) vx += (margin - p.x) * 1.5; if (p.x > width - margin) vx -= (p.x - (width - margin)) * 1.5;
          if (p.y < margin) vy += (margin - p.y) * 1.5; if (p.y > height - margin) vy -= (p.y - (height - margin)) * 1.5;
          p.x += vx * dt; p.y += vy * dt; p.rot += p.vr * dt;
          p.tr.push(p.x, p.y); if (p.tr.length > 20) p.tr.splice(0, 2);
          const sc = Math.min(1.9, 1 + age * 0.5), flip = 0.3 + 0.7 * Math.abs(Math.cos(clock * 1.6 + p.seed));
          ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgb(255,225,238)';
          const n = p.tr.length / 2;
          for (let j = 0; j < n; j++) { ctx.globalAlpha = (j / n) * 0.35; ctx.beginPath(); ctx.arc(p.tr[j * 2], p.tr[j * 2 + 1], 1.5, 0, Math.PI * 2); ctx.fill(); }
          ctx.globalCompositeOperation = 'source-over';
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(u * p.sz * sc, u * p.sz * sc * flip);
          ctx.globalAlpha = 1; drawPetal(p.pal, p.wr, p.sharp); ctx.restore();
        }
      }

      if (T > GREET_START) {
        const ta = petalT > 1 ? 1 - clamp01((petalT - 1) / 1.2) : 1;
        if (ta > 0) drawGreeting(ta, T - GREET_START);
      }
      ctx.globalAlpha = 1;
      if (petalT > PETAL_END) startWarp();
    }

    /* ================= WARP RỒI HỐ ĐEN ================= */
    const warpStars = []; const bhDisk = []; const bhArch = []; const infall = [];
    function startWarp() {
      phase = 'warp'; phaseT = 0; nextBtn.style.display = 'none'; bhZoom = bhTarget = 0.78; buildBhPhotos(); pFly.length = 0;
      warpStars.length = 0;
      const cols = ['210,225,255', '255,210,235', '205,190,255', '255,255,255'];
      for (let i = 0; i < 650; i++) warpStars.push({ x: (Math.random() - .5) * 2, y: (Math.random() - .5) * 2, z: Math.random() * 2 + 0.05, c: cols[(Math.random() * 4) | 0] });
      bhDisk.length = 0; for (let i = 0; i < 900; i++) bhDisk.push({ a: Math.random() * Math.PI * 2, r: 1.35 + Math.pow(Math.random(), 1.5) * 2.6 });
      bhArch.length = 0; for (let i = 0; i < 420; i++) bhArch.push({ a0: Math.random() * Math.PI, k: Math.random() });
      infall.length = 0; for (let i = 0; i < 260; i++) infall.push({ a: Math.random() * Math.PI * 2, r: 5 + Math.random() * 10, h: [] });
    }

    function warpSpeed(t) {
      if (t < 1.5) return 0.15 + Math.pow(t / 1.5, 2) * 4.5;
      if (t < 3.3) return 4.65;
      return 4.65 + (0.12 - 4.65) * easeOut((t - 3.3) / 2.2);
    }

    function drawWarp(dt) {
      photoRects.length = 0; bhZoom += (bhTarget - bhZoom) * Math.min(1, dt * 9);
      const t = phaseT, speed = warpSpeed(t), cx = width / 2, cy = height * 0.5, k = Math.max(width, height) * 0.5;
      ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      const boost = clamp01(speed / 4.6);

      if (boost > 0.02) {
        const g = ctx.createRadialGradient(cx, cy, k * 0.15, cx, cy, k * 1.3);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(80,100,255,' + (0.2 * boost) + ')');
        ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, width, height);
        const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, k * 0.3);
        g2.addColorStop(0, 'rgba(200,215,255,' + (0.35 * boost) + ')'); g2.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g2; ctx.fillRect(0, 0, width, height);
      }

      for (const s of warpStars) {
        s.z -= speed * dt;
        if (s.z < 0.05) { s.z = 2; s.x = (Math.random() - .5) * 2; s.y = (Math.random() - .5) * 2; }
        const zp = s.z + speed * 0.05 + 0.006;
        const x2 = cx + s.x * k / s.z * 0.5, y2 = cy + s.y * k / s.z * 0.5, x1 = cx + s.x * k / zp * 0.5, y1 = cy + s.y * k / zp * 0.5;
        if (x2 < -50 || x2 > width + 50 || y2 < -50 || y2 > height + 50) continue;
        ctx.globalAlpha = clamp01(0.25 + (1 - s.z / 2) * 0.9);
        ctx.strokeStyle = 'rgb(' + s.c + ')'; ctx.lineWidth = 0.6 + (2 - s.z) * 0.7 * (1 + speed * 0.1);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }

      const hole = easeOut((t - 3.2) / 2.6);
      if (hole > 0) drawBlackHole(hole, dt, cx, cy);

      if (t < 0.7) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = (1 - t / 0.7) * 0.55; ctx.fillStyle = '#ffe6f2'; ctx.fillRect(0, 0, width, height);
      }
      ctx.globalAlpha = 1;
      if (t > 8 && replayBtn.style.display === 'none') setUI('end');
    }

    // cột sáng (relativistic jet) xuyên qua hố đen, vuông góc với đĩa
    function drawJet(h, cx, cy, R, tilt) {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt); ctx.globalCompositeOperation = 'lighter';
      const L = Math.max(width, height) * 1.1, pulse = 0.85 + 0.15 * Math.sin(clock * 3);
      for (const dir of [-1, 1]) {
        for (const [wr, al] of [[0.6, 0.10], [0.32, 0.18], [0.12, 0.6]]) {
          const g = ctx.createLinearGradient(0, 0, 0, dir * L);
          g.addColorStop(0, 'rgba(225,235,255,' + (al * h * pulse) + ')');
          g.addColorStop(0.45, 'rgba(150,170,255,' + (al * 0.45 * h * pulse) + ')');
          g.addColorStop(1, 'rgba(120,120,255,0)');
          ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath();
          ctx.moveTo(-R * wr * 0.5, 0); ctx.lineTo(-R * wr * 1.7, dir * L); ctx.lineTo(R * wr * 1.7, dir * L); ctx.lineTo(R * wr * 0.5, 0); ctx.closePath(); ctx.fill();
        }
      }
      ctx.fillStyle = 'rgb(235,242,255)';
      for (let i = 0; i < 60; i++) {
        const q = (clock * 0.35 + i * 0.618) % 1, dir = i % 2 ? 1 : -1, off = Math.sin(i * 12.9) * R * 0.12 * (1 + q * 2);
        ctx.globalAlpha = h * (1 - q) * 0.8; ctx.fillRect(off, dir * (R * 0.5 + q * L * 0.9), 2, 2);
      }
      ctx.restore(); ctx.globalAlpha = 1;
    }

    function drawBlackHole(h, dt, cx, cy) {
      const R = Math.min(width, height) * 0.11 * h * bhZoom;
      computeBhPhotos(cx, cy, R);
      ctx.globalCompositeOperation = 'lighter';
      const gl = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 4.2);
      gl.addColorStop(0, 'rgba(255,150,70,0.38)'); gl.addColorStop(0.35, 'rgba(200,70,140,0.13)'); gl.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = h; ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(cx, cy, R * 4.2, 0, Math.PI * 2); ctx.fill();

      const tilt = -0.22, ct = Math.cos(tilt), st = Math.sin(tilt);
      const drawDisk = front => {
        for (const p of bhDisk) {
          if (front) p.a += dt * (2.2 / Math.pow(p.r, 1.5));
          const s = Math.sin(p.a);
          if ((s >= 0) !== front) continue;
          const rr = p.r * R, x = Math.cos(p.a) * rr, y = s * rr * 0.2;
          const tt = (p.r - 1.35) / 2.6;
          ctx.globalAlpha = h * (0.35 + 0.65 * (1 - tt)) * (0.6 + 0.4 * Math.cos(p.a));
          ctx.fillStyle = 'rgb(255,' + ((235 - 145 * tt) | 0) + ',' + ((190 - 50 * tt) | 0) + ')';
          ctx.fillRect(cx + x * ct - y * st, cy + x * st + y * ct, 2, 2);
        }
      };
      drawDisk(false);
      for (const p of bhArch) {
        const a = Math.PI + ((p.a0 + clock * 0.15 * (1 + p.k)) % Math.PI);
        ctx.globalAlpha = h * 0.5 * (1 - p.k);
        ctx.fillStyle = 'rgb(255,' + ((220 - 80 * p.k) | 0) + ',' + ((170 - 40 * p.k) | 0) + ')';
        ctx.fillRect(cx + Math.cos(a) * R * (1.25 + p.k * 0.7), cy + Math.sin(a) * R * (1.15 + p.k * 0.55), 2, 2);
      }
      ctx.globalCompositeOperation = 'source-over';
      drawBhPhotos(bhBack, h); ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = h; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,150,70,0.18)'; ctx.lineWidth = R * 0.12; ctx.beginPath(); ctx.arc(cx, cy, R * 1.06, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,228,190,0.9)'; ctx.lineWidth = R * 0.035; ctx.beginPath(); ctx.arc(cx, cy, R * 1.02, 0, Math.PI * 2); ctx.stroke();
      drawJet(h, cx, cy, R, tilt);
      ctx.globalCompositeOperation = 'lighter';
      drawDisk(true);
      drawBhPhotos(bhFront, h);

      if (h > 0.15) {
        ctx.lineWidth = 1;
        for (const s of infall) {
          s.r -= dt * (0.6 + 4 / s.r); s.a += dt * (1.6 / s.r);
          if (s.r < 1.05) { s.r = 8 + Math.random() * 7; s.h.length = 0; continue; }
          s.h.push(cx + Math.cos(s.a) * s.r * R, cy + Math.sin(s.a) * s.r * R * 0.8);
          if (s.h.length > 20) s.h.splice(0, 2);
          const n = s.h.length / 2; ctx.strokeStyle = 'rgb(255,215,235)';
          for (let j = 1; j < n; j++) {
            ctx.globalAlpha = h * (j / n) * 0.6;
            ctx.beginPath(); ctx.moveTo(s.h[(j - 1) * 2], s.h[(j - 1) * 2 + 1]); ctx.lineTo(s.h[j * 2], s.h[j * 2 + 1]); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    /* ================= VÒNG ẢNH SAU BIG BANG ================= */
    const RINGS = [
      { r: 280, s: 60, w: 0.32, tilt: 1.15, yaw: 0.0, wt: 5 },
      { r: 410, s: 90, w: -0.25, tilt: 0.80, yaw: 0.9, wt: 6 },
      { r: 550, s: 125, w: 0.20, tilt: 1.30, yaw: 1.8, wt: 7 },
      { r: 710, s: 165, w: -0.15, tilt: 0.95, yaw: 2.7, wt: 9 }
    ];
    function ringPos(o) {
      const R = RINGS[o.ring], rs = Math.min(1.1, Math.max(0.5, Math.min(width, height) / 820));
      const ang = o.ringA0 + clock * R.w, X = Math.cos(ang) * R.r * rs, Z = Math.sin(ang) * R.r * rs;
      const y1 = -Z * Math.sin(R.tilt), z1 = Z * Math.cos(R.tilt), cy = Math.cos(R.yaw), sy = Math.sin(R.yaw);
      return { x: X * cy + z1 * sy, y: -140 + y1 + Math.sin(beatTime * 0.9 + o.bob) * 10, z: -X * sy + z1 * cy };
    }
    function ringPhotos() {
      const idx = photoObjs.map((_, i) => i).sort(() => Math.random() - .5);
      const tw = RINGS.reduce((a, r) => a + r.wt, 0), cnt = []; let taken = 0;
      RINGS.forEach((r, j) => { cnt[j] = j === RINGS.length - 1 ? Math.max(0, idx.length - taken) : Math.round(idx.length * r.wt / tw); taken += cnt[j]; });
      let p = 0;
      RINGS.forEach((R, j) => {
        for (let n = 0; n < cnt[j]; n++) {
          const o = photoObjs[idx[p++]]; if (!o) continue;
          o.mode = 'ring'; o.ring = j; o.ringA0 = n * Math.PI * 2 / cnt[j] + rnd(-0.08, 0.08); o.bob = rnd(0, 10);
          o.s = R.s; o.x = 0; o.y = -140; o.z = 0; o.fd = 0; o.gs = 0; o.delay = rnd(0.05, 0.4) + j * 0.15;
        }
      });
    }
    function restorePhotos() {
      for (const o of photoObjs) if (o.mode === 'ring') { o.mode = o.base; o.s = o.s0; o.gs = 1; o.fd = 1; spawnPhoto(o, true); }
    }

    /* ================= ẢNH BAY QUANH HỐ ĐEN + ZOOM ================= */
    const bhPhotos = [], bhBack = [], bhFront = [];
    let bhZoom = 0.78, bhTarget = 0.78; const BH_MIN = 0.28, BH_MAX = 3.2;
    const bhZ = k => { bhTarget = Math.max(BH_MIN, Math.min(BH_MAX, bhTarget * k)); };
    document.getElementById('zIn').addEventListener('click', e => { e.stopPropagation(); bhZ(1.3); });
    document.getElementById('zOut').addEventListener('click', e => { e.stopPropagation(); bhZ(1 / 1.3); });

    // 4 vành đai quỹ đạo phân tầng quanh hố đen
    const BH_RINGS = [
      { r: 2.1, sp: 0.38, tilt: -0.15, yRange: [-0.6, 0.6], k: 0.95 },
      { r: 3.2, sp: -0.28, tilt: 0.18, yRange: [-1.2, 1.2], k: 1.15 },
      { r: 4.4, sp: 0.22, tilt: -0.25, yRange: [-1.8, 1.8], k: 1.35 },
      { r: 5.7, sp: -0.16, tilt: 0.12, yRange: [-2.5, 2.5], k: 1.55 }
    ];

    function buildBhPhotos() {
      bhPhotos.length = 0;
      photoImgs.forEach((im, i) => {
        const ringIdx = i % BH_RINGS.length;
        const ring = BH_RINGS[ringIdx];
        const countInRing = Math.ceil(photoImgs.length / BH_RINGS.length);
        const posInRing = Math.floor(i / BH_RINGS.length);
        const baseAngle = (posInRing / countInRing) * Math.PI * 2 + rnd(-0.15, 0.15);

        bhPhotos.push({
          i,
          im,
          ringIdx,
          a: baseAngle,
          r: ring.r + rnd(-0.25, 0.25),
          y: rnd(ring.yRange[0], ring.yRange[1]),
          sp: ring.sp * rnd(0.9, 1.1),
          k: ring.k * rnd(0.92, 1.08),
          tilt: ring.tilt + rnd(-0.08, 0.08),
          bob: rnd(0, 10)
        });
      });
    }

    function computeBhPhotos(cx, cy, R) {
      bhBack.length = 0; bhFront.length = 0;
      const U = Math.min(width, height) * 0.11;
      const wx = Math.min(1.05, (width * 0.48) / (5.6 * U));
      for (const o of bhPhotos) {
        const im = o.im; if (!im.naturalWidth) continue;
        const ang = o.a + clock * o.sp;
        const sa = Math.sin(ang), ca = Math.cos(ang);
        const ar = im.naturalWidth / im.naturalHeight;
        const sz = R * o.k * (0.8 + 0.3 * (sa + 1) / 2);
        const w = ar >= 1 ? sz : sz * ar, hh = ar >= 1 ? sz / ar : sz;
        const x = cx + ca * o.r * R * wx;
        const y = cy + o.y * R + sa * o.r * R * 0.24 + Math.sin(clock * 0.8 + o.bob) * 0.12 * R;
        (sa > 0 ? bhFront : bhBack).push({ o, x, y, w, h: hh, sa });
      }
      bhBack.sort((p, q) => p.sa - q.sa); bhFront.sort((p, q) => p.sa - q.sa);
    }
    function drawBhPhotos(list, hole) {
      const fa = clamp01((hole - 0.35) / 0.5); if (fa <= 0) return;
      ctx.globalCompositeOperation = 'source-over';
      for (const it of list) {
        const al = fa * (0.45 + 0.55 * (it.sa + 1) / 2), hw = it.w / 2, hh = it.h / 2;
        ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.o.tilt); ctx.globalAlpha = al;
        ctx.shadowColor = 'rgba(255,170,210,.55)'; ctx.shadowBlur = 12;
        roundRect(-hw, -hh, it.w, it.h, 5); ctx.fillStyle = '#000'; ctx.fill(); ctx.shadowBlur = 0;
        ctx.save(); ctx.clip(); ctx.drawImage(it.o.im, -hw, -hh, it.w, it.h); ctx.restore();
        ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.5; roundRect(-hw, -hh, it.w, it.h, 5); ctx.stroke();
        ctx.restore();
        if (al > 0.4) photoRects.push({ i: it.o.i, x: it.x - hw, y: it.y - hh, w: it.w, h: it.h, z: -it.sa });
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'lighter';
    }

    /* ================= ẢNH BAY SƯỢT QUA MÀN HÌNH ================= */
    const pFly = []; let pFlyTimer = 2;
    function spawnPhotoFly() {
      const ready = photoImgs.filter(im => im.naturalWidth); if (!ready.length) return;
      const side = Math.random(); let x, y, ang;
      if (side < 0.4) { x = -170; y = rnd(0.1, 0.9) * height; ang = rnd(-0.4, 0.4); }
      else if (side < 0.8) { x = width + 170; y = rnd(0.1, 0.9) * height; ang = Math.PI + rnd(-0.4, 0.4); }
      else if (side < 0.9) { x = rnd(0.1, 0.9) * width; y = -170; ang = Math.PI / 2 + rnd(-0.5, 0.5); }
      else { x = rnd(0.1, 0.9) * width; y = height + 170; ang = -Math.PI / 2 + rnd(-0.5, 0.5); }
      const sp = rnd(280, 520);
      pFly.push({ im: ready[(Math.random() * ready.length) | 0], x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, s: rnd(70, 120), rot: rnd(-0.35, 0.35), vr: rnd(-0.4, 0.4), hist: [] });
    }
    function drawFlyCard(im, x, y, w, h, rot, alpha, glow) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = alpha;
      roundRect(-w / 2, -h / 2, w, h, 6); ctx.save(); ctx.clip(); ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2;
      if (glow) { ctx.shadowColor = 'rgba(255,150,200,0.8)'; ctx.shadowBlur = 18; }
      roundRect(-w / 2, -h / 2, w, h, 6); ctx.stroke(); ctx.restore();
    }
    function drawPhotoFlyers(dt) {
      pFlyTimer -= dt;
      if (pFlyTimer <= 0 && pFly.length < 3) { spawnPhotoFly(); pFlyTimer = rnd(1.8, 3.6); }
      ctx.globalCompositeOperation = 'source-over';
      for (let k = pFly.length - 1; k >= 0; k--) {
        const p = pFly[k];
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        p.hist.push(p.x, p.y); if (p.hist.length > 16) p.hist.splice(0, 2);
        if (p.x < -320 || p.x > width + 320 || p.y < -320 || p.y > height + 320) { pFly.splice(k, 1); continue; }
        const ar = p.im.naturalWidth / p.im.naturalHeight, w = ar >= 1 ? p.s : p.s * ar, h = ar >= 1 ? p.s / ar : p.s, n = p.hist.length / 2;
        for (let j = 0; j < n - 1; j++) drawFlyCard(p.im, p.hist[j * 2], p.hist[j * 2 + 1], w, h, p.rot, (j / n) * (j / n) * 0.16, false);
        drawFlyCard(p.im, p.x, p.y, w, h, p.rot, 0.95, true);
      }
      ctx.globalAlpha = 1;
    }

    /* ================= LÁ THƯ TAY ================= */
    const LETTER = {
      to: 'Gửi Ngọc Mai,',
      body: [
        'Nhân ngày 20/10, chúc em luôn luôn xinh đẹp, rạng rỡ và giữ trọn nét hồn nhiên, trong trẻo vốn có.',
        'Mong em luôn hạnh phúc và an yên với tất cả những gì mình đang có. Chúc em học tập thật tốt, gặt hái được mọi điều em mong ước và tự tin bước đi trên con đường của chính mình.',
        'Dù mỗi ngày có bận rộn thế nào, em hãy luôn nhớ ăn ngủ đúng giờ, uống nhiều nước và luôn dịu dàng, thương yêu lấy bản thân nhé.',
        'Chúc em có một ngày 20/10 thật đẹp, thật trọn vẹn và mọi mong ước đều trở thành hiện thực.'
      ],
      sign: 'Thân gửi Ngọc Mai ♥'
    };
    const letterEl = document.getElementById('letter'), envEl = document.getElementById('env'), paperEl = document.getElementById('paper');
    const paperIn = document.getElementById('paperIn'), ltText = document.getElementById('ltText'), ltDone = document.getElementById('ltDone');
    let ltTimers = [], ltTyping = null, ltChars = [], ltIdx = 0;
    const later = (ms, fn) => ltTimers.push(setTimeout(fn, ms));

    (function () {
      const box = document.getElementById('ltPetals');
      for (let i = 0; i < 16; i++) {
        const d = document.createElement('div'); d.className = 'lp';
        const sz = 9 + Math.random() * 12;
        d.style.cssText = 'left:' + (Math.random() * 100) + '%;width:' + sz + 'px;height:' + sz + 'px;animation-duration:' + (9 + Math.random() * 9) + 's;animation-delay:-' + (Math.random() * 14) + 's;opacity:' + (0.4 + Math.random() * 0.5);
        box.appendChild(d);
      }
    })();

    function addPara(txt, cls) {
      const p = document.createElement('div'); p.className = 'p ' + cls;
      const words = txt.split(' ');
      words.forEach((w, wi) => {
        const ws = document.createElement('span'); ws.className = 'w';
        for (const ch of w) { const c = document.createElement('span'); c.className = 'c'; c.textContent = ch; ws.appendChild(c); }
        p.appendChild(ws); if (wi < words.length - 1) p.appendChild(document.createTextNode(' '));
      });
      ltText.appendChild(p);
    }
    function buildLetter() {
      ltText.innerHTML = '';
      addPara(LETTER.to, 'to');
      LETTER.body.forEach(t => addPara(t, 'body'));
      addPara(LETTER.sign, 'sign');
      ltChars = Array.from(ltText.querySelectorAll('.c')); ltIdx = 0;
    }
    function finishLetter() {
      clearTimeout(ltTyping); ltTyping = null;
      ltChars.forEach(c => c.classList.add('on')); ltIdx = ltChars.length;
      paperIn.scrollTo({ top: paperIn.scrollHeight, behavior: 'smooth' });
      ltDone.classList.add('show');
    }
    function typeStep() {
      if (ltIdx >= ltChars.length) { finishLetter(); return; }
      const c = ltChars[ltIdx++]; c.classList.add('on');
      const r = c.getBoundingClientRect(), pr = paperIn.getBoundingClientRect();
      if (r.bottom > pr.bottom - 40) paperIn.scrollTop += r.bottom - pr.bottom + 70;
      const ch = c.textContent;
      ltTyping = setTimeout(typeStep, (ch === '.' || ch === ':') ? 340 : ch === ',' ? 170 : 44);
    }
    function openLetter() {
      if (letterEl.classList.contains('show')) return;
      buildLetter(); paperIn.scrollTop = 0;
      envEl.className = 'env'; paperEl.className = 'paper'; ltDone.classList.remove('show');
      letterEl.classList.add('show');
      later(1000, () => envEl.classList.add('open'));
      later(2900, () => { envEl.classList.add('gone'); paperEl.classList.add('show'); later(900, typeStep); });
    }
    function closeLetter() {
      ltTimers.forEach(clearTimeout); ltTimers = []; clearTimeout(ltTyping); ltTyping = null;
      letterEl.classList.remove('show');
      // Chuyển sang cảnh hiệu ứng animation đi qua từng ảnh treo dây thừng
      startRopeGallery();
    }
    letterBtn.addEventListener('click', e => { e.stopPropagation(); openLetter(); });
    document.getElementById('ltX').addEventListener('click', closeLetter);
    ltDone.addEventListener('click', closeLetter);
    paperEl.addEventListener('click', () => { if (ltIdx < ltChars.length && ltChars.length) finishLetter(); });
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (ropeGalleryEl.classList.contains('show')) closeRopeGallery();
        else closeLetter();
      }
    });

    /* ================= CẢNH TRIỂN LÃM DÂY THỪNG TREO ẢNH POLAROID ================= */
    const ropeGalleryEl = document.getElementById('ropeGallery');
    const ropeSvg = document.getElementById('ropeSvg');
    const clotheslineTrack = document.getElementById('clotheslineTrack');
    const galleryLights = document.getElementById('galleryLights');
    const photoCounter = document.getElementById('photoCounter');
    const prevPhotoBtn = document.getElementById('prevPhotoBtn');
    const nextPhotoBtn = document.getElementById('nextPhotoBtn');
    const autoPhotoBtn = document.getElementById('autoPhotoBtn');
    const closeRopeBtn = document.getElementById('closeRopeBtn');
    const grandWishModal = document.getElementById('grandWishModal');
    const closeGrandBtn = document.getElementById('closeGrandBtn');

    let currentPhotoIdx = 0;
    let isAutoPlaying = true;
    let autoPlayTimer = null;
    let cardElements = [];

    // Tạo bóng đèn đom đóm / đèn led treo trên cao
    function initGalleryLights() {
      galleryLights.innerHTML = '';
      const colors = ['#ffe89c', '#ff9ec6', '#a1d8ff', '#ffd275', '#e4aaff'];
      const count = Math.max(12, Math.floor(window.innerWidth / 70));
      for (let i = 0; i < count; i++) {
        const bulb = document.createElement('div');
        bulb.className = 'fairy-bulb';
        const c = colors[i % colors.length];
        bulb.style.color = c;
        bulb.style.background = c;
        bulb.style.left = `${(i / (count - 1)) * 96 + 2}%`;
        bulb.style.top = `${20 + Math.sin(i * 0.9) * 16}px`;
        bulb.style.animationDelay = `${(i * 0.25) % 2.5}s`;
        galleryLights.appendChild(bulb);
      }
    }

    function initRopeCards() {
      clotheslineTrack.innerHTML = '';
      cardElements = [];
      const total = PHOTOS.length;

      PHOTOS.forEach((src, idx) => {
        const card = document.createElement('div');
        card.className = 'hanging-card';
        card.dataset.index = idx;

        // Kẹp gỗ
        const pin = document.createElement('div');
        pin.className = 'clothespin';
        card.appendChild(pin);

        // Khung ảnh
        const pBox = document.createElement('div');
        pBox.className = 'card-photo-box';
        const img = document.createElement('img');
        img.src = src;
        img.loading = 'lazy';
        pBox.appendChild(img);
        card.appendChild(pBox);

        // Chú thích lời chúc
        const cap = document.createElement('div');
        cap.className = 'card-caption';
        cap.textContent = WISHES[idx % WISHES.length];
        card.appendChild(cap);

        const dateTag = document.createElement('div');
        dateTag.className = 'card-date-tag';
        dateTag.textContent = '20.10 ♥';
        card.appendChild(dateTag);

        card.addEventListener('click', () => {
          stopAutoPlay();
          goToPhoto(idx);
        });

        clotheslineTrack.appendChild(card);
        cardElements.push(card);
      });
    }

    // Vẽ dây thừng võng tự nhiên nối qua tất cả các ảnh
    function drawRopes() {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const cardW = window.innerWidth <= 600 ? 205 : 250;
      const spacing = cardW + 80;
      const centerX = W / 2;
      const trackBaseY = H * 0.40;

      let pathD = '';
      const pinCoords = [];

      cardElements.forEach((card, idx) => {
        const offset = (idx - currentPhotoIdx) * spacing;
        const x = centerX + offset - (cardW / 2);
        // Võng cong nhẹ theo khoảng cách từ tâm
        const distFromCenter = Math.abs(centerX - (x + cardW / 2));
        const sag = Math.sin((idx + clock * 0.5) * 0.8) * 8 + (distFromCenter / W) * 25;
        const y = trackBaseY + sag;

        // Góc đung đưa nhẹ như bị gió lay
        const sway = Math.sin(clock * 1.5 + idx * 0.7) * 3.5;
        const targetRot = (idx === currentPhotoIdx ? 0 : (idx - currentPhotoIdx) * 1.8) + sway;

        card.style.left = `${x}px`;
        card.style.top = `${y}px`;
        card.style.transform = `rotate(${targetRot}deg)`;

        if (idx === currentPhotoIdx) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }

        // Tọa độ đỉnh kẹp gỗ để vẽ dây thừng đi qua
        const pinX = x + cardW / 2;
        const pinY = y - 10;
        pinCoords.push({ x: pinX, y: pinY });
      });

      // Tạo đường dây thừng cong mềm mại (Catmull-Rom hoặc Bezier) nối các kẹp
      if (pinCoords.length > 0) {
        // Kéo dài ra 2 đầu biên màn hình
        const first = pinCoords[0];
        const last = pinCoords[pinCoords.length - 1];
        pathD = `M ${first.x - 300} ${first.y - 40} Q ${first.x - 150} ${first.y - 10}, ${first.x} ${first.y}`;

        for (let i = 0; i < pinCoords.length - 1; i++) {
          const p1 = pinCoords[i];
          const p2 = pinCoords[i + 1];
          const midX = (p1.x + p2.x) / 2;
          const sagDepth = 35 + Math.sin(i * 1.4 + clock) * 6;
          const midY = (p1.y + p2.y) / 2 + sagDepth;
          pathD += ` Q ${midX} ${midY}, ${p2.x} ${p2.y}`;
        }

        pathD += ` Q ${last.x + 150} ${last.y - 10}, ${last.x + 300} ${last.y - 40}`;

        ropeSvg.innerHTML = `
          <path d="${pathD}" fill="none" stroke="#68472f" stroke-width="6" stroke-linecap="round" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.6))"/>
          <path d="${pathD}" fill="none" stroke="#cfa671" stroke-width="3.5" stroke-dasharray="8 5" stroke-linecap="round"/>
          <path d="${pathD}" fill="none" stroke="#ffe7ba" stroke-width="1.2" stroke-dasharray="3 10"/>
        `;
      }

      photoCounter.textContent = `${currentPhotoIdx + 1} / ${PHOTOS.length}`;
    }

    function goToPhoto(index) {
      currentPhotoIdx = Math.max(0, Math.min(PHOTOS.length - 1, index));
      drawRopes();

      // Nếu đi đến ảnh cuối cùng -> Kích hoạt bảng chúc mừng 20/10 siêu cầu kỳ!
      if (currentPhotoIdx === PHOTOS.length - 1) {
        stopAutoPlay();
        setTimeout(() => {
          grandWishModal.classList.add('show');
        }, 1200);
      }
    }

    function nextPhoto() {
      if (currentPhotoIdx < PHOTOS.length - 1) {
        goToPhoto(currentPhotoIdx + 1);
      } else {
        stopAutoPlay();
        grandWishModal.classList.add('show');
      }
    }

    function prevPhoto() {
      if (currentPhotoIdx > 0) goToPhoto(currentPhotoIdx - 1);
    }

    function startAutoPlay() {
      isAutoPlaying = true;
      autoPhotoBtn.textContent = 'Tạm dừng ⏸';
      clearInterval(autoPlayTimer);
      autoPlayTimer = setInterval(nextPhoto, 2800);
    }

    function stopAutoPlay() {
      isAutoPlaying = false;
      autoPhotoBtn.textContent = 'Tự động ▶';
      clearInterval(autoPlayTimer);
    }

    function toggleAutoPlay() {
      if (isAutoPlaying) stopAutoPlay();
      else startAutoPlay();
    }

    function startRopeGallery() {
      initGalleryLights();
      initRopeCards();
      currentPhotoIdx = 0;
      ropeGalleryEl.classList.add('show');
      grandWishModal.classList.remove('show');
      drawRopes();
      startAutoPlay();
    }

    function closeRopeGallery() {
      stopAutoPlay();
      ropeGalleryEl.classList.remove('show');
      grandWishModal.classList.remove('show');
    }

    nextPhotoBtn.addEventListener('click', () => { stopAutoPlay(); nextPhoto(); });
    prevPhotoBtn.addEventListener('click', () => { stopAutoPlay(); prevPhoto(); });
    autoPhotoBtn.addEventListener('click', toggleAutoPlay);
    closeRopeBtn.addEventListener('click', closeRopeGallery);
    closeGrandBtn.addEventListener('click', () => {
      grandWishModal.classList.remove('show');
    });

    // Hỗ trợ vuốt chạm cảm ứng kéo trượt ảnh
    let ropeTouchStartX = 0;
    clotheslineTrack.addEventListener('touchstart', e => {
      ropeTouchStartX = e.touches[0].clientX;
    }, { passive: true });
    clotheslineTrack.addEventListener('touchend', e => {
      const diff = e.changedTouches[0].clientX - ropeTouchStartX;
      if (Math.abs(diff) > 45) {
        stopAutoPlay();
        if (diff < 0) nextPhoto();
        else prevPhoto();
      }
    });

    // Cập nhật đung đưa dây thừng liên tục theo vòng lặp
    window.addEventListener('resize', () => {
      if (ropeGalleryEl.classList.contains('show')) {
        initGalleryLights();
        drawRopes();
      }
    });

    /* ================= VÒNG LẶP ================= */
    let last = performance.now();
    function render(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const f = dt * 60;
      clock += dt; phaseT += dt; beatTime += dt * 2.1;

      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      ctx.fillStyle = '#020005'; ctx.fillRect(0, 0, width, height);

      if (phase === 'warp') drawWarp(dt);
      else {
        drawBackground(phase === 'flower' ? 0.6 : 1);
        if (phase === 'heart') drawHeartScene(f);
        else if (phase === 'collapse') drawCollapse();
        else if (phase === 'flower') drawFlowerScene(dt);
      }
      if (phase !== 'collapse') drawFlyers(dt);
      if (phase === 'heart' || phase === 'warp') drawPhotoFlyers(dt);

      if (ropeGalleryEl && ropeGalleryEl.classList.contains('show')) {
        drawRopes();
      }

      if (holding && phase === 'heart') {
        const p = clamp01((performance.now() - holdStart) / 3000);
        holdBtn.style.setProperty('--p', p);
        if (p >= 1) { holding = false; holdBtn.style.setProperty('--p', 0); startCollapse(); }
      }
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
