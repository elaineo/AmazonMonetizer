var mongoose = require( 'mongoose' );
var Amzn     = mongoose.model( 'Amzn' );


exports.index = function(req, res){
  // get a random user
  Amzn.findAvailable( function ( err, tags, count ){
    var tag = tags[Math.floor(Math.random()*tags.length)];
    tag.in_use = true;
    tag.save();
    res.write(JSON.stringify(tag));
    res.send();
  });
};

exports.create = function ( req, res ){
  console.log(req.body)
  Amzn.addTag(req.body.tag, function (err, tag) {
    console.log(tag)
    res.write(JSON.stringify(tag));
    res.send();
  })
};


exports.destroy = function ( req, res ){
  Amzn.findById( req.body.id, function ( err, r ){
    r.remove();
  });
};
