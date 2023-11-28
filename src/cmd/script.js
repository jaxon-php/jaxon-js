/**
 * Class: jaxon.cmd.script
 */

(function(self, delay, msg, dom, baseDocument, window) {
    /*
    Function: jaxon.cmd.script.includeScriptOnce

    Add a reference to the specified script file if one does not already exist in the HEAD of the current document.

    This will effecitvely cause the script file to be loaded in the browser.

    Parameters:

    fileName - (string):  The URI of the file.

    Returns:

    true - The reference exists or was added.
    */
    self.includeScriptOnce = (command) => {
        command.fullName = 'includeScriptOnce';

        const fileName = command.data;
        // Check for existing script tag for this file.
        const loadedScripts = baseDocument.getElementsByTagName('script');
        // Find an existing script with the same file name
        const loadedScript = loadedScripts.find(script => script.src && script.src.indexOf(fileName) >= 0);
        if (loadedScript) {
            return true;
        }
        return self.includeScript(command);
    };

    /*
    Function: jaxon.cmd.script.includeScript

    Adds a SCRIPT tag referencing the specified file.
    This effectively causes the script to be loaded in the browser.

    Parameters:

    command (object) - Xajax response object

    Returns:

    true - The reference was added.
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

    /*
    Function: jaxon.cmd.script.removeScript

    Locates a SCRIPT tag in the HEAD of the document which references the specified file and removes it.

    Parameters:

    command (object) - Xajax response object

    Returns:

    true - The script was not found or was removed.
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

    /*
    Function: jaxon.cmd.script.sleep

    Causes the processing of items in the queue to be delayed for the specified amount of time.
    This is an asynchronous operation, therefore, other operations will be given an opportunity
    to execute during this delay.

    Parameters:

    command - (object):  The response command containing the following parameters.
        - command.prop: The number of 10ths of a second to sleep.

    Returns:

    true - The sleep operation completed.
    false - The sleep time has not yet expired, continue sleeping.
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

    /*
    Function: jaxon.cmd.script.alert

    Show the specified message.

    Parameters:

    command (object) - jaxon response object

    Returns:

    true - The operation completed successfully.
    */
    self.alert = (command) => {
        command.fullName = 'alert';
        msg.info(command.data);
        return true;
    };

    /*
    Function: jaxon.cmd.script.confirm

    Prompt the user with the specified question, if the user responds by clicking cancel,
    then skip the specified number of commands in the response command queue.
    If the user clicks Ok, the command processing resumes normal operation.

    Parameters:

    command (object) - jaxon response object

    Returns:

    false - Stop the processing of the command queue until the user answers the question.
    */
    self.confirm = (command) => {
        command.fullName = 'confirm';
        const { count, data: question } = command;
        delay.confirm(command, count, question);
        return false;
    };

    /*
    Function: jaxon.cmd.script.call

    Call a javascript function with a series of parameters using the current script context.

    Parameters:

    command - The response command object containing the following:
        - command.data: (array):  The parameters to pass to the function.
        - command.func: (string):  The name of the function to call.
        - command.context: (object):  The current script context object which is accessable in the
            function name via the 'this keyword.

    Returns:

    true - The call completed successfully.
    */
    self.call = (command) => {
        command.fullName = 'call js function';
        self.context = command.context ?? {};

        const { func: funcName, data: funcParams } = command;
        const func = dom.findFunction(funcName);
        if(!func) {
            return true;
        }
        func.apply(self.context, funcParams);
        return true;
    };

    /*
    Function: jaxon.cmd.script.execute

    Execute the specified string of javascript code, using the current script context.

    Parameters:

    command - The response command object containing the following:
        - command.data: (string):  The javascript to be evaluated.
        - command.context: (object):  The javascript object that to be referenced as 'this' in the script.

    Returns:

    unknown - A value set by the script using 'returnValue = '
    true - If the script does not set a returnValue.
    */
    self.execute = (command) => {
        command.fullName = 'execute Javascript';
        self.context = command.context ?? {};

        const { data: funcBody } = command;
        const jsCode = `() => {
    ${funcBody}
}`;
        dom.createFunction(jsCode);
        self.context.delegateCall();
        return true;
    };

    /*
    Function: jaxon.cmd.script.waitFor

    Test for the specified condition, using the current script context;
    if the result is false, sleep for 1/10th of a second and try again.

    Parameters:

    command - The response command object containing the following:

        - command.data: (string):  The javascript to evaluate.
        - command.prop: (integer):  The number of 1/10ths of a second to wait before giving up.
        - command.context: (object):  The current script context object which is accessable in
            the javascript being evaulated via the 'this' keyword.

    Returns:

    false - The condition evaulates to false and the sleep time has not expired.
    true - The condition evaluates to true or the sleep time has expired.
    */
    self.waitFor = (command) => {
        command.fullName = 'waitFor';
        self.context = command.context ?? {};

        const { data: funcBody, prop: duration, response } = command;
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

    /*
    Function: jaxon.cmd.script.setFunction

    Constructs the specified function using the specified javascript as the body of the function.

    Parameters:

    command - The response command object which contains the following:

        - command.func: (string):  The name of the function to construct.
        - command.data: (string):  The script that will be the function body.
        - command.context: (object):  The current script context object
            which is accessable in the script name via the 'this' keyword.

    Returns:

    true - The function was constructed successfully.
    */
    self.setFunction = (command) => {
        command.fullName = 'setFunction';

        const { func: funcName, data: funcBody, prop: funcParams } = command;
        const jsCode = `(${getParameters(funcParams)}) => {
    ${funcBody}
}`;
        dom.createFunction(jsCode, funcName);
        return true;
    };

    /*
    Function: jaxon.cmd.script.wrapFunction

    Construct a javascript function which will call the original function with the same name,
    potentially executing code before and after the call to the original function.

    Parameters:

    command - (object):  The response command object which will contain the following:

        - command.func: (string):  The name of the function to be wrapped.
        - command.prop: (string):  List of parameters used when calling the function.
        - command.data: (array):  The portions of code to be called before, after
            or even between calls to the original function.
        - command.context: (object):  The current script context object which is
            accessable in the function name and body via the 'this' keyword.

    Returns:

    true - The wrapper function was constructed successfully.
    */
    self.wrapped = {}; // Original wrapped functions will be saved here.
    self.wrapFunction = (command) => {
        command.fullName = 'wrapFunction';
        self.context = command.context ?? {};

        const { func: funcName } = command;
        const func = dom.findFunction(funcName);
        if(!func) {
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
    }
})(jaxon.cmd.script, jaxon.utils.delay, jaxon.ajax.message,
    jaxon.utils.dom, jaxon.config.baseDocument, window);
