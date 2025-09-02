/**
 * Class: jaxon.parser.query
 *
 * global: jaxon
 */

(function(self) {
    /**
     * The selector function.
     *
     * @var {object}
     */
    self.jq = null;

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
    self.select = (xSelector, xContext = null) => {
        // window.chibi is the ChibiJs (https://github.com/kylebarrow/chibi) selector function.
        if (!self.jq) {
            // Chibi is used only when jQuery is not loaded in the page.
            self.jq = window.jQuery ?? window.chibi;
        }
        return !xContext ? self.jq(xSelector) : self.jq(xSelector, xContext);
    };
})(jaxon.parser.query);
