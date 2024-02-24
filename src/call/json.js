/**
 * Class: jaxon.call.json
 */

(function(self, query, dom, form, str) {
    /**
     * The call contexts.
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
     * The call commands
     *
     * @var {object}
     */
    const xCommands = {
        select: ({ _name: sName, context: xContext = null }, xCurrValue) => {
            return sName === 'this' ?
                // Empty parameter list => $(this), ie the last event target.
                query.select(getCurrentTarget()) :
                // Call the selector.
                query.select(sName, !xContext ? null : getValue(xContext, xCurrValue));
        },
        event: ({ _name: sName, handler: xExpression }, xCurrValue) => {
            // Set an event handler. Takes an expression as parameter.
            xCurrValue.on(sName, (event) => {
                // Save the current target.
                xContext.aTargets.push({ event, target: event.currentTarget });
                execExpression(xExpression);
                xContext.aTargets.pop();
            });
            return true;
        },
        func: ({ _name: sName, params: aParams = [] }, xCurrValue) => {
            // Call a "global" function with the current target as "this" and an array of parameters.
            const func = dom.findFunction(sName);
            return !func ? null : func.apply(getCurrentTarget(), getValues(aParams, xCurrValue));
        },
        method: ({ _name: sName, params: aParams = [] }, xCurrValue) => {
            // Call a function with xCurrValue as "this" and an array of parameters.
            const func = dom.findFunction(sName, xCurrValue);
            return !func ? null : func.apply(xCurrValue, getValues(aParams, xCurrValue));
        },
        attr: ({ _name: sName, value: xValue }, xCurrValue) => {
            const [innerElement, innerProperty] = dom.getInnerObject(xCurrValue, sName);
            if (xValue !== undefined) {
                // Assign an attribute.
                innerElement[innerProperty] = getValue(xValue, xCurrValue);
            }
            return innerElement[innerProperty];
        },
        error: (xCall) => {
            console.error('Unexpected command type: ' + JSON.stringify({ call: xCall }));
            return undefined;
        },
    };

    /**
     * Execute a single call.
     *
     * @param {object} xCall
     * @param {mixed} xCurrValue The current expression value.
     *
     * @returns {void}
     */
    const execCall = (xCall, xCurrValue) => {
        const xCommand = xCommands[xCall._type] ?? xCommands.error;
        return xCommand(xCall, xCurrValue);
    };

    /**
     * Execute the javascript code represented by an expression object.
     *
     * @param {object} xExpression
     *
     * @returns {mixed}
     */
    const execExpression = ({ calls: aCalls = [] }) => {
        return aCalls.reduce((xCurrValue, xCall) => execCall(xCall, xCurrValue), null);
    };

    /**
     * Execute the javascript code represented by an expression object.
     *
     * @param {object} xExpression An object representing a command
     * @param {object=window} xCallContext The context to execute calls in.
     *
     * @returns {mixed}
     */
    self.call = (xExpression, xCallContext = window) => {
        xContext.aTargets = [xCallContext];
        return str.typeOf(xExpression) === 'object' ? execExpression(xExpression) : null;
    };
})(jaxon.call.json, jaxon.call.query, jaxon.utils.dom, jaxon.utils.form, jaxon.utils.string);
