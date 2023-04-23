
$(document).ready(function(){
    $(window).scroll(function(){
        var scroll = $(window).scrollTop();
        if (scroll > 300) {
          $(".blue ").css("background" , "black");
          console.log("working");
        }
  
        else{
            $(".blue").css("background" , "transparent");  	
        }
    })
  })
