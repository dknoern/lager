var Product = require('./models/product');
var Invoice = require('./models/invoice');
var mongoose = require('mongoose');

var format = require('date-format');
mongoose.Promise = require('bluebird');

const option = {
    socketTimeoutMS: 90000,
    keepAlive: true,
    reconnectTries: 90000
};

//mongoose.connect('mongodb://localhost:27018/lager', option);
mongoose.connect('mongodb://localhost:27017/lager', option);

fix();

function fix() {
    console.log("fixing product data");

    Product.find({}, (err, products) => {

        products.map(product => {


            console.log("fixing product" + product._id);

            // fix search
            product.search = product.itemNumber + " " + product.title + " " + product.dial + " " + product.serialNo+ " " + product.model;



            product.save();


        })
    });
}


