
/*
 * GET home page.
 */

exports.index = function(req, res){
  var data = {};
  // data.pageScripts = ['bootstrap.min'];
  data.user = req.user;
  if (req.isAuthenticated()){
    res.render('index', { 
      title: 'Cose', 
      data: data 
    });
  } else {
    res.render('stranger', { 
      title: 'Cosé - Collaborative board'
    });
  }
};