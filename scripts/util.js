/**
 * Created by pery on 02/08/14.
 */
system.register(function _(){

    function createMat (width, height, initFun){
        var mat = [];
        for (var x = 0; x < width; x++) {
            mat[x] = [];
            for (var y = 0; y < height; y++) {
                mat[x][y] = initFun ? initFun(x,y) : 0;
            }
        }
        return mat;
    }
    function b/*boundaries*/(min,val,max, notFlat ){
        if(notFlat){
            val = (val < min || val > max)? null: val
        }else{
            val = _min( _max(0,val),max);
        }
        return val
    }

    function printData ( xs, ys, w, h, data){
        var str = '';
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                str += data( x+ xs, y + ys )+' ';
            }
            str +='\n\r';
        }
        console.log(str);
    }
    function forEachMat( mat, callback){
        var w =  mat.length;
        var h,j;
        for (var i = 0; i < w; i++) {
            for( h = mat[i].length, j = 0 ; j < h; j++){
                callback( mat[i][j], i, j )
            }

        }

    }

   return{
      createMat:createMat,
       b:b,
       printData:printData,
       forEachMat:forEachMat
   }

});
