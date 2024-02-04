/**
 * Class: jaxon.cmd.event
 */

(function(self, dom, str, script) {
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
    self.addHandler = ({ target, prop: sEvent, data: sFuncName }) => {
        target.addEventListener(str.stripOnPrefix(sEvent), dom.findFunction(sFuncName), false)
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
    self.removeHandler = ({ target, prop: sEvent, data: sFuncName }) => {
       target.removeEventListener(str.stripOnPrefix(sEvent), dom.findFunction(sFuncName), false);
       return true;
    };

    /**
     * Add an event handler with parameters to the specified target.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The target element
     * @param {string} command.prop The name of the event.
     * @param {string} command.func The name of the function to be called
     * @param {array} command.data The function parameters
     * @param {object|false} command.options The handler options
     *
     * @returns {true} The operation completed successfully.
     */
    self.addEventHandler = ({ target, prop: sEvent, func, data = [], options = false }) => {
        target.addEventListener(str.stripOnPrefix(sEvent), (event) =>
            script.call({ func, data, context: { event, target } }), options);
        return true;
    };

    /**
     * Set an event handler with parameters to the specified target.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The target element
     * @param {string} command.prop The name of the event.
     * @param {string} command.func The name of the function to be called
     * @param {array} command.data The function parameters
     *
     * @returns {true} The operation completed successfully.
     */
    self.setEventHandler = ({ target, prop: sEvent, func, data = [] }) => {
        target[str.addOnPrefix(sEvent)] = (event) =>
            script.call({ func, data, context: { event, target } });
        return true;
    };
})(jaxon.cmd.event, jaxon.utils.dom, jaxon.utils.string, jaxon.cmd.script);
