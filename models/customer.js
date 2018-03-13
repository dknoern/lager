var mongoose     = require('mongoose');

var CustomerSchema   = new mongoose.Schema({
	  _id: Number,
	  firstName: String,
	  lastName: String,
		company: String,
		email: String,
	  phone: String,
		cell: String,
		address1: String,
		address2: String,
		address3: String,
		city: String,
		state: String,
		zip: String,
		country: String,
		billingAddress1: String,
		billingAddress2: String,
		billingAddress3: String,
		billingCity: String,
		billingState: String,
		billingZip: String,
		billingCountry: String,
		lastUpdated: Date,
	    search: String
});


module.exports = mongoose.model('Customer', CustomerSchema);
