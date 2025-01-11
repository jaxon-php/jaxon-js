/**
 * Class: jaxon.dialog
 */

(function(self, dom, attr, call, query, types) {
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
     * @param {object} labels
     * @param {object=} labels.confirm
     * @param {string=} labels.confirm.yes
     * @param {string=} labels.confirm.no
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
     * Find a library to execute a given function.
     *
     * @param {string} sLibName The dialog library name
     * @param {string} sFunc The dialog library function
     *
     * @returns {object}
     */
    const getLib = (sLibName, sFunc) => {
        !libs[sLibName] &&
            console.warn(`Unable to find a dialog library with name "${sLibName}".`);
        if (libs[sLibName]) {
            if (libs[sLibName][sFunc]) {
                return libs[sLibName];
            }
            console.warn(`The chosen dialog library doesn't implement the "${sFunc}" function..`);
        }
        !libs.default[sFunc] &&
            console.error(`Unable to find a dialog library with the "${sFunc}" function.`);
        return libs.default;
    };

    /**
     * Show an alert message using a dialog library.
     *
     * @param {string} sLibName The dialog library to use
     * @param {object} message The message in the command
     * @param {string} message.type The message type
     * @param {string} message.text The message text
     * @param {string=} message.title The message title
     *
     * @returns {void}
     */
    self.alert = (sLibName, { type, title = '', text: message }) =>
        getLib(sLibName, 'alert').alert({ type, message, title });

    /**
     * Call a function after user confirmation.
     *
     * @param {string} sLibName The dialog library to use
     * @param {object} question The question in the command
     * @param {string} question.text The question text
     * @param {string=} question.title The question title
     * @param {object} callback The callbacks to call after the question is answered
     *
     * @returns {void}
     */
    self.confirm = (sLibName, { title = '', text: question }, callback) =>
        getLib(sLibName, 'confirm').confirm({ question, title }, callback);

    /**
     * Show a dialog window.
     *
     * @param {string} sLibName The dialog library to use
     * @param {object} dialog The dialog content
     *
     * @returns {true} The operation completed successfully.
     */
    self.show = (sLibName, dialog) => {
        const xLib = getLib(sLibName, 'show');
        xLib.show && xLib.show(dialog, (xDialogDom) => xDialogDom && attr.process(xDialogDom));
        return true;
    };

    /**
     * Hide a dialog window.
     *
     * @param {string} sLibName The dialog library to use
     *
     * @returns {true} The operation completed successfully.
     */
    self.hide = ({ lib: sLibName }) => {
        const xLib = getLib(sLibName, 'hide');
        xLib.hide && xLib.hide();
        return true;
    };

    /**
     * Register a dialog library.
     *
     * @param {string} sLibName The library name
     * @param {callback} xCallback The library definition callback
     *
     * @returns {void}
     */
    self.register = (sLibName, xCallback) => {
        // Create an object for the library
        libs[sLibName] = {};
        // Define the library functions
        const { labels, options: oOptions } = config;
        // Check that the provided library option is an object,
        // and add the labels to the provided options.
        const options = types.isObject(oOptions[sLibName]) ?
            { ...oOptions[sLibName], labels } : { labels };
        // Provide some utility functions to the dialog library.
        const utils = { ...types, ready: dom.ready, js: call.execExpr, jq: query.jq };
        xCallback(libs[sLibName], options, utils);
    };

    /**
     * Default dialog plugin, based on js alert and confirm functions
     */
    self.register('default', (lib) => {
        /**
         * Show an alert message
         *
         * @param {object} alert The alert parameters
         * @param {string} alert.message The alert message
         * @param {string} alert.title The alert title
         *
         * @returns {void}
         */
        lib.alert = ({ message, title }) =>
            alert(!title ? message : `<b>${title}</b><br/>${message}`);

        /**
         * Ask a confirm question to the user.
         *
         * @param {object} confirm The confirm parameters
         * @param {string} confirm.question The question to ask
         * @param {string} confirm.title The question title
         * @param {object} callback The confirm callbacks
         * @param {callback} callback.yes The function to call if the answer is yes
         * @param {callback=} callback.no The function to call if the answer is no
         *
         * @returns {void}
         */
        lib.confirm = ({ question, title}, { yes: yesCb, no: noCb }) => {
            confirm(!title ? question :
                `<b>${title}</b><br/>${question}`) ? yesCb() : (noCb && noCb());
        };
    });
})(jaxon.dialog, jaxon.dom, jaxon.parser.attr, jaxon.parser.call,
    jaxon.parser.query, jaxon.utils.types);
