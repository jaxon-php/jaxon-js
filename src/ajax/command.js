/**
 * Class: jaxon.ajax.command
 *
 * global: jaxon
 */

(function(self, config, attr, cbk, queue, dom, types) {
    /**
     * An array that is used internally in the jaxon.fn.handler object to keep track
     * of command handlers that have been registered.
     *
     * @var {object}
     */
    const handlers = {};

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
    self.call = (name, args, context) => {
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
     * @param {object} context The response command to be executed.
     *
     * @returns {true} The command completed successfully.
     */
    self.execute = (context) => {
        const { command: { name, args = {}, component = {} } } = context;
        if (!self.isRegistered({ name })) {
            console.error('Trying to execute unknown command: ' + JSON.stringify({ name, args }));
            return true;
        }

        // If the command has an "id" attr, find the corresponding dom node.
        if ((component.name)) {
            context.target = attr.node(component.name, component.item);
            if (!context.target) {
                console.error('Unable to find component node: ' + JSON.stringify(component));
            }
        }
        if (!context.target && (args.id)) {
            context.target = dom.$(args.id);
            if (!context.target) {
                console.error('Unable to find node with id : ' + args.id);
            }
        }

        // Process the command
        self.call(name, args, context);
        return true;
    };

    /**
     * Process a single command
     * 
     * @param {object} context The response command to process
     *
     * @returns {boolean}
     */
    const processCommand = (context) => {
        try {
            self.execute(context);
            return true;
        } catch (e) {
            console.log(e);
        }
        return false;
    };

    /**
     * While entries exist in the queue, pull and entry out and process it's command.
     * When oQueue.paused is set to true, the processing is halted.
     *
     * Note:
     * - Set oQueue.paused to false and call this function to cause the queue processing to continue.
     * - When an exception is caught, do nothing; if the debug module is installed, it will catch the exception and handle it.
     *
     * @param {object} oQueue A queue containing the commands to execute.
     * @param {integer=0} skipCount The number of commands to skip before starting.
     *
     * @returns {void}
     */
    self.processQueue = (oQueue, skipCount = 0) => {
        // Skip commands.
        // The last entry in the queue is not a user command, thus it cannot be skipped.
        while (skipCount > 0 && oQueue.count > 1 && queue.pop(oQueue) !== null) {
            --skipCount;
        }

        let context = null;
        oQueue.paused = false;
        // Stop processing the commands if the queue is paused.
        while (!oQueue.paused && (context = queue.pop(oQueue)) !== null) {
            if (!processCommand(context)) {
                return;
            }
        }
    };

    /**
     * Pause the the commands processing, and restart after running a provided callback.
     *
     * The provided callback will be passed another callback to call to restart the processing.
     *
     * @param {object} oQueue A queue containing the commands to execute.
     * @param {function} fCallback The callback to call.
     *
     * @return {true}
     */
    self.pause = (oQueue, fCallback) => {
        oQueue.paused = true;
        fCallback((skipCount = 0) => self.processQueue(oQueue, skipCount));
    };

    /**
     * Queue and process the commands in the response.
     *
     * @param {object} oRequest The request context object.
     *
     * @return {true}
     */
    self.processCommands = (oRequest) => {
        const { response: { content } = {} } = oRequest;
        if (!types.isObject(content)) {
            return;
        }

        const { debug: { message } = {}, jxn: { commands = [] } = {} } = content;
        message && console.log(message);

        cbk.execute(oRequest, 'onProcessing');

        // Create a queue for the commands in the response.
        const oQueue = queue.create(config.commandQueueSize);
        oQueue.sequence = 0;
        commands.forEach(command => queue.push(oQueue, {
            sequence: oQueue.sequence++,
            command: {
                name: '*unknown*',
                ...command,
            },
            request: oRequest,
            queue: oQueue,
        }));
        // Add a last command to clear the queue
        queue.push(oQueue, {
            sequence: oQueue.sequence,
            command: {
                name: 'response.complete',
                fullName: 'Response Complete',
            },
            request: oRequest,
            queue: oQueue,
        });

        self.processQueue(oQueue);
    };
})(jaxon.ajax.command, jaxon.config, jaxon.parser.attr, jaxon.ajax.callback,
    jaxon.utils.queue, jaxon.utils.dom, jaxon.utils.types);
