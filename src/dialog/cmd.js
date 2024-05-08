/**
 * Class: jaxon.dialog.cmd
 */

(function(self, lib) {
    /**
     * Add an event handler to the specified target.
     *
     * @param {object} command The Response command object.
     * @param {string} command.lib The message library name
     * @param {object} command.type The message type
     * @param {string} command.message The message content
     * @param {string} command.message.title The message title
     * @param {string} command.message.phrase.str The message with placeholders
     * @param {array} command.message.phrase.args The arguments for placeholders
     *
     * @returns {true} The operation completed successfully.
     */
    self.showMessage = ({ lib: sLibName, type: sType, message }) => {
        const { title: sTitle, phrase : { str: sMessage, args: aArgs } } = message;
        const xLib = lib[sLibName];
        xLib && xLib.message(sType, sMessage.supplant(aArgs), sTitle);
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
        const xLib = lib[sLibName];
        xLib && xLib.show(title, content, buttons, options);
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
        const xLib = lib[sLibName];
        xLib && xLib.hide();
        return true;
    };
})(jaxon.dialog.cmd, jaxon.dialog.lib);
