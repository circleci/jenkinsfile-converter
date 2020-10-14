import { ExpressWrapper } from './ExpressWrapper';

import { VersionNumberResponder } from './responders/VersionNumberResponder';
import { JenkinsToCCIResponder } from './responders/JenkinsToCCIResponder';

class MainApp {
    public expWrapper = new ExpressWrapper();

    constructor() {
        this.armResponders();
    }

    public startListening() {
        return this.expWrapper
            .startListening()
            .catch(console.error.bind(console));
    }

    private armResponders() {
        this.expWrapper.armEndpoint(
            'GET',
            '/',
            VersionNumberResponder.getVersion
        );

        // Show Web UI
        this.expWrapper.armEndpoint('GET', '/i', JenkinsToCCIResponder.webUI);

        // Convert Jenkinsfile to config.yml
        this.expWrapper.armEndpoint(
            'POST',
            '/i',
            JenkinsToCCIResponder.convertJenkinsfileToConfigYml
        );

        // Debugging: Convert Jenkinsfile to its JSON notation
        this.expWrapper.armEndpoint(
            'POST',
            '/i/to-json',
            JenkinsToCCIResponder.convertJenkinsfileToJSON
        );
    }
}

const mainPromise: Promise<
    ExpressWrapper['httpServers']
> = new MainApp().startListening().catch(console.error.bind(console));

export { mainPromise };
