/**
 * Class: jaxon.cmd.json
 */

(function(self, dom, form, str) {
    /**
     * Check if a parameter is an expression.
     *
     * @var {object} xParam
     */
    const xContext = { };

    /**
     * Set the value of the current expression.
     *
     * @param {mixed} xParam
     *
     * @returns {boolean}
     */
    const setLatestValue = (xValue) => xContext.aValues[xContext.aValues.length - 1] = xValue;

    /**
     * Check if a parameter is an expression.
     *
     * @param {mixed} xParam
     *
     * @returns {boolean}
     */
    const isExpression = xParam => str.typeOf(xParam) === 'object' && (xParam._type) && (xParam._name);

    /**
     * Get the value of a single parameter.
     *
     * @param {mixed} xParam
     *
     * @returns {mixed}
     */
    const getValue = (xParam) => {
        if (!isExpression(xParam)) {
            return xParam;
        }
        const { _type: sType, _name: sName } = xParam;
        switch(sType) {
            case 'form': return form.getValues(sName);
            case 'html': return dom.$(sName).innerHTML;
            case 'input': return dom.$(sName).value;
            case 'checked': return dom.$(sName).checked;
            case 'expr': return execExpression(xParam);
            default: return undefined;
        }
    };

    /**
     * Get the values of an array of parameters.
     *
     * @param {array} aParams
     *
     * @returns {array}
     */
    const getValues = (aParams) => aParams.map(xParam => getValue(xParam));

    /**
     * Execute the javascript code represented by an expression object.
     *
     * @param {object} xCall
     *
     * @returns {void}
     */
    const execCall = (xCall) => {
        // The current value of the expression (the last element in the current values).
        const xCurrValue = xContext.aValues.slice(-1);
        const xCurrTarget = xContext.aTargets.slice(-1);
        // Make calls
        const { _type: sType, _name: sName } = xCall;
        if (sType === 'attr') {
            const { value: xValue } = xCall;
            const [innerElement, innerProperty] = dom.getInnerObject(xCurrValue, sName);
            if (xValue === undefined) {
                // Read an attribute.
                setLatestValue(innerElement[innerProperty]);
                return;
            }
            // Assign an attribute.
            setLatestValue(innerElement[innerProperty] = getValue(xValue));
            return;
        }
        if (sType === 'func') {
            if (sName === 'toInt') {
                setLatestValue(parseInt(xCurrValue));
                return;
            }
            const { params: aParams = [] } = xCall;
            // Call a function with xContext as "this" and an array of parameters.
            const func = dom.findFunction(sName, xCurrValue);
            setLatestValue(func ? func.apply(xCurrTarget, getValues(aParams)) : null);
            return;
        }
        if (sType === 'selector') {
            if (sName === 'this') {
                // Empty parameter list => $(this), or the last event target.
                setLatestValue(dom.selector(xCurrTarget));
                return;
            }
            // Call the selector with the current target as "this".
            const { context: xContext = null } = xCall;
            setLatestValue(dom.selector(dom.selector(xCurrTarget), sName, getValues(xContext)));
            return;
        }
        if (sType === 'event') {
            // Set an event handler. Takes an expression as parameter.
            const { handler: xExpression } = xCall;
            xCurrValue.on(sName, (e) => {
                // Save the current target.
                xContext.aTargets.push(e.currentTarget);
                execExpression(xExpression);
                xContext.aTargets.pop();
            });
        }
    };

    /**
     * Execute the javascript code represented by an expression object.
     *
     * @param {object} xExpression
     *
     * @returns {mixed}
     */
    const execExpression = (xExpression) => {
        // The current value of this expression
        xContext.aValues.push(window);
        // Make calls
        const { calls: aCalls = [] } = xExpression;
        aCalls.forEach(xCall => execCall(xCall));
        return xContext.aValues.pop();
    };

    /**
     * Execute the javascript code represented by an expression object.
     *
     * @param {object} xExpression An object representing a command
     *
     * @returns {mixed}
     */
    self.execute = (xExpression) => {
        xContext.aValues = [];
        xContext.aTargets = [window];
        return str.typeOf(xExpression) === 'object' ? execExpression(xExpression) : null;
    };
})(jaxon.utils.json, jaxon.utils.dom, jaxon.utils.form, jaxon.utils.string);
