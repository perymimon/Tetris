/**
 * Created by pery on 18/07/14.
 */
system.register( function storage (){
    var db = window.localStorage;

    function set(key, value){
        value = JSON.stringify(value);
        db.setItem(key, value);
    }

    function get(key){
        var value = db.getItem(key);
        try{
            return JSON.parse(value);
        }catch(e) {
            console.error('error when parse localStore key: '+ key);
            return;
        }
    }

    return {
        set:set,
        get:get
    }
});
