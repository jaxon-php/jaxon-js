/**
 * Class: jaxon.ajax.parameters
 */

(function(self) {
    /*
    Function: jaxon.ajax.message.success

    Print a success message on the screen.

    Parameters:
        content - (string):  The message content.
        title - (string):  The message title.
    */
    self.success = (content, title) => alert(content);

    /*
    Function: jaxon.ajax.message.info

    Print an info message on the screen.

    Parameters:
        content - (string):  The message content.
        title - (string):  The message title.
    */
    self.info = (content, title) => alert(content);

    /*
    Function: jaxon.ajax.message.warning

    Print a warning message on the screen.

    Parameters:
        content - (string):  The message content.
        title - (string):  The message title.
    */
    self.warning = (content, title) => alert(content);

    /*
    Function: jaxon.ajax.message.error

    Print an error message on the screen.

    Parameters:
        content - (string):  The message content.
        title - (string):  The message title.
    */
    self.error = (content, title) => alert(content);

    /*
    Function: jaxon.ajax.message.confirm

    Print an error message on the screen.

    Parameters:
        question - (string):  The confirm question.
        title - (string):  The confirm title.
        yesCallback - (Function): The function to call if the user answers yes.
        noCallback - (Function): The function to call if the user answers no.
    */
    self.confirm = function(question, title, yesCallback, noCallback) {
        if(confirm(question)) {
            yesCallback();
            return;
        }
        noCallback && noCallback();
    };
})(jaxon.ajax.message);
