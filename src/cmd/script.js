/**
 * Class: jaxon.cmd.script
 */

(function(self, json, handler, parameters) {
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
     * Show the specified message.
     *
     * @param {object} command The Response command object.
     * @param {string} command.message The message to display.
     *
     * @returns {true} The operation completed successfully.
     */
    self.alert = ({ message }) => {
        handler.alert(message);
        return true;
    };

    /**
     * Prompt the user with the specified question, if the user responds by clicking cancel,
     * then skip the specified number of commands in the response command queue.
     * If the user clicks Ok, the command processing resumes normal operation.
     *
     * @param {object} command The Response command object.
     * @param {string} command.question The question to ask.
     * @param {integer} command.count The number of commands to skip.
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
     * @param {object} command The Response command object.
     * @param {string} command.func The name of the function to call.
     * @param {array} command.args  The parameters to pass to the function.
     * @param {object} command.context The javascript object to be referenced as 'this' in the script.
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
     * @param {object} command The Response command object.
     * @param {string} command.url The new URL to redirect to
     * @param {integer} command.delay The time to wait before the redirect.
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
     * @param {object} command The Response command object.
     * @param {string} command.values The databag values.
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
     * @param {object} command The Response command object.
     * @param {object} command.selector The JQuery expression
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
     * @param {integer} nPageNumber
     *
     * @returns {array}
     */
    const setPageNumber = (aArgs, nPageNumber) => aArgs.map(xArg =>
        str.typeOf(xArg) === 'object' && xArg._type === 'page' ? nPageNumber : xArg);

    /**
     * Set event handlers on pagination links.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The pagination wrapper id
     * @param {object} command.target The pagination wrapper element
     * @param {array} command.call The page call
     * @param {array} command.pages The page list
     *
     * @returns {true} The operation completed successfully.
     */
    self.paginate = ({ target, call: oCall, pages: aPages }) => {
        aPages.filter(({ type }) => type === 'enabled')
            .forEach(({ number }) => {
                const oLink = target.querySelector(`li[data-page='${number}'] > a`);
                if (oLink !== null) {
                    oLink.onClick = () => json.execCall({
                        ...oCall,
                        _type: 'func',
                        args: setPageNumber(oCall.args, number),
                    });
                }
            });
        return true;
    };
})(jaxon.cmd.script, jaxon.cmd.call.json, jaxon.ajax.handler, jaxon.ajax.parameters);
