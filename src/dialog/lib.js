/**
 * Class: jaxon.dialog.lib
 */

(function(self, types, dom, js, query) {
    /**
     * Labels for confirm question.
     *
     * @var {object}
     */
    const labels = {
        yes: 'Yes',
        no: 'No',
    };

    /**
     * Dialog libraries.
     *
     * @var {object}
     */
    const libs = {};

    /**
     * Set the confirm dialog labels
     *
     * @param {object} oLabels
     * @param {object=} oLabels.confirm
     * @param {string=} oLabels.confirm.yes
     * @param {string=} oLabels.confirm.no
     */
    self.labels = ({ confirm: { yes, no } = {} }) => {
        if (yes) {
            labels.yes = yes;
        }
        if (no) {
            labels.no = no;
        }
    };

    /**
     * Check if a dialog library is defined.
     *
     * @param {string} sName The library name
     *
     * @returns {bool}
     */
    self.has = (sName) => !!libs[sName];

    /**
     * Get a dialog library.
     *
     * @param {string=default} sName The library name
     *
     * @returns {object|null}
     */
    self.get = (sName) => libs[sName] ?? libs.default;

    /**
     * Show a message using a dialog library.
     *
     * @param {object} oMessage The message in the command
     * @param {string} oMessage.lib The dialog library to use for the message
     * @param {string} oMessage.type The message type
     * @param {string} oMessage.text The message text
     * @param {string=} oMessage.title The message title
     *
     * @returns {void}
     */
    self.alert = ({ lib: sLibName, type: sType, title: sTitle = '', text: sMessage }) =>
        self.get(sLibName).alert(sType, sMessage, sTitle);

    /**
     * Call a function after user confirmation.
     *
     * @param {object} oQuestion The question in the command
     * @param {string} oQuestion.lib The dialog library to use for the question
     * @param {string} oQuestion.text The question text
     * @param {string=} oQuestion.title The question title
     * @param {function} fYesCb The function to call if the question is confirmed
     * @param {function} fNoCb The function to call if the question is not confirmed
     *
     * @returns {void}
     */
    self.confirm = ({ lib: sLibName, title: sTitle = '', text: sQuestion }, fYesCb, fNoCb) =>
        self.get(sLibName).confirm(sQuestion, sTitle, fYesCb, fNoCb);

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
        libs[sName] = {};
        // Define the library functions
        xCallback(libs[sName], { types, dom, js, jq: query.jq, labels });
    };

    /**
     * Default dialog plugin, based on js alert and confirm functions
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
            confirm(!title ? question : `<b>${title}</b><br/>${question}`) ?
                yesCallback() : (noCallback && noCallback());
        };
    });
})(jaxon.dialog.lib, jaxon.utils.types, jaxon.dom, jaxon.parser.call, jaxon.parser.query);
