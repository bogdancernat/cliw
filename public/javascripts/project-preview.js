$(document).ready(function(){

  var $frame = $('#effects');
  var $wrap  = $frame.parent();
  var option = {
      horizontal: 1,
      itemNav: 'forceCentered',
      smart: 1,
      activateMiddle: 1,
      activateOn: 'click',
      mouseDragging: 1,
      touchDragging: 1,
      releaseSwing: 1,
      startAt: 0,
      scrollBar: $wrap.find('.scrollbar'),
      scrollBy: 1,
      speed: 300,
      elasticBounds: 1,
      easing: 'swing',
      dragHandle: 1,
      dynamicHandle: 1,
      clickBar: 1,
      // Buttons
      prev: $wrap.find('.prev'),
      next: $wrap.find('.next')
    };


  var sly = new Sly($frame, option).init();

    $('.toStart').on('click', function () {
      sly.toStart();
    });
    $('.toLeft').on('click', function () {
      sly.prev();
    });
    $('.toRight').on('click', function () {
      sly.next();
    });

    $('.toEnd').on('click', function () {
      sly.toEnd();
    });

    $(document).keydown(function(e){
      if(e.keyCode == 37 ){
        sly.prev();
      }else if(e.keyCode == 39) {
        sly.next();
      }
    });


    $(window).resize(function() {

      var a = 800
        , b = 500
        , ratio = b/a
        ;
      sly.reload();
      var w_w = window.innerWidth
        , w = w_w - 80
        , h = w * ratio
        // console.log(w,h);
        if(w_w < 850) {    
        $('.prj-prev').css({ 
          'width': w + 'px',
          'height': h +'px'
        });
        }else if(w_w > 850){
          $('.prj-prev').css({ 
          'width': '800px',
          'height': '500px'
        });
        }
    })

});