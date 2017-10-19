var mongoose = require('mongoose');

var Schema = new mongoose.Schema();

var Counter = require('./counter');

//var CounterSchema = new mongoose.Schema({
//    _id: {type: String, required: true},
//    seq: {type: Number, default: 0}
//});
//var CounterSchema = require('./invoice');

var ReturnSchema = new mongoose.Schema({
    _id: Number,
    customerName: String,
    customerId: Number,
    invoiceId: String,
    returnDate: Date,
    subTotal: Number,
    taxable: Boolean,
    salesTax: Number,
    shipping: Number,
    totalReturnAmount: Number,
    salesPerson: String,
    lineItems: [{
        productId: String,
        name: String,
        amount: Number,
        serialNo: String,
        itemNo: String,
        longDesc: String,
        included: Boolean
    }]
});
/*
ReturnSchema.pre('save', function (next) {
    var doc = this;

    if (doc.rerturnNumber==null) {
        Counter.findByIdAndUpdate({_id: 'returnNumber'}, {$inc: {seq: 1}}, function (error, counter) {
            if (error)
                return next(error);
            doc.returnNumber = counter.seq;
            console.log("--------- returnNumberIs " + doc.returnNumber);

            next();
        });
    }else{
        next();
    }
});
*/



module.exports = mongoose.model('Return', ReturnSchema);
