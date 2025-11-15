/**
 * Class: jaxon.utils.logger
 *
 * global: jaxon
 */

(function(self, dom, types, debug) {
    /**
     * @var object
     */
    const xMode = {
        console: false, // Log in console only.
    };

    /**
     * @returns {void}
     */
    const resetMode = () => {
        xMode.console = false;
    };

    /**
     * @returns {this}
     */
    self.consoleMode = () => {
        xMode.console = true;
        return self;
    };

    /**
     * @param {string} sMessage
     * @param {object=} xContext
     *
     * @returns {string}
     */
    const consoleMessage = (sMessage, xContext) => sMessage +
        (!types.isObject(xContext) ? '' : ': ' + JSON.stringify(xContext));

    /**
     * @returns {object|null}
     */
    self.logger = () => (xMode.console || debug.active || !debug.logger) ?
        null : dom.findObject(debug.logger);

    /**
     * @param {string} sMessage
     * @param {object=} xContext
     *
     * @returns {void}
     */
    self.error = (sMessage, xContext) => {
        console.error(consoleMessage(sMessage, xContext));

        self.logger()?.error(sMessage, { ...xContext });
        resetMode();
    };

    /**
     * @param {string} sMessage
     * @param {object=} xContext
     *
     * @returns {void}
     */
    self.warning = (sMessage, xContext) => {
        console.warn(consoleMessage(sMessage, xContext));

        self.logger()?.warning(sMessage, { ...xContext });
        resetMode();
    };

    /**
     * @param {string} sMessage
     * @param {object=} xContext
     *
     * @returns {void}
     */
    self.notice = (sMessage, xContext) => {
        console.log(consoleMessage(sMessage, xContext));

        self.logger()?.notice(sMessage, { ...xContext });
        resetMode();
    };

    /**
     * @param {string} sMessage
     * @param {object=} xContext
     *
     * @returns {void}
     */
    self.info = (sMessage, xContext) => {
        console.info(consoleMessage(sMessage, xContext));

        self.logger()?.info(sMessage, { ...xContext });
        resetMode();
    };

    /**
     * @param {string} sMessage
     * @param {object=} xContext
     *
     * @returns {void}
     */
    self.debug = (sMessage, xContext) => {
        console.debug(consoleMessage(sMessage, xContext));

        self.logger()?.debug(sMessage, { ...xContext });
        resetMode();
    };
})(jaxon.utils.logger, jaxon.utils.dom, jaxon.utils.types, jaxon.debug);
