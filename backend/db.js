var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

var Amzn = new Schema({
    tag       : String,
    active    : Boolean,
    in_use    : Boolean,
    created_at : Date,
    updated_at : Date
});

Amzn.methods.findByTag = function (tag) {
    return this.model('Amzn').find({tag: this.tag}, tag)
}
Amzn.methods.findAvailable = function (callback) {
    return this.model('Amzn').find({active: true, in_use:false}, callback)
}
Amzn.statics.findAndModify = function (query, sort, doc, options, callback) {
  return this.collection.findAndModify(query, sort, doc, options, callback);
};
Amzn.statics.addTag = function (tag, callback) {
    // should be able to pass in doc, i'm too lazy to care
    return this.findOneAndUpdate(
      {tag: tag},
      {"tag": tag, "active": true, "in_use": false},
      { new: false, upsert: false}, callback  );
}

Amzn.methods.put_in_use = function (cb) {
    this.in_use = true;
    this.save();
    return
}
Amzn.methods.release = function (cb) {
    this.in_use = false;
    this.save();
    return
}
Amzn.methods.make_active = function (cb) {
    this.active = true;
    this.save();
    return
}
Amzn.methods.inactivate = function (cb) {
    this.active = false;
    this.save();
    return
}

var amznDB = mongoose.model('Amzn', Amzn);
module.exports.Raffle = mongoose.model('Amzn');

Amzn.pre('save', function(next){
  now = new Date();
  if ( !this.created_at ) {
    this.created_at = now;
  }
  this.updated_at = now;
    next();
});


mongoose.connect( 'mongodb://localhost/express-amzn' );
