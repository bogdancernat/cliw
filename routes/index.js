
/*
 * GET home page.
 */

exports.index = function(req, res){
  var data = {};
  // data.pageScripts = ['bootstrap.min'];
  // console.log(req.user);
  data.user = req.user;
  if (req.isAuthenticated()){
    res.render('index', { 
      title: 'Cosé - Collaborative board',
      data: data 
    });
  } else {
    res.render('stranger', { 
      title: 'Cosé - Collaborative board'
    });
  }
};