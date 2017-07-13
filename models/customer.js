var mongoose     = require('mongoose');

var CustomerSchema   = new mongoose.Schema({
	  firstName: String,
	  lastName: String,
		company: String,
		email: String,
	  phone: String,
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
		billingCountry: String
});

module.exports = mongoose.model('Customer', CustomerSchema);
