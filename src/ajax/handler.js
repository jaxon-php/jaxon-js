/**
 * Class: jaxon.ajax.handler
 */

(function(self, config, rsp, call, attr, queue, dom, dialog) {
    /**
     * An array that is used internally in the jaxon.fn.handler object to keep track
     * of command handlers that have been registered.
     *
     * @var {object}
     */
    const handlers = {};

    /**
     * The queues that hold synchronous requests as they are sent and processed.
     *
     * @var {object}
     */
    self.q = {
        send: queue.create(config.requestQueueSize),
        recv: queue.create(config.requestQueueSize * 2),
    };

    /**
     * Registers a new command handler.
     *
     * @param {string} name The short name of the command handler.
     * @param {string} func The command handler function.
     * @param {string=''} desc The description of the command handler.
     *
     * @returns {void}
     */
    self.register = (name, func, desc = '') => handlers[name] = { desc, func };

    /**
     * Unregisters and returns a command handler.
     *
     * @param {string} name The name of the command handler.
     *
     * @returns {callable|null} The unregistered function.
     */
    self.unregister = (name) => {
        const handler = handlers[name];
        if (!handler) {
            return null;
        }
        delete handlers[name];
        return handler.func;
    };

    /**
     * @param {object} command The response command to be executed.
     * @param {string} command.name The name of the function.
     *
     * @returns {boolean}
     */
    self.isRegistered = ({ name }) => name !== undefined && handlers[name] !== undefined;

    /**
     * Calls the registered command handler for the specified command
     * (you should always check isRegistered before calling this function)
     *
     * @param {object} name The command name.
     * @param {object} args The command arguments.
     * @param {object} context The command context.
     *
     * @returns {boolean}
     */
    const callHandler = (name, args, context) => {
        const { func, desc } = handlers[name];
        context.command.desc = desc;
        return func(args, context);
    }

    /**
     * Perform a lookup on the command specified by the response command object passed
     * in the first parameter.  If the command exists, the function checks to see if
     * the command references a DOM object by ID; if so, the object is located within
     * the DOM and added to the command data.  The command handler is then called.
     * 
     * @param {object} command The response command to be executed.
     *
     * @returns {true} The command completed successfully.
     * @returns {false} The command signalled that it needs to pause processing.
     */
    self.execute = (command) => {
        const { name, args = {}, component = {}, options = {} } = command;
        if (!self.isRegistered({ name })) {
            return true;
        }
        const context = { command, options };
        // If the command has an "id" attr, find the corresponding dom node.
        if ((component.name)) {
            context.target = attr.node(component.name, component.item);
        }
        if (!context.target && (args.id)) {
            context.target = dom.$(args.id);
        }
        // Process the command
        callHandler(name, args, context);
        // Process Jaxon custom attributes in the new node HTML content.
        attr.changed(context.target, name, args.attr) && attr.process(context.target);
        return true;
    };

    /**
     * Attempt to pop the next asynchronous request.
     *
     * @param {object} oQueue The queue object you would like to modify.
     *
     * @returns {object|null}
     */
    self.popAsyncRequest = oQueue => {
        if (queue.empty(oQueue) || queue.peek(oQueue).mode === 'synchronous') {
            return null;
        }
        return queue.pop(oQueue);
    }

    /**
     * Causes the processing of items in the queue to be delayed for the specified amount of time.
     * This is an asynchronous operation, therefore, other operations will be given an opportunity
     * to execute during this delay.
     *
     * @param {object} args The command arguments.
     * @param {integer} args.duration The number of 10ths of a second to sleep.
     * @param {object} command The Response command object.
     * @param {object} command.commandQueue The command queue.
     *
     * @returns {true} The queue processing is temporarily paused.
     */
    self.sleep = ({ duration }, { commandQueue }) => {
        // The command queue is paused, and will be restarted after the specified delay.
        commandQueue.paused = true;
        setTimeout(() => {
            commandQueue.paused = false;
            rsp.processCommands(commandQueue);
        }, duration * 100);
        return true;
    };

    /**
     * The function to run after the confirm question, for the comfirmCommands.
     *
     * @param {object} commandQueue The command queue.
     * @param {integer=0} skipCount The number of commands to skip.
     *
     * @returns {void}
     */
    const restartProcessing = (commandQueue, skipCount = 0) => {
        // Skip commands.
        // The last entry in the queue is not a user command, thus it cannot be skipped.
        while (skipCount > 0 && commandQueue.count > 1 && queue.pop(commandQueue) !== null) {
            --skipCount;
        }
        commandQueue.paused = false;
        rsp.processCommands(commandQueue);
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
     * @param {object} command The Response command object.
     * @param {object} command.commandQueue The command queue.
     *
     * @returns {true} The queue processing is temporarily paused.
     */
    self.confirm = ({
        count: skipCount,
        question: { lib: sLibName, title: sTitle, phrase },
    }, { commandQueue }) => {
        // The command queue is paused, and will be restarted after the confirm question is answered.
        const xLib = dialog.get(sLibName);
        commandQueue.paused = true;
        xLib.confirm(call.makePhrase(phrase), sTitle,
            () => restartProcessing(commandQueue),
            () => restartProcessing(commandQueue, skipCount));
        return true;
    };
})(jaxon.ajax.handler, jaxon.config, jaxon.ajax.response, jaxon.parser.call,
    jaxon.parser.attr, jaxon.utils.queue, jaxon.utils.dom, jaxon.dialog.lib);
