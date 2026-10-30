import test from 'node:test';
import assert from 'node:assert/strict';
import {contourCost,eyeletCost,manualTrimCost,laminateCost,finishingTotal} from '../src/core/finishing.mjs';
test('legacy contour, eyelets and manual trimming',()=>{
 assert.equal(contourCost({quantity:10,unitCost:.5}),5);
 assert.equal(eyeletCost({quantity:10,eyeletsPerItem:8,unitCost:.5}),40);
 assert.equal(manualTrimCost({cuts:10,unitCost:.5}),5);
 assert.equal(finishingTotal([5,40,5]),50);
});
test('laminate uses roll length and area, separately',()=>{
 const c=laminateCost({linearMeters:1.53,rollAreaM2:2.0961,printWidthMm:1370,laminateWidthMm:1370,laminateRollLengthM:50,laminateRollPrice:110,workEuroM2:1.5});
 assert.ok(Math.abs(c.material-3.366)<1e-9);
 assert.ok(Math.abs(c.labor-3.14415)<1e-9);
 assert.ok(Math.abs(c.total-6.51015)<1e-9);
});
test('reject invalid cost inputs and narrower laminate',()=>{
 assert.throws(()=>eyeletCost({quantity:10,eyeletsPerItem:-1,unitCost:.5}));
 assert.throws(()=>laminateCost({linearMeters:1,rollAreaM2:1,printWidthMm:1370,laminateWidthMm:1000,laminateRollLengthM:50,laminateRollPrice:110}));
});
