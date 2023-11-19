/**
 * Class: jaxon.cmd.event
 */

(function(self, dom, str, script) {
    /**
     *  Set an event handler.
     *
     * @param {object} command - Response command object.
     * - id: Element ID
     * - prop: Event
     * - data: Code
     *
     * @returns {true} - The operation completed successfully.
     */
    self.setEvent = (command) => {
        command.fullName = 'setEvent';
        const { target: oTarget, prop: sEvent, data: sCode } = command;

        dom.createFunction(`(e) => { ${str.doubleQuotes(sCode)} }`);
        oTarget[str.addOnPrefix(sEvent)] = script.context.delegateCall;
        return true;
    };

    const getName = window.addEventListener ? str.stripOnPrefix : str.addOnPrefix;

    const _addHandler = window.addEventListener ?
        (target, event, func) => target.addEventListener(event, dom.findFunction(func), false) :
        (target, event, func) => target.attachEvent(event, dom.findFunction(func));

    const _removeHandler = window.addEventListener ?
        (target, event, func) => target.removeEventListener(event, dom.findFunction(func), false) :
        (target, event, func) => target.detachEvent(event, dom.findFunction(func));

    /**
     * Add an event handler to the specified target.
     *
     * @param {object} command - Response command object.
     * - id: The id of, or the target itself
     * - prop: The name of the event.
     * - data: The name of the function to be called
     *
     * @returns {true} - The operation completed successfully.
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
     * @param {object} command - Response command object.
     * - id: The id of, or the target itself
     * - prop: The name of the event.
     * - data: The name of the function to be called
     *
     * @returns {true} - The operation completed successfully.
     */
    self.removeHandler = (command) => {
        command.fullName = 'removeHandler';
        const { target: oTarget, prop: sEvent, data: sFuncName } = command;

       _removeHandler(oTarget, getName(sEvent), sFuncName);
       return true;
    };
})(jaxon.cmd.event, jaxon.utils.dom, jaxon.utils.string, jaxon.cmd.script);
