var canvasObjects = {};

$(document).ready(function(){
  resizeElements();
  var mySocket
    , lastId = 0
    , socket = io.connect('http://localhost')
    , canvas = new fabric.Canvas('canvas',{
        width: 800,
        height: 500
      })
    , actionCreate   = null
    , selectedColor  = "#000000"
    , x              = 0
    , y              = 0
    , startedDrawing = false
    ;

  $('.colors').children().each(function (i, elem){
    $(elem).css('background',$(elem).attr('data-color'));
  });

  socket.on('socket_id', function (socket_id){
    mySocket = socket_id;
    fabric.Object.prototype.socket_id = mySocket;
    go();
  });

  socket.on('new-object', function (obj){
    var parsed = JSON.parse(obj.data);
    fabric.util.enlivenObjects([parsed], function (alive){
      var o = alive[0];

      o.socket_id        = obj.socket_id;
      o.id               = obj.id;
      o.centeredRotation = true;
      o.centeredScaling  = true;

      if(typeof canvasObjects[obj.socket_id] !== "object"){
        canvasObjects[obj.socket_id] = {};
      }
      canvasObjects[obj.socket_id][obj.id] = o;
      canvas.add(o);
    });
  });
  
  socket.on('update-new-object-rect', function (data){
    var o = canvasObjects[data.socket_id][data.id];
    o.set('width',data.width).set('height',data.height);
    o.setCoords();
    canvas.renderAll();
  });

  socket.on('update-new-object-line', function (data){
    var o = canvasObjects[data.socket_id][data.id];
    o.set('x2',data.x2).set('y2',data.y2);
    o.setCoords();
    canvas.renderAll();
  });

  socket.on('resize-object', function (data){
    var o = canvasObjects[data.socket_id][data.id];
    o.scaleX = data.scaleX;
    o.scaleY = data.scaleY;
    o.setCoords();
    canvas.renderAll();
  });
  
  socket.on('move-object', function (data){
    var o = canvasObjects[data.socket_id][data.id];
    o.top  = data.top;
    o.left = data.left;
    o.setCoords();
    canvas.renderAll();
  });

  socket.on('rotate-object', function (data){
    var o = canvasObjects[data.socket_id][data.id];
    o.rotate(data.angle);
    o.setCoords();
    canvas.renderAll();
  });

  socket.on('remove-object', function (data){
    var o = canvasObjects[data.socket_id][data.id];
    canvas.remove(o);
    delete canvasObjects[data.socket_id][data.id];
    canvas.renderAll();
    
  });

  socket.on('meta-object', function (data){
    var o = canvasObjects[data.socket_id][data.id];
    for(key in data.meta_data){
      o[key] = data.meta_data[key]; 
    }
    o.setCoords();
    canvas.renderAll();
  });

  function go(){
    var createObjects = {
      drawRect: function(){
        console.log('drawing rect');
      },
      drawLine: function(){
        console.log('drawing line');
      }
    }

    $('.tools').children().click(function (e){
      var f = $(this).attr('data-tool');
      if(actionCreate == f){
        resetTool();
      } else {
        $('.tools').children().removeClass('selected');
        canvas.selection = false;
        actionCreate = f;
        $(this).addClass('selected');
      }
    });
    
    $('.colors').children().click(function (e){
      var c = $(this).attr('data-color');
      $('.colors').children().removeClass('selected');
      if(!c.match(/^\#[0-9a-fA-F]{6}$/)){
        c = "#000000";
      } else {
        selectedColor = c;
        $(this).addClass('selected');
      }
    });

    $('.actions').children().click(function (e){
      var a = $(this).attr('data-action');
      if (a == 'fill'){
        fillActiveObject();
      }

      if (a == 'remove'){
        removeActiveObject();
      }

      if (a == 'border'){
        changeBorderActiveObject();
      }

    });

  }

  canvas.on("object:scaling", function (d){
    // rect1.scaleX = d.target.scaleX;
    // rect1.scaleY = d.target.scaleY;
    // rect1.setCoords();
    socket.emit('resize-object',{
      id: d.target.id,
      socket_id: d.target.socket_id,
      scaleX: d.target.scaleX,
      scaleY: d.target.scaleY
    });
  });

  canvas.on("object:rotating", function (d){
    // rect1.rotate(d.target.angle);
    socket.emit('rotate-object',{
      id: d.target.id,
      socket_id: d.target.socket_id,
      angle: d.target.angle,
    });
  });
  canvas.on("object:moving", function (d){
    socket.emit('move-object',{
      id: d.target.id,
      socket_id: d.target.socket_id,
      top: d.target.top,
      left: d.target.left
    });
    // console.log(d.target)
  });
  
  canvas.on("object:selected", function (d){

  });

  canvas.on("mouse:down", prepareDrawingElement);
  canvas.on("mouse:move", drawElement);
  canvas.on("mouse:up", placeElement);

  function prepareDrawingElement (e){
    var mouse = canvas.getPointer(e.e);
    x = mouse.x;
    y = mouse.y;
    var obj;
    if(actionCreate == 'drawRect'){

      obj = new fabric.Rect({
        id: genId(),
        left: x,
        top: y,
        fill: "rgba(0,0,0,0)",
        stroke: selectedColor,
        strokeWidth: 2,
        width: 0,
        height: 0,
        centeredRotation: true,
        centeredScaling: true,
        originX: 'center',
        originY: 'center'
      });

      obj.setCoords();
      canvas.add(obj);
      startedDrawing = true;
      canvas.setActiveObject(obj);
    }

    if(actionCreate == 'drawLine'){
      obj = new fabric.Line([x, y, x, y],{
        id: genId(),
        fill: selectedColor,
        stroke: selectedColor,
        strokeWidth: 2,
        centeredRotation: true,
        centeredScaling: true,
        originX: 'center',
        originY: 'center'
      });
      obj.setCoords();
      canvas.add(obj);
      startedDrawing = true;
      canvas.setActiveObject(obj);
    }

    if(startedDrawing){
      if(typeof canvasObjects[obj.socket_id] !== "object"){
        canvasObjects[obj.socket_id] = {};
      }
      canvasObjects[obj.socket_id][obj.id] = obj;
      socket.emit('new-object', {id: obj.id, socket_id: obj.socket_id, data: JSON.stringify(obj)});
    }

  }
  function drawElement (e){
    if(!startedDrawing){
      return false;
    }
    var mouse = canvas.getPointer(e.e)
      ;

    if(actionCreate == 'drawRect'){
      var w = Math.abs(mouse.x - x)
        , h = Math.abs(mouse.y - y)
        ;
      if(!w || !h){
        return false;
      } 
      var obj = canvas.getActiveObject();
      obj.set('width',2*w).set('height',2*h);
      obj.setCoords();

      socket.emit('update-new-object-rect', {
        id: obj.id, 
        socket_id: mySocket,
        width: 2*w,
        height: 2*h
      });
      canvas.renderAll();
    }

    if(actionCreate == 'drawLine'){
      var obj = canvas.getActiveObject();
      obj.set('x2',mouse.x).set('y2',mouse.y);
      obj.setCoords();

      socket.emit('update-new-object-line', {
        id: obj.id, 
        socket_id: mySocket,
        x2: mouse.x,
        y2: mouse.y
      });
      canvas.renderAll();
    }
  }


  function fillActiveObject(){
    var o = canvas.getActiveObject();
    o.fill = selectedColor;

    socket.emit('meta-object',{
      id: o.id,
      socket_id: o.socket_id,
      meta_data: {
        fill: selectedColor
      }
    });
    canvas.renderAll();
  }

  function changeBorderActiveObject(){
    var o = canvas.getActiveObject();
    o.stroke = selectedColor;
    socket.emit('meta-object',{
      id: o.id,
      socket_id: o.socket_id,
      meta_data: {
        stroke: selectedColor
      }
    });
    canvas.renderAll();
  }

  function removeActiveObject(){
    var o = canvas.getActiveObject();

    socket.emit('remove-object',{
      id: o.id,
      socket_id: o.socket_id
    });
    canvas.remove(o);
    delete canvasObjects[o.socket_id][o.id];
    canvas.renderAll();
  }
  function resetTool(){
    actionCreate = null;
    canvas.selection = true;
    $('.tools').children().removeClass('selected');
  }

  function placeElement (e){
    if(!startedDrawing){
      return false;
    }
    if(actionCreate == 'drawRect'){
      var obj = canvas.getActiveObject();
      startedDrawing = false;
      obj.setCoords();
      canvas.renderAll();
      resetTool();
    }
    if(actionCreate == 'drawLine'){
      var obj = canvas.getActiveObject();
      startedDrawing = false;
      obj.setCoords();
      canvas.renderAll();
      resetTool();
    }
  }

  function genId(){
    lastId++;
    return lastId;
  }

  function resizeElements(){
    $('.container').css("height",window.innerHeight);
  }

  $(window).resize(resizeElements);
});

