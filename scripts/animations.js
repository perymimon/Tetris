/**
 * Created by pery on 01/08/14.
 */
system.register(function animations(){
    var animations = []
        ,paused = false
        ,previousCycle =  Date.now();
        ;

    function renderAnimations(time, lastTime){
        var anims = animations.slice(0), //copy list
            n = anims.length
        ;

        for (var i = 0; i < n; i++) {
            var anim = anims[i];
            switch (anim.type){
                case 'fixedTime':
                    // last position that used
                    anim.fncs.before && anim.fncs.before(anim.pos);
                    anim.lastPos = anim.pos;
                    // generate new position
                    animTime = (lastTime - anim.startTime);
                    anim.pos = animTime / anim.runTime;
                    anim.pos = Math.max(0, Math.min(1,anim.pos));
                    break;
                case 'fromTo':
                    // last position that used
                    anim.fncs.before && anim.fncs.before(anim.pos);
                    anim.lastPos = anim.pos;
                    // generate new position
                    animTime = (lastTime - anim.startTime);
                    anim.pos = animTime / anim.runTime;
                    anim.pos = Math.max(0, Math.min(1,anim.pos));
                    //continue calculation above
                    anim.pos = anim.from + (anim.to - anim.from) * anim.pos;
                    break;

                case 'custom':
                    anim.fncs.before && anim.fncs.before();
                    break;



            }


        }
        animations = [];
        for ( i = 0; i < n; i++) {
            var anim = anims[i];
            switch (anim.type){
                case 'fixedTime':
                    anim.fncs.render( anim.pos, anim.pos - anim.lastPos );
                    if( anim.pos == 1){
                        anim.fncs.done && anim.fncs.done();
                    }else{
                        animations.push(anim);
                    }
                    break;
                case 'custom':
                    anim.fncs.render();
                    if( anim.checkDone() ){
                        anim.fncs.done && anim.fncs.done();
                    }else{
                        animations.push(anim);
                    }
                break;
                case 'fromTo':
                    anim.fncs.render( anim.pos );
                    if( anim.pos == anim.to){
                        anim.fncs.done && anim.fncs.done();
                    }else{
                        animations.push(anim);
                    }
                    break;
            }

        }
    }
    function addFromToAnimation( from, to, runTime, fncs ){
        var anim = {
            type:'fromTo',
            from:from,
            to:to,
            runTime:runTime,
            startTime : Date.now(),
            pos:0,
            fncs: fncs
        };
        animations.push(anim);
    }

    function addCustomAnimation( checkDone, fncs ){
        var anim = {
            type:'custom',
            checkDone:checkDone,
            startTime : Date.now(),
            fncs: fncs
        };
        animations.push(anim);
    }


    function addFixedTimeAnimation( runTime, fncs ){
        var anim = {
            type:'fixedTime',
            runTime : runTime,
            startTime : Date.now(),
            pos:0,
            fncs: fncs
        };
        animations.push(anim);
    }


    function cycle(){
        var time = Date.now();
        if( !paused ){
           renderAnimations(time, previousCycle);
        }
        previousCycle = time;
        requestAnimationFrame(cycle);
    }

    function paused(){
        paused = true;
    }

    function resume( pauseTime ){

        paused = false;
        for( var i=0; i<animations.length; i++ ){
            animations[i].startTime +=pauseTime;
        }
    }

    requestAnimationFrame( cycle );

return {
    addFixedTime:addFixedTimeAnimation,
    addCustom:addCustomAnimation,
    addFromTo:addFromToAnimation,
    paused: paused,
    resume:resume
}

});
