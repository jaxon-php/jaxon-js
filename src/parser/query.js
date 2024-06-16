/**
 * Class: jaxon.parser.query
 */

(function(self) {
    /**
     * The selector function.
     * u() is the UmbrellaJs (https://umbrellajs.com) selector function.
     *
     * @var {object}
     */
    self.jq = u; // window.jQuery

    /**
     * Call the jQuery DOM selector
     *
     * @param {string|object} xSelector
     * @param {object} xContext
     *
     * @returns {object}
     */
    self.select = (xSelector, xContext = null) => {
        return !xContext ? self.jq(xSelector) : self.jq(xSelector, xContext);
    };
})(jaxon.parser.query);
