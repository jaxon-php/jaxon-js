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


/**
 * Class: jaxon.utils.delay
 */

(function(self, queue, rsp, msg) {
    /**
     * Attempt to pop the next asynchronous request.
     *
     * @param {object} oQueue The queue object you would like to modify.
     *
     * @returns {object|null}
     */
    self.popAsyncRequest = oQueue =>
        queue.empty(oQueue) || queue.peek(oQueue).mode === 'synchronous' ?
        null : queue.pop(oQueue);

    /**
     * Maintains a retry counter for the given object.
     *
     * @param {object} command The object to track the retry count for.
     * @param {integer} count The number of times the operation should be attempted before a failure is indicated.
     *
     * @returns {true} The object has not exhausted all the retries.
     * @returns {false} The object has exhausted the retry count specified.
     */
    self.retry = (command, count) => {
        let retries = command.retries;
        if(retries) {
            if(1 > --retries) {
                return false;
            }
        } else {
            retries = count;
        }
        command.retries = retries;
        // This command must be processed again.
        command.requeue = true;
        return true;
    };

    /**
     * Set or reset a timeout that is used to restart processing of the queue.
     *
     * This allows the queue to asynchronously wait for an event to occur (giving the browser time
     * to process pending events, like loading files)
     *
     * @param {object} response The queue to process.
     * @param {integer} when The number of milliseconds to wait before starting/restarting the processing of the queue.
     *
     * @returns {void}
     */
    self.setWakeup = (response, when) => {
        if (response.timeout !== null) {
            clearTimeout(response.timeout);
            response.timeout = null;
        }
        response.timout = setTimeout(() => rsp.process(response), when);
    };

    /**
     * The function to run after the confirm question, for the comfirmCommands.
     *
     * @param {object} command The object to track the retry count for.
     * @param {integer} count The number of commands to skip.
     * @param {boolean} skip Skip the commands or not.
     *
     * @returns {void}
     */
    const confirmCallback = (command, count, skip) => {
        if(skip === true) {
            // The last entry in the queue is not a user command.
            // Thus it cannot be skipped.
            while (count > 0 && command.response.count > 1 &&
                queue.pop(command.response) !== null) {
                --count;
            }
        }
        // Run a different command depending on whether this callback executes
        // before of after the confirm function returns;
        if(command.requeue === true) {
            // Before => the processing is delayed.
            self.setWakeup(command.response, 30);
            return;
        }
        // After => the processing is executed.
        rsp.process(command.response);
    };

    /**
     * Ask a confirm question and skip the specified number of commands if the answer is ok.
     *
     * The processing of the queue after the question is delayed so it occurs after this function returns.
     * The 'command.requeue' attribute is used to determine if the confirmCallback is called
     * before (when using the blocking confirm() function) or after this function returns.
     * @see confirmCallback
     *
     * @param {object} command The object to track the retry count for.
     * @param {integer} count The number of commands to skip.
     * @param {string} question The question to ask to the user.
     *
     * @returns {boolean}
     */
    self.confirm = (command, count, question) => {
        // This will be checked in the callback.
        command.requeue = true;
        msg.confirm(question, '', () => confirmCallback(command, count, false),
            () => confirmCallback(command, count, true));

        // This command must not be processed again.
        command.requeue = false;
        return false;
    };
})(jaxon.utils.delay, jaxon.utils.queue, jaxon.ajax.response, jaxon.ajax.message);


/**
 * Class: jaxon.utils.dom
 */

(function(self, baseDocument) {
    /**
     * Shorthand for finding a uniquely named element within the document.
     *
     * @param {string} sId - The unique name of the element (specified by the ID attribute)
     *
     * @returns {object} The element found or null.
     *
     * @see <self.$>
     */
    self.$ = sId => !sId ? null : (typeof sId !== 'string' ? sId : baseDocument.getElementById(sId));

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
        if (typeof element === 'string') {
            element = self.$(element);
        }
        return !element ? false : (newData != element[attribute]);
    };

    /**
     * Find a function using its name as a string.
     *
     * @param {string} sFuncName The name of the function to find.
     * @param {object} context
     *
     * @returns {object|null}
     */
    self.findFunction = function (sFuncName, context = window) {
        const names = sFuncName.split(".");
        for (let i = 0, length = names.length; i < length && (context); i++) {
            context = context[names[i]];
        }
        return context ?? null;
    };

    /**
     * Given an element and an attribute with 0 or more dots,
     * get the inner object and the corresponding attribute name.
     *
     * @param {object} xElement The outer element.
     * @param {string} attribute The attribute name.
     *
     * @returns {array} The inner object and the attribute name in an array.
     */
    self.getInnerObject = (xElement, attribute) => {
        const attributes = attribute.split('.');
        // Get the last element in the array.
        attribute = attributes.pop();
        // Move to the inner object.
        for (let i = 0, len = attributes.length; i < len && (xElement); i++) {
            const attr = attributes[i];
            // The real name for the "css" object is "style".
            xElement = xElement[attr === 'css' ? 'style' : attr];
        }
        return !xElement ? [null, null] : [xElement, attribute];
    };

    /**
     * Create a function by inserting its code in the page using a <script> tag.
     *
     * @param {string} funcCode
     * @param {string='jaxon.cmd.script.context.delegateCall'} funcName
     * 
     * @returns {boolean}
     */
    self.createFunction = (funcCode, funcName = 'jaxon.cmd.script.context.delegateCall') => {
        if (!funcCode) {
            return false;
        }

        // const removeTagAfter = funcName === undefined;
        const scriptTagId = 'jaxon_cmd_script_' + (funcName === undefined ?
            'delegate_call' : funcName.toLowerCase().replaceAll('.', '_'));

        // Remove the tag if it already exists.
        jaxon.cmd.node.remove(scriptTagId);
        // Create a new tag.
        const scriptTag = baseDocument.createElement('script');
        scriptTag.setAttribute('id', scriptTagId);
        scriptTag.textContent = `
    ${funcName} = ${funcCode}
`;
        baseDocument.body.appendChild(scriptTag);

        // Since this js code saves the function in a var,
        // the tag can be removed, and the function will still exist.
        // removeTagAfter && jaxon.cmd.node.remove(scriptTagId);
        return true;
    };
})(jaxon.utils.dom, jaxon.config.baseDocument);


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
        timeout: null
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
                function(a, b) {
                    const r = values[b];
                    return typeof r === 'string' || typeof r === 'number' ? r : a;
                }
            );
        };
    }
})(jaxon.utils.string);


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
 * Class: jaxon.cmd.event
 */

