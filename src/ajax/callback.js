/**
 * Class: jaxon.ajax.callback
 */

(function(self, config) {
    /*
    Create a timer to fire an event in the future.
    This will be used fire the onRequestDelay and onExpiration events.

    Parameters:

    iDelay - (integer):  The amount of time in milliseconds to delay.

    Returns:

    object - A callback timer object.
    */
    const setupTimer = (iDelay) => ({ timer: null, delay: iDelay });

    /*
    Function: jaxon.ajax.callback.create

    Create a blank callback object.
    Two optional arguments let you set the delay time for the onResponseDelay and onExpiration events.

    Returns:

    object - The callback object.
    */
    self.create = (responseDelayTime, expirationTime) => ({
        timers: {
            onResponseDelay: setupTimer(responseDelayTime ?? config.defaultResponseDelayTime),
            onExpiration: setupTimer(expirationTime ?? config.defaultExpirationTime),
        },
        onPrepare: null,
        onRequest: null,
        onResponseDelay: null,
        onExpiration: null,
        beforeResponseProcessing: null,
        onFailure: null,
        onRedirect: null,
        onSuccess: null,
        onComplete: null,
    });

    /*
    Object: jaxon.ajax.callback.callback

    The global callback object which is active for every request.
    */
    self.callback = self.create();

    /*
    Function: jaxon.ajax.callback.execute

    Execute a callback event.

    Parameters:

    oCallback - (object):  The callback object (or objects) which
        contain the event handlers to be executed.
    sFunction - (string):  The name of the event to be triggered.
    args - (object):  The request object for this request.
    */
    self.execute = (oCallback, sFunction, args) => {
        // The callback object is recognized by the presence of the timers attribute.
        if (oCallback.timers === undefined) {
            oCallback.forEach(oCb => self.execute(oCb, sFunction, args));
            return;
        }

        if (oCallback[sFunction] === undefined || 'function' !== typeof oCallback[sFunction]) {
            return;
        }

        if (oCallback.timers[sFunction] === undefined) {
            oCallback[sFunction](args);
            return;
        }

        oCallback.timers[sFunction].timer = setTimeout(function() {
            oCallback[sFunction](args);
        }, oCallback.timers[sFunction].delay);
    };

    /*
    Function: jaxon.ajax.callback.clearTimer

    Clear a callback timer for the specified function.

    Parameters:

    oCallback - (object):  The callback object (or objects) that
        contain the specified function timer to be cleared.
    sFunction - (string):  The name of the function associated
        with the timer to be cleared.
    */
    self.clearTimer = (oCallback, sFunction) => {
        // The callback object is recognized by the presence of the timers attribute.
        if (oCallback.timers === undefined) {
            oCallback.forEach(oCb => self.clearTimer(oCb, sFunction));
            return;
        }

        if (oCallback.timers[sFunction] !== undefined) {
            clearTimeout(oCallback.timers[sFunction].timer);
        }
    };
})(jaxon.ajax.callback, jaxon.config);
