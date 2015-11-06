var mongoose = require( 'mongoose' );
var Amzn     = mongoose.model( 'Amzn' );


exports.index = function(req, res){
  // get a random user
  Amzn.findAvailable( function ( err, tags, count ){
    console.log(tags);
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
    res.write(JSON.stringify(tag));
    res.send();
  })
};

exports.inactivate = function ( req, res ){
  console.log(req.body)
  Amzn.findById(req.body.id, function (err, tag) {
    tag.inactivate();
    res.write(JSON.stringify(tag));
    res.send();
  })
};

exports.joinpool = function(req, res){
  console.log(req.body)
  if (req.body.id !== undefined) {
    Amzn.findById( req.body.id, function ( err, r ){
      r.release();
      sendAvailable(res);
    });
  } else sendAvailable(res);
};
function sendAvailable(res) {
    // get a random user
  Amzn.findAvailable( function ( err, tags, count ){
    var tag = tags[Math.floor(Math.random()*tags.length)];
    tag.put_in_use();
    res.write(JSON.stringify(tag));
    res.send();
  });
}

exports.destroy = function ( req, res ){
  Amzn.findById( req.body.id, function ( err, r ){
    r.remove();
  });
};
