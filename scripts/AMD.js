/**
 * Created by pery on 26/07/14.
 */
var system = (function(){
    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    var unRunning = {};
    var unRunningAnonymous = [];
    var loaded = {};

    var ROOT;
    //init
    (function () {
        var scripts = document.getElementsByTagName('script');
        for( var i=0; i<scripts.length; i++ ){
            if( scripts[i].src.search('AMD') > -1 ){
                scripts = scripts[i] ;
                break;
            }
        }
        ROOT =  scripts.dataset.root;
        window.addEventListener("load", function () {
            loadScript(ROOT+'/'+scripts.dataset.src+'.js');
        });
    })();

    function add(fn){
        loaded[fn.name] = fn;
        tryRunningEveryone();
    }

    function register(fn,notStore ){
        if(isRunbble( fn )){
            run( fn );
            tryRunningEveryone();
        }else{
            if(fn.name && !notStore){
                unRunning[fn.name]= fn;
            }else{
                //deal with anonymous function
                unRunningAnonymous.push(fn);
            }
        }
        return loaded[fn.name];
    }


    function deferred(fn){
        register(fn,true );// true= not store
    }

    function tryRunningEveryone(){
        var findSomething = false;
        for( var keyName in unRunning){
            var fn = unRunning[keyName];
            if( isRunbble( fn ) ){
                delete  unRunning[keyName];
                findSomething = true;
                run( fn );
                break
            }
        }
        for( var i=0; i<unRunningAnonymous.length; i++){
            var fn = unRunningAnonymous[i];
            if( isRunbble( fn ) ){
                run( fn );
                unRunningAnonymous.splice(i,1);
                findSomething = true;
                i--;
            }
        }

        if(findSomething){
            tryRunningEveryone();
        }
    }



    function run( fn ){
        dependiss = annotate( fn );
        var map = dependiss.map(function (depndedName) {
            return loaded[depndedName];
        });
        if(fn.name){
            return loaded[fn.name] = fn.apply(this,map);
        }else{
           return fn.apply(this,map)
        }

    }

    function isRunbble(fn){
        dependiss = annotate( fn );
        return dependiss.every(function (depndedName) {
            return !!loaded[depndedName]
        });
    }


    function annotate(fn){
        var $inject;
        if (!($inject = fn.$inject)) {
            $inject = [];
            fnText = fn.toString().replace(STRIP_COMMENTS, '');
            argDecl = fnText.match(FN_ARGS);
            if(argDecl[1]){
                argDecl[1].split(FN_ARG_SPLIT).forEach(function(arg){
                    arg.replace(FN_ARG, function(all, underscore, name){
                        $inject.push(name);
                    });
                });
            }
            fn.$inject = $inject;
        }
        return fn.$inject;
    }

/*
*        LOADING SYSTEM
*
* */

    var  scriptQueue = []
        ,numResourcesLoaded = 0
        ,numResources = 0
        ,executeRunning = false;

    function loadScript (src, callback){
        var image,queueEntry
            ;
        numResources++;
        // add this resource to the execution queue
        queueEntry = {
            src: src,
            callback: callback,
            loaded: false
        };
        scriptQueue.push(queueEntry);
        image = new Image();
        image.onload = image.onerror = function(){
            numResourcesLoaded++;
        };
        queueEntry.loaded = true;
        if( !executeRunning){
            executeScriptQueue();
        }
        image.src = src;
    }

    function executeScriptQueue(){
        var next = scriptQueue[0]
            ,first,script;
        if( next && next.loaded ){
            executeRunning = true;
            //remove the first element in the queue
            scriptQueue.shift();
            first = document.getElementsByTagName("script")[0];
            script = document.createElement("script");
            script.onload = function(){
                if ( next.callback ){
                    next.callback();
                }
                // try to execute more scripts
                executeScriptQueue();
            };
            script.src = next.src;
            first.parentNode.insertBefore(script, first);

        } else {
            executeRunning = false;

        }
    }

    function getLoadProgress(){
        return numResourcesLoaded / numResources;
    }

    function preload( src, callback ){
        var image = new Image();
        if(typeof callback === "function"){
            image.addEventListener('load', callback, false);
        }
        image.src = src;
        return image;

    }
/*
* is stand alon
* work only on apple products
* */
    function isStandAlone(){
        return (window.navigator.standalone !== false );
    }

    function hasWebWorkers(){
        return ("Worker" in window);
    }

    return{
        register:register,
        add:add,
        run:run,
        loadScript:loadScript,
        getLoadProgress:getLoadProgress,
        preload: preload,
        cash:loaded,
        isStandAlone:isStandAlone,
        deferred:deferred,
        hasWebWorkers:hasWebWorkers
    }
})();