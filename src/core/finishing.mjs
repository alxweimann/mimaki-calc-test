/** Pure finishing cost components. Inputs are per completed item unless stated otherwise. */
const nonnegative=(v,label)=>{if(!Number.isFinite(v)||v<0)throw Error('Invalid '+label);return v};
const whole=(v,label)=>{nonnegative(v,label);if(!Number.isInteger(v))throw Error('Invalid '+label);return v};
export function contourCost({quantity,unitCost=0}) {
  return whole(quantity,'quantity')*nonnegative(unitCost,'unitCost');
}
export function eyeletCost({quantity,eyeletsPerItem,unitCost=0}) {
  return whole(quantity,'quantity')*whole(eyeletsPerItem,'eyeletsPerItem')*nonnegative(unitCost,'unitCost');
}
export function manualTrimCost({cuts,unitCost=0}) {
  return whole(cuts,'cuts')*nonnegative(unitCost,'unitCost');
}
/** Legacy laminate uses the printed roll's linear meters for material and printed roll area for labor.
 * A narrower laminate roll may not cover the printed width; fail rather than silently undercharge.
 */
export function laminateCost({linearMeters,rollAreaM2,printWidthMm,laminateWidthMm,laminateRollLengthM,laminateRollPrice,workEuroM2=0}) {
  for(const [name,value] of Object.entries({linearMeters,rollAreaM2,printWidthMm,laminateWidthMm,laminateRollLengthM,laminateRollPrice,workEuroM2}))nonnegative(value,name);
  if(laminateRollLengthM<=0||laminateWidthMm<=0||printWidthMm<=0)throw Error('Invalid laminate roll');
  if(laminateWidthMm<printWidthMm)throw Error('Laminate is narrower than print roll');
  const material=laminateRollPrice/laminateRollLengthM*linearMeters;
  const labor=rollAreaM2*workEuroM2;
  return {material,labor,total:material+labor};
}
export function finishingTotal(costs) {
  if(!Array.isArray(costs))throw Error('Invalid finishing list');
  return costs.reduce((sum,c)=>sum+nonnegative(c,'cost'),0);
}
