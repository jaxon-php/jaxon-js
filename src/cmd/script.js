/**
 * Class: jaxon.cmd.script
 */

(function(self, call, parameters, types) {
    /**
     * Call a javascript function with a series of parameters using the current script context.
     *
     * @param {object} args The command arguments.
     * @param {string} args.func The name of the function to call.
     * @param {array} args.args  The parameters to pass to the function.
     * @param {object} args.context The initial context to execute the command.
     *
     * @returns {true} The operation completed successfully.
     */
    self.call = ({ func, args, context }) => {
        call.execCall({ _type: 'func', _name: func, args }, context);
        return true;
    };

    /**
     * Call a javascript function with a series of parameters using the current script context.
     *
     * @param {object} args The command arguments.
     * @param {string} args.func The name of the function to call.
     * @param {object} args.context The initial context to execute the command.
     *
     * @returns {true} The operation completed successfully.
     */
    self.exec = ({ expr, context }) => {
        call.execExpr(expr, context);
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
        if (nDelay <= 0) {
            window.location = sUrl;
            return true;
        }
        window.setTimeout(() => window.location = sUrl, nDelay * 1000);
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
})(jaxon.cmd.script, jaxon.parser.call, jaxon.ajax.parameters, jaxon.utils.types);
