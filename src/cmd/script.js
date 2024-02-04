/**
 * Class: jaxon.cmd.script
 */

(function(self, handler, dom) {
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
        self.context = context;
        const func = dom.findFunction(sFuncName);
        func && func.apply(self.context, aFuncParams);
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

        dom.createFunction(jsCode) && self.context.delegateCall();
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

        if (dom.createFunction(jsCode) && !self.context.delegateCall()) {
            // Inject a delay in the queue processing and handle retry counter
            if (handler.retry(command, duration)) {
                handler.setWakeup(response, 100);
                return false;
            }
            // Give up, continue processing queue
        }
        return true;
    };

    /**
     * Get function parameters as string
     *
     * @param {string} parameters 
     */
    const getParameters = (parameters) => {
        if (parameters === undefined) {
            return '';
        }
        const sType = str.typeOf(parameters);
        if (sType === 'array') {
            return parameters.join(', ');
        }
        if (sType === 'object') {
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
    self.setFunction = ({ func: sFuncName, data: funcBody, prop: aFuncParams, context = {} }) => {
        self.context = context;
        const jsCode = `(${getParameters(aFuncParams)}) => {
    ${funcBody}
}`;

        dom.createFunction(jsCode, sFuncName);
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
    self.wrapFunction = ({ func: sFuncName, type: returnType, prop: aFuncParams,
        data: [funcCodeBefore, funcCodeAfter = '// No call after'], context = {} }) => {
        self.context = context;
        const func = dom.findFunction(sFuncName);
        if (!func) {
            return true;
        }

        // Save the existing function
        const wrappedFuncName = sFuncName.toLowerCase().replaceAll('.', '_');
        if (!self.wrapped[wrappedFuncName]) {
            self.wrapped[wrappedFuncName] = func;
        }

        const varDefine = returnType ? `let ${returnType} = null;` : '// No return value';
        const varAssign = returnType ? `${returnType} = ` : '';
        const varReturn = returnType ? `return ${returnType};` : '// No return value';

        const jsCode = `(${getParameters(aFuncParams)}) => {
    ${varDefine}
    ${funcCodeBefore}

    const wrappedFuncName = "${sFuncName}".toLowerCase().replaceAll('.', '_');
    // Call the wrapped function (saved in jaxon.cmd.script.wrapped) with the same parameters.
    ${varAssign}jaxon.cmd.script.wrapped[wrappedFuncName](${aFuncParams});
    ${funcCodeAfter}
    ${varReturn}
}`;

        dom.createFunction(jsCode) && self.context.delegateCall();
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
})(jaxon.cmd.script, jaxon.ajax.handler, jaxon.utils.dom);
