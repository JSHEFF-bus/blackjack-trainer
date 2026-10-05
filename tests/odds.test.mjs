import * as O from '../lib/odds.js';
let pass=0, fail=0;
const near=(a,b,t=1e-4)=>Math.abs(a-b)<=t;
function eq(name,got,want,t=1e-4){ const ok=(Number.isNaN(want)?Number.isNaN(got):near(got,want,t)); ok?pass++:fail++; if(!ok) console.log(`  FAIL ${name}: got ${got} want ${want}`); }
eq('-110 -> dec',O.americanToDecimal(-110),1.909091);
eq('+150 -> dec',O.americanToDecimal(150),2.5);
eq('-200 -> dec',O.americanToDecimal(-200),1.5);
eq('+100 -> dec',O.americanToDecimal(100),2);
eq('+50 invalid',O.americanToDecimal(50),NaN);
eq('2.5 -> am',O.decimalToAmerican(2.5),150);
eq('1.5 -> am',O.decimalToAmerican(1.5),-200);
eq('1.0 invalid',O.decimalToAmerican(1),NaN);
let f=O.decimalToFraction(2.5); eq('2.5 frac num',f.num,3); eq('2.5 frac den',f.den,2);
f=O.decimalToFraction(O.americanToDecimal(-110)); eq('-110 frac num',f.num,10); eq('-110 frac den',f.den,11);
eq('parse +150',O.parseOdds('+150'),2.5); eq('parse 3/2',O.parseOdds('3/2','fractional'),2.5);
eq('parse dec',O.parseOdds('2.25','decimal'),2.25); eq('parse junk',O.parseOdds('abc'),NaN);
// devig: symmetric market is 0.5; every method sums to 1
const q=(...a)=>a.map(x=>1/O.americanToDecimal(x));
for (const m of Object.keys(O.DEVIG)) { const p=O.DEVIG[m](q(-110,-110)); eq(`${m} symmetric`,p[0],0.5); eq(`${m} sums`,p[0]+p[1],1,1e-9); }
// reference values produced by RUNNING features/devig.py (not typed from memory)
const PY={'-140/120':[0.5620437956,0.5643939394], '-400/310':[0.7663551402,0.7780487805],
          '-900/600':[0.8630136986,0.8785714286], '150/-190':[0.3790849673,0.3724137931]};
for (const [k,[mult,shin]] of Object.entries(PY)) {
  const [a,b]=k.split('/').map(Number);
  eq(`mult ${k}`,O.devigMultiplicative(q(a,b))[0],mult,1e-8);
  eq(`shin ${k}`,O.devigShin(q(a,b))[0],shin,1e-8);
}
// shin and power both take MORE off the longshot than multiplicative
const L=q(-900,600);
const ok1=O.devigShin(L)[1]<O.devigMultiplicative(L)[1] && O.devigPower(L)[1]<O.devigMultiplicative(L)[1];
ok1?pass++:(fail++,console.log('  FAIL longshot ordering'));
eq('EV 55% at evens',O.expectedValue(0.55,2),0.10);
eq('kelly 55% at evens',O.kellyFraction(0.55,2),0.10);
eq('parlay -110 x2',O.parlayDecimal([O.americanToDecimal(-110),O.americanToDecimal(-110)]),3.644628);
const h=O.equalHedge(100,3.0,2.0); eq('hedge stake',h.hedge,150); eq('hedge equal',h.ifOriginal,h.ifHedge);
const arb=O.twoWayArb(100,2.1,2.1); eq('arb implied',arb.implied,0.952381); eq('arb return',arb.returnPct,0.05); eq('arb stake',arb.stakeA,50);
const no=O.twoWayArb(100,1.909091,1.909091); (no.isArb===false)?pass++:(fail++,console.log('  FAIL -110/-110 is not an arb'));
const d=O.hitDistribution([0.5,0.5]); eq('dist0',d[0],0.25); eq('dist1',d[1],0.5); eq('dist2',d[2],0.25);
eq('pickem 2-pick 3x at 50%',O.pickemValue([0.5,0.5],{2:3}).ev,-0.25);
eq('breakeven 2-pick 3x = 57.74%',O.pickemBreakevenLeg(2,{2:3}),Math.sqrt(1/3),1e-6);
eq('breakeven 6-pick power 26x',O.pickemBreakevenLeg(6,{6:26}),Math.pow(1/26,1/6),1e-6);
console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