(function(self, dom, str, script) {
    /**
     *  Set an event handler.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The target element
     * @param {string} command.prop The event name
     * @param {string} command.data The callback code
     *
     * @returns {true} The operation completed successfully.
     */
    self.setEvent = ({ target: oTarget, prop: sEvent, data: sCode }) => {
        dom.createFunction(`(e) => { ${str.doubleQuotes(sCode)} }`);
        oTarget[str.addOnPrefix(sEvent)] = script.context.delegateCall;
        return true;
    };

    /**
     * Get the real name of an event handler
     *
     * @type {(string) => string}
     */
    const getName = window.addEventListener ? str.stripOnPrefix : str.addOnPrefix;

    /**
     * @param {object} target The target element
     * @param {string} event An event name
     * @param {string} func A function name
     *
     * @returns {void}
     */
    const _addHandler = window.addEventListener ?
        (target, event, func) => target.addEventListener(event, dom.findFunction(func), false) :
        (target, event, func) => target.attachEvent(event, dom.findFunction(func));

    /**
     * @param {object} target The target element
     * @param {string} event An event name
     * @param {string} func A function name
     *
     * @returns {void}
     */
    const _removeHandler = window.addEventListener ?
        (target, event, func) => target.removeEventListener(event, dom.findFunction(func), false) :
        (target, event, func) => target.detachEvent(event, dom.findFunction(func));

    /**
     * Add an event handler to the specified target.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The target element
     * @param {string} command.prop The name of the event.
     * @param {string} command.data The name of the function to be called
     *
     * @returns {true} The operation completed successfully.
     */
    self.addHandler = ({ target: oTarget, prop: sEvent, data: sFuncName }) => {
        _addHandler(oTarget, getName(sEvent), sFuncName);
        return true;
    };

    /**
     * Remove an event handler from an target.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The target element
     * @param {string} command.prop The name of the event.
     * @param {string} command.data The name of the function to be removed
     *
     * @returns {true} The operation completed successfully.
     */
    self.removeHandler = ({ target: oTarget, prop: sEvent, data: sFuncName }) => {
       _removeHandler(oTarget, getName(sEvent), sFuncName);
       return true;
    };
})(jaxon.cmd.event, jaxon.utils.dom, jaxon.utils.string, jaxon.cmd.script);


/**
 * Class: jaxon.cmd.form
 */

(function(self, baseDocument) {
    /**
     * Create and return a form input element with the specified parameters.
     *
     * @param {string} type The type of input element desired.
     * @param {string} name The value to be assigned to the name attribute.
     * @param {string} id The value to be assigned to the id attribute.
     *
     * @returns {true} The operation completed successfully.
     */
    const getInput = (type, name, id) => {
        const oInput = baseDocument.createElement('input');
        oInput.setAttribute('type', type);
        oInput.setAttribute('name', name);
        oInput.setAttribute('id', id);
        return oInput;
    };

    /**
     * Create a new input element under the specified parent.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The element that will be used as the reference for the insertion.
     * @param {string} command.type The value to be assigned to the type attribute.
     * @param {string} command.data The value to be assigned to the name attribute.
     * @param {string} command.prop The value to be assigned to the id attribute.
     *
     * @returns {true} The operation completed successfully.
     */
    self.createInput = ({ target: objParent, type: sType, data: sName, prop: sId }) => {
        const target = getInput(sType, sName, sId);
        if (objParent && target) {
            objParent.appendChild(target);
        }
        return true;
    };

    /**
     * Insert a new input element before the specified element.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The element that will be used as the reference for the insertion.
     * @param {string} command.type The value to be assigned to the type attribute.
     * @param {string} command.data The value to be assigned to the name attribute.
     * @param {string} command.prop The value to be assigned to the id attribute.
     *
     * @returns {true} The operation completed successfully.
     */
    self.insertInput = ({ target: objSibling, type: sType, data: sName, prop: sId }) => {
        const target = getInput(sType, sName, sId);
        if (target && objSibling && objSibling.parentNode) {
            objSibling.parentNode.insertBefore(target, objSibling);
        }
        return true;
    };

    /**
     * Insert a new input element after the specified element.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The element that will be used as the reference for the insertion.
     * @param {string} command.type The value to be assigned to the type attribute.
     * @param {string} command.data The value to be assigned to the name attribute.
     * @param {string} command.prop The value to be assigned to the id attribute.
     *
     * @returns {true} The operation completed successfully.
     */
    self.insertInputAfter = ({ target: objSibling, type: sType, data: sName, prop: sId }) => {
        const target = getInput(sType, sName, sId);
        if (target && objSibling && objSibling.parentNode) {
            objSibling.parentNode.insertBefore(target, objSibling.nextSibling);
        }
        return true;
    };
})(jaxon.cmd.form, jaxon.config.baseDocument);


/**
 * Class: jaxon.cmd.node
 */

