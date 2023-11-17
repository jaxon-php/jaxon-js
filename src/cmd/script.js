jaxon.cmd.script = {
    /*
    Function: jaxon.cmd.script.includeScriptOnce

    Add a reference to the specified script file if one does not already exist in the HEAD of the current document.

    This will effecitvely cause the script file to be loaded in the browser.

    Parameters:

    fileName - (string):  The URI of the file.

    Returns:

    true - The reference exists or was added.
    */
    includeScriptOnce: function(command) {
        command.fullName = 'includeScriptOnce';

        const fileName = command.data;
        // Check for existing script tag for this file.
        const oDoc = jaxon.config.baseDocument;
        const loadedScripts = oDoc.getElementsByTagName('script');
        // Find an existing script with the same file name
        const loaded = loadedScripts.find(script => script.src && script.src.indexOf(fileName) >= 0);
        if (loaded) {
            return true;
        }
        return jaxon.cmd.script.includeScript(command);
    },

    /*
    Function: jaxon.cmd.script.includeScript

    Adds a SCRIPT tag referencing the specified file.
    This effectively causes the script to be loaded in the browser.

    Parameters:

    command (object) - Xajax response object

    Returns:

    true - The reference was added.
    */
    includeScript: function(command) {
        command.fullName = 'includeScript';

        const oDoc = jaxon.config.baseDocument;
        const objHead = oDoc.getElementsByTagName('head');
        const objScript = oDoc.createElement('script');
        objScript.src = command.data;
        objScript.type = command.type || 'text/javascript';
        if (command.elm_id) {
            objScript.setAttribute('id', command.elm_id);
        }
        objHead[0].appendChild(objScript);
        return true;
    },

    /*
    Function: jaxon.cmd.script.removeScript

    Locates a SCRIPT tag in the HEAD of the document which references the specified file and removes it.

    Parameters:

    command (object) - Xajax response object

    Returns:

    true - The script was not found or was removed.
    */
    removeScript: function(command) {
        command.fullName = 'removeScript';
        const fileName = command.data;
        const oDoc = jaxon.config.baseDocument;
        const loadedScripts = oDoc.getElementsByTagName('script');
        // Find an existing script with the same file name
        const loaded = loadedScripts.find(script => script.src && script.src.indexOf(fileName) >= 0);
        if (!loaded) {
            return true;
        }
        if (command.unld) {
            // Execute the provided unload function.
            jaxon.cmd.script.execute({ data: command.unld, context: window });
        }
        script.parentNode.removeChild(script);
        return true;
    },

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
    sleep: function(command) {
        command.fullName = 'sleep';
        // inject a delay in the queue processing
        // handle retry counter
        if (jaxon.cmd.delay.retry(command, command.prop)) {
            jaxon.cmd.delay.setWakeup(command.response, 100);
            return false;
        }
        // wake up, continue processing queue
        return true;
    },

    /*
    Function: jaxon.cmd.script.alert

    Show the specified message.

    Parameters:

    command (object) - jaxon response object

    Returns:

    true - The operation completed successfully.
    */
    alert: function(command) {
        command.fullName = 'alert';
        jaxon.ajax.message.info(command.data);
        return true;
    },

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
    confirm: function(command) {
        command.fullName = 'confirm';
        jaxon.cmd.delay.confirm(command, command.count, command.data);
        return false;
    },

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
    call: function(command) {
        command.fullName = 'call js function';
        jaxon.cmd.script.context = command.context ?? {};

        const func = jaxon.tools.dom.findFunction(command.func);
        if(!func) {
            return true;
        }
        func.apply(jaxon.cmd.script.context, command.data);
        return true;
    },

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
    execute: function(command) {
        command.fullName = 'execute Javascript';
        jaxon.cmd.script.context = command.context ?? {};

        const jsCode = `() => {
    ${command.data}
}`;
        jaxon.tools.dom.createFunction(jsCode);
        jaxon.cmd.script.context.delegateCall();
        return true;
    },

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
    waitFor: function(command) {
        command.fullName = 'waitFor';
        jaxon.cmd.script.context = command.context ?? {};

        try {
            const jsCode = `() => {
    return (${command.data});
}`;
            jaxon.tools.dom.createFunction(jsCode);
            const bResult = jaxon.cmd.script.context.delegateCall();
            if (!bResult) {
                // inject a delay in the queue processing
                // handle retry counter
                if (jaxon.cmd.delay.retry(command, command.prop)) {
                    jaxon.cmd.delay.setWakeup(command.response, 100);
                    return false;
                }
                // give up, continue processing queue
            }
        } catch (e) {}
        return true;
    },

    /**
     * Get function parameters as string
     *
     * @param {string|object} parameters 
     */
    getParameters: function(parameters) {
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
    },

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
    setFunction: function(command) {
        command.fullName = 'setFunction';

        const funcParams = jaxon.cmd.script.getParameters(command.prop);
        const jsCode = `(${funcParams}) => {
    ${command.data}
}`;
        jaxon.tools.dom.createFunction(jsCode, command.func);
        return true;
    },

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
    wrapped: {}, // Original wrapped functions will be saved here.
    wrapFunction: function(command) {
        command.fullName = 'wrapFunction';
        jaxon.cmd.script.context = command.context ?? {};

        const func = jaxon.tools.dom.findFunction(command.func);
        if(!func) {
            return true;
        }

        // Save the existing function
        const wrappedFuncName = command.func.toLowerCase().replaceAll('.', '_');
        if (!jaxon.cmd.script.wrapped[wrappedFuncName]) {
            jaxon.cmd.script.wrapped[wrappedFuncName] = func;
        }

        const varDefine = command.type ? `let ${command.type} = null;` : '// No return value';
        const varAssign = command.type ? `${command.type} = ` : '';
        const varReturn = command.type ? `return ${command.type};` : '// No return value';
        const funcParams = jaxon.cmd.script.getParameters(command.prop);
        const funcCodeBefore = command.data[0];
        const funcCodeAfter = command.data[1] || '// No call after';

        const jsCode = `(${funcParams}) => {
    ${varDefine}
    ${funcCodeBefore}

    const wrappedFuncName = "${command.func}".toLowerCase().replaceAll('.', '_');
    // Call the wrapped function (saved in jaxon.cmd.script.wrapped) with the same parameters.
    ${varAssign}jaxon.cmd.script.wrapped[wrappedFuncName](${funcParams});
    ${funcCodeAfter}
    ${varReturn}
}`;

        jaxon.tools.dom.createFunction(jsCode, command.func);
        jaxon.cmd.script.context.delegateCall();
        return true;
    }
};
