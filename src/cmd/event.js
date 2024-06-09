/**
 * Class: jaxon.cmd.event
 */

(function(self, call, dom, str) {
    /**
     * Add an event handler to the specified target.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The target element
     * @param {string} args.event The name of the event.
     * @param {string} args.func The name of the function to be called
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
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The target element
     * @param {string} args.event The name of the event.
     * @param {string} args.func The name of the function to be removed
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
    const callEventHandler = (event, target, func) =>
        call.execExpr({ _type: 'expr', ...func }, { event, target });

    /**
     * Add an event handler with arguments to the specified target.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The target element
     * @param {string} args.event The name of the event
     * @param {object} args.func The event handler
     * @param {object|false} args.options The handler options
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
     * @param {object} args The command arguments.
     * @param {string} args.id The target element id
     * @param {object} args.target The target element
     * @param {string} args.event The name of the event
     * @param {object} args.func The event handler
     *
     * @returns {true} The operation completed successfully.
     */
    self.setEventHandler = ({ target, event: sEvent, func }) => {
        target[str.addOnPrefix(sEvent)] = (evt) => callEventHandler(evt, target, func);
        return true;
    };
})(jaxon.cmd.event, jaxon.parser.call, jaxon.utils.dom, jaxon.utils.string);
