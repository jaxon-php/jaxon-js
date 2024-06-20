/**
 * Class: jaxon.ajax.handler
 */

(function(self, config, ajax, rsp, queue, dom) {
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
        recv: queue.create(config.requestQueueSize * 2)
    };

    /**
     * Registers a new command handler.
     *
     * @param {string} cmd The short name of the command handler.
     * @param {string} func The command handler function.
     * @param {string=''} name The full name of the command handler.
     *
     * @returns {void}
     */
    self.register = (cmd, func, name = '') => handlers[cmd] = { name, func };

    /**
     * Unregisters and returns a command handler.
     *
     * @param {string} cmd The name of the command handler.
     *
     * @returns {callable} The unregistered function.
     */
    self.unregister = (cmd) => {
        const handler = handlers[cmd];
        delete handlers[cmd];
        return handler.func;
    };

    /**
     * @param {object} command The response command to be executed.
     * @param {string} command.cmd The name of the function.
     *
     * @returns {boolean} (true or false): depending on whether a command handler has
     * been registered for the specified command (object).
     */
    self.isRegistered = ({ cmd }) => cmd !== undefined && handlers[cmd] !== undefined;

    /**
     * Perform a lookup on the command specified by the response command object passed
     * in the first parameter.  If the command exists, the function checks to see if
     * the command references a DOM object by ID; if so, the object is located within
     * the DOM and added to the command data.  The command handler is then called.
     * 
     * If the command handler returns true, it is assumed that the command completed
     * successfully.  If the command handler returns false, then the command is considered
     * pending; jaxon enters a wait state.  It is up to the command handler to set an
     * interval, timeout or event handler which will restart the jaxon response processing.
     * 
     * @param {object} command The response command to be executed.
     *
     * @returns {true} The command completed successfully.
     * @returns {false} The command signalled that it needs to pause processing.
     */
    const execute = (command) => {
        if (!self.isRegistered(command)) {
            return true;
        }
        // If the command has an "id" attr, find the corresponding dom element.
        if (command.id) {
            command.target = dom.$(command.id);
        }
        // Process the command
        return self.call(command);
    };

    /**
     * Process a single command
     * 
     * @param {object} command The command to process
     *
     * @returns {boolean}
     */
    const processCommand = (command) => {
        try {
            execute(command);
            return true;
        } catch (e) {
            console.log(e);
        }
        return false;
    };

    /**
     * While entries exist in the queue, pull and entry out and process it's command.
     * When commandQueue.paused is set to true, the processing is halted.
     *
     * Note:
     * - Set commandQueue.paused to false and call this function to cause the queue processing to continue.
     * - When an exception is caught, do nothing; if the debug module is installed, it will catch the exception and handle it.
     *
     * @param {object} commandQueue A queue containing the commands to execute.
     *
     * @returns {true} The queue was fully processed and is now empty.
     * @returns {false} The queue processing was halted before the queue was fully processed.
     */
    self.processCommands = (commandQueue) => {
        // Stop processing the commands if the queue is paused.
        let command = null;
        while (!commandQueue.paused && (command = queue.pop(commandQueue)) !== null) {
            if (!processCommand(command)) {
                return true;
            }
        }
        return true;
    };

    /**
     * Calls the registered command handler for the specified command
     * (you should always check isRegistered before calling this function)
     *
     * @param {object} command The response command to be executed.
     * @param {string} command.cmd The name of the function.
     *
     * @returns {boolean}
     */
    self.call = (command) => {
        const handler = handlers[command.cmd];
        command.fullName = handler.name;
        return handler.func(command);
    }

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
     * @param {object} command The Response command object.
     * @param {integer} command.prop The number of 10ths of a second to sleep.
     * @param {object} command.response The command queue.
     *
     * @returns {true}
     */
    self.sleep = ({ prop: duration, response: commandQueue }) => {
        // The command queue is paused, and will be restarted after the specified delay.
        commandQueue.paused = true;
        setTimeout(() => {
            commandQueue.paused = false;
            self.processCommands(commandQueue);
        }, duration * 100);
        return true;
    };

    /**
     * Show the specified message.
     *
     * @param {string} message The message to display.
     *
     * @returns {void}
     */
    self.alert = (message) => ajax.message.info(message);

    /**
     * The function to run after the confirm question, for the comfirmCommands.
     *
     * @param {object} commandQueue The queue to process.
     * @param {integer} count The number of commands to skip.
     *
     * @returns {void}
     */
    const confirmCallback = (commandQueue, count) => {
        // The last entry in the queue is not a user command, thus it cannot be skipped.
        while (count > 0 && commandQueue.count > 1 && queue.pop(commandQueue) !== null) {
            --count;
        }
        // After => the processing is executed.
        commandQueue.paused = false;
        self.processCommands(commandQueue);
    };

    /**
     * Ask a confirm question and skip the specified number of commands if the answer is ok.
     *
     * The processing of the queue after the question is delayed so it occurs after this function returns.
     * before (when using the blocking confirm() function) or after this function returns.
     * @see confirmCallback
     *
     * @param {object} command The object to track the retry count for.
     * @param {integer} count The number of commands to skip.
     * @param {string} question The question to ask to the user.
     *
     * @returns {true}
     */
    self.confirm = (command, count, question) => {
        const { response: commandQueue } = command;
        // The command queue is paused, and will be restarted after the confirm question is answered.
        commandQueue.paused = true;
        ajax.message.confirm(question, '',
            () => confirmCallback(commandQueue, 0),
            () => confirmCallback(commandQueue, count));
        return true;
    };
})(jaxon.ajax.handler, jaxon.config, jaxon.ajax, jaxon.ajax.response,
    jaxon.utils.queue, jaxon.utils.dom);
