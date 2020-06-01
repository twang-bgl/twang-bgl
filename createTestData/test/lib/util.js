const chai = require('chai');
var chaiSubset = require('chai-subset');
const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');

axiosCookieJarSupport(axios);

const cookieJar = new tough.CookieJar();
const axiosInstance = axios.create({
  jar: cookieJar,
  withCredentials: true,
});

chai.config.truncateThreshold = 0;
chai.use(chaiSubset);

const { expect } = chai;
const { assert } = chai;

var _ = require('lodash');

module.exports.axios = axiosInstance;
module.exports.cookieJar = cookieJar;
module.exports.expect = expect;
module.exports.assert = assert;
module.exports._ = _;
