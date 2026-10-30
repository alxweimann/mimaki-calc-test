import test from 'node:test';
import assert from 'node:assert/strict';
import {bannerFinishing,rollupCost,shippingCost} from '../src/core/products.mjs';
test('banner manual hem: four edges and setup',()=>{
 const c=bannerFinishing({widthMm:1000,heightMm:2000,quantity:3,sides:'4',type:'hem',hemEuroM:1.5,setupMinutes:15,hourlyEuro:40,unitEuro:2});
 assert.equal(c.meters,18);assert.equal(c.hem,27);assert.equal(c.setup,10);assert.equal(c.handling,6);assert.equal(c.total,43);
});
test('banner no finishing has no setup or unit charges',()=>{
 assert.equal(bannerFinishing({widthMm:1000,heightMm:2000,quantity:3,type:'none',setupMinutes:20,hourlyEuro:40,unitEuro:5}).total,0);
});
test('rollup complete and replacement graphic preserve pull length',()=>{
 const system={width:850,height:2000,pull:150,price:20,pack:2};
 const args={quantity:2,system,setupMinutes:15,assemblyMinutesPerItem:5,hourlyEuro:60,consumablesEuroPerItem:1};
 const complete=rollupCost({...args,mode:'complete'}),replacement=rollupCost({...args,mode:'print'});
 assert.equal(complete.printHeightMm,2150);assert.equal(complete.hardware,40);assert.equal(replacement.hardware,0);
 assert.equal(complete.total-replacement.total,40);
});
test('delivery uses round-trip kilometers and time',()=>{
 const c=shippingCost({mode:'delivery',oneWayKm:15,euroKm:.5,driverMinutes:30,driverHourlyEuro:30,deliveryPackEuro:5,deliveryMarkupPercent:20});
 assert.equal(c.roundTripKm,30);assert.equal(c.total,42);
});
test('parcel freight and pickup',()=>{
 assert.equal(shippingCost({mode:'parcel',freightEuro:10,packEuro:2,parcelMarkupPercent:25}).total,15);
 assert.equal(shippingCost({mode:'pickup',freightEuro:10}).total,0);
});
