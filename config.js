// Configuration loader using environment variables only
// Use .env file for local development

const fs = require('fs');
const path = require('path');

// Load .env file if it exists (for local development)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
}

// Validate required environment variables
const required = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AVATAX_USERNAME',
    'AVATAX_PASSWORD',
    'AUTH0_CLIENT_ID',
    'AUTH0_DOMAIN'
];

const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
    console.error('ERROR: Missing required environment variables:', missing.join(', '));
    console.error('Please create a .env file based on .env.example');
    process.exit(1);
}

// AWS Configuration
const aws = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
};

// AvaTax Configuration
const avatax = {
    config: {
        appName: process.env.AVATAX_APP_NAME || 'lagerinventory',
        appVersion: process.env.AVATAX_APP_VERSION || '1.0',
        environment: process.env.AVATAX_ENVIRONMENT || 'sandbox',
        machineName: process.env.AVATAX_MACHINE_NAME || 'ygritte'
    },
    credentials: {
        username: process.env.AVATAX_USERNAME,
        password: process.env.AVATAX_PASSWORD
    }
};

// Email Configuration
const email = {
    from: process.env.EMAIL_FROM ? process.env.EMAIL_FROM : 'email1@example.com',
    bcc: process.env.EMAIL_BCC ? process.env.EMAIL_BCC.split(',').map(e => e.trim()) : []
};

// Auth0 Configuration
const auth0 = {
    clientId: process.env.AUTH0_CLIENT_ID,
    domain: process.env.AUTH0_DOMAIN,
    callbackUrl: process.env.AUTH0_CALLBACK_URL || 'http://localhost:8080/app/inventory',
    audience: process.env.AUTH0_AUDIENCE || 'https://lagerinventory/api'
};

// MongoDB URL
const mongo = {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/lager'
};

module.exports = {
    aws,
    avatax,
    email,
    auth0,
    mongo
};
