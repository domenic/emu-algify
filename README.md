# Use Ecmarkup's `<emu-alg>` elements in your HTML

[Ecmarkup](https://github.com/bterlson/ecmarkup) and [Ecmarkdown](https://github.com/bterlson/ecmarkdown) are great spec-writing tools, but sometimes you want to just mix in a little bit of Ecmarkup—the `<emu-alg>` element—without committing wholesale to Ecmarkup's spec-writing framework. `<emu-alg>` then gives you Ecmarkdown-interpreted algorithms, as well as autolinking against ECMAScript abstract operations and those in your own spec.

This tool lets you do that.

## Usage

Emu-algify is primarily used as a command line program:

```
$ emu-algify --help
Use Ecmarkup's <emu-alg> elements in your HTML

emu-algify [--throwing-indicators] < input.html > output.html

Options:
  -t, --throwing-indicators  Add throws/nothrow indicators to headings [boolean]
  --help                     Show help                                 [boolean]
  --version                  Show version number                       [boolean]
```

### Throwing indicators

The bit about "throwing indicators" is mainly for [Bikeshed](https://github.com/tabatkins/bikeshed) users. If you enable it, and you write your algorithm's relevant heading like so:

```html
<h5 aoid="DoSomethingFun" nothrow> <!-- alternately, throws -->
```

then emu-algify will insert something like

```html
<span class="annotation" title="never returns an abrupt completion">nothrow</span>
```

right before any `.self-link` elements in your heading. A fairly specialized feature, but I already wrote the code, and it's serving us well over on [whatwg/streams](https://github.com/whatwg/streams), so there you go.

### Programmatic usage

You can also use this module directly:

```js
"use strict";
const emuAlgify = require("emu-algify");

emuAlgify(inputString, { throwingIndicators: true })
  .then(outputString => { ... })
  .catch(e => console.error(e.stack));
```
