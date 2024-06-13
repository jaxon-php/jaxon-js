/**
 * Class: jaxon.cmd.event
 */

(function(self, call, dom, str) {
    /**
     * Add an event handler to the specified target.
     *
     * @param {object} args The command arguments.
     * @param {string} args.event The name of the event.
     * @param {string} args.func The name of the function to be called
     * @param {object} context The command context.
     * @param {Element} context.target The target DOM element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.addHandler = ({ event: sEvent, func: sFuncName }, { target }) => {
        target.addEventListener(str.stripOnPrefix(sEvent), dom.findFunction(sFuncName), false)
        return true;
    };

    /**
     * Remove an event handler from an target.
     *
     * @param {object} args The command arguments.
     * @param {string} args.event The name of the event.
     * @param {string} args.func The name of the function to be removed
     * @param {object} context The command context.
     * @param {Element} context.target The target DOM element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.removeHandler = ({ event: sEvent, func: sFuncName }, { target }) => {
       target.removeEventListener(str.stripOnPrefix(sEvent), dom.findFunction(sFuncName), false);
       return true;
    };

    /**
     * Call an event handler.
     *
     * @param {string} event The name of the event
     * @param {object} func The expression to be executed in the event handler
     * @param {object} target The target element
     *
     * @returns {void}
     */
    const callEventHandler = (event, func, target) =>
        call.execExpr({ _type: 'expr', ...func }, { event, target });

    /**
     * Add an event handler with arguments to the specified target.
     *
     * @param {object} args The command arguments.
     * @param {string} args.event The name of the event
     * @param {object} args.func The event handler
     * @param {object|false} args.options The handler options
     * @param {object} context The command context.
     * @param {Element} context.target The target DOM element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.addEventHandler = ({ event: sEvent, func, options }, { target }) => {
        target.addEventListener(str.stripOnPrefix(sEvent),
            (event) => callEventHandler(event, func, target), options ?? false);
        return true;
    };

    /**
     * Set an event handler with arguments to the specified target.
     *
     * @param {object} args The command arguments.
     * @param {string} args.event The name of the event
     * @param {object} args.func The event handler
     * @param {object} context The command context.
     * @param {Element} context.target The target DOM element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.setEventHandler = ({ event: sEvent, func }, { target }) => {
        target[str.addOnPrefix(sEvent)] = (event) => callEventHandler(event, func, target);
        return true;
    };
})(jaxon.cmd.event, jaxon.parser.call, jaxon.utils.dom, jaxon.utils.string);
