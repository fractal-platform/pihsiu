const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { dist, src, release, printResult, getArgv } = require('./common');
const packInfo = require('../package.json');

const mode = 'production';

let chromeConfig = {
  entry: path.join(src, 'background.js'),
  mode,
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.join(dist),
        to: path.join(release, 'chrome'),
      },
      {
        from: path.join(src, 'manifest.json'),
        to: path.join(release, 'chrome'),
        transform(content, path) {
          const m = JSON.parse(content.toString());
          m.version = packInfo.version;
          m.minimum_chrome_version = "58";
          return Buffer.from(JSON.stringify(m));
        },
      },
    ]),
  ],
};

let firefoxConfig = {
  entry: path.join(src, 'background.js'),
  mode,
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.join(dist),
        to: path.join(release, 'firefox'),
      },
      {
        from: path.join(src, 'manifest.json'),
        to: path.join(release, 'firefox'),
        transform(content, path) {
          const m = JSON.parse(content.toString());
          m.version = packInfo.version;
          m.applications = {
            gecko: {
              id: 'fractalblockdev@gmail.com',
              strict_min_version: '56.0',
            },
          };
          return Buffer.from(JSON.stringify(m));
        },
      },
    ]),
  ],
};

let operaConfig = {
  entry: path.join(src, 'background.js'),
  mode,
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.join(dist),
        to: path.join(release, 'opera'),
      },
      {
        from: path.join(src, 'manifest.json'),
        to: path.join(release, 'opera'),
        transform(content, path) {
          const m = JSON.parse(content.toString());
          m.version = packInfo.version;
          m.applications = {
            gecko: {
              id: 'fractalblockdev@gmail.com',
              strict_min_version: '56.0',
            },
          };
          return Buffer.from(JSON.stringify(m));
        },
      },
    ]),
  ],
};

let braveConfig = {
  entry: path.join(src, 'background.js'),
  mode,
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.join(dist),
        to: path.join(release, 'brave'),
      },
      {
        from: path.join(src, 'manifest.json'),
        to: path.join(release, 'brave'),
        transform(content, path) {
          const m = JSON.parse(content.toString());
          m.version = packInfo.version;
          m.applications = {
            gecko: {
              id: 'fractalblockdev@gmail.com',
              strict_min_version: '56.0',
            },
          };
          return Buffer.from(JSON.stringify(m));
        },
      },
    ]),
  ],
};

let edgeConfig = {
  entry: path.join(src, 'background.js'),
  mode,
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.join(dist),
        to: path.join(release, 'edge'),
      },
      {
        from: path.join(src, 'manifest.json'),
        to: path.join(release, 'edge'),
        transform(content, path) {
          const m = JSON.parse(content.toString());
          m.version = packInfo.version;
          m.applications = {
            gecko: {
              id: 'fractalblockdev@gmail.com',
              strict_min_version: '56.0',
            },
          };
          return Buffer.from(JSON.stringify(m));
        },
      },
    ]),
  ],
};

webpack(chromeConfig).run((err, stats) => {
  printResult('chrome')(err, stats);
  if (err || stats.hasErrors()) {
    return;
  }
});

webpack(firefoxConfig).run((err, stats) => {
  printResult('firefox')(err, stats);
  if (err || stats.hasErrors()) {
    return;
  }
});

webpack(operaConfig).run((err, stats) => {
  printResult('opera')(err, stats);
  if (err || stats.hasErrors()) {
    return;
  }
});

webpack(braveConfig).run((err, stats) => {
  printResult('brave')(err, stats);
  if (err || stats.hasErrors()) {
    return;
  }
});

webpack(edgeConfig).run((err, stats) => {
  printResult('edge')(err, stats);
  if (err || stats.hasErrors()) {
    return;
  }
});
