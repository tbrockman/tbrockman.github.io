---
layout: post
title:  "hello world"
date:   2020-08-02 21:33:11 -0700
author: Theodore Brockman
categories: plugins github utterances
excerpt: Another day, another software developer entitling their first blog post, "hello world".
---

Another day, another "`hello world`" software developer blog post.

Irony aside, today I'm going to be plugging a *super* cool plugin I just found called [Utterances](https://utteranc.es).

[Utterances](https://utteranc.es) is an open-source Typescript plugin which integrates with [Github](https://github.com) to allow comment sections backed by [Github issues](https://github.com/tbrockman/tbrockman.github.io/issues), which when you combine it with something like [Github pages](https://pages.github.com/), gives the ability to host a static website with comments, for **free**.

Hence, *y'know*, this blog.

One thing I did notice, however, is that the issue is *lazily* created. That is, before the request to create the issue is sent, someone has to have submitted a comment: 

<pre><code class="language-typescript">  const submit = async (markdown: string) => {
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
  };</code></pre>


Usually this would be totally fine, but since this is an application that requires permissions to write messages on your behalf in order to make comments, most developers would probably be wary and choose to post blog comments on the Github issue directly.

But if issue *isn't* created automatically, how will they be able to do that?