(function(self, dom, baseDocument) {
    /**
     * Assign an element's attribute to the specified value.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The HTML element to effect.
     * @param {string} command.prop The name of the attribute to set.
     * @param {string} command.data The new value to be applied.
     *
     * @returns {true} The operation completed successfully.
     */
    self.assign = ({ target: element, prop: property, data }) => {
        if (property === 'innerHTML') {
            element.innerHTML = data;
            return true;
        }
        if (property === 'outerHTML') {
            element.outerHTML = data;
            return true;
        }

        const [innerElement, innerProperty] = dom.getInnerObject(element, property);
        if (innerElement !== null) {
            innerElement[innerProperty] = data;
        }
        return true;
    };

    /**
     * Append the specified value to an element's attribute.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The HTML element to effect.
     * @param {string} command.prop The name of the attribute to append to.
     * @param {string} command.data The new value to be appended.
     *
     * @returns {true} The operation completed successfully.
     */
    self.append = ({ target: element, prop: property, data }) => {
        if (property === 'innerHTML') {
            element.innerHTML = element.innerHTML + data;
            return true;
        }
        if (property === 'outerHTML') {
            element.outerHTML = element.outerHTML + data;
            return true;
        }

        const [innerElement, innerProperty] = dom.getInnerObject(element, property);
        if (innerElement !== null) {
            innerElement[innerProperty] = innerElement[innerProperty] + data;
        }
        return true;
    };

    /**
     * Prepend the specified value to an element's attribute.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The HTML element to effect.
     * @param {string} command.prop The name of the attribute.
     * @param {string} command.data The new value to be prepended.
     *
     * @returns {true} The operation completed successfully.
     */
    self.prepend = ({ target: element, prop: property, data }) => {
        if (property === 'innerHTML') {
            element.innerHTML = data + element.innerHTML;
            return true;
        }
        if (property === 'outerHTML') {
            element.outerHTML = data + element.outerHTML;
            return true;
        }

        const [innerElement, innerProperty] = dom.getInnerObject(element, property);
        if (innerElement !== null) {
            innerElement[innerProperty] = data + innerElement[innerProperty];
        }
        return true;
    };

    /**
     * Replace a text in the value of a given property in an element
     *
     * @param {object} xElement The element to search in
     * @param {string} sProperty The attribute to search in
     * @param {string} sSearch The text to search
     * @param {string} sReplace The text to use as replacement
     *
     * @returns {void}
     */
    const replaceText = (xElement, sProperty, sSearch, sReplace) => {
        const bFunction = (typeof xElement[sProperty] === 'function');
        const sCurText = bFunction ? xElement[sProperty].join('') : xElement[sProperty];
        const sNewText = sCurText.replaceAll(sSearch, sReplace);
        if (bFunction || dom.willChange(xElement, sProperty, sNewText)) {
            xElement[sProperty] = sNewText;
        }
    };

    /**
     * Search and replace the specified text.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The element which is to be modified.
     * @param {string} command.prop The name of the attribute to be set.
     * @param {array} command.data The search text and replacement text.
     *
     * @returns {true} The operation completed successfully.
     */
    self.replace = ({ target: element, prop: sAttribute, data: aData }) => {
        const sReplace = aData['r'];
        const sSearch = sAttribute === 'innerHTML' ? dom.getBrowserHTML(aData['s']) : aData['s'];
        const [innerElement, innerProperty] = dom.getInnerObject(element, sAttribute);
        if (innerElement !== null) {
            replaceText(innerElement, innerProperty, sSearch, sReplace);
        }
        return true;
    };

    /**
     * Delete an element.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The element which will be deleted.
     *
     * @returns {true} The operation completed successfully.
     */
    self.remove = ({ target: element }) => {
        if (element && element.parentNode && element.parentNode.removeChild) {
            element.parentNode.removeChild(element);
        }
        return true;
    };

    /**
     * Create a new element and append it to the specified parent element.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The element which will contain the new element.
     * @param {string} command.data The tag name for the new element.
     * @param {string} command.prop The value to be assigned to the id attribute of the new element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.create = ({ target: element, data: sTag, prop: sId }) => {
        if (element) {
            const target = baseDocument.createElement(sTag);
            target.setAttribute('id', sId);
            element.appendChild(target);
        }
        return true;
    };

    /**
     * Insert a new element before the specified element.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The element that will be used as the reference point for insertion.
     * @param {string} command.data The tag name for the new element.
     * @param {string} command.prop The value that will be assigned to the new element's id attribute.
     *
     * @returns {true} The operation completed successfully.
     */
    self.insert = ({ target: element, data: sTag, prop: sId }) => {
        if (element && element.parentNode) {
            const target = baseDocument.createElement(sTag);
            target.setAttribute('id', sId);
            element.parentNode.insertBefore(target, element);
        }
        return true;
    };

    /**
     * Insert a new element after the specified element.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The element that will be used as the reference point for insertion.
     * @param {string} command.data The tag name for the new element.
     * @param {string} command.prop The value that will be assigned to the new element's id attribute.
     *
     * @returns {true} The operation completed successfully.
     */
    self.insertAfter = ({ target: element, data: sTag, prop: sId }) => {
        if (element && element.parentNode) {
            const target = baseDocument.createElement(sTag);
            target.setAttribute('id', sId);
            element.parentNode.insertBefore(target, element.nextSibling);
        }
        return true;
    };

    /**
     * Assign a value to a named member of the current script context object.
     *
     * @param {object} command The Response command object.
     * @param {string} command.prop The name of the member to assign.
     * @param {string|object} command.data The value to assign to the member.
     * @param {object} command.context The current script context object which is accessable via the 'this' keyword.
     *
     * @returns {true} The operation completed successfully.
     */
    self.contextAssign = ({ context, prop: sAttribute, data }) => {
        const [innerElement, innerProperty] = dom.getInnerObject(context, sAttribute);
        if (innerElement !== null) {
            innerElement[innerProperty] = data;
        }
        return true;
    };

    /**
     * Appends a value to a named member of the current script context object.
     *
     * @param {object} command The Response command object.
     * @param {string} command.prop The name of the member to append to.
     * @param {string|object} command.data The value to append to the member.
     * @param {object} command.context The current script context object which is accessable via the 'this' keyword.
     *
     * @returns {true} The operation completed successfully.
     */
    self.contextAppend = ({ context, prop: sAttribute, data }) => {
        const [innerElement, innerProperty] = dom.getInnerObject(context, sAttribute);
        if (innerElement !== null) {
            innerElement[innerProperty] = innerElement[innerProperty] + data;
        }
        return true;
    };

    /**
     * Prepend a value to a named member of the current script context object.
     *
     * @param {object} command The Response command object.
     * @param {string} command.prop The name of the member to prepend to.
     * @param {string|object} command.data The value to prepend to the member.
     * @param {object} command.context The current script context object which is accessable via the 'this' keyword.
     *
     * @returns {true} The operation completed successfully.
     */
    self.contextPrepend = ({ context, prop: sAttribute, data }) => {
        const [innerElement, innerProperty] = dom.getInnerObject(context, sAttribute);
        if (innerElement !== null) {
            innerElement[innerProperty] = data + innerElement[innerProperty];
        }
        return true;
    };
})(jaxon.cmd.node, jaxon.utils.dom, jaxon.config.baseDocument);


/**
 * Class: jaxon.cmd.script
 */

