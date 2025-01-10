/**
 * Class: jaxon.cmd.script
 */

(function(self, call, parameters, command, types) {
    /**
     * Call a javascript function with a series of parameters using the current script context.
     *
     * @param {object} args The command arguments.
     * @param {string} args.func The name of the function to call.
     * @param {array} args.args  The parameters to pass to the function.
     * @param {object} args.context The initial context to execute the command.
     * @param {object} context The command context.
     * @param {Element} context.target The target DOM element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.execCall = ({ func, args, context }, { target }) => {
        call.execCall({ _type: 'func', _name: func, args }, { target, ...context });
        return true;
    };

    /**
     * Execute a javascript expression using the current script context.
     *
     * @param {object} args The command arguments.
     * @param {string} args.expr The json formatted expression to execute.
     * @param {object} args.context The initial context to execute the command.
     * @param {object} context The command context.
     * @param {Element} context.target The target DOM element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.execExpr = ({ expr, context }, { target }) => {
        call.execExpr(expr, { target, ...context });
        return true;
    };

    /**
     * Causes the processing of items in the queue to be delayed for the specified amount of time.
     * This is an asynchronous operation, therefore, other operations will be given an opportunity
     * to execute during this delay.
     *
     * @param {object} args The command arguments.
     * @param {integer} args.duration The number of 10ths of a second to sleep.
     * @param {object} context The Response command object.
     * @param {object} context.queue The command queue.
     *
     * @returns {true}
     */
    self.sleep = ({ duration }, { queue: oQueue }) => {
        // The command queue is paused, and will be restarted after the specified delay.
        oQueue.paused = true;
        setTimeout(() => command.processQueue(oQueue), duration * 100);
        return true;
    };

    /**
     * Redirects the browser to the specified URL.
     *
     * @param {object} args The command arguments.
     * @param {string} args.url The new URL to redirect to
     * @param {integer} args.delay The time to wait before the redirect.
     *
     * @returns {true} The operation completed successfully.
     */
    self.redirect = ({ url: sUrl, delay: nDelay }) => {
        // In no delay is provided, then use a 5ms delay.
        window.setTimeout(() => window.location = sUrl, nDelay <= 0 ? 5 : nDelay * 1000);
        return true;
    };

    /**
     * Update the databag content.
     *
     * @param {object} args The command arguments.
     * @param {string} args.values The databag values.
     *
     * @returns {true} The operation completed successfully.
     */
    self.setDatabag = ({ values }) => {
        parameters.setBags(values);
        return true;
    };

    /**
     * Replace the page number argument with the current page number value
     *
     * @param {array} aArgs
     * @param {object} oLink
     *
     * @returns {array}
     */
    const getCallArgs = (aArgs, oLink) => aArgs.map(xArg =>
        types.isObject(xArg) && xArg._type === 'page' ?
        parseInt(oLink.parentNode.getAttribute('data-page')) : xArg);

    /**
     * Set event handlers on pagination links.
     *
     * @param {object} args The command arguments.
     * @param {object} args.func The page call expression
     * @param {object} context The command context.
     * @param {Element} context.target The target DOM element.
     *
     * @returns {true} The operation completed successfully.
     */
    self.paginate = ({ func: oCall }, { target }) => {
        const aLinks = target.querySelectorAll(`li.enabled > a`);
        const { args: aArgs } = oCall;
        aLinks.forEach(oLink => oLink.addEventListener('click', () => call.execCall({
            ...oCall,
            _type: 'func',
            args: getCallArgs(aArgs, oLink),
        })));
        return true;
    };
})(jaxon.cmd.script, jaxon.parser.call, jaxon.ajax.parameters,
    jaxon.ajax.command, jaxon.utils.types);
