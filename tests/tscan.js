/* A Figma stand-in plus a bridge that truncates at 20 KB, exactly like the real one. */
function makeEnv(nCollections, perCollection){
  let seq = 1;
  const cols = [], vars = [];
  for (let c=0;c<nCollections;c++){
    const col = { id:'VariableCollectionId:'+c, name:'Collection '+c,
      modes:[{modeId:'m'+c+':0',name:'Value'},{modeId:'m'+c+':1',name:'Dark'}] };
    cols.push(col);
    const names=['blue','red','grey','lavander','Lime','Magenta','Teal','Cyan'];
    for (let g=0; g<perCollection/11; g++){
      [50,100,200,300,400,500,600,700,800,900,950].forEach((st,i)=>{
        vars.push({ id:'VariableID:'+(seq++), key:'k'+'0123456789abcdef0123456789abcdef'+seq,
          name:'colours/'+names[g%names.length]+g+'/'+st, resolvedType:'COLOR',
          variableCollectionId:col.id,
          valuesByMode:{ ['m'+c+':0']:{r:i/10,g:.4,b:.9,a:1}, ['m'+c+':1']:{r:.1,g:.1,b:.3,a:1} } });
      });
    }
  }
  const figma = { root:{name:'Big system'}, editorType:'figma',
    variables:{
      getLocalVariableCollectionsAsync: async()=>cols,
      getLocalVariablesAsync: async()=>vars.slice(),
    }};
  return { figma, cols, vars };
}
const CAP = 20*1024;
let truncatedCalls = 0, calls = 0;
async function bridge(env, code){
  calls++;
  const fn = new Function('figma','"use strict"; return (async()=>{'+code+'})();');
  const out = await fn(env.figma);
  let txt = JSON.stringify(out);
  if (txt.length > CAP){ truncatedCalls++; txt = txt.slice(0, CAP) + '// truncated to 20kb'; }
  return { content:[{text:txt}] };
}

const {JSDOM,VirtualConsole}=require('jsdom');
const html=require('fs').readFileSync(require('path').join(__dirname,'..','skills','figma-colour-ramps','assets','figma-colour-ramps.html'),'utf8');
const vc=new VirtualConsole(); vc.on('jsdomError',e=>console.log('!! ',e.message.split('\n')[0]));
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/',virtualConsole:vc});
const w=dom.window,d=w.document;
w.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,width:200,height:40,right:200,bottom:40});
let p=0,f=0; const ok=(l,c,e)=>{c?p++:f++;console.log((c?'  ok   ':'  FAIL ')+l+(e!==undefined?'  → '+e:''));};
const wait=ms=>new Promise(r=>setTimeout(r,ms));

