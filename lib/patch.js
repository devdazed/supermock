var SuperMock = require('./supermock'),
    patched = {},
    NativeModule;

/**
 * Gets our native_module so we can mock those out if needed
 * @return {Object}
 */
process.moduleLoadList.push = function(){
  // `NativeModule.require('native_module')` returns NativeModule
  NativeModule = arguments.callee.caller('native_module');
  // delete the interceptor and forward normal functionality
  delete process.moduleLoadList.push;
  return Array.prototype.push.apply(process.moduleLoadList, arguments);
};
//strap it
require('console');

/**
 * Patches the given target with the specified mock or a new SuperMock
 * The target can be a module, or a function/method inside the module, expressed in dot notation
 *
 * patch('supermock.Foo.prototype.bar')
 */
function patch(target, mock){
  mock = mock || new SuperMock({ mockName: target });

  var parts = target.split('.'),
      base = parts.shift(),
      path = require.resolve(base),
      cache = require.cache;

  if(path in NativeModule._cache){
    cache = NativeModule._cache;
  }

  //we are patching the full module
  if(parts.length === 0){
    patched[target] = require(base);
    cache[path].exports = mock;
  } else {
    var lastpart = parts.pop(),
        obj = parts.reduce(function(memo, part){ return memo[part]; }, cache[path].exports);
    patched[target] = obj[lastpart];
    obj[lastpart] = mock;
  }

  return mock;
}

/**
 * Restores a target back to the original
 * @param target
 */
function restore(target){
  var parts = target.split('.'),
      base = parts.shift(),
      path = require.resolve(base),
      cache = require.cache;

  if(path in NativeModule._cache){
    cache = NativeModule._cache;
  }

  if(parts.length === 0){
    cache[path].exports = patched[target];
  } else {
    var lastpart = parts.pop(),
        obj = parts.reduce(function(memo, part){ return memo[part]; }, cache[path].exports);
    obj[lastpart] = patched[target];
  }
}

module.exports = {
  patch:patch,
  restore:restore
};

