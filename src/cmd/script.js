/**
 * Class: jaxon.cmd.script
 */

(function(self, json, handler, parameters, types) {
    /**
     * Causes the processing of items in the queue to be delayed for the specified amount of time.
     * This is an asynchronous operation, therefore, other operations will be given an opportunity
     * to execute during this delay.
     *
     * @param {object} args The command arguments.
     * @param {integer} args.prop The number of 10ths of a second to sleep.
     * @param {object} args.response The Response object.
     *
     * @returns {true} The sleep operation completed.
     * @returns {false} The sleep time has not yet expired, continue sleeping.
     */
    self.sleep = (command) => {
        // Inject a delay in the queue processing and handle retry counter
        const { duration, response } = command;
        if (handler.retry(command, duration)) {
            handler.setWakeup(response, 100);
            return false;
        }
        // Wake up, continue processing queue
        return true;
    };

    /**
     * Prompt the user with the specified question, if the user responds by clicking cancel,
     * then skip the specified number of commands in the response command queue.
     * If the user clicks Ok, the command processing resumes normal operation.
     *
     * @param {object} args The command arguments.
     * @param {string} args.question The question to ask.
     * @param {integer} args.count The number of commands to skip.
     *
     * @returns {false} Stop the processing of the command queue until the user answers the question.
     */
    self.confirm = (command) => {
        const { count, question } = command;
        handler.confirm(command, count, question);
        return false;
    };

    /**
     * Call a javascript function with a series of parameters using the current script context.
     *
     * @param {object} args The command arguments.
     * @param {string} args.func The name of the function to call.
     * @param {array} args.args  The parameters to pass to the function.
     * @param {object} args.context The javascript object to be referenced as 'this' in the script.
     *
     * @returns {true} The operation completed successfully.
     */
    self.call = ({ func, args, context = {} }) => {
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
    self.databag = ({ values }) => {
        for (const key in values) {
            parameters.bags[key] = values[key];
        }
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
     * @param {object} oCall
     * @param {array} oCall.args
     * @param {object} oLink
     *
     * @returns {array}
     */
    const getCallArgs = ({ args: aArgs }, oLink) => aArgs.map(xArg =>
        types.isObject(xArg) && xArg._type === 'page' ?
        parseInt(oLink.parentNode.getAttribute('data-page')) : xArg);

    /**
     * Set event handlers on pagination links.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The pagination wrapper id
     * @param {object} args.target The pagination wrapper element
     * @param {array} args.call The page call
     * @param {array} args.pages The page list
     *
     * @returns {true} The operation completed successfully.
     */
    self.paginate = ({ target, call: oCall }) => {
        const aLinks = target.querySelectorAll(`li.enabled > a`);
        aLinks.forEach(oLink => oLink.onClick = () => json.execCall({
            ...oCall,
            _type: 'func',
            args: getCallArgs(oCall, oLink),
        }));
        return true;
    };
})(jaxon.cmd.script, jaxon.call.json, jaxon.ajax.handler, jaxon.ajax.parameters, jaxon.utils.types);
