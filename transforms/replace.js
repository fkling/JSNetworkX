var through = require('through');

module.exports = function(filepath, options) {
  var data = '';
  var pattern = new RegExp('\\{\\{(' + Object.keys(options).join('|') + ')\\}\\}', 'g');
  return through(write, end);

  function write (buf) { data += buf; }
  function end() {
    /*jshint validthis:true*/
    data = data.replace(pattern, function(match, key) {
      return options[key];
    });
    this.queue(data);
    this.queue(null);
  }
};
