
var Product = require('./models/product');

var Repair = require('./models/repair');

var mongoose = require('mongoose');

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
mongoose.connect('mongodb://localhost:27018/lager', option);

//mongoose.connect('mongodb://localhost:27018/lager', option);

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

var collection = process.argv[2];

fix();

function fix() {
    console.log("fix invoices");

    Repair.find({}, (err, repairs) => {

        repairs.map(repair => {

            var dateOut = repair.dateOut;
            var returnDate = repair.returnDate;
            var vendor = repair.vendor;
            var itemNumber = repair.itemNumber;

            console.log("item " + itemNumber + " dateOut " + dateOut + " returnDate " + returnDate + " vendor " + vendor);



/*

            if(dateOut !=null){

                var action = "in repair";

                if(vendor != null)
                    action += " - " + vendor;

                Product.findOneAndUpdate({
                    itemNumber: itemNumber
                }, {

                    "$push": {
                        "history": {
                            user: 'system',
                            date: dateOut,
                            action: action
                        }
                    }
                }, {
                    upsert: true
                }, function (err, doc) {
                    if (err)
                        console.log("can't save history");
                });
            }
*/






            if(returnDate !=null){

                var action = "back from repair";
                Product.findOneAndUpdate({
                    itemNumber: itemNumber
                }, {

                    "$push": {
                        "history": {
                            user: 'system',
                            date: returnDate,
                            action: action
                        }
                    }
                }, {
                    upsert: true
                }, function (err, doc) {
                    if (err)
                        console.log("can't save history");
                });

            }






        })
    });
}

