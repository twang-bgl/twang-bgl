const faker = require('faker');
const fs = require('fs');
const { context } = require('../data/context');
const testUtil = require('../lib/test-util.js');
const firmUtil = require('../lib/firm-util.js');
const { entitySetup } = context.TestSettings;

const titles = ['Miss', 'Mrs', 'Mr', 'Ms', 'Dr', 'Mstr'];
const sex = 'MALE';
const mobileNumber = '61432112345';
const ACN = '000 000 019';
const states = ['AUSTRALIAN_CAPITAL_TERRITORY', 'NEW_SOUTH_WALES', 'VICTORIA', 'QUEENSLAND',
  'SOUTH_AUSTRALIA', 'WESTERN_AUSTRALIA', 'TASMANIA', 'NORTHERN_TERRITORY'];
const country = 'AUSTRALIA';
const tustTypes = ['Discretionary', 'Unit', 'Hybrid', 'Testamentary', 'Bare', 'Business', 'PrivateAncillary'];

function dateBetweenDDMMYYYY(from, to) {
  let Date = faker.date.between(from, to).toLocaleDateString();
  let dd = Date.split('/')[1];
  if (dd.length == 1) dd = '0' + dd;
  let mm = Date.split('/')[0];
  if (mm.length == 1) mm = '0' + mm;
  let yyyy = Date.split('/')[2];
  return `${dd}/${mm}/${yyyy}`;
}

function dateBetweenWithTime(from, to) {
  let Date = faker.date.between(from, to).toISOString();
  Date = Date.split('T')[0];
  return `${Date}T00:00:00.000+0000`;
}

function createPersonPayload() {
  return {
    entityType: 'PersonProxy',
    title: titles[Math.floor(Math.random() * titles.length)],
    firstname: faker.name.firstName(),
    surname: faker.name.lastName(),
    sex: sex,
    email: faker.internet.email(),
    phone: faker.phone.phoneNumberFormat(),
    mobileNumber: mobileNumber,
    birthday: dateBetweenDDMMYYYY('1955-01-01', '1985-01-01'),
    streetLine1: faker.address.streetAddress(),
    suburb: faker.address.city(),
    state: states[Math.floor(Math.random() * states.length)],
    postCode: Math.floor(1000 + Math.random() * 9000),
    country: country
  }
}

function createContactPayload(contactType) {
  return {
    entityType: contactType,
    name: faker.company.companyName(),
    streetLine1: faker.address.streetAddress(),
    suburb: faker.address.city(),
    state: states[Math.floor(Math.random() * states.length)],
    postCode: Math.floor(1000 + Math.random() * 9000),
    country: country,
    email: faker.internet.email(),
    phone: faker.phone.phoneNumberFormat(),
    acn: ACN,
    estDate: dateBetweenDDMMYYYY('1995-01-01', '2015-01-01'),

  }
}

async function createEntityPayload(entityType) {
  const entityName = faker.company.companyName();
  const entityCode = await firmUtil.getUniqueEntityCode(entityName);
  return {
    entityType: entityType,
    entityName: entityName,
    entityCode: entityCode,
    estDate: dateBetweenWithTime('2005-01-01', '2015-01-01'),
    financialYearFrom: '2019-07-01T00:00:00.000+0000',
    financialYearTo: '2020-06-30T00:00:00.000+0000',
    trustType: tustTypes[Math.floor(Math.random() * tustTypes.length)],
  }
}

console.log('Get Test Config Data');
testUtil.getTestConfigFromLocal();

