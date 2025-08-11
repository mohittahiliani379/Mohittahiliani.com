// script.js — main interactions for the premium prototype

// simple DOM readiness
document.addEventListener('DOMContentLoaded', ()=>{
  const loader = document.getElementById('loader');
  // hide loader after small delay to allow city to init
  setTimeout(()=> loader.style.display='none', 600);

  // populate content placeholders
  const gamesGrid = document.getElementById('gamesGrid');
  for(let i=1;i<=6;i++){
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<div class="badge">Game ${i}</div>
      <h3>Project ${i}</h3>
      <p>Short one-line description of the game. Click play to open placeholder WebGL modal.</p>
      <div style="margin-top:12px"><button class="cta play" data-game="${i}">Play</button></div>`;
    gamesGrid.appendChild(card);
  }

  const coursesGrid = document.getElementById('coursesGrid');
  for(let i=1;i<=3;i++){
    const c = document.createElement('div');
    c.className = 'card';
    c.innerHTML = `<h3>Course ${i}</h3><p>Short course summary.</p><div style="margin-top:12px"><button class="cta">Join Now</button> <button class="cta dark">Watch Demo</button></div>`;
    coursesGrid.appendChild(c);
  }

  const portfolioGrid = document.getElementById('portfolioGrid');
  for(let i=1;i<=4;i++){
    const p = document.createElement('div');
    p.className = 'card';
    p.innerHTML = `<h3>Project ${i}</h3><p>Skills: Unity · C# · Design</p>`;
    portfolioGrid.appendChild(p);
  }

  const testi = document.getElementById('testi');
  for(let i=1;i<=3;i++){
    const tcard = document.createElement('div');
    tcard.className = 'testimonial';
    tcard.innerHTML = `<strong>Student ${i}</strong><p>"Mohit's course helped me ship my first game!"</p>`;
    testi.appendChild(tcard);
  }

  // modal functionality
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  document.querySelectorAll('.play').forEach(btn=> btn.addEventListener('click', ()=> modal.classList.add('show')));
  closeModal.addEventListener('click', ()=> modal.classList.remove('show'));
  modal.addEventListener('click', (e)=> { if(e.target===modal) modal.classList.remove('show') });

  // hologram welcome sequence
  const holo = document.getElementById('hologram');
  // animate in
  gsap.to(holo, {opacity:1, y:0, scale:1, duration:1.1, delay:1.4, ease:"expo.out", onStart: ()=> {
    holo.style.animation = 'none';
    holo.style.fontFamily = 'EtnaLocal, EtnaLocalFallback, Inter, sans-serif';
  }});
  // keep visible for 5s then fade out with glitch-like flicker
  setTimeout(()=>{
    // small flicker sequence
    gsap.to(holo, {opacity:0.6, duration:0.08, y:-2, repeat:6, yoyo:true});
    gsap.to(holo, {opacity:0, duration:0.9, delay:0.6, ease:"power2.in", onComplete: ()=> {
      holo.style.display = 'none';
    }});
  }, 6500);

  // custom cursor
  document.body.classList.add('custom-cursor');
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  document.body.appendChild(cursor);
  window.addEventListener('mousemove', (e)=>{
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  // enlarge on hover for interactive elements
  document.addEventListener('mouseover', (e)=>{
    if(e.target.closest('button') || e.target.closest('.card')) cursor.classList.add('big'); else cursor.classList.remove('big');
  });

  // audio setup
  const ambient = document.getElementById('ambientAudio');
  const hoverSfx = document.getElementById('hoverSfx');
  const clickSfx = document.getElementById('clickSfx');
  const audioToggle = document.getElementById('audioToggle');
  const audioRange = document.getElementById('audioRange');
  let audioEnabled = false;

  audioToggle.addEventListener('click', ()=>{
    audioEnabled = !audioEnabled;
    if(audioEnabled){ ambient.volume = parseFloat(audioRange.value); ambient.play(); audioToggle.textContent = '🔊'; }
    else { ambient.pause(); audioToggle.textContent = '🔈'; }
  });
  audioRange.addEventListener('input', ()=> { ambient.volume = parseFloat(audioRange.value); });

  // play hover sfx when a building hover event fires (city.js dispatches buildingHover)
  document.addEventListener('buildingHover', (e)=>{
    if(audioEnabled){
      hoverSfx.currentTime = 0;
      hoverSfx.volume = 0.12;
      hoverSfx.play().catch(()=>{});
    }
  });
  document.addEventListener('cityClick', (e)=>{
    if(audioEnabled){
      clickSfx.currentTime = 0;
      clickSfx.volume = 0.28;
      clickSfx.play().catch(()=>{});
    }
  });

  // hero CTA flicker entrance
  const ctas = document.querySelectorAll('.hero-ctas .cta');
  gsap.from('.site-title', {y:-30, opacity:0, duration:1.2, ease:"expo.out"});
  gsap.from('.tagline', {y:-10, opacity:0, duration:0.9, delay:0.2});
  gsap.from(ctas, {y:20, opacity:0, duration:0.9, delay:0.9, stagger:0.12, ease:"back.out(1.7)"});
  ctas.forEach((b, idx)=>{
    const tl = gsap.timeline({repeat:0, delay:0.9 + idx*0.12});
    tl.to(b, {opacity:0.2, duration:0.06});
    tl.to(b, {opacity:1, duration:0.08});
    tl.to(b, {boxShadow: '0 12px 48px rgba(157,0,255,0.14)', duration:0.45, ease:"power2.out"});
    b.addEventListener('mouseenter', ()=> gsap.to(b, {boxShadow: '0 18px 90px rgba(157,0,255,0.22)', duration:0.25}));
    b.addEventListener('mouseleave', ()=> gsap.to(b, {boxShadow: '0 8px 40px rgba(157,0,255,0.06)', duration:0.25}));
  });

  // contact form handler
  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    alert('Thanks — message received (prototype).');
    contactForm.reset();
  });

  // small performance tweak: if on mobile, reduce pointer events for scene
  if(/Mobi|Android/i.test(navigator.userAgent)){
    document.getElementById('bg-scene').style.pointerEvents = 'none';
  }
});

