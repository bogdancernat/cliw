$(document).ready(function(){

  var $frame = $('#effects');
  var $wrap  = $frame.parent();

    $frame.sly({
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
    });

    $wrap.find('.toStart').on('click', function () {
      var item = $(this).data('item');
      // Animate a particular item to the start of the frame.
      // If no item is provided, the whole content will be animated.
      $frame.sly('toStart', item);
    });

    $(document).keydown(function(e){
      if(e.keyCode == 37 ){
        var item = $(this).data('item');
        $frame.sly('prev', item);
      }else if(e.keyCode == 39) {
        var item = $(this).data('item');
        $frame.sly('next', item);
      }
    });

    // To End button
    $wrap.find('.toEnd').on('click', function () {
      var item = $(this).data('item');
      // Animate a particular item to the end of the frame.
      // If no item is provided, the whole content will be animated.
      $frame.sly('toEnd', item);
    });

});