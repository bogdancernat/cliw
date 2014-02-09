$(document).ready(function(){
  
  $('#create-storyboard').click(function (e){
    var name = $('#new-storyboard').val();
    if(name.length){
      $.post('/create',{ name: name}, function (resp){
        console.log(resp);
        window.location = resp.url;
      });
    }
  });

  var $frame  = $('#smart');
  var $slidee = $frame.children('ul').eq(0);
  var $wrap   = $frame.parent();

  $frame.sly({
    itemNav: 'basic',
    smart: 1,
    activateOn: 'click',
    mouseDragging: 1,
    touchDragging: 1,
    releaseSwing: 1,
    startAt: 0,
    scrollBar: $wrap.find('.scrollbar'),
    scrollBy: 1,
    activatePageOn: 'click',
    speed: 300,
    elasticBounds: 1,
    dragHandle: 1,
    dynamicHandle: 1,
  });

  var $frame2 = $('#nonitembased');
  var $wrap2  = $frame2.parent();

  $frame2.sly({
    speed: 300,
    activatePageOn: 'click',
    scrollBar: $wrap2.find('.scrollbar2'),
    scrollBy: 100,
    dragHandle: 1,
    dynamicHandle: 1,
    clickBar: 1,
  });

  $(window).resize(function() {

      var a = 800
        , b = 500
        , ratio = b/a
        ;
      // var w_w = window.innerWidth
      //   , w = w_w - 80
      //   , h = w * ratio
        // console.log($('.prj-capture').width());
        if($('.prj-capture').width() < 800) { 
          var h =  $('.prj-capture').width() * ratio;
          $('.prj-capture > img').css({ 
            'width': $('.prj-capture').width() + 'px',
            'height': h +'px'
          });
        }
        // }else if(w_w > 850){
        //   $('.prj-capture > img').css({ 
        //   'width': '800px',
        //   'height': '500px'
        // });
        // }
    })

});