---
layout: post
title: "A recipe for steganogravy"
date: 2026-03-27
author: Theodore Brockman
categories: python ai steganography seo recipes
excerpt: how to hide juicy data in plain sight
---

> `author's note`: the following post-hoc project justification is nonsense, I just thought the idea of encoding data in recipe blog posts was fun and silly.

With AI scrapers and government agencies roaming the internet and snarfing down every last byte, hoping to catch you slip up when you mistakenly publish some useful information online, it's becoming harder to share things without it becoming a liability in some way or another.

One wrong step and you find yourself accidentally contributing to your job being automated away, your identity being stolen, or sharing a thought that offends the kind of person that tends to complain a lot about other people getting offended.

What if we could hide data in a place _no one would ever think to look_? What if we could cake our delicious morsels of knowledge in a flavorless slop so devoid of nutritional value even the most ravenous AI agents would spit it out?

Inspired by my uncles who called cabbage rolls "garbage rolls" at family dinners in an attempt to ward off hungry children from reducing the supply of their favorite dish, I devised a tool to fool the data-barons:

## [`tbrockman/recipe-blog-encoding`](https://github.com/tbrockman/recipe-blog-encoding)

is a vibe-coded (and at least partially plagiarized[^1]) Python CLI that allows you to encode secrets as completely natural-looking recipe blog introductions[^2] using [neural linguistic steganography](https://aclanthology.org/D19-1115/). Given some data, a shared prompt, and a model, it can encode your data into something like this:

>
>
> Looking for a quick and delicious way to impress your family and friends? This **One-Pan Garlic Butter Chicken with Herbed Potatoes** is the answer. Packed with flavor and easy to make, this dish is perfect for weeknight dinners or weekend feasts. What makes it stand out? It requires only one pan, minimizes cleanup, and allows the rich flavors to infuse perfectly while everything cooks.
> 
> _[ remaining text cropped for brevity ]_

Where, knowing the prompt + model + other parameters allows you to recover the political messaging hidden in your favorite garlic butter chicken recipe:

```sh
======================================================================
RECOVERED SECRET MESSAGE:
======================================================================
https://www.nokings.org/
======================================================================
```

Just how _babuina_ would have made it.

## how it works

The implementation largely follows [arithmetic coding steganography](https://www.artkpv.net/Tool-Arithmetic-Coding-for-LLM-Steganography/). At a high-level, you can imagine the following:
1. We convert our secret into a binary fraction which represents a point somewhere on a number line between \[0, 1\).
1. We use the model's next token probability distribution to carve out adjacent intervals on the line, where the width of each interval is proportional to the token's probability.
1. We repeatedly choose tokens whose interval contains our point, narrowing the interval further and further, until enough of the leading bits of the start and end points of the interval agree, such that we've encoded our message.

> `author's note`: To make things less verbose, we omit details like embedding a length header in the data so the decoder knows how many bits to decode, using quantization so we're not operating on floats, and dealing with ambiguous re-tokenization when decoding

Here's a simple example with a 3-bit secret:

```
secret: 1 0 1
  → binary fraction: 0.101
  → point on [0, 1): 0.625

step 1: interval [0, 1)
  "The"      [0,    0.4)
  "Looking"  [0.4,  0.55)
  "This"     [0.55, 0.8)   ← 0.625
  "A"        [0.8,  1)
  → select "This", narrow to [0.55, 0.8)

step 2: interval [0.55, 0.8)
  " recipe"  [0.55, 0.7)   ← 0.625
  " is"      [0.7,  0.76)
  " One"     [0.76, 0.8)
  → select " recipe", narrow to [0.55, 0.7)

step 3: interval [0.55, 0.7)
  " is"      [0.55, 0.625)
  " uses"    [0.625, 0.67) ← 0.625
  " for"     [0.67,  0.7)
  → select " uses", narrow to [0.625, 0.67)

[0.625,  0.67) in binary:
[0.101..., 0.101...]
 ^^^        ^^^
leading bits agree: 1 0 1 → secret recovered ✓
```

The generated text would then read: "This recipe uses \.\.\."

Decoding is just the reverse: run the same model with the same prompt, reconstruct the probability distribution at each step, and read the secret bits back out from which tokens appear in the text. It's important to note that both sides need the **exact same model, quantization, top-k, and prompt** -- any mismatch and the distributions diverge, producing garbage.

## limitations

**bpe tokenization**

It turns out that if you pick a token during encoding, decode it to text, and then re-tokenize that text, you don't always get the same token back. For instance, if the text so far tokenizes to `[..., "hel"]` and the model picks the `"lo"` as the next token, the combined text `"hello"` might re-tokenize as a single `"hello"` rather than `"hel" + "lo"`. Then, when decoding, the decoder sees a completely different token at that position and everything after it diverges.

`claude's fix`: Add a filter that, at each step, tests whether a candidate token would survive a round-trip through decoding and tokenization. Tokens that wouldn't are excluded from the CDF before any interval math happens. You lose some encoding capacity, but you can be certain that if your message _can_ be encoded, it can also be decoded.

**`len(secret)` > model end-of-sequence**

What do we do if the prompt we've chosen doesn't provide a path to generate sufficient tokens to encode our secret, converging on end-of-sequence before giving us enough bits?

`answer`: 🤷 choose a better prompt.

**security**

The prompt acts as a shared key, but it's a leaky one. The generated text is statistically conditioned on the prompt, which is partially revealed by its own output (which is generally not regarded as an ideal property for an encryption scheme).

`threat model`: a border agent suspicious of your online presence, passing a note to your friend about who you like through an untrusted intermediary

**local LLM only**

LLM APIs tend to not be deterministic, or expose the raw logits necessary for this to work, so you'll need a locally running LLM (and have good enough hardware/enough patience) to use the tool.

✌️

[^1]: Subsequent investigation suggests that [`artkpv/arithmetic-coding-steganography/`](https://github.com/artkpv/arithmetic-coding-steganography/) is likely where Claude found inspiration for the implementation
[^2]: Or whatever style you choose, it's determined by the prompt