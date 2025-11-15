/**
 * Class: jaxon.utils.logger
 *
 * global: jaxon
 */

(function(self, types, debug) {
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
     * @param {string} sMessage
     * @param {object=} xContext
     *
     * @returns {void}
     */
    self.error = (sMessage, xContext) => {
        console.error(consoleMessage(sMessage, xContext));

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

        resetMode();
    };
})(jaxon.utils.logger, jaxon.utils.types, jaxon.debug);
