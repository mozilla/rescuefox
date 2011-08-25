/*global module,S,test,expect,ok */

// See <http://javascriptmvc.com/docs/FuncUnit.html> for details how on to write
// FuncUnit tests.  <http://funcunit.com> also has useful content.

(function () {
  module("startup", {
    setup: function() {
      S.open("../src/index.html");
    }
  });
  
  test("can find the document body element", function() {
    S("body").exists();
  });
  
})();
