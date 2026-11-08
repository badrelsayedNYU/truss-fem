const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const core = html.split('/*CORE-START*/')[1].split('/*CORE-END*/')[0];
const presets = html.split('/* ---------- presets')[1].split('const clone=')[0];
const {analyze, gaussSolve, PRESETS} = vm.runInNewContext(core + '\n/* ---------- presets' + presets + '\n({analyze,gaussSolve,PRESETS});');
const near = (x,y,tol=1e-10) => assert.ok(Math.abs(x-y)<=tol*Math.max(1,Math.abs(y)),`${x} != ${y}`);
const si = m => ({dim:m.dim,nodes:m.nodes.map(n=>({...n,F:n.F.map(f=>f*1e3)})),elems:m.elems.map(e=>({...e,i:e.i-1,j:e.j-1,E:e.E*1e9}))});
function orthogonalModel(stiffness) {
  return {dim:2,nodes:[{x:1,y:1,fix:[0,0],F:[1,1]},{x:0,y:1,fix:[1,1],F:[0,0]},{x:1,y:0,fix:[1,1],F:[0,0]}],
    elems:[{i:1,j:0,E:stiffness,A:1},{i:2,j:0,E:1,A:1}]};
}
for(const stiffness of [1e-12,1,1e10,1e12]) test(`independent members retain weak-direction stiffness at ratio ${stiffness}`,()=>{
  const r=analyze(orthogonalModel(stiffness));
  near(r.d[0]*stiffness,1);near(r.d[1],1);
});
test('scaled partial pivoting swaps rows and preserves the physical solution',()=>{
  const r=gaussSolve([[1e-8,1],[1,1]],[3.00000002,5]);
  near(r.x[0],2);near(r.x[1],3);assert.ok(r.steps[0].swap);
});
test('all built-in models satisfy free equilibrium and overall force balance',()=>{
  for(const input of PRESETS){
    const m=si(input),r=analyze(m);
    r.Kr.forEach((row,i)=>near(row.reduce((s,v,j)=>s+v*r.sol.x[j],0),r.Fr[i],1e-7));
    for(let q=0;q<m.dim;q++)near(r.F.reduce((s,v,i)=>i%m.dim===q?s+v:s,0)+r.reactions.reduce((s,x)=>x.g%m.dim===q?s+x.R:s,0),0,1e-7);
  }
});
test('Logan space truss retains the reference movements',()=>{
  const r=analyze(si(PRESETS[0]));
  near(r.d[0],1.384e-3,1e-6);near(r.d[1],-5.157e-5,1e-8);near(r.d[2],6.015e-5,1e-8);
});
test('plane triangle reactions match hand statics',()=>{
  const r=analyze(si(PRESETS[1]));const reactions=Object.fromEntries(r.reactions.map(x=>[x.g,x.R]));
  near(reactions[0],-10000);near(reactions[1],2500);near(reactions[3],17500);
});
test('a genuine mechanism and a zero-stiffness free row remain rejected',()=>{
  const m=orthogonalModel(1);m.nodes[1].fix=[0,0];m.nodes[2].fix=[0,0];assert.throws(()=>analyze(m),/singular/);
  assert.throws(()=>gaussSolve([[1,0],[0,0]],[1,1]),/singular/);
});
test('nonfinite input cannot produce a successful solution',()=>{
  assert.throws(()=>gaussSolve([[Infinity]],[1]),/finite/);
  assert.throws(()=>gaussSolve([[1]],[NaN]),/finite/);
});
