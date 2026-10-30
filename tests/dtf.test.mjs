import test from 'node:test';
import assert from 'node:assert/strict';
import {packDtfSheet,dtfCosts} from '../src/core/dtf.mjs';
const overlaps=(a,b,g)=>a.x<b.x+b.w+g-1e-7&&a.x+a.w+g>b.x+1e-7&&a.y<b.y+b.h+g-1e-7&&a.y+a.h+g>b.y+1e-7;
test('mixed motifs pack inside sheet with verified spacing',()=>{
 const pieces=[...Array.from({length:8},()=>({name:'Brust',w:10,h:8})),...Array.from({length:4},()=>({name:'Rücken',w:25,h:20}))];
 const r=packDtfSheet({width:60,gap:.5,pieces});
 assert.equal(r.items.length,12);
 for(let i=0;i<r.items.length;i++){
  const p=r.items[i];assert.ok(p.x>=0&&p.y>=0&&p.x+p.w<=60+1e-7);
  for(let j=i+1;j<r.items.length;j++)assert.equal(overlaps(p,r.items[j],.5),false);
 }
});
test('motif can rotate to fit narrow sheet',()=>{
 const r=packDtfSheet({width:30,pieces:[{name:'Brust',w:40,h:20}]});
 assert.equal(r.items[0].rot,true);assert.equal(r.items[0].w,20);
});
test('rejects motif wider than sheet in both orientations',()=>{
 assert.throws(()=>packDtfSheet({width:20,pieces:[{name:'Rücken',w:30,h:40}]}));
});
test('DTF cost respects supplier step, spare cuts and press cycles',()=>{
 const c=dtfCosts({placedLengthCm:122,sheetWidthCm:60,motifAreaCm2:3500,motifCount:12,presses:10,quantity:5,minLengthCm:100,lengthStepCm:10,sheetEuroM:20,supplierShipping:5,textileEuroPerItem:3,setupMinutes:15,pressSeconds:20,cutSeconds:5,hourlyEuro:60,reservePercent:10,factor:2});
 assert.equal(c.orderedCm,130);assert.equal(c.meters,1.3);assert.equal(c.material,26);assert.equal(c.textiles,15);assert.equal(c.setup,15);assert.equal(c.cut,1);assert.ok(Math.abs(c.press-10/3)<1e-9);assert.ok(Math.abs(c.salePrice-2*c.selfCost)<1e-9);
});
