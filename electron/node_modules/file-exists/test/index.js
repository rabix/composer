var fileExists = require('../')
var test = require('tape')
var fs = require('fs')
var mkdirp = require('mkdirp')
var rmdir = require('rmdir')

test('file exists', function (t) {
  mkdirp.sync('.tmp')
  fs.writeFileSync('.tmp/index.html', 'test', 'utf8')

  t.ok(fileExists('.tmp/index.html'), 'file does exist')
  t.ok(fileExists('/index.html', {root: '.tmp'}), 'file exists in given root directory')
  t.notOk(fileExists('.tmp'), 'directory is not a file')

  rmdir('.tmp', function () {
    t.end()
  })
})
