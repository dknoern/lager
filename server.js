var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/lager');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/', express.static('.'));
app.use('/app/modules', express.static('./src/app/modules'));

app.use('/assets', express.static('./src/assets'));

var port = process.env.PORT || 8080;

var customers = require('./routes/customers');
app.use('/api', customers);

var invoices = require('./routes/invoices');
app.use('/api', invoices);

var products = require('./routes/products');
app.use('/api', products);

app.listen(port);
console.log('Listening on port ' + port);
