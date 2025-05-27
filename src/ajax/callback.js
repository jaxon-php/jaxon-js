/**
 * Class: jaxon.ajax.callback
 *
 * global: jaxon
 */

(function(self, types, config) {
    /**
     * The names of the available callbacks.
     *
     * @var {array}
     */
    const aCallbackNames = ['onInitialize', 'onProcessParams', 'onPrepare',
        'onRequest', 'onResponseDelay', 'onExpiration', 'onResponseReceived',
        'onFailure', 'onRedirect', 'onSuccess', 'onComplete'];

    /**
     * @param {integer} iDelay The amount of time in milliseconds to delay.
     *
     * @returns {object}
     */
    const setupTimer = (iDelay) => ({ timer: null, delay: iDelay });

    /**
     * Create timers that will be used fire the onRequestDelay and onExpiration events..
     *
     * @param {integer=} responseDelayTime
     * @param {integer=} expirationTime
     *
     * @returns {object}
     */
    self.timers = (responseDelayTime, expirationTime) => ({
        onResponseDelay: setupTimer(responseDelayTime ?? config.defaultResponseDelayTime),
        onExpiration: setupTimer(expirationTime ?? config.defaultExpirationTime),
    });

    /**
     * Create a blank callback object.
     * Two optional arguments let you set the delay time for the onResponseDelay and onExpiration events.
     *
     * @param {integer=} responseDelayTime
     * @param {integer=} expirationTime
     *
     * @returns {object} The callback object.
     */
    self.create = (responseDelayTime, expirationTime) => ({
        timers: self.timers(responseDelayTime, expirationTime),
    });

    /**
     * Get the callbacks from the oRequest.callback property.
     *
     * @param {object} oRequest
     * @param {mixed} oRequest.callback
     * @param {object} oRequest.func
     *
     * @returns {array}
     */
    const getRequestCallbacks = ({ callback: xCallbacks, func }) => {
        if (xCallbacks === undefined) {
            return [];
        }
        if (types.isArray(xCallbacks)) {
            return xCallbacks;
        }
        if (types.isObject(xCallbacks)) {
            return [xCallbacks];
        }
        console.warn(`Invalid callback value ignored on request to ${func.name}.`);
        return [];
    };

    /**
     * Make a callback object with the callback functions defined in the request object by their own name.
     *
     * @param {object} oRequest
     *
     * @returns {array}
     */
    const getRequestCallbackByNames = (oRequest) => {
        // Check if any callback is defined in the request object by its own name.
        const oCallback = self.create();
        aCallbackNames.forEach(sName => {
            if (types.isFunction(oRequest[sName])) {
                oCallback[sName] = oRequest[sName];
                delete oRequest[sName];
            }
        });
        return Object.keys(oCallback).length > 1 ? [oCallback] : [];
    };

    /**
     * Move all the callbacks defined directly in the oRequest object to the
     * oRequest.callback property, which may then be converted to an array.
     *
     * @param {object} oRequest
     *
     * @return {void}
     */
    self.initCallbacks = (oRequest) => {
        const aCallbacks = getRequestCallbacks(oRequest);
        const aValidCallbacks = aCallbacks.filter(xCallback => types.isObject(xCallback))
            // Add the timers attribute, if it is not defined.
            .map(oCallback => ({ ...oCallback, timers: { ...oCallback.timers }}));
        if (aValidCallbacks.length !== aCallbacks.length) {
            console.warn(`Invalid callback object ignored on request to ${oRequest.func.name}.`);
        }

        const aRequestCallback = getRequestCallbackByNames(oRequest);

        oRequest.callbacks = [
            ...aValidCallbacks,
            ...aRequestCallback,
        ];
    };

    /**
     * Get the timer in a callback object.
     *
     * @param {object} oRequest The request context object.
     * @param {mixed} oRequest.timers
     * @param {string} sEvent
     *
     * @returns {mixed}
     */
    const getTimer = ({ timers }, sEvent) => types.isObject(timers) ? timers[sEvent] : null;

    /**
     * Execute a callback event.
     *
     * @param {object} oCallback The callback object (or objects) which contain the event handlers to be executed.
     * @param {string} sEvent The name of the event to be triggered.
     * @param {object} oRequest The callback argument.
     *
     * @returns {void}
     */
    const execute = (oCallback, sEvent, oRequest) => {
        const func = oCallback[sEvent];
        if (!func || !types.isFunction(func)) {
            return;
        }
        const timer = getTimer(oCallback, sEvent);
        if (!timer) {
            func(oRequest); // Call the function directly.
            return;
        }
        // Call the function after the timeout.
        timer.timer = setTimeout(() => func(oRequest), timer.delay);
    };

    /**
     * Execute a callback event.
     *
     * @param {object} oRequest The request context object.
     * @param {string} sEvent The name of the event to be triggered.
     *
     * @returns {void}
     */
    self.execute = (oRequest, sEvent) => oRequest.callbacks
        .forEach(oCallback => execute(oCallback, sEvent, oRequest));

    /**
     * Clear a callback timer for the specified function.
     *
     * @param {object} oCallback The callback object (or objects) that contain the specified function timer to be cleared.
     * @param {string} sEvent The name of the function associated with the timer to be cleared.
     *
     * @returns {void}
     */
    const clearTimer = (oCallback, sEvent) => {
        const timer = getTimer(oCallback, sEvent);
        types.isObject(timer) && clearTimeout(timer.timer);
    };

    /**
     * Clear a callback timer for the specified function.
     *
     * @param {object} oRequest The request context object.
     * @param {string} sEvent The name of the function associated with the timer to be cleared.
     *
     * @returns {void}
     */
    self.clearTimer = (oRequest, sEvent) => oRequest.callbacks
        .forEach(oCallback => clearTimer(oCallback, sEvent));
})(jaxon.ajax.callback, jaxon.utils.types, jaxon.config);
