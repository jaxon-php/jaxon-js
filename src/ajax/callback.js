/**
 * Class: jaxon.ajax.callback
 */

(function(self, str, config) {
    /**
     * Create a timer to fire an event in the future.
     * This will be used fire the onRequestDelay and onExpiration events.
     *
     * @param {integer} iDelay The amount of time in milliseconds to delay.
     *
     * @returns {object} A callback timer object.
     */
    const setupTimer = (iDelay) => ({ timer: null, delay: iDelay });

    /**
     * The names of the available callbacks.
     *
     * @var {array}
     */
    const aCallbackNames = ['onInitialize', 'onProcessParams', 'onPrepare',
        'onRequest', 'onResponseDelay', 'onExpiration', 'beforeResponseProcessing',
        'onFailure', 'onRedirect', 'onSuccess', 'onComplete'];

    /**
     * Create a blank callback object.
     * Two optional arguments let you set the delay time for the onResponseDelay and onExpiration events.
     *
     * @param {integer=} responseDelayTime
     * @param {integer=} expirationTime
     *
     * @returns {object} The callback object.
     */
    self.create = (responseDelayTime, expirationTime) => {
        const oCallback = {
            timers: {
                onResponseDelay: setupTimer(responseDelayTime ?? config.defaultResponseDelayTime),
                onExpiration: setupTimer(expirationTime ?? config.defaultExpirationTime),
            },
        };
        aCallbackNames.forEach(sName => oCallback[sName] = null);
        return oCallback;
    };

    /**
     * The global callback object which is active for every request.
     *
     * @var {object}
     */
    self.callback = self.create();

    /**
     * Move all the callbacks defined directly in the oRequest object to the
     * oRequest.callback property, which may then be converted to an array.
     *
     * @param {object} oRequest
     *
     * @return {void}
     */
    self.initCallbacks = (oRequest) => {
        if (str.typeOf(oRequest.callback) === 'object') {
            oRequest.callback = [oRequest.callback];
        }
        if (str.typeOf(oRequest.callback) === 'array') {
            oRequest.callback.forEach(oCallback => {
                // Add the timers attribute, if it is not defined.
                if (oCallback.timers === undefined) {
                    oCallback.timers = {};
                }
            });
            return;
        }

        let callbackFound = false;
        // Check if any callback is defined in the request object by its own name.
        const callback = self.create();
        aCallbackNames.forEach(sName => {
            if (oRequest[sName] !== undefined) {
                callback[sName] = oRequest[sName];
                callbackFound = true;
                delete oRequest[sName];
            }
        });
        oRequest.callback = callbackFound ? [callback] : [];
    };

    /**
     * Get a flatten array of callbacks
     *
     * @param {object} oRequest The request context object.
     * @param {array=} oRequest.callback The request callback(s).
     *
     * @returns {array}
     */
    const getCallbacks = ({ callback = [] }) => [self.callback, ...callback];

    /**
     * Execute a callback event.
     *
     * @param {object} oCallback The callback object (or objects) which contain the event handlers to be executed.
     * @param {string} sFunction The name of the event to be triggered.
     * @param {object} xArgs The callback argument.
     *
     * @returns {void}
     */
    const execute = (oCallback, sFunction, xArgs) => {
        const func = oCallback[sFunction];
        if (!func || str.typeOf(func) !== 'function') {
            return;
        }
        const timer = oCallback.timers[sFunction];
        if (!timer) {
            func(xArgs); // Call the function directly.
            return;
        }
        // Call the function after the timeout.
        timer.timer = setTimeout(() => func(xArgs), timer.delay);
    };

    /**
     * Execute a callback event.
     *
     * @param {object} oRequest The request context object.
     * @param {string} sFunction The name of the event to be triggered.
     *
     * @returns {void}
     */
    self.execute = (oRequest, sFunction) => getCallbacks(oRequest)
        .forEach(oCallback => execute(oCallback, sFunction, oRequest));

    /**
     * Clear a callback timer for the specified function.
     *
     * @param {object} oCallback The callback object (or objects) that contain the specified function timer to be cleared.
     * @param {string} sFunction The name of the function associated with the timer to be cleared.
     *
     * @returns {void}
     */
    const clearTimer = (oCallback, sFunction) => {
        const timer = oCallback.timers[sFunction];
        timer !== undefined && timer.timer !== null && clearTimeout(timer.timer);
    };

    /**
     * Clear a callback timer for the specified function.
     *
     * @param {object} oRequest The request context object.
     * @param {string} sFunction The name of the function associated with the timer to be cleared.
     *
     * @returns {void}
     */
    self.clearTimer = (oRequest, sFunction) => getCallbacks(oRequest)
        .forEach(oCallback => clearTimer(oCallback, sFunction));
})(jaxon.ajax.callback, jaxon.utils.string, jaxon.config);
