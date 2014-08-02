//upload all modules . good for now
system.register(function () {
    if(system.isStandAlone() ){
        system.loadScript('scripts/dom.js');
        system.loadScript('scripts/screen.splash.js');
        system.loadScript('scripts/input.js');
        system.loadScript('scripts/screen.main-menu.js');
//               if( jewel.hasWebWorker() ){
//                   jewel.preload('scripts/board.worker.js');
//                   jewel.load('scripts/board.worker-interface.js', jewel.setup);
//               }else{
        system.loadScript('scripts/pices.js');
        system.loadScript('scripts/board.js');

//               }
        system.loadScript('scripts/screen.game.js');
        system.loadScript('scripts/util.js');
        system.loadScript('scripts/effects.js');
        system.loadScript('scripts/animations.js');
        system.loadScript('scripts/display.canvas.js');
        system.loadScript('scripts/audio.js');
        system.loadScript('scripts/storage.js');
        system.loadScript('scripts/screen.high-scores.js');
        system.loadScript('scripts/screen.about.js');


    }else{
        system.loadScript("scripts/screen.install.js")
    }
});

/*
    GAME module
*/

system.register(function game( $, dom ){
    var screens ={};

    var setting = system.run(function settings(){
        return {
            rows:20,
            cols:10,
            baseScore:100,
            numJewelTypes:7,
            baseLevelScore: 1500,
            baseLevelTickTime : 500,
            baseLevelExp: 1.05,
            color:{
                1:'rgb(131, 9, 110)',
                2:'rgb(24, 117, 70)',
                3:'rgb(177, 62, 18)',
                4:'rgb(150, 200, 80)',
                5:'rgb(11, 18, 132)',
                6:'rgb(47, 137, 226)',
                7:'rgb(226, 116, 18)'
            },
            controls:{
                //KEYBOARD
                KEY_UP:'rotate'
                ,KEY_DOWN:'fastDown'
                ,KEY_LEFT:'moveLeft'
                ,KEY_RIGHT:'moveRight'
                ,KEY_SPACE:'fastDown'
                // mouse an touch
                ,CLICK:'fastDown'
                ,TOUCH:'move'
                //gamepad
                ,BUTTON_A:'rotate'
                ,BUTTON_B:'fastDown'
                ,LEFT_STICK_UP:''
                ,RIGHT_STICK_DOWN:'fastDown'
                ,RIGHT_STICK_LEFT:'moveLeft'
                ,RIGHT_STICK_RIGHT:'moveRight'

            }
        };
    });



    //setup
    system.deferred(function setup( splash_screen ){

        if( system.isStandAlone() ){
            showScreen("splash-screen");
//            jewel.showScreen("game-screen");
//        }else{
//            jewel.showScreen("install-screen");
        }
        /*make environment fit for application*/
//        if(/Android/.test(navigator.userAgent)){
//            $("html")[0].style.height ="200%";
//            setTimeout(function () {
//                window.scrollTo(0,1);
//            });
//        }
        dom.bind(document,"touchmove", function (event) {
            event.preventDefault();
        });
    });

    function showScreen( screenId ){
        var activeScreen = $("#game .screen.active")[0],
            screen = $('#' + screenId)[0]
        ;
        if( !screens[screenId]){
            alert( screenId +" module is not loaded or implemented yet!");
            return;
        }
        activeScreen && dom.removeClass(activeScreen,"active");
        dom.addClass(screen, "active");
        screens[screenId].run();
    }

    function addScreen(name,control){
        screens[name] = control;
    }


    return {
        addScreen:addScreen,
        showScreen:showScreen,
        screens:{},
        settings:setting
    }
});
