/* Plugin API stand-in: the generated scripts run against it for real. */
function makeFigma(){
  let seq=100; const vars=[];
  const col={id:'c1',name:'Primitives',modes:[{modeId:'m1',name:'Value'},{modeId:'m2',name:'Dark'}]};
  const mk=(name,val,mode)=>{const v={id:'VariableID:'+(seq++),key:'k'+seq,name:name,resolvedType:'COLOR',
    variableCollectionId:col.id,valuesByMode:{},scopes:[],description:'',codeSyntax:{},
    setValueForMode(m,x){this.valuesByMode[m]=x;},setVariableCodeSyntax(a,b){this.codeSyntax[a]=b;},remove(){}};
    v.valuesByMode[mode||'m1']=val; vars.push(v); return v;};
  return { vars, col, mk, figma:{ root:{name:'Doc'}, editorType:'figma', variables:{
    getLocalVariableCollectionsAsync:async()=>[col],
    getLocalVariablesAsync:async()=>vars.slice(),
    getVariableByIdAsync:async id=>vars.filter(v=>v.id===id)[0]||null,
    getVariableCollectionByIdAsync:async id=>id===col.id?col:null,
    createVariable:(n)=>mk(n,{r:0,g:0,b:0},'m1'),
    createVariableCollection:(n)=>({id:'new',name:n,modes:[{modeId:'nm',name:'Value'}],remove(){}}) }}};
}
const run=(figma,code)=>new Function('figma','"use strict"; return (async()=>{'+code+'})();')(figma);
const {JSDOM,VirtualConsole}=require('jsdom');
const html=require('fs').readFileSync(require('path').join(__dirname,'..','skills','figma-colour-ramps','assets','figma-colour-ramps.html'),'utf8');
const vc=new VirtualConsole(); vc.on('jsdomError',e=>console.log('!! ',e.message.split('\n')[0]));
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/',virtualConsole:vc});
const w=dom.window,d=w.document;
w.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,width:200,height:40,right:200,bottom:40});
const click=s=>{const n=typeof s==='string'?d.querySelector(s):s;n&&n.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));};
const tile=t=>[...d.querySelectorAll('.tile')].find(b=>b.textContent.trim()===t);
let p=0,f=0; const ok=(l,c,e)=>{c?p++:f++;console.log((c?'  ok   ':'  FAIL ')+l+(e!==undefined?'  → '+e:''));};
setTimeout(async()=>{ try{
  click(tile('Starter set'));
  const st=w.eval('state'), STEPS=w.eval('STEPS');
  const env=makeFigma();
  const held={}; STEPS.forEach(s=>{held[s]=env.mk('colours/blue/'+s,{r:.1,g:.2,b:.9},'m1');});
  const stray=env.mk('colours/blue/base',{r:.5,g:.5,b:.5},'m1');
  const ids={}; STEPS.forEach(s=>ids[s]=held[s].id);
  const before=STEPS.map(s=>held[s].id);
  const pal=JSON.parse(JSON.stringify(st.palettes[3]));
  pal.id='i1'; pal.name='lavander'; pal.origin='figma-ramp';
  pal.source={kind:'figma',fileKey:'K',fileName:'Doc',collectionId:'c1',collectionName:'Primitives',
    modeId:'m1',modeName:'Value',group:'colours/blue',figmaName:'blue',variableIds:ids,variableKeys:{},importedAt:'x'};
  st.palettes.push(pal);
  const tones=w.figmaTones(pal);
  const res=await run(env.figma, w.figmaInPlaceScript(pal,tones));

  console.log('— перезапись на месте —');
  ok('ничего не создано', res.created===0, res.created+' created, '+res.updated+' updated');
  ok('все одиннадцать обновлены', res.updated===STEPS.length);
  ok('id не изменились', STEPS.every(s=>res.variableIds[s]===before[STEPS.indexOf(s)]));
  ok('дубликата не появилось', env.vars.filter(v=>/^colours\/blue\/\d/.test(v.name)).length===0
     && env.vars.filter(v=>/^colours\/lavander\//.test(v.name)).length===11);
  ok('всего переменных прежнее', env.vars.length===12, env.vars.length+' (11 + одна лишняя)');
  ok('переименовано 11', res.renamedCount===11 && res.path==='colours/lavander');
  ok('цвет в нужной моде', JSON.stringify(held[500].valuesByMode.m1)===JSON.stringify(tones.find(t=>t.step===500).rgb));
  ok('вторая мода не тронута', held[500].valuesByMode.m2===undefined);
  ok('лишняя осталась под старым именем', res.strays.join()==='colours/blue/base' && res.leftBehind.join()==='colours/blue/base');
  ok('и со своим цветом', JSON.stringify(stray.valuesByMode.m1)==='{"r":0.5,"g":0.5,"b":0.5}');

  console.log('— неполная группа дозаписывается —');
  const e2=makeFigma(); const some={};
  [50,100,200,300,400,500,600].forEach(s=>{some[s]=e2.mk('colours/half/'+s,{r:0,g:0,b:0},'m1');});
  const p2=JSON.parse(JSON.stringify(pal));
  p2.name='half'; p2.source.group='colours/half'; p2.source.figmaName='half';
  p2.source.variableIds={}; Object.keys(some).forEach(s=>p2.source.variableIds[s]=some[s].id);
  const r2=await run(e2.figma, w.figmaInPlaceScript(p2, w.figmaTones(p2)));
  ok('семь обновлено, четыре создано', r2.updated===7 && r2.created===4, r2.updated+'/'+r2.created);
  ok('полная рампа собралась', e2.vars.filter(v=>/^colours\/half\//.test(v.name)).length===11);

  console.log('— проверка чтением по id —');
  const exp=STEPS.map(s=>({id:res.variableIds[s],name:'colours/lavander/'+s,modeId:'m1',
    rgb:tones.find(t=>t.step===s).rgb}));
  const v=await run(env.figma, w.figmaVerifyIdsScript(exp));
  ok('всё сошлось', v.matched===11 && !v.missing.length && !v.wrong.length);
  held[300].valuesByMode.m1={r:0,g:0,b:0};
  const v2=await run(env.figma, w.figmaVerifyIdsScript(exp));
  ok('подмену ловит', v2.wrong.length===1 && /value drift/.test(v2.wrong[0]), v2.wrong[0]);
  console.log('\n'+p+' passed, '+f+' failed');
}catch(e){console.log('THROWN:',e.stack);} },600);
