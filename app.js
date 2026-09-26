(() => {
  const EMAIL = 'boy7990088@yahoo.com.tw';
  const LINE = 'https://line.me/ti/p/KwxSWeQbsq';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  document.getElementById('yr').textContent = new Date().getFullYear();

  // ---- 進場動畫 ----
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));

  // ---- 提示 ----
  const toast = msg => {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
  };

  // ---- 詢問清單（促購） ----
  const picked = new Set();
  const refreshInquiry = () => {
    const list = [...picked];
    $('#inquiry').hidden = !list.length;
    $('#inqList').textContent = list.join('、');
    $('#inqCount').textContent = list.length || '';
    const body = encodeURIComponent(`您好，我想詢問試用體驗價：${list.join('、') || '（款式）'}`);
    $('#mailBtn').href = `mailto:${EMAIL}?subject=${encodeURIComponent('能量糖試用詢問')}&body=${body}`;
    $$('.card').forEach(c => {
      const b = c.querySelector('.btn-add'), on = picked.has(c.dataset.name);
      b.classList.toggle('added', on); b.textContent = on ? '✓ 已加入詢問' : '＋ 加入詢問';
    });
  };
  $$('.card').forEach(c => c.querySelector('.btn-add').addEventListener('click', () => {
    const n = c.dataset.name;
    picked.has(n) ? picked.delete(n) : (picked.add(n), toast(`已加入：${n}`));
    refreshInquiry();
  }));
  $('.btn-add-all').addEventListener('click', () => {
    $$('.card').forEach(c => picked.add(c.dataset.name));
    refreshInquiry(); toast('三款體驗組已加入詢問');
    $('#contact').scrollIntoView();
  });
  $('#copyInq').addEventListener('click', async () => {
    const msg = `您好，我想詢問試用體驗價：${[...picked].join('、')}`;
    try { await navigator.clipboard.writeText(msg); toast('已複製，貼到 LINE 傳給我們吧！'); }
    catch { toast(msg); }
    setTimeout(() => window.open(LINE, '_blank', 'noopener'), 600);
  });

  // ---- 評價輪播（只顯示 reviews.json 內經審核的真實留言） ----
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const track = $('#track'), dots = $('#dots');
  let idx = 0, n = 0, timer;
  const go = i => {
    if (!n) return;
    idx = (i + n) % n;
    track.style.transform = `translateX(-${idx * 100}%)`;
    [...dots.children].forEach((d, k) => d.classList.toggle('on', k === idx));
  };
  const auto = () => { clearInterval(timer); if (n > 1) timer = setInterval(() => go(idx + 1), 5000); };
  const render = reviews => {
    const slides = reviews.length ? reviews.map(r => `
      <div class="slide"><div class="quote">
        <div class="stars-row">${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}</div>
        <p>${esc(r.text)}</p>
        <div class="who"><span class="avatar">${esc((r.name || '匿')[0])}</span>
          <span><b>${esc(r.name || '匿名')}</b>${r.product ? '・' + esc(r.product) : ''}${r.date ? '・' + esc(r.date) : ''}</span></div>
      </div></div>`) : [`
      <div class="slide"><div class="quote empty">
        <div class="stars-row">★★★★★</div>
        <p><b>成為第一位分享心得的朋友！</b><br>在下方留言，經審核後就會出現在這裡。</p>
        <a class="btn btn-sm" href="#feedback">我要留言</a>
      </div></div>`];
    track.innerHTML = slides.join('');
    n = slides.length;
    dots.innerHTML = n > 1 ? slides.map((_, k) => `<button type="button" aria-label="第 ${k + 1} 則"></button>`).join('') : '';
    [...dots.children].forEach((d, k) => d.addEventListener('click', () => { go(k); auto(); }));
    go(0); auto();
  };
  $('.prev').addEventListener('click', () => { go(idx - 1); auto(); });
  $('.next').addEventListener('click', () => { go(idx + 1); auto(); });
  const car = $('#carousel');
  car.addEventListener('mouseenter', () => clearInterval(timer));
  car.addEventListener('mouseleave', auto);
  let sx = null;
  car.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  car.addEventListener('touchend', e => {
    if (sx === null) return; const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); auto(); } sx = null;
  });
  fetch('reviews.json', { cache: 'no-store' }).then(r => r.json())
    .then(d => render(Array.isArray(d) ? d.filter(r => r && r.text) : []))
    .catch(() => render([]));

  // ---- 留言表單：透過 FormSubmit 寄到店家信箱 ----
  const form = $('#fbForm'), msg = $('#fbMsg');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { msg.className = 'form-msg err'; msg.textContent = '請填寫暱稱與留言內容。'; return; }
    if (form._honey.value) return;
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = '送出中…';
    const data = Object.fromEntries(new FormData(form));
    delete data._honey;
    if (!data['同意公開']) data['同意公開'] = '否';
    data._subject = `【巨挺網站】新留言：${data['暱稱']}（${data['評分']}★）`;
    data._template = 'table';
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${EMAIL}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j.success === 'false' || j.success === false) throw new Error(j.message || res.status);
      msg.className = 'form-msg ok'; msg.textContent = '感謝你的分享！我們收到了，審核後會刊登 ♥';
      form.reset();
    } catch (err) {
      msg.className = 'form-msg err';
      msg.innerHTML = `送出失敗，請改用 <a href="mailto:${EMAIL}?subject=${encodeURIComponent('能量糖使用心得')}&body=${encodeURIComponent(data['留言'] || '')}">Email</a> 或 LINE 傳給我們。`;
    } finally { btn.disabled = false; btn.textContent = '送出留言'; }
  });
})();
