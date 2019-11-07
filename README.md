<p align="center">
  <a href="https://github.com/fractal-platform/pihsiu/releases">
    <img width="200" src="https://raw.githubusercontent.com/fractal-platform/pihsiu/master/docs/logo.png">
  </a>
</p>

<h1 align="center">Pihsiu Wallet</h1>

<div align="center">

Connect you to fantastic Fractal Block Chain.

[![Join the chat at https://gitter.im/fractal-platform/pihsiu](https://badges.gitter.im/fractal-platform/pihsiu.svg)](https://gitter.im/fractal-platform/pihsiu?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/fractal-platform/pihsiu.svg?branch=master)](https://travis-ci.org/fractal-platform/pihsiu)

</div>

English | [简体中文](./README-zh_CN.md)

## ✨ Features

Pihsiu enhances your browser to connect to Fractal block chain. Pihsiu makes it possible for you to run Dapp right without a local Fractal full node. And it has a secure vault inside to manage your account identities and sign transaction across different network.

The goal of Pihsiu is to make it as easy as possible to talk with Fractal.

## 📦 Install

### Browser extension

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](https://github.com/fractal-platform/pihsiu/releases)<br> Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](https://github.com/fractal-platform/pihsiu/releases)<br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](https://chrome.google.com/webstore/detail/pihsiu/lbfkjikmajfblaomhgdbdombjkgaeico)<br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](https://github.com/fractal-platform/pihsiu/releases)<br>Opera | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/brave/brave_48x48.png" alt="brave" width="24px" height="24px"/>](https://support.brave.com/hc/en-us/articles/360017909112-How-can-I-add-extensions-to-Brave-)<br>Brave |
| --------- | --------- | --------- | --------- | --------- |
| Dev| Dev| Release| Dev| Release|

## 🖥 Try Dev Version

Get extension [here](https://github.com/fractal-platform/pihsiu/releases), download the zip file for specific browser.

### chrome/opera

1. Open your Chrome Browser and goto [chrome://extensions](chrome://extensions)
2. Open **development mode** and unzip the extension.zip file, click **Load unpacked** and select the unzipped folder.

![alt open_dev_mode](https://raw.githubusercontent.com/fractal-platform/pihsiu/master/docs/open_dev_mode.png)

### firefox

install a node package `we-ext`

follow this [tutorial](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Getting_started_with_web-ext) to test and build

the basic steps can be described as follows:
```bash
$ cd /path/to/dist/extensions
$ web-ext run
$ web-ext build
$ web-ext sign --api-key=$AMO_JWT_ISSUER --api-secret=$AMO_JWT_SECRET 
```

## ⌨️ Development

```shell script
$ git clone https://github.com/fractal-platform/pihsiu.git
$ cd pihsiu
$ yarn -i
$ yarn run watch:ext
```

After all that, you will get dev extension in `dist/extension` and then use chrome load unpacked extension in dev mode. [Try dev version](#try-dev-version) contains the details. 

## 🤝 Contributing [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) 

