import { upload } from '@vercel/blob/client';
import { readFile } from 'node:fs/promises';
const BASE='https://markpress-zeta.vercel.app';
const buf=await readFile(process.argv[2]); const name=process.argv[3];
const blob=await upload(name,new File([buf],name,{type:'text/markdown'}),{access:'public',handleUploadUrl:`${BASE}/api/upload`});
const res=await fetch(`${BASE}/api/convert`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({blobUrl:blob.url,filename:name,size:buf.length})});
const txt=await res.text();
try{const j=JSON.parse(txt);console.log('status:',j.status,'\nerrorMessage:',j.errorMessage);}catch{console.log('non-JSON:',txt.slice(0,150));}
