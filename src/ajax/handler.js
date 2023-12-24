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
     * @param {string} name The full name of the command handler.
     * @param {string} func The command handler function.
     *
     * @returns {void}
     */
    self.register = (cmd, name, func) => handlers[cmd] = { name, func };

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

    self.register('rcmplt', 'Response complete', ({ request }) => {
        rsp.complete(request);
        return true;
    });

    self.register('css', 'includeCSS', style.add);
    self.register('rcss', 'removeCSS', style.remove);
    self.register('wcss', 'waitForCSS', style.waitForCSS);

    self.register('as', 'assign/clear', node.assign);
    self.register('ap', 'append', node.append);
    self.register('pp', 'prepend', node.prepend);
    self.register('rp', 'replace', node.replace);
    self.register('rm', 'remove', node.remove);
    self.register('ce', 'create', node.create);
    self.register('ie', 'insert', node.insert);
    self.register('ia', 'insertAfter', node.insertAfter);
    self.register('c:as', 'context assign', node.contextAssign);
    self.register('c:ap', 'context append', node.contextAppend);
    self.register('c:pp', 'context prepend', node.contextPrepend);

    self.register('s', 'sleep', script.sleep);
    self.register('ino', 'includeScriptOnce', script.includeScriptOnce);
    self.register('in', 'includeScript', script.includeScript);
    self.register('rjs', 'removeScript', script.removeScript);
    self.register('wf', 'waitFor', script.waitFor);
    self.register('js', 'execute Javascript', script.execute);
    self.register('jc', 'call js function', script.call);
    self.register('sf', 'setFunction', script.setFunction);
    self.register('wpf', 'wrapFunction', script.wrapFunction);
    self.register('al', 'alert', script.alert);
    self.register('cc', 'confirm', script.confirm);
    self.register('rd', 'redirect', script.redirect);

    self.register('ci', 'createInput', form.createInput);
    self.register('ii', 'insertInput', form.insertInput);
    self.register('iia', 'insertInputAfter', form.insertInputAfter);

    self.register('ev', 'setEvent', evt.setEvent);
    self.register('ah', 'addHandler', evt.addHandler);
    self.register('rh', 'removeHandler', evt.removeHandler);

    self.register('dbg', 'Debug message', function({ data: message }) {
        console.log(message);
        return true;
    });
})(jaxon.ajax.handler, jaxon.ajax.response, jaxon.cmd.node, jaxon.cmd.style,
    jaxon.cmd.script, jaxon.cmd.form, jaxon.cmd.event, jaxon.utils.dom, console);
