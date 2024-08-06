// setup.js

const fs = require('fs');
const path = require('path');

// Example setup tasks
function checkAndCreateEnv() {
  const envPath = path.resolve(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, 'PORT=10001\nHOST=0.0.0.0\n');
    console.log('.env file created');
  }
}

checkAndCreateEnv();
