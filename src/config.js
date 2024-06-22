/*
    @package jaxon
    @version $Id: jaxon.core.js 327 2007-02-28 16:55:26Z calltoconstruct $
    @copyright Copyright (c) 2005-2007 by Jared White & J. Max Wilson
    @copyright Copyright (c) 2008-2010 by Joseph Woolley, Steffen Konerow, Jared White  & J. Max Wilson
    @copyright Copyright (c) 2017 by Thierry Feuzeu, Joseph Woolley, Steffen Konerow, Jared White  & J. Max Wilson
    @license https://opensource.org/license/bsd-3-clause/ BSD License
*/

/**
 * Class: jaxon
 */
var jaxon = {
    /**
     * Version number
     */
    version: {
        major: '5',
        minor: '0',
        patch: '0rc-17',
    },

    debug: {
        /**
         * Class: jaxon.debug.verbose
         *
         * Provide a high level of detail which can be used to debug hard to find problems.
         */
        verbose: {},
    },

    ajax: {
        callback: {},
        command: {},
        parameters: {},
        request: {},
        response: {},
    },

    cmd: {
        body: {},
        script: {},
        event: {},
    },

    parser: {
        attr: {},
        call: {},
        query: {},
    },

    utils: {
        dom: {},
        form: {},
        queue: {},
        types: {},
        string: {},
        upload: {},
    },

    dom: {},

    dialog: {
        cmd: {},
        lib: {},
    },

    config: {},
};

/**
 * This object contains all the default configuration settings.
 * These are application level settings; however, they can be overridden by
 * specifying the appropriate configuration options on a per call basis.
 */
