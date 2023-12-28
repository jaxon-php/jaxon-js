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
    self.execute = (command) => {
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
     * Maintains a retry counter for the given object.
     *
     * @param {object} command The object to track the retry count for.
     * @param {integer} count The number of times the operation should be attempted before a failure is indicated.
     *
     * @returns {true} The object has not exhausted all the retries.
     * @returns {false} The object has exhausted the retry count specified.
     */
    self.retry = (command, count) => {
        if(command.retries > 0) {
            if(--command.retries < 1) {
                return false;
            }
        } else {
            command.retries = count;
        }
        // This command must be processed again.
        command.requeue = true;
        return true;
    };

    /**
     * Set or reset a timeout that is used to restart processing of the queue.
     *
     * This allows the queue to asynchronously wait for an event to occur (giving the browser time
     * to process pending events, like loading files)
     *
     * @param {object} response The queue to process.
     * @param {integer} when The number of milliseconds to wait before starting/restarting the processing of the queue.
     *
     * @returns {void}
     */
    self.setWakeup = (response, when) => {
        if (response.timeout !== null) {
            clearTimeout(response.timeout);
            response.timeout = null;
        }
        response.timout = setTimeout(() => rsp.process(response), when);
    };

    /**
     * The function to run after the confirm question, for the comfirmCommands.
     *
     * @param {object} command The object to track the retry count for.
     * @param {integer} count The number of commands to skip.
     *
     * @returns {void}
     */
    const confirmCallback = (command, count) => {
        // The last entry in the queue is not a user command, thus it cannot be skipped.
        while (count > 0 && command.response.count > 1 && queue.pop(command.response) !== null) {
            --count;
        }
        // Run a different command depending on whether this callback executes
        // before of after the confirm function returns;
        if(command.requeue === true) {
            // Before => the processing is delayed.
            self.setWakeup(command.response, 30);
            return;
        }
        // After => the processing is executed.
        rsp.process(command.response);
    };

    /**
     * Ask a confirm question and skip the specified number of commands if the answer is ok.
     *
     * The processing of the queue after the question is delayed so it occurs after this function returns.
     * The 'command.requeue' attribute is used to determine if the confirmCallback is called
     * before (when using the blocking confirm() function) or after this function returns.
     * @see confirmCallback
     *
     * @param {object} command The object to track the retry count for.
     * @param {integer} count The number of commands to skip.
     * @param {string} question The question to ask to the user.
     *
     * @returns {boolean}
     */
    self.confirm = (command, count, question) => {
        // This will be checked in the callback.
        command.requeue = true;
        ajax.message.confirm(question, '', () => confirmCallback(command, 0),
            () => confirmCallback(command, count));

        // This command must not be processed again.
        command.requeue = false;
        return false;
    };
})(jaxon.ajax.handler, jaxon.config, jaxon.ajax, jaxon.ajax.response,
    jaxon.utils.queue, jaxon.utils.dom);
