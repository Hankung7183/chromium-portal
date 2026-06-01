# Chromium Portal

![Screen Shot 2564-08-28 at 13 51 57](https://user-images.githubusercontent.com/35027979/131209709-94f148a3-1378-4c0b-9e29-490d8061f2c6.png)

A powerful extension designed to enhanced both your browsing routine and Start/New Tab experience for Chromium-based browsers (Google Chrome, Microsoft Edge, Brave, Helium). Say goodbye to boring defaults and hello to enhanced productivity and visual flair.

## Features
- **Dynamic Backgrounds:** Provides customizable and animating background elements.
- **Intelligent Search:** Instant search suggestions powered by Brave independent search index, giving you immediate answers.
- **Quick Access (Bangs):** Utilize Bangs, simple and powerful shortcuts to navigate directly to specific URLs.
- **Shortcuts:** Customize and access your most-used links and commands with a single click.
- **Live Clock:** Stay organized with a real-time, integrated clock display on your New Tab page.
- **AI Slop Included** 🤖

What are bangs? [Learn more about Bangs here](https://duckduckgo.com/bangs)

## Installation
First, download the compiled extension from [Releases](https://github.com/Hankung7183/chromium-portal/releases), or build it yourself by following the instructions in [Building Extension](https://github.com/Hankung7183/chromium-portal/tree/master#building-extension). Next, open your browser's extensions tab. Ensure that "Developer mode" is enabled, and then drag and drop the extension zip file into the tab.

## Building Extension

First, ensure you have installed the Bun JavaScript runtime on your machine. See [Bun](https://bun.com) for detailed instructions.

If Bun is already installed, navigate to the project directory and run
```bash
bun install
```
Next, execute the build command
```bash
bun run build
```
Once the build process is complete, your extension file will be located at `dist/chromium-portal-{version}.zip`

## About this project

This is a personal fork of [Clear Morning](https://github.com/saltyaom/clear-morning) by [@SaltyAom](https://github.com/saltyaom), with some ideas taken from [Blourful](https://github.com/Blourful/New-Tab-Personal-Fork) fork.
> Note: This fork is intended for **individual use only**. While I can’t guarantee I’ll fix every open issue here, I always appreciate the feedback. Feel free to submit PRs for improvements, but please ensure they do not break any functionality or negatively impact the visuals (e.g. flickering contents, broken keybindings).


## Customization
~~It's a single html file dude, just do whatever you want.~~
Yeah, there are a bunch of files compared to the original one, but it is very well organized?, so it's not that hard to figure out :D

To adjust search and suggestion results, you can configure your country using Inspect Element (F12). Open the console and paste the following code
```js
// See src/regions.json for supported countries
localStorage.setItem("country", "kr")

// To revert to the default config
localStorage.removeItem("country")
```

You can also enable or adjust video volume using
```js
// Range: 0 - 1
localStorage.setItem("volume", 0.3)

// To revert to the default config
localStorage.removeItem("volume")
```
