/**
 * Class: jaxon.parser.call
 *
 * Execute calls from json expressions.
 */

(function(self, query, dialog, dom, form, types) {
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
     * The call commands
     *
     * @var {object}
     */
    const xCommands = {
        select: ({ _name: sName, mode, context: xSelectContext = null }, { target, event }) => {
            switch(sName) {
                case 'this':
                    return mode === 'js' ? target : query.select(target); // The current event target.
                case 'event':
                    return event; // The current event
                case 'window':
                    return window;
                default: // Call the selector.
                    return query.select(sName, xSelectContext);
            }
        },
        event: ({ _name: sName, func: xExpression }, oCallContext, xCurrValue) => {
            // Set an event handler. Takes an expression as argument.
            xCurrValue.on(sName, (event) => execExpression(xExpression, {
                ...oCallContext,
                event,
                target: event.currentTarget,
            }));
            return xCurrValue;
        },
        func: ({ _name: sName, args: aArgs = [] }, oCallContext, xCurrValue) => {
            // Call a "global" function with the current context as "this".
            const func = dom.findFunction(sName);
            return !func ? undefined : func.apply(oCallContext, getArgs(aArgs, xCurrValue));
        },
        method: ({ _name: sName, args: aArgs = [] }, oCallContext, xCurrValue) => {
            // Call a function with the current value as "this".
            const func = dom.findFunction(sName, xCurrValue);
            // toInt() is a peudo-method that converts the current value to int.
            return !func ? (sName === 'toInt' ? types.toInt(xCurrValue) : undefined) :
                func.apply(xCurrValue, getArgs(aArgs, xCurrValue));
        },
        attr: ({ _name: sName, value: xValue }, oCallContext, xCurrValue) => {
            const xElt = dom.getInnerObject(sName, xCurrValue || oCallContext.target);
            if (!xElt) {
                return undefined;
            }
            if (xValue !== undefined) {
                // Assign an attribute.
                xElt.node[xElt.attr] = getValue(xValue, xCurrValue);
            }
            return xElt.node[xElt.attr];
        },
    };

    /**
     * The function to call if one of the above is not found.
     *
     * @var {object}
     */
    const xErrors = {
        comparator: () => false, // The default comparison operator.
        command: (xCall) => {
            console.error('Unexpected command: ' + JSON.stringify({ call: xCall }));
            return undefined;
        },
    };

    /**
     * Check if an argument is an expression.
     *
     * @param {mixed} xArg
     *
     * @returns {boolean}
     */
    const isValidCall = xArg => types.isObject(xArg) && !!xArg._type;

    /**
     * Get the value of a single argument.
     *
     * @param {mixed} xArg
     * @param {mixed} xCurrValue The current expression value.
     *
     * @returns {mixed}
     */
    const getValue = (xArg, xCurrValue) => {
        if (!isValidCall(xArg)) {
            return xArg;
        }
        const { _type: sType, _name: sName } = xArg;
        switch(sType) {
            case 'form': return form.getValues(sName);
            case 'html': return dom.$(sName).innerHTML;
            case 'input': return dom.$(sName).value;
            case 'checked': return dom.$(sName).checked;
            case 'expr': return execExpression(xArg, { target: window });
            case '_': return sName === 'this' ? xCurrValue : undefined;
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
    const getArgs = (aArgs, xCurrValue) => aArgs.map(xArg => getValue(xArg, xCurrValue));

    /**
     * Execute a single call.
     *
     * @param {object} xCall
     * @param {object} oCallContext The context to execute calls in.
     * @param {mixed=} xCurrValue The current expression value.
     *
     * @returns {void}
     */
    const execCall = (xCall, oCallContext, xCurrValue) => {
        const xCommand = isValidCall(xCall) ? xCommands[xCall._type] : xErrors.command;
        return xCommand(xCall, oCallContext, xCurrValue);
    };

    /**
     * Execute a single javascript function call.
     *
     * @param {object} xCall An object representing the function call
     * @param {object=} oCallContext The context to execute calls in.
     *
     * @returns {mixed}
     */
    self.execCall = (xCall, oCallContext) => execCall(xCall, { target: window, ...oCallContext });

    /**
     * Execute the javascript code represented by an expression object.
     * If a call returns "undefined", it will be the final return value.
     *
     * @param {array} aCalls The calls to execute
     * @param {object} oCallContext The context to execute calls in.
     *
     * @returns {mixed}
     */
    const execCalls = (aCalls, oCallContext) => aCalls.reduce((xValue, xCall) =>
        xValue === undefined ? undefined : execCall(xCall, oCallContext, xValue), null);

    /**
     * Replace placeholders in a given string with values
     * 
     * @param {object} phrase
     * @param {string} phrase.str The string to be processed
     * @param {array} phrase.args The values for placeholders
     *
     * @returns {string}
     */
    self.makePhrase = ({ str, args }) => str.supplant(args.reduce((oArgs, xArg, nIndex) =>
        ({ ...oArgs, [nIndex + 1]: getValue(xArg) }), {}));

    /**
     * Show an alert message
     *
     * @param {object} message The message content
     *
     * @returns {void}
     */
    const showMessage = (message) => !!message &&
        dialog.alert({ ...message, text: self.makePhrase(message.phrase) });

    /**
     * @param {object} question The confirmation question
     * @param {object} message The message to show if the user anwsers no to the question
     * @param {array} aCalls The calls to execute
     * @param {object} oCallContext The context to execute calls in.
     *
     * @returns {boolean}
     */
    const execWithConfirmation = (question, message, aCalls, oCallContext) =>
        dialog.confirm({ ...question, text: self.makePhrase(question.phrase) },
            () => execCalls(aCalls, oCallContext), () => showMessage(message));

    /**
     * @param {array} aCondition The condition to chek
     * @param {object} oMessage The message to show if the condition is not met
     * @param {array} aCalls The calls to execute
     * @param {object} oCallContext The context to execute calls in.
     *
     * @returns {boolean}
     */
    const execWithCondition = (aCondition, oMessage, aCalls, oCallContext) => {
        const [sOperator, xLeftArg, xRightArg] = aCondition;
        const xComparator = xComparators[sOperator] ?? xErrors.comparator;
        xComparator(getValue(xLeftArg), getValue(xRightArg)) ?
            execCalls(aCalls, oCallContext) : showMessage(oMessage);
    };

    /**
     * Execute the javascript code represented by an expression object.
     *
     * @param {object} xExpression
     * @param {object} oCallContext The context to execute calls in.
     *
     * @returns {mixed}
     */
    const execExpression = (xExpression, oCallContext) => {
        const { calls, question, condition, message } = xExpression;
        if((question)) {
            execWithConfirmation(question, message, calls, oCallContext);
            return;
        }
        if((condition)) {
            execWithCondition(condition, message, calls, oCallContext);
            return;
        }
        return execCalls(calls, oCallContext);
    };

    /**
     * Execute the javascript code represented by an expression object.
     *
     * @param {object} xExpression An object representing a command
     * @param {object=} oCallContext The context to execute calls in.
     *
     * @returns {void}
     */
    self.execExpr = (xExpression, oCallContext) => types.isObject(xExpression) &&
        execExpression(xExpression, { target: window, ...oCallContext });
})(jaxon.parser.call, jaxon.parser.query, jaxon.dialog.lib, jaxon.utils.dom,
    jaxon.utils.form, jaxon.utils.types);
