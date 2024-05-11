/**
 * Class: jaxon.dialog.lib
 */

(function(self, str, dom, js, jq) {
    self.labels = {
        yes: 'Yes',
        no: 'No',
    };

    /**
     * Register a dialog library.
     *
     * @param {string} name The library name
     * @param {callback} cb The library definition callback
     *
     * @returns {void}
     */
    self.register = (name, cb) => {
        // Create an object for the library
        self[name] = {};
        // Define the library functions
        cb(self[name], { str, dom, js, jq, labels: self.labels });
    };
})(jaxon.dialog.lib, jaxon.utils.string, jaxon.dom, jaxon.call.json, window.jQuery);
