const { TestConfig } = require('../lib/test-util');
const TestSettings = require('../../test-settings.json');

module.exports.context = {
    TestConfig,
    TestSettings
};