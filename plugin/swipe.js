(function( $, window, undefined ) {
    var support = {
        touch: "ontouchend" in document
    };

    var $document = $( document ),
        supportTouch = support.touch,
        touchStartEvent = supportTouch ? "touchstart" : "mousedown",
        touchStopEvent = supportTouch ? "touchend" : "mouseup",
        touchMoveEvent = supportTouch ? "touchmove" : "mousemove";

    // setup new event shortcuts
    $.each("swipe swipeleft swiperight".split( " " ), function( i, name ) {

        $.fn[ name ] = function( fn ) {
            return fn ? this.bind( name, fn ) : this.trigger( name );
        };
    });

    function triggerCustomEvent( obj, eventType, event ) {
        var originalType = event.type;
        event.type = eventType;
        $.event.dispatch.call( obj, event );
        event.type = originalType;
    }

    // also handles swipeleft, swiperight
    $.event.special.swipe = {
        scrollSupressionThreshold: 30, // More than this horizontal displacement, and we will suppress scrolling.

        durationThreshold: 1000, // More time than this, and it isn't a swipe.

        horizontalDistanceThreshold: 30,  // Swipe horizontal displacement must be more than this.

        verticalDistanceThreshold: 75,  // Swipe vertical displacement must be less than this.

        start: function( event ) {
            var data = event.originalEvent.touches ?
                    event.originalEvent.touches[ 0 ] : event;
            return {
                        time: ( new Date() ).getTime(),
                        coords: [ data.pageX, data.pageY ],
                        origin: $( event.target )
                    };
        },

        stop: function( event ) {
            var data = event.originalEvent.touches ?
                    event.originalEvent.touches[ 0 ] : event;
            return {
                        time: ( new Date() ).getTime(),
                        coords: [ data.pageX, data.pageY ]
                    };
        },

        handleSwipe: function( start, stop, thisObject, origTarget ) {
            if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
                Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
                Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {
                var direction = start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight";

                triggerCustomEvent( thisObject, "swipe", $.Event( "swipe", { target: origTarget, swipestart: start, swipestop: stop }) );
                triggerCustomEvent( thisObject, direction,$.Event( direction, { target: origTarget, swipestart: start, swipestop: stop } ) );
                return true;
            }
            return false;

        },

        setup: function() {
            var thisObject = this,
                $this = $( thisObject );

            $this.bind( touchStartEvent, function( event ) {
                var stop,
                    start = $.event.special.swipe.start( event ),
                    origTarget = event.target,
                    emitted = false;

                function moveHandler( event ) {
                    if ( !start ) {
                        return;
                    }

                    stop = $.event.special.swipe.stop( event );
                    if ( !emitted ) {
                        emitted = $.event.special.swipe.handleSwipe( start, stop, thisObject, origTarget );
                    }
                    // prevent scrolling
                    if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
                        event.preventDefault();
                    }
                }

                $this.bind( touchMoveEvent, moveHandler )
                    .one( touchStopEvent, function() {
                        emitted = true;
                        $this.unbind( touchMoveEvent, moveHandler );
                });
            });
        },

        teardown: function() {
            $( this ).unbind( touchStartEvent ).unbind( touchMoveEvent ).unbind( touchStopEvent );
        }
    };
    $.each({
        swipeleft: "swipe",
        swiperight: "swipe"
    }, function( event, sourceEvent ) {

        $.event.special[ event ] = {
            setup: function() {
                $( this ).bind( sourceEvent, $.noop );
            },
            teardown: function() {
                $( this ).unbind( sourceEvent );
            }
        };
    });

})( jQuery, this );