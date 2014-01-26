$(document).ready(function($) {
  $("a[href='#signup']").on('click', function(){
    $('.slideForms').toggleClass('formTransition');
  });
  $("a[href='#signin']").on('click', function(){
    $('.slideForms').toggleClass('formTransition');
  });
});