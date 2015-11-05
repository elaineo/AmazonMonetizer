
/*
 * GET home page.
 */
var mongoose = require( 'mongoose' );
var Raffle     = mongoose.model( 'Raffle' );

function sum( obj ) {
  var sum = 0;
  for( var el in obj ) {
      sum += parseFloat( obj[el].count );
  }
  return sum;
}

exports.index = function(req, res){
  var load_error = req.query.load_error;
  var get_error = req.query.get_error;
  var user_id = req.cookies.user_id;
  if (typeof user_id != 'undefined')
    res.redirect( '/show/'+user_id+'#load' );
  Raffle.find( function ( err, raffles, count ){
    var total = sum(raffles);
    var price = Number((1 / total).toFixed(3));
    res.render( 'index', {
      title : 'Elaine\'s Reverse Raffle',
      raffles : raffles,
      total : total,
      price : price,
      get_error : get_error,
      load_error : load_error
    });
  });
};

exports.find = function(req, res){
  Raffle.find( {email : req.body.findemail}, function (err, docs) {
    if (!docs.length){
      var error = '?load_error=User does not exist. Sign up for a ticket.'
      res.redirect( '/#getone'+error );
    } else {
      //set cookie
      res.cookie('user_id', docs[0]._id);
      res.redirect( '/show/'+docs[0]._id+'#load' );
    }
  });

};

exports.eraine = function(req, res){
  Raffle.find( function (err, raffles) {
    res.render( 'eraine', {
      title : 'Elaine\'s Stuff',
      raffles : raffles,
      total : sum(raffles)
          });
  });

};

exports.create = function ( req, res ){
  //validate form
  req.assert('username', 'Name is required').notEmpty();           //Validate name
  req.assert('email', 'A valid email is required').isEmail();  //Validate email
  req.assert('address', 'Address is required').notEmpty();

  var errors = req.validationErrors();
  if (errors)  {   //Display errors to user
      var error = '?get_error=' + errors[0].msg
      res.redirect('/' + error );
      return
  }

  Raffle.find({email : req.body.email}, function (err, docs) {
    if (!docs.length){
      new Raffle({
        name       : req.body.username,
        email      : req.body.email,
        address    : req.body.address,
        bitcoin    : req.body.bitcoin
      }).save( function( err, raffle, count ){
        var error = '';
        if ( typeof err !== 'undefined' && err )
          error = "?get_error=" + err
        res.cookie('user_id', raffle._id);
        res.redirect( '/show/'+raffle._id+ error + '#load');
      });
    } else {
      console.log(docs);
      var error = '?get_error=User exists. Ticket count incremented.'
      res.cookie('user_id', docs[0]._id);
      res.redirect('/add/'+ docs[0]._id + error );
    }
  });

};

exports.show = function(req, res){
  var load_error = req.query.load_error;
  var get_error = req.query.get_error;
  var total = 0;
  Raffle.aggregate(
    { $group: {
        _id: null,
        total:       { $sum: "$count" }
    }}, function(err, result) { total = result[0].total;  });
  Raffle.findById( req.params.id, function ( err, r ){
    var userpct =  Number((100*r.count / total).toFixed(2));
    var price = Number((1 / total).toFixed(3));
    res.render( 'index', {
      title : 'Elaine\'s Reverse Raffle',
      usertotal : r.count,
      userpct: userpct,
      username: r.name,
      user_id: r._id,
      email: r.email,
      price : price,
      total: total,
      get_error : get_error,
      load_error : load_error
    })

  });
};

exports.destroy = function ( req, res ){
  Raffle.findById( req.params.id, function ( err, r ){
    r.remove( function ( err, r ){
      res.redirect( '/eraine' );
    });
  });
};

exports.add = function ( req, res ){
  var total = 0;
  Raffle.aggregate(
    { $group: {
        _id: null,
        total:       { $sum: "$count" }
    }}, function(err, result) { total = result[0].total;  });

  Raffle.findById( req.params.id, function(err, r) {
    if (err)
      var error = "?load_error="+err
    else
      var error = ''
     // user cannot have more than 5%
     if (r.count+1 > 0.05*(total+1))
       error="?load_error=You are not allowed to have more than 5 percent of the total tickets. Try again later."
     else {
       r.count++;
       r.save();
     }
     res.redirect( '/show/'+ req.params.id + error+ '#load');
   });
};
