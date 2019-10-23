import path from 'path';

// ref: https://umijs.org/config/
export default {
  treeShaking: true,
  history: 'hash',
  outputPath: '../../dist/renderer',
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: true,
        dynamicImport: false,
        title: 'pihsiu',
        dll: false,
        locale: {
          enable: true,
          default: 'en-US',
        },
        routes: {
          exclude: [
            /models\//,
            /services\//,
            /model\.(t|j)sx?$/,
            /service\.(t|j)sx?$/,
            /components\//,
          ],
        },
      },
    ],
  ],
  theme: {
    '@brand-primary': '#4B4185',
    '@brand-primary-tap': '#9D93C5',
  },
  define: {
    'process.env.NODE_ENV': 'production',
  },
  extraBabelIncludes: [
    path.resolve(__dirname, '../core/engine/BackgroundConnection.js'),
    path.resolve(__dirname, '../core/engine/portConnector.js'),
  ],
};
