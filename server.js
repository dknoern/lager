var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const path = require('path');
const config = require('./config');
var mongoose = require('mongoose');
var mongoOpts = { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true };

var mongoUrl = config.mongo.url;
require('console-stamp')(console, { 
  format: ':date(yyyy-mm-dd HH:MM:ss.l)' 
} );

mongoose.connect(mongoUrl,mongoOpts);

var fs = require('fs');
var http = require('http');
//var cert = fs.readFileSync( 'server.crt' );
var https = require('https');
var forceSSL = require('express-force-ssl');

function redirectWwwTraffic(req, res, next) {
  if (req.headers.host.slice(0, 4) === "www.") {
    var newHost = req.headers.host.slice(4);
    return res.redirect(301, req.protocol + "://" + newHost + req.originalUrl);
  }
  next();
}

app.set("trust proxy", true);
app.use(redirectWwwTraffic);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/app/modules', express.static('./src/app/modules'));

app.use('/assets', express.static('./src/assets'));
app.use('/uploads', express.static('./uploads'));
app.use('/.well-known', express.static('./well-known'));

var customers = require('./routes/customers');
app.use('/api', customers);

var invoices = require('./routes/invoices');
app.use('/api', invoices);

var returns = require('./routes/returns');
app.use('/api', returns);

var repairs = require('./routes/repairs');
app.use('/api', repairs);

var products = require('./routes/products');
app.use('/api', products);

var upload = require('./routes/upload');
app.use('/api', upload);

var reports = require('./routes/reports');
app.use('/api', reports);

var logitems = require('./routes/logitems');
app.use('/api', logitems);

var out = require('./routes/out');
app.use('/api', out);

app.use('/', express.static(__dirname +  '/'));

// Serve auth0-variables.js dynamically from config
app.get('/auth0-variables.js', function(req, res) {
  res.type('application/javascript');
  res.send(`var AUTH0_CLIENT_ID='${config.auth0.clientId}';
var AUTH0_DOMAIN='${config.auth0.domain}';
var AUTH0_CALLBACK_URL='${config.auth0.callbackUrl}';
var AUTH0_AUDIENCE='${config.auth0.audience}';`);
});

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

var port = process.env.PORT || 8080;
var httpsPort = (port==80 ? 443 : 8443);
var server = http.createServer(app);

if(port!=8080){
  const privateKey = fs.readFileSync('/etc/letsencrypt/live/demesyinventory.com/privkey.pem', 'utf8');
  const certificate = fs.readFileSync('/etc/letsencrypt/live/demesyinventory.com/fullchain.pem', 'utf8');
  const ca = fs.readFileSync('/etc/letsencrypt/live/demesyinventory.com/fullchain.pem', 'utf8');

  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
    };
   var secureServer = https.createServer(credentials, app);
   app.use(forceSSL);
   secureServer.listen(httpsPort);
   console.log('Listening on port ' + httpsPort )
}

server.listen(port);
console.log('Listening on port ' + port );
