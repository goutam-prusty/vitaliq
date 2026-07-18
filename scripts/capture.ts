import puppeteer from 'puppeteer';

async function main() {
  console.log("Launching headless browser...");
  const browser = await puppeteer.launch({ 
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });
  const page = await browser.newPage();
  
  // Console logging and error tracking
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', (err: any) => console.error('PAGE ERROR:', err.message));
  
  // High-res desktop viewport
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
  
  console.log("Navigating directly to http://localhost:3000/dashboard...");
  await page.goto('http://localhost:3000/dashboard', {
    waitUntil: 'networkidle0',
    timeout: 30000
  });
  
  console.log("Waiting 8 seconds for dashboard calculations, charts, and animations to load...");
  await new Promise(resolve => setTimeout(resolve, 8000));
  
  console.log("Current page URL:", page.url());
  try {
    const html = await page.content();
    console.log("Page HTML content snippet:", html.substring(0, 1000));
  } catch (err: any) {
    console.error("Failed to read page content:", err.message);
  }

  console.log("Taking screenshot to public/dashboard-preview.png...");
  await page.screenshot({ 
    path: 'public/dashboard-preview.png',
    type: 'png'
  });
  
  await browser.close();
  console.log("Screenshot successfully captured!");
}

main().catch((err) => {
  console.error("Failed to capture screenshot:", err);
  process.exit(1);
});
