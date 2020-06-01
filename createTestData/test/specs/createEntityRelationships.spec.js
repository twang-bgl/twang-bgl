const fs = require('fs');
const { context } = require('../data/context');
const testUtil = require('../lib/test-util.js');
const firmUtil = require('../lib/firm-util.js');
const { entityRelationships } = context.TestSettings;


const entityPositionSMSF = ['EX_SMSF_Accountant', 'EX_SMSF_Auditor', 'EX_SMSF_Fund_Contact', 'EX_SMSF_Tax_Agent', 'Trustee',
  'Partner', 'EX_SMSF_Actuary', 'EX_SMSF_Advisor', 'EX_SMSF_Bookkeeper', 'EX_SMSF_Administrator', 'EX_SMSF_Authorised_Representative',
  'EX_SMSF_Custodian', 'Director', 'EX_SMSF_Employer_Sponsor', 'EX_SMSF_External_Administrator', 'Financial_Planner', 'EX_SMSF_Firm_Contact',
  'EX_SMSF_Investment_Advisor', 'EX_SMSF_Firm_Manager', 'EX_SMSF_Lawyer', 'EX_ComOther', 'EX_SMSF_Personal_Representative',
  'EX_SMSF_Representative', 'EX_SMSF_Expert', 'Secretary'];

const entityPositionBillableTrust = ['EX_SMSF_Accountant', 'EX_SMSF_Fund_Contact', 'EX_SMSF_Tax_Agent', 'Trustee', 'Appointer_Trustee', 'Settlor',
  'Beneficiary', 'EX_SMSF_Administrator', 'EX_SMSF_Advisor', 'EX_SMSF_Auditor', 'EX_SMSF_Authorised_Representative', 'EX_SMSF_Bookkeeper',
  'EX_SMSF_Custodian', 'EX_SMSF_Employer_Sponsor', 'EX_SMSF_External_Administrator', 'Financial_Planner', 'EX_SMSF_Firm_Contact',
  'EX_SMSF_Firm_Manager', 'EX_SMSF_Investment_Advisor', 'EX_SMSF_Lawyer', 'EX_ComOther', 'Partner', 'EX_SMSF_Personal_Representative',
  'EX_SMSF_Representative'];

const entityPositionBillableCompany = ['EX_SMSF_Accountant', 'Director', 'Shareholder', 'EX_SMSF_Representative', 'EX_SMSF_Administrator',
  'EX_SMSF_Advisor', 'EX_ComOther_Agent', 'EX_ComOther_Agents_Representative', 'EX_ComOther_Alternate', 'EX_SMSF_Auditor',
  'EX_SMSF_Authorised_Representative', 'EX_SMSF_Bookkeeper', 'EX_SMSF_Custodian', 'EX_SMSF_Employer_Sponsor', 'EX_SMSF_Fund_Contact',
  'EX_SMSF_External_Administrator', 'Financial_Planner', 'EX_SMSF_Firm_Contact', 'EX_SMSF_Firm_Manager', 'EX_ComOther_Foreign_Agent',
  'EX_ComOther_Foreign_Agents_Representative', 'EX_SMSF_Investment_Advisor', 'EX_SMSF_Lawyer', 'EX_ComOther_Liquidator',
  'EX_ComOther_Members_Representative', 'EX_ComOther_Natural_Person', 'Officer', 'EX_ComOther', 'Partner', 'EX_SMSF_Personal_Representative',
  'EX_ComOther_Persons_Representative', 'EX_ComOther_Public_Officer', 'Secretary', 'EX_SMSF_Tax_Agent', 'Trustee',
  'EX_ComOther_Unitholders_Representative'];