describe(`add test data in [${context.TestConfig.firm}]`, function () {
  this.bail();
  before(async function () {
    console.log('Get Test Parameters From AWS');
    await testUtil.initTest();

    console.log(`Getting Cognito ID token for user ${context.TestConfig.username}`);
    await testUtil.generateIdToken();

    console.log(`Logging in to firm ${context.TestConfig.firm}`);
    await firmUtil.login(context.TestConfig.firm);

  });

  it('add person', async function () {
    if (entitySetup.person > 0) {
      console.log('creating person ......');
      const PERSON_DATA_FILE = './test/data/person.json';
      let personArray = [];
      if (fs.existsSync(PERSON_DATA_FILE)) personArray = require('../data/person.json');
      for (let i = 0; i < entitySetup.person; i += 1) {
        const person = createPersonPayload();
        try {
          person.id = await firmUtil.addPerson(person);
        }
        catch (error) {
          console.log(error);
          continue;
        }
        personArray.push(person);
      }
      fs.writeFileSync(PERSON_DATA_FILE, JSON.stringify(personArray, null, 2), 'utf8');
    }
  });
  it('add trust', async function () {
    if (entitySetup.trust > 0) {
      console.log('creating trust ......');
      const TRUST_DATA_FILE = './test/data/trust.json';
      let trustArray = [];
      if (fs.existsSync(TRUST_DATA_FILE)) trustArray = require('../data/trust.json');
      for (let i = 0; i < entitySetup.trust; i += 1) {
        const trust = createContactPayload('Trust');
        try {
          trust.id = await firmUtil.addContact(trust);
        }
        catch (error) {
          console.log(error);
          continue;
        }
        trustArray.push(trust);
      }
      fs.writeFileSync(TRUST_DATA_FILE, JSON.stringify(trustArray, null, 2), 'utf8');
    }
  });
  it('add company', async function () {
    if (entitySetup.company > 0) {
      console.log('creating company ......');
      const COMPANY_DATA_FILE = './test/data/company.json';
      let companyArray = [];
      if (fs.existsSync(COMPANY_DATA_FILE)) companyArray = require('../data/company.json');
      for (let i = 0; i < entitySetup.company; i += 1) {
        const company = createContactPayload('Company');
        try {
          company.id = await firmUtil.addContact(company);
        }
        catch (error) {
          console.log(error);
          continue;
        }
        companyArray.push(company);
      }
      fs.writeFileSync(COMPANY_DATA_FILE, JSON.stringify(companyArray, null, 2), 'utf8');
    }
  });
  it('add otherEntity', async function () {
    if (entitySetup.otherEntity > 0) {
      console.log('creating otherEntity ......');
      const OTHERENTITY_DATA_FILE = './test/data/otherEntity.json';
      let otherEntityArray = [];
      if (fs.existsSync(OTHERENTITY_DATA_FILE)) otherEntityArray = require('../data/otherEntity.json');
      for (let i = 0; i < entitySetup.otherEntity; i += 1) {
        const otherEntity = createContactPayload('OtherEntity');
        try {
          otherEntity.id = await firmUtil.addContact(otherEntity);
        }
        catch (error) {
          console.log(error);
          continue;
        }
        otherEntityArray.push(otherEntity);
      }
      fs.writeFileSync(OTHERENTITY_DATA_FILE, JSON.stringify(otherEntityArray, null, 2), 'utf8');
    }
  });

  it('add smsf', async function () {
    if (entitySetup.smsf > 0) {
      console.log('creating smsf ......');
      const SMSF_DATA_FILE = './test/data/smsf.json';
      let smsfArray = [];
      if (fs.existsSync(SMSF_DATA_FILE)) smsfArray = require('../data/smsf.json');
      for (let i = 0; i < entitySetup.smsf; i += 1) {
        let smsf;
        try {
          smsf = await createEntityPayload('SMSF');
          smsf.id = await firmUtil.addEntity(smsf);
        }
        catch (error) {
          console.log(error);
          continue;
        }
        smsfArray.push(smsf);
      }
      fs.writeFileSync(SMSF_DATA_FILE, JSON.stringify(smsfArray, null, 2), 'utf8');
    }
  });
  it('add billableTrust', async function () {
    if (entitySetup.billableTrust > 0) {
      console.log('creating billableTrust ......');
      const BILLABLETRUST_DATA_FILE = './test/data/billableTrust.json';
      let billableTrustArray = [];
      if (fs.existsSync(BILLABLETRUST_DATA_FILE)) billableTrustArray = require('../data/billableTrust.json');
      for (let i = 0; i < entitySetup.billableTrust; i += 1) {
        let billableTrust;
        try {
          billableTrust = await createEntityPayload('BillableTrust');
          billableTrust.id = await firmUtil.addEntity(billableTrust);
        }
        catch (error) {
          console.log(error);
          continue;
        }
        billableTrustArray.push(billableTrust);
      }
      fs.writeFileSync(BILLABLETRUST_DATA_FILE, JSON.stringify(billableTrustArray, null, 2), 'utf8');
    }
  });

  it('add billableCompany', async function () {
    if (entitySetup.billableCompany > 0) {
      console.log('creating billableCompany ......');
      const BILLABLECOMPANY_DATA_FILE = './test/data/billableCompany.json';
      let billableCompanyArray = [];
      if (fs.existsSync(BILLABLECOMPANY_DATA_FILE)) billableCompanyArray = require('../data/billableCompany.json');
      for (let i = 0; i < entitySetup.billableCompany; i += 1) {
        let billableCompany;
        try {
          billableCompany = await createEntityPayload('BillableCompany');
          billableCompany.id = await firmUtil.addEntity(billableCompany);
        }
        catch (error) {
          console.log(error);
          continue;
        }
        billableCompanyArray.push(billableCompany);
      }
      fs.writeFileSync(BILLABLECOMPANY_DATA_FILE, JSON.stringify(billableCompanyArray, null, 2), 'utf8');
    }
  });
});