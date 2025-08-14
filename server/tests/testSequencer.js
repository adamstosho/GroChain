const TestSequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends TestSequencer {
  sort(tests) {
    // Run unit tests first, then integration tests
    return tests.sort((testA, testB) => {
      const isIntegrationA = testA.path.includes('integration');
      const isIntegrationB = testB.path.includes('integration');
      
      if (isIntegrationA && !isIntegrationB) return 1;
      if (!isIntegrationA && isIntegrationB) return -1;
      
      return 0;
    });
  }
}

module.exports = CustomSequencer;
