var db = require('../db')
  , h = require('hashids')
  , hash = new h("so secret much crypto",10)
  ;

exports.create = function (req, res){
  if(!req.body.name || !req.body.name.length){
    res.send(400);
  } else {
    var p = db.getProjectModel();
    p.name = req.body.name;
    p.owner = req.user._id;
    p.created_on = +new Date;
    p.collaborators.push(p.owner);

    p.short_url = hash.encrypt(p.created_on);
    console.log(p.short_url);
    db.insert(p, function (resp){

    });
    res.send({url:"/workspace?b="+p.short_url});
  }
}