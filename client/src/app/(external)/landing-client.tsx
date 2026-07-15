'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function RentalLandingClient() {
  useEffect(() => {
    // Year
    const yearEl = document.getElementById('year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear().toString();
    }

    // Navbar scroll state
    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
      if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // init

    // Smooth scroll for in-page links
    const scrollLinks = document.querySelectorAll('[data-scroll]');
    const handleSmoothScroll = (e: Event) => {
      e.preventDefault();
      const el = e.currentTarget as HTMLAnchorElement;
      const targetId = el.getAttribute('href');
      if (targetId) {
        const target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    scrollLinks.forEach(el => {
      el.addEventListener('click', handleSmoothScroll);
    });

    // Rotating taglines
    const taglines = [
      "Collect rent. Generate receipts. Done.",
      "Your tenants, properties and owners — one place.",
      "From vacant unit to signed lease in minutes.",
      "PDF receipts that look like the real thing.",
      "Share an application link. Get qualified tenants.",
      "Owner statements dispatched with one click.",
      "Maintenance logged. Resolved. Documented.",
      "Know who's paid and who hasn't — instantly."
    ];
    let tIndex = 0;
    const tagTop = document.getElementById('tag-top');
    const tagBottom = document.getElementById('tag-bottom');

    let taglineInterval: NodeJS.Timeout;
    if (tagTop && tagBottom) {
      const cycleTagline = () => {
        tagTop.classList.add('fading');
        tagBottom.classList.add('fading');
        setTimeout(() => {
          tIndex = (tIndex + 1) % taglines.length;
          tagTop.textContent = taglines[tIndex];
          tagBottom.textContent = taglines[(tIndex + 1) % taglines.length];
          tagTop.classList.remove('fading');
          tagBottom.classList.remove('fading');
        }, 380);
      };
      tagBottom.textContent = taglines[1];
      taglineInterval = setInterval(cycleTagline, 3200);
    }

    // Ambient blob field (monochrome fluid-esque background, mouse-reactive)
    const field = document.getElementById('blob-field');
    const blobCount = 5;
    const blobs: any[] = [];
    if (field) {
      for (let i = 0; i < blobCount; i++) {
        const el = document.createElement('div');
        el.className = 'blob';
        const size = 260 + Math.random() * 260;
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        field.appendChild(el);
        blobs.push({
          el,
          baseX: Math.random() * 100,
          baseY: Math.random() * 100,
          phase: Math.random() * Math.PI * 2,
          speed: 0.15 + Math.random() * 0.15,
          amp: 8 + Math.random() * 10
        });
      }

      let mouseX = 0.5, mouseY = 0.5;
      const handleMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
      };
      window.addEventListener('mousemove', handleMouseMove);

      let animationFrameId: number;
      const animateBlobs = (t: number) => {
        const time = t * 0.001;
        blobs.forEach(b => {
          const dx = (mouseX - 0.5) * 40;
          const dy = (mouseY - 0.5) * 40;
          const x = b.baseX + Math.sin(time * b.speed + b.phase) * b.amp + dx;
          const y = b.baseY + Math.cos(time * b.speed + b.phase) * b.amp + dy;
          b.el.style.transform = `translate(${x}vw, ${y}vh) translate(-50%, -50%)`;
        });
        animationFrameId = requestAnimationFrame(animateBlobs);
      };
      blobs.forEach((b, i) => {
        b.el.style.left = (i * 22 + 5) + '%';
        b.el.style.top = (Math.random() * 70 + 10) + '%';
      });
      animationFrameId = requestAnimationFrame(animateBlobs);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        scrollLinks.forEach(el => el.removeEventListener('click', handleSmoothScroll));
        if (taglineInterval) clearInterval(taglineInterval);
        window.removeEventListener('mousemove', handleMouseMove);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        // Clean up blobs
        if (field) field.innerHTML = '';
      };
    }
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        :root{
          --bg: #050505;
          --bg-alt: #080808;
          --white: #ffffff;
          --t-70: rgba(255,255,255,0.70);
          --t-50: rgba(255,255,255,0.50);
          --t-40: rgba(255,255,255,0.40);
          --t-25: rgba(255,255,255,0.25);
          --t-10: rgba(255,255,255,0.10);
          --border: rgba(255,255,255,0.06);
          --border-hover: rgba(255,255,255,0.30);
          --card: rgba(255,255,255,0.02);
          --card-hover: rgba(255,255,255,0.05);
        }
        * { box-sizing:border-box; margin:0; padding:0; }
        html{ scroll-behavior:smooth; scrollbar-width:none; }
        html::-webkit-scrollbar{ display:none; }
        body {
          background:var(--bg);
          color:var(--white);
          font-family:'Inter', -apple-system, sans-serif;
          overflow-x:hidden;
          scrollbar-width:none;
        }
        body::-webkit-scrollbar{ display:none; }
        h1,h2,h3,.font-display{ font-family:'Montserrat', sans-serif; }
        img{ display:block; max-width:100%; }
        a{ color:inherit; text-decoration:none; }
        .container{ max-width:1200px; margin:0 auto; padding:0 24px; }
        .eyebrow{
          font-family:'Inter', sans-serif;
          font-size:12px;
          font-weight:700;
          letter-spacing:0.2em;
          text-transform:uppercase;
          color:var(--t-50);
        }
        button{ font-family:inherit; border:none; cursor:pointer; }

        /* ---------- NAVBAR ---------- */
        nav{
          position:fixed; top:0; left:0; right:0; z-index:100;
          height:64px;
          display:flex; align-items:center;
          background:transparent;
          border-bottom:1px solid transparent;
          transition:all 300ms ease;
        }
        nav.scrolled{
          background:rgba(8,8,8,0.9);
          backdrop-filter:blur(16px);
          -webkit-backdrop-filter:blur(16px);
          border-bottom:1px solid var(--border);
        }
        .nav-row{ display:flex; align-items:center; justify-content:space-between; width:100%; }
        .nav-logo{ font-family:'Montserrat', sans-serif; font-weight:900; font-size:20px; letter-spacing:-0.02em; color:var(--white); }
        .nav-links{ display:flex; gap:36px; font-size:14px; font-weight:500; color:var(--t-50); }
        .nav-links a{ transition:color 300ms ease; }
        .nav-links a:hover{ color:var(--white); }
        .nav-actions{ display:flex; align-items:center; gap:20px; }
        .nav-signin{ font-size:14px; color:var(--t-50); transition:color 300ms; }
        .nav-signin:hover{ color:var(--white); }
        .btn-pill{
          height:36px; padding:0 20px; border-radius:999px;
          background:var(--white); color:#000;
          font-size:14px; font-weight:700;
          display:inline-flex; align-items:center; gap:6px;
          transition:all 300ms ease;
        }
        .btn-pill:hover{ transform:translateY(-1px); box-shadow:0 8px 20px -8px rgba(255,255,255,0.35); }
        @media (max-width:860px){ .nav-links{ display:none; } }

        /* ---------- HERO ---------- */
        .hero{
          position:relative;
          height:100vh; min-height:640px;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          overflow:hidden;
          background:#050505;
        }
        #blob-field{ position:absolute; inset:0; z-index:0; }
        .blob{
          position:absolute;
          border-radius:50%;
          filter:blur(70px);
          background:radial-gradient(circle, rgba(255,255,255,0.16), rgba(255,255,255,0) 70%);
          will-change:transform;
        }
        .hero-overlay{
          position:absolute; inset:0; z-index:1;
          background:linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%);
          pointer-events:none;
        }
        .hero-content{ position:relative; z-index:2; text-align:center; padding:0 20px; }
        .tagline-slot{
          height:20px;
          font-size:13px; font-weight:600; letter-spacing:0.04em;
          color:var(--t-40);
          margin-bottom:22px;
          transition:opacity 0.38s ease, filter 0.38s ease;
        }
        .tagline-slot.fading{ opacity:0; filter:blur(10px); }
        .wordmark{
          font-family:'Montserrat', sans-serif;
          font-weight:900;
          font-size:clamp(90px, 20vw, 240px);
          line-height:0.85;
          letter-spacing:-0.03em;
          color:var(--white);
          text-shadow:0 0 140px rgba(255,255,255,0.35);
          user-select:none;
        }
        .tagline-slot-bottom{
          height:24px;
          font-size:16px; font-weight:500;
          color:var(--t-70);
          margin-top:22px; margin-bottom:44px;
          transition:opacity 0.38s ease, filter 0.38s ease;
        }
        .tagline-slot-bottom.fading{ opacity:0; filter:blur(10px); }
        .hero-actions{ display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
        .btn-hero-primary{
          height:48px; padding:0 32px; border-radius:999px;
          background:var(--white); color:#000; font-weight:700; font-size:15px;
          display:inline-flex; align-items:center; gap:8px;
          transition:all 300ms ease;
        }
        .btn-hero-primary:hover{ transform:translateY(-2px); box-shadow:0 12px 30px -10px rgba(255,255,255,0.4); }
        .btn-hero-ghost{
          height:48px; padding:0 32px; border-radius:999px;
          border:1px solid var(--t-10);
          background:rgba(255,255,255,0.03);
          backdrop-filter:blur(6px);
          color:var(--t-70); font-weight:600; font-size:15px;
          display:inline-flex; align-items:center;
          transition:all 300ms ease;
        }
        .btn-hero-ghost:hover{ border-color:rgba(255,255,255,0.3); color:var(--white); }
        .hero-hint{ margin-top:22px; font-size:12.5px; color:var(--t-25); }
        .scroll-indicator{
          position:absolute; bottom:28px; left:50%; transform:translateX(-50%); z-index:2;
          color:var(--t-25);
          animation:bounce 2s infinite;
        }
        @keyframes bounce{ 0%,100%{ transform:translate(-50%,0); } 50%{ transform:translate(-50%,8px); } }

        /* ---------- SECTIONS ---------- */
        .section{ padding:112px 0; }
        .section-alt{ background:var(--bg-alt); }
        .section-head{ max-width:640px; margin-bottom:56px; }
        .section-head h2{ font-size:clamp(30px,4.2vw,48px); font-weight:900; letter-spacing:-0.02em; margin-top:14px; line-height:1.08; color:var(--white); }
        .section-head h2 .hl{ color:var(--white); border-bottom:3px solid var(--white); padding-bottom:2px; }
        .section-head p{ margin-top:16px; font-size:17px; color:var(--t-40); line-height:1.6; max-width:480px; }

        /* ---------- FEATURES ---------- */
        .features-grid{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          grid-auto-rows:260px;
          gap:12px;
        }
        @media (max-width:820px){ .features-grid{ grid-template-columns:1fr; grid-auto-rows:220px; } }
        .f-card{
          position:relative; border-radius:16px; overflow:hidden;
          border:1px solid var(--border);
          cursor:pointer;
        }
        .f-card.hero-card{ grid-column:span 2; grid-row:span 2; }
        @media (max-width:820px){ .f-card.hero-card{ grid-column:span 1; grid-row:span 1; } }
        .f-card img{
          position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
          transform:scale(1); transition:transform 700ms ease;
          filter:grayscale(45%) contrast(1.05);
        }
        .f-card:hover img{ transform:scale(1.06); }
        .f-overlay-default{
          position:absolute; inset:0;
          background:linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 55%, transparent 100%);
          display:flex; align-items:flex-end; padding:22px;
          transition:opacity 400ms ease;
        }
        .f-overlay-default h3{ font-size:19px; font-weight:800; color:var(--white); }
        .f-overlay-hover{
          position:absolute; inset:0;
          background:rgba(0,0,0,0.8);
          backdrop-filter:blur(4px);
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          text-align:center; padding:28px;
          opacity:0; transition:opacity 400ms ease;
        }
        .f-overlay-hover h3{ font-size:20px; font-weight:900; color:var(--white); margin-bottom:10px; }
        .f-overlay-hover p{ font-size:14px; color:var(--t-70); line-height:1.6; max-width:340px; }
        .f-card:hover .f-overlay-default{ opacity:0; }
        .f-card:hover .f-overlay-hover{ opacity:1; }

        /* ---------- HOW IT WORKS ---------- */
        .steps{ display:flex; flex-direction:column; gap:12px; }
        .step-row{
          display:flex; align-items:center; gap:28px;
          padding:26px 28px; border-radius:18px;
          border:1px solid var(--border);
          background:var(--card);
          transition:all 300ms ease;
        }
        .step-row:hover{ border-color:var(--border-hover); background:var(--card-hover); }
        .step-num{
          font-family:'Montserrat', sans-serif;
          font-size:34px; font-weight:900;
          color:var(--t-10);
          transition:color 300ms ease;
          width:64px; flex-shrink:0;
        }
        .step-row:hover .step-num{ color:rgba(255,255,255,0.55); }
        .step-body{ flex:1; min-width:0; }
        .step-body h3{ font-size:17px; font-weight:700; color:var(--white); margin-bottom:6px; }
        .step-body p{ font-size:14px; color:var(--t-40); line-height:1.6; max-width:560px; }
        .step-arrow{ opacity:0; transform:translateX(-6px); transition:all 300ms ease; flex-shrink:0; color:var(--t-50); }
        .step-row:hover .step-arrow{ opacity:1; transform:translateX(0); }
        @media (max-width:640px){ .step-row{ flex-wrap:wrap; gap:14px; } .step-arrow{ display:none; } }

        /* ---------- PRICING ---------- */
        .pricing-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px; }
        @media (max-width:980px){ .pricing-grid{ grid-template-columns:repeat(2,1fr); } }
        @media (max-width:560px){ .pricing-grid{ grid-template-columns:1fr; } }
        .plan{
          position:relative;
          border-radius:20px;
          border:1px solid var(--border);
          background:var(--card);
          padding:30px 26px;
          display:flex; flex-direction:column;
          transition:all 300ms ease;
        }
        .plan:hover{ border-color:var(--border-hover); }
        .plan.featured{
          background:var(--white); color:#000;
          transform:scale(1.02);
          border-color:var(--white);
        }
        .plan-badge{
          position:absolute; top:-13px; left:50%; transform:translateX(-50%);
          background:#000; color:var(--white);
          font-size:10px; font-weight:900; letter-spacing:0.15em; text-transform:uppercase;
          padding:6px 14px; border-radius:999px; white-space:nowrap;
        }
        .plan-name{ font-family:'Inter', sans-serif; font-size:12px; font-weight:800; letter-spacing:0.15em; text-transform:uppercase; color:var(--t-50); margin-bottom:16px; }
        .plan.featured .plan-name{ color:rgba(0,0,0,0.5); }
        .plan-price{ font-family:'Montserrat', sans-serif; font-size:44px; font-weight:900; letter-spacing:-0.02em; }
        .plan-price span{ font-family:'Inter',sans-serif; font-size:14px; font-weight:500; color:var(--t-40); }
        .plan.featured .plan-price span{ color:rgba(0,0,0,0.45); }
        .plan-tagline{ font-size:13px; color:var(--t-40); margin:8px 0 22px; min-height:34px; }
        .plan.featured .plan-tagline{ color:rgba(0,0,0,0.55); }
        .plan-list{ list-style:none; display:flex; flex-direction:column; gap:11px; margin-bottom:26px; flex-grow:1; }
        .plan-list li{ font-size:13.5px; color:var(--t-50); display:flex; gap:9px; align-items:flex-start; }
        .plan.featured .plan-list li{ color:rgba(0,0,0,0.7); }
        .plan-list li svg{ flex-shrink:0; margin-top:2px; }
        .plan-cta{ width:100%; height:46px; border-radius:999px; font-size:14px; font-weight:700; display:flex; align-items:center; justify-content:center; transition:all 300ms ease; }
        .plan-cta.dark{ background:rgba(255,255,255,0.05); border:1px solid var(--t-10); color:var(--white); }
        .plan-cta.dark:hover{ background:rgba(255,255,255,0.1); }
        .plan-cta.light{ background:#000; color:var(--white); }
        .plan-cta.light:hover{ background:#1a1a1a; }

        /* ---------- CTA ---------- */
        .cta-section{ background:var(--bg-alt); border-top:1px solid var(--border); padding:128px 24px; text-align:center; }
        .cta-section h2{ font-weight:900; font-size:clamp(40px,7vw,84px); letter-spacing:-0.02em; line-height:1.02; }
        .cta-section h2 .hl{ color:var(--white); border-bottom:4px solid var(--white); }
        .cta-section p{ margin:24px auto 40px; font-size:17px; color:var(--t-40); max-width:520px; line-height:1.6; }
        .cta-actions{ display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }
        .btn-cta-primary{
          height:56px; padding:0 40px; border-radius:999px;
          background:var(--white); color:#000; font-weight:800; font-size:15px;
          display:inline-flex; align-items:center; gap:8px;
          box-shadow:0 16px 40px -14px rgba(255,255,255,0.35);
          transition:all 300ms ease;
        }
        .btn-cta-primary:hover{ transform:translateY(-2px); }
        .btn-cta-ghost{
          height:56px; padding:0 40px; border-radius:999px;
          border:1px solid var(--t-10); color:var(--t-50); font-weight:600; font-size:15px;
          display:inline-flex; align-items:center;
          transition:all 300ms ease;
        }
        .btn-cta-ghost:hover{ border-color:rgba(255,255,255,0.3); color:var(--white); }

        /* ---------- FOOTER ---------- */
        footer{ background:var(--bg); border-top:1px solid var(--border); padding-top:64px; padding-bottom:40px; }
        .footer-grid{ display:flex; gap:60px; flex-wrap:wrap; margin-bottom:56px; }
        .footer-brand{ width:260px; }
        .footer-brand .nav-logo{ margin-bottom:14px; display:block; }
        .footer-brand p{ font-size:13.5px; color:var(--t-25); line-height:1.7; }
        .footer-col{ min-width:140px; }
        .footer-col h4{ font-family:'Inter',sans-serif; font-size:11px; font-weight:800; letter-spacing:0.15em; text-transform:uppercase; color:var(--t-40); margin-bottom:18px; }
        .footer-col ul{ list-style:none; display:flex; flex-direction:column; gap:12px; }
        .footer-col ul a{ font-size:14px; color:var(--t-40); transition:color 300ms; }
        .footer-col ul a:hover{ color:var(--white); }
        .footer-bottom{ display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; padding-top:26px; border-top:1px solid var(--border); font-size:12px; color:var(--t-25); }
      `}} />

      {/* Include fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

      <nav id="navbar">
        <div className="container nav-row">
          <Link href="/" className="nav-logo">Rental</Link>
          <div className="nav-links">
            <a data-scroll="true" href="#features">Features</a>
            <a data-scroll="true" href="#how-it-works">How it works</a>
            <a data-scroll="true" href="#pricing">Pricing</a>
          </div>
          <div className="nav-actions">
            <Link href="/login" className="nav-signin">Sign in</Link>
            <Link href="/register" className="btn-pill">Get started</Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div id="blob-field"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="tagline-slot" id="tag-top">Collect rent. Generate receipts. Done.</div>
          <h1 className="wordmark">Rental</h1>
          <div className="tagline-slot-bottom" id="tag-bottom">Your tenants, properties and owners one place.</div>
          <div className="hero-actions">
            <Link href="/register" className="btn-hero-primary">Start for free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <Link href="/login" className="btn-hero-ghost">Sign in</Link>
          </div>
          <div className="hero-hint">Free tier available · No credit card required</div>
        </div>
        <div className="scroll-indicator">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
        </div>
      </section>

      <section className="section" id="features">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">What Rental Does</span>
            <h2>Every tool a property<br />agents needs.</h2>
            <p>Hover each card to see how Rental solves real problems for property managers.</p>
          </div>

          <div className="features-grid">
            <div className="f-card hero-card">
              <img src="https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop" alt="Property portfolio" />
              <div className="f-overlay-default"><h3>Property Portfolio</h3></div>
              <div className="f-overlay-hover">
                <h3>Property Portfolio</h3>
                <p>Track every property, unit, and owner in one place. Vacant units highlighted instantly. Application links generated and shared in seconds.</p>
              </div>
            </div>

            <div className="f-card">
              <img src="https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop" alt="Instant receipts" />
              <div className="f-overlay-default"><h3>Instant Receipts</h3></div>
              <div className="f-overlay-hover">
                <h3>Instant Receipts</h3>
                <p>Professional PDF receipts with your VAT number, lease ID, and bank details — emailed or WhatsApp'd with one click.</p>
              </div>
            </div>

            <div className="f-card">
              <img src="https://images.pexels.com/photos/3760069/pexels-photo-3760069.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop" alt="Tenant applications" />
              <div className="f-overlay-default"><h3>Tenant Applications</h3></div>
              <div className="f-overlay-hover">
                <h3>Tenant Applications</h3>
                <p>Full Zimbabwean tenancy form online — ID upload, guarantor, employment history. Link auto-expires after submission.</p>
              </div>
            </div>

            <div className="f-card">
              <img src="https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop" alt="ZiG and USD payments" />
              <div className="f-overlay-default"><h3>ZiG + USD Payments</h3></div>
              <div className="f-overlay-hover">
                <h3>ZiG + USD Payments</h3>
                <p>Record rent in both currencies. System flags overdue tenants in red after the due date automatically.</p>
              </div>
            </div>

            <div className="f-card">
              <img src="https://images.pexels.com/photos/7235675/pexels-photo-7235675.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop" alt="Owner statements" />
              <div className="f-overlay-default"><h3>Owner Statements</h3></div>
              <div className="f-overlay-hover">
                <h3>Owner Statements</h3>
                <p>Generate monthly owner statements and dispatch by email or WhatsApp the moment rent is received.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="how-it-works">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">How It Works</span>
            <h2>From zero to<br /><span className="hl">first receipt</span> today.</h2>
          </div>

          <div className="steps">
            <div className="step-row">
              <div className="step-num">01</div>
              <div className="step-body">
                <h3>Register your agency</h3>
                <p>Sign up, verify your email, fill in your company details. Address, VAT number, bank account — these print on every receipt. Under 5 minutes.</p>
              </div>
              <div className="step-arrow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg></div>
            </div>
            <div className="step-row">
              <div className="step-num">02</div>
              <div className="step-body">
                <h3>Add properties & owners</h3>
                <p>Add each property and assign it to an owner. For single-unit properties, one toggle auto-creates the unit — no extra step needed.</p>
              </div>
              <div className="step-arrow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg></div>
            </div>
            <div className="step-row">
              <div className="step-num">03</div>
              <div className="step-body">
                <h3>Share application links</h3>
                <p>Each unit gets a unique link. Prospective tenants fill the Zimbabwean tenancy form online — ID, guarantor, employment. Link expires after submission.</p>
              </div>
              <div className="step-arrow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg></div>
            </div>
            <div className="step-row">
              <div className="step-num">04</div>
              <div className="step-body">
                <h3>Approve & activate lease</h3>
                <p>Review applications in the dashboard. Approve and activate. Lease PDF generated automatically. Tenant is live in the system.</p>
              </div>
              <div className="step-arrow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg></div>
            </div>
            <div className="step-row">
              <div className="step-num">05</div>
              <div className="step-body">
                <h3>Collect rent & notify owners</h3>
                <p>Record payments in ZiG or USD. Receipt generated instantly. One click emails or WhatsApps the tenant and owner.</p>
              </div>
              <div className="step-arrow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Pricing</span>
            <h2>Start free.<br />Scale when ready.</h2>
            <p>Every plan includes receipts, payments, and tenant management. From $0 to $250/mo.</p>
          </div>

          <div className="pricing-grid">
            <div className="plan">
              <div className="plan-name">Free</div>
              <div className="plan-price">$0<span>/mo</span></div>
              <div className="plan-tagline">Try it with your first property.</div>
              <ul className="plan-list">
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>1 property, 5 units</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>1 agent, 1 owner</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>500 MB storage</li>
              </ul>
              <Link href="/register" className="plan-cta dark">Start free</Link>
            </div>

            <div className="plan">
              <div className="plan-name">Starter</div>
              <div className="plan-price">$49<span>/mo</span></div>
              <div className="plan-tagline">For a small independent agency.</div>
              <ul className="plan-list">
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>10 properties, 40 units</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>3 agents, 10 owners</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>5 GB storage</li>
              </ul>
              <Link href="/register" className="plan-cta dark">Choose Starter</Link>
            </div>

            <div className="plan featured">
              <div className="plan-badge">Most Popular</div>
              <div className="plan-name">Growth</div>
              <div className="plan-price">$129<span>/mo</span></div>
              <div className="plan-tagline">For agencies managing multiple portfolios.</div>
              <ul className="plan-list">
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>50 properties, 300 units</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>10 agents, 50 owners</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>25 GB storage</li>
              </ul>
              <Link href="/register" className="plan-cta light">Choose Growth</Link>
            </div>

            <div className="plan">
              <div className="plan-name">Professional</div>
              <div className="plan-price">$250<span>/mo</span></div>
              <div className="plan-tagline">Unlimited scale.</div>
              <ul className="plan-list">
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>Unlimited properties &amp; units</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>Unlimited agents &amp; owners</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>100 GB storage</li>
              </ul>
              <Link href="/register" className="plan-cta dark">Choose Professional</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container" style={{ padding: 0 }}>
          <h2>Ready to modernise<br /><span className="hl">your portfolio?</span></h2>
          <p>Join property managers across Zimbabwe who run their books on Rental. Sign up in under 5 minutes — no credit card needed.</p>
          <div className="cta-actions">
            <Link href="/register" className="btn-cta-primary">Create free account
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <Link href="/login" className="btn-cta-ghost">Sign in</Link>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link href="/" className="nav-logo">Rental</Link>
              <p>Property management built for Zimbabwean agents. Manage tenants, collect rent, generate receipts.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li><a data-scroll="true" href="#features">Features</a></li>
                <li><a data-scroll="true" href="#pricing">Pricing</a></li>
                <li><a data-scroll="true" href="#how-it-works">How it works</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Platform</h4>
              <ul>
                <li><Link href="/dashboard/overview">Dashboard</Link></li>
                <li><Link href="/dashboard/applications">Applications</Link></li>
                <li><Link href="/dashboard/payments">Payments</Link></li>
                <li><Link href="/dashboard/reports">Reports</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Account</h4>
              <ul>
                <li><Link href="/login">Sign in</Link></li>
                <li><Link href="/register">Register</Link></li>
                <li><Link href="/dashboard/settings">Settings</Link></li>
                <li><Link href="/dashboard/settings?tab=subscription">Billing</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© <span id="year"></span> Rental. All rights reserved.</span>
            <span>🇿🇼 Zimbabwe &nbsp;|&nbsp; ZiG + USD &nbsp;|&nbsp; Built for agents</span>
          </div>
        </div>
      </footer>
    </>
  );
}
