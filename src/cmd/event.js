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
    self.setEvent = function(command) {
        command.fullName = 'setEvent';
        const sEvent = str.addOnPrefix(command.prop);
        const sCode = str.doubleQuotes(command.data);
        // force to get the target
        const oTarget = dom.$(command.id);
        dom.createFunction(`(e) => { ${sCode} }`);
        oTarget[sEvent] = script.context.delegateCall;
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
    self.addHandler = function(command) {
        command.fullName = 'addHandler';
        const sFuncName = command.data;
        const sEvent = getName(command.prop);
        // force to get the target
        const oTarget = dom.$(command.id);
        return _addHandler(oTarget, sEvent, sFuncName);
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
    self.removeHandler = function(command) {
        command.fullName = 'removeHandler';
        const sFuncName = command.data;
        const sEvent = getName(command.prop);
        // force to get the target
        const oTarget = dom.$(command.id);
        return _removeHandler(oTarget, sEvent, sFuncName);
    };
})(jaxon.cmd.event, jaxon.utils.dom, jaxon.utils.string, jaxon.cmd.script);
