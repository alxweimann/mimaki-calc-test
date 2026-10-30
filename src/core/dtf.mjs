/** DTF gang sheet placement extracted from PrintPilot Studio v82.
 * Dimensions and gap in centimeters. Heuristic placement, not guaranteed optimal.
 */
export function packDtfSheet({width,gap=0,pieces}) {
 if(!Number.isFinite(width)||width<=0||!Number.isFinite(gap)||gap<0||!Array.isArray(pieces)||!pieces.length||pieces.length>4000)throw Error('Invalid gang sheet');
 for(const p of pieces)if(!p||!Number.isFinite(p.w)||!Number.isFinite(p.h)||p.w<=0||p.h<=0||typeof p.name!=='string')throw Error('Invalid motif');
  function pack(order){
   const free=[{x:0,y:0,w:width,h:Math.max(10000,order.reduce((v,p)=>v+Math.max(p.w,p.h)+gap,0))}];
   const placed=[];
   const overlap=(a,b)=>a.x<b.x+b.w-1e-8&&a.x+a.w>b.x+1e-8&&a.y<b.y+b.h-1e-8&&a.y+a.h>b.y+1e-8;
   for(const piece of order){
    const opts=[{w:piece.w,h:piece.h,rot:false}];
    if(piece.w!==piece.h)opts.push({w:piece.h,h:piece.w,rot:true});
    let best=null;
    for(const rect of free)for(const o of opts){
     if(o.w>rect.w+1e-8||o.h>rect.h+1e-8)continue;
     const score=Math.max(placed.reduce((m,p)=>Math.max(m,p.y+p.h),0),rect.y+o.h)*100000+rect.y*100+rect.x;
     if(!best||score<best.score)best={x:rect.x,y:rect.y,w:o.w,h:o.h,rot:o.rot,score};
    }
    if(!best)return null;
    const item={name:piece.name,x:best.x,y:best.y,w:best.w,h:best.h,rot:best.rot};
    placed.push(item);
    // Split every intersecting free region; virtual gap protects neighboring artwork.
    const occupied={x:item.x,y:item.y,w:item.w+gap,h:item.h+gap};
    for(let i=free.length-1;i>=0;i--){
     const f=free[i];if(!overlap(f,occupied))continue;
     free.splice(i,1);
     const candidates=[
      {x:f.x,y:f.y,w:occupied.x-f.x,h:f.h},
      {x:occupied.x+occupied.w,y:f.y,w:f.x+f.w-occupied.x-occupied.w,h:f.h},
      {x:f.x,y:f.y,w:f.w,h:occupied.y-f.y},
      {x:f.x,y:occupied.y+occupied.h,w:f.w,h:f.y+f.h-occupied.y-occupied.h}
     ];
     for(const q of candidates)if(q.w>1e-7&&q.h>1e-7)free.push(q);
    }
    // Remove free rectangles fully contained by other free rectangles.
    for(let i=free.length-1;i>=0;i--){
     const f=free[i];
     if(free.some((q,j)=>i!==j&&f.x>=q.x-1e-8&&f.y>=q.y-1e-8&&f.x+f.w<=q.x+q.w+1e-8&&f.y+f.h<=q.y+q.h+1e-8)){free.splice(i,1)}
    }
   }
   return {items:placed,length:placed.reduce((m,p)=>Math.max(m,p.y+p.h),0),method:'2D-Freiflächenbelegung'};
  }
  // v41: compare free-rectangle packing with width-efficient grouped rows.
  // This prevents tall motifs from being stacked when two fit side by side.
  function packRows(){
   const groups=new Map();
   for(const piece of pieces){const key=piece.name+'|'+piece.w+'|'+piece.h;if(!groups.has(key))groups.set(key,{piece,count:0});groups.get(key).count++}
   const ordered=[...groups.values()].sort((a,b)=>b.piece.w*b.piece.h-a.piece.w*a.piece.h);
   const placed=[];let y=0;
   for(const {piece,count} of ordered){
    const opts=[{w:piece.w,h:piece.h,rot:false}];
    if(piece.w!==piece.h)opts.push({w:piece.h,h:piece.w,rot:true});
    const feasible=opts.map(o=>({...o,across:Math.floor((width+gap)/(o.w+gap))})).filter(o=>o.across>=1);
    if(!feasible.length)return null;
    feasible.sort((a,b)=>Math.ceil(count/a.across)*a.h+(Math.ceil(count/a.across)-1)*gap-(Math.ceil(count/b.across)*b.h+(Math.ceil(count/b.across)-1)*gap));
    const o=feasible[0],rows=Math.ceil(count/o.across);
    for(let i=0;i<count;i++)placed.push({name:piece.name,x:(i%o.across)*(o.w+gap),y:y+Math.floor(i/o.across)*(o.h+gap),w:o.w,h:o.h,rot:o.rot});
    y+=rows*o.h+(rows-1)*gap+gap;
   }
   return {items:placed,length:placed.reduce((m,p)=>Math.max(m,p.y+p.h),0),method:'Reihenoptimierung'};
  }
  // v46: mixed-height shelf candidates: place small motifs in leftover width
  // of existing rows when their dimensions fit, otherwise open a new row.
  function packMixed(order){
   const rows=[],placed=[];
   for(const piece of order){
    const opts=[{w:piece.w,h:piece.h,rot:false}];
    if(piece.w!==piece.h)opts.push({w:piece.h,h:piece.w,rot:true});
    let best=null;
    for(const row of rows)for(const o of opts){
     if(o.h>row.h+1e-8||row.used+o.w>width+1e-8)continue;
     const score=(width-row.used-o.w)*1000+(row.h-o.h)*10;
     if(!best||score<best.score)best={row,o,score};
    }
    if(best){
     const {row,o}=best;
     placed.push({name:piece.name,x:row.used,y:row.y,w:o.w,h:o.h,rot:o.rot});
     row.used+=o.w+gap;
    }else{
     const o=opts.filter(v=>v.w<=width+1e-8).sort((a,b)=>a.h-b.h||a.w-b.w)[0];
     if(!o)return null;
     const y=rows.length?rows[rows.length-1].y+rows[rows.length-1].h+gap:0;
     const row={y,h:o.h,used:o.w+gap};rows.push(row);
     placed.push({name:piece.name,x:0,y,w:o.w,h:o.h,rot:o.rot});
    }
   }
   return {items:placed,length:placed.reduce((m,p)=>Math.max(m,p.y+p.h),0),method:'Gemischte Restflächenbelegung'};
  }
  // v49: enumerate orientations and row orders for all motif groups (up to three).
  function packRowVariants(){
   const groups=new Map();
   for(const piece of pieces){const key=piece.name+'|'+piece.w+'|'+piece.h;if(!groups.has(key))groups.set(key,{piece,count:0});groups.get(key).count++}
   const entries=[...groups.values()];if(entries.length>3)return null;
   let best=null;
   function explore(remaining,placed,y){
    if(!remaining.length){
     const length=placed.reduce((m,p)=>Math.max(m,p.y+p.h),0);
     if(!best||length<best.length)best={items:placed,length,method:'Optimierte Motiv-Reihen'};
     return;
    }
    for(let j=0;j<remaining.length;j++){
     const {piece,count}=remaining[j],rest=remaining.filter((_,k)=>k!==j);
     const opts=[{w:piece.w,h:piece.h,rot:false}];
     if(piece.w!==piece.h)opts.push({w:piece.h,h:piece.w,rot:true});
     for(const o of opts){
      const across=Math.floor((width+gap)/(o.w+gap));if(across<1)continue;
      const rows=Math.ceil(count/across),height=rows*o.h+(rows-1)*gap;
      if(best&&y+height>best.length+1e-7)continue;
      const added=Array.from({length:count},(_,i)=>({name:piece.name,x:(i%across)*(o.w+gap),y:y+Math.floor(i/across)*(o.h+gap),w:o.w,h:o.h,rot:o.rot}));
      explore(rest,placed.concat(added),y+height+gap);
     }
    }
   }
   explore(entries,[],0);return best;
  }
  const byArea=[...pieces].sort((a,b)=>b.w*b.h-a.w*a.h||Math.max(b.w,b.h)-Math.max(a.w,a.h));
  const byLongSide=[...pieces].sort((a,b)=>Math.max(b.w,b.h)-Math.max(a.w,a.h)||b.w*b.h-a.w*a.h);
  // Validate each candidate before selecting the shortest: some heuristics can violate spacing.
  const validPlacement=items=>items.every((p,i)=>p.x>=-1e-7&&p.y>=-1e-7&&p.x+p.w<=width+1e-7&&items.slice(i+1).every(q=>!(p.x<q.x+q.w+gap-1e-7&&p.x+p.w+gap>q.x+1e-7&&p.y<q.y+q.h+gap-1e-7&&p.y+p.h+gap>q.y+1e-7)));
  const candidates=(pieces.length>250?[packRows(),packRowVariants()]:[pack(byArea),pack(byLongSide),packRows(),packMixed(byArea),packMixed(byLongSide),packRowVariants()]).filter(c=>c&&validPlacement(c.items));
  const solution=candidates.sort((a,b)=>a.length-b.length)[0];
  if(!solution)throw Error('No valid placement');

 return solution;
}
/** DTF production costs follow the existing gang-sheet calculator.
 * All lengths in centimeters, except sheet purchase price in EUR/linear meter.
 */
