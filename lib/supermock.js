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
var RESERVED_ARGS = ['returnValue', 'throws'];

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
      calledWith: []
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
        return returnValue;
      }

      if(name.indexOf('SuperMockPrivate:') === 0){
        return metrics[name.slice(17, name.length)];
      }

      if(name in self){
        return self[name];
      }

      self[name] = new SuperMock();
      return self[name];
    },

    set: function(receiver, name, value) {
      self[name] = value;
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
    metrics.callCount += 1;
    metrics.calledWith.push(Array.prototype.slice.call(arguments, 0));

    if(args.throws instanceof Error){
      throw(args.throws);
    } else {
      if(returnValue === undefined){
        returnValue = new SuperMock();
      }

      return returnValue;
    }
  });
};

/**
 * Gets the call count
 * @return {Number} The amount of time the method was called
 */
SuperMock.prototype.getCallCount = function(){
  return this['SuperMockPrivate:callCount'];
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
 * Asserts that the last thing the mock was called with was arguments
 */
SuperMock.prototype.assertCalledWith = function(){
  var args = Array.prototype.slice.call(arguments, 0),
    calledWith = this.getCalledWith();

  assert.deepEqual(calledWith[calledWith.length-1], args);
};


module.exports = SuperMock;