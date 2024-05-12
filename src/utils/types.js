/**
 * Class: jaxon.utils.string
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
     * Convert to int.
     *
     * @param {string} sValue
     *
     * @returns {integer}
     */
    self.toInt = (sValue) => parseInt(sValue);
})(jaxon.utils.types);
