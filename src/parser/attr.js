/**
 * Class: jaxon.parser.attr
 *
 * Process Jaxon custom HTML attributes
 *
 * global: jaxon
 */

(function(self, event, debug) {
    /**
     * The DOM nodes associated to Jaxon components
     *
     * @var {object}
     */
    const xComponentNodes = {};

    /**
     * The default component item name
     *
     * @var {string}
     */
    const sDefaultComponentItem = 'main';

    /**
     * The commands to check for changes
     *
     * @var {array}
     */
    const aCommands = ['node.assign', 'node.append', 'node.prepend', 'node.replace'];

    /**
     * The attributes to check for changes
     *
     * @var {array}
     */
    const aAttributes = ['innerHTML', 'outerHTML'];

    /**
     * Check if a the attributes on a targeted node must be processed after a command is executed.
     *
     * @param {Element} xTarget A DOM node.
     * @param {string} sCommand The command name.
     * @param {string} sAttribute The attribute name.
     *
     * @returns {void}
     */
    self.changed = (xTarget, sCommand, sAttribute) => (xTarget) &&
        aAttributes.some(sVal => sVal === sAttribute) && aCommands.some(sVal => sVal === sCommand);

    /**
     * @param {Element} xContainer A DOM node.
     *
     * @returns {void}
     */
    const setClickHandlers = (xContainer) => {
        xContainer.querySelectorAll(':scope [jxn-click]').forEach(xNode => {
            const oHandler = JSON.parse(xNode.getAttribute('jxn-click'));
            event.setEventHandler({ event: 'click', func: oHandler }, { target: xNode });
        });
    };

    /**
     * @param {Element} xTarget The event handler target.
     * @param {Element} xNode The DOM node with the attributes.
     * @param {string} sAttr The event attribute name
     *
     * @returns {void}
     */
    const setEventHandler = (xTarget, xNode, sAttr) => {
        if(!xNode.hasAttribute('jxn-call'))
        {
            return;
        }

        const sEvent = xNode.getAttribute(sAttr).trim();
        const oHandler = JSON.parse(xNode.getAttribute('jxn-call'));
        if(!xNode.hasAttribute('jxn-select'))
        {
            // Set the event handler on the node.
            event.setEventHandler({ event: sEvent, func: oHandler }, { target: xTarget });
            return;
        }

        // Set the event handler on the selected child nodes.
        const sSelector = xNode.getAttribute('jxn-select').trim();
        xTarget.querySelectorAll(`:scope ${sSelector}`).forEach(xChild => {
            // Set the event handler on the child node.
            event.setEventHandler({ event: sEvent, func: oHandler }, { target: xChild });
        });
    };

    /**
     * @param {Element} xContainer A DOM node.
     *
     * @returns {void}
     */
    const setEventHandlers = (xContainer) => {
        xContainer.querySelectorAll(':scope [jxn-on]').forEach(xNode => {
            setEventHandler(xNode, xNode, 'jxn-on');
        });
    };

    /**
     * @param {Element} xContainer A DOM node.
     *
     * @returns {void}
     */
    const setTargetEventHandlers = (xContainer) => {
        xContainer.querySelectorAll(':scope [jxn-target]').forEach(xTarget => {
            xTarget.querySelectorAll(':scope [jxn-event]').forEach(xNode => {
                // Check event declarations only on direct child.
                if (xNode.parentNode === xTarget) {
                    setEventHandler(xTarget, xNode, 'jxn-event');
                }
            });
        });
    };

    /**
     * @param {Element} xContainer A DOM node.
     *
     * @returns {void}
     */
    const bindNodesToComponents = (xContainer) => {
        xContainer.querySelectorAll(':scope [jxn-bind]').forEach(xNode => {
            const sComponentName = xNode.getAttribute('jxn-bind');
            const sComponentItem = xNode.getAttribute('jxn-item') ?? sDefaultComponentItem;
            xComponentNodes[`${sComponentName}_${sComponentItem}`] = xNode;
        });
    };

    /**
     * Process the custom attributes in a given DOM node.
     *
     * @param {Element} xContainer A DOM node.
     *
     * @returns {void}
     */
    self.process = (xContainer = document) => {
        // Set event handlers on nodes
        setTargetEventHandlers(xContainer);
        // Set event handlers on nodes
        setEventHandlers(xContainer);
        // Set event handlers on nodes
        setClickHandlers(xContainer);
        // Attach DOM nodes to Jaxon components
        bindNodesToComponents(xContainer);
    };

    /**
     * Get the DOM node of a given component.
     *
     * @param {string} sComponentName The component name.
     * @param {string=} sComponentItem The component item.
     *
     * @returns {Element|null}
     */
    self.node = (sComponentName, sComponentItem = sDefaultComponentItem) =>
        xComponentNodes[`${sComponentName}_${sComponentItem}`] ?? null;
})(jaxon.parser.attr, jaxon.cmd.event, jaxon.debug);
