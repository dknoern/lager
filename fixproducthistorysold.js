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


// clean up first:

// db.products.update({},{$pull:{"history": {"action":"item sold"}}},{multi:true});


mongoose.connect('mongodb://localhost:27018/lager', option);

fixInvoices();

function fixInvoices() {
    console.log("fix invoices");

    Invoice.find({}, (err, invoices) => {

        invoices.map(invoice => {



            //insert history item for product


            invoice.lineItems.map(lineItem => {
                var itemNumber = lineItem.itemNumber;
                if (itemNumber) {

                    Product.findOneAndUpdate({'itemNumber': itemNumber}, {

                        "$push": {
                            "history": {

                                $each: [ {
                                    user: invoice.salesPerson,
                                    date: invoice.date,
                                    action: "sold item",
                                    refDoc: invoice._id} ]
                                ,$sort: { date: 1 }
                            }
                        }
                    }, {
                        upsert: true
                    }, function (err, doc) {
                        if (err) {
                            console.log(err);
                        }

                        console.log("added invoice "+ invoice._id + " for product " + itemNumber);
                    });


                }
            });

        })
    });
}


