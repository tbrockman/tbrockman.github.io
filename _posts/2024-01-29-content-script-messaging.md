---
layout: post
title: message passing and `MAIN` world content scripts ✉️
date: 2024-01-29 09:32:00 -0400
author: Theodore Brockman
categories: chrome extensions content-scripts message-passing
excerpt: Making up for a lack of browser extension documentation (again!).
thumbnail: /assets/img/hello_world_thumbnail.png
---

Let's say that maybe you're a little bit of an anarchist, and you want to write Javascript that runs on [reddit.com](https://reddit.com) to mangle the tracking data their client sends while you're browsing (but not block it completely). 

You would need the ability to intercept the request before it happens, modify the request body, and then send it on its way.

There's a few ways you could go about doing this, but one of the more straight-forward ones is by using a [content script](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts).

## content scripts

Depending on the browser (Firefox is a bit [more security conscious](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts)), content scripts can directly interact with existing webpage Javascript objects (with the converse being true as well), and modify them as desired.

This means that you can write something like the following:

[`content-script.js`](https://github.com/tbrockman/examples/blob/main/main-world-content-script-message-passing/content-script.js)
```javascript
let proxied = fetch;
fetch = function (resource, options) {
    console.log('in proxied fetch handler', resource)

    if (resource.includes('/svc/shreddit/events')) {
        // assuming the request body is JSON
        let body = JSON.parse(options.body);
        console.log('original body', body)
        // mangle the tracking data
        body['info'] = mangle(body['info']);
        console.log('mangled body', body)
        // stringify the body again
        options.body = JSON.stringify(body);
    }
    return proxied(resource, options);
}
```

Where `mangle` could be a function like:
```javascript
let strings = ['never', 'gonna', 'give', 'you', 'up', 'let', 'down', 'run', 'around', 
               'and', 'desert', 'make', 'cry', 'say', 'goodye', 'tell', 'lie', 'hurt']
let ints = [0, 420, 69, 8008135, 666]

function mangle(data) {

    if (data === null || data === undefined) {
        return data
    }

    if (Array.isArray(data)) {
        data = data.map(d => mangle(d));
    } else if (typeof data === 'object') {
        Object.keys(data).forEach(key => {
            data[key] = mangle(data[key]);
        });
    }
    else if (typeof data === 'string') {
        data = strings[Math.floor(Math.random() * strings.length)];
    } else if (typeof data === 'number') {
        data = ints[Math.floor(Math.random() * ints.length)];
    } else if (typeof data === 'boolean') {
        data = Math.random() < 0.5;
    }
    return data;
}
```

And then, assuming you've set up your `manifest.json` correctly:

[`manifest.json`](https://github.com/tbrockman/examples/blob/main/main-world-content-script-message-passing/manifest.json)
```javascript
{
    "name": "Reddit tracking data mangler",
    "version": "1.0",
    "manifest_version": 3,
    "background": {
        "service_worker": "background.js"
    },
    "host_permissions": [
        "https://*.reddit.com/*"
    ],
    "permissions": [
        "tabs",
        "scripting",
        "activeTab"
    ]
}
```

You can inject it on every page load:

[`background.js`](https://github.com/tbrockman/examples/blob/main/main-world-content-script-message-passing/background.js)
```javascript
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        chrome.scripting.executeScript({
            target: { tabId, allFrames: true },
            files: ['content-script.js'],
            injectImmediately: true,
            world: 'MAIN'
        }).then(() => {
            console.log('content script injected');
        });
    }
});
```

And then marvel at your work:

[![console log of reddit tracking data mangler in action](/assets/img/main-world-content-scripts-with-message-passing/mangled-request-console-log.png)](/assets/img/main-world-content-scripts-with-message-passing/mangled-request-console-log.png)

Pretty neat, right? But what if we were feeling bad and wanted to extend our little application so that we could turn it on and off when we didn't care about being tracked? We could add a button to the popup that would toggle the content script, but how would we communicate to the content script in the first place?

This is where [message passing](https://developer.chrome.com/docs/extensions/develop/concepts/messaging) comes in.

## message passing

If you've worked in browser extensions before, you're likely already familiar with sending messages between the background script and the popup, maybe even communicating with content scripts injected into the default [`ISOLATED`](https://developer.chrome.com/docs/extensions/reference/api/scripting#type-ExecutionWorld) world, but it turns out that once your code exists in the same realm as other webpage Javascript, you can't send messages as easily. 

To illustrate this, let's start off by adding a button to our popup that will allow us to toggle our content script:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Reddit tracking data mangler</title>
    <script src="popup.js"></script>
  </head>
  <body>
    <button id="toggle">Toggle</button>
  </body>
</html>
```

We'll need a listener for the button click to send a message to the our content script:

[`popup.js`](https://github.com/tbrockman/examples/blob/main/main-world-content-script-message-passing/popup.js)
```javascript
document.addEventListener('DOMContentLoaded', function() {
    let toggle = document.getElementById('toggle');
    toggle.addEventListener('click', async () => {
        await chrome.runtime.sendMessage('toggle')
    });
});
```

Then we'll add a listener for the message in our content script (and modify our `fetch` handler to consider the toggle):

[`content-script.js`](https://github.com/tbrockman/examples/blob/main/main-world-content-script-message-passing/content-script.js)
```javascript
let enabled = true;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('message received', message);
    if (message === 'toggle') {
        console.log('toggling');
        enabled = !enabled;
    }
});

fetch = function (resource, options) {
    console.log('in proxied fetch handler', resource)
    if (resource.includes('/svc/shreddit/events') && enabled) {
        // assuming the request body is JSON
        let body = JSON.parse(options.body);
        // mangle the tracking data
        console.log('original body', body)
        body['info'] = mangle(body['info']);
        // stringify the body again
        console.log('mangled body', body)
        options.body = JSON.stringify(body);
    }
    return proxied(resource, options);
}
```

And add our new popup to our manifest:

[`manifest.json`](https://github.com/tbrockman/examples/blob/main/main-world-content-script-message-passing/manifest.json)
```javascript
{
    "action": {
        "default_title": "Reddit tracking data mangler",
        "default_popup": "popup.html"
    }
}
```

Then we load up our extension and...

[![Uncaught TypeError: Cannot read property 'addListener' of undefined](/assets/img/main-world-content-scripts-with-message-passing/chrome-runtime-onmesasage-undefined.png)](/assets/img/main-world-content-scripts-with-message-passing/chrome-runtime-onmesasage-undefined.png)
_oh poop._

This is because the content script only has access to a limited subset of the `chrome.runtime` API as a result of being injected into the `MAIN` world. While at first frustrating, if you stop to think about it, it makes sense: Content scripts injected into the `MAIN` world are now running in the same context as the webpage, and the webpage (or other content scripts) can't be trusted. Naturally the browser requires a few more precautions to help make sure you understand [the full implications of what you're doing](https://developer.chrome.com/docs/extensions/develop/concepts/messaging#content-scripts-are-less-trustworthy).

## externally connectable

Instead, we need to treat our own content script as an [*external webpage*](https://developer.chrome.com/docs/extensions/develop/concepts/messaging#external-webpage), since it can no longer be considered a trusted part of the extension. This means that we need to allow connections from external webpages in our `manifest.json`:

[`manifest.json`](https://github.com/tbrockman/examples/blob/main/main-world-content-script-message-passing/manifest.json)
```javascript
{
    "externally_connectable": {
        "matches": ["https://reddit.com/*"]
    }
}
```

Then, we establish a connection from our content script to our *background script*:

[`content-script.js`](https://github.com/tbrockman/examples/blob/main/main-world-content-script-message-passing/content-script.js)
```javascript
// chrome.runtime.id is not available in `MAIN` world content scripts, so we need to hardcode our extension ID
// you can find your extension ID in `chrome://extensions/`, but if you don't want to hardcode this string, skip ahead to the bonus section.
let port = chrome.runtime.connect('blfjpfhginhogjljcbffeadcafbcmldg'); 

port.onMessage.addListener((message) => {
    console.log('message received', message);
    if (message === 'toggle') {
        console.log('toggling');
        toggled = !toggled;
    }
});
```

Then, create the corresponding background script listener for [`onConnectExternal`](https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onConnectExternal):

[`background.js`](https://github.com/tbrockman/examples/blob/main/main-world-content-script-message-passing/background.js)
```javascript
let ports = []; // keep track of all our connections for messaging

chrome.runtime.onConnectExternal.addListener((port) => {
    console.log('external connection received', port);

    ports.push(port);
});
```

As well as adding a listener for relaying the `toggle` (and any other) message from our popup:

```javascript
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        ports.forEach(port => {
            port.postMessage(request);
        });
    }
);
```

And now we can toggle our content script from our popup!

[![console log of reddit tracking data mangler in action](/assets/img/main-world-content-scripts-with-message-passing/toggled-message-console-log.png)](/assets/img/main-world-content-scripts-with-message-passing/toggled-message-console-log.png)
_it's toggled_

Note that after making your extension externally connectable, you should be *very* careful about how you process information you receive, and what information you send, to untrusted external connections--even *if* the recipient is trusted, there's no guarantee other code won't be spying.

## bonus: using [`func`](https://developer.chrome.com/docs/extensions/reference/api/scripting#method-ScriptInjection-func)

You may have noticed earlier that we had to hardcode our extension ID in our content script, which isn't very portable (it'll be different each time someone develops locally *and* when it's published in production) and will need to be manually updated. You may find other reasons that you want to provide context directly to your content script from your background script.

It turns out that this can be accomplished using the [`func`](https://developer.chrome.com/docs/extensions/reference/api/scripting#method-ScriptInjection-func) and [`args`](https://developer.chrome.com/docs/extensions/reference/api/scripting#property-ScriptInjection-args) parameters of [`chrome.scripting.executeScript`](https://developer.chrome.com/docs/extensions/reference/api/scripting#method-executeScript).

### Caveats:
* `func` will be serialized and then deserialized for injection, so it will lose any references to the original function's scope (i.e, it must contain all the code it needs to execute within itself)
* `args` must all be `JSON`-serializable

So, as an example, we would re-write `content-script.js` to be:

[`content-script.js`](https://github.com/tbrockman/examples/blob/main/main-world-content-script-message-passing/content-script.js)
```javascript
function injectContentScript(extensionId) {
    console.log('injected content script with id: ', extensionId)

    let enabled = true;
    let port = chrome.runtime.connect(extensionId);

    port.onMessage.addListener((message) => {
        console.log('message received', message);
        if (message === 'toggle') {
            console.log('toggling');
            enabled = !enabled;
        }
    });

    // ... rest of previous content script ...
}

export {
    injectContentScript
}
```

Then we update `background.js`:

[`background.js`](https://github.com/tbrockman/webpack-manifest-v3-example/blob/master/src/index.js)
```javascript
import { injectContentScript } from './content-script.js';

// ... previous code ...

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    if (changeInfo.status == 'complete') {
        chrome.scripting.executeScript({
            target: { tabId, allFrames: true },
            func: injectContentScript, // pass our new function
            args: [chrome.runtime.id],  // pass our extension ID (or any other JSON-serializable arguments)
            injectImmediately: true,
            world: 'MAIN'
        }).then(() => {
            console.log('content script injected');
        });
    }
});
```

And finally, update the manifest too (since we're importing our content script using ES module syntax):

[`manifest.json`](https://github.com/tbrockman/webpack-manifest-v3-example/blob/master/src/manifest.json)
```javascript
{
    "background": {
        "service_worker": "background.js",
        "type": "module"
    }
}
```

Then, reload our extension, refresh `reddit.com` and...

[![console log of reddit tracking data mangler in action](/assets/img/main-world-content-scripts-with-message-passing/injected-script-id-console-message.png)](/assets/img/main-world-content-scripts-with-message-passing/injected-script-id-console-message.png)
_it works!_


You now know how to communicate with content scripts injected into the `MAIN` world, and how to pass arguments to them.

Hope this helped!