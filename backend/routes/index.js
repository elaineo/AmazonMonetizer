var mongoose = require( 'mongoose' );
var Amzn     = mongoose.model( 'Amzn' );


exports.index = function(req, res){
  // get a random user
  var load_error = req.query.load_error;
  var get_error = req.query.get_error;
  var user_id = req.cookies.user_id;
  if (typeof user_id != 'undefined')
    res.redirect( '/show/'+user_id+'#load' );
  Amzn.findAvailable( function ( err, tags, count ){
    var tag = tags[Math.floor(Math.random()*count)];
    res.write(JSON.stringify(tag));
  });
};

exports.create = function ( req, res ){
  //validate form
  req.assert('tag', 'Tag is required').notEmpty();           

  Amzn.addTag(req.params.tag, function (err, tag) {
    res.write(JSON.stringify(tag));
  })

};


exports.destroy = function ( req, res ){
  Amzn.findById( req.params.id, function ( err, r ){
    r.remove();
  });
};
