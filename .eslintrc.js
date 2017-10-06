module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": ["eslint:recommended", "plugin:react/recommended"],
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true
        },
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "react/no-string-refs": 0,
        "react/no-find-dom-node": 0,
        "react/prop-types": 0,
        "no-unused-vars": 0,
        "no-irregular-whitespace": 0,
        "no-console": 0,
        "no-case-declarations": 0
    },
    "settings": {
        "react": {
            "version": "15.0"
        }
    },
    "globals": {
        "google": true
    }
};
