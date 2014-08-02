/**
 * Created by pery on 01/08/14.
 */

system.register(function effects( _ ){
    var
        _max = Math.max,
        _min = Math.min
        ;

    function burnFx( ctx, imageData){
        var w = imageData.width;
        var h = imageData.height;
        var isDone = false;
        var nextFrame =   ctx.createImageData(imageData);
        var dataEffect = _.createMat(w,h, function ( x, y ) {
            return {
                val: 1+ ~~ (Math.random() * 3),
                neighbors: true
            }
        });
        //copy imageData
        for (var i = 0, len =  w*h*4; i < len; i++) {
            nextFrame.data[i] = imageData.data[i];
        }
        // initialize line of start burning
        for (var y  = ~~h/2, x = 0 ; x < w; x++) {
            dataEffect[x][y].val = 0;
        }

        function burnEdge( x , y ){
            var neighbors = false;
            var points =[
                [x-1,y-1], [x,y-1], [x+1,y-1],  //0,1,2
                [x+1,y],[x+1,y+1],[x-1,y+1],    //7,x,3
                [x,y+1], [x-1,y]                //6,5,4
            ];
            var order = [2,3,4,1,5,0,7,6];
            for (var i = 0; i < order.length; i++) {
                var pos = points[ order[i] ];
                var xx = _.b(0,pos[0],w-1,true); //not flat
                var yy = _.b(0,pos[1],h-1,true); //not flat

                // for not make some point twice
                if( xx == null || yy == null ){ continue; }

                var val = dataEffect[xx][yy].val;
                if (  val > 0 ) {
                    neighbors = true;
                    val -= 1;
                    //colored edge
                    var pix = (xx + yy * w) * 4;
                    nextFrame.data[pix] +=  20;
                    nextFrame.data[pix + 1] += 0;
                    nextFrame.data[pix + 2] += 0;
                    nextFrame.data[pix + 2] += 1;
                }
                dataEffect[xx][yy].nextVal = val;
            }
            if (!neighbors) {
                dataEffect[x][y].neighbors = false;
            }
        }

        function nextBurn(){
            var pix = null;
            isDone = true;

            _.forEachMat(dataEffect, function (data,x,y) {
                data.nextVal = data.val;
            });
            //burn Edges
            _.forEachMat(dataEffect, function (data,x,y) {
                if (data.val <= 0 ){
                    if( dataEffect[x][y].neighbors) {
                        burnEdge(x, y);
                    }
                } else {
                    isDone = false;
                }
            });
            _.forEachMat(dataEffect, function (data,x,y) {
                data.val = data.nextVal;
                if (data.val <= 0) {
                    pix = (x + y * w) * 4;
                    nextFrame.data[pix + 0] -= 10;
                    nextFrame.data[pix + 1] -= 50;
                    nextFrame.data[pix + 2] -= 50;
                    nextFrame.data[pix + 3] -= 15;
                }
            });
//            _.printData(76,0,9,h,function (xx,yy) {
//                return dataEffect[xx][yy].val;
//            });

            return nextFrame;
        }

        return{
            next:nextBurn,
            get done(){
                return isDone;
            }
        }

    }

    /*API*/
    return {
        burn:burnFx
    };

    /*UTIL*/

});