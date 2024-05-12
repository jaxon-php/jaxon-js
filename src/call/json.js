/**
 * Class: jaxon.call.json
 *
 * Execute calls from json expressions.
 */

(function(self, query, dialog, dom, form, types) {
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
    const isExpression = xArg => types.isObject(xArg) && (xArg._type);

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
        event: ({ _name: sName, func: xExpression }, xCurrValue) => {
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
            const xElt = dom.getInnerObject(xCurrValue, sName);
            if (xValue !== undefined) {
                // Assign an attribute.
                xElt.node[xElt.attr] = getValue(xValue, xCurrValue);
            }
            return xElt.node[xElt.attr];
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
     * Execute a single javascript function call.
     *
     * @param {object} xCall An object representing the function call
     * @param {object=window} xCallContext The context to execute calls in.
     *
     * @returns {mixed}
     */
    self.execCall = (xCall, xCallContext = window) => {
        xContext.aTargets = [xCallContext];
        return types.isObject(xCall) ? execCall(xCall) : null;
    };

    /**
     * Execute the javascript code represented by an expression object.
     *
     * @param {array} aCalls
     *
     * @returns {mixed}
     */
    const execCalls = (aCalls) => {
        return aCalls.reduce((xCurrValue, xCall) => execCall(xCall, xCurrValue), null);
    };

    /**
     * Replace placeholders in a given string with values
     * 
     * @param {object} phrase
     * @param {string} phrase.str The string to be processed
     * @param {array} phrase.args The values for placeholders
     *
     * @returns {string}
     */
    self.makePhrase = ({ str: sStr, args: aArgs }) => {
        const oArgs = {};
        let nIndex = 1;
        aArgs.forEach(xArg => oArgs[nIndex++] = getValue(xArg));
        return sStr.supplant(oArgs);
    };

    /**
     * Show an alert message
     *
     * @param {object} message The message content
     *
     * @returns {void}
     */
    const showMessage = (message) => {
        if(!message) {
            return;
        }
        const {
            lib: sLibName,
            type: sType,
            content: { title: sTitle, phrase },
        } = message;
        const xLib = dialog.get(sLibName);
        xLib.alert(sType, self.makePhrase(phrase), sTitle);
    };

    /**
     * The dfault comparison operator.
     *
     * @var {function}
     */
    const xDefaultComparator = () => false;

    /**
     * The comparison operators.
     *
     * @var {object}
     */
    const xComparators = {
        eq: (xLeftArg, xRightArg) => xLeftArg == xRightArg,
        teq: (xLeftArg, xRightArg) => xLeftArg === xRightArg,
        ne: (xLeftArg, xRightArg) => xLeftArg != xRightArg,
        nte: (xLeftArg, xRightArg) => xLeftArg !== xRightArg,
        gt: (xLeftArg, xRightArg) => xLeftArg > xRightArg,
        ge: (xLeftArg, xRightArg) => xLeftArg >= xRightArg,
        lt: (xLeftArg, xRightArg) => xLeftArg < xRightArg,
        le: (xLeftArg, xRightArg) => xLeftArg <= xRightArg,
    };

    /**
     * @param {object} xExpression
     *
     * @returns {boolean}
     */
    const execWithCondition = (xExpression) => {
        const {
            condition: [sOperator, xLeftArg, xRightArg],
            calls: aCalls,
            message: oMessage,
        } = xExpression;
        const xComparator = xComparators[sOperator] ?? xDefaultComparator;
        xComparator(getValue(xLeftArg), getValue(xRightArg)) ? execCalls(aCalls) : showMessage(oMessage);
    };

    /**
     * @param {object} xExpression
     *
     * @returns {boolean}
     */
    const execWithConfirmation = (xExpression) => {
        const {
            question: { lib: sLibName, phrase },
            calls: aCalls,
            message: oMessage,
        } = xExpression;
        const xLib = dialog.get(sLibName);
        xLib.confirm(self.makePhrase(phrase), '', () => execCalls(aCalls), () => showMessage(oMessage));
    };

    /**
     * Execute the javascript code represented by an expression object.
     *
     * @param {object} xExpression
     *
     * @returns {mixed}
     */
    const execExpression = (xExpression) => {
        const { calls: aCalls, question, condition } = xExpression;
        if((question)) {
            execWithConfirmation(xExpression);
            return;
        }
        if((condition)) {
            execWithCondition(xExpression);
            return;
        }
        return execCalls(aCalls);
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
        return types.isObject(xExpression) ? execExpression(xExpression) : null;
    };
})(jaxon.call.json, jaxon.call.query, jaxon.dialog.lib, jaxon.utils.dom,
    jaxon.utils.form, jaxon.utils.types);
