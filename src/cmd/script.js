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
        const iLen = loadedScripts.length;
        for (let i = 0; i < iLen; ++i) {
            const script = loadedScripts[i];
            if (script.src) {
                if (0 <= script.src.indexOf(fileName))
                    return true;
            }
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
        if ('undefined' == typeof command.type) objScript.type = 'text/javascript';
        else objScript.type = command.type;
        if ('undefined' != typeof command.type) objScript.setAttribute('id', command.elm_id);
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
        const unload = command.unld;
        const oDoc = jaxon.config.baseDocument;
        const loadedScripts = oDoc.getElementsByTagName('script');
        const iLen = loadedScripts.length;
        for (let i = 0; i < iLen; ++i) {
            const script = loadedScripts[i];
            if (script.src) {
                if (0 <= script.src.indexOf(fileName)) {
                    if ('undefined' != typeof unload) {
                        const _command = {};
                        _command.data = unload;
                        _command.context = window;
                        jaxon.cmd.script.execute(_command);
                    }
                    const parent = script.parentNode;
                    parent.removeChild(script);
                }
            }
        }
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
        const returnValue = true;
        command.context = command.context ? command.context : {};
        command.context.jaxonDelegateCall = function() {
            eval(command.data);
        };
        command.context.jaxonDelegateCall();
        return returnValue;
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

        let bResult = false;
        const cmdToEval = 'bResult = (' + command.data + ');';
        try {
            command.context.jaxonDelegateCall = function() {
                eval(cmdToEval);
            }
            command.context.jaxonDelegateCall();
        } catch (e) {}
        if (false == bResult) {
            // inject a delay in the queue processing
            // handle retry counter
            if (jaxon.cmd.delay.retry(command, command.prop)) {
                jaxon.cmd.delay.setWakeup(command.response, 100);
                return false;
            }
            // give up, continue processing queue
        }
        return true;
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

        const parameters = command.data;

        const code = [];
        code.push(command.func);
        code.push('(');
        if ('undefined' != typeof parameters) {
            if ('object' == typeof parameters) {
                const iLen = parameters.length;
                if (0 < iLen) {
                    code.push('parameters[0]');
                    for (let i = 1; i < iLen; ++i)
                        code.push(', parameters[' + i + ']');
                }
            }
        }
        code.push(');');
        command.context.jaxonDelegateCall = function() {
            eval(code.join(''));
        }
        command.context.jaxonDelegateCall();
        return true;
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

        const code = new Array();
        code.push(command.func);
        code.push(' = function(');
        if ('object' == typeof command.prop) {
            let separator = '';
            for (let m in command.prop) {
                code.push(separator);
                code.push(command.prop[m]);
                separator = ',';
            }
        } else code.push(command.prop);
        code.push(') { ');
        code.push(command.data);
        code.push(' }');
        command.context.jaxonDelegateCall = function() {
            eval(code.join(''));
        }
        command.context.jaxonDelegateCall();
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
    wrapFunction: function(command) {
        command.fullName = 'wrapFunction';

        const code = new Array();
        code.push(command.func);
        code.push(' = jaxon.cmd.script.makeWrapper(');
        code.push(command.func);
        code.push(', command.prop, command.data, command.type, command.context);');
        command.context.jaxonDelegateCall = function() {
            eval(code.join(''));
        }
        command.context.jaxonDelegateCall();
        return true;
    },

    /*
    Function: jaxon.cmd.script.makeWrapper


    Helper function used in the wrapping of an existing javascript function.

    Parameters:

    origFun - (string):  The name of the original function.
    args - (string):  The list of parameters used when calling the function.
    codeBlocks - (array):  Array of strings of javascript code to be executed
        before, after and perhaps between calls to the original function.
    returnVariable - (string):  The name of the variable used to retain the
        return value from the call to the original function.
    context - (object):  The current script context object which is accessable
        in the function name and body via the 'this' keyword.

    Returns:

    object - The complete wrapper function.
    */
    makeWrapper: function(origFun, args, codeBlocks, returnVariable, context) {
        const originalCall = (returnVariable.length > 0 ? returnVariable + ' = ' : '') +
            origFun + '(' + args + '); ';

        let code = 'wrapper = function(' + args + ') { ';

        if (returnVariable.length > 0) {
            code += ' let ' + returnVariable + ' = null;';
        }
        let separator = '';
        const bLen = codeBlocks.length;
        for (let b = 0; b < bLen; ++b) {
            code += separator + codeBlocks[b];
            separator = originalCall;
        }
        if (returnVariable.length > 0) {
            code += ' return ' + returnVariable + ';';
        }
        code += ' } ';

        let wrapper = null;
        context.jaxonDelegateCall = function() {
            eval(code);
        }
        context.jaxonDelegateCall();
        return wrapper;
    }
};
