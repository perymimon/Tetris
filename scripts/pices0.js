/**
 * Created by pery on 21/07/14.
 */
system.register(function Pices () {
    var piecesTypes = [];
  piecesTypes[0] = {
        type:7,width:2, height:2
        ,map:[
             [1,1]
            ,[1,1]
        ]
    };

    piecesTypes[1] = {
        type:1,width:4, height:1
        ,map:[
            [1,1,1,1]
        ]
    };

    piecesTypes[2] = {
        type:2,width:3, height:2
        ,map:[
            [1,0,0]
            ,[1,1,1]
        ]
    };

    piecesTypes[3] = {
        type:3,width:3, height:2
        ,map:[
             [0,0,1]
            ,[1,1,1]
        ]
    };

    piecesTypes[4] = {
        type:4,width:3, height:2
        ,map:[
             [0,1,0]
            ,[1,1,1]
        ]
    };

    piecesTypes[5] = {
        type:5,width:3, height:2
        ,map:[
            [1,1,0]
            ,[0,1,1]
        ]
    };

    piecesTypes[6] = {
        type:6, width:3, height:2
        ,map:[
             [0,1,1]
            ,[1,1,0]
        ]
    };

    function createPicess( number ){
        if (number >piecesTypes.length){
            throw new Error('there is no pices from type:' + number);
        }
        number  =  number != void 0? number : Math.floor( Math.random() * (piecesTypes.length-1) );
        var picecsType = piecesTypes[number];
        return Object.create(methods, {
            type: {writable:false, configurable:false, value: picecsType.type }
            ,index:{writable:false, configurable:false, value: number }
            ,width: {configurable:false, get: function () {
                return (this.rotation % 2)?
                    picecsType.height : picecsType.width ;
            }
            }
            ,height: {configurable:false, get:function(){
                return (this.rotation % 2)?
                    picecsType.width : picecsType.height;
            }
            }
            ,x: {writable:true, configurable:false, value: 0}
            ,y: {writable:true, configurable:false, value: 0 }
            ,rotation:{writable:true, configurable:false, value: 0 }

        }) ;
    }

    var methods = {
        getXY:function(x,y){
            var
                map = piecesTypes[this.index].map
                ,rotate = this.rotation % 4
                ,width = piecesTypes[this.index].width - 1
                ,height = piecesTypes[this.index].height - 1
                ;
            switch ( rotate ){
                case 0: // 0 deg
                    return map[y][x]
                case 1: // 90 deg
                    return map[height-x][y];
                case 2: // 180 deg
                    return map[height-y][width-x];
                case 3: // 270 deg
                    return map[x][width-y];
            }
        }
        ,get map(){
            var
                width = this.width
                ,height = this.height
                ,returnMap = []

            for( var x=0; x < width; x++ ){
                 var col = [];
                for(var y=0; y< height; y++ ){
                    col[y] = this.getXY(x,y);
                }
                returnMap[x] = col;
            }
            return returnMap;
        }
        ,getRow:function(y){
            var row = []
                ,width = this.width
                ;

            for( var x=0; x < width ; x++ ){
                 row[x] = this.getXY(x,y);
            }
            return row;

        }
        ,getColumn:function(x){
            var col = []
                ,height = this.height
                ;

            for( var y=0; y < height; y++ ){
                row[y] = this.getXY(x,y);
            }
            return col;
        }
        ,rotateRight:function(){
            this.rotation = (this.rotation+1) % 4;
        }
        ,rotateLeft:function(){
            this.rotation = (this.rotation+3) % 4; //is like -1
        },
        rotate:function(num){
            this.rotation = (this.rotation + num) % 4; //is like -1
        },
        print:function(){
            var str = "\n\r";
            var rows = this.width;
            var cols = this.height;
            for (var y = 0; y < cols; y++) {
                for (var x = 0; x < rows; x++) {
                    str += this.getXY(x,y)+ " ";
                }
                str += "\r\n";
            }

            console.log(str);
        }


    }

    return {
        create:createPicess
    }

});
