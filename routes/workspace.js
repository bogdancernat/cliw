var db = require('../db');

exports.index = function (req, res){
  var data = {};
  data.user = req.user;
  // if(req.isAuthenticated()){

  // } else {

  // }
  console.log(req.query.b)
  db.getProject(req.query.b, function (project){
    console.log(project)
    if(project){
      res.render('workspace',{ title: 'Workspace - '+project.name});
    } else {
      res.redirect("/");
    }
  });
}

// sockets 
exports.connection = function (socket){
  socket.emit('socket_id',socket.id);

  socket.on('new-object', function (newObject){
    socket.broadcast.emit('new-object', newObject);
  });

  socket.on('update-new-object-rect', function (data){
    socket.broadcast.emit('update-new-object-rect', data);
  });

  socket.on('update-new-object-line', function (data){
    socket.broadcast.emit('update-new-object-line', data);
  });

  socket.on('resize-object', function (data){
    socket.broadcast.emit('resize-object', data);
  });

  socket.on('rotate-object', function (data){
    socket.broadcast.emit('rotate-object', data);
  });

  socket.on('move-object', function (data){
    socket.broadcast.emit('move-object', data);
  });
  
  socket.on('meta-object', function (data){
    socket.broadcast.emit('meta-object', data);
  });

  socket.on('remove-object', function (data){
    socket.broadcast.emit('remove-object', data);
  });

} 