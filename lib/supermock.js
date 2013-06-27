var util = require('util');
var assert = require('assert');

/**
 * We can't continue if node wasn't started with harmony proxies enabled
 */
if(global.Proxy === undefined){
  throw(new ReferenceError('Proxy not found. Please start node with --harmony-proxies'));
}

/**
 * Reserved Arguments.
 * @type {Array}
 */
var RESERVED_ARGS = ['returnValue', 'throws', 'callback', 'mockName'];

/**
 * The main SuperMock object
 *
 * Used in Testing, this object can be accessed like an object
 * or called like a function. It records various statistics about what
 * goes on
 *
 * When called like a function, the return value will be as specified
 * in the `returnValue` field of the args passed in OR a new SuperMock instance
 *
 * @param {Object} args
 *   The arguments to be passed:
 *     returnValue: The value to return when the mock is called like a function
 *     throws: If specified, this is an error that will be thrown when called like a function
 *     anything else: All other parameters will be set as properties on the object
 * @return {*}
 * @constructor
 */
var SuperMock = function(args){
  args = args || {};

  var self = this,
    returnValue = args.returnValue,
    metrics = {
      callCount: 0,
      calledWith: [],
      name:args.mockName || '<anonymous>'
    };

  //set all unknown arguments to properties on the mock
  var keys = Object.keys(args);
  keys.forEach(function(key){
    if(RESERVED_ARGS.indexOf(key) === -1){
      self[key] = args[key];
    }
  });

  //here is where the magic happens.
  return Proxy.createFunction({
    getOwnPropertyDescriptor: function(name) {
      var desc = Object.getOwnPropertyDescriptor(self, name);
      if (desc !== undefined) {
        desc.configurable = true;
      }
      return desc;
    },

    getPropertyDescriptor: function(name){
      var desc = Object.getOwnPropertyDescriptor(self, name);
      if (desc !== undefined) {
        desc.configurable = true;
      }
      return desc;
    },

    getOwnPropertyNames: function() {
      return Object.getOwnPropertyNames(self);
    },

    getPropertyNames: function(){
      return Object.getPropertyNames(self);
    },

    defineProperty: function(name, desc) {
      return Object.defineProperty(self, name, desc);
    },

    delete: function(name) {
      return delete self[name];
    },

    has: function(name) {
      return name in self;
    },

    hasOwn: function(name) {
      return Object.prototype.hasOwnProperty.call(self, name);
    },

    get: function(proxy, name){
      if(name === 'prototype'){
        return SuperMock.prototype;
      }

      if(name === 'returnValue'){
        if(returnValue === undefined){
          returnValue = new SuperMock({ mockName:metrics.name + '()' });
        }
        return returnValue;
      }

      if(name.indexOf('SuperMockPrivate:') === 0){
        return metrics[name.slice(17, name.length)];
      }

      if(name in self){
        return self[name];
      }

      self[name] = new SuperMock({ mockName:metrics.name + '.' + name });
      return self[name];
    },

    set: function(receiver, name, value) {
      if(name === 'returnValue'){
        returnValue = value;
      } else {
        self[name] = value;
      }
      return true;
    },

    enumerate: function() {
      var result = [];
      for (var name in self) {
        if(self.hasOwnProperty(name)){
          result.push(name);
        }
      }
      return result;
    },

    keys: function() {
      return Object.keys(self);
    }
  }, function(){
    var callargs = Array.prototype.slice.call(arguments, 0),
        callback = callargs[callargs.length-1];

    metrics.callCount += 1;
    metrics.calledWith.push(callargs);

    if(args.throws instanceof Error){
      throw(args.throws);
    } else {
      if(returnValue === undefined){
        returnValue = new SuperMock({ mockName:metrics.name + '()' });
      }

      if(args.callback && typeof callback === 'function'){
        callback.apply(self, args.callback);
      }

      return returnValue;
    }
  });
};

/**
 * Change the inspect response so that People know its a SuperMock
 * @return {String}
 */
SuperMock.prototype.inspect = function(){
  var name = this.getName(),
      response = '\033[35m[SuperMock';

  if(name){
    response += ': ' + name;
  }

  response += ']';

  return response + '\033[0m';
};

/**
 * Gets the call count
 * @return {Number} The amount of time the method was called
 */
SuperMock.prototype.getCallCount = function(){
  return this['SuperMockPrivate:callCount'];
};

/**
 * Gets the name
 * @return {Number} The amount of time the method was called
 */
SuperMock.prototype.getName = function(){
  return this['SuperMockPrivate:name'];
};


/**
 * Get an array of arguments that the method was called with
 * @return {*}
 */
SuperMock.prototype.getCalledWith = function(){
  return this['SuperMockPrivate:calledWith'];
};

/**
 * Asserts the callCount
 * @param count The count to assert against
 */
SuperMock.prototype.assertCallCount = function(count){
  assert.equal(this.getCallCount(), count);
};

/**
 * Used as an argument for assertCalledWith, this object matches anything
 */
SuperMock.Anything = {};

/**
 * Change the inspect response so that people know it's SuperMock.Anything
 * @return {String}
 */
SuperMock.Anything.inspect = function(){
  return '\033[35m[SuperMock.Anything]\033[0m';
};

/**
 * Used as an argument for assertCalledWith, this object makes the function
 * ignore any further arguments that might have been passed to the call
 */
SuperMock.Etc = {};

/**
 * Change the inspect response so that people know it's SuperMock.Etc
 * @return {String}
 */
SuperMock.Etc.inspect = function(){
  return '\033[35m[SuperMock.Etc]\033[0m';
};


/**
 * Asserts that the last thing the mock was called with was arguments
 */
SuperMock.prototype.assertCalledWith = function(){
  var args = Array.prototype.slice.call(arguments, 0),
    calledWith = this.getCalledWith(),
    lastCallData = calledWith[calledWith.length-1],
    length;

  assert(lastCallData, 'function was never called');

  if(args.length < lastCallData.length){
    length = lastCallData.length;
  } else {
    length = args.length;
  }

  for(var i = 0; i < length; ++i){
    if(args[i] === SuperMock.Anything){
      continue;
    }

    if(args[i] === SuperMock.Etc){
      assert(i === args.length - 1,
          'there should be no arguments after SuperMock.Etc (got ' + util.inspect(args) + ')');

      break;
    }

    assert.deepEqual(lastCallData[i], args[i]);
  }
};


module.exports = SuperMock;