const entityPositionOtherEntity = ['Partner', 'EX_SMSF_Accountant', 'EX_SMSF_Actuary', 'EX_SMSF_Administrator', 'EX_SMSF_Advisor', 'EX_ComOther_Agent',
  'EX_ComOther_Agents_Representative', 'EX_ComOther_Alternate', 'EX_SMSF_Auditor', 'EX_SMSF_Authorised_Representative', 'EX_SMSF_Bookkeeper',
  'EX_SMSF_Custodian', 'Director', 'EX_SMSF_Employer_Sponsor', 'EX_SMSF_Fund_Contact', 'EX_SMSF_External_Administrator', 'Financial_Planner',
  'EX_SMSF_Firm_Contact', 'EX_SMSF_Firm_Manager', 'EX_ComOther_Foreign_Agent', 'EX_ComOther_Foreign_Agents_Representative',
  'EX_SMSF_Investment_Advisor', 'EX_SMSF_Lawyer', 'EX_ComOther_Liquidator', 'EX_ComOther_Members_Representative', 'EX_ComOther_Natural_Person',
  'EX_ComOther', 'EX_SMSF_Personal_Representative', 'EX_ComOther_Persons_Representative', 'EX_ComOther_Public_Officer', 'EX_SMSF_Representative',
  'EX_SMSF_Expert', 'Secretary', 'EX_SMSF_Tax_Agent', 'Trustee', 'EX_ComOther_Unitholders_Representative'];

const entityPositionTrust = ['Trustee', 'UnitHolder', 'EX_SMSF_Accountant', 'EX_SMSF_Administrator', 'EX_SMSF_Advisor', 'Appointer_Trustee',
  'EX_SMSF_Auditor', 'EX_SMSF_Authorised_Representative', 'Beneficiary', 'EX_SMSF_Bookkeeper', 'EX_SMSF_Custodian', 'EX_SMSF_Employer_Sponsor',
  'EX_SMSF_Fund_Contact', 'EX_SMSF_External_Administrator', 'Financial_Planner', 'EX_SMSF_Firm_Contact', 'EX_SMSF_Firm_Manager',
  'EX_SMSF_Investment_Advisor', 'EX_SMSF_Lawyer', 'EX_ComOther', 'Partner', 'EX_SMSF_Personal_Representative', 'EX_SMSF_Representative',
  'Settlor', 'EX_SMSF_Tax_Agent'];

const entityPositionCompany = ['Director', 'Shareholder', 'Secretary', 'EX_SMSF_Accountant', 'EX_SMSF_Administrator', 'EX_SMSF_Advisor',
  'EX_ComOther_Agent', 'EX_ComOther_Agents_Representative', 'EX_ComOther_Alternate', 'EX_SMSF_Auditor', 'EX_SMSF_Authorised_Representative',
  'EX_SMSF_Bookkeeper', 'EX_SMSF_Custodian', 'EX_SMSF_Employer_Sponsor', 'EX_SMSF_Fund_Contact', 'EX_SMSF_External_Administrator',
  'Financial_Planner', 'EX_SMSF_Firm_Contact', 'EX_SMSF_Firm_Manager', 'EX_ComOther_Foreign_Agent', 'EX_ComOther_Foreign_Agents_Representative',
  'EX_SMSF_Investment_Advisor', 'EX_SMSF_Lawyer', 'EX_ComOther_Liquidator', 'EX_ComOther_Members_Representative', 'EX_ComOther_Natural_Person',
  'Officer', 'EX_ComOther', 'Partner', 'EX_SMSF_Personal_Representative', 'EX_ComOther_Persons_Representative', 'EX_ComOther_Public_Officer',
  'EX_SMSF_Representative', 'EX_SMSF_Tax_Agent', 'Trustee', 'EX_ComOther_Unitholders_Representative'];

console.log('Get Test Config Data');
testUtil.getTestConfigFromLocal();

