---
layout: post
title:  "hello world"
date:   2020-08-02 21:33:11 -0700
author: Theodore Brockman
categories: plugins github utterances
excerpt: Another day, another software developer entitling their first blog post, "hello world".
---

Another day, another **`hello world`** software developer blog post. 

Today's blog is about me finding a small issue allowing abuse of an open-source application, me notifying the author poorly, the issue not being addressed, and me creating a fork that solves the problem.

Let's skip the introductions and just get into it. 

## Utterances

[Utterances](https://utteranc.es) is an open-source Typescript plugin which integrates with [Github](https://github.com) to allow comment sections backed by [Github issues](https://github.com/tbrockman/tbrockman.github.io/issues), which when you combine it with something like [Github pages](https://pages.github.com/), gives the ability to host a static website with comments, for **free**! It also looks pretty nice and works on mobile.

Being really impressed by the plugin, suspicious of things that implement oauth, and naturally curious, I was eager to know how this small little Javascript application worked.

```html
<script src="https://utteranc.es/client.js"
        repo="tbrockman/tbrockman.github.io"
        issue-term="{{page.title}}"
        theme="github-light"
        crossorigin="anonymous"
        async>
```

With the above script included, Utterances will inject an iframe at the scripts location, and attempt to retrieve the comments linked to an issue specified by the repo and issue-term. It will then render all comments (with remarkably similar styling to Github) in its place.

## Helpful features

It's one more step to navigate to Github directly to post comments on an issue itself, so the author implemented a simple OAuth flow that allows user to permit the app access to create comments on their behalf, which is pretty nice!

![Utterances sign-in to comment](/assets/img/utterance_signin_to_comment.png)

*which then brings you to...*

![Utterances OAuth prompt](/assets/img/utterance_oauth_prompt.png)

And afterwards you're able to comment, *just like you're on Github!*

![Utterances comments](/assets/img/utterance_comments.png)

Usually I just give limited access to any of my accounts whenever anyone asks for it (*what's the worst that could happen?*), but the application is open-source so I thought I would peek around here a bit.

Tracing the code from the start of the flow, we see the **`Sign in to comment`** button sends us to the Utterances API server with a redirect parameter back to our original website.

[`utterances/src/new-comment-component.ts#L72`](https://github.com/utterance/utterances/blob/master/src/new-comment-component.ts#L72)
```html
<a class="btn btn-primary" href="${getLoginUrl(page.url)}" target="_top">Sign in to comment</a>
```

[`utterances/src/oauth.ts#L7`](https://github.com/utterance/utterances/blob/master/src/oauth.ts#L7)
```javascript
export function getLoginUrl(redirect_uri: string) {
  return `${UTTERANCES_API}/authorize?${param({ redirect_uri })}`;
}
```

Going to the server side code, you can see that the Utterances API generates some secret state and builds a redirect URL to request the necessary scopes for the user from Github, and sets a URL where the user will be redirected should they approve the request.

[`utterances-oauth/src/routes.ts#L74`](https://github.com/utterance/utterances-oauth/blob/master/src/routes.ts#L74)
```javascript
async function authorizeRequestHandler(origin: string, search: URLSearchParams) {
  const { client_id, state_password } = settings;

  const appReturnUrl = search.get('redirect_uri');

  if (!appReturnUrl) {
    return badRequest(`"redirect_uri" is required.`);
  }

  const state = await encodeState(appReturnUrl, state_password);
  const redirect_uri = origin + '/authorized';
  return new Response(undefined, {
    status: 302,
    statusText: 'found',
    headers: {
      Location: `${authorizeUrl}?${new URLSearchParams({ client_id, redirect_uri, state })}`
    }
  });
}
```

Assuming successful parsing of received authorization code and state from query parameters, it uses the parsed values for acquiring an access token from Github, which will then be stored as a cookie to be sent along with future requests to the Utterances API.

[`utterances-oauth/src/routes.ts#L123`](https://github.com/utterance/utterances-oauth/blob/master/src/routes.ts#L123)
```javascript
let accessToken: string;
try {
  const response = await fetch(accessTokenUrl, init);
  if (response.ok) {
    const data = await response.json();
    accessToken = data.access_token;
  } else {
    throw new Error(`Access token response had status ${response.status}.`);
  }
} catch (_) {
  return new Response('Unable to load token from GitHub.');
}

const url = new URL(returnUrl);
url.searchParams.set('utterances', accessToken);

return new Response(undefined, {
  status: 302,
  statusText: 'found',
  headers: {
    'Location': url.href,
    'Set-Cookie': `token=${accessToken}; Path=/token; HttpOnly; Secure; SameSite=None; Max-Age=${60 * 60 * 24 * 356}`
  }
});
```

So overall, a relatively fine and safe OAuth flow. Utterances procurs an access token, and then sends it back for me to use to interact directly with the Github API.

*...for the most part.*

## Maybe too helpful

In order to be even more user-friendly, Utterances will go through doing some of the work making issues for you. If the issue the script is linked to doesn't exist yet and someone tries to comment, it'll send a request to the Utterances API which it will dutifully create it ahead of time.

![Utterance bot creating an issue](/assets/img/utterance_bot_issue_creation.png)

Looking into the code, we can see the section where if there is no issue, it sends a create issue request.

[`utterances/src/utterances.ts#L57`](https://github.com/utterance/utterances/blob/master/src/utterances.ts#L57)
```javascript
const submit = async (markdown: string) => {
  await assertOrigin();
  if (!issue) {
    issue = await createIssue(
      page.issueTerm as string,
      page.url,
      page.title,
      page.description || '',
      page.label
    );
    timeline.setIssue(issue);
  }
  const comment = await postComment(issue.number, markdown);
  timeline.insertComment(comment, true);
  newCommentComponent.clear();
};
```

The handler for that request is so eager to please, it almost immediately starts to create the specified issue for you, it just makes sure you're an authenticated Github user first.

[`utterances-oauth/src/routes.ts#L123`](https://github.com/utterance/utterances-oauth/blob/master/src/routes.ts#L123)
```javascript
const authInit = {
  method: 'GET',
  headers: {
    'Authorization': authorization,
    'User-Agent': 'utterances'
  }
};

let authenticated = false;
try {
  const response = await fetch('https://api.github.com/user', authInit);
  authenticated = response.ok;
} catch (_) {
}
if (!authenticated) {
  return new Response(undefined, { status: 401, statusText: 'not authorized' });
}

const init = {
  method: 'POST',
  headers: {
    'Authorization': 'token ' + settings.bot_token,
    'User-Agent': 'utterances',
  },
  body: request.body
};
try {
  const response = await fetch(`https://api.github.com${path}`, init);
  ...
```

This means that any authenticated Github user can use the Utterances API to create issues anywhere the bot is allowed. This is particularly unfortunate as it means that the bot can be abused to create issues wherever it has access. A single fake account could be used for a DoS of the application, simply by consuming the bots rate limit by spamming issue creation.

## Proof of concept

As someone who rarely informs others of application vulnerabilities, I made an error before responsibly disclosing the issue. Initially, I wanted to test out what I had found (and didn't believe it would honestly work), so I sent a handcrafted request to the Utterances API server which ended up [working and immediately disclosing the vulnerability](https://github.com/utterance/utterances/issues/380).

![Testing the Utterances vulernability](/assets/img/utterance_testing_vulnerability.png)

Frantically realizing I had goofed, I sought to contact the author and apologize for my lack of responsible disclosure:
> Hey! I recently found out about Utterances and was super excited to implement it into my own website as I work through a redesign, and then became curious as to how things worked on the backend to prevent things like people maliciously spamming Github issue creation using the API token that the API provides to the client.
> 
> Not to cause you too much alarm or anything, and perhaps you're already aware of this, but the way the backend is currently setup allows anyone to take that token and create arbitrarily many Github issues on any configured repositories, proof of the vulnerability here: https://github.com/utterance/utterances/issues/380 (sorry for testing this out in a public place, in retrospect I realize this wasn't very tactful and I didn't think about it until after it was already done)
> 
> That said, I'm very passionate about the project, and if Github doesn't have any plans to adopt Utterances directly into Github pages or anything that would make my work obsolete, I would love to help address the vulnerability!