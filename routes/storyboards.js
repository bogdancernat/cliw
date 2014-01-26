exports.create = function (req, res){
  if(!req.body.name || !req.body.name.length){
    res.send(400);
  } else {
    
    res.send(200);
  }
}