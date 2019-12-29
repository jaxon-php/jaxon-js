jaxon.tools.queue = {
    /**
     * Construct and return a new queue object.
     *
     * @param integer size The number of entries the queue will be able to hold.
     *
     * @returns object
     */
    create: function(size) {
        return {
            start: 0,
            count: 0,
            size: size,
            end: 0,
            elements: [],
            timeout: null
        }
    },

    /**
     * Check id a queue is empty.
     *
     * @param object oQueue The queue to check.
     *
     * @returns boolean
     */
    empty: function(oQueue) {
        return (oQueue.count <= 0);
    },

    /**
     * Check id a queue is empty.
     *
     * @param object oQueue The queue to check.
     *
     * @returns boolean
     */
    full: function(oQueue) {
        return (oQueue.count >= oQueue.size);
    },

    /**
     * Push a new object into the tail of the buffer maintained by the specified queue object.
     *
     * @param object oQueue The queue in which you would like the object stored.
     * @param object obj    The object you would like stored in the queue.
     *
     * @returns integer The number of entries in the queue.
     */
    push: function(oQueue, obj) {
        // No push if the queue is full.
        if(jaxon.tools.queue.full(oQueue)) {
            throw { code: 10003 };
        }

        oQueue.elements[oQueue.end] = obj;
        if(++oQueue.end >= oQueue.size) {
            oQueue.end = 0;
        }
        return ++oQueue.count;
    },

    /**
     * Push a new object into the head of the buffer maintained by the specified queue object.
     *
     * This effectively pushes an object to the front of the queue... it will be processed first.
     *
     * @param object oQueue The queue in which you would like the object stored.
     * @param object obj    The object you would like stored in the queue.
     *
     * @returns integer The number of entries in the queue.
     */
    pushFront: function(oQueue, obj) {
        // No push if the queue is full.
        if(jaxon.tools.queue.full(oQueue)) {
            throw { code: 10003 };
        }

        // Simply push if the queue is empty
        if(jaxon.tools.queue.empty(oQueue)) {
            return jaxon.tools.queue.push(oQueue, obj);
        }

        // Put the object one position back.
        if(--oQueue.start < 0) {
            oQueue.start = oQueue.size - 1;
        }
        oQueue.elements[oQueue.start] = obj;
        return ++oQueue.count;
    },

    /**
     * Attempt to pop an object off the head of the queue.
     *
     * @param object oQueue The queue object you would like to modify.
     *
     * @returns object|null
     */
    pop: function(oQueue) {
        if(jaxon.tools.queue.empty(oQueue)) {
            return null;
        }

        let obj = oQueue.elements[oQueue.start];
        delete oQueue.elements[oQueue.start];
        if(++oQueue.start >= oQueue.size) {
            oQueue.start = 0;
        }
        oQueue.count--;
        return obj;
    },

    /**
     * Attempt to pop an object off the head of the queue.
     *
     * @param object oQueue The queue object you would like to modify.
     *
     * @returns object|null
     */
    peek: function(oQueue) {
        if(jaxon.tools.queue.empty(oQueue)) {
            return null;
        }
        return oQueue.elements[oQueue.start];
    }
};
