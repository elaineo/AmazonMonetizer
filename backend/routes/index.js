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

exports.all = function(req, res){
  // get a random user
  Amzn.find( function ( err, tags, count ){
    res.write(JSON.stringify(tags));
    res.send();
  });
};

exports.create = function ( req, res ){
  Amzn.addTag(req.body.tag, function (err, tag) {
    res.write(JSON.stringify(tag));
    res.send();
  })
};

exports.inactivate = function ( req, res ){
  console.log(req.body);
  Amzn.findByTag(req.body.pool, function (err, pool) {
    console.log(pool);
    pool.release();
  });
  Amzn.findById(req.body.id, function (err, tag) {
    console.log(tag);
    tag.inactivate();
    res.write(JSON.stringify(tag));
    res.send();
  })
};

exports.joinpool = function(req, res){
  console.log(req.body);
  if (req.body.tag !== undefined) {
    Amzn.findByTag( req.body.tag, function ( err, r ){
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
  Amzn.remove({});
  res.end();
};
