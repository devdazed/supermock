
# SuperMock

  Versatile Dynamic Mocking for Node.JS

  SuperMock is a very powerful, lightweight, versatile, buzzword, buzzword, mocking library for
  NodeJS.  Influenced by Python's Mock, SuperMock allows you to write mocks with as little setup
  code as possible.

## Installation

```bash
   npm install supermock
```

## Usage

  SuperMock requires harmony-proxies to be enabled

```bash
   node --harmony-proxies
```

```javascript
   var SuperMock = require('supermock').SuperMock,
       assert = require('assert');

   //myMock is a function, but also an object
   var myMock = new SuperMock();

   myMock('foo', 'bar');

   //SuperMock keeps track of how many times it has been called
   myMock.assertCallCount(1);

   //it also keeps track of what it was called with
   myMock.assertCalledWith('foo', 'bar');

   //SuperMock will return a new SuperMock object for everything
   myMock.foo.bar.baz.something = 42;
   assert.equal(myMock.foo.bar.baz.something, 42);

   myMock.foo.bar.baz.func();
   myMock.foo.bar.baz.func.assertCallCount(1);

   //unless you specify it
   var myMock = new SuperMock({returnValue:'42', foo:'bar'});
   assert.equal(myMock(), 42);
   assert.equal(myMock.foo, 'bar');

   //Supermock can also throw errors
   var myMock = new SuperMock({ throws: new Error('i haz a boo boo') });
   assert.throws(myMock, Error);

  //You can also get the information without having to assert
  myMock.getCallCount() => 1
  myMock.getCalledWith() => [ [] ]

  //you can also access the returnValue
  var myMock = new SuperMock();
  myMock('123')('456')('789');
  myMock.assertCalledWith('123');
  myMock.returnValue.assertCalledWith('456');
  myMock.returnValue.returnValue.assertCalledWith('789');
```


## License 

(The MIT License)

Copyright (c) 2012 Russell Bradberry &lt;devdazed@me.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.