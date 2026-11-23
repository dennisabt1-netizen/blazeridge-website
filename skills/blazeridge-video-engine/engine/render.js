const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [,,scene,out,fps,dur,only]=process.argv;const F=+fps,N=Math.round(F*dur);fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({args:['--allow-file-access-from-files']});const K=4;
const frames=only?only.split(',').map(s=>Math.round(parseFloat(s)*F)):[...Array(N).keys()];
await Promise.all([...Array(K).keys()].map(async k=>{const p=await b.newPage({viewport:{width:1080,height:1920}});
 p.on('pageerror',e=>console.log('ERR',e.message));await p.goto('file://'+scene);await p.evaluate(()=>window.ready);
 for(let i=k;i<frames.length;i+=K){const f=frames[i];await p.evaluate(t=>window.render(t),f/F);
  await p.screenshot({path:`${out}/f_${String(f).padStart(4,'0')}.jpg`,type:'jpeg',quality:92})}}));
await b.close();console.log('done',frames.length)})();
