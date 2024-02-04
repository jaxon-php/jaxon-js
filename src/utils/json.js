/**
 * Class: jaxon.cmd.json
 */

(function(self, dom, form, str, jq) {
    /**
     * Check if a parameter is an expression.
     *
     * @param {mixed} xParam
     *
     * @returns {boolean}
     */
    const isExpression = xParam => str.typeOf(xParam) === 'object' && (xParam.__type);

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
            return xParam.value;
        }
        const { __type: sType, name: sName } = xParam;
        switch(sType) {
            case 'form': return form.getValues(sName);
            case 'html': return dom.$(sName).innerHTML;
            case 'input': return dom.$(sName).value;
            case 'checked': return dom.$(sName).checked;
            case 'expr':
            default: return execExpression(xParam, xTarget);
        }
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
            const func = dom.findFunction(sName);
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
     * Execute the javascript code represented by an expression object.
     *
     * @param {object} xExpression An object representing a command
     *
     * @returns {mixed}
     */
    self.execute = (xExpression) => {
        // Check the command data validity. The data must be an object.
        return str.typeOf(xExpression) === 'object' ? execExpression(xExpression) : false;
    };
})(jaxon.utils.json, jaxon.utils.dom, jaxon.utils.form, jaxon.utils.string, jQuery);
