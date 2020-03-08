/**
 * Abstract of a single stanza of configs
 */
class ConfigStanza {
    /**
     * @type {string[]}
     */
    comments;

    constructor() {
        this.comments = [];
    }
}

export { ConfigStanza };
