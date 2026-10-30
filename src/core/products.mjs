/** Pure product costs extracted from the existing PrintPilot Studio v82 formulas.
 * Costs are non-negative EUR, dimensions in mm, times in minutes.
 */
function nn(v,name){if(!Number.isFinite(v)||v<0)throw Error('Invalid '+name);return v}
function units(q){nn(q,'quantity');if(!Number.isInteger(q)||q<1)throw Error('Invalid quantity');return q}
export function bannerFinishing({widthMm,heightMm,quantity,sides='4',type='none',hemEuroM=0,tapeEuroM=0,setupMinutes=0,hourlyEuro=0,unitEuro=0}) {
  units(quantity);nn(widthMm,'width');nn(heightMm,'height');
  if(widthMm===0||heightMm===0)throw Error('Invalid format');
  if(!['1','2','4'].includes(String(sides))||!['none','hem','tape','both'].includes(type))throw Error('Invalid finishing selection');
  [hemEuroM,tapeEuroM,setupMinutes,hourlyEuro,unitEuro].forEach((v,i)=>nn(v,['hemEuroM','tapeEuroM','setupMinutes','hourlyEuro','unitEuro'][i]));
  const active=type!=='none';
  const edgeMm=String(sides)==='4'?2*(widthMm+heightMm):String(sides)==='2'?2*widthMm:widthMm;
  const meters=active?edgeMm/1000*quantity:0;
  const hem=(type==='hem'||type==='both')?meters*hemEuroM:0;
  const tape=(type==='tape'||type==='both')?meters*tapeEuroM:0;
  const setup=active?setupMinutes/60*hourlyEuro:0;
  const handling=active?quantity*unitEuro:0;
  return {meters,hem,tape,setup,handling,total:hem+tape+setup+handling};
}
export function rollupCost({quantity,mode='off',system=null,setupMinutes=0,assemblyMinutesPerItem=0,hourlyEuro=0,consumablesEuroPerItem=0}) {
  units(quantity);
  if(!['off','complete','print'].includes(mode))throw Error('Invalid roll-up mode');
  if(mode==='off')return {total:0,printWidthMm:null,printHeightMm:null,hardware:0,packaging:0,labor:0,consumables:0};
  if(!system)throw Error('Missing roll-up system');
  for(const key of ['width','height','pull','price','pack'])nn(system[key],key);
  [setupMinutes,assemblyMinutesPerItem,hourlyEuro,consumablesEuroPerItem].forEach((v,i)=>nn(v,['setupMinutes','assemblyMinutesPerItem','hourlyEuro','consumablesEuroPerItem'][i]));
  if(system.width<=0||system.height<=0)throw Error('Invalid roll-up format');
  const hardware=mode==='complete'?system.price*quantity:0;
  const packaging=system.pack*quantity;
  const labor=(setupMinutes+quantity*assemblyMinutesPerItem)/60*hourlyEuro;
  const consumables=quantity*consumablesEuroPerItem;
  return {hardware,packaging,labor,consumables,total:hardware+packaging+labor+consumables,printWidthMm:system.width,printHeightMm:system.height+system.pull};
}
export function shippingCost({mode='pickup',freightEuro=0,packEuro=0,parcelMarkupPercent=0,oneWayKm=0,euroKm=0,driverMinutes=0,driverHourlyEuro=0,deliveryPackEuro=0,deliveryMarkupPercent=0}) {
  if(!['pickup','parcel','freight','delivery'].includes(mode))throw Error('Invalid shipping mode');
  for(const [key,value] of Object.entries({freightEuro,packEuro,parcelMarkupPercent,oneWayKm,euroKm,driverMinutes,driverHourlyEuro,deliveryPackEuro,deliveryMarkupPercent}))nn(value,key);
  if(mode==='pickup')return {total:0,roundTripKm:0};
  if(mode==='delivery'){
    const roundTripKm=2*oneWayKm;
    return {total:(roundTripKm*euroKm+driverMinutes/60*driverHourlyEuro+deliveryPackEuro)*(1+deliveryMarkupPercent/100),roundTripKm};
  }
  return {total:(freightEuro+packEuro)*(1+parcelMarkupPercent/100),roundTripKm:0};
}
