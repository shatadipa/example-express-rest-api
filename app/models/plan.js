var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var PlanSchema = new Schema({
  name: String,
  price: Number,
  speed: Number
});

module.exports = mongoose.model('Plan', PlanSchema)
