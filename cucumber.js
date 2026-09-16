// cucumber.js
module.exports = {
    default: {
        requireModule: ['ts-node/register'],
        require: ['tests/features/**/*.ts'],
        format: ['progress', 'html:reports/cucumber-report.html'],
    }
};