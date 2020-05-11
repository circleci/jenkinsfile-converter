import { VersionNumberService } from './VersionNumberService';

describe('VersionNumberService', () => {
    test('default', () => {
        expect(new VersionNumberService().versionNumber).toBe('local');
    });

    test('custom', () => {
        const customVersionString = 'jest';

        Object.defineProperty(global, '__BUILD_VERSION', {
            value: customVersionString
        });
        expect(new VersionNumberService().versionNumber).toBe(
            customVersionString
        );
    });
});
