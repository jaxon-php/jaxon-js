jaxon.cmd.delay = {
    /**
     * Attempt to pop the next asynchronous request.
     *
     * @param object oQueue The queue object you would like to modify.
     *
     * @returns object|null
     */
    popAsyncRequest: function(oQueue) {
        if(jaxon.tools.queue.empty(oQueue))
        {
            return null;
        }
        if(jaxon.tools.queue.peek(oQueue).mode === 'synchronous')
        {
            return null;
        }
        return jaxon.tools.queue.pop(oQueue);
    },

    /**
     * Maintains a retry counter for the given object.
     *
     * @param command object    The object to track the retry count for.
     * @param count integer     The number of times the operation should be attempted before a failure is indicated.
     *
     * @returns boolean
     *      true - The object has not exhausted all the retries.
     *      false - The object has exhausted the retry count specified.
     */
    retry: function(command, count) {
        let retries = command.retries;
        if(retries) {
            --retries;
            if(1 > retries) {
                return false;
            }
        } else {
            retries = count;
        }
        command.retries = retries;
        // This command must be processed again.
        command.requeue = true;
        return true;
    },

    /**
     * Set or reset a timeout that is used to restart processing of the queue.
     *
     * This allows the queue to asynchronously wait for an event to occur (giving the browser time
     * to process pending events, like loading files)
     *
     * @param response object   The queue to process.
     * @param when integer      The number of milliseconds to wait before starting/restarting the processing of the queue.
     */
    setWakeup: function(response, when) {
        if (response.timeout !== null) {
            clearTimeout(response.timeout);
            response.timeout = null;
        }
        response.timout = setTimeout(function() {
            jaxon.ajax.response.process(response);
        }, when);
    },

    /**
     * The function to run after the confirm question, for the comfirmCommands.
     *
     * @param command object    The object to track the retry count for.
     * @param count integer     The number of commands to skip.
     * @param skip boolean      Skip the commands or not.
     *
     * @returns boolean
     */
    confirmCallback: function(command, count, skip) {
        if(skip === true) {
            // The last entry in the queue is not a user command.
            // Thus it cannot be skipped.
            while (count > 0 && command.response.count > 1 &&
                jaxon.tools.queue.pop(command.response) !== null) {
                --count;
            }
        }
        // Run a different command depending on whether this callback executes
        // before of after the confirm function returns;
        if(command.requeue === true) {
            // Before => the processing is delayed.
            jaxon.cmd.delay.setWakeup(command.response, 30);
        } else {
            // After => the processing is executed.
            jaxon.ajax.response.process(command.response);
        }
    },

    /**
     * Ask a confirm question and skip the specified number of commands if the answer is ok.
     *
     * The processing of the queue after the question is delayed so it occurs after this function returns.
     * The 'command.requeue' attribute is used to determine if the confirmCallback is called
     * before (when using the blocking confirm() function) or after this function returns.
     * @see confirmCallback
     *
     * @param command object    The object to track the retry count for.
     * @param question string   The question to ask to the user.
     * @param count integer     The number of commands to skip.
     *
     * @returns boolean
     */
    confirm: function(command, count, question) {
        // This will be checked in the callback.
        command.requeue = true;
        jaxon.ajax.message.confirm(question, '', function() {
            jaxon.cmd.delay.confirmCallback(command, count, false);
        }, function() {
            jaxon.cmd.delay.confirmCallback(command, count, true);
        });
        // This command must not be processed again.
        command.requeue = false;
        return false;
    }
};
