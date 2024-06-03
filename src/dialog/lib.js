/**
 * Class: jaxon.dialog.lib
 */

(function(self, types, dom, js, jq) {
    const labels = {
        yes: 'Yes',
        no: 'No',
    };

    self.default = {};

    /**
     * Check if a dialog library is defined.
     *
     * @param {string} sName The library name
     *
     * @returns {bool}
     */
    self.has = (sName) => !!self[sName];

    /**
     * Get a dialog library.
     *
     * @param {string=default} sName The library name
     *
     * @returns {object|null}
     */
    self.get = (sName) => self[sName] ?? self.default;

    /**
     * Register a dialog library.
     *
     * @param {string} sName The library name
     * @param {callback} xCallback The library definition callback
     *
     * @returns {void}
     */
    self.register = (sName, xCallback) => {
        // Create an object for the library
        self[sName] = {};
        // Define the library functions
        xCallback(self[sName], { types, dom, js, jq, labels });
    };

    /**
     * Default dialog plugin, based on js alert and confirm functions
     * Class: jaxon.dialog.lib.default
     */

    self.register('default', (lib) => {
        /**
         * Show an alert message
         *
         * @param {string} type The message type
         * @param {string} text The message text
         * @param {string} title The message title
         *
         * @returns {void}
         */
        lib.alert = (type, text, title) => alert(!title ? text : `<b>${title}</b><br/>${text}`);

        /**
         * Ask a confirm question to the user.
         *
         * @param {string} question The question to ask
         * @param {string} title The question title
         * @param {callback} yesCallback The function to call if the answer is yes
         * @param {callback} noCallback The function to call if the answer is no
         *
         * @returns {void}
         */
        lib.confirm = (question, title, yesCallback, noCallback) => {
            if(confirm(!title ? question : `<b>${title}</b><br/>${question}`)) {
                yesCallback();
                return;
            }
            noCallback && noCallback();
        };
    });
})(jaxon.dialog.lib, jaxon.utils.types, jaxon.dom, jaxon.call.json, window.jQuery);
