/**
 * Class: jaxon.cmd.json
 */

(function(self, dom, form, str) {
    /**
     * Check if a parameter is an expression.
     *
     * @var {object}
     */
    const xContext = { };

    /**
     * Set the value of the current expression.
     *
     * @param {mixed} xParam
     *
     * @returns {boolean}
     */
    const setCurrentValue = (xValue) => xContext.aValues[xContext.aValues.length - 1] = xValue;

    /**
     * Get the value of the current expression.
     *
     * @returns {mixed}
     */
    const getCurrentValue = () => xContext.aValues[xContext.aValues.length - 1];

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
            case 'this': return getCurrentValue();
            case 'expr': return execExpression(xParam);
            case '_': switch(sName) {
                case 'this': return getCurrentValue();
                default: return undefined
            }
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
        const xCurrValue = getCurrentValue();
        const xCurrTarget = getCurrentTarget();
        // Make calls
        const { _type: sType, _name: sName } = xCall;
        if (sType === 'selector') {
            const { context: xContext = null } = xCall;
            const xTarget = sName === 'this' ?
                // Empty parameter list => $(this), ie the last event target.
                dom.jqSelect(xCurrTarget) :
                // Call the selector.
                dom.jqSelect(sName, !xContext ? null : getValue(xContext));
            setCurrentValue(xTarget);
            return;
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
            setCurrentValue(!func ? null : func.apply(xCurrTarget, getValues(aParams)));
            return;
        }
        if (sType === 'func') {
            const { params: aParams = [] } = xCall;
            // Call a function with xCurrValue as "this" and an array of parameters.
            const func = dom.findFunction(sName, xCurrValue);
            setCurrentValue(!func ? null : func.apply(xCurrValue, getValues(aParams)));
            return;
        }
        if (sType === 'attr') {
            const { value: xValue } = xCall;
            const [innerElement, innerProperty] = dom.getInnerObject(xCurrValue, sName);
            if (xValue !== undefined) {
                // Assign an attribute.
                innerElement[innerProperty] = getValue(xValue);
            }
            // Set the property value as "return" value.
            setCurrentValue(innerElement[innerProperty]);
            return;
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
     * @param {object} xCallContext The context to execute calls in.
     *
     * @returns {mixed}
     */
    self.call = (xExpression, xCallContext) => {
        xContext.aValues = [];
        xContext.aTargets = [xCallContext ?? window];
        return str.typeOf(xExpression) === 'object' ? execExpression(xExpression) : null;
    };
})(jaxon.utils.json, jaxon.utils.dom, jaxon.utils.form, jaxon.utils.string);
