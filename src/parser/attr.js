/**
 * Class: jaxon.parser.attr
 *
 * Process Jaxon custom HTML attributes
 *
 * global: jaxon
 */

(function(self, event) {
    /**
     * The DOM nodes associated to Jaxon components
     *
     * @var {object}
     */
    const xBindings = {
        nodes: {},
    };

    /**
     * The default component item name
     *
     * @var {string}
     */
    const sDefaultComponentItem = 'main';

    /**
     * Reset the DOM nodes bindings.
     *
     * @returns {void}
     */
    self.reset = () => xBindings.nodes = {};

    /**
     * Find the DOM nodes with a given attribute
     *
     * @param {Element} xContainer A DOM node
     * @param {string} sAttr The attribute to check for
     * @param {bool} bScopeIsOuter Also check the outer element
     *
     * @returns {array}
     */
    const findNodesWithAttr = (xContainer, sAttr, bScopeIsOuter) => {
        // Some js functions return nodes without the querySelectorAll() function.
        if (!xContainer.querySelectorAll) {
            return [];
        }

        // When using the outerHTML attribute, the container node may also be returned.
        const aNodes = Array.from(xContainer.querySelectorAll(`:scope [${sAttr}]`));
        return bScopeIsOuter && xContainer.hasAttribute(sAttr) ? [xContainer, ...aNodes] : aNodes;
    };

    /**
     * @param {Element} xContainer A DOM node.
     * @param {bool} bScopeIsOuter Process the outer HTML content
     *
     * @returns {void}
     */
    const setClickHandlers = (xContainer, bScopeIsOuter) =>
        findNodesWithAttr(xContainer, 'jxn-click', bScopeIsOuter)
            .forEach(xNode => {
                const oHandler = JSON.parse(xNode.getAttribute('jxn-click'));
                event.setEventHandler({ event: 'click', func: oHandler }, { target: xNode });
            });

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
        // Set the event handler on the node.
        event.setEventHandler({ event: sEvent, func: oHandler }, { target: xTarget });
    };

    /**
     * @param {Element} xContainer A DOM node.
     * @param {bool} bScopeIsOuter Process the outer HTML content
     *
     * @returns {void}
     */
    const setEventHandlers = (xContainer, bScopeIsOuter) =>
        findNodesWithAttr(xContainer, 'jxn-on', bScopeIsOuter)
            .forEach(xNode => setEventHandler(xNode, xNode, 'jxn-on'));

    /**
     * @param {Element} xParent The parent node
     * @param {string} sSelector The child selector
     * @param {string} sEvent The event name
     * @param {object} oHandler The event handler
     *
     * @returns {void}
     */
    const setChildEventHandler = (xParent, sSelector, sEvent, oHandler) => {
        xParent.querySelectorAll(`:scope ${sSelector}`).forEach(xChild => {
            // Set the event handler on the child node.
            event.setEventHandler({ event: sEvent, func: oHandler }, { target: xChild });
        });
    };

    /**
     * @param {Element} xContainer A DOM node.
     * @param {bool} bScopeIsOuter Process the outer HTML content
     *
     * @returns {void}
     */
    const setChildEventHandlers = (xContainer, bScopeIsOuter) =>
        findNodesWithAttr(xContainer, 'jxn-event', bScopeIsOuter)
            .forEach(xTarget => {
                const aEvents = JSON.parse(xTarget.getAttribute('jxn-event'));
                aEvents?.forEach(({ select, event, handler }) => {
                    setChildEventHandler(xTarget, select, event, handler);
                });
            });

    /**
     * @param {Element} xNode A DOM node.
     * @param {string} sComponentName The component name
     * @param {string=} sComponentItem The component item
     *
     * @returns {void}
     */
    self.bind = (xNode, sComponentName, sComponentItem) => {
        if (!sComponentItem) {
            sComponentItem = sDefaultComponentItem;
        }
        xBindings.nodes[`${sComponentName}_${sComponentItem}`] = xNode;
    };

    /**
     * @param {Element} xContainer A DOM node.
     * @param {bool} bScopeIsOuter Process the outer HTML content
     *
     * @returns {void}
     */
    const bindNodesToComponents = (xContainer, bScopeIsOuter) =>
        findNodesWithAttr(xContainer, 'jxn-bind', bScopeIsOuter).forEach(xNode =>
            self.bind(xNode, xNode.getAttribute('jxn-bind'), xNode.getAttribute('jxn-item')));

    /**
     * Process the custom attributes in a given DOM node.
     *
     * @param {Element} xContainer A DOM node.
     * @param {bool} bScopeIsOuter Process the outer HTML content
     *
     * @returns {void}
     */
    self.process = (xContainer = document, bScopeIsOuter = false) => {
        // Set event handlers on nodes
        setChildEventHandlers(xContainer, bScopeIsOuter);
        // Set event handlers on nodes
        setEventHandlers(xContainer, bScopeIsOuter);
        // Set event handlers on nodes
        setClickHandlers(xContainer, bScopeIsOuter);
        // Attach DOM nodes to Jaxon components
        bindNodesToComponents(xContainer, bScopeIsOuter);
    };

    /**
     * Find the DOM node a given component is bound to.
     *
     * @param {string} sComponentName The component name.
     * @param {string} sComponentItem The component item.
     *
     * @returns {Element|null}
     */
    const findComponentNode = (sComponentName, sComponentItem) => {
        const sSelector = `[jxn-bind="${sComponentName}"][jxn-item="${sComponentItem}"]`;
        const xNode = document.querySelector(sSelector);
        if (xNode !== null) {
            xBindings.nodes[`${sComponentName}_${sComponentItem}`] = xNode;
        }
        return xNode;
    };

    /**
     * Get the DOM node of a given component.
     *
     * @param {string} sComponentName The component name.
     * @param {string=} sComponentItem The component item.
     *
     * @returns {Element|null}
     */
    self.node = (sComponentName, sComponentItem = sDefaultComponentItem) => {
        const xComponent = xBindings.nodes[`${sComponentName}_${sComponentItem}`] ?? null;
        if (xComponent !== null && xComponent.isConnected) {
            return xComponent;
        }

        if (xComponent !== null) {
            // The component is no more bound to the DOM
            delete xBindings.nodes[`${sComponentName}_${sComponentItem}`];
        }
        // Try to find the component
        return findComponentNode(sComponentName, sComponentItem);
    };
})(jaxon.parser.attr, jaxon.cmd.event);
