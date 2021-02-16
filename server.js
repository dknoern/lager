var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const path = require('path');
var mongoose = require('mongoose');
var mongoOpts = { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true };

var mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/lager";

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

app.use('/', express.static(__dirname +  '/'));

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
