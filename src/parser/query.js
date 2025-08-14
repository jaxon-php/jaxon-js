/**
 * Class: jaxon.parser.query
 *
 * global: jaxon
 */

(function(self, jq) {
    /**
     * The selector function.
     *
     * @var {object}
     */
    self.jq = jq;

    /**
     * Make the context for a DOM selector
     *
     * @param {mixed} xSelectContext
     * @param {object} xTarget
     *
     * @returns {object}
     */
    self.context = (xSelectContext, xTarget) => {
        if (!xSelectContext) {
            return xTarget;
        }
        if (!xTarget) {
            return self.select(xSelectContext).first();
        }
        return self.select(xSelectContext, xTarget).first();
    };

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
