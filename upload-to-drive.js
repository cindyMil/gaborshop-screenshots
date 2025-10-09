const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

async function uploadToDrive() {
  console.log('📤 Début de l\'upload vers Google Drive...');
  
  // Charger les credentials depuis la variable d'environnement
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  const folderId = process.env.DRIVE_FOLDER_ID;
  
  // Authentification
  const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  
  const drive = google.drive({ version: 'v3', auth });
  
  // Trouver tous les screenshots
  const screenshotsDir = path.join(__dirname, 'screenshots');
  const dates = fs.readdirSync(screenshotsDir);
  
  for (const date of dates) {
    const dateFolder = path.join(screenshotsDir, date);
    const files = fs.readdirSync(dateFolder);
    
    console.log(`📁 Upload des screenshots du ${date}...`);
    
    for (const file of files) {
      const filePath = path.join(dateFolder, file);
      
      try {
        const fileMetadata = {
          name: file,
          parents: [folderId]
        };
        
        const media = {
          mimeType: 'image/png',
          body: fs.createReadStream(filePath)
        };
        
        const response = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id, name, webViewLink'
        });
        
        console.log(`✅ ${file} uploadé - ID: ${response.data.id}`);
      } catch (error) {
        console.error(`❌ Erreur upload ${file}:`, error.message);
      }
    }
  }
  
  console.log('🎉 Upload terminé !');
}

uploadToDrive().catch(console.error);
