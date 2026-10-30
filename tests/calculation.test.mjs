import test from 'node:test';
import assert from 'node:assert/strict';
import {planNesting,legacyBaseCosts,priceFromMargin,nestingRects} from '../src/core/calculation.mjs';

const input={width:500,height:300,quantity:10,rollWidth:1370,margin:10,bleed:3,gap:6};
const inks=Array.from({length:4},()=>({ml:440,price:74.39}));

test('auto selects shorter run',()=>{
 const p=planNesting({...input,orientation:'auto'});
 assert.equal(p.rotated,true);
 assert.equal(p.across,4);
 assert.equal(p.rows,3);
 assert.equal(p.lengthMm,1530);
});
test('forced 0 degree and 90 degree',()=>{
 const a=planNesting({...input,orientation:'0'}),b=planNesting({...input,orientation:'90'});
 assert.equal(a.across,2);
 assert.equal(a.rows,5);
 assert.equal(a.lengthMm,1554);
 assert.equal(b.lengthMm,1530);
});
test('rejects oversized and invalid dimensions',()=>{
 assert.equal(planNesting({...input,width:2000}),null);
 assert.equal(planNesting({...input,quantity:0}),null);
 assert.equal(planNesting({...input,margin:-1}),null);
});
test('full rows centered; final partial row left aligned',()=>{
 const p=planNesting({...input,orientation:'90'});
 const rects=nestingRects(p,{quantity:10,rollWidth:1370,margin:10,gap:6});
 assert.equal(rects.length,10);
 assert.equal(rects[0].x,64);
 assert.equal(rects[8].x,10);
 assert.equal(rects[9].x,322);
});
test('base price uses original factor, minimum, motif ink area and roll machine area',()=>{
 const p=planNesting({...input,orientation:'auto'});
 const c=legacyBaseCosts({plan:p,quantity:10,width:500,height:300,rollWidth:1370,rollLengthM:50,rollPrice:145,inks});
 assert.ok(Math.abs(c.linearMeters-1.53)<1e-9);
 assert.ok(Math.abs(c.material-4.437)<1e-9);
 assert.ok(Math.abs(c.motifAreaM2-1.5)<1e-9);
 assert.ok(Math.abs(c.rollAreaM2-2.0961)<1e-9);
 assert.ok(Math.abs(c.ink-1.5*8*(74.39/440))<1e-9);
 assert.equal(c.salePrice,Math.max(15,c.selfCost*2));
});
test('margin pricing is explicit and differs from factor',()=>{
 assert.equal(priceFromMargin(60,40),100);
 assert.equal(priceFromMargin(60,40,120),120);
 assert.throws(()=>priceFromMargin(60,100));
});
