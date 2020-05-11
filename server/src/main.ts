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

        // '/i' is a shorthand
        this.expWrapper.armEndpoint(
            'POST',
            '/i',
            JenkinsToCCIResponder.convertJenkinsfileToConfigYml
        );
        // /i/do is also a shorthand
        this.expWrapper.armEndpoint(
            'POST',
            '/i/do',
            JenkinsToCCIResponder.convertJenkinsfileToConfigYml
        );
        this.expWrapper.armEndpoint(
            'POST',
            '/i/to-config-yml',
            JenkinsToCCIResponder.convertJenkinsfileToConfigYml
        );

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
