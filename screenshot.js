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
    await pageDesktop.goto('https://www.gabor-shop.fr', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    // Attendre que la page soit chargée
    await pageDesktop.waitForTimeout(3000);
    
    // Fermer la pop-up de cookies
    console.log('🍪 Fermeture de la pop-up cookies...');
    try {
      // Essayer de cliquer sur le bouton "Tout accepter" ou similaire
      await pageDesktop.waitForSelector('button[id*="accept"], button[class*="accept"], button:has-text("Accepter")', { timeout: 5000 });
      await pageDesktop.click('button[id*="accept"], button[class*="accept"]');
      console.log('✅ Pop-up fermée');
      await pageDesktop.waitForTimeout(1000);
    } catch (e) {
      console.log('⚠️ Pop-up non trouvée ou déjà fermée');
      // Méthode alternative : supprimer tous les overlays
      await pageDesktop.evaluate(() => {
        // Supprimer tous les éléments avec position fixed/absolute qui pourraient être des pop-ups
        const elements = document.querySelectorAll('[class*="cookie"], [id*="cookie"], [class*="consent"], [id*="consent"], [class*="modal"], [class*="overlay"], [class*="popup"]');
        elements.forEach(el => {
          if (window.getComputedStyle(el).position === 'fixed' || 
              window.getComputedStyle(el).position === 'absolute') {
            el.remove();
          }
        });
        // Supprimer le fond noir (backdrop)
        const backdrops = document.querySelectorAll('[class*="backdrop"], [class*="overlay"]');
        backdrops.forEach(el => el.remove());
        // Réactiver le scroll si bloqué
        document.body.style.overflow = 'auto';
      });
      console.log('✅ Overlays supprimés via JavaScript');
    }
    
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
    await pageMobile.goto('https://www.gabor-shop.fr', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    await pageMobile.waitForTimeout(3000);
    
    // Fermer la pop-up de cookies (mobile)
    console.log('🍪 Fermeture de la pop-up cookies (mobile)...');
    try {
      await pageMobile.waitForSelector('button[id*="accept"], button[class*="accept"]', { timeout: 5000 });
      await pageMobile.click('button[id*="accept"], button[class*="accept"]');
      console.log('✅ Pop-up fermée');
      await pageMobile.waitForTimeout(1000);
    } catch (e) {
      console.log('⚠️ Pop-up non trouvée ou déjà fermée');
      await pageMobile.evaluate(() => {
        const elements = document.querySelectorAll('[class*="cookie"], [id*="cookie"], [class*="consent"], [id*="consent"], [class*="modal"], [class*="overlay"], [class*="popup"]');
        elements.forEach(el => {
          if (window.getComputedStyle(el).position === 'fixed' || 
              window.getComputedStyle(el).position === 'absolute') {
            el.remove();
          }
        });
        const backdrops = document.querySelectorAll('[class*="backdrop"], [class*="overlay"]');
        backdrops.forEach(el => el.remove());
        document.body.style.overflow = 'auto';
      });
      console.log('✅ Overlays supprimés via JavaScript');
    }
    
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
