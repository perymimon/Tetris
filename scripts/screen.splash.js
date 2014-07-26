system.register(function splash_screen( game, $, dom, game_screen){
    var firstRun = true;

    function checkProgress(){
        var  p = system.getLoadProgress() * 100;
        $("#splash-screen .indicator")[0].style.width = p + '%';
        if( p == 100 ){
            setup();
            game.showScreen("game-screen"); // for debuge
        }else{
            setTimeout( checkProgress, 30);
        }
    }

    function setup(){
        var screen = $("#splash-screen")[0];

        $(".continue", screen)[0].style.display = "block";
        dom.bind(screen, "click", function(){
            game.showScreen("main-menu");
        })
    }



    function run(){
        if(firstRun){
            checkProgress();
            firstRun = false;
        }
    }
    game.addScreen("splash-screen",{
        run:run
    });

    return {}
});
