/**
 * Class: jaxon.parser.query
 */

(function(self, jq) {
    /**
     * The selector function.
     *
     * @var {object|null}
     */
    self.jq = null;

    /**
     * Init the library
     *
     * @param {object=} selector The selector function
     *
     * @var {mixed}
     */
    self.init = (selector) => {
        // Add som missing functions to the UmbrellaJs selector.
        if ((selector)) {
            selector.prototype.val = function() {
                const el = this.first();
                if (!el) {
                    return undefined;
                }
                if (!el.options || !el.multiple) {
                    return el.value;
                }
                // Convert from NodeList to array, so we can call the filter method.
                return [...el.options]
                    .filter((option) => option.selected)
                    .map((option) => option.value);
            };
            selector.prototype.show = function(display) {
                this.each(node => {
                    if (node.style) {
                        node.style.display = display ?? 'block';
                    }
                });
                return this;
            };
            selector.prototype.hide = function() {
                this.each(node => {
                    if (node.style) {
                        node.style.display = 'none';
                    }
                });
                return this;
            };
        }
        self.jq = selector;
    };

    // Call the init function.
    self.init(jq);

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
})(jaxon.parser.query, window.u /* window.jQuery */);
// window.u is the UmbrellaJs (https://umbrellajs.com) selector function.
