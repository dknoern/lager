var express = require('express');
var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');

var Customer = require('./models/customer');
var Product = require('./models/product');
var Invoice = require('./models/invoice');
var Return = require('./models/return');
var Repair = require('./models/repair');

var mongoose = require('mongoose');
var format = require('date-format');
mongoose.Promise = require('bluebird');

var promises = null;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const option = {
    socketTimeoutMS: 90000,
    keepAlive: true,
    reconnectTries: 90000
};


//mongoose.connect('mongodb://lager:wntNJy5DqatKcvdYWCDrwAxYr67JC32D@ds123698.mlab.com:23698/lager');

//mongoose.connect('mongodb://localhost:27017/lager', option);
mongoose.connect('mongodb://localhost:27017/lager', option);

function load(modelName, fileName, functionName) {

    promises = new Array();
    var datadir = process.env.HOME + "/Desktop/demesy";
    //var datadir = process.env.HOME + "/Dropbox/demesy";
    //var datadir = process.env.HOME + "/Google\ Drive/demesy";

    var drops = new Array();

    if (modelName != null) {
        drops.push(modelName.remove({}, function (err, row) {
        }));
    }

    Promise.all(drops).then(function () {
        loadCsvFile(datadir + "/" + fileName, functionName);
    });
}

fixInvoices();

function fixInvoices(){
    console.log("fix invoices");


    Invoice.find({} , (err, invoices) => {

            invoices.map(invoice => {
                console.log("id is " + invoice._id);

                var i;


                console.log("invoice "+ invoice._id + " has " + invoice.lineItems.length + " items" );



                for (i = 0; i < invoice.lineItems.length; i++) {

                    var itemNumber = invoice.lineItems[i].itemNumber;
                    var productId = invoice.lineItems[i].productId;

                    if (invoice.lineItems != null && invoice.lineItems[i] != null &&  "" != itemNumber && productId==null) {

                       // console.log("product id is " + invoice.lineItems[i].itemNumber + "  serial is " + invoice.lineItems[i].serialNumber);

                        var name = invoice.lineItems[i].name;
                        var longDesc = invoice.lineItems[i].longDesc;

                        Product.findOne({'itemNumber': itemNumber}, '_id lastUpdated serialNo title longDesc', function (err, product) {
                            var serialNumber = "";
                            if (product != null && product.serialNo != null) {
                                serialNumber = product.serialNo;
                            }

                            if (product != null && product.title != null) {
                                name = product.title;
                            }
                            if (product != null && product.longDesc != null) {
                                longDesc = product.longDesc;
                            }
                            if (product != null && product._id != null) {
                                productId  = product._id;
                            }

                            console.log("updating productId to  " +  productId  + " for item " + itemNumber);


                            var element = "lineItems.["+i+"].productId";

                            var element = "lineItems.0.productId";



                            var setter = {};

                            setter["lineItems.["+i+"].productId"] = productId;

                            console.log("setting: " + JSON.stringify(setter) + " for invoice " + invoice._id);


                            Invoice.update({
                                _id: invoice._id,
                                //'lineItems.0.itemNumber': itemNumber
                            }, {
                                "$set": setter
                            }, {
                                upsert: true
                            }, function (err, doc) {
                                if (err) {
                                    console.log("ERROR adding line item " + err);
                                }
                            });


                        });
                    }
                }



            })
    });
}


