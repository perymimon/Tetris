/**
 * Created by pery on 04/07/14.
 */
system.register(function display( game, dom, $, settings, effects, animations, _ ) {
    var canvas,ctx
        ,cols, rows
        ,cubeSize
        ,firstRun = true
        ,boardCache
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

    function initCanvas( canvas, clases ){
        var ctx = canvas.getContext('2d');
        dom.addClass( canvas, clases );
        canvas.width = Math.max(cols,rows) * cubeSize ;
        canvas.height = Math.max(cols,rows) * cubeSize;
        ctx.scale( cubeSize, cubeSize );
        ctx.translate(1,0);
        return ctx;
    }


    function createBackground(  ){
        var background = document.createElement('canvas');
        var bgctx = initCanvas( background, 'background board-bg' );
        /*border*/
        bgctx.lineWidth = '.15';
        bgctx.fillStyle = 'rgba(255,255,255,0.6)';
        drawMainBoardBackGround( bgctx );
        drawNextBackGround( bgctx , 12,1);
        return background;
    }

    function drawNextBackGround( bgctx, xs, ys ){
        bgctx.save();
        var width = 5;
        var height = 5;
        bgctx.fillRect( xs, ys, width, height);
        bgctx.strokeRect( xs, ys, width, height);
        bgctx.strokeStyle = 'rgba(20,20,20,0.4)';
        bgctx.lineWidth = '.15';
        bgctx.beginPath();
        for( var x=1; x < width; x++){
            bgctx.moveTo( xs + x, ys );
            bgctx.lineTo( xs + x, ys + height );
        }
        for( var y=1; y < height; y++ ){
            bgctx.moveTo( xs , ys + y );
            bgctx.lineTo( xs + width, ys + y );
        }
        bgctx.stroke();

    }
    function drawMainBoardBackGround( bgctx ){
        bgctx.save();

        bgctx.lineWidth = '.5';


        bgctx.save();
        bgctx.strokeStyle = 'rgba(100,100,100,1)';
        bgctx.beginPath();
        bgctx.moveTo( 0, 0 );
        bgctx.lineTo( 0, rows );
        bgctx.lineTo( cols, rows );
        bgctx.lineTo( cols, 0 );
        bgctx.stroke();
        bgctx.fill();
        bgctx.restore();

        bgctx.strokeStyle = 'rgba(20,20,20,0.4)';

        bgctx.lineWidth = '.15';
//        main board
        bgctx.beginPath();
        for( var x=1; x < cols; x++){
            bgctx.moveTo(x,0);
            bgctx.lineTo(x,rows);
        }
        for( var y=1; y < rows; y++){
            bgctx.moveTo(0,y);
            bgctx.lineTo(cols,y);
        }
        bgctx.stroke();
        bgctx.restore();
    }



    function setup(){
        var boardElement = $('#game-screen .game-board' )[0];
        cols = settings.cols;
        rows = settings.rows;
        var rect = boardElement.getBoundingClientRect();
        cubeSize = rect.width / Math.max(cols,rows);

        canvas = document.createElement('canvas');
        ctx = initCanvas( canvas, "board");
        ctx.imageSmoothingEnabled = false;

        boardElement.appendChild( createBackground() );
        boardElement.appendChild( canvas );
    }

    function moveActivePices( e, next ){
        clearPices( e.before, e.before.x,  e.before.y );
        drawPices( e.after, e.after.x, e.after.y );
        next();
    };

    function rotateActivePices(e, next){
        clearPices( e.before, e.before.x,  e.before.y );
        drawPices( e.after, e.after.x, e.after.y );
        next();
    }

    function removeRows( removed, next ){

        var n = removed.length;
          removed.forEach(function (data, i) {
              var y = data.from;
              var imageData =  ctx.getImageData( 0, y * cubeSize, cubeSize * cols, cubeSize );
              var burnFX = effects.burn( ctx, imageData );
              animations.addCustom( function(){
                  return burnFX.done;
                },{
                  render:function(){
                      ctx.putImageData(burnFX.next(),0, y * cubeSize);
                  },
                  done: function () {
                      console.log('burn effect done');
                      if( --n <=0 ){
                          next();
                      }

                  }
              });
        });
    }

    function movedRow ( moved, next ){

        var n = moved.length;
        moved.forEach(function(data){
              var from = data.from,
                  to = data.to,
                  row = data.row,
                  color;
            animations.addFromTo( from, to, 100, {
                before: function (pos) {
                    for( var x= 0 ; x < row.length; x++ ){
                        clearPicesCube( x, pos );
                    }
                },
                render: function ( pos ) {
                    for( var x= 0 ; x < row.length; x++ ){
                        color = settings.color[ row[x] ];
                        drawPicesCube( x, pos , color);
                    }
                },
                done: function () {
                    if( --n <=0 ){
                        next();
                    }
                }
            })

        });
//        for( var i= 0 ; i< moved.length; i++){
//            var from = moved[i].from;
//            var to = moved[i].to;
//            var row = moved[i].row;
//            for( var x= 0 ; x < row.length; x++ ){
//                clearPicesCube( x, from );
//                drawPicesCube( x,  to, row[x] );
//            }
//        }
//        next();
    }


    function levelUp(callback){

    }
    function explodePieces(pieces, pos, delta){
        var piece,i;
        for( i=0; i<pieces.length; i++){
            piece = pieces[i];

            piece.vel.y += 50 * delta;
            piece.pos.y += piece.vel.y * delta;
            piece.pos.x += piece.vel.x * delta;

            if( piece.pos.x < 0 || piece.pos.x > cols ){
                piece.pos.x = Math.max( 0, piece.pos.x );
                piece.pos.x = Math.min( cols, piece.pos.x );
                piece.vel.x *=-1;
            }

            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.translate( piece.pos.x , piece.pos.y );
            ctx.rotate( piece.rot * pos * Math.PI * 4 );
            ctx.translate( -piece.pos.x , -piece.pos.y );
            drawPicesCube( piece.pos.x -0.5, piece.pos.y -0.5 , piece.color);
            ctx.restore();

        }
    }
    function explode( callback ){
        var pieces = [],
            piece,
            x, y
            ;
        _.forEachMat(boardCache, function (value, x, y) {
            if( value == 0){ return; }
            piece = {
                type: boardCache[x][y],
                color: settings.color[ boardCache[x][y] ],
                pos: {
                    x: x + 0.5,
                    y: y + 0.5
                },
                vel: {
                    x: (Math.random() - 0.5 ) * 20,
                    y: -Math.random() * 10
                },
                rot: (Math.random() - 0.5 ) * 3
            };
            pieces.push( piece );
        });

        animations.addFixedTime(2000, {
            before:function(pos){
                ctx.clearRect(0,0, canvas.width, canvas.height );
            },
            render: function( pos, delta ){
                explodePieces(pieces, pos, delta);

            },
            done:callback
        });

    }

    function gameOver( callback ){
        animations.addFixedTime(1000, {
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
        if(!color) return; // empty cube
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
        boardCache  =board;
        var x, y
            ,colors = settings.color
            ,color
            ;
        ctx.clearRect( 0, 0, cols, rows );

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
        ctx.clearRect( 12, 1, 5, 5 );

        var dx = 12 + (5-next.width) / 2,
            dy = 1 + (5-next.height) / 2
            ;
        drawPices(next, dx, dy);

        // print Active
        var active = picesQueue[0];
        drawPices(active,active.x,active.y);

        callback && callback();
    }




    /* API */
    return {
        initialize: initialize,
        redraw: redraw,
        moveActivePices: moveActivePices,
        rotateActivePices:rotateActivePices,
        removeRows:removeRows,
        movedRow:movedRow,
        pause: pause,
        resume: resume,
        levelUp: levelUp,
        gameOver: gameOver
    }

    function pause(){
        animations.pause();
    }

    function resume(){
        animations.resume();
    }

});

