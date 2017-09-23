var mongoose = require('mongoose');

var Schema = new mongoose.Schema();

var CounterSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    seq: {type: Number, default: 0}
});


module.exports = mongoose.model('Counter', CounterSchema);
