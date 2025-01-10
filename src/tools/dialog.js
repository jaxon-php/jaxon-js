/**
 * Class: jaxon.dialog
 */

(function(self, dom, call, query, types) {
    /**
     * Config data.
     *
     * @var {object}
     */
    const config = {
        labels: {
            yes: 'Yes',
            no: 'No',
        },
        options: {},
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
            config.labels.yes = yes;
        }
        if (no) {
            config.labels.no = no;
        }
    };

    /**
     * Set the dialog libraries options
     *
     * @param {object} oOptions
     */
    self.options = (oOptions) => {
        if (types.isObject(oOptions)) {
            config.options = oOptions;
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
    self.alert = ({ lib: sLibName, type, title = '', text: message }) =>
        self.get(sLibName).alert({ type, message, title });

    /**
     * Call a function after user confirmation.
     *
     * @param {object} oQuestion The question in the command
     * @param {string} oQuestion.lib The dialog library to use for the question
     * @param {string} oQuestion.text The question text
     * @param {string=} oQuestion.title The question title
     * @param {function} yesCallback The function to call if the question is confirmed
     * @param {function} noCallback The function to call if the question is not confirmed
     *
     * @returns {void}
     */
    self.confirm = ({ lib: sLibName, title = '', text: question }, yesCallback, noCallback) =>
        self.get(sLibName).confirm({ question, title, yesCallback, noCallback });

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
        const { labels, options: oOptions } = config;
        // Check that the provided library option is an object,
        // and add the labels to the provided options.
        const options = types.isObject(oOptions[sName]) ?
            { ...oOptions[sName], labels } : { labels };
        xCallback(libs[sName], { types, dom, js: call, jq: query.jq, options });
    };

    /**
     * Default dialog plugin, based on js alert and confirm functions
     */
    self.register('default', (lib) => {
        /**
         * Show an alert message
         *
         * @param {string} type The alert type
         * @param {string} message The alert message
         * @param {string} title The alert title
         *
         * @returns {void}
         */
        lib.alert = ({ type, message, title }) => alert(!title ? text : `<b>${title}</b><br/>${message}`);

        /**
         * Ask a confirm question to the user.
         *
         * @param {string} question The question to ask
         * @param {string} title The question title
         * @param {callback} yesCallback The function to call if the answer is yes
         * @param {callback=} noCallback The function to call if the answer is no
         *
         * @returns {void}
         */
        lib.confirm = ({ question, title, yesCallback, noCallback }) => {
            confirm(!title ? question : `<b>${title}</b><br/>${question}`) ?
                yesCallback() : (noCallback && noCallback());
        };
    });
})(jaxon.dialog, jaxon.dom, jaxon.parser.call, jaxon.parser.query, jaxon.utils.types);
