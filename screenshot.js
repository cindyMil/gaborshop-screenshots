const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function takeScreenshots() {
  console.log('🚀 Démarrage de la capture d\'écran...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  const outputDir = path.join(__dirname, 'screenshots', date);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Screenshot Desktop
    console.log('📸 Capture desktop...');
    const pageDesktop = await browser.newPage();
    await pageDesktop.setViewport({ width: 1920, height: 1080 });
    await pageDesktop.goto('https://gaborshop.fr', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    await pageDesktop.waitForTimeout(2000);
    await pageDesktop.screenshot({ 
      path: path.join(outputDir, `desktop-${date}-${time}.png`),
      fullPage: true 
    });
    console.log(`✅ Desktop OK: ${date}-${time}`);
    await pageDesktop.close();

    // Screenshot Mobile
    console.log('📱 Capture mobile...');
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({ width: 375, height: 812 });
    await pageMobile.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15');
    await pageMobile.goto('https://gaborshop.fr', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    await pageMobile.waitForTimeout(2000);
    await pageMobile.screenshot({ 
      path: path.join(outputDir, `mobile-${date}-${time}.png`),
      fullPage: true 
    });
    console.log(`✅ Mobile OK: ${date}-${time}`);
    await pageMobile.close();

    console.log('🎉 Captures terminées avec succès !');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

takeScreenshots();
