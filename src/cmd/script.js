/**
 * Class: jaxon.cmd.script
 */

(function(self, json, parameters, types) {
    /**
     * Call a javascript function with a series of parameters using the current script context.
     *
     * @param {object} args The command arguments.
     * @param {string} args.func The name of the function to call.
     * @param {array} args.args  The parameters to pass to the function.
     * @param {object} command The Response command object.
     * @param {object} command.context The javascript object to be referenced as 'this' in the script.
     *
     * @returns {true} The operation completed successfully.
     */
    self.call = ({ func, args }, { context = {} }) => {
        // Add the function in the context
        json.execCall({ _type: 'func', _name: func, args }, context);
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
    self.databag = ({ values }) => {
        for (const key in values) {
            parameters.bags[key] = values[key];
        }
        return true;
    };

    /**
     * Execute a JQuery expression beginning with selector.
     *
     * @param {object} args The command arguments.
     * @param {object} args.selector The JQuery expression
     *
     * @returns {true} The operation completed successfully.
     */
    self.jquery = ({ selector }) => {
        json.execExpr(selector);
        return true;
    };

    /**
     * Replace the page number argument with the current page number value
     *
     * @param {object} oCall
     * @param {array} oCall.args
     * @param {object} oLink
     *
     * @returns {array}
     */
    const getCallArgs = ({ args: aArgs }, oLink) => aArgs.map(xArg =>
        types.isObject(xArg) && xArg._type === 'page' ?
        parseInt(oLink.parentNode.getAttribute('data-page')) : xArg);

    /**
     * Set event handlers on pagination links.
     *
     * @param {object} args The command arguments.
     * @param {string} args.id The pagination wrapper id
     * @param {object} args.target The pagination wrapper element
     * @param {array} args.call The page call
     * @param {array} args.pages The page list
     *
     * @returns {true} The operation completed successfully.
     */
    self.paginate = ({ target, call: oCall }) => {
        const aLinks = target.querySelectorAll(`li.enabled > a`);
        aLinks.forEach(oLink => oLink.onClick = () => json.execCall({
            ...oCall,
            _type: 'func',
            args: getCallArgs(oCall, oLink),
        }));
        return true;
    };
})(jaxon.cmd.script, jaxon.call.json, jaxon.ajax.parameters, jaxon.utils.types);
