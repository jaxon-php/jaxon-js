/**
 * Class: jaxon.parser.query
 */

(function(self, jq) {
    /**
     * The jQuery object.
     * Will be undefined if the library is not installed.
     *
     * @var {object}
     */
    self.jq = jq;

    /**
     * Call the jQuery DOM selector
     *
     * @param {string|object} xSelector
     * @param {object} xContext
     *
     * @returns {object}
     */
    self.select = (xSelector, xContext = null) => {
        // Todo: Allow the use of an alternative library instead of jQuery.
        return !xContext ? self.jq(xSelector) : self.jq(xSelector, xContext);
    };
})(jaxon.parser.query, window.jQuery);
