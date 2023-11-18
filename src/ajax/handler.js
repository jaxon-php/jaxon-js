/**
 * Class: jaxon.ajax.handler
 */

(function(self, rsp, node, style, script, form, evt, dom, console) {
    /*
    An array that is used internally in the jaxon.fn.handler object
    to keep track of command handlers that have been registered.
    */
    const handlers = [];

    /*
    Function: jaxon.ajax.handler.execute

    Perform a lookup on the command specified by the response command
    object passed in the first parameter.  If the command exists, the
    function checks to see if the command references a DOM object by
    ID; if so, the object is located within the DOM and added to the
    command data.  The command handler is then called.

    If the command handler returns true, it is assumed that the command
    completed successfully.  If the command handler returns false, then the
    command is considered pending; jaxon enters a wait state.  It is up
    to the command handler to set an interval, timeout or event handler
    which will restart the jaxon response processing.

    Parameters:

    obj - (object):  The response command to be executed.

    Returns:

    true - The command completed successfully.
    false - The command signalled that it needs to pause processing.
    */
    self.execute = function(command) {
        if (self.isRegistered(command)) {
            // it is important to grab the element here as the previous command
            // might have just created the element
            if (command.id) {
                command.target = dom.$(command.id);
            }
            // process the command
            return self.call(command);
        }
        return true;
    };

    /*
    Function: jaxon.ajax.handler.register

    Registers a new command handler.
    */
    self.register = function(shortName, func) {
        handlers[shortName] = func;
    };

    /*
    Function: jaxon.ajax.handler.unregister

    Unregisters and returns a command handler.

    Parameters:
        shortName - (string): The name of the command handler.

    Returns:
        func - (function): The unregistered function.
    */
    self.unregister = function(shortName) {
        const func = handlers[shortName];
        delete handlers[shortName];
        return func;
    };

    /*
    Function: jaxon.ajax.handler.isRegistered

    Parameters:
        command - (object): The Name of the function.

    Returns:

    boolean - (true or false): depending on whether a command handler has
    been created for the specified command (object).

    */
    self.isRegistered = function(command) {
        return command.cmd !== undefined && handlers[command.cmd] !== undefined;
    };

    /*
    Function: jaxon.ajax.handler.call

    Calls the registered command handler for the specified command
    (you should always check isRegistered before calling this function)

    Parameters:
        command - (object): The Name of the function.

    Returns:
        true - (boolean) :
    */
    self.call = function(command) {
        return handlers[command.cmd](command);
    };

    self.register('rcmplt', function(command) {
        rsp.complete(command.request);
        return true;
    });

    self.register('css', function(command) {
        command.fullName = 'includeCSS';
        if (command.media === undefined)
            command.media = 'screen';
        return style.add(command.data, command.media);
    });
    self.register('rcss', function(command) {
        command.fullName = 'removeCSS';
        if (command.media === undefined)
            command.media = 'screen';
        return style.remove(command.data, command.media);
    });
    self.register('wcss', function(command) {
        command.fullName = 'waitForCSS';
        return style.waitForCSS(command);
    });

    self.register('as', function(command) {
        command.fullName = 'assign/clear';
        try {
            return node.assign(command.target, command.prop, command.data);
        } catch (e) {
            // do nothing, if the debug module is installed it will
            // catch and handle the exception
        }
        return true;
    });
    self.register('ap', function(command) {
        command.fullName = 'append';
        return node.append(command.target, command.prop, command.data);
    });
    self.register('pp', function(command) {
        command.fullName = 'prepend';
        return node.prepend(command.target, command.prop, command.data);
    });
    self.register('rp', function(command) {
        command.fullName = 'replace';
        return node.replace(command.id, command.prop, command.data);
    });
    self.register('rm', function(command) {
        command.fullName = 'remove';
        return node.remove(command.id);
    });
    self.register('ce', function(command) {
        command.fullName = 'create';
        return node.create(command.id, command.data, command.prop);
    });
    self.register('ie', function(command) {
        command.fullName = 'insert';
        return node.insert(command.id, command.data, command.prop);
    });
    self.register('ia', function(command) {
        command.fullName = 'insertAfter';
        return node.insertAfter(command.id, command.data, command.prop);
    });

    self.register('c:as', node.contextAssign);
    self.register('c:ap', node.contextAppend);
    self.register('c:pp', node.contextPrepend);

    self.register('s', script.sleep);
    self.register('ino', script.includeScriptOnce);
    self.register('in', script.includeScript);
    self.register('rjs', script.removeScript);
    self.register('wf', script.waitFor);
    self.register('js', script.execute);
    self.register('jc', script.call);
    self.register('sf', script.setFunction);
    self.register('wpf', script.wrapFunction);
    self.register('al', script.alert);
    self.register('cc', script.confirm);

    self.register('ci', form.createInput);
    self.register('ii', form.insertInput);
    self.register('iia', form.insertInputAfter);

    self.register('ev', evt.setEvent);

    self.register('ah', evt.addHandler);
    self.register('rh', evt.removeHandler);

    self.register('dbg', function(command) {
        command.fullName = 'debug message';
        console.log(command.data);
        return true;
    });
})(jaxon.ajax.handler, jaxon.ajax.response, jaxon.cmd.node, jaxon.cmd.style,
    jaxon.cmd.script, jaxon.cmd.form, jaxon.cmd.event, jaxon.tools.dom, console);
