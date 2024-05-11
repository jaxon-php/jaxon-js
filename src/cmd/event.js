/**
 * Class: jaxon.cmd.event
 */

(function(self, json, dom, str) {
    /**
     * Add an event handler to the specified target.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The target element
     * @param {string} command.event The name of the event.
     * @param {string} command.func The name of the function to be called
     *
     * @returns {true} The operation completed successfully.
     */
    self.addHandler = ({ target, event: sEvent, func: sFuncName }) => {
        target.addEventListener(str.stripOnPrefix(sEvent), dom.findFunction(sFuncName), false)
        return true;
    };

    /**
     * Remove an event handler from an target.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The target element
     * @param {string} command.event The name of the event.
     * @param {string} command.func The name of the function to be removed
     *
     * @returns {true} The operation completed successfully.
     */
    self.removeHandler = ({ target, event: sEvent, func: sFuncName }) => {
       target.removeEventListener(str.stripOnPrefix(sEvent), dom.findFunction(sFuncName), false);
       return true;
    };

    /**
     * Call an event handler.
     *
     * @param {object} target The target element
     * @param {string} event The name of the event
     * @param {object} func The expression to be executed in the event handler
     *
     * @returns {void}
     */
    const callEventHandler = (event, target, func) => {
        json.execExpr({ _type: 'expr', ...func }, { event, target });
    };

    /**
     * Add an event handler with arguments to the specified target.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The target element
     * @param {string} command.event The name of the event
     * @param {object} command.func The event handler
     * @param {object|false} command.options The handler options
     *
     * @returns {true} The operation completed successfully.
     */
    self.addEventHandler = ({ target, event: sEvent, func, options }) => {
        target.addEventListener(str.stripOnPrefix(sEvent),
            (evt) => callEventHandler(evt, target, func), options ?? false);
        return true;
    };

    /**
     * Set an event handler with arguments to the specified target.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The target element
     * @param {string} command.event The name of the event
     * @param {object} command.func The event handler
     *
     * @returns {true} The operation completed successfully.
     */
    self.setEventHandler = ({ target, event: sEvent, func }) => {
        target[str.addOnPrefix(sEvent)] = (evt) => callEventHandler(evt, target, func);
        return true;
    };
})(jaxon.cmd.event, jaxon.cmd.call.json, jaxon.utils.dom, jaxon.utils.string);
