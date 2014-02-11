var db = require('../db')
  , canvases = {}
  ;

exports.index = function (req, res){
  var data = {};
  data.user = req.user;
  // if(req.isAuthenticated()){

  // } else {

  // }
  db.getProjectMinimal(req.query.b, function (project){
    if(project){
      res.render('workspace',{ title: 'Workspace - '+project.name});
    } else {
      res.redirect("/");
    }
  });
}

var interval_id = setInterval(function syncCanvasesWithDb (){
  for(canvas in canvases){
    var canvas_url = JSON.parse(JSON.stringify(canvas));
    db.getProject(canvas_url, function (project){
      var url = project.short_url;
      if(canvases[url].must_sync 
          && canvases[url].safe_to_sync){
        console.log(canvases[url]);
        canvases[url].must_sync = false;
        canvases[url].safe_to_sync = false;
        project.objects = canvases[url].objects;
        // update
        db.update(project, project._id, function (resp){
         canvases[url].safe_to_sync = true;
        });
      }
    });
  }
},300);

// sockets 
exports.connection = function (socket){
  socket.emit('socket_id',socket.id);

  socket.on('join-room', function (room){
    if(typeof canvases[room] !== "object"){
      db.getProject(room, function (project){
        console.log(project);
        canvases[project.short_url] = {};
        canvases[project.short_url]['must_sync'] = false;
        canvases[project.short_url]['safe_to_sync'] = true;
        canvases[project.short_url]['objects'] = {};
        if(project && project.objects){
          // just a safe switch to make sure i'm updating after all db actions ended
          for (obj_id in project.objects) {
            canvases[project.short_url].objects[obj_id] = project.objects[obj_id];
          };
        }
        socket.join(room);
        socket.emit('canvas-sync', canvases[room].objects);
      });
    } else {
      socket.join(room);
      socket.emit('canvas-sync', canvases[room].objects);
    }

  });

  socket.on('new-object', function (data){
    if (data.b){
      canvases[data.b]['must_sync'] = true;
      if(typeof canvases[data.b]['objects'][data.socket_id] !== "object"){
        canvases[data.b]['objects'][data.socket_id] = {};
      }
      canvases[data.b]['objects'][data.socket_id][data.id] = JSON.parse(data.data);

      socket.broadcast.to(data.b).emit('new-object', data);
    }
  });

  socket.on('update-new-object-rect', function (data){
    if (data.b){
      canvases[data.b]['must_sync'] = true;
      canvases[data.b]['objects'][data.socket_id][data.id].width = data.width;
      canvases[data.b]['objects'][data.socket_id][data.id].height = data.height;
      socket.broadcast.to(data.b).emit('update-new-object-rect', data);
    }
  });

  socket.on('update-new-object-circle', function (data){
    if (data.b){
      canvases[data.b]['must_sync'] = true;
      canvases[data.b]['objects'][data.socket_id][data.id].radius = data.radius;
      socket.broadcast.to(data.b).emit('update-new-object-circle', data);
    }
  });
  socket.on('update-new-object-triangle', function (data){
    if (data.b){
      canvases[data.b]['must_sync'] = true;
      canvases[data.b]['objects'][data.socket_id][data.id].width = data.width;
      canvases[data.b]['objects'][data.socket_id][data.id].height = data.height;
      socket.broadcast.to(data.b).emit('update-new-object-triangle', data);
    }
  });
  
  socket.on('update-new-object-line', function (data){
    if (data.b){
      canvases[data.b]['must_sync'] = true;
      canvases[data.b]['objects'][data.socket_id][data.id].x2 = data.x2;
      canvases[data.b]['objects'][data.socket_id][data.id].y2 = data.y2;
      socket.broadcast.to(data.b).emit('update-new-object-line', data);
    }
  });

  socket.on('resize-object', function (data){
    if (data.b){
      canvases[data.b]['must_sync'] = true;
      canvases[data.b]['objects'][data.socket_id][data.id].scaleX = data.scaleX;
      canvases[data.b]['objects'][data.socket_id][data.id].scaleY = data.scaleY;
      socket.broadcast.to(data.b).emit('resize-object', data);
    }
  });

  socket.on('rotate-object', function (data){
    if (data.b){
      canvases[data.b]['must_sync'] = true;
      canvases[data.b]['objects'][data.socket_id][data.id].angle = data.angle;
      canvases[data.b]['objects'][data.socket_id][data.id].left = data.left;
      canvases[data.b]['objects'][data.socket_id][data.id].top = data.top;

      socket.broadcast.to(data.b).emit('rotate-object', data);
    }
  });

  socket.on('move-object', function (data){
    if (data.b){
      canvases[data.b]['must_sync'] = true;
      canvases[data.b]['objects'][data.socket_id][data.id].left = data.left;
      canvases[data.b]['objects'][data.socket_id][data.id].top = data.top;
      socket.broadcast.to(data.b).emit('move-object', data);
    }
  });

  
  socket.on('meta-object', function (data){
    if (data.b){
      canvases[data.b]['must_sync'] = true;
      for (attr in data.meta_data){
        canvases[data.b]['objects'][data.socket_id][data.id][attr] = data.meta_data[attr];
      }
      socket.broadcast.to(data.b).emit('meta-object', data);
    }
  });

  socket.on('remove-object', function (data){
    if (data.b){
      canvases[data.b]['must_sync'] = true;
      delete canvases[data.b]['objects'][data.socket_id][data.id];
      socket.broadcast.to(data.b).emit('remove-object', data);
    }
  });

} 
