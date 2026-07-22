'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function RentalLandingClient() {
  const heroImages = [
    "https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=600&h=1066&fit=crop",
    "https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=600&h=1066&fit=crop",
    "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=600&h=1066&fit=crop",
    "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=600&h=1066&fit=crop"
  ];
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const features = [
    "Lease PDF generated",
    "Rent collected automatically",
    "Arrears flagged instantly",
    "Owner statements dispatched",
    "Maintenance logged"
  ];
  const [featureIndex, setFeatureIndex] = useState(0);

  useEffect(() => {
    const imgInterval = setInterval(() => {
      setCurrentImgIndex(prev => (prev + 1) % heroImages.length);
      setFeatureIndex(prev => (prev + 1) % features.length);
    }, 4500);
    return () => clearInterval(imgInterval);
  }, []);

  useEffect(() => {
    const headlines = [
      { h: "Your rent roll, finally under control.", s: "One dashboard for every property, tenant, and payment - so nothing slips through." },
      { h: "Stop chasing tenants for rent.", s: "Reminders go out automatically, before and after a payment is due." },
      { h: "Leases that write themselves.", s: "A formatted lease PDF is ready the moment a new tenancy is added." },
      { h: "Know who's paid, at a glance.", s: "Arrears and collection rate update the instant a payment lands." },
      { h: "Every property, one simple system.", s: "Trade the spreadsheet and the paper folder for a single rent roll." }
    ];
    const stage = document.getElementById('headlineStage');
    const sub = document.getElementById('heroSub');
    let idx = 0;
    
    let intervalId: NodeJS.Timeout;

    if (stage && sub) {
      function renderSlide(i: number) {
        const el = document.createElement('h1');
        el.className = 'headline-slide';
        el.textContent = headlines[i].h;
        stage!.appendChild(el);
        requestAnimationFrame(() => { 
          requestAnimationFrame(() => el.classList.add('active')); 
        });
        return el;
      }

      let current = renderSlide(idx);
      current.classList.add('active');

      intervalId = setInterval(() => {
        const next = (idx + 1) % headlines.length;
        const outgoing = current;
        outgoing.classList.remove('active');
        outgoing.classList.add('leaving');
        setTimeout(() => outgoing.remove(), 520);

        current = renderSlide(next);
        idx = next;

        sub!.style.opacity = '0';
        setTimeout(() => {
          sub!.textContent = headlines[idx].s;
          sub!.style.transition = 'opacity .4s ease';
          sub!.style.opacity = '1';
        }, 200);
      }, 3600);
    }

    const faqItems = document.querySelectorAll('.faq-item');
    const handleFaqClick = (item: Element, q: Element, a: HTMLElement) => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o => {
        o.classList.remove('open');
        const ans = o.querySelector('.faq-a') as HTMLElement;
        if (ans) ans.style.maxHeight = '0px'; 
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    };

    const listeners: {q: Element, fn: EventListener}[] = [];

    faqItems.forEach(item => {
      const q = item.querySelector('.faq-q');
      const a = item.querySelector('.faq-a') as HTMLElement;
      if (q && a) {
        const fn = () => handleFaqClick(item, q, a);
        q.addEventListener('click', fn);
        listeners.push({ q, fn });
      }
    });

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (stage) stage.innerHTML = '';
      listeners.forEach(({q, fn}) => q.removeEventListener('click', fn));
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
  :root{
    --black:#0B0B0C;
    --ink:#1A1A1C;
    --grey-900:#3D3D40;
    --grey-600:#6B6B6F;
    --grey-300:#D8D8DA;
    --grey-100:#F1F1F1;
    --grey-50:#FAFAFA;
    --white:#FFFFFF;
    --line:#E4E4E6;
    --radius:16px;
  }
  *{margin:0;padding:0;box-sizing:border-box;}
  body{
    font-family:'Inter',sans-serif; color:var(--ink); background:var(--white);
    -webkit-font-smoothing:antialiased;
  }
  a{color:inherit; text-decoration:none;}
  .wrap{max-width:1120px; margin:0 auto; padding:0 32px;}
  h1,h2,.display{font-family:'Poppins',sans-serif;}
  .caps{font-family:'Montserrat',sans-serif; text-transform:uppercase; letter-spacing:0.08em;}
  ::selection{background:var(--black); color:var(--white);}

  /* ---------- nav ---------- */
  header{border-bottom:1px solid var(--line); position:sticky; top:0; background:rgba(255,255,255,0.92); backdrop-filter:blur(8px); z-index:50;}
  nav.wrap{display:flex; align-items:center; justify-content:space-between; padding:16px 32px;}
  .logo{font-family:'Poppins',sans-serif; font-weight:600; font-size:20px; display:flex; align-items:center; gap:8px;}
  .logo .sq{width:9px; height:9px; background:var(--black); display:inline-block; border-radius:2px;}
  .nav-links{display:flex; gap:34px; font-size:14px; font-weight:500; color:var(--grey-900);}
  .nav-links a:hover{color:var(--black);}
  .nav-right{display:flex; align-items:center; gap:16px;}
  .btn{
    display:inline-flex; align-items:center; justify-content:center;
    padding:10px 20px; border-radius:100px; font-size:14px; font-weight:600;
    border:1px solid var(--black); cursor:pointer; transition:all .16s ease; white-space:nowrap;
  }
  .btn-dark{background:var(--black); color:var(--white);}
  .btn-dark:hover{background:var(--ink); transform:translateY(-1px);}
  .btn-line{background:transparent; color:var(--black);}
  .btn-line:hover{background:var(--grey-100);}
  @media(max-width:860px){.nav-links{display:none;}}

  /* ---------- hero ---------- */
  .hero{padding:96px 0 90px;}
  .hero-grid{display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center;}
  @media(max-width:940px){.hero-grid{grid-template-columns:1fr; text-align:center;}}
  .eyebrow-row{display:flex; gap:10px; font-size:13px; color:var(--grey-600); font-weight:500; margin-bottom:24px;}
  @media(max-width:940px){.eyebrow-row{justify-content:center;}}
  .headline-stage{position:relative; min-height:2.16em;}
  @media(max-width:940px){.headline-stage{min-height:2.3em;}}
  h1{font-size:clamp(32px,4.4vw,50px); font-weight:600; line-height:1.08; letter-spacing:-0.02em; max-width:560px;}
  @media(max-width:940px){h1{max-width:none; margin:0 auto;}}
  .headline-slide{position:absolute; top:0; left:0; right:0; opacity:0; transform:translateY(10px); transition:opacity .5s ease, transform .5s ease;}
  .headline-slide.active{position:relative; opacity:1; transform:none;}
  .headline-slide.leaving{opacity:0; transform:translateY(-10px);}
  .hero-sub{margin-top:20px; font-size:16px; color:var(--grey-600); max-width:440px; line-height:1.6;}
  @media(max-width:940px){.hero-sub{margin:20px auto 0;}}
  .hero-actions{display:flex; flex-direction:column; align-items:flex-start; gap:14px; margin-top:36px;}
  @media(max-width:940px){.hero-actions{align-items:center;}}
  .hero-actions-row{display:flex; align-items:center; gap:14px;}
  .btn-hero{padding:15px 34px; font-size:15.5px; border-radius:100px;}
  .or{font-size:13px; color:var(--grey-600); font-weight:500;}
  .hero-legal{font-size:12.5px; color:var(--grey-600); max-width:360px; margin-top:2px; line-height:1.6;}
  .hero-legal a{text-decoration:underline; color:var(--grey-900);}

  /* ---------- hero image ---------- */
  .hero-visual{position:relative;}
  .hv-frame{background:var(--black); border-radius:20px; padding:22px; box-shadow:0 40px 80px -32px rgba(11,11,12,0.35);}
  .hv-bar{display:flex; gap:6px; padding:2px 4px 18px;}
  .hv-bar span{width:9px; height:9px; border-radius:50%; background:#4A4A4D;}
  .hv-card{background:var(--white); border-radius:12px; padding:22px;}
  .hv-head{display:flex; justify-content:space-between; align-items:baseline; margin-bottom:16px;}
  .hv-head h4{font-family:'Poppins',sans-serif; font-size:15px; font-weight:600;}
  .hv-head span{font-size:11.5px; color:var(--grey-600);}
  .hv-row{display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-top:1px solid var(--line);}
  .hv-row:first-of-type{border-top:none;}
  .hv-unit{font-size:13.5px; font-weight:600;}
  .hv-tenant{font-size:11.5px; color:var(--grey-600); margin-top:2px;}
  .hv-pill{font-size:10.5px; font-weight:600; padding:4px 10px; border-radius:100px; font-family:'Montserrat',sans-serif; letter-spacing:0.02em;}
  .hv-paid{background:var(--grey-100); color:var(--ink);}
  .hv-due{background:var(--ink); color:var(--white);}
  .hv-late{background:var(--black); color:var(--white);}
  .hv-bignum{margin-top:16px; padding-top:16px; border-top:1px solid var(--line); display:flex; justify-content:space-between; align-items:baseline;}
  .hv-bignum .num{font-family:'Poppins',sans-serif; font-size:28px; font-weight:600;}
  .hv-bignum .lbl{font-size:11.5px; color:var(--grey-600); text-align:right; max-width:120px; line-height:1.4;}
  @keyframes badge-bounce {
    0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
    40% {transform: translateY(-8px);}
    60% {transform: translateY(-4px);}
  }
  .hv-badge{
    position:absolute; bottom:-18px; left:-18px; background:var(--white); border:1px solid var(--line);
    border-radius:12px; padding:12px 16px; box-shadow:0 20px 40px -20px rgba(11,11,12,0.3);
    display:flex; align-items:center; gap:10px; font-size:12.5px; font-weight:600; white-space:nowrap;
    animation: badge-bounce 4.5s infinite;
  }
  .hv-badge svg{width:16px; height:16px; stroke:var(--black); flex-shrink:0;}
  @media(max-width:940px){.hero-visual{max-width:420px; margin:0 auto;} .hv-badge{left:50%; transform:translateX(-50%);}}

  /* ---------- pricing ---------- */
  .pricing{padding:20px 0 110px; border-top:1px solid var(--line);}
  .pricing-head{text-align:center; padding:64px 0 48px;}
  .pricing-head .caps{font-size:12px; color:var(--grey-600); margin-bottom:14px; display:block;}
  .pricing-head h2{font-size:clamp(26px,3.4vw,36px); font-weight:600; letter-spacing:-0.01em;}
  .plans{display:grid; grid-template-columns:repeat(4,1fr); gap:0; border:1px solid var(--line); border-radius:var(--radius); overflow:hidden;}
  @media(max-width:900px){.plans{grid-template-columns:1fr; }}
  .plan{padding:40px 32px; border-right:1px solid var(--line);}
  .plan:last-child{border-right:none;}
  @media(max-width:900px){.plan{border-right:none; border-bottom:1px solid var(--line);} .plan:last-child{border-bottom:none;}}
  .plan.featured{background:var(--black); color:var(--white);}
  .plan-name{font-family:'Poppins',sans-serif; font-weight:600; font-size:15px; margin-bottom:6px;}
  .plan-tag{font-size:13.5px; color:var(--grey-600); margin-bottom:22px;}
  .plan.featured .plan-tag{color:#B5B5B8;}
  .plan-price{font-family:'Poppins',sans-serif; font-size:38px; font-weight:600; letter-spacing:-0.01em;}
  .plan-price sup{font-size:16px; font-weight:500; top:-14px;}
  .plan-price-note{font-size:12.5px; color:var(--grey-600); margin-top:6px; min-height:32px; line-height:1.5;}
  .plan.featured .plan-price-note{color:#B5B5B8;}
  .plan .btn{width:100%; margin-top:24px; margin-bottom:28px;}
  .plan.featured .btn-line{border-color:var(--white); color:var(--white);}
  .plan.featured .btn-line:hover{background:rgba(255,255,255,0.08);}
  .plan-features{list-style:none; font-size:13.5px; color:var(--grey-900);}
  .plan.featured .plan-features{color:#E4E4E6;}
  .plan-features li{display:flex; gap:10px; padding:8px 0; line-height:1.5;}
  .plan-features svg{width:15px; height:15px; flex:none; margin-top:2px; stroke:var(--black);}
  .plan.featured .plan-features svg{stroke:var(--white);}
  .plan-features .lead-item{font-weight:600; color:var(--black); padding-bottom:12px;}
  .plan.featured .plan-features .lead-item{color:var(--white);}

  /* ---------- faq ---------- */
  .faq{padding:90px 0; border-top:1px solid var(--line);}
  .faq h2{text-align:center; font-size:clamp(24px,3vw,32px); font-weight:600; margin-bottom:44px;}
  .faq-list{max-width:720px; margin:0 auto;}
  .faq-item{border-bottom:1px solid var(--line);}
  .faq-q{
    display:flex; justify-content:space-between; align-items:center; gap:16px;
    padding:22px 4px; font-family:'Poppins',sans-serif; font-weight:500; font-size:16px; cursor:pointer;
  }
  .faq-q .plus{width:20px; height:20px; flex:none; position:relative; transition:transform .25s ease;}
  .faq-q .plus::before,.faq-q .plus::after{content:''; position:absolute; background:var(--black); border-radius:2px;}
  .faq-q .plus::before{width:14px; height:2px; top:9px; left:3px;}
  .faq-q .plus::after{width:2px; height:14px; top:3px; left:9px; transition:opacity .2s ease;}
  .faq-item.open .plus{transform:rotate(45deg);}
  .faq-a{max-height:0; overflow:hidden; transition:max-height .3s ease;}
  .faq-a p{padding:0 4px 22px; font-size:14.5px; color:var(--grey-600); line-height:1.65; max-width:620px;}

  /* ---------- footer ---------- */
  footer{border-top:1px solid var(--line); padding:56px 0 32px; background:var(--grey-50);}
  .foot-top{display:flex; justify-content:space-between; gap:40px; flex-wrap:wrap; padding-bottom:40px;}
  .foot-brand p{margin-top:12px; font-size:13.5px; color:var(--grey-600); max-width:240px; line-height:1.6;}
  .foot-cols{display:grid; grid-template-columns:repeat(3,1fr); gap:40px;}
  @media(max-width:760px){.foot-cols{grid-template-columns:repeat(2,1fr);}}
  .foot-col h5{font-family:'Montserrat',sans-serif; font-size:11.5px; text-transform:uppercase; letter-spacing:0.07em; color:var(--grey-600); margin-bottom:16px;}
  .foot-col a{display:block; font-size:13.5px; color:var(--ink); margin-bottom:11px; opacity:0.85;}
  .foot-col a:hover{opacity:1;}
  .foot-bottom{display:flex; justify-content:space-between; align-items:center; padding-top:24px; border-top:1px solid var(--line); font-size:12.5px; color:var(--grey-600); flex-wrap:wrap; gap:10px;}
        `
      }} />

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Inter:wght@400;500;600&family=Montserrat:wght@500;600&display=swap" rel="stylesheet" />

      <header>
        <nav className="wrap">
          <div className="logo"><Logo height={22} /></div>
          <div className="nav-links">
            <Link href="#">Platform</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="#">Solutions</Link>
          </div>
          <div className="nav-right">
            <Link href="/login" className="btn btn-line">Log in</Link>
            <Link href="/register" className="btn btn-dark">Get started</Link>
          </div>
        </nav>
      </header>

      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow-row">Meet Rental</div>
            <div className="headline-stage" id="headlineStage"></div>
            <p className="hero-sub" id="heroSub">One dashboard for every property, tenant, and payment - so nothing slips through.</p>
            <div className="hero-actions">
              <div className="hero-actions-row">
                <Link href="/register" className="btn btn-dark btn-hero">Start free</Link>
                <span className="or">or</span>
                <Link href="/login" className="btn btn-line btn-hero">Log in</Link>
              </div>
              <p className="hero-legal">By continuing, you acknowledge Rental's <Link href="/privacy">Privacy Policy</Link>.</p>
            </div>
          </div>
          <div className="hero-visual" style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
              <div className="hv-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '20px', boxShadow: '0 40px 80px -32px rgba(11,11,12,0.35)', position: 'relative', aspectRatio: '6/12', border: '1px solid var(--line)' }}>
                {heroImages.map((img, i) => (
                  <img 
                    key={img}
                    src={img} 
                    alt="Property Portfolio" 
                    style={{ 
                      position: 'absolute', inset: 0, 
                      width: '100%', height: '100%', objectFit: 'cover', 
                      opacity: i === currentImgIndex ? 1 : 0,
                      transition: 'opacity 0.8s ease-in-out',
                      display: 'block'
                    }} 
                  />
                ))}
              </div>
              <div className="hv-badge">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                {features[featureIndex]}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="wrap">
          <div className="pricing-head">
            <span className="caps">Explore plans</span>
            <h2>Simple pricing, per property manager</h2>
          </div>
          <div className="plans">
            <div className="plan">
              <div className="plan-name">Free</div>
              <div className="plan-tag">Try Rental</div>
              <div className="plan-price">$0</div>
              <div className="plan-price-note">Free for a single property</div>
              <Link href="/register" className="btn btn-line">Get started</Link>
              <ul className="plan-features">
                <li className="lead-item">Manage 1 property</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>Tenant &amp; lease records</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>Auto-generated lease PDF</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>Monthly rent invoices</li>
              </ul>
            </div>
            <div className="plan">
              <div className="plan-name">Starter</div>
              <div className="plan-tag">For independent agents</div>
              <div className="plan-price">$49<sup>/mo</sup></div>
              <div className="plan-price-note">Billed monthly</div>
              <Link href="/register" className="btn btn-line">Choose Starter</Link>
              <ul className="plan-features">
                <li className="lead-item">Everything in Free, plus:</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>10 properties, 40 units</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>3 agents, 10 owners</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>Arrears dashboard</li>
              </ul>
            </div>
            <div className="plan featured">
              <div className="plan-name">Growth</div>
              <div className="plan-tag">Most Popular</div>
              <div className="plan-price">$129<sup>/mo</sup></div>
              <div className="plan-price-note">Billed monthly</div>
              <Link href="/register" className="btn btn-line">Choose Growth</Link>
              <ul className="plan-features">
                <li className="lead-item">Everything in Starter, plus:</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>50 properties, 300 units</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>10 agents, 50 owners</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>Priority support</li>
              </ul>
            </div>
            <div className="plan">
              <div className="plan-name">Professional</div>
              <div className="plan-tag">Unlimited scale</div>
              <div className="plan-price">$250<sup>/mo</sup></div>
              <div className="plan-price-note">Billed monthly</div>
              <Link href="/register" className="btn btn-line">Choose Professional</Link>
              <ul className="plan-features">
                <li className="lead-item">Everything in Growth, plus:</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>Unlimited properties</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>Unlimited agents</li>
                <li><svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>Dedicated onboarding</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="faq">
        <div className="wrap">
          <h2>Frequently asked questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <div className="faq-q"><span>What is Rental and how does it work?</span><span className="plus"></span></div>
              <div className="faq-a"><p>Rental is software for landlords and letting agents. You add a property and tenant once, and Rental generates the lease, sends monthly invoices, and reminds tenants automatically as rent comes due.</p></div>
            </div>
            <div className="faq-item">
              <div className="faq-q"><span>Who is Rental built for?</span><span className="plus"></span></div>
              <div className="faq-a"><p>Independent landlords managing a handful of units, and letting agencies managing a full portfolio across multiple properties and staff.</p></div>
            </div>
            <div className="faq-item">
              <div className="faq-q"><span>How much does it cost to use?</span><span className="plus"></span></div>
              <div className="faq-a"><p>Rental is free for a single property. Paid plans start at $12/month for landlords with multiple units, and scale up for agencies with unlimited properties and staff seats.</p></div>
            </div>
            <div className="faq-item">
              <div className="faq-q"><span>Can I cancel anytime?</span><span className="plus"></span></div>
              <div className="faq-a"><p>Yes. Paid plans have no lock-in contract - cancel whenever you like and keep access until the end of your billing period.</p></div>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="foot-top">
            <div className="foot-brand">
              <div className="logo"><Logo height={22} /></div>
              <p>Property management software for landlords and letting agents.</p>
            </div>
            <div className="foot-cols">
              <div className="foot-col">
                <h5>Product</h5>
                <Link href="#">Overview</Link>
                <Link href="#pricing">Pricing</Link>
                <Link href="#">Dashboard</Link>
              </div>
              <div className="foot-col">
                <h5>Solutions</h5>
                <Link href="#">Landlords</Link>
                <Link href="#">Letting agents</Link>
              </div>
              <div className="foot-col">
                <h5>Company</h5>
                <Link href="#">About</Link>
                <Link href="#">Contact</Link>
              </div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Rental.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
