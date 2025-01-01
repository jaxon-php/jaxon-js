[![Build Status](https://github.com/jaxon-php/jaxon-js/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/jaxon-php/jaxon-js/actions)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/jaxon-php/jaxon-js/badges/quality-score.png?b=main)](https://scrutinizer-ci.com/g/jaxon-php/jaxon-js/?branch=main)
[![StyleCI](https://styleci.io/repos/60390067/shield?branch=main)](https://styleci.io/repos/60390067)
[![codecov](https://codecov.io/gh/jaxon-php/jaxon-js/branch/main/graph/badge.svg?token=MKqDVnW7eJ)](https://codecov.io/gh/jaxon-php/jaxon-js)

[![Latest Stable Version](https://poser.pugx.org/jaxon-php/jaxon-js/v/stable)](https://packagist.org/packages/jaxon-php/jaxon-js)
[![Downloads](https://poser.pugx.org/jaxon-php/jaxon-js/downloads)](https://packagist.org/packages/jaxon-php/jaxon-js)
[![License](https://poser.pugx.org/jaxon-php/jaxon-js/license)](https://packagist.org/packages/jaxon-php/jaxon-js)

The Jaxon Javascript Library
============================

This package provides client-side functions for the Jaxon Ajax libraries.

Features
--------

- Construct and send ajax requests to registered Jaxon classes and functions.
  - Execute various callbacks during the requests processing.
- Receive, parse and process responses to Jaxon requests.
  - Execute the instructions they contain in the browser.
- Provide a jQuery's ready()-like feature, to run custom code after page load.

Installation and Configuration
------------------------------

1. Copy the content of the `dist` directory to your webserver.
2. Set the `js.lib.uri` option in the Jaxon PHP library to the link to the directory.

Contribute
----------

- Issue Tracker: github.com/jaxon-php/jaxon-js/issues
- Source Code: github.com/jaxon-php/jaxon-js

License
-------

The project is licensed under the BSD license.
