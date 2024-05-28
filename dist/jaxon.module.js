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
        patch: '0rc-8',
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
        handler: {},
        parameters: {},
        request: {},
        response: {},
    },

    cmd: {
        body: {},
        script: {},
        event: {},
    },

    call: {
        json: {},
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
     * The value returned by <jaxon.request> when in asynchronous mode, or when a syncrhonous call
     * does not specify the return value.
     */
    self.defaultReturnValue = false;

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
            convertResponseToJson: self.convertResponseToJson,
            retry: self.defaultRetry,
            returnValue: self.defaultReturnValue,
            maxObjectDepth: self.maxObjectDepth,
            maxObjectSize: self.maxObjectSize,
            context: window,
            upload: false,
            aborted: false,
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


/**
 * Class: jaxon.utils.dom
 */

(function(self, types, baseDocument) {
    /**
     * Shorthand for finding a uniquely named element within the document.
     *
     * @param {string} sId - The unique name of the element (specified by the ID attribute)
     *
     * @returns {object} The element found or null.
     *
     * @see <self.$>
     */
    self.$ = (sId) => !sId ? null : (types.isString(sId) ? baseDocument.getElementById(sId) : sId);

    /**
     * Create a div as workspace for the getBrowserHTML() function.
     *
     * @returns {object} The workspace DOM element.
     */
    const _getWorkspace = () => {
        const elWorkspace = self.$('jaxon_temp_workspace');
        if (elWorkspace) {
            return elWorkspace;
        }
        // Workspace not found. Must be created.
        if (!baseDocument.body) {
            return null;
        }

        const elNewWorkspace = baseDocument.createElement('div');
        elNewWorkspace.setAttribute('id', 'jaxon_temp_workspace');
        elNewWorkspace.style.display = 'none';
        elNewWorkspace.style.visibility = 'hidden';
        baseDocument.body.appendChild(elNewWorkspace);
        return elNewWorkspace;
    };

    /**
     * Insert the specified string of HTML into the document, then extract it.
     * This gives the browser the ability to validate the code and to apply any transformations it deems appropriate.
     *
     * @param {string} sValue A block of html code or text to be inserted into the browser's document.
     *
     * @returns {string} The (potentially modified) html code or text.
     */
    self.getBrowserHTML = (sValue) => {
        const elWorkspace = _getWorkspace();
        elWorkspace.innerHTML = sValue;
        const browserHTML = elWorkspace.innerHTML;
        elWorkspace.innerHTML = '';
        return browserHTML;
    };

    /**
     * Tests to see if the specified data is the same as the current value of the element's attribute.
     *
     * @param {string|object} element The element or it's unique name (specified by the ID attribute)
     * @param {string} attribute The name of the attribute.
     * @param {string} newData The value to be compared with the current value of the specified element.
     *
     * @returns {true} The specified value differs from the current attribute value.
     * @returns {false} The specified value is the same as the current value.
     */
    self.willChange = (element, attribute, newData) => {
        element = self.$(element);
        return !element ? false : (newData != element[attribute]);
    };

    /**
     * Tests to see if the specified data is the same as the current value of the element's attribute.
     *
     * @param {string|object} element The element or it's unique name (specified by the ID attribute)
     *
     * @returns {void}
     */
    self.removeElement = (element) => {
        element = self.$(element);
        if (element && element.parentNode && element.parentNode.removeChild) {
            element.parentNode.removeChild(element);
        }
    };

    /**
     * Find a function using its name as a string.
     *
     * @param {string} sFuncName The name of the function to find.
     * @param {object} context
     *
     * @returns {object|null}
     */
    self.findFunction = (sFuncName, context = window) => {
        if (sFuncName === 'toInt' && context === window) {
            return types.toInt;
        }

        const aNames = sFuncName.split(".");
        const nLength = aNames.length;
        for (let i = 0; i < nLength && (context); i++) {
            context = context[aNames[i]];
        }
        return context ?? null;
    };

    /**
     * Given an element and an attribute with 0 or more dots,
     * get the inner object and the corresponding attribute name.
     *
     * @param {string} sAttrName The attribute name.
     * @param {object=} xElement The outer element.
     *
     * @returns {object|null} The inner object and the attribute name in an object.
     */
    self.getInnerObject = (sAttrName, xElement = window) => {
        const aNames = sAttrName.split('.');
        // Get the last element in the array.
        sAttrName = aNames.pop();
        // Move to the inner object.
        const nLength = aNames.length;
        for (let i = 0; i < nLength && (xElement); i++) {
            // The real name for the "css" object is "style".
            xElement = xElement[aNames[i] === 'css' ? 'style' : aNames[i]];
        }
        return !xElement ? null : { node: xElement, attr: sAttrName };
    };
})(jaxon.utils.dom, jaxon.utils.types, jaxon.config.baseDocument);


/**
 * Class: jaxon.utils.form
 */

(function(self, dom) {
    /**
     * @param {object} aFormValues
     * @param {object} child
     * @param {boolean} submitDisabledElements
     * @param {string} prefix
     *
     * @returns {void}
     */
    const _getValue = (aFormValues, child, submitDisabledElements, prefix) => {
        if (!child.name || 'PARAM' === child.tagName)
            return;
        if (!submitDisabledElements && child.disabled)
            return;
        if (prefix !== child.name.substring(0, prefix.length))
            return;
        if ((child.type === 'radio' || child.type === 'checkbox') && !child.checked)
            return;
        if (child.type === 'file')
            return;

        const name = child.name;
        const values = child.type !== 'select-multiple' ? child.value :
            child.options.filter(({ selected }) => selected).map(({ value }) => value);
        const keyBegin = name.indexOf('[');

        if (keyBegin < 0) {
            aFormValues[name] = values;
            return;
        }

        // Parse names into brackets
        let k = name.substring(0, keyBegin);
        let a = name.substring(keyBegin);
        if (aFormValues[k] === undefined) {
            aFormValues[k] = {};
        }
        let p = aFormValues; // pointer reset
        while (a.length > 0) {
            const sa = a.substring(0, a.indexOf(']') + 1);
            const lastKey = k; //save last key
            const lastRef = p; //save last pointer

            a = a.substring(a.indexOf(']') + 1);
            p = p[k];
            k = sa.substring(1, sa.length - 1);
            if (k === '') {
                if ('select-multiple' === child.type) {
                    k = lastKey; //restore last key
                    p = lastRef;
                } else {
                    k = p.length;
                }
            }
            if (k === undefined) {
                /*check against the global aFormValues Stack wich is the next(last) usable index */
                k = Object.keys(lastRef[lastKey]).length;
            }
            p[k] = p[k] || {};
        }
        p[k] = values;
    };

    /**
     * @param {object} aFormValues
     * @param {array} children
     * @param {boolean} submitDisabledElements
     * @param {string} prefix
     *
     * @returns {void}
     */
    const _getValues = (aFormValues, children, submitDisabledElements, prefix) => {
        children.forEach(child => {
            if (child.childNodes !== undefined && child.type !== 'select-one' && child.type !== 'select-multiple') {
                _getValues(aFormValues, child.childNodes, submitDisabledElements, prefix);
            }
           _getValue(aFormValues, child, submitDisabledElements, prefix);
        });
    };

    /**
     * Build an associative array of form elements and their values from the specified form.
     *
     * @param {string} formId The unique name (id) of the form to be processed.
     * @param {boolean} disabled (optional): Include form elements which are currently disabled.
     * @param {string=''} prefix (optional): A prefix used for selecting form elements.
     *
     * @returns {object} An associative array of form element id and value.
     */
    self.getValues = (formId, disabled, prefix = '') => {
        const submitDisabledElements = (disabled === true);
        const prefixValue = prefix ?? '';
        const form = dom.$(formId);
        const aFormValues = {};
        if (form && form.childNodes) {
            _getValues(aFormValues, form.childNodes, submitDisabledElements, prefixValue);
        }
        return aFormValues;
    };
})(jaxon.utils.form, jaxon.utils.dom);


/**
 * Class: jaxon.utils.queue
 */

(function(self) {
    /**
     * Construct and return a new queue object.
     *
     * @param {integer} size The number of entries the queue will be able to hold.
     *
     * @returns {object}
     */
    self.create = size => ({
        start: 0,
        count: 0,
        size: size,
        end: 0,
        elements: [],
        paused: false,
    });

    /**
     * Check id a queue is empty.
     *
     * @param {object} oQueue The queue to check.
     *
     * @returns {boolean}
     */
    self.empty = oQueue => oQueue.count <= 0;

    /**
     * Check id a queue is empty.
     *
     * @param {object} oQueue The queue to check.
     *
     * @returns {boolean}
     */
    self.full = oQueue => oQueue.count >= oQueue.size;

    /**
     * Push a new object into the tail of the buffer maintained by the specified queue object.
     *
     * @param {object} oQueue The queue in which you would like the object stored.
     * @param {object} obj    The object you would like stored in the queue.
     *
     * @returns {integer} The number of entries in the queue.
     */
    self.push = (oQueue, obj) => {
        // No push if the queue is full.
        if(self.full(oQueue)) {
            throw { code: 10003 };
        }

        oQueue.elements[oQueue.end] = obj;
        if(++oQueue.end >= oQueue.size) {
            oQueue.end = 0;
        }
        return ++oQueue.count;
    };

    /**
     * Push a new object into the head of the buffer maintained by the specified queue object.
     *
     * This effectively pushes an object to the front of the queue... it will be processed first.
     *
     * @param {object} oQueue The queue in which you would like the object stored.
     * @param {object} obj    The object you would like stored in the queue.
     *
     * @returns {integer} The number of entries in the queue.
     */
    self.pushFront = (oQueue, obj) => {
        // No push if the queue is full.
        if(self.full(oQueue)) {
            throw { code: 10003 };
        }

        // Simply push if the queue is empty
        if(self.empty(oQueue)) {
            return self.push(oQueue, obj);
        }

        // Put the object one position back.
        if(--oQueue.start < 0) {
            oQueue.start = oQueue.size - 1;
        }
        oQueue.elements[oQueue.start] = obj;
        return ++oQueue.count;
    };

    /**
     * Attempt to pop an object off the head of the queue.
     *
     * @param {object} oQueue The queue object you would like to modify.
     *
     * @returns {object|null}
     */
    self.pop = (oQueue) => {
        if(self.empty(oQueue)) {
            return null;
        }

        let obj = oQueue.elements[oQueue.start];
        delete oQueue.elements[oQueue.start];
        if(++oQueue.start >= oQueue.size) {
            oQueue.start = 0;
        }
        oQueue.count--;
        return obj;
    };

    /**
     * Attempt to pop an object off the head of the queue.
     *
     * @param {object} oQueue The queue object you would like to modify.
     *
     * @returns {object|null}
     */
    self.peek = (oQueue) => {
        if(self.empty(oQueue)) {
            return null;
        }
        return oQueue.elements[oQueue.start];
    };
})(jaxon.utils.queue);


/**
 * Class: jaxon.utils.dom
 */

/**
 * Plain javascript replacement for jQuery's .ready() function.
 * See https://github.com/jfriend00/docReady for a detailed description, copyright and license information.
 */
(function(self) {
    "use strict";

    let readyList = [];
    let readyFired = false;
    let readyEventHandlersInstalled = false;

    /**
     * Call this when the document is ready.
     * This function protects itself against being called more than once
     */
    const ready = () => {
        if (readyFired) {
            return;
        }
        // this must be set to true before we start calling callbacks
        readyFired = true;
        // if a callback here happens to add new ready handlers,
        // the jaxon.utils.dom.ready() function will see that it already fired
        // and will schedule the callback to run right after
        // this event loop finishes so all handlers will still execute
        // in order and no new ones will be added to the readyList
        // while we are processing the list
        readyList.forEach(cb => cb.fn.call(window, cb.ctx));
        // allow any closures held by these functions to free
        readyList = [];
    }

    // Was used with the document.attachEvent() function.
    // const readyStateChange = () => document.readyState === "complete" && ready();

    /**
     * This is the one public interface
     * jaxon.utils.dom.ready(fn, context);
     * The context argument is optional - if present, it will be passed as an argument to the callback
     */
    self.ready = function(callback, context) {
        // if ready has already fired, then just schedule the callback
        // to fire asynchronously, but right away
        if (readyFired) {
            setTimeout(function() { callback(context); }, 1);
            return;
        }
        // add the function and context to the list
        readyList.push({ fn: callback, ctx: context });
        // if document already ready to go, schedule the ready function to run
        if (document.readyState === "complete" ||
            (!document.attachEvent && document.readyState === "interactive")) {
            setTimeout(ready, 1);
            return;
        }
        if (!readyEventHandlersInstalled) {
            // first choice is DOMContentLoaded event
            document.addEventListener("DOMContentLoaded", ready, false);
            // backup is window load event
            window.addEventListener("load", ready, false);

            readyEventHandlersInstalled = true;
        }
    }
})(jaxon.utils.dom);


/**
 * Class: jaxon.utils.string
 */

(function(self) {
    /**
     * Replace all occurances of the single quote character with a double quote character.
     *
     * @param {string=} haystack The source string to be scanned
     *
     * @returns {string|false} A new string with the modifications applied. False on error.
     */
    self.doubleQuotes = haystack => haystack === undefined ?
        false : haystack.replace(new RegExp("'", 'g'), '"');

    /**
     * Replace all occurances of the double quote character with a single quote character.
     *
     * @param {string=} haystack The source string to be scanned
     *
     * @returns {string|false} A new string with the modification applied
     */
    self.singleQuotes = haystack => haystack === undefined ?
        false : haystack.replace(new RegExp('"', 'g'), "'");

    /**
     * Detect, and if found, remove the prefix 'on' from the specified string.
     * This is used while working with event handlers.
     *
     * @param {string} sEventName The string to be modified
     *
     * @returns {string} The modified string
     */
    self.stripOnPrefix = (sEventName) => {
        sEventName = sEventName.toLowerCase();
        return sEventName.indexOf('on') === 0 ? sEventName.replace(/on/, '') : sEventName;
    };

    /**
     * Detect, and add if not found, the prefix 'on' from the specified string.
     * This is used while working with event handlers.
     *
     * @param {string} sEventName The string to be modified
     *
     * @returns {string} The modified string
     */
    self.addOnPrefix = (sEventName) => {
        sEventName = sEventName.toLowerCase();
        return sEventName.indexOf('on') !== 0 ? 'on' + sEventName : sEventName;
    };

    /**
     * String functions for Jaxon
     * See http://javascript.crockford.com/remedial.html for more explanation
     */
    if (!String.prototype.supplant) {
        /**
         * Substitute variables in the string
         *
         * @param {object} values The substitution values
         *
         * @returns {string}
         */
        String.prototype.supplant = function(values) {
            return this.replace(
                /\{([^{}]*)\}/g,
                (a, b) => {
                    const r = values[b];
                    const t = typeof r;
                    return t === 'string' || t === 'number' ? r : a;
                }
            );
        };
    }
})(jaxon.utils.string);


/**
 * Class: jaxon.utils.types
 */

(function(self) {
    /**
     * Get the type of an object.
     * Unlike typeof, this function distinguishes objects from arrays.
     *
     * @param {mixed} xVar The var to check
     *
     * @returns {string}
     */
    self.of = (xVar) => Object.prototype.toString.call(xVar).slice(8, -1).toLowerCase();

    /**
     * Check if a var is an object.
     *
     * @param {mixed} xVar The var to check
     *
     * @returns {bool}
     */
    self.isObject = (xVar) => self.of(xVar) === 'object';

    /**
     * Check if a var is an array.
     *
     * @param {mixed} xVar The var to check
     *
     * @returns {bool}
     */
    self.isArray = (xVar) => self.of(xVar) === 'array';

    /**
     * Check if a var is a string.
     *
     * @param {mixed} xVar The var to check
     *
     * @returns {bool}
     */
    self.isString = (xVar) => self.of(xVar) === 'string';

    /**
     * Check if a var is a function.
     *
     * @param {mixed} xVar The var to check
     *
     * @returns {bool}
     */
    self.isFunction = (xVar) => self.of(xVar) === 'function';

    /**
     * Convert to int.
     *
     * @param {string} sValue
     *
     * @returns {integer}
     */
    self.toInt = (sValue) => parseInt(sValue);

    if (!Array.prototype.top) {
        /**
         * Get the last element in an array
         *
         * @returns {mixed}
         */
        Array.prototype.top = function() {
            return this.length > 0 ? this[this.length - 1] : undefined;
        };
    };
})(jaxon.utils.types);


/**
 * Class: jaxon.utils.upload
 */

(function(self, dom, console) {
    /**
     * @param {object} oRequest A request object, created initially by a call to <jaxon.ajax.request.initialize>
     * @param {string=} oRequest.upload The HTML file upload field id
     *
     * @returns {boolean}
     */
    const initRequest = (oRequest) => {
        if (!oRequest.upload) {
            return false;
        }

        oRequest.upload = {
            id: oRequest.upload,
            input: null,
            form: null,
        };
        const input = dom.$(oRequest.upload.id);

        if (!input) {
            console.log('Unable to find input field for file upload with id ' + oRequest.upload.id);
            return false;
        }
        if (input.type !== 'file') {
            console.log('The upload input field with id ' + oRequest.upload.id + ' is not of type file');
            return false;
        }
        if (input.files.length === 0) {
            console.log('There is no file selected for upload in input field with id ' + oRequest.upload.id);
            return false;
        }
        if (input.name === undefined) {
            console.log('The upload input field with id ' + oRequest.upload.id + ' has no name attribute');
            return false;
        }
        oRequest.upload.input = input;
        oRequest.upload.form = input.form;
        return true;
    };

    /**
     * Check upload data and initialize the request.
     *
     * @param {object} oRequest A request object, created initially by a call to <jaxon.ajax.request.initialize>
     *
     * @returns {void}
     */
    self.initialize = (oRequest) => {
        // The content type shall not be set when uploading a file with FormData.
        // It will be set by the browser.
        if (!initRequest(oRequest)) {
            oRequest.postHeaders['content-type'] = oRequest.contentType;
        }
    }
})(jaxon.utils.upload, jaxon.utils.dom, console);


/**
 * Class: jaxon.call.json
 *
 * Execute calls from json expressions.
 */

(function(self, query, dialog, dom, form, types) {
    /**
     * @var {object}
     */
    const xErrors = {
        comparator: () => false, // The default comparison operator.
        command: (xCall) => {
            console.error('Unexpected command: ' + JSON.stringify({ call: xCall }));
            return undefined;
        },
    };

    /**
     * The comparison operators.
     *
     * @var {object}
     */
    const xComparators = {
        eq: (xLeftArg, xRightArg) => xLeftArg == xRightArg,
        teq: (xLeftArg, xRightArg) => xLeftArg === xRightArg,
        ne: (xLeftArg, xRightArg) => xLeftArg != xRightArg,
        nte: (xLeftArg, xRightArg) => xLeftArg !== xRightArg,
        gt: (xLeftArg, xRightArg) => xLeftArg > xRightArg,
        ge: (xLeftArg, xRightArg) => xLeftArg >= xRightArg,
        lt: (xLeftArg, xRightArg) => xLeftArg < xRightArg,
        le: (xLeftArg, xRightArg) => xLeftArg <= xRightArg,
    };

    /**
     * Check if an argument is an expression.
     *
     * @param {mixed} xArg
     *
     * @returns {boolean}
     */
    const isValidCall = xArg => types.isObject(xArg) && (xArg._type);

    /**
     * Get the value of a single argument.
     *
     * @param {mixed} xArg
     * @param {mixed} xCurrValue The current expression value.
     *
     * @returns {mixed}
     */
    const getValue = (xArg, xCurrValue) => {
        if (!isValidCall(xArg)) {
            return xArg;
        }
        const { _type: sType, _name: sName } = xArg;
        switch(sType) {
            case 'form': return form.getValues(sName);
            case 'html': return dom.$(sName).innerHTML;
            case 'input': return dom.$(sName).value;
            case 'checked': return dom.$(sName).checked;
            case 'expr': return execExpression(xArg, { target: window });
            case '_': return sName === 'this' ? xCurrValue : undefined;
            default: return undefined;
        }
    };

    /**
     * Get the values of an array of arguments.
     *
     * @param {array} aArgs
     * @param {mixed} xCurrValue The current expression value.
     *
     * @returns {array}
     */
    const getArgs = (aArgs, xCurrValue) => aArgs.map(xArg => getValue(xArg, xCurrValue));

    /**
     * The call commands
     *
     * @var {object}
     */
    const xCommands = {
        select: ({ _name: sName, context: xSelectContext = null }, oCallContext) => {
            switch(sName) {
                case 'this':
                    return query.select(oCallContext.target); // The last event target.
                case 'event':
                    return oCallContext.event; // The last event
                case 'window':
                    return window;
                default: // Call the selector.
                    return query.select(sName, xSelectContext);
            }
        },
        event: ({ _name: sName, func: xExpression }, oCallContext, xCurrValue) => {
            // Set an event handler. Takes an expression as argument.
            xCurrValue.on(sName, (event) => execExpression(xExpression, {
                ...oCallContext,
                event,
                target: event.currentTarget,
            }));
            return xCurrValue;
        },
        func: ({ _name: sName, args: aArgs = [] }, oCallContext, xCurrValue) => {
            // Call a "global" function with the current context as "this".
            const func = dom.findFunction(sName);
            return !func ? undefined : func.apply(oCallContext, getArgs(aArgs, xCurrValue));
        },
        method: ({ _name: sName, args: aArgs = [] }, oCallContext, xCurrValue) => {
            // Call a function with the current value as "this".
            const func = dom.findFunction(sName, xCurrValue);
            // toInt() is a peudo-method that converts the current value to int.
            return !func ? (sName === 'toInt' ? types.toInt(xCurrValue) : undefined) :
                func.apply(xCurrValue, getArgs(aArgs, xCurrValue));
        },
        attr: ({ _name: sName, value: xValue }, oCallContext, xCurrValue) => {
            const xElt = dom.getInnerObject(sName, xCurrValue || oCallContext.target);
            if (!xElt) {
                return undefined;
            }
            if (xValue !== undefined) {
                // Assign an attribute.
                xElt.node[xElt.attr] = getValue(xValue, xCurrValue);
            }
            return xElt.node[xElt.attr];
        },
    };

    /**
     * Execute a single call.
     *
     * @param {object} xCall
     * @param {object} oCallContext The context to execute calls in.
     * @param {mixed=} xCurrValue The current expression value.
     *
     * @returns {void}
     */
    const execCall = (xCall, oCallContext, xCurrValue) => {
        const xCommand = isValidCall(xCall) ? xCommands[xCall._type] : xErrors.command;
        return xCommand(xCall, oCallContext, xCurrValue);
    };

    /**
     * Execute a single javascript function call.
     *
     * @param {object} xCall An object representing the function call
     * @param {object=} oCallContext The context to execute calls in.
     *
     * @returns {mixed}
     */
    self.execCall = (xCall, oCallContext) => execCall(xCall, { target: window, ...oCallContext });

    /**
     * Execute the javascript code represented by an expression object.
     *
     * @param {array} aCalls The calls to execute
     * @param {object} oCallContext The context to execute calls in.
     *
     * @returns {mixed}
     */
    const execCalls = (aCalls, oCallContext) => {
        let xCurrValue = undefined;
        const nLength = aCalls.length;
        for (let i = 0; i < nLength; i++) {
            xCurrValue = execCall(aCalls[i], oCallContext, xCurrValue);
            if (xCurrValue === undefined) {
                return xCurrValue; // Exit the loop if a call returns an undefined value.
            }
        }
        return xCurrValue;
    };

    /**
     * Replace placeholders in a given string with values
     * 
     * @param {object} phrase
     * @param {string} phrase.str The string to be processed
     * @param {array} phrase.args The values for placeholders
     *
     * @returns {string}
     */
    self.makePhrase = ({ str: sStr, args: aArgs }) => {
        const oArgs = {};
        let nIndex = 1;
        aArgs.forEach(xArg => oArgs[nIndex++] = getValue(xArg));
        return sStr.supplant(oArgs);
    };

    /**
     * Show an alert message
     *
     * @param {object} message The message content
     *
     * @returns {void}
     */
    const showMessage = (message) => {
        if ((message)) {
            const {
                lib: sLibName,
                type: sType,
                content: { title: sTitle, phrase },
            } = message;
            const xLib = dialog.get(sLibName);
            xLib.alert(sType, self.makePhrase(phrase), sTitle);
        }
    };

    /**
     * @param {array} aCalls The calls to execute
     * @param {array} aCondition The condition to chek
     * @param {object} oMessage The message to show if the condition is not met
     * @param {object} oCallContext The context to execute calls in.
     *
     * @returns {boolean}
     */
    const execWithCondition = (aCalls, aCondition, oMessage, oCallContext) => {
        const [sOperator, xLeftArg, xRightArg] = aCondition;
        const xComparator = xComparators[sOperator] ?? xErrors.comparator;
        xComparator(getValue(xLeftArg), getValue(xRightArg)) ?
            execCalls(aCalls, oCallContext) : showMessage(oMessage);
    };

    /**
     * @param {array} aCalls The calls to execute
     * @param {object} oQuestion The confirmation question
     * @param {object} oMessage The message to show if the user anwsers no to the question
     * @param {object} oCallContext The context to execute calls in.
     *
     * @returns {boolean}
     */
    const execWithConfirmation = (aCalls, oQuestion, oMessage, oCallContext) => {
        const { lib: sLibName, phrase } = oQuestion;
        const xLib = dialog.get(sLibName);
        xLib.confirm(self.makePhrase(phrase), '',
            () => execCalls(aCalls, oCallContext), () => showMessage(oMessage));
    };

    /**
     * Execute the javascript code represented by an expression object.
     *
     * @param {object} xExpression
     * @param {object} oCallContext The context to execute calls in.
     *
     * @returns {mixed}
     */
    const execExpression = (xExpression, oCallContext) => {
        const { calls, question, condition, message } = xExpression;
        if((question)) {
            execWithConfirmation(calls, question, message, oCallContext);
            return;
        }
        if((condition)) {
            execWithCondition(calls, condition, message, oCallContext);
            return;
        }
        return execCalls(calls, oCallContext);
    };

    /**
     * Execute the javascript code represented by an expression object.
     *
     * @param {object} xExpression An object representing a command
     * @param {object=} oCallContext The context to execute calls in.
     *
     * @returns {mixed}
     */
    self.execExpr = (xExpression, oCallContext) => !types.isObject(xExpression) ? null :
        execExpression(xExpression, { target: window, ...oCallContext });
})(jaxon.call.json, jaxon.call.query, jaxon.dialog.lib, jaxon.utils.dom,
    jaxon.utils.form, jaxon.utils.types);


/**
 * Class: jaxon.call.query
 */

(function(self, jq) {
    /**
     * The jQuery object.
     * Will be undefined if the library is not installed.
     *
     * @var {object}
     */
    self.jq = jq;

    /**
     * Call the jQuery DOM selector
     *
     * @param {string|object} xSelector
     * @param {object} xContext
     *
     * @returns {object}
     */
    self.select = (xSelector, xContext = null) => {
        // Todo: Allow the use of an alternative library instead of jQuery.
        return !xContext ? self.jq(xSelector) : self.jq(xSelector, xContext);
    };
})(jaxon.call.query, window.jQuery);


/**
 * Class: jaxon.ajax.callback
 */

(function(self, types, config) {
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
    self.create = (responseDelayTime, expirationTime) => ({
        timers: {
            onResponseDelay: setupTimer(responseDelayTime ?? config.defaultResponseDelayTime),
            onExpiration: setupTimer(expirationTime ?? config.defaultExpirationTime),
        },
        onInitialize: null,
        onProcessParams: null,
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
        const callback = self.create();

        let callbackFound = false;
        aCallbackNames.forEach(sName => {
            if (oRequest[sName] !== undefined) {
                callback[sName] = oRequest[sName];
                callbackFound = true;
                delete oRequest[sName];
            }
        });

        if (oRequest.callback === undefined) {
            oRequest.callback = callback;
            return;
        }
        // Add the timers attribute, if it is not defined.
        if (oRequest.callback.timers === undefined) {
            oRequest.callback.timers = {};
        }
        if (callbackFound) {
            oRequest.callback = [oRequest.callback, callback];
        }
    };

    /**
     * Get a flatten array of callbacks
     *
     * @param {object} oRequest The request context object.
     *
     * @returns {array}
     */
    const getCallbacks = (oRequest) => {
        if(!oRequest.callback)
        {
            return [self.callback];
        }
        if(types.isArray(oRequest.callback))
        {
            return [self.callback, ...oRequest.callback];
        }
        return [self.callback, oRequest.callback];
    };

    /**
     * Execute a callback event.
     *
     * @param {object} oCallback The callback object (or objects) which contain the event handlers to be executed.
     * @param {string} sFunction The name of the event to be triggered.
     * @param {object} oRequest The callback argument.
     *
     * @returns {void}
     */
    const execute = (oCallback, sFunction, oRequest) => {
        const func = oCallback[sFunction];
        const timer = !oCallback.timers ? null : oCallback.timers[sFunction];
        if (!func || !types.isFunction(func)) {
            return;
        }
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
})(jaxon.ajax.callback, jaxon.utils.types, jaxon.config);


/**
 * Class: jaxon.ajax.handler
 */

(function(self, config, rsp, json, queue, dom, dialog) {
    /**
     * An array that is used internally in the jaxon.fn.handler object to keep track
     * of command handlers that have been registered.
     *
     * @var {object}
     */
    const handlers = {};

    /**
     * The queues that hold synchronous requests as they are sent and processed.
     *
     * @var {object}
     */
    self.q = {
        send: queue.create(config.requestQueueSize),
        recv: queue.create(config.requestQueueSize * 2)
    };

    /**
     * Registers a new command handler.
     *
     * @param {string} name The short name of the command handler.
     * @param {string} func The command handler function.
     * @param {string=''} desc The description of the command handler.
     *
     * @returns {void}
     */
    self.register = (name, func, desc = '') => handlers[name] = { desc, func };

    /**
     * Unregisters and returns a command handler.
     *
     * @param {string} name The name of the command handler.
     *
     * @returns {callable|null} The unregistered function.
     */
    self.unregister = (name) => {
        const handler = handlers[name];
        if (!handler) {
            return null;
        }
        delete handlers[name];
        return handler.func;
    };

    /**
     * @param {object} command The response command to be executed.
     * @param {string} command.name The name of the function.
     *
     * @returns {boolean}
     */
    self.isRegistered = ({ name }) => name !== undefined && handlers[name] !== undefined;

    /**
     * Calls the registered command handler for the specified command
     * (you should always check isRegistered before calling this function)
     *
     * @param {object} name The command name.
     * @param {object} args The command arguments.
     * @param {object} command The response command to be executed.
     *
     * @returns {boolean}
     */
    const callHandler = (name, args, command) => {
        const { func, desc } = handlers[name];
        return func(args, { ...command, desc });
    }

    /**
     * Perform a lookup on the command specified by the response command object passed
     * in the first parameter.  If the command exists, the function checks to see if
     * the command references a DOM object by ID; if so, the object is located within
     * the DOM and added to the command data.  The command handler is then called.
     * 
     * @param {object} command The response command to be executed.
     *
     * @returns {true} The command completed successfully.
     * @returns {false} The command signalled that it needs to pause processing.
     */
    self.execute = (command) => {
        const { name, args } = command;
        if (!self.isRegistered({ name })) {
            return true;
        }
        // If the command has an "id" attr, find the corresponding dom element.
        const id = args?.id;
        if ((id)) {
            args.target = dom.$(id);
        }
        // Process the command
        return callHandler(name, args, command);
    };

    /**
     * Attempt to pop the next asynchronous request.
     *
     * @param {object} oQueue The queue object you would like to modify.
     *
     * @returns {object|null}
     */
    self.popAsyncRequest = oQueue => {
        if (queue.empty(oQueue) || queue.peek(oQueue).mode === 'synchronous') {
            return null;
        }
        return queue.pop(oQueue);
    }

    /**
     * Causes the processing of items in the queue to be delayed for the specified amount of time.
     * This is an asynchronous operation, therefore, other operations will be given an opportunity
     * to execute during this delay.
     *
     * @param {object} args The command arguments.
     * @param {integer} args.duration The number of 10ths of a second to sleep.
     * @param {object} command The Response command object.
     * @param {object} command.commandQueue The command queue.
     *
     * @returns {true} The queue processing is temporarily paused.
     */
    self.sleep = ({ duration }, { commandQueue }) => {
        // The command queue is paused, and will be restarted after the specified delay.
        commandQueue.paused = true;
        setTimeout(() => {
            commandQueue.paused = false;
            rsp.processCommands(commandQueue);
        }, duration * 100);
        return true;
    };

    /**
     * The function to run after the confirm question, for the comfirmCommands.
     *
     * @param {object} commandQueue The command queue.
     * @param {integer=0} skipCount The number of commands to skip.
     *
     * @returns {void}
     */
    const restartProcessing = (commandQueue, skipCount = 0) => {
        // Skip commands.
        // The last entry in the queue is not a user command, thus it cannot be skipped.
        while (skipCount > 0 && commandQueue.count > 1 && queue.pop(commandQueue) !== null) {
            --skipCount;
        }
        commandQueue.paused = false;
        rsp.processCommands(commandQueue);
    };

    /**
     * Prompt the user with the specified question, if the user responds by clicking cancel,
     * then skip the specified number of commands in the response command queue.
     * If the user clicks Ok, the command processing resumes normal operation.
     *
     * @param {object} args The command arguments.
     * @param {integer} args.count The number of commands to skip.
     * @param {object} args.question The question to ask.
     * @param {string} args.question.lib The dialog library to use.
     * @param {object} args.question.phrase The question content.
     * @param {object} command The Response command object.
     * @param {object} command.commandQueue The command queue.
     *
     * @returns {true} The queue processing is temporarily paused.
     */
    self.confirm = ({ count: skipCount, question: { lib: sLibName, phrase } }, { commandQueue }) => {
        // The command queue is paused, and will be restarted after the confirm question is answered.
        commandQueue.paused = true;
        const xLib = dialog.get(sLibName);
        xLib.confirm(json.makePhrase(phrase), '', () => restartProcessing(commandQueue),
            () => restartProcessing(commandQueue, skipCount));
        return true;
    };
})(jaxon.ajax.handler, jaxon.config, jaxon.ajax.response, jaxon.call.json,
    jaxon.utils.queue, jaxon.utils.dom, jaxon.dialog.lib);


/**
 * Class: jaxon.ajax.parameters
 */

(function(self, types, version) {
    /**
     * The array of data bags
     *
     * @type {object}
     */
    const databags = {};

    /**
     * Stringify a parameter of an ajax call.
     *
     * @param {mixed} oVal - The value to be stringified
     *
     * @returns {string}
     */
    const stringify = (oVal) => {
        if (oVal === undefined ||  oVal === null) {
            return '*';
        }
        const sType = types.of(oVal);
        if (sType === 'object' || sType === 'array') {
            try {
                return encodeURIComponent(JSON.stringify(oVal));
            } catch (e) {
                oVal = '';
                // do nothing, if the debug module is installed
                // it will catch the exception and handle it
            }
        }
        oVal = encodeURIComponent(oVal);
        if (sType === 'string') {
            return 'S' + oVal;
        }
        if (sType === 'boolean') {
            return 'B' + oVal;
        }
        if (sType === 'number') {
            return 'N' + oVal;
        }
        return oVal;
    };

    /**
     * Save data in the data bag.
     *
     * @param {string} sBag   The data bag name.
     * @param {object} oValues The values to save in the data bag.
     *
     * @return {void}
     */
    self.setBag = (sBag, oValues) => databags[sBag] = oValues;

    /**
     * Save data in the data bag.
     *
     * @param {object} oValues The values to save in the data bag.
     *
     * @return {void}
     */
    self.setBags = (oValues) => Object.keys(oValues).forEach(sBag => self.setBag(sBag, oValues[sBag]));

    /**
     * Clear an entry in the data bag.
     *
     * @param {string} sBag   The data bag name.
     *
     * @return {void}
     */
    self.clearBag = (sBag) => delete databags[sBag];

    /**
     * Make the databag object to send in the HTTP request.
     *
     * @param {array} aBags The data bag names.
     *
     * @return {object}
     */
    const getBagsValues = (aBags) => JSON.stringify(aBags.reduce((oValues, sBag) => ({
        ...oValues,
        [sBag]: databags[sBag] ?? '*' }
    ), {}));

    /**
     * Sets the request parameters in a container.
     *
     * @param {object} oRequest The request object
     * @param {object} oRequest.func The function to call on the server app.
     * @param {object} oRequest.parameters The parameters to pass to the function.
     * @param {array=} oRequest.bags The keys of values to get from the data bag.
     * @param {callable} fSetter A function that sets a single parameter
     *
     * @return {void}
     */
    const setParams = ({ func, parameters, bags = [] }, fSetter) => {
        const dNow = new Date();
        fSetter('jxnr', dNow.getTime());
        fSetter('jxnv', `${version.major}.${version.minor}.${version.patch}`);

        Object.keys(func).forEach(sParam => fSetter(sParam, encodeURIComponent(func[sParam])));

        // The parameters value was assigned from the js "arguments" var in a function. So it
        // is an array-like object, that we need to convert to a real array => [...parameters].
        // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
        [...parameters].forEach(xParam => fSetter('jxnargs[]', stringify(xParam)));

        bags.length > 0 && fSetter('jxnbags', encodeURIComponent(getBagsValues(bags)));
    };

    /**
     * Processes request specific parameters and store them in a FormData object.
     *
     * @param {object} oRequest
     *
     * @return {FormData}
     */
    const getFormDataParams = (oRequest) => {
        const rd = new FormData();
        setParams(oRequest, (sParam, sValue) => rd.append(sParam, sValue));

        // Files to upload
        const input = oRequest.upload.input;
        input.files && input.files.forEach(file => rd.append(input.name, file));
        return rd;
    };

    /**
     * Processes request specific parameters and store them in an URL encoded string.
     *
     * @param {object} oRequest
     *
     * @return {string}
     */
    const getUrlEncodedParams = (oRequest) => {
        const rd = [];
        setParams(oRequest, (sParam, sValue) => rd.push(sParam + '=' + sValue));

        if (oRequest.method === 'POST') {
            return rd.join('&');
        }
        // Move the parameters to the URL for HTTP GET requests
        oRequest.requestURI += (oRequest.requestURI.indexOf('?') === -1 ? '?' : '&') + rd.join('&');
        return ''; // The request body is empty
    };

    /**
     * Check if the request has files to upload.
     *
     * @param {object} oRequest The request object
     * @param {object} oRequest.upload The upload object
     *
     * @return {boolean}
     */
    const hasUpload = ({ upload }) => upload && upload.ajax && upload.input;

    /**
     * Processes request specific parameters and generates the temporary
     * variables needed by jaxon to initiate and process the request.
     *
     * Note:
     * This is called once per request; upon a request failure, this will not be called for additional retries.
     *
     * @param {object} oRequest The request object
     *
     * @return {void}
     */
    self.process = (oRequest) => {
        // Make request parameters.
        oRequest.requestURI = oRequest.URI;
        oRequest.requestData = hasUpload(oRequest) ?
            getFormDataParams(oRequest) : getUrlEncodedParams(oRequest);
    };
})(jaxon.ajax.parameters, jaxon.utils.types, jaxon.version);


/**
 * Class: jaxon.ajax.request
 */

(function(self, cfg, params, rsp, cbk, handler, upload, queue) {
    /**
     * Initialize a request object.
     *
     * @param {object} oRequest An object that specifies call specific settings that will,
     *      in addition, be used to store all request related values.
     *      This includes temporary values used internally by jaxon.
     *
     * @returns {boolean}
     */
    const initialize = (oRequest) => {
        cbk.execute(oRequest, 'onInitialize');

        cfg.setRequestOptions(oRequest);
        cbk.initCallbacks(oRequest);

        oRequest.status = (oRequest.statusMessages) ? cfg.status.update : cfg.status.dontUpdate;
        oRequest.cursor = (oRequest.waitCursor) ? cfg.cursor.update : cfg.cursor.dontUpdate;

        // Look for upload parameter
        upload.initialize(oRequest);

        // No request is submitted while there are pending requests in the outgoing queue.
        oRequest.submit = queue.empty(handler.q.send);
        if (oRequest.mode === 'synchronous') {
            // Synchronous requests are always queued, in both send and recv queues.
            queue.push(handler.q.send, oRequest);
            queue.push(handler.q.recv, oRequest);
        }
        // Asynchronous requests are queued in send queue only if they are not submitted.
        oRequest.submit || queue.push(handler.q.send, oRequest);
    };

    /**
     * Prepare a request, by setting the HTTP options, handlers and processor.
     *
     * @param {object} oRequest The request context object.
     *
     * @return {void}
     */
    const prepare = (oRequest) => {
        cbk.execute(oRequest, 'onPrepare');

        oRequest.httpRequestOptions = {
            ...cfg.httpRequestOptions,
            method: oRequest.method,
            headers: {
                ...oRequest.commonHeaders,
                ...(oRequest.method === 'POST' ? oRequest.postHeaders : oRequest.getHeaders),
            },
            body: oRequest.requestData,
        };

        oRequest.responseConverter = (response) => {
            // Save the reponse object
            oRequest.response = response;
            // Get the response content
            return oRequest.convertResponseToJson ? response.json() : response.text();
        };
        oRequest.responseHandler = (responseContent) => {
            oRequest.responseContent = responseContent;
            // Synchronous request are processed immediately.
            // Asynchronous request are processed only if the queue is empty.
            if (queue.empty(handler.q.send) || oRequest.mode === 'synchronous') {
                rsp.received(oRequest);
            } else {
                queue.push(handler.q.recv, oRequest);
            }
        };
        oRequest.errorHandler = (error) => {
            cbk.execute(oRequest, 'onFailure');
            throw error;
        };
        if (!oRequest.responseProcessor) {
            oRequest.responseProcessor = rsp.jsonProcessor;
        }
    };

    /**
     * Create a request object and submit the request using the specified request type;
     * all request parameters should be finalized by this point.
     * Upon failure of a POST, this function will fall back to a GET request.
     *
     * @param {object} oRequest The request context object.
     *
     * @returns {mixed}
     */
    const submit = (oRequest) => {
        --oRequest.requestRetry;
        oRequest.status.onRequest();

        // The onResponseDelay and onExpiration aren't called immediately, but a timer
        // is set to call them later, using delays that are set in the config.
        cbk.execute(oRequest, 'onResponseDelay');
        cbk.execute(oRequest, 'onExpiration');

        cbk.execute(oRequest, 'onRequest');
        oRequest.cursor.onWaiting();
        oRequest.status.onWaiting();

        fetch(oRequest.requestURI, oRequest.httpRequestOptions)
            .then(oRequest.responseConverter)
            .then(oRequest.responseHandler)
            .catch(oRequest.errorHandler);

        return oRequest.returnValue;
    };

    /**
     * Clean up the request object.
     *
     * @param {object} oRequest The request context object.
     *
     * @returns {void}
     */
    const cleanUp = (oRequest) => {
        // clean up -- these items are restored when the request is initiated
        delete oRequest.func;
        delete oRequest.URI;
        delete oRequest.requestURI;
        delete oRequest.requestData;
        delete oRequest.requestRetry;
        delete oRequest.httpRequestOptions;
        delete oRequest.responseHandler;
        delete oRequest.responseConverter;
        delete oRequest.responseContent;
        delete oRequest.response;
        delete oRequest.errorHandler;
    };

    /**
     * Called by the response command queue processor when all commands have been processed.
     *
     * @param {object} oRequest The request context object.
     *
     * @return {void}
     */
    self.complete = (oRequest) => {
        cbk.execute(oRequest, 'onComplete');
        oRequest.cursor.onComplete();
        oRequest.status.onComplete();

        cleanUp(oRequest);

        // All the requests and responses queued while waiting must now be processed.
        if(oRequest.mode === 'synchronous') {
            // Remove the current request from the send and recv queues.
            queue.pop(handler.q.send);
            queue.pop(handler.q.recv);
            // Process the asynchronous responses received while waiting.
            while((recvRequest = handler.popAsyncRequest(handler.q.recv)) !== null) {
                rsp.received(recvRequest);
            }
            // Submit the asynchronous requests sent while waiting.
            while((nextRequest = handler.popAsyncRequest(handler.q.send)) !== null) {
                submit(nextRequest);
            }
            // Submit the next synchronous request, if there's any.
            if((nextRequest = queue.peek(handler.q.send)) !== null) {
                submit(nextRequest);
            }
        }
    };

    /**
     * Abort the request.
     *
     * @param {object} oRequest The request context object.
     *
     * @returns {void}
     */
    self.abort = (oRequest) => {
        oRequest.aborted = true;
        self.complete(oRequest);
    };

    /**
     * Initiates a request to the server.
     *
     * @param {object} func An object containing the name of the function to
     *      execute on the server. The standard request is: {jxnfun:'function_name'}
     * @param {object=} funcArgs A request object which may contain call specific parameters.
     *      This object will be used by jaxon to store all the request parameters as well as
     *      temporary variables needed during the processing of the request.
     *
     * @returns {boolean}
     */
    self.execute = (func, funcArgs) => {
        if (func === undefined) {
            return false;
        }

        const oRequest = funcArgs ?? {};
        oRequest.func = func;
        initialize(oRequest);

        cbk.execute(oRequest, 'onProcessParams');
        params.process(oRequest);

        while (oRequest.requestRetry > 0) {
            try {
                prepare(oRequest);
                return oRequest.submit ? submit(oRequest) : null;
            }
            catch (e) {
                cbk.execute(oRequest, 'onFailure');
                if (oRequest.requestRetry === 0) {
                    throw e;
                }
            }
        }
        return true;
    };
})(jaxon.ajax.request, jaxon.config, jaxon.ajax.parameters, jaxon.ajax.response,
    jaxon.ajax.callback, jaxon.ajax.handler, jaxon.utils.upload, jaxon.utils.queue);


/**
 * Class: jaxon.ajax.response
 */

(function(self, config, handler, req, cbk, queue, types) {
    /**
     * This array contains a list of codes which will be returned from the server upon
     * successful completion of the server portion of the request.
     *
     * These values should match those specified in the HTTP standard.
     *
     * @var {array}
     */
    const successCodes = [0, 200];

    // 10.4.1 400 Bad Request
    // 10.4.2 401 Unauthorized
    // 10.4.3 402 Payment Required
    // 10.4.4 403 Forbidden
    // 10.4.5 404 Not Found
    // 10.4.6 405 Method Not Allowed
    // 10.4.7 406 Not Acceptable
    // 10.4.8 407 Proxy Authentication Required
    // 10.4.9 408 Request Timeout
    // 10.4.10 409 Conflict
    // 10.4.11 410 Gone
    // 10.4.12 411 Length Required
    // 10.4.13 412 Precondition Failed
    // 10.4.14 413 Request Entity Too Large
    // 10.4.15 414 Request-URI Too Long
    // 10.4.16 415 Unsupported Media Type
    // 10.4.17 416 Requested Range Not Satisfiable
    // 10.4.18 417 Expectation Failed
    // 10.5 Server Error 5xx
    // 10.5.1 500 Internal Server Error
    // 10.5.2 501 Not Implemented
    // 10.5.3 502 Bad Gateway
    // 10.5.4 503 Service Unavailable
    // 10.5.5 504 Gateway Timeout
    // 10.5.6 505 HTTP Version Not Supported

    /**
     * This array contains a list of status codes returned by the server to indicate
     * that the request failed for some reason.
     *
     * @var {array}
     */
    const errorsForAlert = [400, 401, 402, 403, 404, 500, 501, 502, 503];

    // 10.3.1 300 Multiple Choices
    // 10.3.2 301 Moved Permanently
    // 10.3.3 302 Found
    // 10.3.4 303 See Other
    // 10.3.5 304 Not Modified
    // 10.3.6 305 Use Proxy
    // 10.3.7 306 (Unused)
    // 10.3.8 307 Temporary Redirect

    /**
     * An array of status codes returned from the server to indicate a request for redirect to another URL.
     *
     * Typically, this is used by the server to send the browser to another URL.
     * This does not typically indicate that the jaxon request should be sent to another URL.
     *
     * @var {array}
     */
    const redirectCodes = [301, 302, 307];

    /**
     * Parse the JSON response into a series of commands.
     *
     * @param {object} oRequest The request context object.
     *
     * @return {void}
     */
    const queueCommands = (oRequest) => {
        if (!types.isObject(oRequest.responseContent)) {
            return;
        }
        const {
            debug: { message } = {},
            jxn: { value, commands = [] } = {},
        } = oRequest.responseContent;

        oRequest.status.onProcessing();

        if (value) {
            oRequest.returnValue = value;
        }

        message && console.log(message);

        let sequence = 0;
        commands.forEach(command => queue.push(oRequest.commandQueue, {
            fullName: '*unknown*',
            ...command,
            sequence: sequence++,
            commandQueue: oRequest.commandQueue,
            request: oRequest,
            context: oRequest.context,
        }));
        // Queue a last command to clear the queue
        queue.push(oRequest.commandQueue, {
            name: 'response.complete',
            fullName: 'Response Complete',
            sequence: sequence,
            commandQueue: oRequest.commandQueue,
            request: oRequest,
            context: oRequest.context,
        });
    };

    /**
     * Process a single command
     * 
     * @param {object} command The command to process
     *
     * @returns {boolean}
     */
    const processCommand = (command) => {
        try {
            return handler.execute(command);
            // queue.pushFront(commandQueue, command);
            // return false;
        } catch (e) {
            console.log(e);
        }
        return true;
    };

    /**
     * While entries exist in the queue, pull and entry out and process it's command.
     * When commandQueue.paused is set to true, the processing is halted.
     *
     * Note:
     * - Set commandQueue.paused to false and call this function to cause the queue processing to continue.
     * - When an exception is caught, do nothing; if the debug module is installed, it will catch the exception and handle it.
     *
     * @param {object} commandQueue A queue containing the commands to execute.
     *
     * @returns {true} The queue was fully processed and is now empty.
     * @returns {false} The queue processing was halted before the queue was fully processed.
     */
    self.processCommands = (commandQueue) => {
        // Stop processing the commands if the queue is paused.
        let command = null;
        while (!commandQueue.paused && (command = queue.pop(commandQueue)) !== null) {
            if (!processCommand(command)) {
                return false;
            }
        }
        return true;
    };

    /**
     * This is the JSON response processor.
     *
     * @param {object} oRequest The request context object.
     *
     * @return {mixed}
     */
    self.jsonProcessor = (oRequest) => {
        if (successCodes.indexOf(oRequest.response.status) >= 0/*oRequest.response.ok*/) {
            cbk.execute(oRequest, 'onSuccess');
            // Queue and process the commands in the response.
            queueCommands(oRequest)
            self.processCommands(oRequest.commandQueue);
            return oRequest.returnValue;
        }
        if (redirectCodes.indexOf(oRequest.response.status) >= 0) {
            cbk.execute(oRequest, 'onRedirect');
            req.complete(oRequest);
            window.location = oRequest.response.headers.get('location');
            return oRequest.returnValue;
        }
        if (errorsForAlert.indexOf(oRequest.response.status) >= 0) {
            cbk.execute(oRequest, 'onFailure');
            req.complete(oRequest);
            return oRequest.returnValue;
        }
        return oRequest.returnValue;
    };

    /**
     * Process the response.
     *
     * @param {object} oRequest The request context object.
     *
     * @return {mixed}
     */
    self.received = (oRequest) => {
        // Sometimes the response.received gets called when the request is aborted
        if (oRequest.aborted) {
            return null;
        }

        // Create a queue for the commands in the response.
        oRequest.commandQueue = queue.create(config.commandQueueSize);

        // The response is successfully received, clear the timers for expiration and delay.
        cbk.clearTimer(oRequest, 'onExpiration');
        cbk.clearTimer(oRequest, 'onResponseDelay');
        cbk.execute(oRequest, 'beforeResponseProcessing');

        return oRequest.responseProcessor(oRequest);
    };
})(jaxon.ajax.response, jaxon.config, jaxon.ajax.handler, jaxon.ajax.request,
    jaxon.ajax.callback, jaxon.utils.queue, jaxon.utils.types);


/**
 * Class: jaxon.cmd.body
 */

(function(self, dom, types, baseDocument) {
    /**
     * Assign an element's attribute to the specified value.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The HTML element to effect.
     * @param {string} args.attr The name of the attribute to set.
     * @param {string} args.value The new value to be applied.
     *
     * @returns {true} The operation completed successfully.
     */
    self.assign = ({ target, attr, value }) => {
        if (attr === 'innerHTML') {
            target.innerHTML = value;
            return true;
        }
        if (attr === 'outerHTML') {
            target.outerHTML = value;
            return true;
        }

        const xElt = dom.getInnerObject(attr, target);
        if (xElt !== null) {
            xElt.node[xElt.attr] = value;
        }
        return true;
    };

    /**
     * Append the specified value to an element's attribute.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The HTML element to effect.
     * @param {string} args.attr The name of the attribute to append to.
     * @param {string} args.value The new value to be appended.
     *
     * @returns {true} The operation completed successfully.
     */
    self.append = ({ target, attr, value }) => {
        if (attr === 'innerHTML') {
            target.innerHTML = target.innerHTML + value;
            return true;
        }
        if (attr === 'outerHTML') {
            target.outerHTML = target.outerHTML + value;
            return true;
        }

        const xElt = dom.getInnerObject(attr, target);
        if (xElt !== null) {
            xElt.node[xElt.attr] = xElt.node[xElt.attr] + value;
        }
        return true;
    };

    /**
     * Prepend the specified value to an element's attribute.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The HTML element to effect.
     * @param {string} args.attr The name of the attribute.
     * @param {string} args.value The new value to be prepended.
     *
     * @returns {true} The operation completed successfully.
     */
    self.prepend = ({ target, attr, value }) => {
        if (attr === 'innerHTML') {
            target.innerHTML = value + target.innerHTML;
            return true;
        }
        if (attr === 'outerHTML') {
            target.outerHTML = value + target.outerHTML;
            return true;
        }

        const xElt = dom.getInnerObject(attr, target);
        if (xElt !== null) {
            xElt.node[xElt.attr] = value + xElt.node[xElt.attr];
        }
        return true;
    };

    /**
     * Replace a text in the value of a given attribute in an element
     *
     * @param {object} xElement The element to search in
     * @param {string} sAttribute The attribute to search in
     * @param {string} sSearch The text to search
     * @param {string} sReplace The text to use as replacement
     *
     * @returns {void}
     */
    const replaceText = (xElement, sAttribute, sSearch, sReplace) => {
        const bFunction = types.isFunction(xElement[sAttribute]);
        const sCurText = bFunction ? xElement[sAttribute].join('') : xElement[sAttribute];
        const sNewText = sCurText.replaceAll(sSearch, sReplace);
        if (bFunction || dom.willChange(xElement, sAttribute, sNewText)) {
            xElement[sAttribute] = sNewText;
        }
    };

    /**
     * Search and replace the specified text.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The element which is to be modified.
     * @param {string} args.attr The name of the attribute to be set.
     * @param {array} args.search The search text and replacement text.
     * @param {array} args.replace The search text and replacement text.
     *
     * @returns {true} The operation completed successfully.
     */
    self.replace = ({ target, attr, search, replace }) => {
        const sSearch = attr === 'innerHTML' ? dom.getBrowserHTML(search) : search;
        const xElt = dom.getInnerObject(attr, target);
        if (xElt !== null) {
            replaceText(xElt.node, xElt.attr, sSearch, replace);
        }
        return true;
    };

    /**
     * Clear an element.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The element which is to be modified.
     * @param {string} args.attr The name of the attribute to clear.
     *
     * @returns {true} The operation completed successfully.
     */
    self.clear = ({ target, attr }) => {
        self.assign({ target, attr, value: '' });
        return true;
    };

    /**
     * Delete an element.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The element which will be deleted.
     *
     * @returns {true} The operation completed successfully.
     */
    self.remove = ({ target }) => {
        dom.removeElement(target);
        return true;
    };

    /**
     * @param {string} sTag The tag name for the new element.
     * @param {string} sId The id attribute of the new element.
     *
     * @returns {object}
     */
    const createNewTag = (sTag, sId) => {
        const newTag = baseDocument.createElement(sTag);
        newTag.setAttribute('id', sId);
        return newTag;
    };

    /**
     * Create a new element and append it to the specified parent element.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The element which will contain the new element.
     * @param {string} args.tag.name The tag name for the new element.
     * @param {string} args.tag.id The id attribute of the new element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.create = ({ target, tag: { id: sId, name: sTag } }) => {
        target && target.appendChild(createNewTag(sTag, sId));
        return true;
    };

    /**
     * Insert a new element before the specified element.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The element that will be used as the reference point for insertion.
     * @param {string} args.tag.name The tag name for the new element.
     * @param {string} args.tag.id The id attribute of the new element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.insert = ({ target, tag: { id: sId, name: sTag } }) => {
        target && target.parentNode &&
            target.parentNode.insertBefore(createNewTag(sTag, sId), target);
        return true;
    };

    /**
     * Insert a new element after the specified element.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The element that will be used as the reference point for insertion.
     * @param {string} args.tag.name The tag name for the new element.
     * @param {string} args.tag.id The id attribute of the new element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.insertAfter = ({ target, tag: { id: sId, name: sTag } }) => {
        target && target.parentNode &&
            target.parentNode.insertBefore(createNewTag(sTag, sId), target.nextSibling);
        return true;
    };
})(jaxon.cmd.body, jaxon.utils.dom, jaxon.utils.types, jaxon.config.baseDocument);


/**
 * Class: jaxon.cmd.event
 */

(function(self, json, dom, str) {
    /**
     * Add an event handler to the specified target.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The target element
     * @param {string} args.event The name of the event.
     * @param {string} args.func The name of the function to be called
     *
     * @returns {true} The operation completed successfully.
     */
    self.addHandler = ({ target, event: sEvent, func: sFuncName }) => {
        target.addEventListener(str.stripOnPrefix(sEvent), dom.findFunction(sFuncName), false)
        return true;
    };

    /**
     * Remove an event handler from an target.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The target element
     * @param {string} args.event The name of the event.
     * @param {string} args.func The name of the function to be removed
     *
     * @returns {true} The operation completed successfully.
     */
    self.removeHandler = ({ target, event: sEvent, func: sFuncName }) => {
       target.removeEventListener(str.stripOnPrefix(sEvent), dom.findFunction(sFuncName), false);
       return true;
    };

    /**
     * Call an event handler.
     *
     * @param {object} target The target element
     * @param {string} event The name of the event
     * @param {object} func The expression to be executed in the event handler
     *
     * @returns {void}
     */
    const callEventHandler = (event, target, func) => {
        json.execExpr({ _type: 'expr', ...func }, { event, target });
    };

    /**
     * Add an event handler with arguments to the specified target.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The target element
     * @param {string} args.event The name of the event
     * @param {object} args.func The event handler
     * @param {object|false} args.options The handler options
     *
     * @returns {true} The operation completed successfully.
     */
    self.addEventHandler = ({ target, event: sEvent, func, options }) => {
        target.addEventListener(str.stripOnPrefix(sEvent),
            (evt) => callEventHandler(evt, target, func), options ?? false);
        return true;
    };

    /**
     * Set an event handler with arguments to the specified target.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The target element
     * @param {string} args.event The name of the event
     * @param {object} args.func The event handler
     *
     * @returns {true} The operation completed successfully.
     */
    self.setEventHandler = ({ target, event: sEvent, func }) => {
        target[str.addOnPrefix(sEvent)] = (evt) => callEventHandler(evt, target, func);
        return true;
    };
})(jaxon.cmd.event, jaxon.call.json, jaxon.utils.dom, jaxon.utils.string);


/**
 * Class: jaxon.cmd.script
 */

(function(self, json, parameters, types) {
    /**
     * Call a javascript function with a series of parameters using the current script context.
     *
     * @param {object} args The command arguments.
     * @param {string} args.func The name of the function to call.
     * @param {array} args.args  The parameters to pass to the function.
     * @param {object} command The Response command object.
     * @param {object} command.context The javascript object to be referenced as 'this' in the script.
     *
     * @returns {true} The operation completed successfully.
     */
    self.call = ({ func, args }, { context = {} }) => {
        // Add the function in the context
        json.execCall({ _type: 'func', _name: func, args }, context);
        return true;
    };

    /**
     * Redirects the browser to the specified URL.
     *
     * @param {object} args The command arguments.
     * @param {string} args.url The new URL to redirect to
     * @param {integer} args.delay The time to wait before the redirect.
     *
     * @returns {true} The operation completed successfully.
     */
    self.redirect = ({ url: sUrl, delay: nDelay }) => {
        if (nDelay <= 0) {
            window.location = sUrl;
            return true;
        }
        window.setTimeout(() => window.location = sUrl, nDelay * 1000);
        return true;
    };

    /**
     * Update the databag content.
     *
     * @param {object} args The command arguments.
     * @param {string} args.values The databag values.
     *
     * @returns {true} The operation completed successfully.
     */
    self.setDatabag = ({ values }) => {
        parameters.setBags(values);
        return true;
    };

    /**
     * Execute a JQuery expression beginning with selector.
     *
     * @param {object} args The command arguments.
     * @param {object} args.selector The JQuery expression
     *
     * @returns {true} The operation completed successfully.
     */
    self.jquery = ({ selector }) => {
        json.execExpr(selector);
        return true;
    };

    /**
     * Replace the page number argument with the current page number value
     *
     * @param {array} aArgs
     * @param {object} oLink
     *
     * @returns {array}
     */
    const getCallArgs = (aArgs, oLink) => aArgs.map(xArg =>
        types.isObject(xArg) && xArg._type === 'page' ?
        parseInt(oLink.parentNode.getAttribute('data-page')) : xArg);

    /**
     * Set event handlers on pagination links.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The pagination wrapper id
     * @param {object} args.target The pagination wrapper element
     * @param {object} args.func The page call expression
     *
     * @returns {true} The operation completed successfully.
     */
    self.paginate = ({ target, func: oCall }) => {
        const aLinks = target.querySelectorAll(`li.enabled > a`);
        const { args: aArgs } = oCall;
        aLinks.forEach(oLink => oLink.addEventListener('click', () => json.execCall({
            ...oCall,
            _type: 'func',
            args: getCallArgs(aArgs, oLink),
        })));
        return true;
    };
})(jaxon.cmd.script, jaxon.call.json, jaxon.ajax.parameters, jaxon.utils.types);


/**
 * Class: jaxon.dialog.cmd
 */

(function(self, lib, json) {
    /**
     * Find a library to execute a given function.
     *
     * @param {string} sLibName The dialog library name
     * @param {string} sFunc The dialog library function
     *
     * @returns {object|null}
     */
    const getLib = (sLibName, sFunc) => {
        if(!lib.has(sLibName)) {
            console.warn(`Unable to find a Jaxon dialog library with name "${sLibName}".`);
        }

        const xLib = lib.get(sLibName);
        if(!xLib[sFunc]) {
            console.error(`The chosen Jaxon dialog library doesn't implement the "${sFunc}" function.`);
            return null;
        }
        return xLib;
    };

    /**
     * Add an event handler to the specified target.
     *
     * @param {object} command The Response command object.
     * @param {string} command.lib The message library name
     * @param {object} command.type The message type
     * @param {string} command.content The message content
     * @param {string} command.content.title The message title
     * @param {string} command.content.phrase.str The message text with placeholders
     * @param {array} command.content.phrase.args The arguments for placeholders
     *
     * @returns {true} The operation completed successfully.
     */
    self.showMessage = ({ lib: sLibName, type: sType, content }) => {
        const { title: sTitle, phrase } = content;
        const xLib = getLib(sLibName, 'alert');
        xLib && xLib.alert(sType, json.makePhrase(phrase), sTitle);
        return true;
    };

    /**
     * Remove an event handler from an target.
     *
     * @param {object} command The Response command object.
     * @param {string} command.lib The dialog library name
     * @param {object} command.dialog The dialog content
     * @param {string} command.dialog.title The dialog title
     * @param {string} command.dialog.content The dialog HTML content
     * @param {array} command.dialog.buttons The dialog buttons
     * @param {array} command.dialog.options The dialog options
     *
     * @returns {true} The operation completed successfully.
     */
    self.showModal = ({ lib: sLibName, dialog: { title, content, buttons, options } }) => {
        const xLib = getLib(sLibName, 'show');
        xLib && xLib.show(title, content, buttons, options);
       return true;
    };

    /**
     * Set an event handler with arguments to the specified target.
     *
     * @param {object} command The Response command object.
     * @param {string} command.lib The dialog library name
     *
     * @returns {true} The operation completed successfully.
     */
    self.hideModal = ({ lib: sLibName }) => {
        const xLib = getLib(sLibName, 'hide');
        xLib && xLib.hide();
        return true;
    };
})(jaxon.dialog.cmd, jaxon.dialog.lib, jaxon.call.json);


/**
 * Class: jaxon.dialog.lib
 */

(function(self, types, dom, js, jq) {
    const labels = {
        yes: 'Yes',
        no: 'No',
    };

    self.default = {};

    /**
     * Check if a dialog library is defined.
     *
     * @param {string} sName The library name
     *
     * @returns {bool}
     */
    self.has = (sName) => !!self[sName];

    /**
     * Get a dialog library.
     *
     * @param {string=default} sName The library name
     *
     * @returns {object|null}
     */
    self.get = (sName) => self[sName] ?? self.default;

    /**
     * Register a dialog library.
     *
     * @param {string} sName The library name
     * @param {callback} xCallback The library definition callback
     *
     * @returns {void}
     */
    self.register = (sName, xCallback) => {
        // Create an object for the library
        self[sName] = {};
        // Define the library functions
        xCallback(self[sName], { types, dom, js, jq, labels });
    };
})(jaxon.dialog.lib, jaxon.utils.types, jaxon.dom, jaxon.call.json, window.jQuery);

/**
 * Default dialog plugin, based on js alert and confirm functions
 * Class: jaxon.dialog.lib.default
 */

jaxon.dialog.lib.register('default', (self) => {
    /**
     * Show an alert message
     *
     * @param {string} type The message type
     * @param {string} text The message text
     * @param {string} title The message title
     *
     * @returns {void}
     */
    self.alert = (type, text, title) => alert(!title ? text : `<b>${title}</b><br/>${text}`);

    /**
     * Ask a confirm question to the user.
     *
     * @param {string} question The question to ask
     * @param {string} title The question title
     * @param {callback} yesCallback The function to call if the answer is yes
     * @param {callback} noCallback The function to call if the answer is no
     *
     * @returns {void}
     */
    self.confirm = (question, title, yesCallback, noCallback) => {
        if(confirm(!title ? question : `<b>${title}</b><br/>${question}`)) {
            yesCallback();
            return;
        }
        noCallback && noCallback();
    };
});


/*
    File: jaxon.js

    This file contains the definition of the main jaxon javascript core.

    This is the client side code which runs on the web browser or similar web enabled application.
    Include this in the HEAD of each page for which you wish to use jaxon.
*/

/**
 * Initiates a request to the server.
 */
jaxon.request = jaxon.ajax.request.execute;

/**
 * Registers a new command handler.
 * Shortcut to <jaxon.ajax.handler.register>
 */
jaxon.register = jaxon.ajax.handler.register;

/**
 * Shortcut to <jaxon.utils.dom.$>.
 */
jaxon.$ = jaxon.utils.dom.$;

/**
 * Shortcut to the JQuery selector function>.
 */
jaxon.jq = jaxon.call.query.jq;

/**
 * Shortcut to <jaxon.call.json.execExpr>.
 */
jaxon.exec = jaxon.call.json.execExpr;

/**
 * Shortcut to <jaxon.utils.dom.ready>.
 */
jaxon.dom.ready = jaxon.utils.dom.ready;

/**
 * Shortcut to <jaxon.utils.form.getValues>.
 */
jaxon.getFormValues = jaxon.utils.form.getValues;

/**
 * Shortcut to <jaxon.ajax.parameters.setBag>.
 */
jaxon.setBag = jaxon.ajax.parameters.setBag;

/**
 * Indicates if jaxon module is loaded.
 */
jaxon.isLoaded = true;

/**
 * Register the command handlers provided by the library, and initialize the message object.
 */
(function(register, cmd, ajax, dialog) {
    // Pseudo command needed to complete queued commands processing.
    register('response.complete', (args, { request }) => {
        ajax.request.complete(request);
        return true;
    }, 'Response complete');

    register('dom.assign', cmd.body.assign, 'Dom::Assign');
    register('dom.append', cmd.body.append, 'Dom::Append');
    register('dom.prepend', cmd.body.prepend, 'Dom::Prepend');
    register('dom.replace', cmd.body.replace, 'Dom::Replace');
    register('dom.clear', cmd.body.clear, 'Dom::Clear');
    register('dom.remove', cmd.body.remove, 'Dom::Remove');
    register('dom.create', cmd.body.create, 'Dom::Create');
    register('dom.insert.before', cmd.body.insert, 'Dom::InsertBefore');
    register('dom.insert.after', cmd.body.insertAfter, 'Dom::InsertAfter');

    register('script.call', cmd.script.call, 'Script::CallJsFunction');
    register('script.redirect', cmd.script.redirect, 'Script::Redirect');

    register('script.sleep', ajax.handler.sleep, 'Handler::Sleep');
    register('script.confirm', ajax.handler.confirm, 'Handler::Confirm');

    register('handler.event.set', cmd.event.setEventHandler, 'Script::SetEventHandler');
    register('handler.event.add', cmd.event.addEventHandler, 'Script::AddEventHandler');
    register('handler.add', cmd.event.addHandler, 'Script::AddHandler');
    register('handler.remove', cmd.event.removeHandler, 'Script::RemoveHandler');

    register('script.debug', ({ message }) => {
        console.log(message);
        return true;
    }, 'Debug message');

    // JQuery
    register('jquery.call', cmd.script.jquery, 'JQuery::CallSelector');
    // Pagination
    register('pg.paginate', cmd.script.paginate, 'Paginator::Paginate');
    // Data bags
    register('databag.set', cmd.script.setDatabag, 'Databag:SetValues');
    register('databag.clear', cmd.script.clearDatabag, 'Databag:ClearValue');
    // Dialogs
    register('dialog.message', dialog.cmd.showMessage, 'Dialog:ShowMessage');
    register('dialog.modal.show', dialog.cmd.showModal, 'Dialog:ShowModal');
    register('dialog.modal.hide', dialog.cmd.hideModal, 'Dialog:HideModal');
})(jaxon.register, jaxon.cmd, jaxon.ajax, jaxon.dialog);


module.exports = jaxon;
