/**
 * Class: jaxon.cmd.event
 */

(function(self, dom, str, json) {
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
     * Call an event handler.
     *
     * @param {object} event
     * @param {object} target The target element
     * @param {string} command.prop The name of the event.
     * @param {string} func The name of the function to be called
     * @param {array} params The function parameters
     *
     * @returns {void}
     */
    const callEventHandler = (event, target, func, params) => {
        json.call({ calls: [{ _type: 'call', _name: func, params }] }, { event, target });
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
    self.addEventHandler = ({ target, prop: sEvent, func, data: params = [], options }) => {
        target.addEventListener(str.stripOnPrefix(sEvent),
            (event) => callEventHandler(event, target, func, params), options ?? false);
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
    self.setEventHandler = ({ target, prop: sEvent, func, data: params = [] }) => {
        target[str.addOnPrefix(sEvent)] = (event) => callEventHandler(event, target, func, params);
        return true;
    };

    /**
     * Replace the page number param with the current page number value
     *
     * @param {array} aParams
     * @param {integer} nPageNumber
     *
     * @returns {array}
     */
    const setPageNumber = (aParams, nPageNumber) => aParams.map(xParam =>
        str.typeOf(xParam) === 'object' && xParam._type === 'page' ? nPageNumber : xParam);

    /**
     * Set event handlers on pagination links.
     *
     * @param {object} command The Response command object.
     * @param {string} command.id The target element id
     * @param {object} command.target The target element
     * @param {string} command.call The name of the event.
     * @param {array} command.data The function parameters
     *
     * @returns {true} The operation completed successfully.
     */
    self.paginate = ({ target, call: oCall, data: aPages }) => {
        aPages.filter(({ type }) => type === 'enabled')
            .forEach(({ page }) => {
                const oLink = target.querySelector(`li[data-page='${page}'] > a`);
                if (oLink === null) {
                    return;
                }
                oLink.onClick = () => json.call({
                    calls: [{ ...oCall, params: setPageNumber(oCall.params) }],
                });
            });
        return true;
    };
})(jaxon.cmd.event, jaxon.utils.dom, jaxon.utils.string, jaxon.utils.json);
