/**
 * Class: jaxon.command
 *
 * This class is defined for compatibility with previous versions, since its functions are used in other packages.
 */
jaxon.command = {
    handler: {},

    handler: {
        register: jaxon.ajax.handler.register
    },

    /**
     * Creates a new command (object) that will be populated with command parameters
     * and eventually passed to the command handler.
     */
    create: (sequence, request, context) => ({
        cmd: '*',
        fullName: '* unknown command name *',
        sequence: sequence,
        request: request,
        context: context
    }),
};

/**
 * Class: jxn
 *
 * Contains shortcut's to frequently used functions.
 */
const jxn = {
    /**
     * Shortcut to <jaxon.utils.dom.$>.
     */
    $: jaxon.utils.dom.$,

    /**
     * Shortcut to <jaxon.utils.form.getValues>.
     */
    getFormValues: jaxon.utils.form.getValues,

    /**
     * Shortcut to <jaxon.request>.
     */
    request: jaxon.request
};
