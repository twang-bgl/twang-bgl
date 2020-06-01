module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true,
    "mocha": true
  },
  "plugins": [
    "wdio"
  ],
  "extends": [
    "airbnb-base",
    "plugin:wdio/recommended"
  ],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaVersion": 2018
  },
  "rules": {
    "max-len": "off",
    "object-curly-newline": "off",
    "lines-between-class-members": "off",
    "no-lonely-if": "off",
    "class-methods-use-this": "off",
    "no-console": "off",
    "no-eval": "off",
    "indent": "off",
  },
  "overrides": [
    {
      "files": ["Page.js", "*.page.js"],
      "rules": {
        "camelcase": "off",
      }
    }
  ]
};