// Fullscreen overlay + Unity dynamic loader logic
(function(){
  const playButtons = document.querySelectorAll('.play');
  const overlay = document.getElementById('gameOverlay');
  const closeBtn = document.getElementById('closeGame');
  const unityContainer = document.getElementById('unityContainer');
  const progressFill = document.getElementById('gameProgress');

  function openOverlay(gameId){
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden','false');
    // animate progress bar to 10% immediately for effect
    gsap.to(progressFill, {width:'10%', duration:0.35});
    // if unity preloaded, try to inject UnityLoader.js and start (best-effort)
    if(window.unityPreloaded){
      // try to load Unity loader script from games/game1/Build/UnityLoader.js
      const loaderUrl = '/games/game1/Build/UnityLoader.js';
      injectUnityLoader(loaderUrl);
    } else {
      // show simulated loading until user adds build; keep trying to load
      attemptLoadFallback();
    }
  }

  function attemptLoadFallback(){
    // animate progress slowly, while periodically trying to fetch loader to begin real load
    let p = 10;
    const iv = setInterval(()=>{
      p = Math.min(95, p + Math.random()*8);
      gsap.to(progressFill, {width: p+'%', duration:0.5, ease:'power1.out'});
      fetch('/games/game1/Build/UnityLoader.js', {method:'GET', mode:'no-cors'}).then(()=>{
        clearInterval(iv);
        gsap.to(progressFill, {width:'98%', duration:0.2});
        injectUnityLoader('/games/game1/Build/UnityLoader.js');
      }).catch(()=>{});
    }, 600);
  }

  function injectUnityLoader(url){
    // inject script tag; when it executes, Unity loader will try to initialize the WebGL content in unityContainer.
    try{
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = ()=> {
        // give loader a moment and then set progress to full
        gsap.to(progressFill, {width:'100%', duration:0.2, onComplete: ()=>{
          // if Unity created a canvas inside unityContainer, that's good.
          // otherwise show placeholder
          if(!unityContainer.querySelector('canvas')){
            unityContainer.innerHTML = '<div style="color:#9fdfff">Drop your Unity WebGL build into /games/game1/Build/ — the loader was injected but no canvas was found.</div>';
          }
        }});
      };
      script.onerror = ()=>{
        unityContainer.innerHTML = '<div style="color:#ffb3c7">Unity loader failed to load. Check that /games/game1/Build/UnityLoader.js exists.</div>';
      };
      document.body.appendChild(script);
    }catch(e){
      unityContainer.innerHTML = '<div style="color:#ffb3c7">Error injecting Unity loader: '+e.message+'</div>';
    }
  }

  playButtons.forEach(btn=> btn.addEventListener('click', ()=> openOverlay(btn.dataset.game)));
  closeBtn.addEventListener('click', ()=> {
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden','true');
    // try to cleanup the unityContainer by removing child nodes (Unity provides its own unload API; advanced cleanup can be added)
    unityContainer.innerHTML = '';
    gsap.to(progressFill, {width:'0%', duration:0.2});
  });
})();
