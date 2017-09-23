var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const path = require('path');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/lager');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.use('/app/modules', express.static('./src/app/modules'));

app.use('/assets', express.static('./src/assets'));
app.use('/uploads', express.static('./uploads'));

var port = process.env.PORT || 3000;

var customers = require('./routes/customers');
app.use('/api', customers);

var invoices = require('./routes/invoices');
app.use('/api', invoices);

var returns = require('./routes/returns');
app.use('/api', returns);

var products = require('./routes/products');
app.use('/api', products);

var upload = require('./routes/upload');
app.use('/api', upload);


app.use('/', express.static(__dirname +  '/'));


app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});





app.listen(port);
console.log('Listening on port ' + port);
