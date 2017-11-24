# @dojo/devtool

<!-- temporary CI - REMOVE -->
[![Build Status](https://travis-ci.org/kitsonk/devtool.svg?branch=master)](https://travis-ci.org/kitsonk/devtool)

<!-- TODO: change and uncomment
[![Build Status](https://travis-ci.org/dojo/<< package-name >>.svg?branch=master)](https://travis-ci.org/dojo/<< package-name >>)
[![codecov](https://codecov.io/gh/dojo/<< package-name >>/branch/master/graph/badge.svg)](https://codecov.io/gh/dojo/<< package-name >>)
[![npm version](https://badge.fury.io/js/dojo-<< package-name >>.svg)](http://badge.fury.io/js/dojo-<< package-name >>)
-->

A development tool extension for Dojo 2.

## Loading

Currently, to use the development tool, you need to create a build and manually load the extension in either Chrome or Firefox.

First clone the repository and perform and `npm install`.  You also will need `@dojo/cli` installed and available.

From the root of the project, do a build:

```
$ dojo build
```

You should now be able to load the extension.

### Chrome

In Chrome, navigate to `chrome://extensions` and enable _Developer mode_.

Select to _Load unpacked extension..._ and navigate to the `devtool` folder, and _Select_ this folder.

You should see the extension now available.  You will likely see some warnings about security information contained in `node_modules`.  This can be removed by doing a `npm prune --production`, but will not be present in the released version.

### Firefox

In Firefox, navigate to `about:debugging#addons` and _Enable add-on debugging_.

Choose to _Load Temporary Add-on_ and navigate to the `devtool/manifest.json`.  This will temporarily add the tool until you quit
the browser.

## Usage

Once you have the extension loaded, when you have the development tools open, you should see a _Dojo 2_ panel.  When you navigate to that panel, you will have the interface to the development tools for Dojo 2.

## Licensing information

© [JS Foundation](https://js.foundation/) & contributors. [New BSD](http://opensource.org/licenses/BSD-3-Clause) and [Apache 2.0](https://opensource.org/licenses/Apache-2.0) licenses.
