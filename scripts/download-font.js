const https = require('https');
const fs = require('fs');
const path = require('path');

const FONT_URL = 'https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Regular.ttf';
const OUTPUT_DIR = path.join(__dirname, '..', 'lib', 'fonts');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'RobotoFont.ts');

console.log('📥 Downloading Roboto-Regular.ttf...');
console.log(`URL: ${FONT_URL}`);

https.get(FONT_URL, (response) => {
  if (response.statusCode === 302 || response.statusCode === 301) {
    // Follow redirect
    https.get(response.headers.location, (redirectResponse) => {
      processResponse(redirectResponse);
    }).on('error', handleError);
  } else {
    processResponse(response);
  }
}).on('error', handleError);

function processResponse(response) {
  if (response.statusCode !== 200) {
    console.error(`❌ Failed to download font. Status: ${response.statusCode}`);
    process.exit(1);
  }

  const chunks = [];
  
  response.on('data', (chunk) => {
    chunks.push(chunk);
  });

  response.on('end', () => {
    console.log('✅ Font downloaded successfully');
    
    const buffer = Buffer.concat(chunks);
    const base64String = buffer.toString('base64');
    
    console.log(`📊 Font size: ${(buffer.length / 1024).toFixed(2)} KB`);
    console.log(`📊 Base64 length: ${base64String.length} characters`);
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      console.log(`📁 Created directory: ${OUTPUT_DIR}`);
    }
    
    // Create the TypeScript file content
    const fileContent = `/**
 * Roboto Regular Font - Base64 encoded
 * Downloaded from Google Fonts
 * This font supports Czech characters (ě, š, č, ř, ž, ý, á, í, é)
 * 
 * Usage in jsPDF:
 * doc.addFileToVFS('Roboto-Regular.ttf', ROBOTO_BASE64);
 * doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
 * doc.setFont('Roboto');
 */

export const ROBOTO_BASE64 = "${base64String}";
`;
    
    // Write the file
    fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf8');
    console.log(`✅ Font saved to: ${OUTPUT_FILE}`);
    console.log('🎉 Font conversion completed successfully!');
    console.log('');
    console.log('You can now use this font in your PDF generator:');
    console.log('  import { ROBOTO_BASE64 } from "@/lib/fonts/RobotoFont"');
  });
}

function handleError(error) {
  console.error('❌ Error downloading font:', error.message);
  process.exit(1);
}


