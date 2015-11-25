var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var User = require('./plan')

var UserSchema = new Schema({
  firstName: String,
  lastName: String,
  phone: Number,
  address: String
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  }
});

module.exports = mongoose.model('User', UserSchema)
