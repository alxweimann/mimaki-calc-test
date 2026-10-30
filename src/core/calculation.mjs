/**
 * Mimaki Calc 2.0 — pure nesting and base-cost calculations.
 * Legacy compatibility mode reproduces the original calculator's arithmetic.
 * No DOM, localStorage or side effects. All dimensions in mm unless noted.
 */
export function planNesting({width,height,quantity,rollWidth,margin=10,bleed=3,gap=0,orientation='auto'}) {
  const vals=[width,height,quantity,rollWidth,margin,bleed,gap];
  if(vals.some(v=>!Number.isFinite(v))||width<=0||height<=0||quantity<1||!Number.isInteger(quantity)||rollWidth<=0||margin<0||bleed<0||gap<0) return null;
  const usable=rollWidth-2*margin;
  if(usable<=0)return null;
  const candidate=(pieceW,pieceH,rotated)=>{
    if(pieceW>usable)return null;
    const across=Math.floor((usable+gap)/(pieceW+gap));
    if(across<1)return null;
    const rows=Math.ceil(quantity/across);
    return {across,rows,rotated,pieceW,pieceH,lengthMm:rows*pieceH+(rows-1)*gap};
  };
  const normal=candidate(width+2*bleed,height+2*bleed,false);
  const rotated=candidate(height+2*bleed,width+2*bleed,true);
  if(orientation==='0')return normal;
  if(orientation==='90')return rotated;
  if(orientation!=='auto')return null;
  return !normal?rotated:!rotated?normal:normal.lengthMm<=rotated.lengthMm?normal:rotated;
}

/** Exact baseline formulas from the original index.html (without extras). */
export function legacyBaseCosts({plan,quantity,width,height,rollWidth,rollLengthM,rollPrice,inks,inkUseMlM2=8,machineEuroM2=4,cleanEuroM2=0,factor=2,minimum=15}) {
  if(!plan||!Number.isInteger(quantity)||quantity<1||width<=0||height<=0||rollWidth<=0||rollLengthM<=0||rollPrice<0||!Array.isArray(inks)||inks.length!==4)throw Error('Invalid cost inputs');
  if(inks.some(i=>!Number.isFinite(i.ml)||i.ml<=0||!Number.isFinite(i.price)||i.price<0))throw Error('Invalid ink');
  if([inkUseMlM2,machineEuroM2,cleanEuroM2,factor,minimum].some(v=>!Number.isFinite(v)||v<0))throw Error('Invalid cost settings');
  const linearMeters=plan.lengthMm/1000;
  const rollAreaM2=rollWidth/1000*linearMeters;
  const motifAreaM2=width*height*quantity/1e6;
  const material=rollPrice/rollLengthM*linearMeters;
  const averageInkRate=inks.reduce((sum,i)=>sum+i.price/i.ml,0)/4;
  const ink=motifAreaM2*inkUseMlM2*averageInkRate;
  const machine=rollAreaM2*machineEuroM2;
  const cleaning=rollAreaM2*cleanEuroM2;
  const selfCost=material+ink+machine+cleaning;
  const salePrice=Math.max(minimum,selfCost*factor);
  return {linearMeters,rollAreaM2,motifAreaM2,material,ink,machine,cleaning,selfCost,salePrice,unitPrice:salePrice/quantity};
}

/** Separate new pricing mode; never silently replace the legacy factor. */
export function priceFromMargin(selfCost,marginPercent,minimum=0) {
  if(!Number.isFinite(selfCost)||selfCost<0||!Number.isFinite(marginPercent)||marginPercent<0||marginPercent>=100||!Number.isFinite(minimum)||minimum<0)throw Error('Invalid margin inputs');
  return Math.max(minimum,selfCost/(1-marginPercent/100));
}

/** Returns positions in millimeters; last partial row starts at left printable margin. */
export function nestingRects(plan,{quantity,rollWidth,margin=10,gap=0,lastRow='left'}) {
  if(!plan||!Number.isInteger(quantity)||quantity<1||!Number.isFinite(rollWidth)||rollWidth<=0||margin<0||gap<0)throw Error('Invalid nesting geometry');
  const usable=rollWidth-2*margin;
  const fullWidth=plan.across*plan.pieceW+(plan.across-1)*gap;
  if(fullWidth>usable+1e-8)throw Error('Layout exceeds printable width');
  const rects=[];
  for(let row=0;row<plan.rows;row++){
    const count=Math.min(plan.across,quantity-row*plan.across);
    if(count<=0)break;
    const rowWidth=count*plan.pieceW+(count-1)*gap;
    const start=(count<plan.across&&lastRow==='left')?margin:margin+(usable-rowWidth)/2;
    for(let col=0;col<count;col++)rects.push({index:row*plan.across+col+1,row,col,x:start+col*(plan.pieceW+gap),y:row*(plan.pieceH+gap),width:plan.pieceW,height:plan.pieceH});
  }
  return rects;
}
