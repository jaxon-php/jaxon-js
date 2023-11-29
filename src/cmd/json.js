/**
 * Class: jaxon.cmd.json
 */

(function(self, dom, form, jq) {
    /**
     * Check if a parameter is an expression.
     *
     * @param {mixed} xParam
     *
     * @returns {boolean}
     */
    const isExpression = xParam => typeof xParam === 'object' && (xParam.__type);

    /**
     * Get the value of a single parameter.
     *
     * @param {mixed} xParam
     * @param {object|null} xTarget
     *
     * @returns {mixed}
     */
    const getValue = (xParam, xTarget) => {
        if (!isExpression(xParam)) {
            return xParam;
        }
        const { __type: sType, name: sName } = xParam;
        if (sType === 'form') {
            return form.getValues(sName);
        }
        if (sType === 'input') {
            return dom.$(sName).value;
        }
        if (sType === 'checked') {
            return dom.$(sName).checked;
        }
        if (sType === 'html') {
            return dom.$(sName).innerHTML;
        }
        // if (sType === 'expr')
        return execExpression(xParam, xTarget);
    };

    /**
     * Get the values of an array of parameters.
     *
     * @param {array} aParams
     * @param {object|null} xTarget
     *
     * @returns {array}
     */
    const getValues = (aParams, xTarget) => aParams.map(xParam => getValue(xParam, xTarget));

    /**
     * Execute the javascript code represented by an expression object.
     *
     * @param {object} xCall
     * @param {object} xContext
     * @param {object|null} xTarget
     *
     * @returns {mixed}
     */
    const execCall = (xCall, xContext, xTarget = null) => {
        if (!xContext) {
            return null;
        }

        // Make calls
        const { __type: sType, name: sName } = xCall;
        if (sType === 'attr') {
            const { param: xValue } = xCall;
            if (xValue === undefined) {
                // Read an attribute.
                return xContext[sName];
            }
            // Assign an attribute.
            xContext[sName] = getValue(xValue, xTarget);
            return;
        }
        if (sType === 'func') {
            if (sName === 'toInt') {
                return parseInt(xContext);
            }
            const { params: aParams = [] } = xCall;
            // Call a function with xContext as "this" and an array of parameters.
            const func = dom.findFunction(sName, xContext);
            return func ? func.apply(xContext, getValues(aParams, xTarget)) : null;
        }
        if (sType === 'jqsel') {
            // jQuery selector
            const { params: aParams = [] } = xCall;
            if (xContext === window && aParams.length === 0) {
                // First call with an empty parameter list => $(this).
                return xTarget;
            }
            // Call the jQuery selector with xContext as "this".
            return jq.apply(xContext, getValues(aParams, xTarget));
        }
        if (sType === 'jqevt') {
            // Set a jQuery event handler. Takes an expression as parameter.
            const { param: xExpression } = xCall;
            return xContext.on(sName, (e) => execExpression(xExpression, jq(e.currentTarget)));
        }
        return null;
    };

    /**
     * Execute the javascript code represented by an expression object.
     *
     * @param {object} xExpression
     * @param {object|null} xTarget
     *
     * @returns {mixed}
     */
    const execExpression = (xExpression, xTarget = null) => {
        // Make calls
        const { calls: aCalls = [] } = xExpression;
        let xContext = window;
        aCalls.forEach(xCall => xContext = execCall(xCall, xContext, xTarget));
        return xContext;
    };

    /**
     * Execute the javascript code represented by an expression object, using the current script context.
     *
     * @param {object} command - Response command object.
     * - data: The expression object
     *
     * @returns {true} - The operation completed successfully.
     */
    self.execute = (command) => {
        const { data: xExpression } = command;
        // Check the command data validity. The data must be an object.
        if (typeof xExpression === 'object' && !Array.isArray(xExpression)) {
            execExpression(xExpression);
        }
        return true;
    };
})(jaxon.cmd.json, jaxon.utils.dom, jaxon.utils.form, jQuery);
