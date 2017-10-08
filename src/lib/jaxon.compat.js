/*
Class: jaxon.command

This class is defined for compatibility with previous versions,
since its functions are used in other packages.
*/
jaxon.command = {};

/*
Class: jaxon.command.handler
*/
jaxon.command.handler = {};

/*
Function: jaxon.command.handler.register

Registers a new command handler.
*/
jaxon.command.handler.register = jaxon.fn.handler.register;

/*
Function: jaxon.command.create

Creates a new command (object) that will be populated with
command parameters and eventually passed to the command handler.
*/
jaxon.command.create = function(sequence, request, context) {
    var newCmd = {};
    newCmd.cmd = '*';
    newCmd.fullName = '* unknown command name *';
    newCmd.sequence = sequence;
    newCmd.request = request;
    newCmd.context = context;
    return newCmd;
};

/*
Class: jxn

Contains shortcut's to frequently used functions.
*/
jxn = {};

/*
Function: jxn.$

Shortcut to <jaxon.tools.dom.$>.
*/
jxn.$ = jaxon.tools.dom.$;

/*
Function: jxn.getFormValues

Shortcut to <jaxon.tools.form.getValues>.
*/
jxn.getFormValues = jaxon.tools.form.getValues;

jxn.request = jaxon.request;