(function(self, delay, msg, dom, baseDocument, window) {
    /**
     * Add a reference to the specified script file if one does not already exist in the HEAD of the current document.
     *
     * @param {object} command The Response command object.
     * @param {string} command.data The URI of the file.
     *
     * @returns {true} The operation completed successfully.
     */
    self.includeScriptOnce = ({ data: src, type = 'text/javascript', elm_id }) => {
        // Check for existing script tag for this file.
        const loadedScripts = baseDocument.getElementsByTagName('script');
        // Find an existing script with the same file name
        const loadedScript = loadedScripts.find(script => script.src && script.src.indexOf(src) >= 0);
        return (loadedScript) ? true : self.includeScript({ data: src, type, elm_id });
    };

    /**
     * Adds a SCRIPT tag referencing the specified file.
     * This effectively causes the script to be loaded in the browser.
     *
     * @param {object} command The Response command object.
     * @param {string} command.data The URI of the file.
     * @param {string='text/javascript'} command.type The type of the file.
     * @param {string=} command.elm_id The script tag id.
     *
     * @returns {true} The operation completed successfully.
     */
    self.includeScript = ({ data: src, type = 'text/javascript', elm_id }) => {
        const objHead = baseDocument.getElementsByTagName('head');
        const objScript = baseDocument.createElement('script');
        objScript.src = src;
        objScript.type = type;
        if (elm_id) {
            objScript.setAttribute('id', elm_id);
        }
        objHead[0].appendChild(objScript);
        return true;
    };

    /**
     * Locates a SCRIPT tag in the HEAD of the document which references the specified file and removes it.
     *
     * @param {object} command The Response command object.
     * @param {string} command.data The URI of the file.
     * @param {string=} command.unld A function to execute.
     *
     * @returns {true} The operation completed successfully.
     */
    self.removeScript = ({ data: src, unld: unload }) => {
        const loadedScripts = baseDocument.getElementsByTagName('script');
        // Find an existing script with the same file name
        const loadedScript = loadedScripts.find(script => script.src && script.src.indexOf(src) >= 0);
        if (!loadedScript) {
            return true;
        }
        if (unload) {
            // Execute the provided unload function.
            self.execute({ data: unload, context: window });
        }
        loadedScript.parentNode.removeChild(loadedScript);
        return true;
    };

    /**
     * Causes the processing of items in the queue to be delayed for the specified amount of time.
     * This is an asynchronous operation, therefore, other operations will be given an opportunity
     * to execute during this delay.
     *
     * @param {object} command The Response command object.
     * @param {integer} command.prop The number of 10ths of a second to sleep.
     * @param {object} command.response The Response object.
     *
     * @returns {true} The sleep operation completed.
     * @returns {false} The sleep time has not yet expired, continue sleeping.
     */
    self.sleep = (command) => {
        // inject a delay in the queue processing
        // handle retry counter
        const { prop: duration, response } = command;
        if (delay.retry(command, duration)) {
            delay.setWakeup(response, 100);
            return false;
        }
        // wake up, continue processing queue
        return true;
    };

    /**
     * Show the specified message.
     *
     * @param {object} command The Response command object.
     * @param {string} command.data The message to display.
     *
     * @returns {true} The operation completed successfully.
     */
    self.alert = ({ data: message }) => {
        msg.info(message);
        return true;
    };

    /**
     * Prompt the user with the specified question, if the user responds by clicking cancel,
     * then skip the specified number of commands in the response command queue.
     * If the user clicks Ok, the command processing resumes normal operation.
     *
     * @param {object} command The Response command object.
     * @param {string} command.data The question to ask.
     * @param {integer} command.count The number of commands to skip.
     *
     * @returns {false} Stop the processing of the command queue until the user answers the question.
     */
    self.confirm = (command) => {
        const { count, data: question } = command;
        delay.confirm(command, count, question);
        return false;
    };

    /**
     * Call a javascript function with a series of parameters using the current script context.
     *
     * @param {object} command The Response command object.
     * @param {array} command.data  The parameters to pass to the function.
     * @param {string} command.func The name of the function to call.
     * @param {object} command.context The javascript object to be referenced as 'this' in the script.
     *
     * @returns {true} The operation completed successfully.
     */
    self.call = ({ func: funcName, data: funcParams, context = {} }) => {
        self.context = context;
        const func = dom.findFunction(funcName);
        if (func) {
            func.apply(self.context, funcParams);
        }
        return true;
    };

    /**
     * Execute the specified string of javascript code, using the current script context.
     *
     * @param {object} command The Response command object.
     * @param {string} command.data The javascript to be evaluated.
     * @param {object} command.context The javascript object to be referenced as 'this' in the script.
     *
     * @returns {true} The operation completed successfully.
     */
    self.execute = ({ data: funcBody, context = {} }) => {
        self.context = context;
        const jsCode = `() => {
    ${funcBody}
}`;
        try {
            dom.createFunction(jsCode);
            self.context.delegateCall();
        } catch (e) {}
        return true;
    };

    /**
     * Test for the specified condition, using the current script context;
     * if the result is false, sleep for 1/10th of a second and try again.
     *
     * @param {object} command The Response command object.
     * @param {string} command.data The javascript to evaluate.
     * @param {integer} command.prop The number of 1/10ths of a second to wait before giving up.
     * @param {object} command.context The javascript object to be referenced as 'this' in the script.
     *
     * @returns {true} The condition evaluates to true or the sleep time has expired.
     * @returns {false} The condition evaluates to false and the sleep time has not expired.
     */
    self.waitFor = (command) => {
        const { data: funcBody, prop: duration, response, context = {} } = command;
        self.context = context;
        const jsCode = `() => {
    return (${funcBody});
}`;
        try {
            dom.createFunction(jsCode);
            const bResult = self.context.delegateCall();
            if (!bResult) {
                // inject a delay in the queue processing
                // handle retry counter
                if (delay.retry(command, duration)) {
                    delay.setWakeup(response, 100);
                    return false;
                }
                // give up, continue processing queue
            }
        } catch (e) {}
        return true;
    };

    /**
     * Get function parameters as string
     *
     * @param {string|object} parameters 
     */
    const getParameters = (parameters) => {
        if (parameters === undefined) {
            return '';
        }
        if (Array.isArray(parameters)) {
            return parameters.join(', ');
        }
        if (typeof parameters === 'object') {
            return parameters.values().join(', ');
        }
        return parameters;
    };

    /**
     * Constructs the specified function using the specified javascript as the body of the function.
     *
     * @param {object} command The Response command object.
     * @param {string} command.func The name of the function to construct.
     * @param {string} command.data The script that will be the function body.
     * @param {object} command.context The javascript object to be referenced as 'this' in the script.
     *
     * @returns {true} The operation completed successfully.
     */
    self.setFunction = ({ func: funcName, data: funcBody, prop: funcParams, context = {} }) => {
        self.context = context;
        const jsCode = `(${getParameters(funcParams)}) => {
    ${funcBody}
}`;
        try {
            dom.createFunction(jsCode, funcName);
        } catch (e) {}
        return true;
    };

    self.wrapped = {}; // Original wrapped functions will be saved here.

    /**
     * Construct a javascript function which will call the original function with the same name,
     * potentially executing code before and after the call to the original function.
     *
     * @param {object} command The Response command object.
     * @param {string} command.func The name of the function to be wrapped.
     * @param {string} command.prop List of parameters used when calling the function.
     * @param {array} command.data The portions of code to be called before, after 
     *   or even between calls to the original function.
     * @param {object} command.context The javascript object to be referenced as 'this' in the script.
     *
     * @returns {true} The operation completed successfully.
     */
    self.wrapFunction = ({ func: funcName, type: returnType, prop: funcParams,
        data: [funcCodeBefore, funcCodeAfter = '// No call after'], context = {} }) => {
        self.context = context;
        const func = dom.findFunction(funcName);
        if (!func) {
            return true;
        }

        // Save the existing function
        const wrappedFuncName = funcName.toLowerCase().replaceAll('.', '_');
        if (!self.wrapped[wrappedFuncName]) {
            self.wrapped[wrappedFuncName] = func;
        }

        const varDefine = returnType ? `let ${returnType} = null;` : '// No return value';
        const varAssign = returnType ? `${returnType} = ` : '';
        const varReturn = returnType ? `return ${returnType};` : '// No return value';

        const jsCode = `(${getParameters(funcParams)}) => {
    ${varDefine}
    ${funcCodeBefore}

    const wrappedFuncName = "${funcName}".toLowerCase().replaceAll('.', '_');
    // Call the wrapped function (saved in jaxon.cmd.script.wrapped) with the same parameters.
    ${varAssign}jaxon.cmd.script.wrapped[wrappedFuncName](${funcParams});
    ${funcCodeAfter}
    ${varReturn}
}`;
        try {
            dom.createFunction(jsCode, funcName);
            self.context.delegateCall();
        } catch (e) {}
        return true;
    };

    /**
     * Redirects the browser to the specified URL.
     *
     * @param {object} command The Response command object.
     * @param {string} command.data The new URL to redirect to
     * @param {integer} command.delay The time to wait before the redirect.
     *
     * @returns {true} The operation completed successfully.
     */
    self.redirect = ({ data: sUrl, delay: nDelay }) => {
        if (nDelay <= 0) {
            window.location = sUrl;
            return true;
        }
        window.setTimeout(() => window.location = sUrl, nDelay * 1000);
        return true;
    };
})(jaxon.cmd.script, jaxon.utils.delay, jaxon.ajax.message, jaxon.utils.dom,
    jaxon.config.baseDocument, window);


/**
 * Class: jaxon.cmd.style
 */

