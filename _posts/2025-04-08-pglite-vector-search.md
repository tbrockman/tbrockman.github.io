---
layout: post
title: Vector similarity in the browser using `pglite`,&nbsp;`codemirror`, and `react`
date: 2025-04-08
author: Theodore Brockman
categories: example dev pglite vector mantine react
excerpt: an example of using pgvector in the browser
---

github repo --> [`tbrockman/pglite-vector-search`](https://github.com/tbrockman/pglite-vector-search)

<iframe src="https://theo.lol/pglite-vector-search/" width="100%" height="400px" loading="lazy">
  <noscript>
    <p>
      Interactive iframe unavailable.
      <a href="https://theo.lol/pglite-vector-search/">Open target in a new tab</a>.
    </p>
  </noscript>
</iframe>

An interactive example of ingesting CSV data into [`pglite`](https://pglite.dev/) to be filtered using [`pgvector`](https://github.com/pgvector/pgvector), in your browser.

Originally written as a takehome project to create a user interface for an executive to filter through [`data/trials.csv`](data/trials.csv).

## Features
* No server, everything is done in the browser <sup>*(except the things done at build-time)*</sup>
* PostgreSQL instance ([`pglite`](https://pglite.dev/)) for search (using [`pgvector`](https://github.com/pgvector/pgvector), though the [`fuzzystrmatch`](https://www.postgresql.org/docs/current/fuzzystrmatch.html) extension is also available)
* [`transformer.js`](https://huggingface.co/docs/transformers.js/en/index) + [`Supabase/gte-small`](https://huggingface.co/Supabase/gte-small) model for extracting embeddings from user query as well as dataset
* [`CodeMirror`](https://codemirror.net/) editor for writing SQL (used to query the dataset)