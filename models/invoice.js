var mongoose = require('mongoose');

var Schema = new mongoose.Schema();

var Counter = require('./counter');

//var CounterSchema = new mongoose.Schema({
//    _id: {type: String, required: true},
//    seq: {type: Number, default: 0}
//});
//var counter = mongoose.model('counter', CounterSchema);

var InvoiceSchema = new mongoose.Schema({
    customer: String,
    customerId: String,
    project: String,
    returnNumber: String,
    invoiceId: String,
    invoiceNumber: String,
    documentType: String,
    date: Date,
    shipVia: String,
    paidBy: String,
    subtotal: String,
    tax: String,
    shipping: Number,
    total: String,
    methodOfSale: String,
    salesPerson: String,
    invoiceType: String,
    shipToName: String,
    shipAddress1: String,
    shipAddress2: String,
    shipAddress3: String,
    shipCity: String,
    shipState: String,
    shipZip: String,

    lineItems: [{
        productId: String,
        name: String,
        amount: Number,
        serialNo: String,
        itemNo: String,
        longDesc: String
    }],

    history: [{
      user: String,
      date: String,
      action: String
    }]
});

InvoiceSchema.pre('save', function (next) {
    var doc = this;

    if (doc.invoiceNumber==null) {
        Counter.findByIdAndUpdate({_id: 'invoiceNumber'}, {$inc: {seq: 1}}, function (error, counter) {
            if (error)
                return next(error);
            doc.invoiceNumber = counter.seq;
            next();
        });
    }else{
        next();
    }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
