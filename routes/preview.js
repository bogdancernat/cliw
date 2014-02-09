
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
    res.render('preview', { 
      title: 'Cosé - Collaborative board',
      data: data 
    });
  } else {
    res.render('stranger', { 
      title: 'Cosé - Collaborative board'
    });
  }
};