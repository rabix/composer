JSandbox
========

*Version 0.2.3*

<strong>JS</strong>andbox is an open source <strong>J</strong>ava<strong>S</strong>cript
sandboxing library that makes use of HTML5 web workers. JSandbox makes it possible to run
untrusted JavaScript without having to worry about any potential dangers.

Getting Started
---------------

 1. [Download JSandbox][download].
 2. Include `<link rel="jsandbox" href="path/to/jsandbox-worker.js" />` anywhere in your
    document. I recommend putting it in the document's `<head>`.
 3. Place `<script type="text/javascript" src="path/to/jsandbox.js"></script>`
    anywhere after the `<link>` tag.
 4. Read the API documentation below.


  [download]: http://github.com/eligrey/jsandbox/zipball/master


Example Code
------------

This [example code][example] demonstrates the JSandbox API.

  [example]: http://gist.github.com/175160


Tested Working Browsers
-----------------------

* Firefox 3.5+
* Google Chrome 4+


API
---

### Worker script location

Instead of using a `<link>` tag, you may define `JSandbox.url` to specify the location
of the JSandbox worker script.


### Methods

All of these methods can be accessed on the `JSandbox` constructor (in one-use sandboxes)
and `JSandbox` instances:

<dl>
  <dt><code>eval(options)</code></dt>
  <dd>
    <code>eval()</code>s <code>options.data</code>. If <code>options.callback</code> is a
    function, it is passed the results as long as no errors occur. If
    <code>options.onerror</code> is a function and an error occurs, it is passed the error
    object. The code is <code>eval()</code>ed in a top-level pseudo-function-scope. If you
    define a variable using a <code>var</code> statement, the variable is private to the
    eval. <code>this</code> is still the global object. If this method is called on
    <code>JSandbox</code>, the <code>JSandbox</code> object is returned. Otherwise, the ID
    of the request is returned.
  </dd>

  <dt><code>exec(options)</code></dt>
  <dd>
    Executes code in a faster method than <code>eval</code>, but does not pass a
    return value to the callback function (though the function is still called if
    defined). Unlike <code>eval</code>, the code is run in the global scope
    (<code>var</code> statements affect <code>this</code>).
  </dd>

  <dt><code>load(options)</code></dt>
  <dd>
    If <code>options.data</code> is a string, <code>options.data</code> will attempt to be
    loaded in the sandbox. If <code>options.data</code> is an array, every string it
    contains will attempt be loaded. If <code>options.onerror</code> is a function and an
    error is thrown while parsing a script or a script could not be resolved,
    <code>options.onerror</code> is passed the error object. Otherwise,
    <code>options.callback</code> is called when the scripts are finished loading.
  </dd>
</dl>

#### Instance-only methods

These methods can only be on JSandbox instances:

<dl>
  <dt><code>abort(requestID)</code></dt>
  <dd>Aborts a pending request with the ID, <code>requestID</code>.</dd>

  <dt><code>terminate()</code></dt>
  <dd>
    Terminates the worker thread and any pending requests are aborted. You cannot use the
    JSandbox instance on which you called this method after it is called.
  </dd>
</dl>

### `options` object

The following are all of the properties that may be included in an `options` object.

<dl>
  <dt><code>data</code> [<strong>Required</strong>]</dt>
  <dd>
    In the case of <code>eval</code> and <code>exec</code>, it is the code to execute. In
    the case of <code>load</code>, it is an array of the script(s) to load. If you only
    need to load one script, just pass a string instead.
  </dd>

  <dt><code>input</code></dt>
  <dd>
    The input data available to the code via the input variable. The input should be
    JSON-convertible.
  </dd>

  <dt><code>callback</code></dt>
  <dd>
    The callback to pass the return value of the executed code if no exceptions were
    thrown.
  </dd>

  <dt><code>onerror</code></dt>
  <dd>The callback to pass an exception if one is thrown upon executing the code.</dd>
</dl>


### Alternative syntax

Any method that takes an options object can also be called using the following
positional-arguments syntax:

    someMethod(data [, callback] [, input] [, onerror]);

The global `JSandbox` object can also be referenced as `Sandbox`.


![Tracking image](https://in.getclicky.com/212712ns.gif)
