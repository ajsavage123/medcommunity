import { chromium } from 'playwright';

async function run() {
  console.log('--- STARTING PLAYWRIGHT TEST ---');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Navigating to http://localhost:8080/ ...');
  try {
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
    console.log('✅ Page Loaded Successfully!');
    
    // Take a screenshot
    await page.screenshot({ path: 'C:/Users/YASHODA002/.gemini/antigravity/scratch/codebluer/preview.png' });
    console.log('✅ Screenshot saved to preview.png');
    
    const title = await page.title();
    console.log(`Page Title: ${title}`);
    
  } catch (err) {
    console.error('❌ Failed to load page:', err.message);
  } finally {
    await browser.close();
    console.log('--- TEST COMPLETE ---');
  }
}

run();
