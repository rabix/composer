var fs = require('fs')
var path = require('path')

module.exports = function (filepath, options) {
  options = options || {}

  if (!filepath) return false

  var root = options.root
  var fullpath = (root) ? path.join(root, filepath) : filepath

  try {
    return fs.statSync(fullpath).isFile();
  }
  catch (e) {
    
    // Check exception. If ENOENT - no such file or directory ok, file doesn't exist. 
    // Otherwise something else went wrong, we don't have rights to access the file, ...
    if (e.code != 'ENOENT') 
      throw e;
    
    return false;
  }
}
