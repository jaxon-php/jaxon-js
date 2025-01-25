/**
 * Class: jaxon.cmd.dialog
 *
 * global: jaxon
 */

(function(self, dialog, parser, command) {
    /**
     * Prompt the user with the specified question, if the user responds by clicking cancel,
     * then skip the specified number of commands in the response command queue.
     * If the user clicks Ok, the command processing resumes normal operation.
     *
     * @param {object} args The command arguments.
     * @param {integer} args.count The number of commands to skip.
     * @param {string} args.lib The dialog library to use.
     * @param {object} args.question The question to ask.
     * @param {object} context The command context.
     * @param {object} context.queue The command queue.
     *
     * @returns {true} The queue processing is temporarily paused.
     */
    self.execConfirm = ({ count: skipCount, lib: sLibName, question }, { queue: oQueue }) => {
        // The command queue processing is paused, and will be restarted
        // after the confirm question is answered.
        command.pause(oQueue, (restart) => {
            dialog.confirm(sLibName, {
                ...question,
                text: parser.makePhrase(question.phrase),
            }, {
                yes: () => restart(),
                no: () => restart(skipCount),
            });
        });
        return true;
    };

    /**
     * Add an event handler to the specified target.
     *
     * @param {object} args The command arguments.
     * @param {string} args.lib The dialog library to use.
     * @param {object} args.message The message content
     *
     * @returns {true} The operation completed successfully.
     */
    self.showAlert = ({ lib: sLibName, message }) => {
        dialog.alert(sLibName, {
            ...message,
            text: parser.makePhrase(message.phrase),
        });
        return true;
    };

    /**
     * Remove an event handler from an target.
     *
     * @param {object} args The command arguments.
     * @param {string} args.lib The dialog library to use.
     * @param {object} args.dialog The dialog content
     *
     * @returns {true} The operation completed successfully.
     */
    self.showModal = ({ lib: sLibName, dialog: oDialog }) => {
        dialog.show(sLibName, oDialog);
        return true;
    };

    /**
     * Set an event handler with arguments to the specified target.
     *
     * @param {object} args The command arguments.
     * @param {string} args.lib The dialog library to use.
     *
     * @returns {true} The operation completed successfully.
     */
    self.hideModal = ({ lib: sLibName }) => {
        dialog.hide(sLibName);
        return true;
    };
})(jaxon.cmd.dialog, jaxon.dialog, jaxon.parser.call, jaxon.ajax.command);
