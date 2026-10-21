#!/usr/bin/env node
// Derived rendering flow from Ian XHS Carousel (MIT); see ../references/upstream-license.txt.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

function args(argv) {
  const a = { theme: 'light' }, positional = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--theme' || argv[i] === '--browser') {
      const key = argv[i].slice(2), value = argv[++i];
      if (!value || value.startsWith('--')) throw Error(`Missing value for --${key}`);
      a[key] = value;
    } else if (argv[i].startsWith('--')) throw Error(`Unknown option: ${argv[i]}`);
    else positional.push(argv[i]);
  }
  if (positional.length !== 2) throw Error('Usage: node render.cjs input.html NEW_OUTPUT_DIR [--theme light|dark] [--browser executable]');
  if (!['light', 'dark'].includes(a.theme)) throw Error('Theme must be light or dark');
  a.html = path.resolve(positional[0]); a.out = path.resolve(positional[1]);
  if (!fs.existsSync(a.html) || !fs.statSync(a.html).isFile()) throw Error('Input HTML does not exist');
  if (fs.existsSync(a.out)) throw Error('Output directory already exists; use a new version directory');
  return a;
}

function lint(slide) {
  const issues = [], box = slide.getBoundingClientRect();
  const style = slide.dataset.style || document.body.dataset.style || 'product-ui';
  const sets = {
    'product-ui': [22,24,26,32,40,64,88], research:[22,24,26,32,36,40,64,80,88],
    archive:[22,24,26,32,36,40,64,80,88], dramatic:[22,24,26,32,36,40,48,64,80,88,96,112],
    blueprint:[22,24,26,32,36,40,48,64,80,88]
  };
  if (!sets[style]) return { style, issues:['Unknown style: ' + style] };
  if (Math.abs(box.width-1080)>0.1 || Math.abs(box.height-1440)>0.1) issues.push('Slide must be exactly 1080x1440 CSS pixels');
  if (slide.querySelector('.ph, [data-placeholder]')) issues.push('Unresolved placeholder');
  for (const img of slide.querySelectorAll('img')) {
    if (!img.complete || !img.naturalWidth) issues.push('Image not loaded: ' + (img.getAttribute('src') || '').slice(0,80));
  }
  const walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (!node.textContent.trim()) continue;
    const el = node.parentElement;
    if (el.closest('script,style,svg,canvas,.ph')) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const text = node.textContent.trim().slice(0,30);
    if (!el.closest('[data-art],.code') && !sets[style].includes(Math.round(parseFloat(cs.fontSize))))
      issues.push(`Unsupported ${style} text size ${cs.fontSize}: ${text}`);
    const range = document.createRange(); range.selectNodeContents(node);
    for (const r of range.getClientRects()) {
      if (!r.width || !r.height) continue;
      if (r.left<box.left-1 || r.right>box.right+1 || r.top<box.top-1 || r.bottom>box.bottom-40)
        issues.push('Text outside safe canvas: ' + text);
      for (let p=el; p && p!==slide; p=p.parentElement) {
        const c=getComputedStyle(p), b=p.getBoundingClientRect();
        if (['hidden','clip','auto','scroll'].includes(c.overflowX) && (r.left<b.left-1 || r.right>b.right+1))
          issues.push('Horizontally clipped text: '+text);
        if (['hidden','clip','auto','scroll'].includes(c.overflowY) && (r.top<b.top-1 || r.bottom>b.bottom+1))
          issues.push('Vertically clipped text: '+text);
      }
    }
  }
  if (style==='product-ui') {
    const probe=document.createElement('i');probe.style.color='var(--orange)';slide.appendChild(probe);
    const orange=getComputedStyle(probe).color;probe.remove();const spots=new Set();
    for(const el of slide.querySelectorAll('*')) {
      if(el.closest('[data-art],.code,svg')) continue;
      const c=getComputedStyle(el), hasText=[...el.childNodes].some(n=>n.nodeType===3 && n.textContent.trim());
      if((c.color===orange && hasText) || c.backgroundColor===orange) spots.add(el.closest('[data-accent]') || el);
    }
    if(spots.size>1) issues.push(`Product UI has ${spots.size} orange accents; group related accents with data-accent`);
  }
  return {style,issues:[...new Set(issues)]};
}

