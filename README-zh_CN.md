<p align="center">
  <a href="https://github.com/fractal-platform/pihsiu/releases">
    <img width="200" src="https://raw.githubusercontent.com/fractal-platform/pihsiu/master/docs/logo.png">
  </a>
</p>

<h1 align="center">貔貅钱包</h1>

<div align="center">

联通Dapp与Fractal世界

[![Join the chat at https://gitter.im/fractal-platform/pihsiu](https://badges.gitter.im/fractal-platform/pihsiu.svg)](https://gitter.im/fractal-platform/pihsiu?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/fractal-platform/pihsiu.svg?branch=master)](https://travis-ci.org/fractal-platform/pihsiu)

</div>

简体中文 | [English](./README.md)

## ✨ 特性

貔貅钱包插件版会增强你的浏览器，可以让其中运行的Dapp无痛的连接到Fractal网络中。

同时，他又是一个功能完备的钱包，可以安全的帮你管理账户，签发交易，部署合约。

貔貅钱包的意义就在于联通现实世界和Fractal世界，让事情变得简单。

## 📦 安装

### 浏览器插件

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](https://github.com/fractal-platform/pihsiu/releases)<br> Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](https://github.com/fractal-platform/pihsiu/releases)<br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](https://chrome.google.com/webstore/detail/pihsiu/lbfkjikmajfblaomhgdbdombjkgaeico)<br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](https://github.com/fractal-platform/pihsiu/releases)<br>Opera | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/brave/brave_48x48.png" alt="brave" width="24px" height="24px"/>](https://support.brave.com/hc/en-us/articles/360017909112-How-can-I-add-extensions-to-Brave-)<br>Brave |
| --------- | --------- | --------- | --------- | --------- |
| Dev| Dev| Release| Dev| Release|

## 🖥 尝试开发版

下载插件 [这里](https://github.com/fractal-platform/pihsiu/releases)，下载zip文件并解压。

### chrome/opera

1. 打开Chrome浏览器，进入插件管理页：[chrome://extensions](chrome://extensions)
2. 打开**开发者模式**，点击**加载已解压的扩展程序**，选择解压后的文件夹即可。

![alt open_dev_mode](https://raw.githubusercontent.com/fractal-platform/pihsiu/master/docs/open_dev_mode.png)

### firefox

安装node package `we-ext`

这里是文档 [tutorial](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Getting_started_with_web-ext)

主要的操作步骤：

```bash
$ cd /path/to/dist/extensions
$ web-ext run
$ web-ext build
$ web-ext sign --api-key=$AMO_JWT_ISSUER --api-secret=$AMO_JWT_SECRET 
```

## ⌨️ 开发

```shell script
$ git clone https://github.com/fractal-platform/pihsiu.git
$ cd pihsiu
$ yarn -i
$ yarn run watch:ext
```

## 🤝 贡献代码 [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

热烈欢迎通过issues提供建议或通过pull request提供代码
