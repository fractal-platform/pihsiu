const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { src, dist, printResult, getArgv } = require('./common');
const packInfo = require('../package.json');

const mode = getArgv('--env', 'production');
const watch = getArgv('--watch', 'false');

let webpackConfig = {
  entry: path.join(src, 'background.js'),
  output: {
    filename: 'background.js',
    path: dist,
  },
  mode,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    browsers: ['chrome >= 58', 'firefox >= 60', 'edge >= 18'],
                  },
                },
              ],
            ],
          },
        },
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: path.join(src, 'images'), to: path.join(dist, 'images') },
      { from: path.join(src, '_locales'), to: path.join(dist, '_locales') },
      { from: '*.html', to: dist, context: src },
      {
        from: 'manifest.json',
        to: dist,
        context: src,
        transform(content, path) {
          const m = JSON.parse(content.toString());
          m.version = packInfo.version;
          if (mode === 'development') {
            m.externally_connectable = {
              matches: ['http://localhost:8000/*'],
              ids: ['*'],
            };
          }
          return Buffer.from(JSON.stringify(m));
        },
      },
    ]),
  ],
};

const inpageCompiler = webpack({
  entry: path.join(src, 'inpage.js'),
  output: {
    filename: 'inpage.js',
    path: dist,
  },
  mode,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    browsers: ['chrome >= 58', 'firefox >= 60', 'edge >= 18'],
                  },
                },
              ],
            ],
          },
        },
      },
    ],
  },
});

const contentComplier = webpack({
  entry: path.join(src, 'contentscript.js'),
  output: {
    filename: 'contentscript.js',
    path: dist,
  },
  mode,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    browsers: ['chrome >= 58', 'firefox >= 60', 'edge >= 18'],
                  },
                },
              ],
            ],
            plugins: [
              [
                require('babel-plugin-static-fs'),
                {
                  target: 'browser', // defaults to node
                  dynamic: false, // defaults to true
                },
              ],
            ],
          },
        },
      },
    ],
  },
});

if (mode === 'development') {
  webpackConfig = merge(webpackConfig, { devtool: 'inline-source-map' });
}

if (watch === 'true') {
  webpack(webpackConfig).watch({ ignored: /node_modules/ }, printResult('watch:background.js'));

  let watchContent = false;

  inpageCompiler.watch({}, (err, stats) => {
    printResult('watch:inpage.js')(err, stats);
    if (err || stats.hasErrors()) {
      return;
    }
    if (watchContent) {
      watchContent.close(() => {
        watchContent = contentComplier.watch({}, printResult('watch:contentscript.js'));
      });
    } else {
      watchContent = contentComplier.watch({}, printResult('watch:contentscript.js'));
    }
  });
} else {
  webpack(webpackConfig).run(printResult('background.js'));
  inpageCompiler.run((err, stats) => {
    printResult('inpage.js')(err, stats);
    if (err || stats.hasErrors()) {
      return;
    }
    contentComplier.run(printResult('contentscript.js'));
  });
}
