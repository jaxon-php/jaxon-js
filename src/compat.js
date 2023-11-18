/*
Class: jaxon.command

This class is defined for compatibility with previous versions,
since its functions are used in other packages.
*/
jaxon.command = {
    /*
    Class: jaxon.command.handler
    */
    handler: {},

    /*
    Function: jaxon.command.handler.register

    Registers a new command handler.
    */
    handler: {
        register: jaxon.ajax.handler.register
    },

    /*
    Function: jaxon.command.create

    Creates a new command (object) that will be populated with
    command parameters and eventually passed to the command handler.
    */
    create: function(sequence, request, context) {
        return {
            cmd: '*',
            fullName: '* unknown command name *',
            sequence: sequence,
            request: request,
            context: context
        };
    }
};

/*
Class: jxn

Contains shortcut's to frequently used functions.
*/
const jxn = {
    /*
    Function: jxn.$

    Shortcut to <jaxon.utils.dom.$>.
    */
    $: jaxon.utils.dom.$,

    /*
    Function: jxn.getFormValues

    Shortcut to <jaxon.utils.form.getValues>.
    */
    getFormValues: jaxon.utils.form.getValues,

    request: jaxon.request
};
