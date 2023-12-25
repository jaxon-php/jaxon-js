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
    self.setEvent = ({ target: oTarget, prop: sEvent, data: sCode }) => {
        dom.createFunction(`(e) => { ${str.doubleQuotes(sCode)} }`);
        oTarget[str.addOnPrefix(sEvent)] = script.context.delegateCall;
        return true;
    };

    /**
     * @param {object} target The target element
     * @param {string} event An event name
     * @param {string} func A function name
     *
     * @returns {void}
     */
    const _addHandler = (target, event, func) =>
        target.addEventListener(event, dom.findFunction(func), false);

    /**
     * @param {object} target The target element
     * @param {string} event An event name
     * @param {string} func A function name
     *
     * @returns {void}
     */
    const _removeHandler = (target, event, func) =>
        target.removeEventListener(event, dom.findFunction(func), false);

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
    self.addHandler = ({ target: oTarget, prop: sEvent, data: sFuncName }) => {
        _addHandler(oTarget, str.stripOnPrefix(sEvent), sFuncName);
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
    self.removeHandler = ({ target: oTarget, prop: sEvent, data: sFuncName }) => {
       _removeHandler(oTarget, str.stripOnPrefix(sEvent), sFuncName);
       return true;
    };
})(jaxon.cmd.event, jaxon.utils.dom, jaxon.utils.string, jaxon.cmd.script);
