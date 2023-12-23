/**
 * Class: jaxon.ajax.parameters
 */

(function(self) {
    /**
     * Print a success message on the screen.
     *
     * @param {string} content The message content.
     * @param {string} title The message title.
     *
     * @returns {void}
     */
    self.success = (content, title) => alert(content);

    /**
     * Print an info message on the screen.
     *
     * @param {string} content The message content.
     * @param {string} title The message title.
     *
     * @returns {void}
     */
    self.info = (content, title) => alert(content);

    /**
     * Print a warning message on the screen.
     *
     * @param {string} content The message content.
     * @param {string} title The message title.
     *
     * @returns {void}
     */
    self.warning = (content, title) => alert(content);

    /**
     * Print an error message on the screen.
     *
     * @param {string} content The message content.
     * @param {string} title The message title.
     *
     * @returns {void}
     */
    self.error = (content, title) => alert(content);

    /**
     * Print an error message on the screen.
     *
     * @param {string} question The confirm question.
     * @param {string} title The confirm title.
     * @param {callable} yesCallback The function to call if the user answers yesn.
     * @param {callable} noCallback The function to call if the user answers no.
     *
     * @returns {void}
     */
    self.confirm = (question, title, yesCallback, noCallback) => {
        if(confirm(question)) {
            yesCallback();
            return;
        }
        noCallback && noCallback();
    };
})(jaxon.ajax.message);
