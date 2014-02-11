var db = require('../db')
  ;
/*
 * GET home page.
 */

exports.index = function(req, res){
  var data = {};
  data.pageScripts = ['project-preview'];
  data.pageStyles = ['preview.min'];
  // console.log(req.user);
  data.user = req.user;

  if (req.isAuthenticated()){
    db.getSavedProject(req.query.b, function (project){
      if(project){
        data.project = project;
        db.getProjectMinimal(req.query.b, function (project_details){
          if(project_details){
            res.render('preview', { 
              title: 'Preview - '+project_details.name,
              data: data 
            });
          } else {
            res.redirect("/");
          }
        });
      } else {
        res.redirect("/");
      }
    });

  } else {
    res.render('stranger', { 
      title: 'Cosé - Collaborative board'
    });
  }
};