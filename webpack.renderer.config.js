// webpack.renderer.config.js

const rules = require('./webpack.rules'); // Je bestaande import

// Voeg de CSS regel toe (zoals je al deed)
rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

// Voeg JE NIEUWE JSX/BABEL REGEL toe aan de 'rules' array
rules.push({
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-env', '@babel/preset-react'],
    },
  },
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules: rules, // BELANGRIJK: Gebruik hier de 'rules' array die je hebt opgebouwd
  },
  // VERGEET DIT NIET TOE TE VOEGEN ALS HET ER NOG NIET STAAT:
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  // ... andere webpack configuraties zoals entry, output, etc.
};