/**
 * Class: jaxon.cmd.script
 */

(function(self, handler, json) {
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
        const { prop: duration, response } = command;
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
     * @param {string} command.data The message to display.
     *
     * @returns {true} The operation completed successfully.
     */
    self.alert = ({ data: message }) => {
        handler.alert(message);
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
        handler.confirm(command, count, question);
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
    self.call = ({ func: sFuncName, data: aFuncParams, context = {} }) => {
        // Add the function in the context
        self.context = context;
        json.call({ calls: [{ _type: 'call', _name: sFuncName, params: aFuncParams }] }, self.context);
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
})(jaxon.cmd.script, jaxon.ajax.handler, jaxon.utils.json);
