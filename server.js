var express = require('express');
var app = express();
var pdf = require('express-pdf');
var bodyParser = require('body-parser');
const path = require('path');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/lager');

var fs = require('fs');
var http = require('http');
//var cert = fs.readFileSync( 'server.crt' );
var https = require('https');
var forceSSL = require('express-force-ssl');



const privateKey = fs.readFileSync('/etc/letsencrypt/live/demesyinventory.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/demesyinventory.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/demesyinventory.com/chain.pem', 'utf8');


const credentials = {
key: privateKey,
cert: certificate,
ca: ca
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(pdf);

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
   var secureServer = https.createServer(credentials, app);
   app.use(forceSSL);
   secureServer.listen(httpsPort);
   console.log('Listening on port ' + httpsPort );

}

server.listen(port);
console.log('Listening on port ' + port );