(function(self) {
    /**
     * An array of header entries where the array key is the header option name and
     * the associated value is the value that will set when the request object is initialized.
     *
     * These headers will be set for both POST and GET requests.
     */
    self.commonHeaders = {
        'If-Modified-Since': 'Sat, 1 Jan 2000 00:00:00 GMT'
    };

    /**
     * An array of header entries where the array key is the header option name and the
     * associated value is the value that will set when the request object is initialized.
     */
    self.postHeaders = {};

    /**
     * An array of header entries where the array key is the header option name and the
     * associated value is the value that will set when the request object is initialized.
     */
    self.getHeaders = {};

    /**
     * true if jaxon should display a wait cursor when making a request, false otherwise.
     */
    self.waitCursor = false;

    /**
     * true if jaxon should log the status to the console during a request, false otherwise.
     */
    self.statusMessages = false;

    /**
     * The base document that will be used throughout the code for locating elements by ID.
     */
    self.baseDocument = document;

    /**
     * The URI that requests will be sent to.
     *
     * @var {string}
     */
    self.requestURI = document.URL;

    /**
     * The request mode.
     * - 'asynchronous' - The request will immediately return, the response will be processed
     *   when (and if) it is received.
     * - 'synchronous' - The request will block, waiting for the response.
     *   This option allows the server to return a value directly to the caller.
     */
    self.defaultMode = 'asynchronous';

    /**
     * The Hyper Text Transport Protocol version designated in the header of the request.
     */
    self.defaultHttpVersion = 'HTTP/1.1';

    /**
     * The content type designated in the header of the request.
     */
    self.defaultContentType = 'application/x-www-form-urlencoded';

    /**
     * The delay time, in milliseconds, associated with the <jaxon.callback.onRequestDelay> event.
     */
    self.defaultResponseDelayTime = 1000;

    /**
     * Always convert the reponse content to json.
     */
    self.convertResponseToJson = true;

    /**
     * The amount of time to wait, in milliseconds, before a request is considered expired.
     * This is used to trigger the <jaxon.callback.onExpiration event.
     */
    self.defaultExpirationTime = 10000;

    /**
     * The method used to send requests to the server.
     * - 'POST': Generate a form POST request
     * - 'GET': Generate a GET request; parameters are appended to <jaxon.config.requestURI> to form a URL.
     */
    self.defaultMethod = 'POST'; // W3C = Method is case sensitive

    /**
     * The number of times a request should be retried if it expires.
     */
    self.defaultRetry = 5;

    /**
     * The maximum depth of recursion allowed when serializing objects to be sent to the server in a request.
     */
    self.maxObjectDepth = 20;

    /**
     * The maximum number of members allowed when serializing objects to be sent to the server in a request.
     */
    self.maxObjectSize = 2000;

    /**
     * The maximum number of commands allowed in a single response.
     */
    self.commandQueueSize = 1000;

    /**
     * The maximum number of requests that can be processed simultaneously.
     */
    self.requestQueueSize = 1000;

    /**
     * Common options for all HTTP requests to the server.
     */
    self.httpRequestOptions = {
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        redirect: "manual", // manual, *follow, error
    };

    /**
     * Set the options in the request object
     *
     * @param {object} oRequest The request context object.
     *
     * @returns {void}
     */
    self.setRequestOptions = (oRequest) => {
        if (self.requestURI === undefined) {
            throw { code: 10005 };
        }

        const aHeaders = ['commonHeaders', 'postHeaders', 'getHeaders'];
        aHeaders.forEach(sHeader => oRequest[sHeader] = { ...self[sHeader], ...oRequest[sHeader] });

        const oDefaultOptions = {
            statusMessages: self.statusMessages,
            waitCursor: self.waitCursor,
            mode: self.defaultMode,
            method: self.defaultMethod,
            URI: self.requestURI,
            httpVersion: self.defaultHttpVersion,
            contentType: self.defaultContentType,
            retry: self.defaultRetry,
            maxObjectDepth: self.maxObjectDepth,
            maxObjectSize: self.maxObjectSize,
            upload: false,
            aborted: false,
            response: {
                convertToJson: self.convertResponseToJson,
            },
        };
        Object.keys(oDefaultOptions).forEach(sOption =>
            oRequest[sOption] = oRequest[sOption] ?? oDefaultOptions[sOption]);

        oRequest.method = oRequest.method.toUpperCase();
        if (oRequest.method !== 'GET') {
            oRequest.method = 'POST'; // W3C: Method is case sensitive
        }
        oRequest.requestRetry = oRequest.retry;
    };

    /**
     * Class: jaxon.config.status
     *
     * Provides support for updating the browser's status bar during the request process.
     * By splitting the status bar functionality into an object, the jaxon developer has the opportunity
     * to customize the status bar messages prior to sending jaxon requests.
     */
    self.status = {
        /**
         * A set of event handlers that will be called by the
         * jaxon framework to set the status bar messages.
         *
         * @type {object}
         */
        update: {
            onRequest: () => console.log('Sending Request...'),
            onWaiting: () => console.log('Waiting for Response...'),
            onProcessing: () => console.log('Processing...'),
            onComplete: () => console.log('Done.'),
        },

        /**
         * A set of event handlers that will be called by the
         * jaxon framework where status bar updates would normally occur.
         *
         * @type {object}
         */
        dontUpdate: {
            onRequest: () => {},
            onWaiting: () => {},
            onProcessing: () => {},
            onComplete: () => {}
        },
    };

    /**
     * Class: jaxon.config.cursor
     *
     * Provides the base functionality for updating the browser's cursor during requests.
     * By splitting this functionality into an object of it's own, jaxon developers can now
     * customize the functionality prior to submitting requests.
     */
    self.cursor = {
        /**
         * Constructs and returns a set of event handlers that will be called by the
         * jaxon framework to effect the status of the cursor during requests.
         *
         * @type {object}
         */
        update: {
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
        },

        /**
         * Constructs and returns a set of event handlers that will be called by the jaxon framework
         * where cursor status changes would typically be made during the handling of requests.
         *
         * @type {object}
         */
        dontUpdate: {
            onWaiting: () => {},
            onComplete: () => {}
        },
    };
})(jaxon.config);

// Make jaxon accessible with the dom.findFunction function.
window.jaxon = jaxon;
