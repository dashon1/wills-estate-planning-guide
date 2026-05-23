const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function renderHtmlToPdf(inputPath, outputPath, format = 'A4') {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Convert to absolute path if needed
  const absoluteInputPath = path.resolve(inputPath);
  const absoluteOutputPath = path.resolve(outputPath);

  const pageFormats = {
    'A4': { width: '210mm', height: '297mm' },
    'Letter': { width: '8.5in', height: '11in' }
  };

  const dimensions = pageFormats[format] || pageFormats['A4'];
  await page.setViewportSize({
    width: Math.round(parseFloat(dimensions.width) * 96),
    height: Math.round(parseFloat(dimensions.height) * 96)
  });

  // Use absolute path with file:// protocol
  await page.goto(`file://${absoluteInputPath}`, { waitUntil: 'load', timeout: 30000 });

  // Wait for fonts and content to load
  await page.waitForTimeout(2000);

  const pdf = await page.pdf({
    format: format,
    printBackground: true,
    margin: { top: '14mm', right: '12mm', bottom: '14mm', left: '12mm' }
  });

  const fs = require('fs');
  fs.writeFileSync(outputPath, pdf);

  await browser.close();
  console.log(`Converted: ${inputPath} -> ${outputPath}`);
}

const inputFile = process.argv[2];
const outputFile = process.argv[3];
const format = process.argv[4] || 'A4';

if (inputFile && outputFile) {
  renderHtmlToPdf(inputFile, outputFile, format).catch(console.error);
} else {
  console.error('Usage: node render.cjs <input.html> <output.pdf> [format]');
}