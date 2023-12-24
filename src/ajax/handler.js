/**
 * Class: jaxon.ajax.handler
 */

(function(self, rsp, node, style, script, form, evt, dom, console) {
    /**
     * An array that is used internally in the jaxon.fn.handler object to keep track
     * of command handlers that have been registered.
     *
     * @var {object}
     */
    const handlers = {};

    /**
     * Registers a new command handler.
     *
     * @param {string} cmd The short name of the command handler.
     * @param {string} func The command handler function.
     * @param {string=''} name The full name of the command handler.
     *
     * @returns {void}
     */
    self.register = (cmd, func, name = '') => handlers[cmd] = { name, func };

    /**
     * Unregisters and returns a command handler.
     *
     * @param {string} cmd The name of the command handler.
     *
     * @returns {callable} The unregistered function.
     */
    self.unregister = (cmd) => {
        const handler = handlers[cmd];
        delete handlers[cmd];
        return handler.func;
    };

    /**
     * @param {object} command The response command to be executed.
     * @param {string} command.cmd The name of the function.
     *
     * @returns {boolean} (true or false): depending on whether a command handler has
     * been registered for the specified command (object).
     */
    self.isRegistered = ({ cmd }) => cmd !== undefined && handlers[cmd] !== undefined;

    /**
     * Perform a lookup on the command specified by the response command object passed
     * in the first parameter.  If the command exists, the function checks to see if
     * the command references a DOM object by ID; if so, the object is located within
     * the DOM and added to the command data.  The command handler is then called.
     * 
     * If the command handler returns true, it is assumed that the command completed
     * successfully.  If the command handler returns false, then the command is considered
     * pending; jaxon enters a wait state.  It is up to the command handler to set an
     * interval, timeout or event handler which will restart the jaxon response processing.
     * 
     * @param {object} command The response command to be executed.
     *
     * @returns {true} The command completed successfully.
     * @returns {false} The command signalled that it needs to pause processing.
     */
    self.execute = (command) => {
        if (self.isRegistered(command)) {
            // If the command has an "id" attr, find the corresponding dom element.
            if (command.id) {
                command.target = dom.$(command.id);
            }
            // Process the command
            return self.call(command);
        }
        return true;
    };

    /**
     * Calls the registered command handler for the specified command
     * (you should always check isRegistered before calling this function)
     *
     * @param {object} command The response command to be executed.
     * @param {string} command.cmd The name of the function.
     *
     * @returns {boolean}
     */
    self.call = (command) => {
        const handler = handlers[command.cmd];
        command.fullName = handler.name;
        handler.func(command);
    }

    self.register('rcmplt', ({ request }) => {
        rsp.complete(request);
        return true;
    }, 'Response complete');

    self.register('css', style.add, 'includeCSS');
    self.register('rcss', style.remove, 'removeCSS');
    self.register('wcss', style.waitForCSS, 'waitForCSS');

    self.register('as', node.assign, 'assign/clear');
    self.register('ap', node.append, 'append');
    self.register('pp', node.prepend, 'prepend');
    self.register('rp', node.replace, 'replace');
    self.register('rm', node.remove, 'remove');
    self.register('ce', node.create, 'create');
    self.register('ie', node.insert, 'insert');
    self.register('ia', node.insertAfter, 'insertAfter');
    self.register('c:as', node.contextAssign, 'context assign');
    self.register('c:ap', node.contextAppend, 'context append');
    self.register('c:pp', node.contextPrepend, 'context prepend');

    self.register('s', script.sleep, 'sleep');
    self.register('ino', script.includeScriptOnce, 'includeScriptOnce');
    self.register('in', script.includeScript, 'includeScript');
    self.register('rjs', script.removeScript, 'removeScript');
    self.register('wf', script.waitFor, 'waitFor');
    self.register('js', script.execute, 'execute Javascript');
    self.register('jc', script.call, 'call js function');
    self.register('sf', script.setFunction, 'setFunction');
    self.register('wpf', script.wrapFunction, 'wrapFunction');
    self.register('al', script.alert, 'alert');
    self.register('cc', script.confirm, 'confirm');
    self.register('rd', script.redirect, 'redirect');

    self.register('ci', form.createInput, 'createInput');
    self.register('ii', form.insertInput, 'insertInput');
    self.register('iia', form.insertInputAfter, 'insertInputAfter');

    self.register('ev', evt.setEvent, 'setEvent');
    self.register('ah', evt.addHandler, 'addHandler');
    self.register('rh', evt.removeHandler, 'removeHandler');

    self.register('dbg', function({ data: message }) {
        console.log(message);
        return true;
    }, 'Debug message');
})(jaxon.ajax.handler, jaxon.ajax.response, jaxon.cmd.node, jaxon.cmd.style,
    jaxon.cmd.script, jaxon.cmd.form, jaxon.cmd.event, jaxon.utils.dom, console);
