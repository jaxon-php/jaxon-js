/**
 * Class: jaxon.call.json
 */

(function(self, query, dom, form, str) {
    /**
     * Check if a parameter is an expression.
     *
     * @var {object}
     */
    const xContext = { };

    /**
     * Get the current target.
     *
     * @returns {mixed}
     */
    const getCurrentTarget = () => xContext.aTargets[xContext.aTargets.length - 1];

    /**
     * Check if a parameter is an expression.
     *
     * @param {mixed} xParam
     *
     * @returns {boolean}
     */
    const isExpression = xParam => str.typeOf(xParam) === 'object' && (xParam._type);

    /**
     * Get the value of a single parameter.
     *
     * @param {mixed} xParam
     * @param {mixed} xCurrValue The current expression value.
     *
     * @returns {mixed}
     */
    const getValue = (xParam, xCurrValue) => {
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
            case '_': switch(sName) {
                case 'this': return xCurrValue;
                default: return undefined
            }
            default: return undefined;
        }
    };

    /**
     * Get the values of an array of parameters.
     *
     * @param {array} aParams
     * @param {mixed} xCurrValue The current expression value.
     *
     * @returns {array}
     */
    const getValues = (aParams, xCurrValue) => aParams.map(xParam => getValue(xParam, xCurrValue));

    /**
     * Execute the javascript code represented by an expression object.
     *
     * @param {object} xCall
     * @param {mixed} xCurrValue The current expression value.
     *
     * @returns {void}
     */
    const execCall = (xCall, xCurrValue) => {
        const xCurrTarget = getCurrentTarget();
        // Make calls
        const { _type: sType, _name: sName } = xCall;
        if (sType === 'select') {
            const { context: xContext = null } = xCall;
            const xTarget = sName === 'this' ?
                // Empty parameter list => $(this), ie the last event target.
                query.select(xCurrTarget) :
                // Call the selector.
                query.select(sName, !xContext ? null : getValue(xContext, xCurrValue));
            return xTarget;
        }
        if (sType === 'event') {
            // Set an event handler. Takes an expression as parameter.
            const { handler: xExpression } = xCall;
            xCurrValue.on(sName, (event) => {
                // Save the current target.
                xContext.aTargets.push({ event, target: event.currentTarget });
                execExpression(xExpression);
                xContext.aTargets.pop();
            });
            return;
        }
        if (sType === 'call') {
            const { params: aParams = [] } = xCall;
            const func = dom.findFunction(sName); // Calling a "global" function.
            return !func ? null : func.apply(xCurrTarget, getValues(aParams, xCurrValue));
        }
        if (sType === 'func') {
            const { params: aParams = [] } = xCall;
            // Call a function with xCurrValue as "this" and an array of parameters.
            const func = dom.findFunction(sName, xCurrValue);
            return !func ? null : func.apply(xCurrValue, getValues(aParams, xCurrValue));
        }
        if (sType === 'attr') {
            const { value: xValue } = xCall;
            const [innerElement, innerProperty] = dom.getInnerObject(xCurrValue, sName);
            if (xValue !== undefined) {
                // Assign an attribute.
                innerElement[innerProperty] = getValue(xValue, xCurrValue);
            }
            // Set the property value as "return" value.
            return innerElement[innerProperty];
        }
        console.error('Unexpected command type: ' + JSON.stringify({ type: sType, call: xCall }));
    };

    /**
     * Execute the javascript code represented by an expression object.
     *
     * @param {object} xExpression
     *
     * @returns {mixed}
     */
    const execExpression = (xExpression) => {
        const { calls: aCalls = [] } = xExpression;
        return aCalls.reduce((xCurrValue, xCall) => execCall(xCall, xCurrValue), null);
    };

    /**
     * Execute the javascript code represented by an expression object.
     *
     * @param {object} xExpression An object representing a command
     * @param {object} xCallContext The context to execute calls in.
     *
     * @returns {mixed}
     */
    self.call = (xExpression, xCallContext) => {
        xContext.aTargets = [xCallContext ?? window];
        return str.typeOf(xExpression) === 'object' ? execExpression(xExpression) : null;
    };
})(jaxon.call.json, jaxon.call.query, jaxon.utils.dom, jaxon.utils.form, jaxon.utils.string);
