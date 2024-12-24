/**
 * Class: jaxon.parser.query
 */

(function(self, jq) {
    /**
     * The selector function.
     *
     * @var {object}
     */
    self.jq = jq;

    /**
     * Call the DOM selector
     *
     * @param {string|object} xSelector
     * @param {object} xContext
     *
     * @returns {object}
     */
    self.select = (xSelector, xContext = null) => !xContext ?
        self.jq(xSelector) : self.jq(xSelector, xContext);
})(jaxon.parser.query, window.jQuery ?? window.chibi);
// window.chibi is the ChibiJs (https://github.com/kylebarrow/chibi) selector function.
