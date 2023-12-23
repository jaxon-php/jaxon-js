/*
Class: jaxon
*/
var jaxon = {
    /**
     * Version number
     */
    version: {
        major: '4',
        minor: '0',
        patch: '0rc-2',
    },

    debug: {
        /*
        Class: jaxon.debug.verbose

        Provide a high level of detail which can be used to debug hard to find problems.
        */
        verbose: {},
    },

    ajax: {
        callback: {},
        handler: {},
        message: {},
        parameters: {},
        request: {},
        response: {},
    },

    cmd: {
        event: {},
        form: {},
        node: {},
        script: {},
        style: {},
    },

    utils: {
        delay: {},
        dom: {},
        form: {},
        queue: {},
        string: {},
        upload: {},
    },

    dom: {},
};

/**
 * This class contains all the default configuration settings.
 * These are application level settings; however, they can be overridden by including
 * a jaxon.config definition prior to including the <jaxon_core.js> file, or by
 * specifying the appropriate configuration options on a per call basis.
 */
jaxon.config = {
    /**
     * An array of header entries where the array key is the header option name and
     * the associated value is the value that will set when the request object is initialized.
     *
     * These headers will be set for both POST and GET requests.
     */
    commonHeaders: {
        'If-Modified-Since': 'Sat, 1 Jan 2000 00:00:00 GMT'
    },

    /**
     * An array of header entries where the array key is the header option name and the
     * associated value is the value that will set when the request object is initialized.
     */
    postHeaders: {},

    /**
     * An array of header entries where the array key is the header option name and the
     * associated value is the value that will set when the request object is initialized.
     */
    getHeaders: {},

    /**
     * true - jaxon should display a wait cursor when making a request
     * false - jaxon should not show a wait cursor during a request
     */
    waitCursor: false,

    /**
     * true - jaxon should update the status bar during a request
     * false - jaxon should not display the status of the request
     */
    statusMessages: false,

    /**
     * The base document that will be used throughout the code for locating elements by ID.
     */
    baseDocument: document,

    /**
     * The URI that requests will be sent to.
     *
     * @var {string}
     */
    requestURI: document.URL,

    /**
     * The request mode.
     * - 'asynchronous' - The request will immediately return, the response will be processed
     *   when (and if) it is received.
     * - 'synchronous' - The request will block, waiting for the response.
     *   This option allows the server to return a value directly to the caller.
     */
    defaultMode: 'asynchronous',

    /**
     * The Hyper Text Transport Protocol version designated in the header of the request.
     */
    defaultHttpVersion: 'HTTP/1.1',

    /**
     * The content type designated in the header of the request.
     */
    defaultContentType: 'application/x-www-form-urlencoded',

    /**
     * The delay time, in milliseconds, associated with the <jaxon.callback.onRequestDelay> event.
     */
    defaultResponseDelayTime: 1000,

    /**
     * Always convert the reponse content to json.
     */
    convertResponseToJson: true,

    /**
     * The amount of time to wait, in milliseconds, before a request is considered expired.
     * This is used to trigger the <jaxon.callback.onExpiration event.
     */
    defaultExpirationTime: 10000,

    /**
     * The method used to send requests to the server.
     * - 'POST': Generate a form POST request
     * - 'GET': Generate a GET request; parameters are appended to the <jaxon.config.requestURI> to form a URL.
     */
    defaultMethod: 'POST', // W3C: Method is case sensitive

    /**
     * The number of times a request should be retried if it expires.
     */
    defaultRetry: 5,

    /**
     * The value returned by <jaxon.request> when in asynchronous mode, or when a syncrhonous call
     * does not specify the return value.
     */
    defaultReturnValue: false,

    /**
     * The maximum depth of recursion allowed when serializing objects to be sent to the server in a request.
     */
    maxObjectDepth: 20,

    /**
     * The maximum number of members allowed when serializing objects to be sent to the server in a request.
     */
    maxObjectSize: 2000,

    commandQueueSize: 1000,

    requestQueueSize: 1000,
};

/**
 * Class: jaxon.config.status
 *
 * Provides support for updating the browser's status bar during the request process.
 * By splitting the status bar functionality into an object, the jaxon developer has the opportunity
 * to customize the status bar messages prior to sending jaxon requests.
 */
jaxon.config.status = {
    /**
     * Constructs and returns a set of event handlers that will be called by the
     * jaxon framework to set the status bar messages.
     *
     * @returns {object}
     */
    update: () => ({
        onRequest: () => console.log('Sending Request...'),
        onWaiting: () => console.log('Waiting for Response...'),
        onProcessing: () => console.log('Processing...'),
        onComplete: () => console.log('Done.'),
    }),

    /**
     * Constructs and returns a set of event handlers that will be called by the
     * jaxon framework where status bar updates would normally occur.
     *
     * @returns {object}
     */
    dontUpdate: () =>({
        onRequest: () => {},
        onWaiting: () => {},
        onProcessing: () => {},
        onComplete: () => {}
    }),
};

/**
 * Class: jaxon.config.cursor
 *
 * Provides the base functionality for updating the browser's cursor during requests.
 * By splitting this functionalityh into an object of it's own, jaxon developers can now
 * customize the functionality prior to submitting requests.
 */
jaxon.config.cursor = {
    /**
     * Constructs and returns a set of event handlers that will be called by the
     * jaxon framework to effect the status of the cursor during requests.
     *
     * @returns {object}
     */
    update: () => ({
        onWaiting: () => {
            if (jaxon.config.baseDocument.body) {
                jaxon.config.baseDocument.body.style.cursor = 'wait';
            }
        },
        onComplete: () => {
            if (jaxon.config.baseDocument.body) {
                jaxon.config.baseDocument.body.style.cursor = 'auto';
            }
        }
    }),

    /**
     * Constructs and returns a set of event handlers that will be called by the jaxon framework
     * where cursor status changes would typically be made during the handling of requests.
     *
     * @returns {object}
     */
    dontUpdate: () => ({
        onWaiting: () => {},
        onComplete: () => {}
    }),
};
