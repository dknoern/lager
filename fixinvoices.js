var Product = require('./models/product');
var Invoice = require('./models/invoice');
var mongoose = require('mongoose');

mongoose.Promise = require('bluebird');

const option = {
    socketTimeoutMS: 90000,
    keepAlive: true,
    reconnectTries: 90000
};

mongoose.connect('mongodb://localhost:27017/lager', option);

fixInvoices();

function fixInvoices() {
    console.log("fix invoices");

    Invoice.find({}, (err, invoices) => {

        invoices.map(invoice => {

            invoice.lineItems.map(lineItem => {

                var itemNumber = lineItem.itemNumber;

                if (itemNumber) {

                    Product.findOne({'itemNumber': itemNumber}, '_id serialNo', function (err, product) {

                        if (product != null) {

                            var serialNumber = product.serialNo;
                            var productId = product._id;


                            console.log("updating productId to  " + productId + ", serialNumber to " + serialNumber + " for item " + itemNumber);

                            Invoice.update({
                                    _id: invoice._id,
                                    "lineItems.itemNumber": itemNumber
                                }, {
                                    $set: {
                                        "lineItems.$.productId": productId,
                                        "lineItems.$.serialNumber": serialNumber
                                    }
                                },
                                function (err, output) {
                                });
                        }

                    });
                }

            });
        })
    });
}