(function(self, delay, baseDocument) {
    /**
     * Add a LINK reference to the specified .css file if it does not already exist in the HEAD of the current document.
     *
     * @param {object} command The Response command object.
     * @param {string} command.data The URI of the .css file to reference.
     * @param {string='screen'} command.media The media type of the css file (print/screen/handheld,..)
     *
     * @returns {true} The operation completed successfully.
     */
    self.add = ({ data: fileName, media = 'screen' }) => {
        const oHeads = baseDocument.getElementsByTagName('head');
        const oHead = oHeads[0];
        const found = oHead.getElementsByTagName('link')
            .find(link => link.href.indexOf(fileName) >= 0 && link.media == media);
        if (found) {
            return true;
        }

        const oCSS = baseDocument.createElement('link');
        oCSS.rel = 'stylesheet';
        oCSS.type = 'text/css';
        oCSS.href = fileName;
        oCSS.media = media;
        oHead.appendChild(oCSS);
        return true;
    };

    /**
     * Locate and remove a LINK reference from the current document's HEAD.
     *
     * @param {object} command The Response command object.
     * @param {string} command.data The URI of the .css file.
     * @param {string='screen'} command.media The media type of the css file (print/screen/handheld,..)
     *
     * @returns {true} The operation completed successfully.
     */
    self.remove = ({ data: fileName, media = 'screen' }) => {
        const oHeads = baseDocument.getElementsByTagName('head');
        const oHead = oHeads[0];
        const oLinks = oHead.getElementsByTagName('link');
        oLinks.filter(link => link.href.indexOf(fileName) >= 0 && link.media === media)
            .forEach(link => oHead.removeChild(link));
        return true;
    },

    /**
     * Attempt to detect when all .css files have been loaded once they are referenced by a LINK tag
     * in the HEAD of the current document.
     *
     * @param {object} command The Response command object.
     * @param {integer} command.prop The number of 1/10ths of a second to wait before giving up.
     * @param {object} command.response The Response object.
     *
     * @returns {true} The .css files appear to be loaded.
     * @returns {false} The .css files do not appear to be loaded and the timeout has not expired.
     */
    self.waitForCSS = (command) => {
        const oDocSS = baseDocument.styleSheets;
        const ssLoaded = oDocSS.every(styleSheet => {
            const enabled = styleSheet.cssRules.length ?? styleSheet.rules.length ?? 0;
            return enabled !== 0;
        });
        if (ssLoaded) {
            return false;
        }

        // inject a delay in the queue processing
        // handle retry counter
        const { prop: duration, response } = command;
        if (delay.retry(command, duration)) {
            delay.setWakeup(response, 10);
            return false;
        }
        // Give up, continue processing queue
        return true;
    };
})(jaxon.cmd.style, jaxon.utils.delay, jaxon.config.baseDocument);


/**
 * Class: jaxon.ajax.callback
 */