export function dtfCosts({placedLengthCm,sheetWidthCm,motifAreaCm2,motifCount,presses,quantity,minLengthCm=0,lengthStepCm=1,sheetEuroM=0,supplierShipping=0,textileEuroPerItem=0,setupMinutes=0,pressSeconds=0,cutSeconds=0,hourlyEuro=0,otherEuro=0,reservePercent=0,factor=1}) {
 const v={placedLengthCm,sheetWidthCm,motifAreaCm2,motifCount,presses,quantity,minLengthCm,lengthStepCm,sheetEuroM,supplierShipping,textileEuroPerItem,setupMinutes,pressSeconds,cutSeconds,hourlyEuro,otherEuro,reservePercent,factor};
 for(const [k,n] of Object.entries(v))if(!Number.isFinite(n)||n<0)throw Error('Invalid '+k);
 if(lengthStepCm<=0||sheetWidthCm<=0||quantity<1||!Number.isInteger(quantity)||!Number.isInteger(motifCount)||!Number.isInteger(presses)||presses>motifCount)throw Error('Invalid DTF quantities');
 const orderedCm=Math.ceil((Math.max(placedLengthCm,minLengthCm)-1e-9)/lengthStepCm)*lengthStepCm;
 const meters=orderedCm/100;
 const material=meters*sheetEuroM,textiles=quantity*textileEuroPerItem;
 const setup=setupMinutes/60*hourlyEuro,press=presses*pressSeconds/3600*hourlyEuro,cut=motifCount*cutSeconds/3600*hourlyEuro;
 const base=material+supplierShipping+textiles+setup+press+cut+otherEuro;
 const reserve=base*reservePercent/100;
 const selfCost=base+reserve;
 return {orderedCm,meters,material,textiles,setup,press,cut,reserve,selfCost,salePrice:selfCost*Math.max(1,factor),utilizationPercent:orderedCm?100*motifAreaCm2/(sheetWidthCm*orderedCm):0};
}