describe(`add entity relationships in [${context.TestConfig.firm}]`, function () {
  this.bail();
  before(async function () {
    console.log('Get Test Parameters From AWS');
    await testUtil.initTest();

    console.log(`Getting Cognito ID token for user ${context.TestConfig.username}`);
    await testUtil.generateIdToken();

    console.log(`Logging in to firm ${context.TestConfig.firm}`);
    await firmUtil.login(context.TestConfig.firm);

  });

  // "entityToType": "PersonProxy",
  // "entityToId": "8ad08a08726dbe6601726df09d960002",
  // "entityPosition": ["random","random"],
  // "entityFromType": "SMSF",
  // "relationship": 100
  let fromEntityArray = [];
  let entityPositionArray = [];
  function getEntityRelationshipsData(x) {
    switch (entityRelationships[x].entityFromType) {
      case "Trust":
        entityPositionArray = entityPositionTrust;
        const TRUST_DATA_FILE = './test/data/trust.json';
        if (fs.existsSync(TRUST_DATA_FILE)) fromEntityArray = require('../data/trust.json');
        else throw new Error(`${TRUST_DATA_FILE} not existed!`);
        break
      case "Company":
        entityPositionArray = entityPositionCompany;
        const COMPANY_DATA_FILE = './test/data/company.json';
        if (fs.existsSync(COMPANY_DATA_FILE)) fromEntityArray = require('../data/company.json');
        else throw new Error(`${COMPANY_DATA_FILE} not existed!`);
        break
      case "OtherEntity":
        entityPositionArray = entityPositionOtherEntity;
        const OTHERENTITY_DATA_FILE = './test/data/otherEntity.json';
        if (fs.existsSync(OTHERENTITY_DATA_FILE)) fromEntityArray = require('../data/otherEntity.json');
        else throw new Error(`${OTHERENTITY_DATA_FILE} not existed!`);
        break
      case "SMSF":
        entityPositionArray = entityPositionSMSF;
        const SMSF_DATA_FILE = './test/data/smsf.json';
        if (fs.existsSync(SMSF_DATA_FILE)) fromEntityArray = require('../data/smsf.json');
        else throw new Error(`${SMSF_DATA_FILE} not existed!`);
        break
      case "BillableTrust":
        entityPositionArray = entityPositionBillableTrust;
        const BILLABLETRUST_DATA_FILE = './test/data/billableTrust.json';
        if (fs.existsSync(BILLABLETRUST_DATA_FILE)) fromEntityArray = require('../data/billableTrust.json');
        else throw new Error(`${BILLABLETRUST_DATA_FILE} not existed!`);
        break
      case "BillableCompany":
        entityPositionArray = entityPositionBillableCompany;
        const BILLABLECOMPANY_DATA_FILE = './test/data/billableCompany.json';
        if (fs.existsSync(BILLABLECOMPANY_DATA_FILE)) fromEntityArray = require('../data/billableCompany.json');
        else throw new Error(`${BILLABLECOMPANY_DATA_FILE} not existed!`);
        break
      default:
        throw new Error(`Invalid entityFromType: ${entityRelationships[x].entityFromType}`);
    }
  }

  function createRelationshipPayload(x, y) {
    const payloadArray = [];
    let entityPositionArrayCopy = entityPositionArray.slice();
    entityRelationships[x].entityPosition.forEach((ePosition) => {
      let entityPosition = '';
      if (ePosition == 'random') {
        entityPosition = entityPositionArrayCopy.splice(Math.floor(Math.random() * entityPositionArrayCopy.length), 1).toString();
      } else entityPosition = ePosition;
      payloadArray.push({
        entityToType: entityRelationships[x].entityToType,
        entityToId: entityRelationships[x].entityToId,
        entityPosition: entityPosition,
        entityFromType: entityRelationships[x].entityFromType,
        entityFromId: fromEntityArray[y].id
      })
    })
    return payloadArray;
  }

  it('add entity relationships', async function () {
    console.log('creating entity relationships ......');
    const RELATIONSHIP_DATA_FILE = './test/data/relationship.json';
    let relationshipIdArray = [];
    if (fs.existsSync(RELATIONSHIP_DATA_FILE)) relationshipIdArray = require('../data/relationship.json');
    
    for (let x = 0; x < entityRelationships.length; x += 1) {
      getEntityRelationshipsData(x);
      for (let y = 0; y < entityRelationships[x].relationship; y += 1) {
        let payloadArray = createRelationshipPayload(x, y);
        for (let z = 0; z < payloadArray.length; z += 1) {
          // console.log("payloadArray", JSON.stringify(payloadArray[z]))
          try {
            relationshipId = await firmUtil.addEntityRelationship(payloadArray[z]);
          }
          catch (error) {
            console.log(`----->${error}<-----`);
            continue;
          }
          payloadArray[z].relationshipId = relationshipId;
          relationshipIdArray.push(payloadArray[z]);
        }
      }
    }
    fs.writeFileSync(RELATIONSHIP_DATA_FILE, JSON.stringify(relationshipIdArray, null, 2), 'utf8');
  });

});