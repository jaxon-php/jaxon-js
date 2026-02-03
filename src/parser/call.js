/**
 * Class: jaxon.parser.call
 *
 * Execute calls from json expressions.
 *
 * global: jaxon
 */

(function(self, query, dialog, dom, string, form, types, log) {
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
        error: () => false, // The default comparison operator.
    };

    /**
     * Get or set an attribute on a parent object.
     *
     * @param {object|null} xParent The parent object
     * @param {string} sName The attribute name
     * @param {mixed} xValue If defined, the value to set
     * @param {object} xOptions The call options.
     *
     * @var {object}
     */
    const processAttr = (xParent, sName, xValue, xOptions) => {
        if (!xParent) {
            return undefined;
        }
        const xElt = dom.getInnerObject(sName, xParent);
        if (!xElt) {
            return undefined;
        }
        if (xValue !== undefined) {
            // Assign an attribute.
            xElt.node[xElt.attr] = getValue(xValue, xOptions);
        }
        return xElt.node[xElt.attr];
    };

    /**
     * The call commands
     *
     * @var {object}
     */
    const xCommands = {
        select: ({ _name: sName, mode, context: xSelectContext = null }, xOptions) => {
            if (sName === 'this') {
                const { context: { target: xTarget } = {} } = xOptions;
                return mode === 'jq' ?
                    { call: '$(this)', value: query.select(xTarget) } :
                    { call: 'this', value: mode === 'js' ? xTarget : null };
            }

            const { context: { global: xGlobal } = {} } = xOptions;
            return mode === 'jq' ? {
                call: `$('${sName}')`,
                value: query.select(sName, query.context(xSelectContext, xGlobal)),
            } : {
                call: `document.getElementById('${sName}')`,
                value: document.getElementById(sName),
            };
        },
        event: ({ _name: sName, mode, func: xExpression }, xOptions) => {
            // Set an event handler.
            // Takes the expression with a different context as argument.
            const fHandler = (event) => execExpression(xExpression, {
                ...xOptions,
                context: {
                    ...xOptions.context,
                    event,
                    target: event.currentTarget,
                },
                value: null,
            });
            const { value: xCurrValue, call: sCall } = xOptions;
            mode === 'jq' ? xCurrValue.on(sName, fHandler) :
                xCurrValue.addEventListener(sName, fHandler);
            return {
                call: mode === 'jq' ? `${sCall}.on(${sName}, [handler])` :
                    `${sCall}.addEventListener(${sName}, [handler])`,
                value: xCurrValue,
            };
        },
        func: ({ _name: sName, args: aArgs = [] }, xOptions) => {
            const { value: xCurrValue, call: sCall } = xOptions;
            const sFuncName = (!sCall ? sName : `${sCall}.${sName}`) + '()';
            const func = dom.findFunction(sName, xCurrValue || window);
            if (!func) {
                if (sName === 'trim') {
                    return { call: `trim(${sName})`, value: xCurrValue.trim() };
                }
                if (sName === 'toInt') {
                    return { call: `parseInt(${sName})`, value: types.toInt(xCurrValue) };
                }

                // Tried to call an undefined function.
                log.error(`Call to undefined function ${sFuncName}.`);
                return { call: sFuncName, value: undefined };
            }

            return {
                call: sFuncName,
                value: func.apply(xCurrValue, getArgs(aArgs, xOptions)),
            };
        },
        attr: ({ _name: sName, value: xValue }, xOptions) => {
            const { value: xCurrValue, depth, call: sCall } = xOptions;
            // depth === 0 ensures that we are at top level.
            if (depth === 0 && (sName === 'window' || sName === '')) {
                if (!xValue) {
                    return { call: 'window', value: window };
                }
                log.error('Cannot assign the "window" var.');
                return { call: 'null', value: null };
            }

            const sAttrName = !sCall ? sName : `${sCall}.${sName}`;
            const xAttrValue = processAttr(xCurrValue || window, sName, xValue, xOptions);
            if (xAttrValue === undefined) {
                log.error(`Call to undefined variable ${sAttrName}.`);
            }
            return { call: sAttrName, value: xAttrValue };
        },
        invalid: (xCall) => {
            log.error('Invalid command: ' + JSON.stringify({ call: xCall }));
            return { call: undefined, value: undefined };
        },
        unknown: (xCall) => {
            log.error('Unknown command: ' + JSON.stringify({ call: xCall }));
            return { call: undefined, value: undefined };
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
     * @param {object} xArg
     * @param {string} sValue
     *
     * @returns {mixed}
     */
    const getFinalValue = (xArg, sValue) => {
        const { trim, toInt } = xArg;
        if (trim) {
            sValue = sValue.trim();
        }
        if (toInt) {
            sValue = types.toInt(sValue);
        }
        return sValue;
    };

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
            case 'html': return getFinalValue(xArg, dom.$(sName).innerHTML);
            case 'input': return getFinalValue(xArg, dom.$(sName).value);
            case 'checked': return dom.$(sName).checked;
            case 'expr': return execExpression(xArg, makeOptions(xOptions));
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
     * Execute a command, then fill and return the options object.
     * This function is extended in debug mode to add debug messages.
     *
     * @param {object} xCall
     * @param {object} xOptions The call options.
     *
     * @returns {void}
     */
    self.execCommand = (xCall, xOptions) => {
        const xCommand = !isValidCall(xCall) ? xCommands.invalid :
            (xCommands[xCall._type] ?? xCommands.unknown);
        xOptions.depth++; // Increment the call depth.
        const { call, value } = xCommand(xCall, xOptions);
        xOptions.call = call;
        xOptions.value = value;
        return xOptions;
    };

    /**
     * Execute a single call.
     *
     * @param {object} xCall
     * @param {object} xOptions The call options.
     *
     * @returns {void}
     */
    const execCall = (xCall, xOptions) => self.execCommand(xCall, xOptions).value;

    /**
     * Get the options for a json call.
     *
     * @param {object} xContext The context to execute calls in.
     * @param {boolean} xContext.component Take the target component as call target
     * @param {object=} xContext.target The target component
     * @param {object=} xContext.event The trigger event
     *
     * @returns {object}
     */
    const getOptions = ({ component, target, event }) => {
        const global = component ? (target ?? null) : null;
        return { context: { global, target, event }, value: null };
    };

    /**
     * Make the options for a new expression call.
     *
     * @param {object} xOptions The current options.
     *
     * @returns {object}
     */
    const makeOptions = (xOptions) => ({ ...xOptions, value: null });

    /**
     * Execute a single javascript function call.
     *
     * @param {object} xCall An object representing the function call
     * @param {object=} xContext The context to execute calls in.
     *
     * @returns {mixed}
     */
    self.execCall = (xCall, xContext = {}) => {
        const xOptions = getOptions(xContext);
        xOptions.depth = -1; // The first call must start with depth at 0.
        return types.isObject(xCall) && execCall(xCall, xOptions);
    };

    /**
     * Execute the javascript code represented by an expression object.
     * If a call returns "undefined", it will be the final return value.
     *
     * @param {array} aCalls The calls to execute
     * @param {object} xOptions The call options.
     *
     * @returns {mixed}
     */
    const execCalls = (aCalls, xOptions) => {
        xOptions.depth = -1; // The first call must start with depth at 0.
        return aCalls.reduce((xValue, xCall) =>
            xValue === undefined ? undefined : execCall(xCall, xOptions), null);
    };

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
    const makePhrase = ({ str, args }, xOptions) =>
        string.supplant(str, args.reduce((oArgs, xArg, nIndex) =>
            ({ ...oArgs, [nIndex + 1]: getValue(xArg, xOptions) }), {}));

    /**
     * Replace placeholders in a given string with values
     * 
     * @param {object} phrase
     *
     * @returns {string}
     */
    self.makePhrase = (phrase) => makePhrase(phrase, { context: { } });

    /**
     * Show an alert message
     *
     * @param {object} alert The alert content
     * @param {string} alert.lib The dialog library to use
     * @param {array} alert.message The message to show
     * @param {object} xOptions The call options.
     *
     * @returns {void}
     */
    const showAlert = ({ lib, message } = {}, xOptions) => !!message &&
        dialog.alert(lib, {
            ...message,
            text: makePhrase(message.phrase, xOptions),
        });

    /**
     * @param {object} confirm The confirmation question
     * @param {string} confirm.lib The dialog library to use
     * @param {array} confirm.question The question to ask
     * @param {object=} xAlert The alert to show if the user anwsers no to the question
     * @param {array} aCalls The calls to execute
     * @param {object} xOptions The call options.
     *
     * @returns {boolean}
     */
    const execWithConfirmation = ({ lib, question }, xAlert, aCalls, xOptions) =>
        dialog.confirm(lib, {
            ...question,
            text: makePhrase(question.phrase, makeOptions(xOptions)),
        }, {
            yes: () => execCalls(aCalls, makeOptions(xOptions)),
            no: () => showAlert(xAlert, makeOptions(xOptions)),
        });

    /**
     * @param {array} aCondition The condition to chek
     * @param {object=} xAlert The alert to show if the condition is not met
     * @param {array} aCalls The calls to execute
     * @param {object} xOptions The call options.
     *
     * @returns {boolean}
     */
    const execWithCondition = (aCondition, xAlert, aCalls, xOptions) => {
        const [sOperator, _xLeftArg, _xRightArg] = aCondition;
        const xComparator = xComparators[sOperator] ?? xComparators.error;
        const xLeftArg = getValue(_xLeftArg, makeOptions(xOptions));
        const xRightArg = getValue(_xRightArg, makeOptions(xOptions));
        xComparator(xLeftArg, xRightArg) ?
            execCalls(aCalls, makeOptions(xOptions)) :
            showAlert(xAlert, makeOptions(xOptions));
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
        const { calls, confirm, condition, alert } = xExpression;
        if((confirm)) {
            execWithConfirmation(confirm, alert, calls, xOptions);
            return;
        }
        if((condition)) {
            execWithCondition(condition, alert, calls, xOptions);
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
    self.execExpr = (xExpression, xContext = {}) => types.isObject(xExpression) &&
        execExpression(xExpression, getOptions(xContext));
})(jaxon.parser.call, jaxon.parser.query, jaxon.dialog, jaxon.utils.dom,
    jaxon.utils.string, jaxon.utils.form, jaxon.utils.types, jaxon.utils.log);
