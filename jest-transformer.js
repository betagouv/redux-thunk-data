const config = {
  babelrc: false,
  plugins: [
    ["@babel/plugin-proposal-class-properties", { loose: true }],
    "@babel/plugin-transform-modules-commonjs"
  ],
  presets: [
    [
      "@babel/env",
      {
        modules: false
      }
    ],
    "@babel/react"
  ]
};
module.exports = require("babel-jest").createTransformer(config);
