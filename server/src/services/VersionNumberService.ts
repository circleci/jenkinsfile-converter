declare const __BUILD_VERSION: string;

class VersionNumberService {
    public readonly versionNumber: string =
        typeof __BUILD_VERSION === typeof '' ? __BUILD_VERSION : 'local';
}

export { VersionNumberService };
