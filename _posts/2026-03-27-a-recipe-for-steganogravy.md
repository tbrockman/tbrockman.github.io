---
layout: post
title: "A recipe for steganogravy"
date: 2026-03-27
author: Theodore Brockman
categories: python ai steganography seo recipes
excerpt: how to hide juicy secrets in plain sight
---

> `author's note`: the following post-hoc project justification is nonsense, I just thought the idea of actually encoding data in recipe blog posts was fun and silly.

With AI scrapers and government agencies roaming the internet and slurping up every last byte, hoping to catch you slip up when you mistakenly publish some useful information online, it's becoming harder to share things without it becoming a liability in some way or another.

One wrong step and you find yourself accidentally contributing to your job being automated away, your identity being stolen, or sharing a thought that offends the kind of person that tends to complain a lot about other people getting offended.

What if we could hide information in a place _no one would ever think to look_? What if we could cake our delicious morsels of data in a flavorless slop so devoid of nutritional value even the most ravenous AI agents would spit it out?

Inspired by my uncles who spoke poorly of the "garbage rolls" at family dinners in an attempt to ward off hungry but cabbage-wary children (me) from reducing the supply of their favorite entree, I devised a tool to fool the data-barons:

## [`tbrockman/recipe-blog-encoding`](https://github.com/tbrockman/recipe-blog-encoding)

is a vibe-coded (and at least partially plagiarized[^1]) Python CLI that allows you to encode secrets as completely natural-looking recipe blog introductions[^2] using [neural linguistic steganography](https://aclanthology.org/D19-1115/). Given some data, a shared prompt, and a model, it can encode your data into something like this:

>
>
> Looking for a quick and delicious way to impress your family and friends? This **One-Pan Garlic Butter Chicken with Herbed Potatoes** is the answer. Packed with flavor and easy to make, this dish is perfect for weeknight dinners or weekend feasts. What makes it stand out? It requires only one pan, minimizes cleanup, and allows the rich flavors to infuse perfectly while everything cooks.
> 
> _[ remaining text cropped for brevity ]_

Where, knowing the prompt + model + other parameters allows you to recover the hidden political messaging hidden in your favorite garlic butter chicken recipe:

```sh
python main.py decode --stego-file stego_output.txt --model "models/Qwen3-32B-Q4_K_M.gguf" --prompt "<|im_start|>user
You are a blog author writing your stereotypical recipe introduction, aiming to maximize the chances of your recipe being seen by gaming your articles SEO, without being too verbose. Output only the recipe introduction and nothing else, using a maximum of 12 paragraphs. Choose a random recipe.<|im_end|>
<|im_start|>assistant
<think>

</think>"

# ... some time later ...

======================================================================
RECOVERED SECRET MESSAGE:
======================================================================
https://www.nokings.org/
======================================================================
```

Just how _babuina_ would have made it.

## how it works

The implementation largely follows [arithmetic coding steganography](https://www.artkpv.net/Tool-Arithmetic-Coding-for-LLM-Steganography/):

1. Given the current context (the prompt + any previously generated tokens), the model predicts a probability distribution over the next token.
2. We build a [cumulative distribution function](https://en.wikipedia.org/wiki/Cumulative_distribution_function) (CDF) from the top-k most likely candidate tokens (according to the model).
3. Our secret message, encoded in binary, acts as a pointer within the current interval. Whichever token's sub-interval the pointer lands in gets selected, making it simultaneously a natural continuation of the text *and* an encoding of hidden data.
4. The interval narrows, and we repeat until the entire message is consumed.

Decoding is just the reverse: run the same model with the same prompt, reconstruct the identical CDF at each step, and read the secret bits back out from which tokens appear in the text. Both sides need the **exact same model, quantization, top-k, and prompt** — any mismatch and the CDFs diverge, producing garbage.

High-entropy text — verbose, formulaic, lots of equally plausible next words — gives the coder more room to maneuver. Low-entropy text like code or structured data perform worse because there are fewer viable choices to encode bits into. Recipe blog introductions are just one high-entropy choice of many.

## limitations

**interval collapse**

< todo >

[**bpe tokenization**](https://huggingface.co/learn/llm-course/chapter6/5)

It turns out that if you pick a token during encoding, decode it to text, and then re-tokenize that text, you don't always get the same token back. For instance, if the text so far tokenizes to `[..., "hel"]` and the model picks the `"lo"` as the next token, the combined text `"hello"` might re-tokenize as a single `"hello"` rather than `"hel" + "lo"`. Then, when decoding, the decoder sees a completely different token at that position and everything after it diverges.

`claude's fix`: Add a filter that, at each step, tests whether a candidate token would survive a round-trip through decoding and tokenization. Tokens that wouldn't are excluded from the CDF before any interval math happens. You lose some encoding capacity, but you can be certain that if your message _can_ be encoded, it can also be decoded.

**`len(secret)` > model end-of-sequence**

What do we do if the prompt we've chosen doesn't provide a path to generate sufficient tokens to encode our secret, converging on end-of-sequence before giving us enough bits?

`answer`: 🤷 choose a better prompt.

**long secrets**

Each token can carry at most `-log2(p)` bits of secret data, where `p` is the token's probability under the model. As the model generates more text, its predictions tend to become more confident (lower entropy), so the bits-per-token rate drops. For very long secrets the encoding slows to a crawl, and you eventually bump up against the model's context window.

`claude's fix`: Pick a prompt that keeps the model yapping. Recipe introductions are good for this — the model can wax poetic about _garlic butter_ for a remarkably long time. For truly long payloads though, you'd need to split across multiple encoded texts.

**security**

The prompt acts as a shared key, but it's a leaky one. The generated text is statistically conditioned on the prompt, which is partially revealed by its own output (which is generally not regarded as an ideal property for an encryption scheme).

`threat model`: a border agent suspicious of your online presence, not the nsa.

**local LLM only**

LLM APIs tend to not be deterministic, or expose the raw logits necessary for this to work, so you'll need a locally running LLM (and have good enough hardware/enough patience) to use the tool.

✌️

[^1]: Subsequent investigation suggests that [`artkpv/arithmetic-coding-steganography/`](https://github.com/artkpv/arithmetic-coding-steganography/) is likely where Claude found inspiration for the implementation
[^2]: Or whatever style you choose, it's determined by the prompt