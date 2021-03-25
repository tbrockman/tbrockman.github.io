---
layout: post
title: using webpack and manifest v3 👨‍💻
excerpt: A guide to make up for some of the sparse documentation available on the internet about using Webpack in v3 Chrome extensions.
date: 2021-03-24 22:06:00 -0700
author: Theodore Brockman
categories: webpack,mv3,chrome
---
Working on my [*amazing, incredible, life-changing* Chrome extension](https://chrome.google.com/webstore/detail/prune/gblddboefgbljpngfhgekbpoigikbenh), I noticed there wasn't much documentation available in terms of how to use [manifest v3](https://developer.chrome.com/docs/extensions/mv3/intro/) extensions in conjunction with [Webpack](https://webpack.js.org/) to modularize code. So here's a pretty quick guide.

(*you can also just skip to [the GitHub repository](https://github.com/tbrockman/webpack-manifest-v3-example) if you're into that sort of thing*)

Write your code:

[`src/index.js`](https://github.com/tbrockman/webpack-manifest-v3-example/blob/master/src/index.js)
```javascript
import { Example } from './example.js'

const example = new Example()
```

[`src/example.js`](https://github.com/tbrockman/webpack-manifest-v3-example/blob/master/src/example.js)
```javascript
class Example {

    constructor() {
        console.log('hello world')
    }
}

export {
    Example
}
```

Setup your webpack.config.js file and run webpack:

[`webpack.config.js`](https://github.com/tbrockman/webpack-manifest-v3-example/blob/master/webpack.config.js)
```javascript
const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  // This will output a single file under `dist/bundle.js`
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  }
}
```

```shell
> webpack

asset bundle.js 76 bytes [compared for emit] [minimized] (name: main)
orphan modules 112 bytes [orphan] 1 module
./src/index.js + 1 modules 183 bytes [built] [code generated]
webpack 5.28.0 compiled successfully in 177 ms
```

Create your service worker entrypoint, importing the produced bundle:

[`service-worker.js`](https://github.com/tbrockman/webpack-manifest-v3-example/blob/master/service-worker.js)
```javascript
try {
    // This is the file produced by webpack
    importScripts('dist/bundle.js');
} catch (e) {
    // This will allow you to see error logs during registration/execution
    console.error(e);
}
```

Reference the file in your manifest:

[`manifest.json`](https://github.com/tbrockman/webpack-manifest-v3-example/blob/master/manifest.json)
```javascript
{
    "name": "webpack-manifest-v3-example",
    "author": "Theodore Brockman",
    "version": "1.0.0",
    "description": "A Chrome extension packed using Webpack.",
    "permissions": [],
    "background": {
        "service_worker": "service-worker.js"
    },
    "manifest_version": 3
}
```

[Load your unpacked extension](chrome://extensions/) and inspect the service worker view to check the output:

![](/assets/img/webpack_manifest_console_output.png)

Done. 