module.exports = {
    globals: {
        'ts-jest': {
            tsConfig: {
                noImplicitAny: false
            }
        }
    },
    preset: 'ts-jest',
    reporters: [
        'default',
        [
            'jest-junit',
            { outputDirectory: 'test-results/jest', addFileAttribute: true }
        ]
    ],
    testEnvironment: 'node'
};
