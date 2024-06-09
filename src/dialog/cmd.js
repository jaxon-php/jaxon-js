/**
 * Class: jaxon.dialog.cmd
 */

(function(self, lib, parser) {
    /**
     * Find a library to execute a given function.
     *
     * @param {string} sLibName The dialog library name
     * @param {string} sFunc The dialog library function
     *
     * @returns {object}
     */
    const getLib = (sLibName, sFunc) => {
        !lib.has(sLibName) &&
            console.warn(`Unable to find a Jaxon dialog library with name "${sLibName}".`);

        const xLib = lib.get(sLibName);
        !xLib[sFunc] &&
            console.error(`The chosen Jaxon dialog library doesn't implement the "${sFunc}" function.`);

        return xLib;
    };

    /**
     * Add an event handler to the specified target.
     *
     * @param {object} command The Response command object.
     * @param {string} command.lib The message library name
     * @param {object} command.type The message type
     * @param {string} command.title The message title
     * @param {object} command.phrase The message content
     *
     * @returns {true} The operation completed successfully.
     */
    self.showMessage = ({ lib: sLibName, type: sType, title: sTitle, phrase }) => {
        const xLib = getLib(sLibName, 'alert');
        xLib.alert && xLib.alert(sType, parser.makePhrase(phrase), sTitle);
        return true;
    };

    /**
     * Remove an event handler from an target.
     *
     * @param {object} command The Response command object.
     * @param {string} command.lib The dialog library name
     * @param {object} command.dialog The dialog content
     * @param {string} command.dialog.title The dialog title
     * @param {string} command.dialog.content The dialog HTML content
     * @param {array} command.dialog.buttons The dialog buttons
     * @param {array} command.dialog.options The dialog options
     *
     * @returns {true} The operation completed successfully.
     */
    self.showModal = ({ lib: sLibName, dialog: { title, content, buttons, options } }) => {
        const xLib = getLib(sLibName, 'show');
        xLib.show && xLib.show(title, content, buttons, options);
        return true;
    };

    /**
     * Set an event handler with arguments to the specified target.
     *
     * @param {object} command The Response command object.
     * @param {string} command.lib The dialog library name
     *
     * @returns {true} The operation completed successfully.
     */
    self.hideModal = ({ lib: sLibName }) => {
        const xLib = getLib(sLibName, 'hide');
        xLib.hide && xLib.hide();
        return true;
    };
})(jaxon.dialog.cmd, jaxon.dialog.lib, jaxon.parser.call);
