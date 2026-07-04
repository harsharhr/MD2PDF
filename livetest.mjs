import { upload } from '@vercel/blob/client';
import { readFile } from 'node:fs/promises';

const BASE = 'https://markpress-zeta.vercel.app';
const path = process.argv[2];
const name = process.argv[3] || 'big.md';

const buf = await readFile(path);
const file = new File([buf], name, { type: 'text/markdown' });
console.log(`uploading ${name} (${buf.length} bytes) via client SDK...`);
const t0 = Date.now();
const blob = await upload(name, file, {
  access: 'public',
  handleUploadUrl: `${BASE}/api/upload`,
});
console.log(`  uploaded to blob in ${((Date.now()-t0)/1000).toFixed(1)}s`);
console.log('  blob url host:', new URL(blob.url).host);

console.log('converting...');
const t1 = Date.now();
const res = await fetch(`${BASE}/api/convert`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ blobUrl: blob.url, filename: name, size: buf.length }),
});
const data = await res.json();
console.log(`  convert HTTP ${res.status} in ${((Date.now()-t1)/1000).toFixed(1)}s`);
console.log('  status:', data.status, '| outputBytes:', data.outputSizeBytes, '| err:', data.errorMessage);
if (data.downloadUrl) {
  const d = await fetch(`${BASE}${data.downloadUrl}`, { redirect: 'manual' });
  console.log('  download HTTP', d.status, '-> Location host:', d.headers.get('location') ? new URL(d.headers.get('location')).host : '(none)');
}
