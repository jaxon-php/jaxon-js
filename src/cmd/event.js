/**
 * Class: jaxon.cmd.event
 */

(function(self, dom, str, script) {
    /**
     *  Set an event handler.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The target element
     * @param {string} command.prop The event name
     * @param {string} command.data The callback code
     *
     * @returns {true} The operation completed successfully.
     */
    self.setEvent = (command) => {
        command.fullName = 'setEvent';
        const { target: oTarget, prop: sEvent, data: sCode } = command;

        dom.createFunction(`(e) => { ${str.doubleQuotes(sCode)} }`);
        oTarget[str.addOnPrefix(sEvent)] = script.context.delegateCall;
        return true;
    };

    /**
     * Get the real name of an event handler
     *
     * @type {(string) => string}
     */
    const getName = window.addEventListener ? str.stripOnPrefix : str.addOnPrefix;

    /**
     * @param {object} target The target element
     * @param {string} event An event name
     * @param {string} func A function name
     *
     * @returns {void}
     */
    const _addHandler = window.addEventListener ?
        (target, event, func) => target.addEventListener(event, dom.findFunction(func), false) :
        (target, event, func) => target.attachEvent(event, dom.findFunction(func));

    /**
     * @param {object} target The target element
     * @param {string} event An event name
     * @param {string} func A function name
     *
     * @returns {void}
     */
    const _removeHandler = window.addEventListener ?
        (target, event, func) => target.removeEventListener(event, dom.findFunction(func), false) :
        (target, event, func) => target.detachEvent(event, dom.findFunction(func));

    /**
     * Add an event handler to the specified target.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The target element
     * @param {string} command.prop The name of the event.
     * @param {string} command.data The name of the function to be called
     *
     * @returns {true} The operation completed successfully.
     */
    self.addHandler = (command) => {
        command.fullName = 'addHandler';
        const { target: oTarget, prop: sEvent, data: sFuncName } = command;

        _addHandler(oTarget, getName(sEvent), sFuncName);
        return true;
    };

    /**
     * Remove an event handler from an target.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The target element
     * @param {string} command.prop The name of the event.
     * @param {string} command.data The name of the function to be removed
     *
     * @returns {true} The operation completed successfully.
     */
    self.removeHandler = (command) => {
        command.fullName = 'removeHandler';
        const { target: oTarget, prop: sEvent, data: sFuncName } = command;

       _removeHandler(oTarget, getName(sEvent), sFuncName);
       return true;
    };
})(jaxon.cmd.event, jaxon.utils.dom, jaxon.utils.string, jaxon.cmd.script);