setTimeout(async ()=>{ try{
  console.log('— старый способ действительно ломался —');
  const env = makeEnv(2, 88);       // 176 переменных, две коллекции
  const meta = w.eval('IM_SCAN_META');
  const oneShot = meta.replace(/return \{ fileName[\s\S]*$/,
    "return { fileName: figma.root.name, collections: cols.map(function(c){ var mine = all.filter(function(v){ return v.variableCollectionId === c.id; }); return { id:c.id, name:c.name, variables: mine.map(function(v){ var vals={}; c.modes.forEach(function(m){ vals[m.modeId] = resolve(v.valuesByMode[m.modeId], m.modeId, 0); }); return { id:v.id, key:v.key, name:v.name, values:vals }; }) }; }) };");
  const before = truncatedCalls;
  const r1 = await bridge(env, oneShot);
  ok('одним куском не помещается', truncatedCalls===before+1, (r1.content[0].text.length/1024).toFixed(1)+' КБ, обрезано');
  let broke=false; try { JSON.parse(r1.content[0].text); } catch(e){ broke=true; }
  ok('и перестаёт быть JSON', broke);

  console.log('— страницы помещаются —');
  truncatedCalls=0; calls=0;
  const m = JSON.parse((await bridge(env, meta)).content[0].text);
  ok('мета проходит целиком', truncatedCalls===0, JSON.stringify(m.collections.map(c=>c.name+':'+c.count)));
  ok('мета маленькая', JSON.stringify(m).length < 2048, (JSON.stringify(m).length/1024).toFixed(2)+' КБ');
  const PAGE = w.eval('IM_PAGE');
  let biggest = 0;
  for (const c of m.collections){
    for (let off=0; off<c.count; off+=PAGE){
      const t = (await bridge(env, w.imScanPageScript(c.id, off, PAGE))).content[0].text;
      biggest = Math.max(biggest, t.length);
      JSON.parse(t);
    }
  }
  ok('ни одна страница не обрезана', truncatedCalls===0, 'самая большая '+(biggest/1024).toFixed(1)+' КБ при пороге 20');
  ok('запас больше двух раз', biggest*2 < CAP);

  console.log('— страницы собираются в то же дерево —');
  const page = JSON.parse((await bridge(env, w.imScanPageScript(m.collections[0].id, 0, PAGE))).content[0].text);
  ok('страница знает общий счёт', page.total===88, page.total+'');
  ok('и свои моды', page.modeIds.length===2);
  const vars = w.imRowsToVariables(page.rows, page.modeIds);
  ok('строка разворачивается в переменную', vars[0].id==='VariableID:1' && /^colours\//.test(vars[0].name), vars[0].name);
  ok('значение по моде на месте', /^#[0-9A-F]{6}$/.test(vars[0].values[page.modeIds[0]].hex), vars[0].values[page.modeIds[0]].hex);
  ok('альфа подставлена', vars[0].values[page.modeIds[0]].alpha===1);
  ok('вторая мода тоже', !!vars[0].values[page.modeIds[1]]);

  console.log('— компактность —');
  const rowsBytes = JSON.stringify(page.rows).length;
  const objBytes  = JSON.stringify(vars).length;
  ok('массивы экономят место', rowsBytes < objBytes*0.75,
     (rowsBytes/1024).toFixed(1)+' КБ против '+(objBytes/1024).toFixed(1)+' КБ — '+Math.round(100-100*rowsBytes/objBytes)+'% меньше');

  console.log('— обрезанный ответ теперь читается как обрезанный —');
  w.cowork = { callMcpTool: async()=>({ content:[{ text:'{"fileName":"x","collec// truncated to 20kb' }] }) };
  w.eval('FIGMA_TOOL = "mcp__x__use_figma"');
  let code=null, msg=null;
  try { await w.figmaRun('KEY', 'return 1', 'x'); } catch(e){ code=e.code; msg=e.message; }
  ok('код TRUNCATED', code==='TRUNCATED', code+': '+msg);
  ok('и сырой JSON в лицо не летит', !/collec/.test(msg||''), msg);

  console.log('— полный проход сканирования —');
  const env2 = makeEnv(1, 99);
  w.cowork = { callMcpTool: async(t,a)=>bridge(env2, a.code) };
  const IM = (w.eval('imOpen()'), w.eval('im'));
  IM.url = 'https://www.figma.com/design/lvCXiXXqUt9o4UP0HHLseW/Doc';
  truncatedCalls=0; calls=0;
  await w.imScan();
  ok('прошло без ошибок', w.eval('im.status')==='ok', w.eval('im.status')+' '+(w.eval('im.error')||''));
  ok('ничего не обрезалось', truncatedCalls===0, calls+' вызовов');
  const scan = w.eval('im.scan');
  ok('все переменные на месте', scan.collections[0].variables.length===99, scan.collections[0].variables.length+' из 99');
  ok('ключ файла записан', scan.fileKey==='lvCXiXXqUt9o4UP0HHLseW');
  ok('дерево построено', w.eval('im.tree').length===1);
  w.eval("im.tree.forEach(function(r){ imWalk(r,function(n){ if(n.kind==='var') im.sel[n.id]=true; }); })");
  const picks = w.eval('imPicks()');
  ok('рампы распознаны', picks.ramps.length===9, picks.ramps.length+' рамп по 11 тонов');
  w.eval('imDoImport()');
  const st = w.eval('state');
  const made = st.palettes[st.palettes.length-1];
  ok('импорт донёс id', Object.keys(made.source.variableIds).length===11, made.source.variableIds[500]);
  console.log('\n'+p+' passed, '+f+' failed');
}catch(e){console.log('THROWN:',e.stack);} },600);
