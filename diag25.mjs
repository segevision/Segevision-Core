import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
mkdirSync('/tmp/before', { recursive: true });
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1600,height:1000},deviceScaleFactor:2})).newPage();
await p.goto('http://localhost:3500',{waitUntil:'networkidle'}); await p.waitForTimeout(1000);
await p.screenshot({path:'/tmp/before/1-dashboard.png'});
await p.goto('http://localhost:3500/new',{waitUntil:'networkidle'}); await p.waitForTimeout(600);
await p.screenshot({path:'/tmp/before/2-wizard.png'});
await p.goto('http://localhost:3500',{waitUntil:'networkidle'});
await p.locator('main ul > li a[href*="prj_physiothletics"]').first().click();
await p.waitForURL(/\/projects\//); await p.waitForTimeout(4500);
await p.screenshot({path:'/tmp/before/3-editor.png'});
await p.locator('nav[aria-label="ניווט בעורך"] button').filter({hasText:/^סקשנים$/}).click();
await p.waitForTimeout(800);
await p.screenshot({path:'/tmp/before/4-sections.png'});
// measure information density / hierarchy signals
const m = await p.evaluate(()=>{
  const cs=(s,prop)=>{const e=document.querySelector(s);return e?getComputedStyle(e)[prop]:null;};
  return {
    topbarHeight: document.querySelector('header')?.getBoundingClientRect().height,
    sidebarWidth: document.querySelector('nav[aria-label="ניווט בעורך"]')?.getBoundingClientRect().width,
    distinctSurfaces: [...new Set([...document.querySelectorAll('div,section,header,nav')].map(e=>getComputedStyle(e).backgroundColor).filter(c=>c!=='rgba(0, 0, 0, 0)'))].length,
    borderedBoxes: document.querySelectorAll('[class*="ring-1"],[class*="border "]').length,
  };
});
console.log(JSON.stringify(m,null,2));
await b.close();
