const fs = require('fs');
const path = 'c:/Users/USER/Documents/PDFtoolsmd/components/tools';
const files = fs.readdirSync(path).filter(f => f.endsWith('.tsx'));
files.forEach(f => {
  const file = path + '/' + f;
  let content = fs.readFileSync(file, 'utf8');
  if (f === 'CompressPdf.tsx') {
    content = content.replace(/new Blob\(\[\s+as BlobPart\],/g, 'new Blob([result.bytes as BlobPart],');
  } else if (f === 'PdfToJpg.tsx') {
    content = content.replace(/new Blob\(\[\s+as BlobPart\],/g, 'new Blob([img.bytes as BlobPart],');
  } else {
    content = content.replace(/new Blob\(\[\s+as BlobPart\],/g, 'new Blob([pdfBytes as BlobPart],');
  }
  fs.writeFileSync(file, content);
});
console.log('Fixed BlobParts');
