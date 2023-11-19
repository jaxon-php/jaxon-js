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

    command - (object):  The response command to be executed.

    Returns:

    true - The command completed successfully.
    false - The command signalled that it needs to pause processing.
    */
    self.execute = (command) => {
        if (self.isRegistered(command)) {
            // If the command has an "id" attr, find the corresponding dom element.
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
    self.register = (shortName, func) => handlers[shortName] = func;

    /*
    Function: jaxon.ajax.handler.unregister

    Unregisters and returns a command handler.

    Parameters:
        shortName - (string): The name of the command handler.

    Returns:
        func - (function): The unregistered function.
    */
    self.unregister = (shortName) => {
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
        been registered for the specified command (object).

    */
    self.isRegistered = (command) => command.cmd !== undefined && handlers[command.cmd] !== undefined;

    /*
    Function: jaxon.ajax.handler.call

    Calls the registered command handler for the specified command
    (you should always check isRegistered before calling this function)

    Parameters:
        command - (object): The Name of the function.

    Returns:
        true - (boolean) :
    */
    self.call = (command) => handlers[command.cmd](command);

    self.register('rcmplt', function(command) {
        rsp.complete(command.request);
        return true;
    });

    self.register('css', style.add);
    self.register('rcss', style.remove);
    self.register('wcss', style.waitForCSS);

    self.register('as', node.assign);
    self.register('ap', node.append);
    self.register('pp', node.prepend);
    self.register('rp', node.replace);
    self.register('rm', node.remove);
    self.register('ce', node.create);
    self.register('ie', node.insert);
    self.register('ia', node.insertAfter);

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
    jaxon.cmd.script, jaxon.cmd.form, jaxon.cmd.event, jaxon.utils.dom, console);
