/**
 * Class: jaxon.cmd.call.json
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
     * Check if an argument is an expression.
     *
     * @param {mixed} xArg
     *
     * @returns {boolean}
     */
    const isExpression = xArg => str.typeOf(xArg) === 'object' && (xArg._type);

    /**
     * Get the value of a single argument.
     *
     * @param {mixed} xArg
     * @param {mixed} xCurrValue The current expression value.
     *
     * @returns {mixed}
     */
    const getValue = (xArg, xCurrValue) => {
        if (!isExpression(xArg)) {
            return xArg;
        }
        const { _type: sType, _name: sName } = xArg;
        switch(sType) {
            case 'form': return form.getValues(sName);
            case 'html': return dom.$(sName).innerHTML;
            case 'input': return dom.$(sName).value;
            case 'checked': return dom.$(sName).checked;
            case 'expr': return execExpression(xArg);
            case '_': switch(sName) {
                case 'this': return xCurrValue;
                default: return undefined
            }
            default: return undefined;
        }
    };

    /**
     * Get the values of an array of arguments.
     *
     * @param {array} aArgs
     * @param {mixed} xCurrValue The current expression value.
     *
     * @returns {array}
     */
    const getValues = (aArgs, xCurrValue) => aArgs.map(xArg => getValue(xArg, xCurrValue));

    /**
     * The call commands
     *
     * @var {object}
     */
    const xCommands = {
        select: ({ _name: sName, context: xContext = null }, xCurrValue) => {
            return sName === 'this' ?
                // Empty argument list => $(this), ie the last event target.
                query.select(getCurrentTarget()) :
                // Call the selector.
                query.select(sName, !xContext ? null : getValue(xContext, xCurrValue));
        },
        event: ({ _name: sName, handler: xExpression }, xCurrValue) => {
            // Set an event handler. Takes an expression as argument.
            xCurrValue.on(sName, (event) => {
                // Save the current target.
                xContext.aTargets.push({ event, target: event.currentTarget });
                execExpression(xExpression);
                xContext.aTargets.pop();
            });
            return true;
        },
        func: ({ _name: sName, args: aArgs = [] }, xCurrValue) => {
            // Call a "global" function with the current target as "this" and an array of arguments.
            const func = dom.findFunction(sName);
            return !func ? null : func.apply(getCurrentTarget(), getValues(aArgs, xCurrValue));
        },
        method: ({ _name: sName, args: aArgs = [] }, xCurrValue) => {
            // Call a function with xCurrValue as "this" and an array of arguments.
            const func = dom.findFunction(sName, xCurrValue);
            return !func ? null : func.apply(xCurrValue, getValues(aArgs, xCurrValue));
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
    const execCall = (xCall, xCurrValue = null) => {
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
     * Execute a single javascript function call.
     *
     * @param {object} xCall An object representing the function call
     * @param {object=window} xCallContext The context to execute calls in.
     *
     * @returns {mixed}
     */
    self.execCall = (xCall, xCallContext = window) => {
        xContext.aTargets = [xCallContext];
        return str.typeOf(xCall) === 'object' ? execCall(xCall) : null;
    };

    /**
     * Execute the javascript code represented by an expression object.
     *
     * @param {object} xExpression An object representing a command
     * @param {object=window} xCallContext The context to execute calls in.
     *
     * @returns {mixed}
     */
    self.execExpr = (xExpression, xCallContext = window) => {
        xContext.aTargets = [xCallContext];
        return str.typeOf(xExpression) === 'object' ? execExpression(xExpression) : null;
    };
})(jaxon.cmd.call.json, jaxon.call.query, jaxon.utils.dom, jaxon.utils.form, jaxon.utils.string);
