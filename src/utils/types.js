/**
 * Class: jaxon.utils.types
 */

(function(self) {
    /**
     * Get the type of an object.
     * Unlike typeof, this function distinguishes objects from arrays.
     *
     * @param {mixed} xVar The var to check
     *
     * @returns {string}
     */
    self.of = (xVar) => Object.prototype.toString.call(xVar).slice(8, -1).toLowerCase();

    /**
     * Check if a var is an object.
     *
     * @param {mixed} xVar The var to check
     *
     * @returns {bool}
     */
    self.isObject = (xVar) => self.of(xVar) === 'object';

    /**
     * Check if a var is an array.
     *
     * @param {mixed} xVar The var to check
     *
     * @returns {bool}
     */
    self.isArray = (xVar) => self.of(xVar) === 'array';

    /**
     * Check if a var is a string.
     *
     * @param {mixed} xVar The var to check
     *
     * @returns {bool}
     */
    self.isString = (xVar) => self.of(xVar) === 'string';

    /**
     * Check if a var is a function.
     *
     * @param {mixed} xVar The var to check
     *
     * @returns {bool}
     */
    self.isFunction = (xVar) => self.of(xVar) === 'function';

    /**
     * Convert to int.
     *
     * @param {string} sValue
     *
     * @returns {integer}
     */
    self.toInt = (sValue) => parseInt(sValue);

    if (!Array.prototype.top) {
        /**
         * Get the last element in an array
         *
         * @returns {mixed}
         */
        Array.prototype.top = function() {
            return this.length > 0 ? this[this.length - 1] : undefined;
        };
    };
})(jaxon.utils.types);
