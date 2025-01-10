/**
 * Class: jaxon.cmd.dialog
 */

(function(self, lib, parser, attr, command) {
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
     * Prompt the user with the specified question, if the user responds by clicking cancel,
     * then skip the specified number of commands in the response command queue.
     * If the user clicks Ok, the command processing resumes normal operation.
     *
     * @param {object} args The command arguments.
     * @param {integer} args.count The number of commands to skip.
     * @param {object} args.question The question to ask.
     * @param {string} args.question.lib The dialog library to use.
     * @param {object} args.question.title The question title.
     * @param {object} args.question.phrase The question content.
     * @param {object} context The command context.
     * @param {object} context.queue The command queue.
     *
     * @returns {true} The queue processing is temporarily paused.
     */
    self.confirm = ({
        count: nSkipCount,
        question: { lib: sLibName, title: sTitle, phrase: oPhrase },
    }, { queue: oQueue }) => {
        // The command queue is paused, and will be restarted after the confirm question is answered.
        const xLib = self.get(sLibName);
        oQueue.paused = true;
        xLib.confirm(parser.makePhrase(oPhrase), sTitle,
            () => command.processQueue(oQueue),
            () => command.processQueue(oQueue, nSkipCount));
        return true;
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
    self.showAlert = ({ lib: sLibName, type: sType, title: sTitle, phrase }) => {
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
        xLib.show && xLib.show(title, content, buttons, options,
            (xDialogDom) => xDialogDom && attr.process(xDialogDom));
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
})(jaxon.cmd.dialog, jaxon.dialog.lib, jaxon.parser.call, jaxon.parser.attr, jaxon.ajax.command);
