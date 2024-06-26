---
layout: post
title: github paint 🎨
date: 2024-06-28
author: Theodore Brockman
categories: project github action python cli
excerpt: A GitHub Action to help your GitHub profile *really* stand out.
---

A few years ago I encountered the GitHub profile of someone who created a fake commit history in GitHub in order to write their username in their GitHub contribution graph:

> &lt;imagine a cool picture of it here <sup>because <sup>i <sup>can't<sup>find<sup>one🥺</sup></sup></sup></sup></sup>&gt;

Since my contribution graph usually looks like this:

![a picture of a pretty empty contribution graph](/assets/img/github-paint/theos-usual-contribution-graph.png)
_&lt; tumbleweed emoji &gt;_

\.\.\.I've always had it in the back of my mind as something I'd like to take a stab at. Primarily for the sake of solving an interesting problem, but also to mess with recruiters who seem to believe contribution activity strongly correlates with programming ability (*said with chip on shoulder as someone required to use a separate GitHub account for work*).

Since taking a burnout-induced leave-of-absence, I've had some time to explore the problem, which has led to the creation of\.\.\.

## [`tbrockman/github-paint`](https://github.com/tbrockman/github-paint)

a GitHub Action which\-\-given a string, a GitHub API token, and any optional parameters\-\-performs the necessary calculations to create the right number of commits on the right dates to render something like the following in your GitHub profile:

![the text "theo.lol" written in tbrockman's contribution graph](/assets/img/github-paint/example.png)

Since it's a GitHub Action, you can also configure it to run periodically such that your contribution graph always shows the text in the same position as time goes on.

## how it works

The whole thing is a Python [Typer-CLI](https://typer.tiangolo.com/) that primarily makes calls to [`gh`](https://cli.github.com/) and [`git`](https://git-scm.com/), orchestrating the following:

1. First, we create a pixel grid where `width = number_of_weeks_in_timeframe` and `height = 7`.
1. Then, we take our (potentially repeated) text, determine its size given the font (and the dimensions of each glyph used), and position it within the window (given specified padding and alignment).
1. Then, we map each pixel in the window to its corresponding date. 
1. Then, retrieving the users existing contribution activity for each date, we determine (given [some secret sauce](https://stackoverflow.com/a/78686095/23271846) on how commit activity correlates to pixel color) how many additional commits we need on that day. 
    * If we actually need *fewer*, we can handle this by adding more commits to *other* days\-\-assuming our target isn't zero commits (that would be pretty hard to do).
1. Then, after initializing a fresh `git` repository, for each day (in the appropriate chronological order\-\-though this doesn't seem to matter much to GitHub), we forge the necessary number of commits on each date (since `git` allows setting arbitrary commit timestamps).
1. Finally, push the new repository and history (deleting the old one if it exists), and wait a bit for GitHub to render our shiny new contribution graph.

So far, it seems to work pretty well, but it's not *super* battle-tested. if you run into issues feel free to create a pull request in the repository: [https://github.com/tbrockman/github-paint](https://github.com/tbrockman/github-paint).

✌️