async function main() {
  const a=args(process.argv.slice(2));
  let chromium, sharp;
  try { ({chromium}=require('playwright')); sharp=require('sharp'); }
  catch { throw Error('Renderer dependencies missing; see references/runtime.md'); }
  const browser=await chromium.launch(a.browser?{executablePath:a.browser}:{});
  const report={width:1080,height:1440,theme:a.theme,network:'blocked',pages:[],errors:[],blockedRequests:[]};
  const shots=[];
  try {
    const page=await browser.newPage({viewport:{width:1280,height:1600},deviceScaleFactor:2});
    await page.route(/https?:\/\//, route=>{
      report.blockedRequests.push(new URL(route.request().url()).origin);
      return route.abort();
    });
    page.on('pageerror',error=>report.errors.push('Page script: '+error.message));
    page.on('console',m=>{if(m.type()==='error') report.errors.push('Console: '+m.text());});
    await page.goto(pathToFileURL(a.html).href,{waitUntil:'load',timeout:30000});
    const styles=await page.locator('.slide').evaluateAll(els=>els.map(e=>e.dataset.style || document.body.dataset.style || 'product-ui'));
    if(!styles.length) throw Error('No .slide found');
    if(a.theme==='dark' && styles.some(s=>s!=='product-ui')) throw Error('Dark theme requires a product-ui-only carousel');
    if(a.theme==='dark') await page.evaluate(()=>document.body.dataset.theme='dark');
    await page.evaluate(async()=>{
      await document.fonts.ready;
      await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));
    });
    const slides=page.locator('.slide');
    for(let i=0;i<styles.length;i++) {
      const el=slides.nth(i);await el.scrollIntoViewIfNeeded();
      await el.evaluate(e=>e.querySelectorAll('[data-poke]').forEach(n=>n.dispatchEvent(new Event('poke'))));
      const hover=await el.getAttribute('data-hover');
      if(hover) {
        const target=el.locator(hover);
        if(await target.count()) await target.first().hover();
        else report.errors.push(`Page ${i+1}: data-hover target missing`);
      } else await page.mouse.move(0,0);
      const wait=Number(await el.getAttribute('data-wait') || '100');
      if(!Number.isFinite(wait) || wait<0 || wait>10000) throw Error('data-wait must be between 0 and 10000 ms');
      await page.waitForTimeout(wait);
      const result=await el.evaluate(lint);
      const raw=await el.screenshot({animations:'disabled'});
      shots.push(await sharp(raw).resize(1080,1440).png().toBuffer());
      report.pages.push({page:i+1,layout:await el.getAttribute('data-layout') || '',...result});
    }
    report.blockedRequests=[...new Set(report.blockedRequests)];
    if(report.blockedRequests.length) report.errors.push('External resources were blocked; make every asset local');
    report.passed=!report.errors.length && report.pages.every(p=>!p.issues.length);
    // Check again after rendering: a concurrent invocation must not overwrite this run's output.
    fs.mkdirSync(a.out,{recursive:false});
    for(let i=0;i<shots.length;i++) fs.writeFileSync(path.join(a.out,String(i+1).padStart(2,'0')+'.png'),shots[i]);
    const columns=Math.min(3,shots.length),rows=Math.ceil(shots.length/columns),gap=28,w=324,h=432;
    const cells=[];
    for(let i=0;i<shots.length;i++) {
      const left=gap+(i%columns)*(w+gap),top=gap+Math.floor(i/columns)*(h+gap+32);
      const label=Buffer.from(`<svg width="324" height="28"><text x="0" y="22" font-family="sans-serif" font-size="18">${String(i+1).padStart(2,'0')} / ${report.pages[i].style}</text></svg>`);
      cells.push({input:label,left,top},{input:await sharp(shots[i]).resize(w,h).toBuffer(),left,top:top+32});
    }
    await sharp({create:{width:gap+columns*(w+gap),height:gap+rows*(h+gap+32),channels:3,background:'#dededb'}}).composite(cells).png().toFile(path.join(a.out,'overview.png'));
    fs.writeFileSync(path.join(a.out,'qa.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify({passed:report.passed,pages:shots.length,issues:report.pages.reduce((n,p)=>n+p.issues.length,0),errors:report.errors.length,out:a.out}));
    if(!report.passed) process.exitCode=1;
  } finally { await browser.close(); }
}

main().catch(error=>{console.error(error.message);process.exitCode=1;});
