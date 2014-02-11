
/*
 * GET home page.
 */
var db = require('../db')
  ;

exports.index = function(req, res){
  var data = {};
  data.pageScripts = ['project-listing'];
  data.pageStyles = ['index.min'];
  // console.log(req.user);
  data.user = req.user;
  
  if (req.isAuthenticated()){
    db.getOwnerUnfinishedProjects(req.user._id, function (unfinishedProjects){
      data.unfinishedProjects = [];
      for (var i = 0; i < unfinishedProjects.length; i++) {
        var p = unfinishedProjects[i];
        data.unfinishedProjects.push({
          url: p.value.short_url,
          created_on: p.value.created_on,
          name: p.value.name
        });
      }
      
      res.render('index', { 
        title: 'Cosé - Collaborative board',
        data : data 
      });
    });
  } else {
    res.render('stranger', { 
      title: 'Cosé - Collaborative board'
    });
  }
};