(function(self, config) {
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
     * @var {callable}
     */
    self.callback = self.create();

    /**
     * Execute a callback event.
     *
     * @param {object} oCallback The callback object (or objects) which contain the event handlers to be executed.
     * @param {string} sFunction The name of the event to be triggered.
     * @param {object} args The request object for this request.
     *
     * @returns {void}
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

    /**
     * Clear a callback timer for the specified function.
     *
     * @param {object} oCallback The callback object (or objects) that contain the specified function timer to be cleared.
     * @param {string} sFunction The name of the function associated with the timer to be cleared.
     *
     * @returns {void}
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


/**
 * Class: jaxon.ajax.handler
 */

(function(self, rsp, node, style, script, form, evt, dom, console) {
    /**
     * An array that is used internally in the jaxon.fn.handler object to keep track
     * of command handlers that have been registered.
     *
     * @var {array}
     */
    const handlers = [];

    /**
     * Registers a new command handler.
     *
     * @param {string} cmd The short name of the command handler.
     * @param {string} func The command handler function.
     * @param {string=''} name The full name of the command handler.
     *
     * @returns {void}
     */
    self.register = (cmd, func, name = '') => handlers[cmd] = { name, func };

    /**
     * Unregisters and returns a command handler.
     *
     * @param {string} cmd The name of the command handler.
     *
     * @returns {callable} The unregistered function.
     */
    self.unregister = (cmd) => {
        const handler = handlers[cmd];
        delete handlers[cmd];
        return handler.func;
    };

    /**
     * @param {object} command The response command to be executed.
     * @param {string} command.cmd The name of the function.
     *
     * @returns {boolean} (true or false): depending on whether a command handler has
     * been registered for the specified command (object).
     */
    self.isRegistered = ({ cmd }) => cmd !== undefined && handlers[cmd] !== undefined;

    /**
     * Perform a lookup on the command specified by the response command object passed
     * in the first parameter.  If the command exists, the function checks to see if
     * the command references a DOM object by ID; if so, the object is located within
     * the DOM and added to the command data.  The command handler is then called.
     * 
     * If the command handler returns true, it is assumed that the command completed
     * successfully.  If the command handler returns false, then the command is considered
     * pending; jaxon enters a wait state.  It is up to the command handler to set an
     * interval, timeout or event handler which will restart the jaxon response processing.
     * 
     * @param {object} command The response command to be executed.
     *
     * @returns {true} The command completed successfully.
     * @returns {false} The command signalled that it needs to pause processing.
     */
    self.execute = (command) => {
        if (self.isRegistered(command)) {
            // If the command has an "id" attr, find the corresponding dom element.
            if (command.id) {
                command.target = dom.$(command.id);
            }
            // Process the command
            return self.call(command);
        }
        return true;
    };

    /**
     * Calls the registered command handler for the specified command
     * (you should always check isRegistered before calling this function)
     *
     * @param {object} command The response command to be executed.
     * @param {string} command.cmd The name of the function.
     *
     * @returns {boolean}
     */
    self.call = (command) => {
        const handler = handlers[command.cmd];
        command.fullName = handler.name;
        handler.func(command);
    }

    self.register('rcmplt', ({ request }) => {
        rsp.complete(request);
        return true;
    }, 'Response complete');

    self.register('css', style.add, 'includeCSS');
    self.register('rcss', style.remove, 'removeCSS');
    self.register('wcss', style.waitForCSS, 'waitForCSS');

    self.register('as', node.assign, 'assign/clear');
    self.register('ap', node.append, 'append');
    self.register('pp', node.prepend, 'prepend');
    self.register('rp', node.replace, 'replace');
    self.register('rm', node.remove, 'remove');
    self.register('ce', node.create, 'create');
    self.register('ie', node.insert, 'insert');
    self.register('ia', node.insertAfter, 'insertAfter');
    self.register('c:as', node.contextAssign, 'context assign');
    self.register('c:ap', node.contextAppend, 'context append');
    self.register('c:pp', node.contextPrepend, 'context prepend');

    self.register('s', script.sleep, 'sleep');
    self.register('ino', script.includeScriptOnce, 'includeScriptOnce');
    self.register('in', script.includeScript, 'includeScript');
    self.register('rjs', script.removeScript, 'removeScript');
    self.register('wf', script.waitFor, 'waitFor');
    self.register('js', script.execute, 'execute Javascript');
    self.register('jc', script.call, 'call js function');
    self.register('sf', script.setFunction, 'setFunction');
    self.register('wpf', script.wrapFunction, 'wrapFunction');
    self.register('al', script.alert, 'alert');
    self.register('cc', script.confirm, 'confirm');
    self.register('rd', script.redirect, 'redirect');

    self.register('ci', form.createInput, 'createInput');
    self.register('ii', form.insertInput, 'insertInput');
    self.register('iia', form.insertInputAfter, 'insertInputAfter');

    self.register('ev', evt.setEvent, 'setEvent');
    self.register('ah', evt.addHandler, 'addHandler');
    self.register('rh', evt.removeHandler, 'removeHandler');

    self.register('dbg', function({ data: message }) {
        console.log(message);
        return true;
    }, 'Debug message');
})(jaxon.ajax.handler, jaxon.ajax.response, jaxon.cmd.node, jaxon.cmd.style,
    jaxon.cmd.script, jaxon.cmd.form, jaxon.cmd.event, jaxon.utils.dom, console);


/**
 * Class: jaxon.ajax.parameters
 */

(function(self) {
    /**
     * Print a success message on the screen.
     *
     * @param {string} content The message content.
     * @param {string} title The message title.
     *
     * @returns {void}
     */
    self.success = (content, title) => alert(content);

    /**
     * Print an info message on the screen.
     *
     * @param {string} content The message content.
     * @param {string} title The message title.
     *
     * @returns {void}
     */
    self.info = (content, title) => alert(content);

    /**
     * Print a warning message on the screen.
     *
     * @param {string} content The message content.
     * @param {string} title The message title.
     *
     * @returns {void}
     */
    self.warning = (content, title) => alert(content);

    /**
     * Print an error message on the screen.
     *
     * @param {string} content The message content.
     * @param {string} title The message title.
     *
     * @returns {void}
     */
    self.error = (content, title) => alert(content);

    /**
     * Print an error message on the screen.
     *
     * @param {string} question The confirm question.
     * @param {string} title The confirm title.
     * @param {callable} yesCallback The function to call if the user answers yesn.
     * @param {callable} noCallback The function to call if the user answers no.
     *
     * @returns {void}
     */
    self.confirm = (question, title, yesCallback, noCallback) => {
        if(confirm(question)) {
            yesCallback();
            return;
        }
        noCallback && noCallback();
    };
})(jaxon.ajax.message);


/**
 * Class: jaxon.ajax.parameters
 */

(function(self, version) {
    /**
     * The array of data bags
     *
     * @type {object}
     */
    self.bags = {};

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
        const sType = typeof oVal;
        if (sType === 'object') {
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
     * Sets the request parameters in a container.
     *
     * @param {object} oRequest The request object
     * @param {callable} fSetter A function that sets a single parameter
     *
     * @return {void}
     */
    const setParams = (oRequest, fSetter) => {
        fSetter('jxnr', oRequest.dNow.getTime());
        fSetter('jxnv', `${version.major}.${version.minor}.${version.patch}`);

        Object.keys(oRequest.functionName).forEach(sCommand =>
            fSetter(sCommand, encodeURIComponent(oRequest.functionName[sCommand])));
        if (oRequest.parameters) {
            for (const oVal of oRequest.parameters) {
                fSetter('jxnargs[]', stringify(oVal));
            }
        }
        if (oRequest.bags) {
            const oValues = {};
            oRequest.bags.forEach(sBag => oValues[sBag] = self.bags[sBag] ?? '*')
            fSetter('jxnbags', stringify(oValues));
        }
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
     * @return {void}
     */
    const getUrlEncodedParams = (oRequest) => {
        const rd = [];
        setParams(oRequest, (sParam, sValue) => rd.push(sParam + '=' + sValue));

        // Move the parameters to the URL for HTTP GET requests
        if (oRequest.method === 'GET') {
            oRequest.requestURI += oRequest.requestURI.indexOf('?') === -1 ? '?' : '&';
            oRequest.requestURI += rd.join('&');
            rd = [];
        }
        return rd.join('&');
    };

    /**
     * Processes request specific parameters and generates the temporary
     * variables needed by jaxon to initiate and process the request.
     *
     * @param {object} oRequest - A request object, created initially by a call to <jaxon.ajax.request.initialize>
     *
     * @return {void}
     *
     * Note:
     * This is called once per request; upon a request failure, this will not be called for additional retries.
     */
    self.process = (oRequest) => {
        // Make request parameters.
        oRequest.dNow = new Date();
        oRequest.requestURI = oRequest.URI;
        oRequest.requestData = (oRequest.upload && oRequest.upload.ajax && oRequest.upload.input) ?
            getFormDataParams(oRequest) : getUrlEncodedParams(oRequest);
        delete oRequest.dNow;
    };
})(jaxon.ajax.parameters, jaxon.version);


/**
 * Class: jaxon.ajax.request
 */

(function(self, cfg, params, rsp, cbk, upload, queue, delay, window) {
    /**
     * @param {object} oRequest
     *
     * @return {void}
     */
    const initCallbacks = (oRequest) => {
        const lcb = cbk.create();

        const aCallbacks = ['onPrepare', 'onRequest', 'onResponseDelay', 'onExpiration',
            'beforeResponseProcessing', 'onFailure', 'onRedirect', 'onSuccess', 'onComplete'];
        aCallbacks.forEach(sCallback => {
            if (oRequest[sCallback] !== undefined) {
                lcb[sCallback] = oRequest[sCallback];
                lcb.hasEvents = true;
                delete oRequest[sCallback];
            }
        });

        if (oRequest.callback === undefined) {
            oRequest.callback = lcb;
            return;
        }
        // Add the timers attribute, if it is not defined.
        if (oRequest.callback.timers === undefined) {
            oRequest.callback.timers = [];
        }
        if (lcb.hasEvents) {
            oRequest.callback = [oRequest.callback, lcb];
        }
    };

    /**
     * Initialize a request object, populating default settings, where call specific
     * settings are not already provided.
     *
     * @param {object} oRequest An object that specifies call specific settings that will,
     * in addition, be used to store all request related values.
     * This includes temporary values used internally by jaxon.
     *
     * @returns {void}
     */
    const initialize = (oRequest) => {
        const aHeaders = ['commonHeaders', 'postHeaders', 'getHeaders'];
        aHeaders.forEach(sHeader => oRequest[sHeader] = { ...cfg[sHeader], ...oRequest[sHeader] });

        const oOptions = {
            statusMessages: cfg.statusMessages,
            waitCursor: cfg.waitCursor,
            mode: cfg.defaultMode,
            method: cfg.defaultMethod,
            URI: cfg.requestURI,
            httpVersion: cfg.defaultHttpVersion,
            contentType: cfg.defaultContentType,
            convertResponseToJson: cfg.convertResponseToJson,
            retry: cfg.defaultRetry,
            returnValue: cfg.defaultReturnValue,
            maxObjectDepth: cfg.maxObjectDepth,
            maxObjectSize: cfg.maxObjectSize,
            context: window,
            upload: false,
            aborted: false,
        };
        Object.keys(oOptions).forEach(sOption => oRequest[sOption] = oRequest[sOption] ?? oOptions[sOption]);

        initCallbacks(oRequest);

        oRequest.status = (oRequest.statusMessages) ? cfg.status.update() : cfg.status.dontUpdate();

        oRequest.cursor = (oRequest.waitCursor) ? cfg.cursor.update() : cfg.cursor.dontUpdate();

        oRequest.method = oRequest.method.toUpperCase();
        if (oRequest.method !== 'GET') {
            oRequest.method = 'POST'; // W3C: Method is case sensitive
        }
        oRequest.requestRetry = oRequest.retry;

        // Look for upload parameter
        upload.initialize(oRequest);

        if (oRequest.URI === undefined) {
            throw { code: 10005 };
        }
    };

    /**
     * Prepares the XMLHttpRequest object for this jaxon request.
     *
     * @param {object} oRequest An object created by a call to <jaxon.ajax.request.initialize>
     * which already contains the necessary parameters and temporary variables needed to
     * initiate and process a jaxon request.
     *
     * Note:
     * This is called each time a request object is being prepared for a call to the server.
     * If the request is retried, the request must be prepared again.
     *
     * @returns {boolean}
     */
    const prepare = (oRequest) => {
        cbk.execute([cbk.callback, oRequest.callback], 'onPrepare', oRequest);

        // Check if the request must be aborted
        if (oRequest.aborted === true) {
            return false;
        }

        oRequest.responseHandler = function(responseContent) {
            oRequest.responseContent = responseContent;
            // Synchronous request are processed immediately.
            // Asynchronous request are processed only if the queue is empty.
            if (queue.empty(delay.q.send) || oRequest.mode === 'synchronous') {
                rsp.received(oRequest);
            } else {
                queue.push(delay.q.recv, oRequest);
            }
        };

        // No request is submitted while there are pending requests in the outgoing queue.
        const submitRequest = queue.empty(delay.q.send);
        if (oRequest.mode === 'synchronous') {
            // Synchronous requests are always queued, in both send and recv queues.
            queue.push(delay.q.send, oRequest);
            queue.push(delay.q.recv, oRequest);
            return submitRequest;
        }
        // Asynchronous requests are queued in send queue only if they are not submitted.
        submitRequest || queue.push(delay.q.send, oRequest);
        return submitRequest;
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
        oRequest.status.onRequest();

        cbk.execute([cbk.callback, oRequest.callback], 'onResponseDelay', oRequest);
        cbk.execute([cbk.callback, oRequest.callback], 'onExpiration', oRequest);
        cbk.execute([cbk.callback, oRequest.callback], 'onRequest', oRequest);

        oRequest.cursor.onWaiting();
        oRequest.status.onWaiting();

        const headers = {
            ...oRequest.commonHeaders,
            ...(oRequest.method === 'POST' ? oRequest.postHeaders : oRequest.getHeaders),
        };

        const oOptions = {
            method: oRequest.method,
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            redirect: "manual", // manual, *follow, error
            headers,
            body: oRequest.requestData,
        };
        fetch(oRequest.requestURI, oOptions)
            .then(response => {
                // Save the reponse object
                oRequest.response = response;
                // Get the response content
                return oRequest.convertResponseToJson ? response.json() : response.text();
            })
            .then(oRequest.responseHandler)
            .catch(error => {
                cbk.execute([cbk.callback, oRequest.callback], 'onFailure', oRequest);
                throw error;
            });

        return oRequest.returnValue;
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
        oRequest.request.abort();
        rsp.complete(oRequest);
    };

    /**
     * Initiates a request to the server.
     *
     * @param {object} functionName An object containing the name of the function to
     * execute on the server. The standard request is: {jxnfun:'function_name'}
     * @param {object=} functionArgs A request object which may contain callspecific parameters.
     * This object will be used by jaxon to store all the request parameters as well as
     * temporary variables needed during the processing of the request.
     *
     * @returns {boolean}
     */
    self.execute = (functionName, functionArgs) => {
        if (functionName === undefined) {
            return false;
        }

        const oRequest = functionArgs ?? {};
        oRequest.functionName = functionName;

        initialize(oRequest);
        params.process(oRequest);

        while (oRequest.requestRetry > 0) {
            try {
                if (prepare(oRequest)) {
                    --oRequest.requestRetry;
                    return submit(oRequest);
                }
                return null;
            }
            catch (e) {
                cbk.execute([cbk.callback, oRequest.callback], 'onFailure', oRequest);
                if (oRequest.requestRetry === 0) {
                    throw e;
                }
            }
        }
        return true;
    };
})(jaxon.ajax.request, jaxon.config, jaxon.ajax.parameters, jaxon.ajax.response,
    jaxon.ajax.callback, jaxon.utils.upload, jaxon.utils.queue, jaxon.utils.delay, window);


/**
 * Class: jaxon.ajax.response
 */

(function(self, config, handler, req, cbk, queue, delay, window, console) {
    /**
     * Called by the response command queue processor when all commands have been processed.
     *
     * @param {object} oRequest The request context object.
     *
     * @return {void}
     */
    self.complete = (oRequest) => {
        cbk.execute([cbk.callback, oRequest.callback], 'onComplete', oRequest);
        oRequest.cursor.onComplete();
        oRequest.status.onComplete();
        // clean up -- these items are restored when the request is initiated
        delete oRequest['functionName'];
        delete oRequest['requestURI'];
        delete oRequest['requestData'];
        delete oRequest['requestRetry'];
        delete oRequest['request'];
        delete oRequest['responseHandler '];
        delete oRequest['responseContent'];
        delete oRequest['response'];
        delete oRequest['sequence'];
        delete oRequest['status'];
        delete oRequest['cursor'];

        // All the requests queued while waiting must now be processed.
        if(oRequest.mode === 'synchronous') {
            // Remove the current request from the send and recv queues.
            queue.pop(delay.q.send);
            queue.pop(delay.q.recv);
            // Process the asynchronous requests received while waiting.
            while((recvRequest = delay.popAsyncRequest(delay.q.recv)) !== null) {
                received(recvRequest);
            }
            // Submit the asynchronous requests sent while waiting.
            while((nextRequest = delay.popAsyncRequest(delay.q.send)) !== null) {
                req.submit(nextRequest);
            }
            // Submit the next synchronous request, if there's any.
            if((nextRequest = queue.peek(delay.q.send)) !== null) {
                req.submit(nextRequest);
            }
        }
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
            if (handler.execute(command) !== false) {
                return true;
            }
            if (!command.requeue) {
                // No need. The pop() function had already removed the command from the queue.
                // delete command;
                return true;
            }
            queue.pushFront(commandQueue, command);
            return false;
        } catch (e) {
            console.log(e);
        }
        // No need. The pop() function had already removed the command from the queue.
        // delete command;
        return true;
    };

    /**
     * While entries exist in the queue, pull and entry out and process it's command.
     * When a command returns false, the processing is halted.
     *
     * @param {object} commandQueue A queue containing the commands to execute.
     * This should have been created by calling <queue.create>.
     *
     * @returns {true} The queue was fully processed and is now empty.
     * @returns {false} The queue processing was halted before the queue was fully processed.
     *
     * Note:
     * - Use <jaxon.utils.delay.setWakeup> or call this function to cause the queue processing to continue.
     * - This will clear the associated timeout, this function is not designed to be reentrant.
     * - When an exception is caught, do nothing; if the debug module is installed, it will catch the exception and handle it.
     */
    const processCommands = (commandQueue) => {
        if (commandQueue.timeout !== null) {
            clearTimeout(commandQueue.timeout);
            commandQueue.timeout = null;
        }

        let command = null;
        while ((command = queue.pop(commandQueue)) !== null) {
            if (!processCommand(command)) {
                return false;
            }
        }
        return true;
    };

    /**
     * Parse the JSON response into a series of commands.
     *
     * @param {object} oRequest The request context object.
     *
     * @return {void}
     */
    const queueCommands = (oRequest) => {
        const nodes = oRequest.responseContent;
        if (!nodes || !nodes.jxnobj) {
            return;
        }

        oRequest.status.onProcessing();

        if (nodes.jxnrv) {
            oRequest.returnValue = nodes.jxnrv;
        }

        nodes.debugmsg && console.log(nodes.debugmsg);

        nodes.jxnobj.forEach(command => queue.push(oRequest.commandQueue, {
            ...command,
            fullName: '*unknown*',
            sequence: oRequest.sequence++,
            response: oRequest.commandQueue,
            request: oRequest,
            context: oRequest.context,
        }));
    };

    /**
     * This array contains a list of codes which will be returned from the server upon
     * successful completion of the server portion of the request.
     *
     * These values should match those specified in the HTTP standard.
     *
     * @var {array}
     */
    // const successCodes = [0, 200];

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
     * This is the JSON response processor.
     *
     * @param {object} oRequest The request context object.
     *
     * @return {mixed}
     */
    const jsonProcessor = (oRequest) => {
        if (oRequest.response.ok) {
            cbk.execute([cbk.callback, oRequest.callback], 'onSuccess', oRequest);

            oRequest.sequence = 0;
            queueCommands(oRequest)

            // Queue a last command to clear the queue
            queue.push(oRequest.commandQueue, {
                fullName: 'Response Complete',
                sequence: oRequest.sequence,
                request: oRequest,
                context: oRequest.context,
                cmd: 'rcmplt',
            });

            // do not re-start the queue if a timeout is set
            if (!oRequest.commandQueue.timeout) {
                // Process the commands in the queue
                processCommands(oRequest.commandQueue);
            }
            return oRequest.returnValue;
        }
        if (redirectCodes.indexOf(oRequest.response.status) >= 0) {
            cbk.execute([cbk.callback, oRequest.callback], 'onRedirect', oRequest);
            window.location = oRequest.response.headers.get('location');
            self.complete(oRequest);
            return oRequest.returnValue;
        }
        if (errorsForAlert.indexOf(oRequest.response.status) >= 0) {
            cbk.execute([cbk.callback, oRequest.callback], 'onFailure', oRequest);
            self.complete(oRequest);
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
        // sometimes the responseReceived gets called when the request is aborted
        if (oRequest.aborted) {
            return null;
        }

        // Create a response queue for this request.
        oRequest.commandQueue = queue.create(config.commandQueueSize);

        cbk.clearTimer([cbk.callback, oRequest.callback], 'onExpiration');
        cbk.clearTimer([cbk.callback, oRequest.callback], 'onResponseDelay');
        cbk.execute([cbk.callback, oRequest.callback], 'beforeResponseProcessing', oRequest);

        const fProc = oRequest.responseProcessor ?? jsonProcessor;
        return fProc(oRequest);
    };
})(jaxon.ajax.response, jaxon.config, jaxon.ajax.handler, jaxon.ajax.request,
    jaxon.ajax.callback, jaxon.utils.queue, jaxon.utils.delay, window, console);


/**
 * Class: jaxon.dom
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
        // the jaxon.dom.ready() function will see that it already fired
        // and will schedule the callback to run right after
        // this event loop finishes so all handlers will still execute
        // in order and no new ones will be added to the readyList
        // while we are processing the list
        readyList.forEach(cb => cb.fn.call(window, cb.ctx));
        // allow any closures held by these functions to free
        readyList = [];
    }

    const readyStateChange = () => document.readyState === "complete" && ready();

    /**
     * This is the one public interface
     * jaxon.dom.ready(fn, context);
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
        if (document.readyState === "complete" || (!document.attachEvent && document.readyState === "interactive")) {
            setTimeout(ready, 1);
            return;
        }
        if (!readyEventHandlersInstalled) {
            // otherwise if we don't have event handlers installed, install them
            if (document.addEventListener) {
                // first choice is DOMContentLoaded event
                document.addEventListener("DOMContentLoaded", ready, false);
                // backup is window load event
                window.addEventListener("load", ready, false);
            } else {
                // must be IE
                document.attachEvent("onreadystatechange", readyStateChange);
                window.attachEvent("onload", ready);
            }
            readyEventHandlersInstalled = true;
        }
    }
})(jaxon.dom);


/*
    File: jaxon.js

    This file contains the definition of the main jaxon javascript core.

    This is the client side code which runs on the web browser or similar web enabled application.
    Include this in the HEAD of each page for which you wish to use jaxon.

    Title: jaxon core javascript library

    Please see <copyright.inc.php> for a detailed description, copyright and license information.
*/

/*
    @package jaxon
    @version $Id: jaxon.core.js 327 2007-02-28 16:55:26Z calltoconstruct $
    @copyright Copyright (c) 2005-2007 by Jared White & J. Max Wilson
    @copyright Copyright (c) 2008-2010 by Joseph Woolley, Steffen Konerow, Jared White  & J. Max Wilson
    @copyright Copyright (c) 2017 by Thierry Feuzeu, Joseph Woolley, Steffen Konerow, Jared White  & J. Max Wilson
    @license https://opensource.org/license/bsd-3-clause/ BSD License
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
 * Shortcut to <jaxon.utils.form.getValues>.
 */
jaxon.getFormValues = jaxon.utils.form.getValues;

/**
 * Prints various types of messages on the user screen.
 */
jaxon.msg = jaxon.ajax.message;

/**
 * Shortcut to <jaxon.cmd.script>.
 */
jaxon.js = jaxon.cmd.script;

/**
 * Indicates if jaxon module is loaded.
 */
jaxon.isLoaded = true;

/**
 * The queues that hold synchronous requests as they are sent and processed.
 */
jaxon.utils.delay.q = {
    send: jaxon.utils.queue.create(jaxon.config.requestQueueSize),
    recv: jaxon.utils.queue.create(jaxon.config.requestQueueSize * 2)
};


/**
 * Class: jaxon.command
 *
 * This class is defined for compatibility with previous versions, since its functions are used in other packages.
 */
jaxon.command = {
    handler: {},

    handler: {
        register: jaxon.ajax.handler.register
    },

    /**
     * Creates a new command (object) that will be populated with command parameters
     * and eventually passed to the command handler.
     */
    create: (sequence, request, context) => ({
        cmd: '*',
        fullName: '* unknown command name *',
        sequence: sequence,
        request: request,
        context: context
    }),
};

/**
 * Class: jxn
 *
 * Contains shortcut's to frequently used functions.
 */
const jxn = {
    /**
     * Shortcut to <jaxon.utils.dom.$>.
     */
    $: jaxon.utils.dom.$,

    /**
     * Shortcut to <jaxon.utils.form.getValues>.
     */
    getFormValues: jaxon.utils.form.getValues,

    /**
     * Shortcut to <jaxon.request>.
     */
    request: jaxon.request
};
