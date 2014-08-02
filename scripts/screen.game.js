/**
 * Created by pery on 04/07/14.
 */
/*
* GAME SCREEN
* */
system.register(function game_screen( game, board, display, dom, $, audio, storage, settings, input ){
    var firstRun = true
        ,paused
        ,pieces
        ,pauseStart
/*cnst*/,STORAGE_KEY_GAME_STATE = 'activeGameData'
        ,STORAGE_KEY_LAST_SCORE = 'lastScore'
        ,$pauseOverlay
    ;

    gameState = {};

    function run(){
        if(firstRun){
            setup();
            firstRun = false;
        }
        startGame();
    }

    function startGame( newGame ) {
        newGame = true;
        gameState = {
            level : 0,
            score : 0,
            tickTime: 500
        };

        if( newGame ){
            storage.set(STORAGE_KEY_GAME_STATE,null);
        }else{
            var activeGame = storage.get(STORAGE_KEY_GAME_STATE)
                ,useActiveGame = !!activeGame
            ;
            if( useActiveGame ){
                gameState.level = activeGame.level;
                gameState.score = activeGame.score;
                var startBoard = activeGame.board;
            }
        }
        updateGameInfo();
        board.initialize(startBoard, gameState.level, function () {
            display.initialize(function () {
                display.redraw(board.getBoard(),board.getPicesQueue(), function () {
                    tick();
                    advanceLevel();
                })
            })
        });
        paused = false;
        $pauseOverlay.style.display = 'none';

    }

    function setup(){
        $pauseOverlay =  $('#game-screen .pause-overlay')[0];
        audio.initialize();

        dom.bind('footer button.exit', 'click', exitGame );
        dom.bind('footer button.pause', 'click', pauseGame );
        dom.bind('footer button.reset', 'click', resetGame );
        dom.bind('.pause-overlay', 'click', resumeGame );

        input.initialize();
        input.bind('rotate', rotatePieces );
        input.bind('fastDown', fastDown );
        input.bind('moveLeft', moveLeft );
        input.bind('moveRight', moveRight );
    }


    function tick(){
        if( paused ) return;
        var thisfunc = arguments.callee;
        moveDown();

        thisfunc.timer = setTimeout( tick, gameState.tickTime );
    }

    function playBoardEvents( events ){
        // just in the firstTime
        // because the recursion i don't now if this is the firs time
        if(!events.notFirstTimeRun ){
            saveGameData();
            events.notFirstTimeRun = true;
        }
        if ( events.length> 0){
            var boardEvent = events.shift()
                ,next = function () {
                    playBoardEvents( events );
                }
                ;
            switch(boardEvent.type){
                case 'move':
                    display.moveActivePices( boardEvent.data, next);
                    break;
                case 'moveRows':
                    display.movedRow( boardEvent.data, next);
                    break;
                case 'removeRows':
                    audio.play('match');
                    display.removeRows( boardEvent.data, next);
                    break;
                case 'gameOver':
                    audio.play('gameOver');
                    gameOver();

                    break;
                case 'refill':
                    announce('No moves!');
                    display.refill( boardEvent.data, next);
                    break;
                case 'rotate':
                    display.rotateActivePices(boardEvent.data, next);
                    break;
                case 'score' :
                    addScore( boardEvent.data );
                    next();
                    break;
                case 'badswap':
                    audio.play('badswap');
                    next();
                    break;
                default :
                    next();
                    break;
            }

        }else{
            display.redraw(board.getBoard(),board.getPicesQueue(), function () {
                //good to go again
            })
        }
    }

    function movePieces(dx,dy){
        if( paused ) {
            return;
        }
        var x = piceces.x + dx;
        if( x>=0 && (x+piceces.width) < settings.cols ){
            board.movePieces(dx,dy);
        }

    }

    function moveUp(){

    }
    function moveDown(){
        board.moveActivePicesDown( 1, playBoardEvents );
    }
    function moveLeft(){
        board.moveActivePicesSibling( -1, playBoardEvents );
    }
    function moveRight(){
        board.moveActivePicesSibling( 1 , playBoardEvents );
    }
    function rotatePieces(){
        board.rotateActivePices( 1 , playBoardEvents );
    }
    function fastDown(){
        board.moveActivePicesDown(1, playBoardEvents );
    }

    function updateGameInfo(){
        $('#game-screen .score span')[0].innerHTML = gameState.score;
        $('#game-screen .level span')[0].innerHTML = gameState.level;
        $('#game-screen .nextLevel span')[0].innerHTML = gameState.nextLevelAt;
    }


      function exitGame(){
        pauseGame();
        saveGameData();
        game.showScreen('main-menu');
    }

    function pauseGame() {
        if(paused){
            return;
        }
        $pauseOverlay.style.display = 'block';
        paused = true;
        pauseStart = Date.now();
        clearTimeout( tick.timer );
        gameState.timer = 0;
        display.pause();
    }

    function resumeGame(){
        $pauseOverlay.style.display = 'none';
        paused = false;
        var pauseTime = Date.now()  -  pauseStart;
        gameState.startTime += pauseTime;
        display.resume( pauseTime );
        tick();

    }

    function addScore( points ){

        gameState.score += points;
        if( gameState.score >= gameState.nextLevelAt ){
            advanceLevel();
        }else{
            updateGameInfo();
        }
    }

    function advanceLevel(){
        gameState.nextLevelAt = ~~Math.pow(
            settings.baseLevelScore,
            Math.pow( settings.baseLevelExp, gameState.level-1)
        );
        audio.play('levelUp');
        gameState.level++;
        announce('Level ' + gameState.level );
        var level = gameState.level;
        gameState.tickTime = settings.baseLevelTickTime * Math.pow( level, -0.05 * level );
        updateGameInfo();
        display.levelUp();

    }

    function announce( str ){
        var element = $('#game-screen .announcement')[0]
            ;
        element.innerHTML = str;
        dom.removeClass( element, 'zoomfade');
        setTimeout(function () {
            dom.addClass( element, 'zoomfade');
        },1);
    }

    function gameOver(){
        clearTimeout( tick.timer );
        tick.timer = 0;
        paused = true;
        audio.play(STORAGE_KEY_GAME_STATE,'gameover');
        storage.set(STORAGE_KEY_GAME_STATE,null);
        storage.set(STORAGE_KEY_LAST_SCORE, gameState.score);
        display.gameOver(function () {
                announce(' Game Over');
                setTimeout(function () {
                    game.showScreen('high-scores');
                },2500);
            }
        );

    }

    function saveGameData(){
        storage.set(STORAGE_KEY_GAME_STATE,{
            level : gameState.level,
            score : gameState.score,
            time : Date.now() - gameState.startTime,
            levelDuration : gameState.levelDuration,
            jewels : board.getBoard()
        })
    }

    function restoreGameData(){
        var activeGameObject = storage.get(STORAGE_KEY_GAME_STATE)
            ;
            gameState.level = activeGameObject.level;
            gameState.score = activeGameObject.score;
            gameState.levelDuration = activeGameObject.levelDuration;
            gameState.startTime = Date.now() -  activeGameObject.time;
            startJewels = activeGameObject.jewels;

    }

    function resetGame (){
        gameState.level = 0;
        startGame(true);

    }

    game.addScreen('game-screen',{
        run:run
    });

    return {};

});
