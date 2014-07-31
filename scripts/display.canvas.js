/**
 * Created by pery on 04/07/14.
 */
system.register(function display( game, dom, $, settings ) {
    var canvas,ctx
        ,cols, rows
        ,cubeSize
        ,firstRun = true
        ,activePicesX, activePicesY
        ,activePicesTargetX, activePicesTargetY
        ,previousCycle
        ,animations = []
        ,paused

    ;
    function initialize( callback ){
        paused = false;
        if(firstRun){
            setup();
            firstRun = false;
        }
        callback();

    }

    function createBackground(){
        var background = document.createElement('canvas');
        var bgctx = background.getContext('2d');

        dom.addClass( background, 'background');
        background.width = Math.max(cols,rows) * cubeSize ;
        background.height = Math.max(cols,rows) * cubeSize;
        bgctx.scale( cubeSize, cubeSize );

        /*border*/
        bgctx.save();

        bgctx.lineWidth = '.5';
        bgctx.fillStyle = 'rgba(255,255,255,0.6)';
        bgctx.beginPath();
        bgctx.moveTo(0,0);
        bgctx.lineTo(0, rows );
        bgctx.lineTo( cols, rows );
        bgctx.lineTo(cols,0);
        bgctx.fill();
//        bgctx.stroke();
        bgctx.restore();


        bgctx.save();
        bgctx.strokeStyle = 'rgba(20,20,20,0.4)';
        bgctx.lineWidth = '.15';

        for( var x=1; x < cols; x++){
            bgctx.beginPath();
            bgctx.moveTo(x,0);
            bgctx.lineTo(x,rows);
            bgctx.stroke();
        }
        for( var y=1; y < rows; y++){
            bgctx.beginPath();
            bgctx.moveTo(0,y);
            bgctx.lineTo(cols,y);
            bgctx.stroke();
        }
        bgctx.strokeRect(12,2,5,5);

        bgctx.restore();
//        for( var x=0; x<cols; x++){
//
//            for( var y=0; y<rows; y++){
//                var saturation =100- y/rows * 100;
//                if( true ){
//                    bgctx.fillStyle = 'hsla(0,'+saturation+'%,59%,1)';
//                    bgctx.fillRect(
//                        x , y ,
//                        1 , 1
//                    )
//                }
//            }
//        }
        return background;
    }



    function setup(){

        var boardElement = $('#game-screen .game-board' )[0];
        cols = settings.cols;
        rows = settings.rows;

        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');
//        ctx.imageSmoothingEnabled = false;

        dom.addClass(canvas, "board");
        var rect = boardElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        cubeSize = rect.width / Math.max(cols,rows);
        ctx.scale( cubeSize, cubeSize );

        boardElement.appendChild( createBackground() );
        boardElement.appendChild( canvas );

        previousCycle = Date.now();
        requestAnimationFrame(cycle);

    }




    function moveActivePices( e, next ){
        e = e[0]; // just one for now;

//        var velocity = 1; // cube per secound
        clearPices( e.before, e.before.x,  e.before.y );
        drawPices( e.after, e.after.x, e.after.y );
        next();
//        next();
//        activePicesTargetX = e.toX;
//        activePicesTargetY = e.toY;
//        var dx, dy;
//        var lastX, lastY;
//
//        animMoveActivePices = addAnimation(function () {
//            if((activePicesTargetX - lastX) < 0.0001 &&
//               (activePicesTargetY - lastY) < 0.0001){
//                return true;
//            }
//            return false;
//        }, {
//            before : function( pos ){
//                pos = Math.sin( pos * Math.PI / 2 );
//                clearPices( pices, lastX, lastY );
//            },
//            render: function ( pos, diff ){
//                dx = activePicesTargetX - lastX;
//                dy = activePicesTargetY - lastY;
//                pos = Math.sin( pos * Math.PI / 2 );
//                pos = velocity * diff / 1000;
//                var nextX = lastX + dx * pos;
//                var nextY = lastY + dy * pos;
//                lastX = nextX;
//                lastY = nextY;
//                drawPices( pices, nextX, nextY );
//            },
//            done : loop
//        })
    };

    function rotateActivePices(e, next){
        e = e[0]; // just one for now;
        clearPices( e.before, e.before.x,  e.before.y );
        drawPices( e.after, e.after.x, e.after.y );
        next();
    }

    function removeRows( removed, next ){

        for(var i= 0 ; i< removed.length; i++){
            var y = removed[i].from;
            var row = removed[i].row;
            for(var x= 0 ; x< row.length; x++){
                clearPicesCube( x, y );
            }
        }
        next();
    }

    function movedRow ( moved, next ){
        for(var i= 0 ; i< moved.length; i++){
            var from = moved[i].from;
            var to = moved[i].to;
            var row = moved[i].row;
            for( var x= 0 ; x < row.length; x++ ){
                clearPicesCube( x, from );
                drawPicesCube( x,  to, row[x] );
            }
        }
        next();
    }


//    function levelUp(callback){
//            addAnimation(1000,{
//                before:function( pos ){
//                    var j = Math.floor( pos * rows * 2),
//                        x,y
//                    ;
//                    for( y=0, x=j; y<rows; y++, x--){
//                        if(x >= 0 && x <cols ){ //boundary check
//                            clearJewel(x, y);
//                            drawPices( jewels[x][y],x,y);
//                        }
//                    }
//                },
//                render: function( pos ){
//                    var j = Math.floor( pos * rows * 2),
//                        x,y
//                        ;
//                    ctx.save();
//                    ctx.globalCompositeOperation ="lighter";
//                    for( y=0, x=j; y<rows; y++, x--){
//                        if(x >= 0 && x <cols ){ //boundary check
//                            clearJewel(x, y);
//                            drawPices( jewels[x][y],x,y, 1.1);
//                        }
//                    }
//                    ctx.restore();
//
//                },
//                done: callback
//
//            })
//    }
//    function explodePieces(pieces, pos, delta){
//        var piece,i;
//        for( i=0; i<pieces.length; i++){
//            piece = pieces[i];
//
//            piece.vel.y += 50 * delta;
//            piece.pos.y += piece.vel.y * delta;
//            piece.pos.x += piece.vel.x * delta;
//
//            if( piece.pos.x < 0 || piece.pos.x > cols ){
//                piece.pos.x = Math.max(0,piece.pos.x);
//                piece.pos.x = Math.min(cols,piece.pos.x);
//                piece.vel.x *=-1;
//            }
//
//            ctx.save();
//            ctx.globalCompositeOperation = "lighter";
//            ctx.translate(piece.pos.x * cubeSize, piece.pos.y * cubeSize);
//            ctx.rotate( piece.rot * pos * Math.PI * 4 );
//            ctx.translate( -piece.pos.x * cubeSize, -piece.pos.y * cubeSize);
//            drawPices( piece.type, piece.pos.x -0.5, piece.pos.y -0.5 );
//            ctx.restore();
//
//        }
//    }
//    function explode( callback ){
//        var pieces = [],
//            piece,
//            x, y
//            ;
//        for( x=0; x<cols; x++){
//            for( y=0; y<rows; y++){
//                piece = {
//                    type: jewels[x][y],
//                    pos: {
//                        x: x + 0.5,
//                        y: y + 0.5
//                    },
//                    vel: {
//                        x: (Math.random() - 0.5 ) * 20,
//                        y: -Math.random() * 10
//                    },
//                    rot: (Math.random() - 0.5 ) * 3
//                };
//                pieces.push( piece );
//            }
//        }
//        addAnimation(2000, {
//            before:function(pos){
//                ctx.clearRect(0,0, canvas.width, canvas.height );
//            },
//            render: function( pos, delta ){
//                explodePieces(pieces, pos, delta);
//
//            },
//            done:callback
//        });
//
//    }

    function gameOver( callback ){
        addAnimation(1000, {
            render: function ( pos ){
                canvas.style.left = 0.2 * pos *(Math.random() - 0.5)+'em';
                canvas.style.top = 0.2 * pos *(Math.random() - 0.5)+'em';
            },
            done: function(){
                canvas.style.left = "0";
                canvas.style.top = "0";
                explode(callback)
            }
        })
    }





    function pause(){
        paused = true;
    }

    function resume( pauseTime ){

       paused = false;
       for( var i=0; i<animations.length; i++ ){
           animations[i].startTime +=pauseTime;
       }
    }

    function printPices ( pices ){
        var str = "\n\r";
        var rows = pices.width;
        var cols = pices.height;
        for (var y = 0; y < cols; y++) {
            for (var x = 0; x < rows; x++) {
                str += pices.getXY(x,y)+ " ";
            }
            str += "\r\n";
        }

        console.log(str);
    }

    function renderAnimations( time, lastTime){
        var anims = animations.slice(0), //copy list
            n = anims.length,
            animTime,
            anim,
            i
            ;

        // call before() function
        for(i=0; i<n; i++){
            anim = anims[i];
            // last position that used
            anim.fncs.before && anim.fncs.before(anim.pos);
            anim.lastPos = anim.pos;
            if( typeof anim.runTime == 'function' ){
                anim.pos = -1;
            }else{
                // generate new position
                animTime = (lastTime - anim.startTime);
                anim.pos = animTime / anim.runTime;
                anim.pos = Math.max(0, Math.min(1,anim.pos));
            }
        }
        animations = [];
        for( i = 0; i<n; i++){
            anim = anims[i];
            anim.fncs.render( anim.pos, anim.pos - anim.lastPos );
            if( anim.pos == 1){
                anim.fncs.done && anim.fncs.done();
            }else{
                animations.push(anim);
            }

        }
    }
    function cycle(){
        var time = Date.now();
        if( !paused ){
            // hide cursor while animation
//            if(animations.length === 0){
//                renderCursor( time );
//            }
            renderAnimations(time, previousCycle);
        }
        previousCycle = time;
        requestAnimationFrame(cycle);
    }

    function drawPices( pices, dx, dy, scale, rot ){
        var map = pices.map
            ,width = pices.width
            ,height = pices.height
            ,x,y
            ,color = settings.color[pices.type]
            ;

        for(  x = 0; x < width; x++){
            for( y = 0; y < height; y++){
                if( map[x][y] != 0 ){
                    drawPicesCube( dx + x, dy + y, color );
                }
            }
        }

    }
    function clearPices( pices, dx, dy ){
        var map = pices.map
            ,width = pices.width
            ,height = pices.height
            ,x,y
            ;

        for(  x = 0; x < width; x++){
            for( y = 0; y < height; y++){
                if( map[x][y] != 0 ){
                    clearPicesCube( dx + x, dy + y );
                }
            }
        }
    }

    function drawPicesCube( x, y, color){
        ctx.save();
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = 'rgba(100,100,100,0.2)';
        ctx.beginPath();
        ctx.rect(x, y, 1, 1);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = color;
        ctx.fillRect( x, y, 1, 1 );
        ctx.strokeRect( x + 0.15, y + 0.15, 0.7, 0.7 );
        ctx.restore();
    }
    function clearPicesCube( x, y ){
        ctx.save();
        ctx.clearRect( x-0.1, y-0.1, 1.1, 1.1 );
//        ctx.clearRect( x, y, 1, 1 );
        ctx.restore();
    }

    function redraw( board, picesQueue, callback ){
        var x, y
            ,colors = settings.color
            ,color
            ;
        ctx.clearRect(0,0, cols, rows );

        for( x = 0; x < cols; x++){
            for(y=0; y < rows; y++){
                var  type = board[x][y];
                if(type != 0){
                    color  = colors[ type ];
                    drawPicesCube( x, y, color );
                }

            }
        }
        // print Next
        var next = picesQueue[1];
        var dx = 13, dy = 3;
        ctx.clearRect( 12, 2, 5, 5 );
        drawPices(next, dx, dy);

        // print Active
        var active = picesQueue[0];
        drawPices(active,active.x,active.y);

        callback && callback();
    }

    function addAnimation( runTime, fncs){
        var anim = {
            runTime : runTime,
            startTime : Date.now(),
            pos:0,
            fncs: fncs
        };
        animations.push(anim);

        return anim;
    }



    return {
        initialize: initialize,
        redraw: redraw,
//        setCursor: setCursor,
        moveActivePices: moveActivePices,
        rotateActivePices:rotateActivePices,
        removeRows:removeRows,
        movedRow:movedRow,
//        removeJewels: removeJewels,
//        refill: refill,
        pause: pause,
        resume: resume,
//        levelUp: levelUp,
        gameOver: gameOver
    }

});

