/**
 * Created by pery on 29/06/14.
 */
jewel.board = (function () {
    var settings
        ,board
        ,cols
        ,rows
        ,baseScore
        ,numPicesType
        ,piecesTypes
        ,EMPTY_SPACE = 0
        ,activePices
        ,Pices = jewel.Pices

        ;

    function initialize(startBoard,level, callback) {
        settings = jewel.settings;
        numPicesType = settings.numJewelTypes;
        baseScore = settings.baseScore;
        cols = settings.cols;
        rows = settings.rows;
        initializePices();
        if(startBoard){
            board = startBoard;
        } else {
            fillBoard( level );
        }
        callback && callback();
    }

    function fillBoard( level ) {
        var x, y, type
            ,rundomPicessUntileNow = 0
            ;
        board = [];
        for (x = 0; x < cols; x++) {
            board[x] = [];
            for (y = rows-1; y > rows-level; y--) {
                board[x][y] = EMPTY_SPACE;
            }
        }
        while(level--){
            var pices = Pices.create(); //random
                pices.rotate( Math.random() * 4 );
            downPices();
        }
        // try again if new board has no moves
        if( !endGame() ){
            fillBoard();
        }
    }












    //returns the number jewels in the longest chain
    //that includes (x,y)
    function checkChain(x, y) {
        var type = getJewel(x, y),
            left = 0, right = 0,
            up = 0, down = 0
            ;
        //look right
        while (type === getJewel(x + right + 1, y)) {
            right++;
        }
        // look left
        while (type === getJewel(x - left - 1, y)) {
            left++;
        }
        //look up
        while (type === getJewel(x, y + up + 1)) {
            up++;
        }
        //look dowen
        while (type === getJewel(x, y - down - 1)) {
            down++;
        }

        return Math.max(left + 1 + right, up + 1 + down);
    }

    /*
     * return true if (x1,y1) can be swapped with (x2,y2)
     * */
    function canSwap(x1, y1, x2, y2) {
        var type1 = getJewel(x1, y1),
            type2 = getJewel(x2, y2),
            chain
            ;
        if (!isAdjacent(x1, y1, x2, y2)) {
            return false;
        }

        //temporarily swap jewels
        board[x1][y1] = type2;
        board[x2][y2] = type1;

        chain = ( checkChain(x2, y2) > 2 || checkChain(x1, y1) > 2 );

        //swap back
        board[x1][y1] = type1;
        board[x2][y2] = type2;

        return chain;

    }

    /*
     *  return true if (x1,y1) is adjacent to (x2,y2)
     * */
    function isAdjacent(x1, y1, x2, y2) {
        var dx = Math.abs(x1 - x2),
            dy = Math.abs(y1 - y2)
            ;
        return (dx + dy === 1);
    }

    function print() {
        var str = "\n\r";
        for (var y = 0; y < rows; y++) {
            for (var x = 0; x < cols; x++) {
                str += getJewel(x, y) + " ";
            }
            str += "\r\n";
        }

        console.log(str);
    }

    function getChains() {
        var x, y
        chains = []
        ;
        for (x = 0; x < cols; x++) {
            chains[x] = [];
            for (y = 0; y < rows; y++) {
                chains[x][y] = checkChain(x, y);
            }
        }

        return chains;
    }







    /*
     * return true if (x,y) is a valid position and if the jewel
     * at (x,y) can be swapped with a neighbor
     * */
    function canJewelMove(x, y) {
        return (
                ( x > 0 && canSwap(x, y, x - 1, y)) ||
                ( x < cols - 1 && canSwap(x, y, x + 1, y)) ||
                ( y > 0 && canSwap(x, y, x, y - 1)) ||
                ( y < rows - 1 && canSwap(x, y, x, y + 1))
            );
    }

    //if possible, swaps (x1,x2) and (x2,y2) and
    // calls the callback function eith list of board events
    function swap(x1, y1, x2,y2, callback ){

        var tmp, swap1, swap2,
            events = []
        ;
        swap1 = {
            type: 'move',
            data:[{
                type: getJewel(x1, y1),
                fromX:x1, fromY: y1,
                toX:x2, toY:y2
            },{
                type: getJewel(x2, y2),
                fromX:x2, fromY: y2,
                toX:x1, toY:y1
            }]
        };

        swap2 = {
            type: 'move',
            data:[{
                type: getJewel(x2, y2),
                fromX:x1, fromY: y1,
                toX:x2, toY:y2
            },{
                type: getJewel(x1, y1),
                fromX:x2, fromY: y2,
                toX:x1, toY:y1
            }]

        };
        if( isAdjacent(x1, y1, x2, y2)){

            if(canSwap(x1, y1, x2, y2)){
                events.push(swap1);
                tmp = getJewel(x1,y1);
                board[x1][y1] = getJewel(x2,y2);
                board[x2][y2] = tmp;
                events = events.concat( check() );
            }else{
                events.push({type:'badswap'},swap1,swap2 );
            }
            callback( events );
        }
    }

    /* jewel function go here */
    return {
        initialize: initialize,
        print: print,
        canSwap: canSwap,
        getBoard: getBoard,
        swap: swap
    }
})();
