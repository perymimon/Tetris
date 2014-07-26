/**
 * Created by pery on 28/06/14.
 */
system.register(function main_menu( game, dom){

        firstRun = true
        ;

    function setup(){
        dom.bind("#main-menu ul.menu", "click", function(e){
            if(e.target.nodeName.toLowerCase() === "button"){
                var action = e.target.getAttribute("name");
                game.showScreen(action);
            }
        })
    }

    function run(){
        if(firstRun){
            setup();
            firstRun = false;
        }
    }

    game.addScreen('main-menu',{
        run: run
    });

    return {}
});

