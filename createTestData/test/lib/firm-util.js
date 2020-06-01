const util = require('./util');
const { context } = require('../data/context');

const { axios } = util;
const { expect } = util;

function loginToSSOPromise(firm) {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `${context.TestConfig.ssoURL}/login_token_check?ajax=true&app=sf360&firm=${firm}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${context.TestConfig.userIdToken}`
          }
        }
      )
      .then(response => {
        expect(response.status).to.eql(200, 'SSO Token Login Check');
        axios
          .get(`${context.TestConfig.ssoURL}/selectfirm?app=sf360&firm=${firm}`)
          .then(res => {
            expect(res.status).to.eql(200, 'SSO Select App and Firm');
            expect(res.data).not.to.contain(
              'You need to enable JavaScript to run this app.'
            );
            // context.TestConfig.firm = firm;
            util.cookieJar.getCookies(
              context.TestConfig.serverURL,
              (err, cookies) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(cookies);
                }
              }
            );
          })
          .catch(error => {
            reject(error);
          });
      })
      .catch(error => {
        reject(error);
      });
  });
}

function getAPIParams() {
  return `firm=${context.TestConfig.firm}&uid=${context.TestConfig.uid}`;
}

function getBadgeNamesPromise() {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `${context.TestConfig.serverURL}/d/Badges/getBadgeNames?${getAPIParams()}`,
        context.TestConfig.firm,
        { headers: { 'Content-Type': 'text/plain' } }
      )
      .then(response => {
        expect(response.status).to.eql(200, 'Get badge names');
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

async function getUniqueEntityCode(entityName) {
  const entityCode = (await axios.post(
    `${context.TestConfig.serverURL}/entity/mvc/base/getNextGlobalKey/${entityName}/12?${getAPIParams()}`,
    context.TestConfig.firm, { headers: { 'Content-Type': 'text/plain' } })).data;
  return entityCode;
}

function addEntityPromise(entity) {
  return new Promise((resolve, reject) => {
    getBadgeNamesPromise().then(function (badges) {
      const uid = context.TestConfig.uid;
      expect(badges.length).to.be.at.least(1, `There should be at least one badge`);
      const defaultBadgeId = badges[0].id;
      let payload = {
        product: 'SFUND',
        entityList: [],
        master: {
          entityType: entity.entityType,
          name: entity.entityName,
          portalCode: entity.entityCode,
          badgeId: defaultBadgeId,

          establishmentDate: entity.estDate,
          yearFrom: entity.financialYearFrom,
          yearTo: entity.financialYearTo,
          type: 'fund'
        }
      }
      if (entity.entityType == 'BillableTrust') {
        if (entity.trustType != null) payload.master.billableTrustType = entity.trustType;
        else payload.master.billableTrustType = 'Discretionary';
      }

      axios
        .post(
          `${context.TestConfig.serverURL}/d/Entities/addEntity?${getAPIParams()}`,
          payload
        )
        .then(response => {
          expect(response.status).to.eql(200, 'Add entity');
          const entityId = response.data;
          context.TestConfig.entityId = entityId;
          context.TestConfig.financialYear = entity.financialYearToStart;
          resolve(entityId);
        })
        .catch(error => {
          reject(error);
        });
    });
  });
}

async function addPerson(person) {
  let requestBody = {
    title: person.title,
    firstname: person.firstname,
    surname: person.surname,
    sex: person.sex,
    email: person.email,
    phone: person.phone,
    mobileNumber: person.mobileNumber,
    birthday: person.birthday,
    addressDto:
    {
      streetLine1: person.streetLine1,
      suburb: person.suburb,
      state: person.state,
      postCode: person.postCode,
      country: person.country
    }
  }
  let response = null;
  try {
    response = await axios.post(
      `${context.TestConfig.serverURL}/entity/mvc/base/updatePeople?${getAPIParams()}`,
      requestBody);
    expect(response.status).to.eql(200, "add persion");
    return response.data;
  }
  catch (error) {
    throw new Error(`${error}: "${error.response.data}"`);
  }
}

async function addContact(contact) {
  let requestBody = {
    product: "CAS",
    entityList: [],
    master: {
      entityType: contact.entityType,
      name: contact.name,
      type: "company",
      address: {
        streetLine1: contact.streetLine1,
        suburb: contact.suburb,
        state: contact.state,
        postCode: contact.postCode,
        country: contact.country
      }
    },
  }
  if (contact.entityType == 'Trust') {
    requestBody.master.estDate = contact.estDate;
  }
  if (contact.entityType == 'Company') {
    requestBody.master.email = contact.email
    requestBody.master.phone = contact.phone
    requestBody.master.acn = contact.acn
  }
  if (contact.entityType == 'OtherEntity') {
    requestBody.master.email = contact.email
    requestBody.master.phone = contact.phone
  }
  let response = null;
  try {
    response = await axios.post(
      `${context.TestConfig.serverURL}/d/Entities/addEntity?${getAPIParams()}`,
      requestBody);
    expect(response.status).to.eql(200, `add ${contact.entityType}`);
    return response.data;
  }
  catch (error) {
    throw new Error(`${error}: "${error.response.data}"`);
  }
}

async function addEntityRelationship(relationship) {
  let requestBody = {
    entityToType: relationship.entityToType,
    entityToId: relationship.entityToId,
    entityPosition: relationship.entityPosition,
    entityFromType: relationship.entityFromType,
    entityFromId: relationship.entityFromId
  }
  let url = ''
  if (['SMSF', 'BillableTrust', 'BillableCompany'].includes(relationship.entityFromType)) {
    url = `${context.TestConfig.serverURL}/entity/mvc/base/addFundRelationship?${getAPIParams()}&mid=${relationship.entityFromId}`;
  } else url = `${context.TestConfig.serverURL}/entity/mvc/base/addFundRelationship?${getAPIParams()}`

  try {
    response = await axios.post(
      url,
      requestBody);
    expect(response.status).to.eql(200, `add entityRelationship`);
    return response.data;
  }
  catch (error) {
    throw new Error(`${error}: "${error.response.data}"`);
  }
}


module.exports = {
  async login(firm) {
    try {
      const cookies = await loginToSSOPromise(firm);
    }
    catch (error) {
      console.error(error);
      throw error;
    }
  },
  async addEntity(entity) {
    try {
      const response = await addEntityPromise(entity);
      return response;
    }
    catch (error) {
      console.error(error);
      throw error;
    }
  },
  addPerson,
  addContact,
  getUniqueEntityCode,
  addEntityRelationship
}
