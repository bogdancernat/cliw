$(document).ready(function(){

  var $frame = $('#effects');
  var $wrap  = $frame.parent();
  var flag = false;
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

   var temWi = $('.list').width();
   $('.list').width(temWi + 1);


    $('.toStart').on('click', function () {
      sly.toStart();
    });
    // $('.toLeft').on('click', function () {
    //   sly.prev();
    // });
    // $('.toRight').on('click', function () {
    //   sly.next();
    // });

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
      
      var w_w = window.innerWidth
        , w = w_w - 80
        , h = w * ratio
        // console.log(w,h);
        if(w_w < 850) {    
        $('.prj-prev').css({ 
          'width': w + 'px',
          'height': h +'px'
        });
        }else if(w_w > 850 && !flag){
          $('.prj-prev').css({ 
          'width': '800px',
          'height': '500px'
        });
        }
        sly.reload();
        var temWi = $('.list').width();
        $('.list').width(temWi + 1);
    })

    function cancelFullScreen(el) {
      var requestMethod = el.cancelFullScreen||el.webkitCancelFullScreen||el.mozCancelFullScreen||el.exitFullscreen;
      if (requestMethod) { // cancel full screen.
          requestMethod.call(el);
      } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
          var wscript = new ActiveXObject("WScript.Shell");
          if (wscript !== null) {
              wscript.SendKeys("{F11}");
          }
      }
    }

        function requestFullScreen(el) {
          // alert(2)
            // Supports most browsers and their versions.
            var requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;

            if (requestMethod) { // Native full screen.
                requestMethod.call(el);
            } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
                var wscript = new ActiveXObject("WScript.Shell");
                if (wscript !== null) {
                    wscript.SendKeys("{F11}");
                }
            }
            return false
        }

        function toggleFull() {
            var elem = document.body; // Make the body go full screen.
            var isInFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) ||  (document.mozFullScreen || document.webkitIsFullScreen);

            if (isInFullScreen) {
                cancelFullScreen(document);
            } else {
                requestFullScreen(elem);
            }
            return false;
        }

  $(document).on('click', '.toFullScreen', function () {
    if(!flag) {
      toggleFull();
      $(this).find('.glyphicon').removeClass('glyphicon-fullscreen');
      $(this).find('.glyphicon').addClass('glyphicon-resize-small');
      $('.prj-prev').css({
        'width': '900px',
        'height': '600px'
      });
      $('.frame').css({
        'height': '85%'
      })
      sly.reload();
      var temWi = $('.list').width();
      $('.list').width(temWi + 1);
      flag = true;
    }else {
      toggleFull();
      $(this).find('.glyphicon').removeClass('glyphicon-resize-small');
      $(this).find('.glyphicon').addClass('glyphicon-fullscreen');
      $('.prj-prev').css({
        'width': '800px',
        'height': '500px'
      });
      $('.frame').css({
        'height': '75%'
      })
      flag = false;
      sly.reload();
      var temWi = $('.list').width();
      $('.list').width(temWi + 1);

    }
  });

});