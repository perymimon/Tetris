/**
 * Created by pery on 02/08/14.
 */
function burnFx2( ctx, imageData ){
    var w = imageData.width;
    var h = imageData.height;
    var isDone = false;
    var nextFrame =   ctx.createImageData(imageData);
    var dataEffect = createMat(w,h, function (x,y) {
        return {
            val: 4 + ~~ (Math.random() * 2),
            neighbors: true
        }
    });
    var edgePoints = [];

    //copy imageData
    for (var i = 0, len =  w*h*4; i < len; i++) {
        nextFrame.data[i] = imageData.data[i];
    }
    // initialize line of start burning
    for (var y  = 0, x = ~~w/2; y < h; y++) {
        dataEffect[x][y].val = 0;
        edgePoints.push([x,y]);
    }
    function burnEdge ( x, y, edgePoints ){
        var points =[
            [x-1,y-1], [x,y-1], [x+1,y-1],  //0,1,2
            [x+1,y],[x+1,y+1],[x-1,y+1],    //7,x,3
            [x,y+1], [x-1,y]                //6,5,4
        ];
        var order = [2,3,4,1,5,0,7,6];

        for (var i = 0; i < order.length; i++) {
            var pos = points[ order[i] ];
            var xx = b(0,pos[0],w-1,true); //not flat
            var yy = b(0,pos[1],h-1,true); //not flat

            // for not make some point twice
            if( xx == null || yy == null ){ continue; }

            if ( dataEffect[xx][yy].val > 0 ) {
                dataEffect[xx][yy].val -= 1;
                if( dataEffect[xx][yy].val  <= 0){
                    burnEdge(xx,yy,edgePoints);
                }
            }
        }
        for ( i = 0; i < order.length; i++) {
            pos = points[ order[i] ];
            xx = b(0,pos[0],w-1,false); //flat
            yy = b(0,pos[1],h-1,false); // flat
            if (  dataEffect[xx][yy].val > 0 ){
                edgePoints.push([x,y]);
                var pix = (xx + yy * w) * 4;
                nextFrame.data[pix] +=  100;
                nextFrame.data[pix + 1] += 0;
                nextFrame.data[pix + 2] += 0;
                nextFrame.data[pix + 2] += 10;
                break;
            }
        }
//            printData(76,0,9,h,function (xx,yy) {
//                return dataEffect[xx][yy].val;
//            });
    }
    function nextBurn(){
        var nextEdgePoints = [];
        var pix;
        edgePoints.forEach(function (point) {
            burnEdge( point[0],point[1], nextEdgePoints )
        });
        forEachMat( dataEffect, function (data,x,y) {
            if (data.val <= 0) {
                pix = (x + y * w) * 4;
                nextFrame.data[pix + 0] -= 10;
                nextFrame.data[pix + 1] -= 50;
                nextFrame.data[pix + 2] -= 50;
                nextFrame.data[pix + 3] -= 15;
            }
        });
        edgePoints = nextEdgePoints;
        if(!edgePoints.length){
            isDone = true;
        }
        return nextFrame;
    }
    return{
        next:nextBurn,
        get done(){
            return isDone;
        }
    }

}