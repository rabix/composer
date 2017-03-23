# file-exists

Check if filepath exists and is a file. Returns false for directories.

## Install

```
npm install file-exists --save
```

## Usage

```js
var fileExists = require('file-exists');

console.log(fileExists('/index.html')) // OUTPUTS: true or false
```

### Options

#### fileExists(filepath[, options])

* `filepath` - the path to the file to check if it exists
* `options` - an object of options
  * `root` - the root directory to look in (or cwd)
  
## Run Tests

```
npm install
npm test
```
