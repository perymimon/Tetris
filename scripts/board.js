/**
 * Created by pery on 29/06/14.
 */

system.register(function board( settings ,Pices) {
    var board
        ,cols = settings.cols
        ,rows = settings.rows
        ,numPicesType = settings.numJewelTypes
        ,baseScore = settings.baseScore
        ,EMPTY_SPACE = 0
        ,picesQueue =[]
        ,_random = Math.random
        ,_floor = Math.floor
        ,_min = Math.min
        ,_max = Math.max
        ;
/*
* level: start from 0
* */
    function initialize(startBoard, level, callback) {
        addPicesToQueue();
        addPicesToQueue();

        if( startBoard ){
            board = startBoard;
        } else {
            fillBoard( level );
        }
        callback && callback();
    }


    function fillBoard( level ) {
        var x, y
            ,rundomPicessUntileNow = 0
            ;
        level = level || 0;
        board = [];
        for (x = 0; x < cols; x++) {
            board[x] = [];
            y = rows;
            while(y--){
                board[x][y] = EMPTY_SPACE;
            }
        }
//        while( level-- ){
//            var pices = Pices.create(); //_random
//            pices.rotate( Math.floor( Math.random() * 4 ) );
//            pices.x = _floor( _random() * (cols-1-pices.width) );
//            movePicesDown( pices, rows );
//
//            addPicesToBoard( pices );
//        }
        /*test*/
        pices = Pices.create(0); //_random
            pices.x = 0;
            pices.y = 18;
        addPicesToBoard( pices );
        pices = Pices.create(0); //_random
            pices.x = 2;
            pices.y = 18;
        addPicesToBoard( pices );
pices = Pices.create(0); //_random
            pices.x = 4;
            pices.y = 18;
        addPicesToBoard( pices );
pices = Pices.create(0); //_random
            pices.x = 6;
            pices.y = 18;
        addPicesToBoard( pices );
pices = Pices.create(1); //_random
            pices.x = 9;
            pices.y = 16;
            pices.rotate(1);

        addPicesToBoard( pices );

        // try again if new board has stacked already
        if( isGameEnd() ){
            fillBoard();
        }
    }

    function isFreeCollision(map0, map1, width, height ){
        for( var x=0; x < width ; x++){
            for( var y=0; y < height ; y++){
                if( map0[x][y] && map1[x][y] )
                    return false
            }
        }
        return true;
    }

    function getMap(dx,dy,width, height){
        var map = [];

        for( var x=0; x < width ; x++){
            map[x] = [];
            for( var y=0; y < height ; y++){
                if( dy+y < 0 || dx+x < 0 || dy+y >= rows || dx+x >= cols){
                    map[x][y] = 0;
                }else{
                    map[x][y] = board[dx+x][dy+y];
                }
            }
        }
        return map;
    }

    function getRow(y,xStart,xEnd){
        var row = [];
        xStart = xStart || 0;
        xEnd = xEnd || cols;
        for(var i= 0,x = xStart ; x < xEnd; x++,i++){
            row[i] = board[x][y];
        }
        return row;
    }

    function getColumn(x,yStart,yEnd){
        var col =[]
            ;
        yStart = yStart || 0;
        yEnd = yEnd || rows;

        for(var i= 0,y = yStart; y<yEnd; y++, i++){
            col[i]= board[x][y];
        }
        return col;
    }

    function getBoard(){
        var copy = [],
            x
            ;
        for( x = 0; x < cols; x++ ){
            copy[x] = board[x].slice(0);
        }
        return copy;
    }

    function getPicesQueue(){
        //return copy
        return picesQueue.map( getPicesCopy );
    }
     function getPicesCopy( pices ){
         return{
             x:pices.x,
             y:pices.y,
             type:pices.type,
             map:pices.map,
             width: pices.width,
             height: pices.height
         }
     }

    function isGameEnd(){
        var isEnd = false;
        for( var x=0; x<cols; x++){
            // there is pices out of board area
            isEnd |= board[x][-1] || board[x][-2]|| board[x][-3];
        }
        return isEnd;
    }

    function addPicesToBoard( pices , events ){
        var x = pices.x
            ,y = pices.y
            ,width
            ,height = pices.height
            ,map = pices.map
            ;
        while(height--){
            width = pices.width;
            while(width--){
                if(  map[width][height] != 0 ){
                    board[x+width][y+height] = map[width][height] * pices.type ;
                }
            }
        }

        events && events.push({
           type:'attach',
           data:{
               pices: getPicesCopy( pices )
           }
        });
        checkRows( events );
//        addPicesToQueue();
    }
    function addPicesToQueue(){
        var newPices = Pices.create();
            newPices.x = _floor( _random() * (cols-1-newPices.width) );
//            newPices.y = -newPices.height;
        newPices.y = 5;
        picesQueue.push( newPices );
    }



    function checkRows( events ){
        var
            events = events || []
            ,gaps = 0
            ,score = 0
            ,removed = [], moved = []
            ,row
            ,rowCompared = [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ],
            isFullRow = function ( row ){
                for( var x = 0, len = row.length; x < len ; x++ ){
                    if ( row[x] <= 0 ) {
                        return false;
                    }
                }
                return true;
            },
            movedRow = function(from , to){
                for( var x= 0 ; x < cols; x++ ){
                    board[x][to] = board[x][from];
                }
            },
            removedRow = function( from ){
                for( var x= 0 ; x < cols; x++ ){
                    board[x][from] = EMPTY_SPACE;
                }
            }
        ;
        for (var y = rows - 1; y >= 0; y--) {
            row = getRow(y,0, cols);
            if( isFullRow( row ) ){ //isFullRow
                gaps++;
                removed.push({
                    row: row,
                    from:y
                });
                removedRow( y );
                score += baseScore * gaps;
            }else if( gaps ){
                moved.push({
                    row: row,
                    from:y,
                    to:y+gaps
                });
                movedRow( y, y + gaps );
            }

        }
        return events.push({
            type: "removeRows",
            data: removed
        }, {
            type: 'score',
            data: score
        }, {
            type: 'moveRows',
            data: moved
        });
    }

    /*move pices*/
    function movePicesSibling(pices, dx ,events ){
        var
             width = pices.width
            ,height = pices.height
            ,picesMap = pices.map
            ,x = pices.x
            ,y = pices.y
            ,boardMap
            ,s = dx.sign()
            ,before = getPicesCopy( pices )
            ;

        dx = _max( 0, _min( x + dx, cols - width ) );
        // there is no move...
        if(x == dx ) return;

        for( ; s<0? x>dx : x<dx  ;x+=s ){
            boardMap = getMap( x+1, y, width, height);
            if( isFreeCollision( boardMap, picesMap, width, height ) ){
                pices.x+=s;
            }
        }

        events && events.push({
            type:'move',
            data:[{
                before: before,
                after: getPicesCopy( pices )
            }]
        });
    }

    function movePicesDown(pices, dy, events ){
        pices.print();
        if( dy < 1){ return; }

        var
            width = pices.width,
            height = pices.height,
            picesMap = pices.map,
            x = pices.x,
            y = pices.y,
            boardMap,
            before = getPicesCopy( pices),
            endBoard = rows - height
            ;
//        dy = Math.min( y + dy , rows - height );
        dy = y+dy;
        for(  ; y < dy ; y++ ){
            boardMap = getMap( x, y+1, width, height);
            if( isFreeCollision( boardMap, picesMap, width, height ) && y < endBoard ){
                pices.y++
            }else{
                events && events.push({
                    type:'move',
                    data:[{
                        before: before,
                        after :  getPicesCopy( pices )
                    }]
                });
                return false; // blocked in the way or out board
            }
        }
        return true; // free move
    }

    function rotatePices( pices, r, events ){
        var width, height, boardMap;
        var x,y;

        var data = {
            before: getPicesCopy( pices)
        };

        pices.rotate( r );
        width = pices.width;
        height = pices.height;
        x = pices.x;
        y = pices.y;
        boardMap = getMap( x, y, width, height);
        if( !isFreeCollision( boardMap, pices.map, width, height ) ){
            pices.rotate( -r );
            return false; // blocked in the way
        }

        data.after = getPicesCopy( pices);
        events.push({
            type:'rotate',
            data:[data]
        });
        return true;
    }

    function moveActivePicesDown( dy, callback ){
        var events = [];
        if( !movePicesDown( picesQueue[0], dy, events ) ){
            addPicesToBoard( picesQueue[0], events );
            picesQueue.shift();
            addPicesToQueue(events);
        }

        callback( events )
    }

    function moveActivePicesSibling( dx, callback ){
        var events = [];

        movePicesSibling( picesQueue[0], dx, events );

        callback( events );
    }

    function rotateActivePices( r, callback ){
        var events = [];
        rotatePices( picesQueue[0], r , events);
        callback(events);
    }

    function print( pices ) {
        var str = "\n\r";
        if(pices){
            var xstart = pices.x - 1;
            var xend = pices.x+pices.width;
            var ystart = pices.y - 1;
            var yend = pices.y + pices.height;
            var map = pices.map;
        }
        for (var y = 0; y < rows; y++) {
            for (var x = 0; x < cols; x++) {
                if( pices
                    && x > xstart && x < xend
                    && y > ystart && y < yend
                    && map[x-xstart-1][y-ystart-1]
                    ){

                    str += 'p' + " ";
                }else{
                    str += board[x][y]+ " ";
                }
            }
            str += "\r\n";
        }

        console.log(str);
    }

return{
    initialize:initialize
    ,moveActivePicesSibling:moveActivePicesSibling
    ,moveActivePicesDown:moveActivePicesDown
    ,rotateActivePices:rotateActivePices
    ,getBoard:getBoard
    ,getPicesQueue:getPicesQueue
    ,print:print
}

});
