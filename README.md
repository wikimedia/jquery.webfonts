jquery.webfonts
===============

jQuery based webfonts extension

## Introduction

jQuery WebFonts extension adds font embedding capability to jquery using the WebFonts technology. The extension provides a flexible way to choose font from a font repository and apply on html elements. 

## Features

* Flexible font repository. The extension can work with any font repository file system. See [more..](https://github.com/wikimedia/jquery.webfonts/wiki/Font-Repository)
* Provides many APIs to customize and extend. See [more...](https://github.com/wikimedia/jquery.webfonts/wiki/API)
* Applies font based on the html `lang` attribute of the elements
* Make sure the font defined using `font-family` style for any elements, either using inline css or external css' available for the reader. - without any extra code. See [Examples](https://github.com/wikimedia/jquery.webfonts/wiki/Examples)

For examples, API, and usage information, please visit [wiki](https://github.com/wikimedia/jquery.webfonts/wiki)

## Test

Before you can run the tests, make sure the submodules are updated:
```
git submodule update --init
```

Then open up `./test/index.html` in your browser.

Some browsers will not be able to load JSON using AJAX if you run
the tests as local files (file://), so you should run them from
a web server (http://).

## License

You may use jquery.webfonts under the terms of either the MIT License or the GNU General
Public License (GPL) Version 2 or later.

See GPL-LICENSE and MIT-LICENSE for details.

## Developers

This project is part of Wikimedia Foundation's Project Milkshake. See https://www.mediawiki.org/wiki/Project_Milkshake