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
        select: ({ _name: sName, mode, context: xSelectContext = null }, xOptions) => {
            const { context: { target: xTarget, event: xEvent } } = xOptions;
            switch(sName) {
                case 'this': // The current event target.
                    return mode === 'js' ? xTarget : query.select(xTarget);
                case 'event': // The current event.
                    return xEvent;
                case 'window':
                    return window;
                default: // Call the selector.
                    return query.select(sName, xSelectContext);
            }
        },
        event: ({ _name: sName, func: xExpression }, xOptions) => {
            // Set an event handler.
            // Takes the expression with a different context as argument.
            const { value: xCurrValue, context: xContext } = xOptions;
            xCurrValue.on(sName, (event) => execExpression(xExpression, {
                ...xOptions,
                context: {
                    ...xContext,
                    event,
                    target: event.currentTarget,
                },
            }));
            return xCurrValue;
        },
        func: ({ _name: sName, args: aArgs = [] }, xOptions) => {
            // Call a "global" function with the current context as "this".
            const { context: xContext } = xOptions;
            const func = dom.findFunction(sName);
            return !func ? undefined : func.apply(xContext, getArgs(aArgs, xOptions));
        },
        method: ({ _name: sName, args: aArgs = [] }, { value: xCurrValue }) => {
            // Call a function with the current value as "this".
            const func = dom.findFunction(sName, xCurrValue);
            // toInt() is a peudo-method that converts the current value to int.
            return !func ? (sName === 'toInt' ? types.toInt(xCurrValue) : undefined) :
                func.apply(xCurrValue, getArgs(aArgs, xCurrValue));
        },
        attr: ({ _name: sName, value: xValue }, xOptions) => {
            const { value: xCurrValue, context: { target: xTarget } } = xOptions;
            const xElt = dom.getInnerObject(sName, xCurrValue || xTarget);
            if (!xElt) {
                return undefined;
            }
            if (xValue !== undefined) {
                // Assign an attribute.
                xElt.node[xElt.attr] = getValue(xValue, xOptions);
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
     * @param {object} xOptions The call options.
     *
     * @returns {mixed}
     */
    const getValue = (xArg, xOptions) => {
        if (!isValidCall(xArg)) {
            return xArg;
        }
        const { _type: sType, _name: sName } = xArg;
        switch(sType) {
            case 'form': return form.getValues(sName);
            case 'html': return dom.$(sName).innerHTML;
            case 'input': return dom.$(sName).value;
            case 'checked': return dom.$(sName).checked;
            case 'expr': return execExpression(xArg, xOptions);
            case '_': return sName === 'this' ? xOptions.value : undefined;
            default: return undefined;
        }
    };

    /**
     * Get the values of an array of arguments.
     *
     * @param {array} aArgs
     * @param {object} xOptions The call options.
     *
     * @returns {array}
     */
    const getArgs = (aArgs, xOptions) => aArgs.map(xArg => getValue(xArg, xOptions));

    /**
     * Execute a single call.
     *
     * @param {object} xCall
     * @param {object} xOptions The call options.
     *
     * @returns {void}
     */
    const execCall = (xCall, xOptions) => {
        const xCommand = !isValidCall(xCall) ? xErrors.command :
            (xCommands[xCall._type] ?? xErrors.command);
        xOptions.value = xCommand(xCall, xOptions);
        return xOptions.value;
    };

    /**
     * Execute a single javascript function call.
     *
     * @param {object} xCall An object representing the function call
     * @param {object=} xContext The context to execute calls in.
     *
     * @returns {mixed}
     */
    self.execCall = (xCall, xContext) => execCall(xCall, { context: { target: window, ...xContext } });

    /**
     * Execute the javascript code represented by an expression object.
     * If a call returns "undefined", it will be the final return value.
     *
     * @param {array} aCalls The calls to execute
     * @param {object} xOptions The call options.
     *
     * @returns {mixed}
     */
    const execCalls = (aCalls, xOptions) => aCalls.reduce((xValue, xCall) =>
        xValue === undefined ? undefined : execCall(xCall, xOptions), null);

    /**
     * Replace placeholders in a given string with values
     * 
     * @param {object} phrase
     * @param {string} phrase.str The string to be processed
     * @param {array} phrase.args The values for placeholders
     * @param {object=} xOptions The call options.
     *
     * @returns {string}
     */
    const makePhrase = ({ str, args }, xOptions) => str.supplant(args.reduce((oArgs, xArg, nIndex) =>
        ({ ...oArgs, [nIndex + 1]: getValue(xArg, xOptions) }), {}));

    /**
     * Replace placeholders in a given string with values
     * 
     * @param {object} phrase
     * @param {object=} xContext The context to execute calls in.
     *
     * @returns {string}
     */
    self.makePhrase = (phrase, xContext) => makePhrase(phrase, { context: { target: window, ...xContext } });

    /**
     * Show an alert message
     *
     * @param {object} message The message content
     * @param {object} xOptions The call options.
     *
     * @returns {void}
     */
    const showMessage = (message, xOptions) => !!message &&
        dialog.alert({ ...message, text: makePhrase(message.phrase, xOptions) });

    /**
     * @param {object} question The confirmation question
     * @param {object} message The message to show if the user anwsers no to the question
     * @param {array} aCalls The calls to execute
     * @param {object} xOptions The call options.
     *
     * @returns {boolean}
     */
    const execWithConfirmation = (question, message, aCalls, xOptions) =>
        dialog.confirm({ ...question, text: makePhrase(question.phrase, xOptions) },
            () => execCalls(aCalls, xOptions), () => showMessage(message, xOptions));

    /**
     * @param {array} aCondition The condition to chek
     * @param {object} oMessage The message to show if the condition is not met
     * @param {array} aCalls The calls to execute
     * @param {object} xOptions The call options.
     *
     * @returns {boolean}
     */
    const execWithCondition = (aCondition, oMessage, aCalls, xOptions) => {
        const [sOperator, xLeftArg, xRightArg] = aCondition;
        const xComparator = xComparators[sOperator] ?? xErrors.comparator;
        xComparator(getValue(xLeftArg, xOptions), getValue(xRightArg, xOptions)) ?
            execCalls(aCalls, xOptions) : showMessage(oMessage, xOptions);
    };

    /**
     * Execute the javascript code represented by an expression object.
     *
     * @param {object} xExpression
     * @param {object} xOptions The call options.
     *
     * @returns {mixed}
     */
    const execExpression = (xExpression, xOptions) => {
        const { calls, question, condition, message } = xExpression;
        if((question)) {
            execWithConfirmation(question, message, calls, xOptions);
            return;
        }
        if((condition)) {
            execWithCondition(condition, message, calls, xOptions);
            return;
        }
        return execCalls(calls, xOptions);
    };

    /**
     * Execute the javascript code represented by an expression object.
     *
     * @param {object} xExpression An object representing a command
     * @param {object=} xContext The context to execute calls in.
     *
     * @returns {void}
     */
    self.execExpr = (xExpression, xContext) => types.isObject(xExpression) &&
        execExpression(xExpression, { value: null, context: { target: window, ...xContext } });
})(jaxon.parser.call, jaxon.parser.query, jaxon.dialog.lib, jaxon.utils.dom,
    jaxon.utils.form, jaxon.utils.types);
