module.exports = {
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
