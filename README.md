
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

   //special object SuperMock.Anything can be used as a placeholder to match
   //any argument SuperMock has been called with
   myMock('foo', new Bar(), 'baz');
   myMock.assertCalledWith('foo', SuperMock.Anything, 'baz');

   //this is useful to assert event handlers have been registered, since
   //normally there's no way to know what the callback was
   myMock('on-biriri', function () { console.log('bururu'); });
   myMock.assertCalledWith('on-biriri', SuperMock.Anything);

   //special object SuperMock.Etc can be used as a placeholder to match
   //any number of arguments at the end of the call
   myMock(1, 2, 3, 4, 5);
   myMock.assertCalledWith(1, 2, SuperMock.Etc);

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

  //you can also use callbacks
  var myMock = new SuperMock({ callback: [ null, { success:true}  ]});
  myMock(function(error, message){
    assert.equal(error, null);
    assert.deepEqual(message, { success:true });
  });

  //also, don't forget to name your SuperMocks, They chain as well!
  var myMock = new SuperMock({ mockName: 'myMock' });
  assert.equal(myMock.foo.bar().baz.qux().getName(), 'myMock.foo.bar().baz.qux()');
```

##Patching

SuperMock comes with a convenient way to patch you objects, with patch, mocking becomes easier

patch uses dot `.` notation to patch objects, starting with the module name:

```
   var patch = require('supermock').patch,
       restore = require('supermock').restore;

   //This needs to run right before your test
   //The first argument is what to patch the second is the mock, which defaults to a new SuperMock
   mock = patch('events.EventEmitter.prototype.on');

   //do something with the mocked class or method
   var EventEmitter = require('events').EventEmitter,
       myEmitter = new EventEmitter();

   myEmitter.on('error', console.log);

   //run SuperMock assertions
   myEmitter.on.assertCallCount(1);

   //Restore it back to its original state
   restore('events.EventEmitter.prototype.on');


   //You can patch full modules too!
   mock = patch('events');

   var EventEmitter = require('events').EventEmitter,
       myEmitter = new EventEmitter();

   myEmitter.on('error', console.log);
   myEmitter.on.assertCallCount(1);

   //Restore it back to its original state
   restore('events');
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