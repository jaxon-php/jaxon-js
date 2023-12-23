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
    self.includeScriptOnce = (command) => {
        command.fullName = 'includeScriptOnce';

        const { data: fileName } = command;
        // Check for existing script tag for this file.
        const loadedScripts = baseDocument.getElementsByTagName('script');
        // Find an existing script with the same file name
        const loadedScript = loadedScripts.find(script => script.src && script.src.indexOf(fileName) >= 0);
        if (loadedScript) {
            return true;
        }
        return self.includeScript(command);
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
    self.includeScript = (command) => {
        command.fullName = 'includeScript';

        const objHead = baseDocument.getElementsByTagName('head');
        const objScript = baseDocument.createElement('script');
        objScript.src = command.data;
        objScript.type = command.type || 'text/javascript';
        if (command.elm_id) {
            objScript.setAttribute('id', command.elm_id);
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
    self.removeScript = (command) => {
        command.fullName = 'removeScript';

        const { data: fileName, unld: unload } = command;
        const loadedScripts = baseDocument.getElementsByTagName('script');
        // Find an existing script with the same file name
        const loadedScript = loadedScripts.find(script => script.src && script.src.indexOf(fileName) >= 0);
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
        command.fullName = 'sleep';

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
    self.alert = (command) => {
        command.fullName = 'alert';
        const { data: message } = command;
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
        command.fullName = 'confirm';
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
    self.call = (command) => {
        command.fullName = 'call js function';

        const { func: funcName, data: funcParams, context = {} } = command;
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
    self.execute = (command) => {
        command.fullName = 'execute Javascript';

        const { data: funcBody, context = {} } = command;
        self.context = context;
        const jsCode = `() => {
    ${funcBody}
}`;
        dom.createFunction(jsCode);
        self.context.delegateCall();
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
        command.fullName = 'waitFor';

        const { data: funcBody, prop: duration, response, context = {} } = command;
        self.context = context;
        try {
            const jsCode = `() => {
    return (${funcBody});
}`;
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
    self.setFunction = (command) => {
        command.fullName = 'setFunction';

        const { func: funcName, data: funcBody, prop: funcParams, context = {} } = command;
        self.context = context;
        const jsCode = `(${getParameters(funcParams)}) => {
    ${funcBody}
}`;
        dom.createFunction(jsCode, funcName);
        return true;
    };

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
    self.wrapped = {}; // Original wrapped functions will be saved here.
    self.wrapFunction = (command) => {
        command.fullName = 'wrapFunction';

        const { func: funcName, context = {} } = command;
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

        const {
            data: [funcCodeBefore, funcCodeAfter = '// No call after'],
            prop: funcParams,
            type: returnType,
        } = command;
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

        dom.createFunction(jsCode, funcName);
        self.context.delegateCall();
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
    self.redirect = (command) => {
        command.fullName = 'redirect';

        const { data: sUrl, delay: nDelay } = command;
        if (nDelay <= 0) {
            window.location = sUrl;
            return true;
        }
        window.setTimeout(() => window.location = sUrl, nDelay * 1000);
        return true;
    };
})(jaxon.cmd.script, jaxon.utils.delay, jaxon.ajax.message,
    jaxon.utils.dom, jaxon.config.baseDocument, window);
