$(document).ready(function(){
  
  $('#create-storyboard').click(function (e){
    var name = $('#new-storyboard').val();
    if(name.length){
      $.post('/create',{name: name}, function (resp){
        console.log(resp);
      });
    }
  });
});