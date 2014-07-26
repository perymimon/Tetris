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
        ,random = Math.random
        ,floor = Math.floor
        ;
/*
* level: start from 0
* */
    function initialize(startBoard, level, callback) {
        activePices = Pices.create();
        activePices.x = floor( random() * cols );
        activePices.y = -activePices.height;

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
        while(level--){
            var pices = Pices.create(); //random
            pices.rotate( Math.floor( Math.random() * 4 ) );
            bottomDownPices(pices);
        }
        // try again if new board has stacked already
        if( isGameEnd() ){
            fillBoard();
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

    function bottomDownPices(pices){
        //todo:reimplemt that
        var steps = rows;
        var steps =  checkMoveDown(pices, steps);
        pices.y = steps;
        addPicesToBoard( pices );
    }

    function checkPicesBlocked (){
        //todo: check if necessary

        var map = activePices.getMap()
            ,x = activePices.x
            ,y = activePices.y
            ,width = activePices.width
            ,height = activePices.height
            ,picesRow
            ,boardSlice

            ;
        while(height--){ // start from height-1
            picesRow = activePices.getRow( height );
            boardSlice = getRow(y + height + 1, x, x+width );
            x= width;
            while(x--){
                if( picesRow[x] && boardSlice[x] ){
                    return true
                }
            }
        }
        return false;
    }

    function addPicesToBoard(pices){
        var x = pices.x
            ,y = pices.y
            ,width
            ,height = pices.height
            ,map = pices.map
            ;
        while(height--){
            width = pices.width;
            while(width--){
                board[x+width][y+height] = map[width][height]
            }
        }
        checkForFullRows();
        addPicesToQueue();
    }
    function addPicesToQueue(){
        var newPices = Pices.create();
            newPices.x = Math.floor( Math.random() * (cols-1) );
            newPices.y = -newPices.height;
        picesQueue.push( newPices );
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

    function checkForFullRows(){
        var
            events = events || []
            ,gaps = 0
            ,score = 0
            ,removed = [], moved = []
            ;
        for (var y = rows - 1; y >= 0; y--) {
            var isFullRow = true;
            for( var x = 0; x < cols; x++ ){
                if ( board[x][y] == 0 ) {
                    isFullRow = false;
                    break;
                }
            }
            if( isFullRow ){
                gaps++;
                removed.push({
                    row: y
                });
                score += baseScore * gaps;
            }else if( gaps ){
                moved.push({
                    fromRow:y
                    ,toRow:y+gaps
                })
            }

        }
        return events.push({
            type: "remove",
            data: removed
        }, {
            type: 'score',
            data: score
        }, {
            type: 'move',
            data: moved
        });
    }

    /*
     * create a copy of the jewel board
     * */
    function getBoard(){
        var copy = [],
            x
            ;
        for( x = 0; x < cols; x++ ){
            copy[x] = board[x].slice(0);
        }
        return copy;
    }

    function checkMoveSibling(pices, steps){
        var width = pices.width
            ,height = pices.height
            ,map = pices.map
            ,x = pices.x
            ,y = pices.y
            ,bX,pX
            ,sign = (n >> 31) + (n > 0)
            ;
        if( (x + width + steps > cols) || (x + steps < 0) ){
            return false;
        }

        if( steps < 0){
            bX = x + steps;
            pX = 0;
        }else{
            bX = x + width + steps;
            pX = width -1;
        }

        do{
            var boardCol = board[bX].slice(y,y+height)
                ,picesCol = map[pX]
                ,dy = 0
                ;

            while((dy++) ^ height ){
                if( boardCol[dy] && picesCol[dy] ){
                    return false;
                }
            }
            bX+=sign;
            pX+=sign;
        }while( steps-- );

        return true;
    }

    function checkMoveDown(pices, steps){
        var width = pices.width
            ,height = pices.height
            ,picesRow = pices.getRow(height-1)
            ,x = pices.x
            ,board_y = pices.y + height
            ,boardSlice
            ;

        pices.print();
        var  destination = Math.min( steps+board_y, rows );
        while( board_y < destination ){
            boardSlice = getRow(board_y , x, x+width );
            for(x=width; x>0; x--){
                if( boardSlice[x] && picesRow[x] ) {
                    return board_y-height;
                }
            }
            board_y++;
        }
        //availableSteps
        return board_y-height;

    }

    /*move pices*/
    function movePicesSibling(dx){
        var activePices = picesQueue[0];
        // x movement
        var x = 0;
        while(x++ < dx){
            if(checkMoveSibling(x)){
                activePices.x++;
            }else{
                break
            }
        }
    }
     function movePicesDown(dy){
         var activePices = picesQueue[0];
        // y movement
        if( dy < 1){
            return;
        }
        var y = 1;
        while(y++ < dy){
            if(checkMoveDown(y)){
                activePices.y++;
            }else{
                addPicesToBoard( activePices )
            }
        }
    }

    function print() {
        var str = "\n\r";
        for (var y = 0; y < rows; y++) {
            for (var x = 0; x < cols; x++) {
                str += board[x][y]+ " ";
            }
            str += "\r\n";
        }

        console.log(str);
    }

return{
    initialize:initialize
    ,movePicesSibiling:movePicesSibling
    ,movePicesDown:movePicesDown
    ,getBoard:getBoard
    ,print:print
}

});
