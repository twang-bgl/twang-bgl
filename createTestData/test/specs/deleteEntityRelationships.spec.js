const fs = require('fs');
const { context } = require('../data/context');
const testUtil = require('../lib/test-util.js');
const firmUtil = require('../lib/firm-util.js');

console.log('Get Test Config Data');
testUtil.getTestConfigFromLocal();

describe(`delete entity relationships in [${context.TestConfig.firm}]`, function () {
  this.bail();
  before(async function () {
    console.log('Get Test Parameters From AWS');
    await testUtil.initTest();

    console.log(`Getting Cognito ID token for user ${context.TestConfig.username}`);
    await testUtil.generateIdToken();

    console.log(`Logging in to firm ${context.TestConfig.firm}`);
    await firmUtil.login(context.TestConfig.firm);

  });

  it('delete entity relationships', async function () {
    console.log('deleting entity relationships ......');
    const RELATIONSHIP_DATA_FILE = './test/data/relationship.json';
    let relationshipIdArray = [];
    if (fs.existsSync(RELATIONSHIP_DATA_FILE)) relationshipIdArray = require('../data/relationship.json');

    for (let x = 0; x < relationshipIdArray.length; x += 1) {
      try {
        await firmUtil.deleteEntityRelationship(relationshipIdArray[x].relationshipId);
      }
      catch (error) {
        console.log(`----->${error}<-----`);
        continue;

      }
    }
    fs.writeFileSync(RELATIONSHIP_DATA_FILE, JSON.stringify(relationshipIdArray, null, 2), 'utf8');
  });

});