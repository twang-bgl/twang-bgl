let localTestConfig;
try {
  // eslint-disable-next-line global-require
  localTestConfig = require('../../test-config-local.json');
} catch (ex) {
  localTestConfig = {};
}

const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const otplib = require('otplib');
const util = require('./util');

const { axios } = util;
const { expect } = util;

const AWS_TEST_USER = 'rhor-ci';

const testConfig = {};


function getcognitoURL() {
  return `https://${testConfig.cognitoAddress}`;
}

function getSSOURL() {
  return `https://${testConfig.ssoServer}`;
}
function getServerURL() {
  return `https://${testConfig.server}`;
}

function getUserIdTokenPromise() {
  return new Promise((resolve, reject) => {
    axios.post(testConfig.cognitoURL, {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: testConfig.cognitoClientId,
      AuthParameters: {
        USERNAME: testConfig.username,
        PASSWORD: testConfig.userPassword,
      },
      ClientMetadata: {},
    }, {
      headers: {
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSCognitoIdentityProviderService.InitiateAuth',
      },
    })
      .then((response) => {
        expect(response.status).to.eql(200, 'Initiate Cognito authentication');
        axios.post(testConfig.cognitoURL, {
          ChallengeName: 'SOFTWARE_TOKEN_MFA',
          ChallengeResponses: {
            USERNAME: testConfig.username,
            SOFTWARE_TOKEN_MFA_CODE: otplib.authenticator.generate(testConfig.userSecret),
          },
          ClientId: testConfig.cognitoClientId,
          Session: response.data.Session,
        }, {
          headers: {
            'content-type': 'application/x-amz-json-1.1',
            'x-amz-target': 'AWSCognitoIdentityProviderService.RespondToAuthChallenge',
          },
        })
          .then((res) => {
            expect(res.status).to.eql(200, 'Cognito Challenge');
            testConfig.userIdToken = res.data.AuthenticationResult.IdToken;
            resolve(testConfig.userIdToken);
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getTestParametersFromAWSPromise() {
  const ssm = new AWS.SSM({
    region: 'ap-southeast-2',
  });
  const awsParamsMap = new Map();
  let env = 'uat';
  if (localTestConfig.environment != null) {
    switch (localTestConfig.environment) {
      case 'uat':
      case 'staging':
      case 'production':
      case 'uat2':
        env = localTestConfig.environment;
        break;
      case 'prod':
        env = 'production';
        break;
      default:
        env = 'uat';
        break;
    }
  }
  const paramPrefix = `/${env}/sf360/test-automation`;

  awsParamsMap.set(`${paramPrefix}/server/ADDRESS`, 'server');
  awsParamsMap.set(`${paramPrefix}/aws-cognito/ADDRESS`, 'cognitoAddress');
  awsParamsMap.set(`${paramPrefix}/aws-cognito/ID`, 'cognitoClientId');
  awsParamsMap.set(`${paramPrefix}/sso/ADDRESS`, 'ssoServer');

  if (localTestConfig.userCredentials[env].username != null) {
    testConfig.username = localTestConfig.userCredentials[env].username;

    if (localTestConfig.userCredentials[env].userPassword != null) {
      testConfig.userPassword = localTestConfig.userCredentials[env].userPassword;
    } else {
      throw new Error('userPassword is not set in test config');
    }

    if (localTestConfig.userCredentials[env].userSecret != null) {
      testConfig.userSecret = localTestConfig.userCredentials[env].userSecret;
    } else {
      throw new Error('userSecret is not set in test config');
    }

    if (localTestConfig.userCredentials[env].uid != null) {
      testConfig.uid = localTestConfig.userCredentials[env].uid;
    } else {
      throw new Error('uid is not set in test config');
    }
  } else {
    const userParamPrefix = `${paramPrefix}/users/${AWS_TEST_USER}`;
    awsParamsMap.set(`${userParamPrefix}/NAME`, 'username');
    awsParamsMap.set(`${userParamPrefix}/PASSWORD`, 'userPassword');
    awsParamsMap.set(`${userParamPrefix}/SECRET`, 'userSecret');
    awsParamsMap.set(`${userParamPrefix}/UID`, 'uid');
  }

  return new Promise((resolve, reject) => {
    const ssmParams = {
      Names: Array.from(awsParamsMap.keys()),
      WithDecryption: true,
    };
    ssm.getParameters(ssmParams, (err, data) => {
      if (err) reject(err);
      else {
        data.Parameters.forEach((param) => {
          const paramName = param.Name;
          if (awsParamsMap.has(paramName)) {
            testConfig[awsParamsMap.get(paramName)] = param.Value;
          }
        });

        testConfig.serverURL = getServerURL();
        testConfig.cognitoURL = getcognitoURL();
        testConfig.ssoURL = getSSOURL();

        resolve(testConfig);
      }
    });
  });
}
const ID_TOKEN_FILE = 'idToken.txt';
async function generateIdToken() {
  if(fs.existsSync(ID_TOKEN_FILE)) {
    const idToken = fs.readFileSync(ID_TOKEN_FILE);
    const decoded = jwt.decode(idToken);
    if (Date.now() >= decoded.exp * 1000 || decoded.email != testConfig.username || testConfig.cognitoClientId != decoded.aud) {
      await this.getUserIdToken();
      fs.writeFileSync('idToken.txt', testConfig.userIdToken);
    }
    else {
      testConfig.userIdToken = idToken;
    }
  }
  else {
    await this.getUserIdToken();
    fs.writeFileSync('idToken.txt', testConfig.userIdToken);
  }
}

function getTestConfigFromLocal() {
  testFileOrFolder = 'test/data/sample/cgt/cgt-sample-1.json';
  environment = 'uat';
  firm = 'sf360test';

  if (localTestConfig.environment != null) {
    if (localTestConfig.environment == 'prod') {
      testConfig.environment = 'production';
    } else {
      testConfig.environment = localTestConfig.environment;
    }
  } else {
    testConfig.environment = environment;
  }

  if (localTestConfig.testFileOrFolder != null) {
    testConfig.testFileOrFolder = localTestConfig.testFileOrFolder;
  } else {
    testConfig.testFileOrFolder = testFileOrFolder;
  }

  if (localTestConfig.userCredentials[testConfig.environment].firm != null) {
    testConfig.firm = localTestConfig.userCredentials[testConfig.environment].firm;
  } else {
    testConfig.firm = firm;
  }
}

module.exports = {
  async initTest() {
    try {
      await getTestParametersFromAWSPromise();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  getUserIdToken: async () => {
    try {
      await getUserIdTokenPromise();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  TestConfig: testConfig,
  generateIdToken,
  getTestConfigFromLocal
};
