const {JSDOM,VirtualConsole}=require('jsdom');
const html=require('fs').readFileSync(require('path').join(__dirname,'..','skills','figma-colour-ramps','assets','figma-colour-ramps.html'),'utf8');
const vc=new VirtualConsole(); vc.on('jsdomError',e=>console.log('!! ',e.message.split('\n')[0]));
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/',virtualConsole:vc});
const w=dom.window,d=w.document;
w.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,width:200,height:40,right:200,bottom:40});
const click=s=>{const n=typeof s==='string'?d.querySelector(s):s;n&&n.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));};
const tile=t=>[...d.querySelectorAll('.tile')].find(b=>b.textContent.trim()===t);
const fire=(n,t)=>n.dispatchEvent(new w.Event(t,{bubbles:true}));
let p=0,f=0; const ok=(l,c,e)=>{c?p++:f++;console.log((c?'  ok   ':'  FAIL ')+l+(e!==undefined?'  → '+e:''));};
const STEPS=[50,100,200,300,400,500,600,700,800,900,950];
setTimeout(()=>{ try{
  console.log('— запуск —');
  ok('стол пуст', d.querySelectorAll('.pal-item').length===0);
  ok('четыре входа', [...d.querySelectorAll('.tile')].map(x=>x.textContent.trim()).join(', '),
     [...d.querySelectorAll('.tile')].map(x=>x.textContent.trim()).join(', '));
  click(tile('Starter set'));
  ok('стартовый набор', d.querySelectorAll('.pal-item').length===5);
  const st=w.eval('state');
  ok('11 тонов у каждой', w.resolveRamp(st.palettes[0]).length===11);
  ok('ключевой цвет воспроизводится точно',
     w.resolveRamp(st.palettes[0]).find(t=>t.step===st.palettes[0].keys[0].step).hex.toUpperCase()===st.palettes[0].keys[0].hex.toUpperCase());

  console.log('— agent brief убран —');
  click('#btnExport');
  const F=w.eval('fig()');
  F.url='https://www.figma.com/design/lvCXiXXqUt9o4UP0HHLseW/Doc';
  w.renderFigmaPanel();
  const labels=[...d.querySelectorAll('.ex-panel button')].map(b=>b.textContent.trim());
  ok('кнопки нет в панели записи', !labels.some(x=>/agent/i.test(x)), labels.join(' · '));
  ok('в коде функций не осталось', !/agentBrief|agentScanRequest|agentPlan/.test(html));
  ok('и в предупреждении о ней не сказано', !/agent brief/i.test(d.querySelector('.ex-panel').textContent));
  w.eval('imOpen()'); const IM=w.eval('im'); IM.source='paste'; w.eval('imRender()');
  ok('и в импорте кнопки нет', ![...d.querySelectorAll('button')].some(b=>/request for the agent/i.test(b.textContent)));
  ok('справка про обходной путь молчит', !/Working without the bridge/.test(w.eval('HELP_HTML')));
  w.eval('imClose && imClose()');

  console.log('— перезапись по id —');
  const ids={}; STEPS.forEach((x,i)=>ids[x]='VariableID:9:'+i);
  const imp=JSON.parse(JSON.stringify(st.palettes[3]));
  imp.id='i1'; imp.name='Ocean'; imp.origin='figma-ramp';
  imp.source={kind:'figma',fileKey:'K',fileName:'Doc',collectionId:'c1',collectionName:'Primitives',
    modeId:'m1',modeName:'Value',group:'colours/blue',figmaName:'blue',variableIds:ids,variableKeys:{},importedAt:'x'};
  st.palettes.push(imp);
  ok('переименование замечено', w.figmaRenamed(imp)===true);
  ok('полный путь собран', w.figmaFullName(imp)==='colours/blue');
  const F2=w.eval('fig()'); F2.key='K'; F2.status='ok'; F2.file={name:'Doc'};
  F2.collections=[{id:'c1',name:'Primitives',modes:[{id:'m1',name:'Value'}],total:11,colours:11,
    names:STEPS.map(s2=>'colours/blue/'+s2)}];
  F2.collectionId='c1'; F2.group='colours'; F2.modeId='m1';
  ok('перезапись доступна', w.figmaOverwriteBlock(imp)==='');
  F2.overwrite={i1:true};
  w.renderFigmaPanel();
  const t=w.eval('figmaTargets()').find(x=>x.pal.id==='i1');
  ok('тег на месте', t.tag==='Renamed in place', t.tag);
  const code=w.figmaInPlaceScript(imp, w.figmaTones(imp));
  ok('скрипт адресует по id', /const IDS = \{/.test(code) && /VariableID:9:0/.test(code));
  ok('и целится в исходную коллекцию', /const COLLECTION_ID = "c1"/.test(code));
  ok('и переименовывает путь', /const PATH = "colours\/Ocean"/.test(code), (code.match(/const PATH = "[^"]*"/)||[])[0]);

  console.log('— предупреждения перед записью —');
  const W=w.figmaWarnings();
  const mine=W.find(x=>x.target.pal.id==='i1');
  ok('перезапись и переименование названы', mine.notes.map(n=>n.kind).join(','), mine.notes.map(n=>n.kind).join(','));
  click('#btnFigWrite');
  ok('попап открылся вместо записи', !!d.querySelector('.warn-item') && w.eval('fig().write')===null);
  const item=[...d.querySelectorAll('.warn-item')].find(x=>x.querySelector('.warn-nm b').textContent==='Ocean');
  const cb=item.querySelector('input'); cb.checked=false; fire(cb,'change');
  ok('галочка снимается на месте', item.classList.contains('off'));
  click([...d.querySelectorAll('.modal button')].find(b=>b.textContent==='Cancel'));

  console.log('— снимок работы —');
  const snap=w.snapStamp(w.snapBuild('T'));
  ok('контрольная сумма', /^[0-9a-f]{16}$/.test(snap.checksum));
  ok('чистый файл проверяется', w.snapValidate(snap).integrity==='ok');
  const bad=JSON.parse(JSON.stringify(snap)); bad.palettes[0].name='X';
  ok('правка ловится', w.snapValidate(bad).integrity==='mismatch');

  console.log('— справка и подвал —');
  click('#btnHelp');
  const heads=[...d.querySelectorAll('.help-doc h2[id],.help-doc h3[id]')];
  const links=[...d.querySelectorAll('.help-nav a')];
  ok('оглавление совпадает с документом', links.length===heads.length, links.length+' пунктов');
  ok('все якоря живые', links.every(a=>d.querySelector('.help-doc '+a.getAttribute('href'))!==null));
  click([...d.querySelectorAll('.help-box button')].find(b=>b.textContent==='Close'));
  ok('подвал: Help, почта, кофе',
     [...d.querySelector('.col-foot').children].map(n=>n.className.split(' ')[0]).join(' → ')==='help-link → bug-note → coffee');
  console.log('\n'+p+' passed, '+f+' failed');
}catch(e){console.log('THROWN:',e.stack);} },600);
