var db = require('../db')
  , canvases = {}
  ;

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

  socket.on('join-room', function (room){
    if(typeof canvases[room] !== "object"){
      canvases[room] = {};
      canvases[room]['db_sync'] = true;
      canvases[room]['objects'] = {};
    }
    socket.join(room);
    socket.emit('canvas-sync', canvases[room].objects);
  });

  socket.on('new-object', function (data){
    if (data.b){
      canvases[data.b]['db_sync'] = false;
      if(typeof canvases[data.b]['objects'][data.socket_id] !== "object"){
        canvases[data.b]['objects'][data.socket_id] = {};
      }
      canvases[data.b]['objects'][data.socket_id][data.id] = JSON.parse(data.data);

      socket.broadcast.to(data.b).emit('new-object', data);
    }
  });

  socket.on('update-new-object-rect', function (data){
    if (data.b){
      canvases[data.b]['objects'][data.socket_id][data.id].width = data.width;
      canvases[data.b]['objects'][data.socket_id][data.id].height = data.height;
      socket.broadcast.to(data.b).emit('update-new-object-rect', data);
    }
  });

  socket.on('update-new-object-line', function (data){
    if (data.b){
      canvases[data.b]['objects'][data.socket_id][data.id].x2 = data.x2;
      canvases[data.b]['objects'][data.socket_id][data.id].y2 = data.y2;
      socket.broadcast.to(data.b).emit('update-new-object-line', data);
    }
  });

  socket.on('resize-object', function (data){
    if (data.b){
      canvases[data.b]['objects'][data.socket_id][data.id].scaleX = data.scaleX;
      canvases[data.b]['objects'][data.socket_id][data.id].scaleY = data.scaleY;
      socket.broadcast.to(data.b).emit('resize-object', data);
    }
  });

  socket.on('rotate-object', function (data){
    if (data.b){
      canvases[data.b]['objects'][data.socket_id][data.id].angle = data.angle;
      canvases[data.b]['objects'][data.socket_id][data.id].left = data.left;
      canvases[data.b]['objects'][data.socket_id][data.id].top = data.top;

      socket.broadcast.to(data.b).emit('rotate-object', data);
    }
  });

  socket.on('move-object', function (data){
    if (data.b){
      canvases[data.b]['objects'][data.socket_id][data.id].left = data.left;
      canvases[data.b]['objects'][data.socket_id][data.id].top = data.top;
      socket.broadcast.to(data.b).emit('move-object', data);
    }
  });

  
  socket.on('meta-object', function (data){
    if (data.b){
      for (attr in data.meta_data){
        canvases[data.b]['objects'][data.socket_id][data.id][attr] = data.meta_data[attr];
      }
      socket.broadcast.to(data.b).emit('meta-object', data);
    }
  });

  socket.on('remove-object', function (data){
    if (data.b){
      delete canvases[data.b]['objects'][data.socket_id][data.id];
      socket.broadcast.to(data.b).emit('remove-object', data);
    }
  });

} 

function updateCanvas (object){

}