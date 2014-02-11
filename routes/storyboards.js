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
    db.insert(p, function (resp){
      res.send({url:"/workspace?b="+p.short_url});
    });
  }
}
exports.save = function (req, res){
  if(!req.body.data || !req.body.data.length){
    res.send(400);
  } else {
    var slideshow = db.getSlideshowModel();
    slideshow.created_on = +new Date;
    slideshow.owner = req.user._id;
    slideshow.short_url = req.body.short_url;
    slideshow.pages = JSON.parse(req.body.data);
    db.getProjectMinimal(req.body.short_url, function (project_details){
      slideshow.name = project_details.name;
      db.insert(slideshow, function (resp){
        res.send(200);
      });
    });
  }
}