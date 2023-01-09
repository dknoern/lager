
var Product = require('./models/product');

var Log = require('./models/log');

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
//mongoose.connect('mongodb://localhost:27018/lager', option);
mongoose.connect('mongodb://localhost:27017/lager', option);

//mongoose.connect('mongodb://localhost:27018/lager', option);

read();

function read() {
    var start = 0;
    var length = 10;

    Product.
    aggregate([

        {$unwind: "$history"},
        { $match: 
        {'history.action': 'received'},
        }]).
    //skip(parseInt(start)).limit(parseInt(length)).
        exec(async function (err, products) {

        if(products==null){
            console.log("no log items found");
        }

        else {

            for (var i = 0; i < products.length; i++) {

                console.log('product history name',products[i].history.itemReceived);
                console.log('product history id',products[i].history._id);
                console.log('id',products[i]._id);
                console.log('itemNumber',products[i].itemNumber);

                var log = {
                    date: products[i].history.date,
                    receivedFrom: products[i].history.receivedFrom,
                    comments: products[i].history.comments,
                    user: products[i].history.user,
                    customerName: products[i].history.customerName,
                    search: products[i].history.search,
                    lineItems: [
                        {
                            itemNumber: products[i].itemNumber,
                            name: products[i].history.itemReceived,
                            repairNumber: products[i].history.repairNumber,
                            repairCost: products[i].history.repairCost,
                            productId: products[i]._id,
                            repairId: products[i].history.repairId
                        }
                    ]
                }

                // if no itemnumber, re-use product._id for log._id
                if(products[i].itemNumber == null){
                    log._id=products[i]._id;
                }

                const doc = await Log.create(log);

                await Product.findOneAndUpdate({
                    'history._id': products[i].history._id
                }, {
        
                    "$set": {
                            'history.$.logId': doc._id
                    }
                }, {
                    upsert: false
                }, function (err, doc) {
                    if (err) return res.send(500, {
                        error: err
                    });
                });
            }
        }
    });
}
