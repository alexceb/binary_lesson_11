//CREATE DATA MODEL -----------------------
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var countrySchema = new Schema({
	name: String,
	description: String,
	hotels: [{ name: String, description: String, price: Number}]
});

countrySchema.statics.findHotelByName = function(name, callback) {
	return this.findOne({ 'name': name }, callback);
};

countrySchema.methods.findIndexOfHotel = function(hotname) {

	return this['hotels']
		.map(function(item) { 
				return item['name']; 
			})
		.indexOf(hotname);

};

module.exports = mongoose.model('Country', countrySchema);