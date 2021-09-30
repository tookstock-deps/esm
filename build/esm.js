var __shared__;
const __non_webpack_module__ = module;
const __external__ = { Array: global.Array, Buffer: global.Buffer, Error: global.Error, EvalError: global.EvalError, Function: global.Function, JSON: global.JSON, Object: global.Object, Promise: global.Promise, RangeError: global.RangeError, ReferenceError: global.ReferenceError, Reflect: global.Reflect, SyntaxError: global.SyntaxError, TypeError: global.TypeError, URIError: global.URIError, eval: global.eval };
const console = global.console;

module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/ 	__webpack_require__.d = function (exported, name, get) {
/******/ 	  Reflect.defineProperty(exported, name, {
/******/ 	    configurable: true,
/******/ 	    enumerable: true,
/******/ 	    get
/******/ 	  })
/******/ 	}
/******/ 	__webpack_require__.n = function (exported) {
/******/ 	  exported.a = exported
/******/ 	  return function () { return exported }
/******/ 	}
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/lru-cache/index.js":
/***/ (function(module, exports, __webpack_require__) {

 // A linked list to keep track of recently-used-ness

var Yallist = __webpack_require__("./node_modules/yallist/yallist.js");

var MAX = Symbol('max');
var LENGTH = Symbol('length');
var LENGTH_CALCULATOR = Symbol('lengthCalculator');
var ALLOW_STALE = Symbol('allowStale');
var MAX_AGE = Symbol('maxAge');
var DISPOSE = Symbol('dispose');
var NO_DISPOSE_ON_SET = Symbol('noDisposeOnSet');
var LRU_LIST = Symbol('lruList');
var CACHE = Symbol('cache');
var UPDATE_AGE_ON_GET = Symbol('updateAgeOnGet');

var naiveLength = function () {
  return 1;
}; // lruList is a yallist where the head is the youngest
// item, and the tail is the oldest.  the list contains the Hit
// objects as the entries.
// Each Hit object has a reference to its Yallist.Node.  This
// never changes.
//
// cache is a Map (or PseudoMap) that matches the keys to
// the Yallist.Node object.


class LRUCache {
  constructor(options) {
    if (typeof options === 'number') options = {
      max: options
    };
    if (!options) options = {};
    if (options.max && (typeof options.max !== 'number' || options.max < 0)) throw new TypeError('max must be a non-negative number'); // Kind of weird to have a default max of Infinity, but oh well.

    var max = this[MAX] = options.max || Infinity;
    var lc = options.length || naiveLength;
    this[LENGTH_CALCULATOR] = typeof lc !== 'function' ? naiveLength : lc;
    this[ALLOW_STALE] = options.stale || false;
    if (options.maxAge && typeof options.maxAge !== 'number') throw new TypeError('maxAge must be a number');
    this[MAX_AGE] = options.maxAge || 0;
    this[DISPOSE] = options.dispose;
    this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
    this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
    this.reset();
  } // resize the cache when the max changes.


  set max(mL) {
    if (typeof mL !== 'number' || mL < 0) throw new TypeError('max must be a non-negative number');
    this[MAX] = mL || Infinity;
    trim(this);
  }

  get max() {
    return this[MAX];
  }

  set allowStale(allowStale) {
    this[ALLOW_STALE] = !!allowStale;
  }

  get allowStale() {
    return this[ALLOW_STALE];
  }

  set maxAge(mA) {
    if (typeof mA !== 'number') throw new TypeError('maxAge must be a non-negative number');
    this[MAX_AGE] = mA;
    trim(this);
  }

  get maxAge() {
    return this[MAX_AGE];
  } // resize the cache when the lengthCalculator changes.


  set lengthCalculator(lC) {
    var _this = this;

    if (typeof lC !== 'function') lC = naiveLength;

    if (lC !== this[LENGTH_CALCULATOR]) {
      this[LENGTH_CALCULATOR] = lC;
      this[LENGTH] = 0;
      this[LRU_LIST].forEach(function (hit) {
        hit.length = _this[LENGTH_CALCULATOR](hit.value, hit.key);
        _this[LENGTH] += hit.length;
      });
    }

    trim(this);
  }

  get lengthCalculator() {
    return this[LENGTH_CALCULATOR];
  }

  get length() {
    return this[LENGTH];
  }

  get itemCount() {
    return this[LRU_LIST].length;
  }

  rforEach(fn, thisp) {
    thisp = thisp || this;

    for (var walker = this[LRU_LIST].tail; walker !== null;) {
      var prev = walker.prev;
      forEachStep(this, fn, walker, thisp);
      walker = prev;
    }
  }

  forEach(fn, thisp) {
    thisp = thisp || this;

    for (var walker = this[LRU_LIST].head; walker !== null;) {
      var next = walker.next;
      forEachStep(this, fn, walker, thisp);
      walker = next;
    }
  }

  keys() {
    return this[LRU_LIST].toArray().map(function (k) {
      return k.key;
    });
  }

  values() {
    return this[LRU_LIST].toArray().map(function (k) {
      return k.value;
    });
  }

  reset() {
    var _this2 = this;

    if (this[DISPOSE] && this[LRU_LIST] && this[LRU_LIST].length) {
      this[LRU_LIST].forEach(function (hit) {
        return _this2[DISPOSE](hit.key, hit.value);
      });
    }

    this[CACHE] = new Map(); // hash of items by key

    this[LRU_LIST] = new Yallist(); // list of items in order of use recency

    this[LENGTH] = 0; // length of items in the list
  }

  dump() {
    var _this3 = this;

    return this[LRU_LIST].map(function (hit) {
      return isStale(_this3, hit) ? false : {
        k: hit.key,
        v: hit.value,
        e: hit.now + (hit.maxAge || 0)
      };
    }).toArray().filter(function (h) {
      return h;
    });
  }

  dumpLru() {
    return this[LRU_LIST];
  }

  set(key, value, maxAge) {
    maxAge = maxAge || this[MAX_AGE];
    if (maxAge && typeof maxAge !== 'number') throw new TypeError('maxAge must be a number');
    var now = maxAge ? Date.now() : 0;
    var len = this[LENGTH_CALCULATOR](value, key);

    if (this[CACHE].has(key)) {
      if (len > this[MAX]) {
        del(this, this[CACHE].get(key));
        return false;
      }

      var node = this[CACHE].get(key);
      var item = node.value; // dispose of the old one before overwriting
      // split out into 2 ifs for better coverage tracking

      if (this[DISPOSE]) {
        if (!this[NO_DISPOSE_ON_SET]) this[DISPOSE](key, item.value);
      }

      item.now = now;
      item.maxAge = maxAge;
      item.value = value;
      this[LENGTH] += len - item.length;
      item.length = len;
      this.get(key);
      trim(this);
      return true;
    }

    var hit = new Entry(key, value, len, now, maxAge); // oversized objects fall out of cache automatically.

    if (hit.length > this[MAX]) {
      if (this[DISPOSE]) this[DISPOSE](key, value);
      return false;
    }

    this[LENGTH] += hit.length;
    this[LRU_LIST].unshift(hit);
    this[CACHE].set(key, this[LRU_LIST].head);
    trim(this);
    return true;
  }

  has(key) {
    if (!this[CACHE].has(key)) return false;
    var hit = this[CACHE].get(key).value;
    return !isStale(this, hit);
  }

  get(key) {
    return get(this, key, true);
  }

  peek(key) {
    return get(this, key, false);
  }

  pop() {
    var node = this[LRU_LIST].tail;
    if (!node) return null;
    del(this, node);
    return node.value;
  }

  del(key) {
    del(this, this[CACHE].get(key));
  }

  load(arr) {
    // reset the cache
    this.reset();
    var now = Date.now(); // A previous serialized cache has the most recent items first

    for (var l = arr.length - 1; l >= 0; l--) {
      var hit = arr[l];
      var expiresAt = hit.e || 0;
      if (expiresAt === 0) // the item was created without expiration in a non aged cache
        this.set(hit.k, hit.v);else {
        var maxAge = expiresAt - now; // dont add already expired items

        if (maxAge > 0) {
          this.set(hit.k, hit.v, maxAge);
        }
      }
    }
  }

  prune() {
    var _this4 = this;

    this[CACHE].forEach(function (value, key) {
      return get(_this4, key, false);
    });
  }

}

var get = function (self, key, doUse) {
  var node = self[CACHE].get(key);

  if (node) {
    var hit = node.value;

    if (isStale(self, hit)) {
      del(self, node);
      if (!self[ALLOW_STALE]) return undefined;
    } else {
      if (doUse) {
        if (self[UPDATE_AGE_ON_GET]) node.value.now = Date.now();
        self[LRU_LIST].unshiftNode(node);
      }
    }

    return hit.value;
  }
};

var isStale = function (self, hit) {
  if (!hit || !hit.maxAge && !self[MAX_AGE]) return false;
  var diff = Date.now() - hit.now;
  return hit.maxAge ? diff > hit.maxAge : self[MAX_AGE] && diff > self[MAX_AGE];
};

var trim = function (self) {
  if (self[LENGTH] > self[MAX]) {
    for (var walker = self[LRU_LIST].tail; self[LENGTH] > self[MAX] && walker !== null;) {
      // We know that we're about to delete this one, and also
      // what the next least recently used key will be, so just
      // go ahead and set it now.
      var prev = walker.prev;
      del(self, walker);
      walker = prev;
    }
  }
};

var del = function (self, node) {
  if (node) {
    var hit = node.value;
    if (self[DISPOSE]) self[DISPOSE](hit.key, hit.value);
    self[LENGTH] -= hit.length;
    self[CACHE].delete(hit.key);
    self[LRU_LIST].removeNode(node);
  }
};

class Entry {
  constructor(key, value, length, now, maxAge) {
    this.key = key;
    this.value = value;
    this.length = length;
    this.now = now;
    this.maxAge = maxAge || 0;
  }

}

var forEachStep = function (self, fn, node, thisp) {
  var hit = node.value;

  if (isStale(self, hit)) {
    del(self, node);
    if (!self[ALLOW_STALE]) hit = undefined;
  }

  if (hit) fn.call(thisp, hit.value, hit.key, self);
};

module.exports = LRUCache;

/***/ }),

/***/ "./node_modules/semver/classes/comparator.js":
/***/ (function(module, exports, __webpack_require__) {

var ANY = Symbol('SemVer ANY'); // hoisted class for cyclic dependency

class Comparator {
  static get ANY() {
    return ANY;
  }

  constructor(comp, options) {
    options = parseOptions(options);

    if (comp instanceof Comparator) {
      if (comp.loose === !!options.loose) {
        return comp;
      } else {
        comp = comp.value;
      }
    }

    debug('comparator', comp, options);
    this.options = options;
    this.loose = !!options.loose;
    this.parse(comp);

    if (this.semver === ANY) {
      this.value = '';
    } else {
      this.value = this.operator + this.semver.version;
    }

    debug('comp', this);
  }

  parse(comp) {
    var r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
    var m = comp.match(r);

    if (!m) {
      throw new TypeError(`Invalid comparator: ${comp}`);
    }

    this.operator = m[1] !== undefined ? m[1] : '';

    if (this.operator === '=') {
      this.operator = '';
    } // if it literally is just '>' or '' then allow anything.


    if (!m[2]) {
      this.semver = ANY;
    } else {
      this.semver = new SemVer(m[2], this.options.loose);
    }
  }

  toString() {
    return this.value;
  }

  test(version) {
    debug('Comparator.test', version, this.options.loose);

    if (this.semver === ANY || version === ANY) {
      return true;
    }

    if (typeof version === 'string') {
      try {
        version = new SemVer(version, this.options);
      } catch (er) {
        return false;
      }
    }

    return cmp(version, this.operator, this.semver, this.options);
  }

  intersects(comp, options) {
    if (!(comp instanceof Comparator)) {
      throw new TypeError('a Comparator is required');
    }

    if (!options || typeof options !== 'object') {
      options = {
        loose: !!options,
        includePrerelease: false
      };
    }

    if (this.operator === '') {
      if (this.value === '') {
        return true;
      }

      return new Range(comp.value, options).test(this.value);
    } else if (comp.operator === '') {
      if (comp.value === '') {
        return true;
      }

      return new Range(this.value, options).test(comp.semver);
    }

    var sameDirectionIncreasing = (this.operator === '>=' || this.operator === '>') && (comp.operator === '>=' || comp.operator === '>');
    var sameDirectionDecreasing = (this.operator === '<=' || this.operator === '<') && (comp.operator === '<=' || comp.operator === '<');
    var sameSemVer = this.semver.version === comp.semver.version;
    var differentDirectionsInclusive = (this.operator === '>=' || this.operator === '<=') && (comp.operator === '>=' || comp.operator === '<=');
    var oppositeDirectionsLessThan = cmp(this.semver, '<', comp.semver, options) && (this.operator === '>=' || this.operator === '>') && (comp.operator === '<=' || comp.operator === '<');
    var oppositeDirectionsGreaterThan = cmp(this.semver, '>', comp.semver, options) && (this.operator === '<=' || this.operator === '<') && (comp.operator === '>=' || comp.operator === '>');
    return sameDirectionIncreasing || sameDirectionDecreasing || sameSemVer && differentDirectionsInclusive || oppositeDirectionsLessThan || oppositeDirectionsGreaterThan;
  }

}

module.exports = Comparator;

var parseOptions = __webpack_require__("./node_modules/semver/internal/parse-options.js");

var _require = __webpack_require__("./node_modules/semver/internal/re.js"),
    re = _require.re,
    t = _require.t;

var cmp = __webpack_require__("./node_modules/semver/functions/cmp.js");

var debug = __webpack_require__("./node_modules/semver/internal/debug.js");

var SemVer = __webpack_require__("./node_modules/semver/classes/semver.js");

var Range = __webpack_require__("./node_modules/semver/classes/range.js");

/***/ }),

/***/ "./node_modules/semver/classes/range.js":
/***/ (function(module, exports, __webpack_require__) {

// hoisted class for cyclic dependency
class Range {
  constructor(range, options) {
    var _this = this;

    options = parseOptions(options);

    if (range instanceof Range) {
      if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
        return range;
      } else {
        return new Range(range.raw, options);
      }
    }

    if (range instanceof Comparator) {
      // just put it in the set and return
      this.raw = range.value;
      this.set = [[range]];
      this.format();
      return this;
    }

    this.options = options;
    this.loose = !!options.loose;
    this.includePrerelease = !!options.includePrerelease; // First, split based on boolean or ||

    this.raw = range;
    this.set = range.split(/\s*\|\|\s*/) // map the range to a 2d array of comparators
    .map(function (range) {
      return _this.parseRange(range.trim());
    }) // throw out any comparator lists that are empty
    // this generally means that it was not a valid range, which is allowed
    // in loose mode, but will still throw if the WHOLE range is invalid.
    .filter(function (c) {
      return c.length;
    });

    if (!this.set.length) {
      throw new TypeError(`Invalid SemVer Range: ${range}`);
    } // if we have any that are not the null set, throw out null sets.


    if (this.set.length > 1) {
      // keep the first one, in case they're all null sets
      var first = this.set[0];
      this.set = this.set.filter(function (c) {
        return !isNullSet(c[0]);
      });
      if (this.set.length === 0) this.set = [first];else if (this.set.length > 1) {
        // if we have any that are *, then the range is just *
        for (var _i = 0, _this$set = this.set, _length = _this$set == null ? 0 : _this$set.length; _i < _length; _i++) {
          var c = _this$set[_i];

          if (c.length === 1 && isAny(c[0])) {
            this.set = [c];
            break;
          }
        }
      }
    }

    this.format();
  }

  format() {
    this.range = this.set.map(function (comps) {
      return comps.join(' ').trim();
    }).join('||').trim();
    return this.range;
  }

  toString() {
    return this.range;
  }

  parseRange(range) {
    var _this2 = this;

    range = range.trim(); // memoize range parsing for performance.
    // this is a very hot path, and fully deterministic.

    var memoOpts = Object.keys(this.options).join(',');
    var memoKey = `parseRange:${memoOpts}:${range}`;
    var cached = cache.get(memoKey);
    if (cached) return cached;
    var loose = this.options.loose; // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`

    var hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
    range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
    debug('hyphen replace', range); // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`

    range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
    debug('comparator trim', range, re[t.COMPARATORTRIM]); // `~ 1.2.3` => `~1.2.3`

    range = range.replace(re[t.TILDETRIM], tildeTrimReplace); // `^ 1.2.3` => `^1.2.3`

    range = range.replace(re[t.CARETTRIM], caretTrimReplace); // normalize spaces

    range = range.split(/\s+/).join(' '); // At this point, the range is completely trimmed and
    // ready to be split into comparators.

    var compRe = loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
    var rangeList = range.split(' ').map(function (comp) {
      return parseComparator(comp, _this2.options);
    }).join(' ').split(/\s+/) // >=0.0.0 is equivalent to *
    .map(function (comp) {
      return replaceGTE0(comp, _this2.options);
    }) // in loose mode, throw out any that are not valid comparators
    .filter(this.options.loose ? function (comp) {
      return !!comp.match(compRe);
    } : function () {
      return true;
    }).map(function (comp) {
      return new Comparator(comp, _this2.options);
    }); // if any comparators are the null set, then replace with JUST null set
    // if more than one comparator, remove any * comparators
    // also, don't include the same comparator more than once

    var l = rangeList.length;
    var rangeMap = new Map();

    for (var _i2 = 0, _length2 = rangeList == null ? 0 : rangeList.length; _i2 < _length2; _i2++) {
      var comp = rangeList[_i2];
      if (isNullSet(comp)) return [comp];
      rangeMap.set(comp.value, comp);
    }

    if (rangeMap.size > 1 && rangeMap.has('')) rangeMap.delete('');
    var result = [...rangeMap.values()];
    cache.set(memoKey, result);
    return result;
  }

  intersects(range, options) {
    if (!(range instanceof Range)) {
      throw new TypeError('a Range is required');
    }

    return this.set.some(function (thisComparators) {
      return isSatisfiable(thisComparators, options) && range.set.some(function (rangeComparators) {
        return isSatisfiable(rangeComparators, options) && thisComparators.every(function (thisComparator) {
          return rangeComparators.every(function (rangeComparator) {
            return thisComparator.intersects(rangeComparator, options);
          });
        });
      });
    });
  } // if ANY of the sets match ALL of its comparators, then pass


  test(version) {
    if (!version) {
      return false;
    }

    if (typeof version === 'string') {
      try {
        version = new SemVer(version, this.options);
      } catch (er) {
        return false;
      }
    }

    for (var i = 0; i < this.set.length; i++) {
      if (testSet(this.set[i], version, this.options)) {
        return true;
      }
    }

    return false;
  }

}

module.exports = Range;

var LRU = __webpack_require__("./node_modules/lru-cache/index.js");

var cache = new LRU({
  max: 1000
});

var parseOptions = __webpack_require__("./node_modules/semver/internal/parse-options.js");

var Comparator = __webpack_require__("./node_modules/semver/classes/comparator.js");

var debug = __webpack_require__("./node_modules/semver/internal/debug.js");

var SemVer = __webpack_require__("./node_modules/semver/classes/semver.js");

var _require = __webpack_require__("./node_modules/semver/internal/re.js"),
    re = _require.re,
    t = _require.t,
    comparatorTrimReplace = _require.comparatorTrimReplace,
    tildeTrimReplace = _require.tildeTrimReplace,
    caretTrimReplace = _require.caretTrimReplace;

var isNullSet = function (c) {
  return c.value === '<0.0.0-0';
};

var isAny = function (c) {
  return c.value === '';
}; // take a set of comparators and determine whether there
// exists a version which can satisfy it


var isSatisfiable = function (comparators, options) {
  "use strict";

  var result = true;
  var remainingComparators = comparators.slice();
  var testComparator = remainingComparators.pop();

  while (result && remainingComparators.length) {
    result = remainingComparators.every(function (otherComparator) {
      return testComparator.intersects(otherComparator, options);
    });
    testComparator = remainingComparators.pop();
  }

  return result;
}; // comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.


var parseComparator = function (comp, options) {
  "use strict";

  debug('comp', comp, options);
  comp = replaceCarets(comp, options);
  debug('caret', comp);
  comp = replaceTildes(comp, options);
  debug('tildes', comp);
  comp = replaceXRanges(comp, options);
  debug('xrange', comp);
  comp = replaceStars(comp, options);
  debug('stars', comp);
  return comp;
};

var isX = function (id) {
  return !id || id.toLowerCase() === 'x' || id === '*';
}; // ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0


var replaceTildes = function (comp, options) {
  return comp.trim().split(/\s+/).map(function (comp) {
    "use strict";

    return replaceTilde(comp, options);
  }).join(' ');
};

var replaceTilde = function (comp, options) {
  "use strict";

  var r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
  return comp.replace(r, function (_, M, m, p, pr) {
    debug('tilde', comp, _, M, m, p, pr);
    var ret;

    if (isX(M)) {
      ret = '';
    } else if (isX(m)) {
      ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
    } else if (isX(p)) {
      // ~1.2 == >=1.2.0 <1.3.0-0
      ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
    } else if (pr) {
      debug('replaceTilde pr', pr);
      ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
    } else {
      // ~1.2.3 == >=1.2.3 <1.3.0-0
      ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
    }

    debug('tilde return', ret);
    return ret;
  });
}; // ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
// ^1.2.3 --> >=1.2.3 <2.0.0-0
// ^1.2.0 --> >=1.2.0 <2.0.0-0


var replaceCarets = function (comp, options) {
  return comp.trim().split(/\s+/).map(function (comp) {
    "use strict";

    return replaceCaret(comp, options);
  }).join(' ');
};

var replaceCaret = function (comp, options) {
  "use strict";

  debug('caret', comp, options);
  var r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
  var z = options.includePrerelease ? '-0' : '';
  return comp.replace(r, function (_, M, m, p, pr) {
    debug('caret', comp, _, M, m, p, pr);
    var ret;

    if (isX(M)) {
      ret = '';
    } else if (isX(m)) {
      ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
    } else if (isX(p)) {
      if (M === '0') {
        ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
      } else {
        ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
      }
    } else if (pr) {
      debug('replaceCaret pr', pr);

      if (M === '0') {
        if (m === '0') {
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
        } else {
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        }
      } else {
        ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
      }
    } else {
      debug('no pr');

      if (M === '0') {
        if (m === '0') {
          ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
        } else {
          ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
        }
      } else {
        ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
      }
    }

    debug('caret return', ret);
    return ret;
  });
};

var replaceXRanges = function (comp, options) {
  "use strict";

  debug('replaceXRanges', comp, options);
  return comp.split(/\s+/).map(function (comp) {
    return replaceXRange(comp, options);
  }).join(' ');
};

var replaceXRange = function (comp, options) {
  "use strict";

  comp = comp.trim();
  var r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
  return comp.replace(r, function (ret, gtlt, M, m, p, pr) {
    debug('xRange', comp, ret, gtlt, M, m, p, pr);
    var xM = isX(M);
    var xm = xM || isX(m);
    var xp = xm || isX(p);
    var anyX = xp;

    if (gtlt === '=' && anyX) {
      gtlt = '';
    } // if we're including prereleases in the match, then we need
    // to fix this to -0, the lowest possible prerelease value


    pr = options.includePrerelease ? '-0' : '';

    if (xM) {
      if (gtlt === '>' || gtlt === '<') {
        // nothing is allowed
        ret = '<0.0.0-0';
      } else {
        // nothing is forbidden
        ret = '*';
      }
    } else if (gtlt && anyX) {
      // we know patch is an x, because we have any x at all.
      // replace X with 0
      if (xm) {
        m = 0;
      }

      p = 0;

      if (gtlt === '>') {
        // >1 => >=2.0.0
        // >1.2 => >=1.3.0
        gtlt = '>=';

        if (xm) {
          M = +M + 1;
          m = 0;
          p = 0;
        } else {
          m = +m + 1;
          p = 0;
        }
      } else if (gtlt === '<=') {
        // <=0.7.x is actually <0.8.0, since any 0.7.x should
        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
        gtlt = '<';

        if (xm) {
          M = +M + 1;
        } else {
          m = +m + 1;
        }
      }

      if (gtlt === '<') pr = '-0';
      ret = `${gtlt + M}.${m}.${p}${pr}`;
    } else if (xm) {
      ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
    } else if (xp) {
      ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
    }

    debug('xRange return', ret);
    return ret;
  });
}; // Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.


var replaceStars = function (comp, options) {
  "use strict";

  debug('replaceStars', comp, options); // Looseness is ignored here.  star is always as loose as it gets!

  return comp.trim().replace(re[t.STAR], '');
};

var replaceGTE0 = function (comp, options) {
  "use strict";

  debug('replaceGTE0', comp, options);
  return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], '');
}; // This function is passed to string.replace(re[t.HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0-0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0-0


var hyphenReplace = function (incPr) {
  return function ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) {
    "use strict";

    if (isX(fM)) {
      from = '';
    } else if (isX(fm)) {
      from = `>=${fM}.0.0${incPr ? '-0' : ''}`;
    } else if (isX(fp)) {
      from = `>=${fM}.${fm}.0${incPr ? '-0' : ''}`;
    } else if (fpr) {
      from = `>=${from}`;
    } else {
      from = `>=${from}${incPr ? '-0' : ''}`;
    }

    if (isX(tM)) {
      to = '';
    } else if (isX(tm)) {
      to = `<${+tM + 1}.0.0-0`;
    } else if (isX(tp)) {
      to = `<${tM}.${+tm + 1}.0-0`;
    } else if (tpr) {
      to = `<=${tM}.${tm}.${tp}-${tpr}`;
    } else if (incPr) {
      to = `<${tM}.${tm}.${+tp + 1}-0`;
    } else {
      to = `<=${to}`;
    }

    return `${from} ${to}`.trim();
  };
};

var testSet = function (set, version, options) {
  "use strict";

  for (var i = 0; i < set.length; i++) {
    if (!set[i].test(version)) {
      return false;
    }
  }

  if (version.prerelease.length && !options.includePrerelease) {
    // Find the set of versions that are allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (var _i3 = 0; _i3 < set.length; _i3++) {
      debug(set[_i3].semver);

      if (set[_i3].semver === Comparator.ANY) {
        continue;
      }

      if (set[_i3].semver.prerelease.length > 0) {
        var allowed = set[_i3].semver;

        if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
          return true;
        }
      }
    } // Version has a -pre, but it's not one of the ones we like.


    return false;
  }

  return true;
};

/***/ }),

/***/ "./node_modules/semver/classes/semver.js":
/***/ (function(module, exports, __webpack_require__) {

var debug = __webpack_require__("./node_modules/semver/internal/debug.js");

var _require = __webpack_require__("./node_modules/semver/internal/constants.js"),
    MAX_LENGTH = _require.MAX_LENGTH,
    MAX_SAFE_INTEGER = _require.MAX_SAFE_INTEGER;

var _require2 = __webpack_require__("./node_modules/semver/internal/re.js"),
    re = _require2.re,
    t = _require2.t;

var parseOptions = __webpack_require__("./node_modules/semver/internal/parse-options.js");

var _require3 = __webpack_require__("./node_modules/semver/internal/identifiers.js"),
    compareIdentifiers = _require3.compareIdentifiers;

class SemVer {
  constructor(version, options) {
    options = parseOptions(options);

    if (version instanceof SemVer) {
      if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
        return version;
      } else {
        version = version.version;
      }
    } else if (typeof version !== 'string') {
      throw new TypeError(`Invalid Version: ${version}`);
    }

    if (version.length > MAX_LENGTH) {
      throw new TypeError(`version is longer than ${MAX_LENGTH} characters`);
    }

    debug('SemVer', version, options);
    this.options = options;
    this.loose = !!options.loose; // this isn't actually relevant for versions, but keep it so that we
    // don't run into trouble passing this.options around.

    this.includePrerelease = !!options.includePrerelease;
    var m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);

    if (!m) {
      throw new TypeError(`Invalid Version: ${version}`);
    }

    this.raw = version; // these are actually numbers

    this.major = +m[1];
    this.minor = +m[2];
    this.patch = +m[3];

    if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
      throw new TypeError('Invalid major version');
    }

    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
      throw new TypeError('Invalid minor version');
    }

    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
      throw new TypeError('Invalid patch version');
    } // numberify any prerelease numeric ids


    if (!m[4]) {
      this.prerelease = [];
    } else {
      this.prerelease = m[4].split('.').map(function (id) {
        if (/^[0-9]+$/.test(id)) {
          var num = +id;

          if (num >= 0 && num < MAX_SAFE_INTEGER) {
            return num;
          }
        }

        return id;
      });
    }

    this.build = m[5] ? m[5].split('.') : [];
    this.format();
  }

  format() {
    this.version = `${this.major}.${this.minor}.${this.patch}`;

    if (this.prerelease.length) {
      this.version += `-${this.prerelease.join('.')}`;
    }

    return this.version;
  }

  toString() {
    return this.version;
  }

  compare(other) {
    debug('SemVer.compare', this.version, this.options, other);

    if (!(other instanceof SemVer)) {
      if (typeof other === 'string' && other === this.version) {
        return 0;
      }

      other = new SemVer(other, this.options);
    }

    if (other.version === this.version) {
      return 0;
    }

    return this.compareMain(other) || this.comparePre(other);
  }

  compareMain(other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options);
    }

    return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
  }

  comparePre(other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options);
    } // NOT having a prerelease is > having one


    if (this.prerelease.length && !other.prerelease.length) {
      return -1;
    } else if (!this.prerelease.length && other.prerelease.length) {
      return 1;
    } else if (!this.prerelease.length && !other.prerelease.length) {
      return 0;
    }

    var i = 0;

    do {
      var a = this.prerelease[i];
      var b = other.prerelease[i];
      debug('prerelease compare', i, a, b);

      if (a === undefined && b === undefined) {
        return 0;
      } else if (b === undefined) {
        return 1;
      } else if (a === undefined) {
        return -1;
      } else if (a === b) {
        continue;
      } else {
        return compareIdentifiers(a, b);
      }
    } while (++i);
  }

  compareBuild(other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options);
    }

    var i = 0;

    do {
      var a = this.build[i];
      var b = other.build[i];
      debug('prerelease compare', i, a, b);

      if (a === undefined && b === undefined) {
        return 0;
      } else if (b === undefined) {
        return 1;
      } else if (a === undefined) {
        return -1;
      } else if (a === b) {
        continue;
      } else {
        return compareIdentifiers(a, b);
      }
    } while (++i);
  } // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.


  inc(release, identifier) {
    switch (release) {
      case 'premajor':
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor = 0;
        this.major++;
        this.inc('pre', identifier);
        break;

      case 'preminor':
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor++;
        this.inc('pre', identifier);
        break;

      case 'prepatch':
        // If this is already a prerelease, it will bump to the next version
        // drop any prereleases that might already exist, since they are not
        // relevant at this point.
        this.prerelease.length = 0;
        this.inc('patch', identifier);
        this.inc('pre', identifier);
        break;
      // If the input is a non-prerelease version, this acts the same as
      // prepatch.

      case 'prerelease':
        if (this.prerelease.length === 0) {
          this.inc('patch', identifier);
        }

        this.inc('pre', identifier);
        break;

      case 'major':
        // If this is a pre-major version, bump up to the same major version.
        // Otherwise increment major.
        // 1.0.0-5 bumps to 1.0.0
        // 1.1.0 bumps to 2.0.0
        if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
          this.major++;
        }

        this.minor = 0;
        this.patch = 0;
        this.prerelease = [];
        break;

      case 'minor':
        // If this is a pre-minor version, bump up to the same minor version.
        // Otherwise increment minor.
        // 1.2.0-5 bumps to 1.2.0
        // 1.2.1 bumps to 1.3.0
        if (this.patch !== 0 || this.prerelease.length === 0) {
          this.minor++;
        }

        this.patch = 0;
        this.prerelease = [];
        break;

      case 'patch':
        // If this is not a pre-release version, it will increment the patch.
        // If it is a pre-release it will bump up to the same patch version.
        // 1.2.0-5 patches to 1.2.0
        // 1.2.0 patches to 1.2.1
        if (this.prerelease.length === 0) {
          this.patch++;
        }

        this.prerelease = [];
        break;
      // This probably shouldn't be used publicly.
      // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.

      case 'pre':
        if (this.prerelease.length === 0) {
          this.prerelease = [0];
        } else {
          var i = this.prerelease.length;

          while (--i >= 0) {
            if (typeof this.prerelease[i] === 'number') {
              this.prerelease[i]++;
              i = -2;
            }
          }

          if (i === -1) {
            // didn't increment anything
            this.prerelease.push(0);
          }
        }

        if (identifier) {
          // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
          // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
          if (this.prerelease[0] === identifier) {
            if (isNaN(this.prerelease[1])) {
              this.prerelease = [identifier, 0];
            }
          } else {
            this.prerelease = [identifier, 0];
          }
        }

        break;

      default:
        throw new Error(`invalid increment argument: ${release}`);
    }

    this.format();
    this.raw = this.version;
    return this;
  }

}

module.exports = SemVer;

/***/ }),

/***/ "./node_modules/semver/functions/clean.js":
/***/ (function(module, exports, __webpack_require__) {

var parse = __webpack_require__("./node_modules/semver/functions/parse.js");

var clean = function (version, options) {
  "use strict";

  var s = parse(version.trim().replace(/^[=v]+/, ''), options);
  return s ? s.version : null;
};

module.exports = clean;

/***/ }),

/***/ "./node_modules/semver/functions/cmp.js":
/***/ (function(module, exports, __webpack_require__) {

var eq = __webpack_require__("./node_modules/semver/functions/eq.js");

var neq = __webpack_require__("./node_modules/semver/functions/neq.js");

var gt = __webpack_require__("./node_modules/semver/functions/gt.js");

var gte = __webpack_require__("./node_modules/semver/functions/gte.js");

var lt = __webpack_require__("./node_modules/semver/functions/lt.js");

var lte = __webpack_require__("./node_modules/semver/functions/lte.js");

var cmp = function (a, op, b, loose) {
  "use strict";

  switch (op) {
    case '===':
      if (typeof a === 'object') a = a.version;
      if (typeof b === 'object') b = b.version;
      return a === b;

    case '!==':
      if (typeof a === 'object') a = a.version;
      if (typeof b === 'object') b = b.version;
      return a !== b;

    case '':
    case '=':
    case '==':
      return eq(a, b, loose);

    case '!=':
      return neq(a, b, loose);

    case '>':
      return gt(a, b, loose);

    case '>=':
      return gte(a, b, loose);

    case '<':
      return lt(a, b, loose);

    case '<=':
      return lte(a, b, loose);

    default:
      throw new TypeError(`Invalid operator: ${op}`);
  }
};

module.exports = cmp;

/***/ }),

/***/ "./node_modules/semver/functions/coerce.js":
/***/ (function(module, exports, __webpack_require__) {

var SemVer = __webpack_require__("./node_modules/semver/classes/semver.js");

var parse = __webpack_require__("./node_modules/semver/functions/parse.js");

var _require = __webpack_require__("./node_modules/semver/internal/re.js"),
    re = _require.re,
    t = _require.t;

var coerce = function (version, options) {
  "use strict";

  if (version instanceof SemVer) {
    return version;
  }

  if (typeof version === 'number') {
    version = String(version);
  }

  if (typeof version !== 'string') {
    return null;
  }

  options = options || {};
  var match = null;

  if (!options.rtl) {
    match = version.match(re[t.COERCE]);
  } else {
    // Find the right-most coercible string that does not share
    // a terminus with a more left-ward coercible string.
    // Eg, '1.2.3.4' wants to coerce '2.3.4', not '3.4' or '4'
    //
    // Walk through the string checking with a /g regexp
    // Manually set the index so as to pick up overlapping matches.
    // Stop when we get a match that ends at the string end, since no
    // coercible string can be more right-ward without the same terminus.
    var next;

    while ((next = re[t.COERCERTL].exec(version)) && (!match || match.index + match[0].length !== version.length)) {
      if (!match || next.index + next[0].length !== match.index + match[0].length) {
        match = next;
      }

      re[t.COERCERTL].lastIndex = next.index + next[1].length + next[2].length;
    } // leave it in a clean state


    re[t.COERCERTL].lastIndex = -1;
  }

  if (match === null) return null;
  return parse(`${match[2]}.${match[3] || '0'}.${match[4] || '0'}`, options);
};

module.exports = coerce;

/***/ }),

/***/ "./node_modules/semver/functions/compare-build.js":
/***/ (function(module, exports, __webpack_require__) {

var SemVer = __webpack_require__("./node_modules/semver/classes/semver.js");

var compareBuild = function (a, b, loose) {
  "use strict";

  var versionA = new SemVer(a, loose);
  var versionB = new SemVer(b, loose);
  return versionA.compare(versionB) || versionA.compareBuild(versionB);
};

module.exports = compareBuild;

/***/ }),

/***/ "./node_modules/semver/functions/compare-loose.js":
/***/ (function(module, exports, __webpack_require__) {

var compare = __webpack_require__("./node_modules/semver/functions/compare.js");

var compareLoose = function (a, b) {
  return compare(a, b, true);
};

module.exports = compareLoose;

/***/ }),

/***/ "./node_modules/semver/functions/compare.js":
/***/ (function(module, exports, __webpack_require__) {

var SemVer = __webpack_require__("./node_modules/semver/classes/semver.js");

var compare = function (a, b, loose) {
  return new SemVer(a, loose).compare(new SemVer(b, loose));
};

module.exports = compare;

/***/ }),

/***/ "./node_modules/semver/functions/diff.js":
/***/ (function(module, exports, __webpack_require__) {

var parse = __webpack_require__("./node_modules/semver/functions/parse.js");

var eq = __webpack_require__("./node_modules/semver/functions/eq.js");

var diff = function (version1, version2) {
  "use strict";

  if (eq(version1, version2)) {
    return null;
  } else {
    var v1 = parse(version1);
    var v2 = parse(version2);
    var hasPre = v1.prerelease.length || v2.prerelease.length;
    var prefix = hasPre ? 'pre' : '';
    var defaultResult = hasPre ? 'prerelease' : '';

    for (var key in v1) {
      if (key === 'major' || key === 'minor' || key === 'patch') {
        if (v1[key] !== v2[key]) {
          return prefix + key;
        }
      }
    }

    return defaultResult; // may be undefined
  }
};

module.exports = diff;

/***/ }),

/***/ "./node_modules/semver/functions/eq.js":
/***/ (function(module, exports, __webpack_require__) {

var compare = __webpack_require__("./node_modules/semver/functions/compare.js");

var eq = function (a, b, loose) {
  return compare(a, b, loose) === 0;
};

module.exports = eq;

/***/ }),

/***/ "./node_modules/semver/functions/gt.js":
/***/ (function(module, exports, __webpack_require__) {

var compare = __webpack_require__("./node_modules/semver/functions/compare.js");

var gt = function (a, b, loose) {
  return compare(a, b, loose) > 0;
};

module.exports = gt;

/***/ }),

/***/ "./node_modules/semver/functions/gte.js":
/***/ (function(module, exports, __webpack_require__) {

var compare = __webpack_require__("./node_modules/semver/functions/compare.js");

var gte = function (a, b, loose) {
  return compare(a, b, loose) >= 0;
};

module.exports = gte;

/***/ }),

/***/ "./node_modules/semver/functions/inc.js":
/***/ (function(module, exports, __webpack_require__) {

var SemVer = __webpack_require__("./node_modules/semver/classes/semver.js");

var inc = function (version, release, options, identifier) {
  "use strict";

  if (typeof options === 'string') {
    identifier = options;
    options = undefined;
  }

  try {
    return new SemVer(version, options).inc(release, identifier).version;
  } catch (er) {
    return null;
  }
};

module.exports = inc;

/***/ }),

/***/ "./node_modules/semver/functions/lt.js":
/***/ (function(module, exports, __webpack_require__) {

var compare = __webpack_require__("./node_modules/semver/functions/compare.js");

var lt = function (a, b, loose) {
  return compare(a, b, loose) < 0;
};

module.exports = lt;

/***/ }),

/***/ "./node_modules/semver/functions/lte.js":
/***/ (function(module, exports, __webpack_require__) {

var compare = __webpack_require__("./node_modules/semver/functions/compare.js");

var lte = function (a, b, loose) {
  return compare(a, b, loose) <= 0;
};

module.exports = lte;

/***/ }),

/***/ "./node_modules/semver/functions/major.js":
/***/ (function(module, exports, __webpack_require__) {

var SemVer = __webpack_require__("./node_modules/semver/classes/semver.js");

var major = function (a, loose) {
  return new SemVer(a, loose).major;
};

module.exports = major;

/***/ }),

/***/ "./node_modules/semver/functions/minor.js":
/***/ (function(module, exports, __webpack_require__) {

var SemVer = __webpack_require__("./node_modules/semver/classes/semver.js");

var minor = function (a, loose) {
  return new SemVer(a, loose).minor;
};

module.exports = minor;

/***/ }),

/***/ "./node_modules/semver/functions/neq.js":
/***/ (function(module, exports, __webpack_require__) {

var compare = __webpack_require__("./node_modules/semver/functions/compare.js");

var neq = function (a, b, loose) {
  return compare(a, b, loose) !== 0;
};

module.exports = neq;

/***/ }),

/***/ "./node_modules/semver/functions/parse.js":
/***/ (function(module, exports, __webpack_require__) {

var _require = __webpack_require__("./node_modules/semver/internal/constants.js"),
    MAX_LENGTH = _require.MAX_LENGTH;

var _require2 = __webpack_require__("./node_modules/semver/internal/re.js"),
    re = _require2.re,
    t = _require2.t;

var SemVer = __webpack_require__("./node_modules/semver/classes/semver.js");

var parseOptions = __webpack_require__("./node_modules/semver/internal/parse-options.js");

var parse = function (version, options) {
  "use strict";

  options = parseOptions(options);

  if (version instanceof SemVer) {
    return version;
  }

  if (typeof version !== 'string') {
    return null;
  }

  if (version.length > MAX_LENGTH) {
    return null;
  }

  var r = options.loose ? re[t.LOOSE] : re[t.FULL];

  if (!r.test(version)) {
    return null;
  }

  try {
    return new SemVer(version, options);
  } catch (er) {
    return null;
  }
};

module.exports = parse;

/***/ }),

/***/ "./node_modules/semver/functions/patch.js":
/***/ (function(module, exports, __webpack_require__) {

var SemVer = __webpack_require__("./node_modules/semver/classes/semver.js");

var patch = function (a, loose) {
  return new SemVer(a, loose).patch;
};

module.exports = patch;

/***/ }),

/***/ "./node_modules/semver/functions/prerelease.js":
/***/ (function(module, exports, __webpack_require__) {

var parse = __webpack_require__("./node_modules/semver/functions/parse.js");

var prerelease = function (version, options) {
  "use strict";

  var parsed = parse(version, options);
  return parsed && parsed.prerelease.length ? parsed.prerelease : null;
};

module.exports = prerelease;

/***/ }),

/***/ "./node_modules/semver/functions/rcompare.js":
/***/ (function(module, exports, __webpack_require__) {

var compare = __webpack_require__("./node_modules/semver/functions/compare.js");

var rcompare = function (a, b, loose) {
  return compare(b, a, loose);
};

module.exports = rcompare;

/***/ }),

/***/ "./node_modules/semver/functions/rsort.js":
/***/ (function(module, exports, __webpack_require__) {

var compareBuild = __webpack_require__("./node_modules/semver/functions/compare-build.js");

var rsort = function (list, loose) {
  return list.sort(function (a, b) {
    return compareBuild(b, a, loose);
  });
};

module.exports = rsort;

/***/ }),

/***/ "./node_modules/semver/functions/satisfies.js":
/***/ (function(module, exports, __webpack_require__) {

var Range = __webpack_require__("./node_modules/semver/classes/range.js");

var satisfies = function (version, range, options) {
  "use strict";

  try {
    range = new Range(range, options);
  } catch (er) {
    return false;
  }

  return range.test(version);
};

module.exports = satisfies;

/***/ }),

/***/ "./node_modules/semver/functions/sort.js":
/***/ (function(module, exports, __webpack_require__) {

var compareBuild = __webpack_require__("./node_modules/semver/functions/compare-build.js");

var sort = function (list, loose) {
  return list.sort(function (a, b) {
    return compareBuild(a, b, loose);
  });
};

module.exports = sort;

/***/ }),

/***/ "./node_modules/semver/functions/valid.js":
/***/ (function(module, exports, __webpack_require__) {

var parse = __webpack_require__("./node_modules/semver/functions/parse.js");

var valid = function (version, options) {
  "use strict";

  var v = parse(version, options);
  return v ? v.version : null;
};

module.exports = valid;

/***/ }),

/***/ "./node_modules/semver/index.js":
/***/ (function(module, exports, __webpack_require__) {

// just pre-load all the stuff that index.js lazily exports
var internalRe = __webpack_require__("./node_modules/semver/internal/re.js");

module.exports = {
  re: internalRe.re,
  src: internalRe.src,
  tokens: internalRe.t,
  SEMVER_SPEC_VERSION: __webpack_require__("./node_modules/semver/internal/constants.js").SEMVER_SPEC_VERSION,
  SemVer: __webpack_require__("./node_modules/semver/classes/semver.js"),
  compareIdentifiers: __webpack_require__("./node_modules/semver/internal/identifiers.js").compareIdentifiers,
  rcompareIdentifiers: __webpack_require__("./node_modules/semver/internal/identifiers.js").rcompareIdentifiers,
  parse: __webpack_require__("./node_modules/semver/functions/parse.js"),
  valid: __webpack_require__("./node_modules/semver/functions/valid.js"),
  clean: __webpack_require__("./node_modules/semver/functions/clean.js"),
  inc: __webpack_require__("./node_modules/semver/functions/inc.js"),
  diff: __webpack_require__("./node_modules/semver/functions/diff.js"),
  major: __webpack_require__("./node_modules/semver/functions/major.js"),
  minor: __webpack_require__("./node_modules/semver/functions/minor.js"),
  patch: __webpack_require__("./node_modules/semver/functions/patch.js"),
  prerelease: __webpack_require__("./node_modules/semver/functions/prerelease.js"),
  compare: __webpack_require__("./node_modules/semver/functions/compare.js"),
  rcompare: __webpack_require__("./node_modules/semver/functions/rcompare.js"),
  compareLoose: __webpack_require__("./node_modules/semver/functions/compare-loose.js"),
  compareBuild: __webpack_require__("./node_modules/semver/functions/compare-build.js"),
  sort: __webpack_require__("./node_modules/semver/functions/sort.js"),
  rsort: __webpack_require__("./node_modules/semver/functions/rsort.js"),
  gt: __webpack_require__("./node_modules/semver/functions/gt.js"),
  lt: __webpack_require__("./node_modules/semver/functions/lt.js"),
  eq: __webpack_require__("./node_modules/semver/functions/eq.js"),
  neq: __webpack_require__("./node_modules/semver/functions/neq.js"),
  gte: __webpack_require__("./node_modules/semver/functions/gte.js"),
  lte: __webpack_require__("./node_modules/semver/functions/lte.js"),
  cmp: __webpack_require__("./node_modules/semver/functions/cmp.js"),
  coerce: __webpack_require__("./node_modules/semver/functions/coerce.js"),
  Comparator: __webpack_require__("./node_modules/semver/classes/comparator.js"),
  Range: __webpack_require__("./node_modules/semver/classes/range.js"),
  satisfies: __webpack_require__("./node_modules/semver/functions/satisfies.js"),
  toComparators: __webpack_require__("./node_modules/semver/ranges/to-comparators.js"),
  maxSatisfying: __webpack_require__("./node_modules/semver/ranges/max-satisfying.js"),
  minSatisfying: __webpack_require__("./node_modules/semver/ranges/min-satisfying.js"),
  minVersion: __webpack_require__("./node_modules/semver/ranges/min-version.js"),
  validRange: __webpack_require__("./node_modules/semver/ranges/valid.js"),
  outside: __webpack_require__("./node_modules/semver/ranges/outside.js"),
  gtr: __webpack_require__("./node_modules/semver/ranges/gtr.js"),
  ltr: __webpack_require__("./node_modules/semver/ranges/ltr.js"),
  intersects: __webpack_require__("./node_modules/semver/ranges/intersects.js"),
  simplifyRange: __webpack_require__("./node_modules/semver/ranges/simplify.js"),
  subset: __webpack_require__("./node_modules/semver/ranges/subset.js")
};

/***/ }),

/***/ "./node_modules/semver/internal/constants.js":
/***/ (function(module, exports) {

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
var SEMVER_SPEC_VERSION = '2.0.0';
var MAX_LENGTH = 256;
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||
/* istanbul ignore next */
9007199254740991; // Max safe segment length for coercion.

var MAX_SAFE_COMPONENT_LENGTH = 16;
module.exports = {
  SEMVER_SPEC_VERSION,
  MAX_LENGTH,
  MAX_SAFE_INTEGER,
  MAX_SAFE_COMPONENT_LENGTH
};

/***/ }),

/***/ "./node_modules/semver/internal/debug.js":
/***/ (function(module, exports) {

var debug = typeof process === 'object' && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? function (...args) {
  return console.error('SEMVER', ...args);
} : function () {
  "use strict";
};
module.exports = debug;

/***/ }),

/***/ "./node_modules/semver/internal/identifiers.js":
/***/ (function(module, exports) {

var numeric = /^[0-9]+$/;

var compareIdentifiers = function (a, b) {
  "use strict";

  var anum = numeric.test(a);
  var bnum = numeric.test(b);

  if (anum && bnum) {
    a = +a;
    b = +b;
  }

  return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
};

var rcompareIdentifiers = function (a, b) {
  return compareIdentifiers(b, a);
};

module.exports = {
  compareIdentifiers,
  rcompareIdentifiers
};

/***/ }),

/***/ "./node_modules/semver/internal/parse-options.js":
/***/ (function(module, exports) {

// parse out just the options we care about so we always get a consistent
// obj with keys in a consistent order.
var opts = ['includePrerelease', 'loose', 'rtl'];

var parseOptions = function (options) {
  return !options ? {} : typeof options !== 'object' ? {
    loose: true
  } : opts.filter(function (k) {
    return options[k];
  }).reduce(function (options, k) {
    "use strict";

    options[k] = true;
    return options;
  }, {});
};

module.exports = parseOptions;

/***/ }),

/***/ "./node_modules/semver/internal/re.js":
/***/ (function(module, exports, __webpack_require__) {

var _require = __webpack_require__("./node_modules/semver/internal/constants.js"),
    MAX_SAFE_COMPONENT_LENGTH = _require.MAX_SAFE_COMPONENT_LENGTH;

var debug = __webpack_require__("./node_modules/semver/internal/debug.js");

exports = module.exports = {}; // The actual regexps go on exports.re

var re = exports.re = [];
var src = exports.src = [];
var t = exports.t = {};
var R = 0;

var createToken = function (name, value, isGlobal) {
  "use strict";

  var index = R++;
  debug(index, value);
  t[name] = index;
  src[index] = value;
  re[index] = new RegExp(value, isGlobal ? 'g' : undefined);
}; // The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.
// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.


createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*');
createToken('NUMERICIDENTIFIERLOOSE', '[0-9]+'); // ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

createToken('NONNUMERICIDENTIFIER', '\\d*[a-zA-Z-][a-zA-Z0-9-]*'); // ## Main Version
// Three dot-separated numeric identifiers.

createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` + `(${src[t.NUMERICIDENTIFIER]})\\.` + `(${src[t.NUMERICIDENTIFIER]})`);
createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` + `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` + `(${src[t.NUMERICIDENTIFIERLOOSE]})`); // ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NUMERICIDENTIFIER]}|${src[t.NONNUMERICIDENTIFIER]})`);
createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NUMERICIDENTIFIERLOOSE]}|${src[t.NONNUMERICIDENTIFIER]})`); // ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`); // ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

createToken('BUILDIDENTIFIER', '[0-9A-Za-z-]+'); // ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`); // ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.
// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

createToken('FULLPLAIN', `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
createToken('FULL', `^${src[t.FULLPLAIN]}$`); // like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.

createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`);
createToken('GTLT', '((?:<|>)?=?)'); // Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.

createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` + `(?:\\.(${src[t.XRANGEIDENTIFIER]})` + `(?:\\.(${src[t.XRANGEIDENTIFIER]})` + `(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?` + `)?)?`);
createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?` + `)?)?`);
createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`); // Coercion.
// Extract anything that could conceivably be a part of a valid semver

createToken('COERCE', `${'(^|[^\\d])' + '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` + `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` + `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` + `(?:$|[^\\d])`);
createToken('COERCERTL', src[t.COERCE], true); // Tilde ranges.
// Meaning is "reasonably at or greater than"

createToken('LONETILDE', '(?:~>?)');
createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true);
exports.tildeTrimReplace = '$1~';
createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`); // Caret ranges.
// Meaning is "at least and backwards compatible with"

createToken('LONECARET', '(?:\\^)');
createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true);
exports.caretTrimReplace = '$1^';
createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`); // A simple gt/lt/eq thing, or just "" to indicate "any version"

createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`); // An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`

createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
exports.comparatorTrimReplace = '$1$2$3'; // Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.

createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` + `\\s+-\\s+` + `(${src[t.XRANGEPLAIN]})` + `\\s*$`);
createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` + `\\s+-\\s+` + `(${src[t.XRANGEPLAINLOOSE]})` + `\\s*$`); // Star ranges basically just allow anything at all.

createToken('STAR', '(<|>)?=?\\s*\\*'); // >=0.0.0 is like a star

createToken('GTE0', '^\\s*>=\\s*0\.0\.0\\s*$');
createToken('GTE0PRE', '^\\s*>=\\s*0\.0\.0-0\\s*$');

/***/ }),

/***/ "./node_modules/semver/ranges/gtr.js":
/***/ (function(module, exports, __webpack_require__) {

// Determine if version is greater than all the versions possible in the range.
var outside = __webpack_require__("./node_modules/semver/ranges/outside.js");

var gtr = function (version, range, options) {
  return outside(version, range, '>', options);
};

module.exports = gtr;

/***/ }),

/***/ "./node_modules/semver/ranges/intersects.js":
/***/ (function(module, exports, __webpack_require__) {

var Range = __webpack_require__("./node_modules/semver/classes/range.js");

var intersects = function (r1, r2, options) {
  "use strict";

  r1 = new Range(r1, options);
  r2 = new Range(r2, options);
  return r1.intersects(r2);
};

module.exports = intersects;

/***/ }),

/***/ "./node_modules/semver/ranges/ltr.js":
/***/ (function(module, exports, __webpack_require__) {

var outside = __webpack_require__("./node_modules/semver/ranges/outside.js"); // Determine if version is less than all the versions possible in the range


var ltr = function (version, range, options) {
  return outside(version, range, '<', options);
};

module.exports = ltr;

/***/ }),

/***/ "./node_modules/semver/ranges/max-satisfying.js":
/***/ (function(module, exports, __webpack_require__) {

var SemVer = __webpack_require__("./node_modules/semver/classes/semver.js");

var Range = __webpack_require__("./node_modules/semver/classes/range.js");

var maxSatisfying = function (versions, range, options) {
  "use strict";

  var max = null;
  var maxSV = null;
  var rangeObj = null;

  try {
    rangeObj = new Range(range, options);
  } catch (er) {
    return null;
  }

  versions.forEach(function (v) {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!max || maxSV.compare(v) === -1) {
        // compare(max, v, true)
        max = v;
        maxSV = new SemVer(max, options);
      }
    }
  });
  return max;
};

module.exports = maxSatisfying;

/***/ }),

/***/ "./node_modules/semver/ranges/min-satisfying.js":
/***/ (function(module, exports, __webpack_require__) {

var SemVer = __webpack_require__("./node_modules/semver/classes/semver.js");

var Range = __webpack_require__("./node_modules/semver/classes/range.js");

var minSatisfying = function (versions, range, options) {
  "use strict";

  var min = null;
  var minSV = null;
  var rangeObj = null;

  try {
    rangeObj = new Range(range, options);
  } catch (er) {
    return null;
  }

  versions.forEach(function (v) {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!min || minSV.compare(v) === 1) {
        // compare(min, v, true)
        min = v;
        minSV = new SemVer(min, options);
      }
    }
  });
  return min;
};

module.exports = minSatisfying;

/***/ }),

/***/ "./node_modules/semver/ranges/min-version.js":
/***/ (function(module, exports, __webpack_require__) {

var SemVer = __webpack_require__("./node_modules/semver/classes/semver.js");

var Range = __webpack_require__("./node_modules/semver/classes/range.js");

var gt = __webpack_require__("./node_modules/semver/functions/gt.js");

var minVersion = function (range, loose) {
  "use strict";

  range = new Range(range, loose);
  var minver = new SemVer('0.0.0');

  if (range.test(minver)) {
    return minver;
  }

  minver = new SemVer('0.0.0-0');

  if (range.test(minver)) {
    return minver;
  }

  minver = null;

  var _loop = function (i) {
    var comparators = range.set[i];
    var setMin = null;
    comparators.forEach(function (comparator) {
      // Clone to avoid manipulating the comparator's semver object.
      var compver = new SemVer(comparator.semver.version);

      switch (comparator.operator) {
        case '>':
          if (compver.prerelease.length === 0) {
            compver.patch++;
          } else {
            compver.prerelease.push(0);
          }

          compver.raw = compver.format();

        /* fallthrough */

        case '':
        case '>=':
          if (!setMin || gt(compver, setMin)) {
            setMin = compver;
          }

          break;

        case '<':
        case '<=':
          /* Ignore maximum versions */
          break;

        /* istanbul ignore next */

        default:
          throw new Error(`Unexpected operation: ${comparator.operator}`);
      }
    });
    if (setMin && (!minver || gt(minver, setMin))) minver = setMin;
  };

  for (var i = 0; i < range.set.length; ++i) {
    _loop(i);
  }

  if (minver && range.test(minver)) {
    return minver;
  }

  return null;
};

module.exports = minVersion;

/***/ }),

/***/ "./node_modules/semver/ranges/outside.js":
/***/ (function(module, exports, __webpack_require__) {

var SemVer = __webpack_require__("./node_modules/semver/classes/semver.js");

var Comparator = __webpack_require__("./node_modules/semver/classes/comparator.js");

var ANY = Comparator.ANY;

var Range = __webpack_require__("./node_modules/semver/classes/range.js");

var satisfies = __webpack_require__("./node_modules/semver/functions/satisfies.js");

var gt = __webpack_require__("./node_modules/semver/functions/gt.js");

var lt = __webpack_require__("./node_modules/semver/functions/lt.js");

var lte = __webpack_require__("./node_modules/semver/functions/lte.js");

var gte = __webpack_require__("./node_modules/semver/functions/gte.js");

var outside = function (version, range, hilo, options) {
  "use strict";

  version = new SemVer(version, options);
  range = new Range(range, options);
  var gtfn, ltefn, ltfn, comp, ecomp;

  switch (hilo) {
    case '>':
      gtfn = gt;
      ltefn = lte;
      ltfn = lt;
      comp = '>';
      ecomp = '>=';
      break;

    case '<':
      gtfn = lt;
      ltefn = gte;
      ltfn = gt;
      comp = '<';
      ecomp = '<=';
      break;

    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  } // If it satisfies the range it is not outside


  if (satisfies(version, range, options)) {
    return false;
  } // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.


  var _loop = function (i) {
    var comparators = range.set[i];
    var high = null;
    var low = null;
    comparators.forEach(function (comparator) {
      if (comparator.semver === ANY) {
        comparator = new Comparator('>=0.0.0');
      }

      high = high || comparator;
      low = low || comparator;

      if (gtfn(comparator.semver, high.semver, options)) {
        high = comparator;
      } else if (ltfn(comparator.semver, low.semver, options)) {
        low = comparator;
      }
    }); // If the edge version comparator has a operator then our version
    // isn't outside it

    if (high.operator === comp || high.operator === ecomp) {
      return {
        v: false
      };
    } // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range


    if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
      return {
        v: false
      };
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return {
        v: false
      };
    }
  };

  for (var i = 0; i < range.set.length; ++i) {
    var _ret = _loop(i);

    if (typeof _ret === "object") return _ret.v;
  }

  return true;
};

module.exports = outside;

/***/ }),

/***/ "./node_modules/semver/ranges/simplify.js":
/***/ (function(module, exports, __webpack_require__) {

// given a set of versions and a range, create a "simplified" range
// that includes the same versions that the original range does
// If the original range is shorter than the simplified one, return that.
var satisfies = __webpack_require__("./node_modules/semver/functions/satisfies.js");

var compare = __webpack_require__("./node_modules/semver/functions/compare.js");

module.exports = function (versions, range, options) {
  "use strict";

  var set = [];
  var min = null;
  var prev = null;
  var v = versions.sort(function (a, b) {
    return compare(a, b, options);
  });

  for (var _i = 0, _length = v == null ? 0 : v.length; _i < _length; _i++) {
    var version = v[_i];
    var included = satisfies(version, range, options);

    if (included) {
      prev = version;
      if (!min) min = version;
    } else {
      if (prev) {
        set.push([min, prev]);
      }

      prev = null;
      min = null;
    }
  }

  if (min) set.push([min, null]);
  var ranges = [];

  for (var _i2 = 0, _length2 = set == null ? 0 : set.length; _i2 < _length2; _i2++) {
    var _set$_i = set[_i2],
        _min = _set$_i[0],
        max = _set$_i[1];
    if (_min === max) ranges.push(_min);else if (!max && _min === v[0]) ranges.push('*');else if (!max) ranges.push(`>=${_min}`);else if (_min === v[0]) ranges.push(`<=${max}`);else ranges.push(`${_min} - ${max}`);
  }

  var simplified = ranges.join(' || ');
  var original = typeof range.raw === 'string' ? range.raw : String(range);
  return simplified.length < original.length ? simplified : range;
};

/***/ }),

/***/ "./node_modules/semver/ranges/subset.js":
/***/ (function(module, exports, __webpack_require__) {

var Range = __webpack_require__("./node_modules/semver/classes/range.js");

var Comparator = __webpack_require__("./node_modules/semver/classes/comparator.js");

var ANY = Comparator.ANY;

var satisfies = __webpack_require__("./node_modules/semver/functions/satisfies.js");

var compare = __webpack_require__("./node_modules/semver/functions/compare.js"); // Complex range `r1 || r2 || ...` is a subset of `R1 || R2 || ...` iff:
// - Every simple range `r1, r2, ...` is a null set, OR
// - Every simple range `r1, r2, ...` which is not a null set is a subset of
//   some `R1, R2, ...`
//
// Simple range `c1 c2 ...` is a subset of simple range `C1 C2 ...` iff:
// - If c is only the ANY comparator
//   - If C is only the ANY comparator, return true
//   - Else if in prerelease mode, return false
//   - else replace c with `[>=0.0.0]`
// - If C is only the ANY comparator
//   - if in prerelease mode, return true
//   - else replace C with `[>=0.0.0]`
// - Let EQ be the set of = comparators in c
// - If EQ is more than one, return true (null set)
// - Let GT be the highest > or >= comparator in c
// - Let LT be the lowest < or <= comparator in c
// - If GT and LT, and GT.semver > LT.semver, return true (null set)
// - If any C is a = range, and GT or LT are set, return false
// - If EQ
//   - If GT, and EQ does not satisfy GT, return true (null set)
//   - If LT, and EQ does not satisfy LT, return true (null set)
//   - If EQ satisfies every C, return true
//   - Else return false
// - If GT
//   - If GT.semver is lower than any > or >= comp in C, return false
//   - If GT is >=, and GT.semver does not satisfy every C, return false
//   - If GT.semver has a prerelease, and not in prerelease mode
//     - If no C has a prerelease and the GT.semver tuple, return false
// - If LT
//   - If LT.semver is greater than any < or <= comp in C, return false
//   - If LT is <=, and LT.semver does not satisfy every C, return false
//   - If GT.semver has a prerelease, and not in prerelease mode
//     - If no C has a prerelease and the LT.semver tuple, return false
// - Else return true


var subset = function (sub, dom, options = {}) {
  if (sub === dom) return true;
  sub = new Range(sub, options);
  dom = new Range(dom, options);
  var sawNonNull = false;

  OUTER: for (var _i = 0, _sub$set = sub.set, _length = _sub$set == null ? 0 : _sub$set.length; _i < _length; _i++) {
    var simpleSub = _sub$set[_i];

    for (var _i2 = 0, _dom$set = dom.set, _length2 = _dom$set == null ? 0 : _dom$set.length; _i2 < _length2; _i2++) {
      var simpleDom = _dom$set[_i2];
      var isSub = simpleSubset(simpleSub, simpleDom, options);
      sawNonNull = sawNonNull || isSub !== null;
      if (isSub) continue OUTER;
    } // the null set is a subset of everything, but null simple ranges in
    // a complex range should be ignored.  so if we saw a non-null range,
    // then we know this isn't a subset, but if EVERY simple range was null,
    // then it is a subset.


    if (sawNonNull) return false;
  }

  return true;
};

var simpleSubset = function (sub, dom, options) {
  "use strict";

  if (sub === dom) return true;

  if (sub.length === 1 && sub[0].semver === ANY) {
    if (dom.length === 1 && dom[0].semver === ANY) return true;else if (options.includePrerelease) sub = [new Comparator('>=0.0.0-0')];else sub = [new Comparator('>=0.0.0')];
  }

  if (dom.length === 1 && dom[0].semver === ANY) {
    if (options.includePrerelease) return true;else dom = [new Comparator('>=0.0.0')];
  }

  var eqSet = new Set();
  var gt, lt;

  for (var _i3 = 0, _sub = sub, _length3 = _sub == null ? 0 : _sub.length; _i3 < _length3; _i3++) {
    var c = _sub[_i3];
    if (c.operator === '>' || c.operator === '>=') gt = higherGT(gt, c, options);else if (c.operator === '<' || c.operator === '<=') lt = lowerLT(lt, c, options);else eqSet.add(c.semver);
  }

  if (eqSet.size > 1) return null;
  var gtltComp;

  if (gt && lt) {
    gtltComp = compare(gt.semver, lt.semver, options);
    if (gtltComp > 0) return null;else if (gtltComp === 0 && (gt.operator !== '>=' || lt.operator !== '<=')) return null;
  } // will iterate one or zero times


  for (var _i4 = 0, _length4 = eqSet == null ? 0 : eqSet.length; _i4 < _length4; _i4++) {
    var eq = eqSet[_i4];
    if (gt && !satisfies(eq, String(gt), options)) return null;
    if (lt && !satisfies(eq, String(lt), options)) return null;

    for (var _i5 = 0, _dom = dom, _length5 = _dom == null ? 0 : _dom.length; _i5 < _length5; _i5++) {
      var _c = _dom[_i5];
      if (!satisfies(eq, String(_c), options)) return false;
    }

    return true;
  }

  var higher, lower;
  var hasDomLT, hasDomGT; // if the subset has a prerelease, we need a comparator in the superset
  // with the same tuple and a prerelease, or it's not a subset

  var needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
  var needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false; // exception: <1.2.3-0 is the same as <1.2.3

  if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === '<' && needDomLTPre.prerelease[0] === 0) {
    needDomLTPre = false;
  }

  for (var _i6 = 0, _dom2 = dom, _length6 = _dom2 == null ? 0 : _dom2.length; _i6 < _length6; _i6++) {
    var _c2 = _dom2[_i6];
    hasDomGT = hasDomGT || _c2.operator === '>' || _c2.operator === '>=';
    hasDomLT = hasDomLT || _c2.operator === '<' || _c2.operator === '<=';

    if (gt) {
      if (needDomGTPre) {
        if (_c2.semver.prerelease && _c2.semver.prerelease.length && _c2.semver.major === needDomGTPre.major && _c2.semver.minor === needDomGTPre.minor && _c2.semver.patch === needDomGTPre.patch) {
          needDomGTPre = false;
        }
      }

      if (_c2.operator === '>' || _c2.operator === '>=') {
        higher = higherGT(gt, _c2, options);
        if (higher === _c2 && higher !== gt) return false;
      } else if (gt.operator === '>=' && !satisfies(gt.semver, String(_c2), options)) return false;
    }

    if (lt) {
      if (needDomLTPre) {
        if (_c2.semver.prerelease && _c2.semver.prerelease.length && _c2.semver.major === needDomLTPre.major && _c2.semver.minor === needDomLTPre.minor && _c2.semver.patch === needDomLTPre.patch) {
          needDomLTPre = false;
        }
      }

      if (_c2.operator === '<' || _c2.operator === '<=') {
        lower = lowerLT(lt, _c2, options);
        if (lower === _c2 && lower !== lt) return false;
      } else if (lt.operator === '<=' && !satisfies(lt.semver, String(_c2), options)) return false;
    }

    if (!_c2.operator && (lt || gt) && gtltComp !== 0) return false;
  } // if there was a < or >, and nothing in the dom, then must be false
  // UNLESS it was limited by another range in the other direction.
  // Eg, >1.0.0 <1.0.1 is still a subset of <2.0.0


  if (gt && hasDomLT && !lt && gtltComp !== 0) return false;
  if (lt && hasDomGT && !gt && gtltComp !== 0) return false; // we needed a prerelease range in a specific tuple, but didn't get one
  // then this isn't a subset.  eg >=1.2.3-pre is not a subset of >=1.0.0,
  // because it includes prereleases in the 1.2.3 tuple

  if (needDomGTPre || needDomLTPre) return false;
  return true;
}; // >=1.2.3 is lower than >1.2.3


var higherGT = function (a, b, options) {
  "use strict";

  if (!a) return b;
  var comp = compare(a.semver, b.semver, options);
  return comp > 0 ? a : comp < 0 ? b : b.operator === '>' && a.operator === '>=' ? b : a;
}; // <=1.2.3 is higher than <1.2.3


var lowerLT = function (a, b, options) {
  "use strict";

  if (!a) return b;
  var comp = compare(a.semver, b.semver, options);
  return comp < 0 ? a : comp > 0 ? b : b.operator === '<' && a.operator === '<=' ? b : a;
};

module.exports = subset;

/***/ }),

/***/ "./node_modules/semver/ranges/to-comparators.js":
/***/ (function(module, exports, __webpack_require__) {

var Range = __webpack_require__("./node_modules/semver/classes/range.js"); // Mostly just for testing and legacy API reasons


var toComparators = function (range, options) {
  return new Range(range, options).set.map(function (comp) {
    return comp.map(function (c) {
      return c.value;
    }).join(' ').trim().split(' ');
  });
};

module.exports = toComparators;

/***/ }),

/***/ "./node_modules/semver/ranges/valid.js":
/***/ (function(module, exports, __webpack_require__) {

var Range = __webpack_require__("./node_modules/semver/classes/range.js");

var validRange = function (range, options) {
  "use strict";

  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range, options).range || '*';
  } catch (er) {
    return null;
  }
};

module.exports = validRange;

/***/ }),

/***/ "./node_modules/yallist/iterator.js":
/***/ (function(module, exports, __webpack_require__) {



module.exports = function (Yallist) {
  Yallist.prototype[Symbol.iterator] = function* () {
    for (var walker = this.head; walker; walker = walker.next) {
      yield walker.value;
    }
  };
};

/***/ }),

/***/ "./node_modules/yallist/yallist.js":
/***/ (function(module, exports, __webpack_require__) {



module.exports = Yallist;
Yallist.Node = Node;
Yallist.create = Yallist;

function Yallist(list) {
  var self = this;

  if (!(self instanceof Yallist)) {
    self = new Yallist();
  }

  self.tail = null;
  self.head = null;
  self.length = 0;

  if (list && typeof list.forEach === 'function') {
    list.forEach(function (item) {
      self.push(item);
    });
  } else if (arguments.length > 0) {
    for (var i = 0, l = arguments.length; i < l; i++) {
      self.push(arguments[i]);
    }
  }

  return self;
}

Yallist.prototype.removeNode = function (node) {
  if (node.list !== this) {
    throw new Error('removing node which does not belong to this list');
  }

  var next = node.next;
  var prev = node.prev;

  if (next) {
    next.prev = prev;
  }

  if (prev) {
    prev.next = next;
  }

  if (node === this.head) {
    this.head = next;
  }

  if (node === this.tail) {
    this.tail = prev;
  }

  node.list.length--;
  node.next = null;
  node.prev = null;
  node.list = null;
  return next;
};

Yallist.prototype.unshiftNode = function (node) {
  if (node === this.head) {
    return;
  }

  if (node.list) {
    node.list.removeNode(node);
  }

  var head = this.head;
  node.list = this;
  node.next = head;

  if (head) {
    head.prev = node;
  }

  this.head = node;

  if (!this.tail) {
    this.tail = node;
  }

  this.length++;
};

Yallist.prototype.pushNode = function (node) {
  if (node === this.tail) {
    return;
  }

  if (node.list) {
    node.list.removeNode(node);
  }

  var tail = this.tail;
  node.list = this;
  node.prev = tail;

  if (tail) {
    tail.next = node;
  }

  this.tail = node;

  if (!this.head) {
    this.head = node;
  }

  this.length++;
};

Yallist.prototype.push = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    push(this, arguments[i]);
  }

  return this.length;
};

Yallist.prototype.unshift = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    unshift(this, arguments[i]);
  }

  return this.length;
};

Yallist.prototype.pop = function () {
  if (!this.tail) {
    return undefined;
  }

  var res = this.tail.value;
  this.tail = this.tail.prev;

  if (this.tail) {
    this.tail.next = null;
  } else {
    this.head = null;
  }

  this.length--;
  return res;
};

Yallist.prototype.shift = function () {
  if (!this.head) {
    return undefined;
  }

  var res = this.head.value;
  this.head = this.head.next;

  if (this.head) {
    this.head.prev = null;
  } else {
    this.tail = null;
  }

  this.length--;
  return res;
};

Yallist.prototype.forEach = function (fn, thisp) {
  thisp = thisp || this;

  for (var walker = this.head, i = 0; walker !== null; i++) {
    fn.call(thisp, walker.value, i, this);
    walker = walker.next;
  }
};

Yallist.prototype.forEachReverse = function (fn, thisp) {
  thisp = thisp || this;

  for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
    fn.call(thisp, walker.value, i, this);
    walker = walker.prev;
  }
};

Yallist.prototype.get = function (n) {
  for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.next;
  }

  if (i === n && walker !== null) {
    return walker.value;
  }
};

Yallist.prototype.getReverse = function (n) {
  for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.prev;
  }

  if (i === n && walker !== null) {
    return walker.value;
  }
};

Yallist.prototype.map = function (fn, thisp) {
  thisp = thisp || this;
  var res = new Yallist();

  for (var walker = this.head; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this));
    walker = walker.next;
  }

  return res;
};

Yallist.prototype.mapReverse = function (fn, thisp) {
  thisp = thisp || this;
  var res = new Yallist();

  for (var walker = this.tail; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this));
    walker = walker.prev;
  }

  return res;
};

Yallist.prototype.reduce = function (fn, initial) {
  var acc;
  var walker = this.head;

  if (arguments.length > 1) {
    acc = initial;
  } else if (this.head) {
    walker = this.head.next;
    acc = this.head.value;
  } else {
    throw new TypeError('Reduce of empty list with no initial value');
  }

  for (var i = 0; walker !== null; i++) {
    acc = fn(acc, walker.value, i);
    walker = walker.next;
  }

  return acc;
};

Yallist.prototype.reduceReverse = function (fn, initial) {
  var acc;
  var walker = this.tail;

  if (arguments.length > 1) {
    acc = initial;
  } else if (this.tail) {
    walker = this.tail.prev;
    acc = this.tail.value;
  } else {
    throw new TypeError('Reduce of empty list with no initial value');
  }

  for (var i = this.length - 1; walker !== null; i--) {
    acc = fn(acc, walker.value, i);
    walker = walker.prev;
  }

  return acc;
};

Yallist.prototype.toArray = function () {
  var arr = new Array(this.length);

  for (var i = 0, walker = this.head; walker !== null; i++) {
    arr[i] = walker.value;
    walker = walker.next;
  }

  return arr;
};

Yallist.prototype.toArrayReverse = function () {
  var arr = new Array(this.length);

  for (var i = 0, walker = this.tail; walker !== null; i++) {
    arr[i] = walker.value;
    walker = walker.prev;
  }

  return arr;
};

Yallist.prototype.slice = function (from, to) {
  to = to || this.length;

  if (to < 0) {
    to += this.length;
  }

  from = from || 0;

  if (from < 0) {
    from += this.length;
  }

  var ret = new Yallist();

  if (to < from || to < 0) {
    return ret;
  }

  if (from < 0) {
    from = 0;
  }

  if (to > this.length) {
    to = this.length;
  }

  for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
    walker = walker.next;
  }

  for (; walker !== null && i < to; i++, walker = walker.next) {
    ret.push(walker.value);
  }

  return ret;
};

Yallist.prototype.sliceReverse = function (from, to) {
  to = to || this.length;

  if (to < 0) {
    to += this.length;
  }

  from = from || 0;

  if (from < 0) {
    from += this.length;
  }

  var ret = new Yallist();

  if (to < from || to < 0) {
    return ret;
  }

  if (from < 0) {
    from = 0;
  }

  if (to > this.length) {
    to = this.length;
  }

  for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
    walker = walker.prev;
  }

  for (; walker !== null && i > from; i--, walker = walker.prev) {
    ret.push(walker.value);
  }

  return ret;
};

Yallist.prototype.splice = function (start, deleteCount, ...nodes) {
  if (start > this.length) {
    start = this.length - 1;
  }

  if (start < 0) {
    start = this.length + start;
  }

  for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
    walker = walker.next;
  }

  var ret = [];

  for (var i = 0; walker && i < deleteCount; i++) {
    ret.push(walker.value);
    walker = this.removeNode(walker);
  }

  if (walker === null) {
    walker = this.tail;
  }

  if (walker !== this.head && walker !== this.tail) {
    walker = walker.prev;
  }

  for (var i = 0; i < nodes.length; i++) {
    walker = insert(this, walker, nodes[i]);
  }

  return ret;
};

Yallist.prototype.reverse = function () {
  var head = this.head;
  var tail = this.tail;

  for (var walker = head; walker !== null; walker = walker.prev) {
    var p = walker.prev;
    walker.prev = walker.next;
    walker.next = p;
  }

  this.head = tail;
  this.tail = head;
  return this;
};

function insert(self, node, value) {
  var inserted = node === self.head ? new Node(value, null, node, self) : new Node(value, node, node.next, self);

  if (inserted.next === null) {
    self.tail = inserted;
  }

  if (inserted.prev === null) {
    self.head = inserted;
  }

  self.length++;
  return inserted;
}

function push(self, item) {
  self.tail = new Node(item, self.tail, null, self);

  if (!self.head) {
    self.head = self.tail;
  }

  self.length++;
}

function unshift(self, item) {
  self.head = new Node(item, null, self.head, self);

  if (!self.tail) {
    self.tail = self.head;
  }

  self.length++;
}

function Node(value, prev, next, list) {
  if (!(this instanceof Node)) {
    return new Node(value, prev, next, list);
  }

  this.list = list;
  this.value = value;

  if (prev) {
    prev.next = this;
    this.prev = prev;
  } else {
    this.prev = null;
  }

  if (next) {
    next.prev = this;
    this.next = next;
  } else {
    this.next = null;
  }
}

try {
  // add if support for Symbol.iterator is present
  __webpack_require__("./node_modules/yallist/iterator.js")(Yallist);
} catch (er) {}

/***/ }),

/***/ "./src/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG

// CONCATENATED MODULE: ./src/constant/inspect.js
var INSPECT = {
  PROXY_PREFIX: "Proxy ["
};
/* harmony default export */ var constant_inspect = (INSPECT);
// CONCATENATED MODULE: ./src/constant/char.js
var CHAR = {
  ZERO_WIDTH_JOINER: "\u200D"
};
/* harmony default export */ var constant_char = (CHAR);
// CONCATENATED MODULE: ./src/util/encode-id.js

var encode_id_ZERO_WIDTH_JOINER = constant_char.ZERO_WIDTH_JOINER;

function encodeId(id) {
  "use strict";

  return id + encode_id_ZERO_WIDTH_JOINER;
}

/* harmony default export */ var encode_id = (encodeId);
// CONCATENATED MODULE: ./src/util/set-getter.js
var __defineGetter__ = Object.prototype.__defineGetter__;

function setGetter(object, name, getter) {
  "use strict";

  __defineGetter__.call(object, name, getter);

  return object;
}

/* harmony default export */ var set_getter = (setGetter);
// CONCATENATED MODULE: ./src/util/set-setter.js
var __defineSetter__ = Object.prototype.__defineSetter__;

function setSetter(object, name, setter) {
  "use strict";

  __defineSetter__.call(object, name, setter);

  return object;
}

/* harmony default export */ var set_setter = (setSetter);
// CONCATENATED MODULE: ./src/util/set-deferred.js


var set_deferred_dataDescriptor = {
  configurable: true,
  enumerable: true,
  value: void 0,
  writable: true
};
var emptyArray = [];

function setDeferred(object, name, getter) {
  "use strict";

  set_getter(object, name, function () {
    this[name] = void 0;
    return this[name] = Reflect.apply(getter, this, emptyArray);
  });
  set_setter(object, name, function (value) {
    set_deferred_dataDescriptor.value = value;
    Reflect.defineProperty(this, name, set_deferred_dataDescriptor);
  });
  return object;
}

/* harmony default export */ var set_deferred = (setDeferred);
// CONCATENATED MODULE: ./src/constant/esm.js

 // The `process.env` properties are replaced at build time.
// https://webpack.js.org/plugins/environment-plugin/

var esm_PACKAGE_FILENAMES = ["index.js","esm.js","esm/loader.js"];
var esm_PACKAGE_VERSION = "3.2.25";
var ESM = {
  PACKAGE_DIRNAME: null,
  PACKAGE_FILENAMES: null,
  PACKAGE_PREFIX: encode_id("esm"),
  PACKAGE_RANGE: esm_PACKAGE_VERSION.match(/^[\d.]+/)[0],
  PACKAGE_VERSION: esm_PACKAGE_VERSION,
  STACK_TRACE_LIMIT: 30
};
var _non_webpack_module_ = __non_webpack_module__,
    esm_filename = _non_webpack_module_.filename,
    esm_parent = _non_webpack_module_.parent;
var esm_parentFilename = esm_parent != null && esm_parent.filename;
set_deferred(ESM, "PACKAGE_DIRNAME", function () {
  "use strict";

  var safePath = __shared__.module.safePath;
  return safePath.dirname(esm_filename);
});
set_deferred(ESM, "PACKAGE_FILENAMES", function () {
  "use strict";

  var safePath = __shared__.module.safePath;
  var sep = safePath.sep;
  var PACKAGE_DIRNAME = this.PACKAGE_DIRNAME;
  var length = esm_PACKAGE_FILENAMES.length;

  while (length--) {
    esm_PACKAGE_FILENAMES[length] = PACKAGE_DIRNAME + sep + esm_PACKAGE_FILENAMES[length];
  }

  return esm_PACKAGE_FILENAMES;
});
set_deferred(ESM, "PACKAGE_PARENT_NAME", function () {
  "use strict";

  var safePath = __shared__.module.safePath;
  var sep = safePath.sep;
  var nodeModulesIndex = typeof esm_parentFilename === "string" ? esm_parentFilename.lastIndexOf(sep + "node_modules" + sep) : -1;

  if (nodeModulesIndex === -1) {
    return "";
  }

  var start = nodeModulesIndex + 14;
  var end = esm_parentFilename.indexOf(sep, start);
  return end === -1 ? "" : esm_parentFilename.slice(start, end);
});
/* harmony default export */ var esm = (ESM);
// CONCATENATED MODULE: ./src/shared.js




var shared_PROXY_PREFIX = constant_inspect.PROXY_PREFIX;
var shared_PACKAGE_PREFIX = esm.PACKAGE_PREFIX,
    shared_PACKAGE_VERSION = esm.PACKAGE_VERSION;
var SHARED_SYMBOL = Symbol.for(shared_PACKAGE_PREFIX + "@" + shared_PACKAGE_VERSION + ":shared");

function getShared() {
  "use strict";

  if (__shared__ !== void 0) {
    __shared__.reloaded = false;
    return __shared__;
  }

  try {
    // eslint-disable-next-line no-global-assign
    __shared__ = require(SHARED_SYMBOL);
    __shared__.reloaded = true;
    return __shared__;
  } catch (_unused) {}

  return shared_init();
}

function shared_init() {
  "use strict";

  var FuncToString = Function.prototype.toString;
  var dummyProxy = new Proxy(class {}, {
    [shared_PACKAGE_PREFIX]: 1
  });
  var support = {
    wasm: typeof WebAssembly === "object" && WebAssembly !== null
  };
  var symbol = {
    _compile: Symbol.for(shared_PACKAGE_PREFIX + ":module._compile"),
    entry: Symbol.for(shared_PACKAGE_PREFIX + ":entry"),
    mjs: Symbol.for(shared_PACKAGE_PREFIX + ':Module._extensions[".mjs"]'),
    namespace: Symbol.for(shared_PACKAGE_PREFIX + ":namespace"),
    package: Symbol.for(shared_PACKAGE_PREFIX + ":package"),
    proxy: Symbol.for(shared_PACKAGE_PREFIX + ":proxy"),
    realGetProxyDetails: Symbol.for(shared_PACKAGE_PREFIX + ":realGetProxyDetails"),
    realRequire: Symbol.for(shared_PACKAGE_PREFIX + ":realRequire"),
    runtime: Symbol.for(shared_PACKAGE_PREFIX + ":runtime"),
    shared: SHARED_SYMBOL,
    wrapper: Symbol.for(shared_PACKAGE_PREFIX + ":wrapper")
  };
  var utilBinding = {};
  var shared = {
    bridged: new Map(),
    customInspectKey: void 0,
    defaultInspectOptions: void 0,
    entry: {
      cache: new WeakMap()
    },
    external: __external__,
    inited: false,
    loader: new Map(),
    memoize: {
      builtinEntries: new Map(),
      builtinModules: new Map(),
      fsRealpath: new Map(),
      moduleESMResolveFilename: new Map(),
      moduleInternalFindPath: new Map(),
      moduleInternalReadPackage: new Map(),
      moduleStaticResolveFilename: new Map(),
      shimFunctionPrototypeToString: new WeakMap(),
      shimProcessBindingUtilGetProxyDetails: new Map(),
      shimPuppeteerExecutionContextPrototypeEvaluateHandle: new WeakMap(),
      utilGetProxyDetails: new WeakMap(),
      utilMaskFunction: new WeakMap(),
      utilMaxSatisfying: new Map(),
      utilParseURL: new Map(),
      utilProxyExports: new WeakMap(),
      utilSatisfies: new Map(),
      utilUnwrapOwnProxy: new WeakMap(),
      utilUnwrapProxy: new WeakMap()
    },
    module: {},
    moduleState: {
      instantiating: false,
      parsing: false,
      requireDepth: 0,
      statFast: null,
      statSync: null
    },
    package: {
      dir: new Map(),
      root: new Map()
    },
    pendingScripts: new Map(),
    pendingWrites: new Map(),
    realpathNativeSync: void 0,
    reloaded: false,
    safeGlobal: __global__,
    support,
    symbol,
    unsafeGlobal: global,
    utilBinding
  };
  set_deferred(shared, "circularErrorMessage", function () {
    try {
      var object = {};
      object.a = object;
      JSON.stringify(object);
    } catch (_ref) {
      var message = _ref.message;
      return message;
    }
  });
  set_deferred(shared, "defaultGlobal", function () {
    var safeVM = shared.module.safeVM;
    return new safeVM.Script("this").runInThisContext();
  });
  set_deferred(shared, "originalConsole", function () {
    var _shared$module = shared.module,
        safeInspector = _shared$module.safeInspector,
        safeVM = _shared$module.safeVM,
        utilGet = _shared$module.utilGet;
    var originalConsole = utilGet(safeInspector, "console");
    return typeof originalConsole === "function" ? originalConsole : new safeVM.Script("console").runInNewContext();
  });
  set_deferred(shared, "proxyNativeSourceText", function () {
    // Node < 10 doesn't support `Function#toString()` of proxied functions.
    // https://node.green/#ESNEXT-candidate--stage-3--Function-prototype-toString-revision
    try {
      return FuncToString.call(dummyProxy);
    } catch (_unused2) {}

    return "";
  });
  set_deferred(shared, "runtimeName", function () {
    var safeCrypto = shared.module.safeCrypto;
    return encode_id("_" + safeCrypto.createHash("md5").update(Date.now().toString()).digest("hex").slice(0, 3));
  });
  set_deferred(shared, "unsafeContext", function () {
    var _shared$module2 = shared.module,
        safeVM = _shared$module2.safeVM,
        utilPrepareContext = _shared$module2.utilPrepareContext;
    return utilPrepareContext(safeVM.createContext(shared.unsafeGlobal));
  });
  set_deferred(support, "await", function () {
    var safeVM = shared.module.safeVM;

    try {
      new safeVM.Script("async()=>await 1").runInThisContext();
      return true;
    } catch (_unused3) {}

    return false;
  });
  set_deferred(support, "consoleOptions", function () {
    var _shared$module3 = shared.module,
        safeProcess = _shared$module3.safeProcess,
        utilSatisfies = _shared$module3.utilSatisfies;
    return utilSatisfies(safeProcess.version, ">=10");
  });
  set_deferred(support, "createCachedData", function () {
    var safeVM = shared.module.safeVM;
    return typeof safeVM.Script.prototype.createCachedData === "function";
  });
  set_deferred(support, "inspectProxies", function () {
    var safeUtil = shared.module.safeUtil; // Node < 6.1.0 does not support inspecting proxies.

    var inspected = safeUtil.inspect(dummyProxy, {
      depth: 1,
      showProxy: true
    });
    return inspected.indexOf(shared_PROXY_PREFIX) !== -1 && inspected.indexOf(shared_PACKAGE_PREFIX) !== -1;
  });
  set_deferred(support, "lookupShadowed", function () {
    // Node < 8 will lookup accessors in the prototype chain
    // despite being shadowed by data properties.
    // https://node.green/#ES2017-annex-b
    var object = {
      __proto__: {
        // eslint-disable-next-line getter-return
        get a() {},

        set a(v) {}

      },
      a: 1
    };
    return object.__lookupGetter__("a") === void 0 && object.__lookupSetter__("a") === void 0;
  });
  set_deferred(support, "nativeProxyReceiver", function () {
    var _shared$module4 = shared.module,
        SafeBuffer = _shared$module4.SafeBuffer,
        utilGet = _shared$module4.utilGet,
        utilToString = _shared$module4.utilToString; // Detect support for invoking native functions with a proxy receiver.
    // https://bugs.chromium.org/p/v8/issues/detail?id=5773

    try {
      var proxy = new Proxy(SafeBuffer.alloc(0), {
        get: function (buffer, name) {
          return buffer[name];
        }
      }); // Return a result so the test won't be removed by Terser.
      // https://github.com/terser-js/terser#the-unsafe-compress-option

      return typeof proxy.toString() === "string";
    } catch (e) {
      return !/Illegal/.test(utilToString(utilGet(e, "message")));
    }
  });
  set_deferred(support, "realpathNative", function () {
    var _shared$module5 = shared.module,
        safeProcess = _shared$module5.safeProcess,
        utilSatisfies = _shared$module5.utilSatisfies;
    return utilSatisfies(safeProcess.version, ">=9.2");
  });
  set_deferred(support, "replShowProxy", function () {
    var _shared$module6 = shared.module,
        safeProcess = _shared$module6.safeProcess,
        utilSatisfies = _shared$module6.utilSatisfies;
    return utilSatisfies(safeProcess.version, ">=10");
  });
  set_deferred(support, "vmCompileFunction", function () {
    var _shared$module7 = shared.module,
        safeProcess = _shared$module7.safeProcess,
        utilSatisfies = _shared$module7.utilSatisfies;
    return utilSatisfies(safeProcess.version, ">=10.10");
  });
  set_deferred(utilBinding, "errorDecoratedSymbol", function () {
    var _shared$module8 = shared.module,
        binding = _shared$module8.binding,
        safeProcess = _shared$module8.safeProcess,
        utilSatisfies = _shared$module8.utilSatisfies;
    return utilSatisfies(safeProcess.version, "<7") ? "node:decorated" : binding.util.decorated_private_symbol;
  });
  set_deferred(utilBinding, "hiddenKeyType", function () {
    return typeof utilBinding.errorDecoratedSymbol;
  }); // eslint-disable-next-line no-global-assign

  return __shared__ = shared;
}

/* harmony default export */ var src_shared = (getShared());
// CONCATENATED MODULE: ./src/util/unapply.js


function unapply_init() {
  "use strict";

  function unapply(func) {
    return function (thisArg, ...args) {
      return Reflect.apply(func, thisArg, args);
    };
  }

  return unapply;
}

/* harmony default export */ var unapply = (src_shared.inited ? src_shared.module.utilUnapply : src_shared.module.utilUnapply = unapply_init());
// CONCATENATED MODULE: ./src/generic/function.js



function function_init() {
  "use strict";

  return {
    bind: unapply(Function.prototype.bind)
  };
}

/* harmony default export */ var generic_function = (src_shared.inited ? src_shared.module.GenericFunction : src_shared.module.GenericFunction = function_init());
// CONCATENATED MODULE: ./src/real/require.js


function require_init() {
  "use strict";

  try {
    var result = require(src_shared.symbol.realRequire);

    if (typeof result === "function") {
      return result;
    }
  } catch (_unused) {}

  return require;
}

/* harmony default export */ var real_require = (src_shared.inited ? src_shared.module.realRequire : src_shared.module.realRequire = require_init());
// CONCATENATED MODULE: ./src/real/process.js


/* harmony default export */ var process = (src_shared.inited ? src_shared.module.realProcess : src_shared.module.realProcess = real_require("process"));
// CONCATENATED MODULE: ./src/util/is-object-like.js


function is_object_like_init() {
  "use strict";

  function isObjectLike(value) {
    var type = typeof value;
    return type === "function" || type === "object" && value !== null;
  }

  return isObjectLike;
}

/* harmony default export */ var is_object_like = (src_shared.inited ? src_shared.module.utilIsObjectLike : src_shared.module.utilIsObjectLike = is_object_like_init());
// CONCATENATED MODULE: ./src/util/set-property.js



function set_property_init() {
  "use strict";

  var dataDescriptor = {
    configurable: true,
    enumerable: true,
    value: void 0,
    writable: true
  };

  function setProperty(object, name, value) {
    if (is_object_like(object)) {
      dataDescriptor.value = value;
      return Reflect.defineProperty(object, name, dataDescriptor);
    }

    return false;
  }

  return setProperty;
}

/* harmony default export */ var set_property = (src_shared.inited ? src_shared.module.utilSetProperty : src_shared.module.utilSetProperty = set_property_init());
// CONCATENATED MODULE: ./src/util/silent.js




function silent_init() {
  "use strict";

  function silent(callback) {
    var descriptor = Reflect.getOwnPropertyDescriptor(process, "noDeprecation");
    set_property(process, "noDeprecation", true);

    try {
      return callback();
    } finally {
      if (descriptor === void 0) {
        Reflect.deleteProperty(process, "noDeprecation");
      } else {
        Reflect.defineProperty(process, "noDeprecation", descriptor);
      }
    }
  }

  return silent;
}

/* harmony default export */ var util_silent = (src_shared.inited ? src_shared.module.utilSilent : src_shared.module.utilSilent = silent_init());
// CONCATENATED MODULE: ./src/util/get-silent.js



function get_silent_init() {
  "use strict";

  function getSilent(object, name) {
    var value = util_silent(function () {
      try {
        return object[name];
      } catch (_unused) {}
    });

    if (typeof value !== "function") {
      return value;
    }

    return function (...args) {
      var _this = this;

      return util_silent(function () {
        return Reflect.apply(value, _this, args);
      });
    };
  }

  return getSilent;
}

/* harmony default export */ var get_silent = (src_shared.inited ? src_shared.module.utilGetSilent : src_shared.module.utilGetSilent = get_silent_init());
// CONCATENATED MODULE: ./src/util/keys.js



function keys_init() {
  "use strict";

  function keys(object) {
    return is_object_like(object) ? Object.keys(object) : [];
  }

  return keys;
}

/* harmony default export */ var util_keys = (src_shared.inited ? src_shared.module.utilKeys : src_shared.module.utilKeys = keys_init());
// CONCATENATED MODULE: ./src/util/has.js


function has_init() {
  "use strict";

  var hasOwnProperty = Object.prototype.hasOwnProperty;

  function has(object, name) {
    return object != null && hasOwnProperty.call(object, name);
  }

  return has;
}

/* harmony default export */ var has = (src_shared.inited ? src_shared.module.utilHas : src_shared.module.utilHas = has_init());
// CONCATENATED MODULE: ./src/util/noop.js


function noop_init() {
  "use strict";

  function noop() {// No operation performed.
  }

  return noop;
}

/* harmony default export */ var noop = (src_shared.inited ? src_shared.module.utilNoop : src_shared.module.utilNoop = noop_init());
// CONCATENATED MODULE: ./src/util/get-prototype-of.js



function get_prototype_of_init() {
  "use strict";

  function getPrototypeOf(object) {
    return is_object_like(object) ? Reflect.getPrototypeOf(object) : null;
  }

  return getPrototypeOf;
}

/* harmony default export */ var get_prototype_of = (src_shared.inited ? src_shared.module.utilGetPrototypeOf : src_shared.module.utilGetPrototypeOf = get_prototype_of_init());
// CONCATENATED MODULE: ./src/util/own-keys.js



function own_keys_init() {
  "use strict";

  function ownKeys(object) {
    return is_object_like(object) ? Reflect.ownKeys(object) : [];
  }

  return ownKeys;
}

/* harmony default export */ var own_keys = (src_shared.inited ? src_shared.module.utilOwnKeys : src_shared.module.utilOwnKeys = own_keys_init());
// CONCATENATED MODULE: ./src/util/all-keys.js




function all_keys_init() {
  "use strict";

  function allKeys(object) {
    var result = new Set(own_keys(object));
    var proto = object;

    while ((proto = get_prototype_of(proto)) !== null) {
      var ownNames = own_keys(proto);

      for (var _i = 0, _length = ownNames == null ? 0 : ownNames.length; _i < _length; _i++) {
        var ownName = ownNames[_i];
        result.add(ownName);
      }
    }

    return [...result];
  }

  return allKeys;
}

/* harmony default export */ var all_keys = (src_shared.inited ? src_shared.module.utilAllKeys : src_shared.module.utilAllKeys = all_keys_init());
// CONCATENATED MODULE: ./src/util/is-object.js


function is_object_init() {
  "use strict";

  function isObject(value) {
    return typeof value === "object" && value !== null;
  }

  return isObject;
}

/* harmony default export */ var is_object = (src_shared.inited ? src_shared.module.utilIsObject : src_shared.module.utilIsObject = is_object_init());
// CONCATENATED MODULE: ./src/util/is-data-property-descriptor.js




function is_data_property_descriptor_init() {
  "use strict";

  function isDataPropertyDescriptor(descriptor) {
    return is_object(descriptor) && descriptor.configurable === true && descriptor.enumerable === true && descriptor.writable === true && has(descriptor, "value");
  }

  return isDataPropertyDescriptor;
}

/* harmony default export */ var is_data_property_descriptor = (src_shared.inited ? src_shared.module.utilIsDataPropertyDescriptor : src_shared.module.utilIsDataPropertyDescriptor = is_data_property_descriptor_init());
// CONCATENATED MODULE: ./src/util/safe-copy-property.js





function safe_copy_property_init() {
  "use strict";

  function safeCopyProperty(object, source, name) {
    if (!is_object_like(object) || !is_object_like(source)) {
      return object;
    }

    var descriptor = Reflect.getOwnPropertyDescriptor(source, name);

    if (descriptor !== void 0) {
      if (has(descriptor, "value")) {
        var value = descriptor.value;

        if (Array.isArray(value)) {
          descriptor.value = Array.from(value);
        }
      }

      if (is_data_property_descriptor(descriptor)) {
        object[name] = descriptor.value;
      } else {
        descriptor.configurable = true;

        if (has(descriptor, "writable")) {
          descriptor.writable = true;
        }

        Reflect.defineProperty(object, name, descriptor);
      }
    }

    return object;
  }

  return safeCopyProperty;
}

/* harmony default export */ var safe_copy_property = (src_shared.inited ? src_shared.module.utilSafeCopyProperty : src_shared.module.utilSafeCopyProperty = safe_copy_property_init());
// CONCATENATED MODULE: ./src/util/safe-assign-properties-in.js




function safe_assign_properties_in_init() {
  "use strict";

  function safeAssignPropertiesIn(object) {
    var length = arguments.length;
    var i = 0;

    while (++i < length) {
      var source = arguments[i];
      var names = all_keys(source);

      for (var _i = 0, _length = names == null ? 0 : names.length; _i < _length; _i++) {
        var name = names[_i];
        safe_copy_property(object, source, name);
      }
    }

    return object;
  }

  return safeAssignPropertiesIn;
}

/* harmony default export */ var safe_assign_properties_in = (src_shared.inited ? src_shared.module.utilSafeAssignPropertiesIn : src_shared.module.utilSafeAssignPropertiesIn = safe_assign_properties_in_init());
// CONCATENATED MODULE: ./src/util/set-prototype-of.js



function set_prototype_of_init() {
  "use strict";

  function setPrototypeOf(object, proto) {
    return is_object_like(object) && Reflect.setPrototypeOf(object, is_object_like(proto) ? proto : null);
  }

  return setPrototypeOf;
}

/* harmony default export */ var set_prototype_of = (src_shared.inited ? src_shared.module.utilSetPrototypeOf : src_shared.module.utilSetPrototypeOf = set_prototype_of_init());
// CONCATENATED MODULE: ./src/util/safe.js







function safe_init() {
  "use strict";

  function safe(value) {
    if (typeof value !== "function") {
      if (Array.isArray(value)) {
        return Array.from(value);
      }

      return is_object(value) ? safe_assign_properties_in({}, value) : value;
    }

    var Super = value;

    var Safe = function (...args) {
      var result = Reflect.construct(Super, args);
      set_prototype_of(result, SafeProto);
      return result;
    };

    var SuperNames = all_keys(Super);

    for (var _i = 0, _length = SuperNames == null ? 0 : SuperNames.length; _i < _length; _i++) {
      var name = SuperNames[_i];

      if (name !== "prototype") {
        safe_copy_property(Safe, Super, name);
      }
    }

    var SafeProto = Safe.prototype;
    set_prototype_of(SafeProto, null);
    safe_assign_properties_in(SafeProto, Super.prototype);
    return Safe;
  }

  return safe;
}

/* harmony default export */ var util_safe = (src_shared.inited ? src_shared.module.utilSafe : src_shared.module.utilSafe = safe_init());
// CONCATENATED MODULE: ./src/safe/process.js











function process_init() {
  "use strict";

  var safeProcess = util_safe(process);
  var bindingDescriptor = Reflect.getOwnPropertyDescriptor(safeProcess, "binding");
  set_deferred(safeProcess, "binding", function () {
    if (bindingDescriptor === void 0) {
      return noop;
    }

    Reflect.defineProperty(safeProcess, "binding", bindingDescriptor);
    var binding = get_silent(safeProcess, "binding");
    var wrapper = typeof binding === "function" ? generic_function.bind(binding, process) : noop;
    set_property(safeProcess, "binding", wrapper);
    return wrapper;
  });
  var config = safeProcess.config;
  var safeConfig = {
    variables: {
      v8_enable_inspector: 0
    }
  };

  if (is_object_like(config) && has(config, "variables") && is_object_like(config.variables) && has(config.variables, "v8_enable_inspector") && config.variables.v8_enable_inspector) {
    safeConfig.variables.v8_enable_inspector = 1;
  }

  set_property(safeProcess, "argv", util_safe(safeProcess.argv));
  set_property(safeProcess, "config", safeConfig);
  set_property(safeProcess, "dlopen", generic_function.bind(safeProcess.dlopen, process));
  set_property(safeProcess, "emitWarning", generic_function.bind(safeProcess.emitWarning, process));
  set_property(safeProcess, "env", util_safe(safeProcess.env));
  set_property(safeProcess, "execArgv", util_safe(safeProcess.execArgv));
  set_property(safeProcess, "getMaxListeners", generic_function.bind(process.getMaxListeners, process));
  set_property(safeProcess, "once", generic_function.bind(process.once, process));
  set_property(safeProcess, "setMaxListeners", generic_function.bind(process.setMaxListeners, process));
  set_property(safeProcess, "versions", util_safe(safeProcess.versions));
  return safeProcess;
}

var process_safeProcess = src_shared.inited ? src_shared.module.safeProcess : src_shared.module.safeProcess = process_init();
var process_argv = process_safeProcess.argv,
    process_config = process_safeProcess.config,
    cwd = process_safeProcess.cwd,
    dlopen = process_safeProcess.dlopen,
    emitWarning = process_safeProcess.emitWarning,
    env = process_safeProcess.env,
    execArgv = process_safeProcess.execArgv,
    getMaxListeners = process_safeProcess.getMaxListeners,
    once = process_safeProcess.once,
    platform = process_safeProcess.platform,
    setMaxListeners = process_safeProcess.setMaxListeners,
    process_stderr = process_safeProcess.stderr,
    stdin = process_safeProcess.stdin,
    process_stdout = process_safeProcess.stdout,
    process_type = process_safeProcess.type,
    process_version = process_safeProcess.version,
    process_versions = process_safeProcess.versions;

/* harmony default export */ var safe_process = (process_safeProcess);
// CONCATENATED MODULE: ./src/binding.js









function binding_init() {
  "use strict";

  var ids = ["fs", "inspector", "natives", "util"];
  var map = new Map([["fs", [// Used for faster directory, file, and existence checks.
  "internalModuleStat", // Used for native `realpath()` calls in Node < 9.2.0.
  "realpath"]], ["inspector", [// Used to combine `esm` and global `console` methods without adding to
  // the call stack.
  "consoleCall"]], ["natives", // Use to define `Module.builtinModules` in Node < 9.3.0.
  void 0], ["util", [// Used as the stack trace decoration indicator in Node 7+.
  "decorated_private_symbol", // Used to get the unwrapped object and proxy handler.
  "getProxyDetails", // Used for more secure environment variable retrieval in Node 10+.
  "safeGetenv", // Used to decorate stack traces until
  // https://github.com/nodejs/node/pull/23926 is merged.
  "setHiddenValue"]]]);
  var binding = {};

  var _loop = function (id) {
    set_deferred(binding, id, function () {
      var object = {};
      var source = safe_process.binding(id);

      if (!is_object_like(source)) {
        return object;
      }

      var names = map.get(id);

      if (names === void 0) {
        names = util_keys(source);
      }

      var _loop2 = function (name) {
        set_deferred(object, name, function () {
          if (name === "consoleCall") {
            return util_silent(function () {
              return source[name];
            });
          }

          var value = get_silent(source, name);
          return typeof value === "function" ? generic_function.bind(value, source) : value;
        });
      };

      for (var _i2 = 0, _names = names, _length2 = _names == null ? 0 : _names.length; _i2 < _length2; _i2++) {
        var name = _names[_i2];

        _loop2(name);
      }

      return object;
    });
  };

  for (var _i = 0, _length = ids == null ? 0 : ids.length; _i < _length; _i++) {
    var id = ids[_i];

    _loop(id);
  }

  return binding;
}

/* harmony default export */ var src_binding = (src_shared.inited ? src_shared.module.binding : src_shared.module.binding = binding_init());
// CONCATENATED MODULE: ./src/util/to-external-function.js





function to_external_function_init() {
  "use strict";

  var ExFunction = src_shared.external.Function;
  var ExFuncSuper = get_prototype_of(ExFunction);
  var ExFuncProtoSuper = get_prototype_of(ExFunction.prototype);

  function toExternalFunction(func) {
    set_prototype_of(func, ExFuncSuper);

    if (has(func, "prototype")) {
      set_prototype_of(func.prototype, ExFuncProtoSuper);
    }

    return func;
  }

  return toExternalFunction;
}

/* harmony default export */ var to_external_function = (src_shared.inited ? src_shared.module.utilToExternalFunction : src_shared.module.utilToExternalFunction = to_external_function_init());
// CONCATENATED MODULE: ./src/own/proxy.js




function proxy_init() {
  "use strict";

  var customInspectDescriptor = {
    value: to_external_function(function () {
      return "{}";
    })
  };
  var markerDescriptor = {
    value: 1
  };

  class OwnProxy {
    // TODO: Remove this eslint comment when the false positive is resolved.
    // eslint-disable-next-line no-undef
    constructor(target, handler) {
      var maskedHandler = {
        __proto__: handler
      };
      var proxy = new Proxy(target, maskedHandler);
      set_prototype_of(handler, null);

      for (var name in handler) {
        to_external_function(handler[name]);
      }

      Reflect.defineProperty(maskedHandler, src_shared.customInspectKey, customInspectDescriptor);
      Reflect.defineProperty(maskedHandler, src_shared.symbol.proxy, markerDescriptor);
      OwnProxy.instances.set(proxy, [target, maskedHandler]); // Wrap `proxy` in a decoy proxy so that `proxy` will be used as the
      // unwrapped inspectable value.

      var emptyHandler = {};
      var decoyProxy = new Proxy(proxy, emptyHandler);
      OwnProxy.instances.set(decoyProxy, [proxy, emptyHandler]);
      return decoyProxy;
    }

  }

  OwnProxy.instances = new WeakMap();
  set_prototype_of(OwnProxy.prototype, null);
  return OwnProxy;
}

/* harmony default export */ var own_proxy = (src_shared.inited ? src_shared.module.OwnProxy : src_shared.module.OwnProxy = proxy_init());
// CONCATENATED MODULE: ./src/safe/require.js



function safe_require_init() {
  "use strict";

  var resolve = real_require.resolve;

  function safeRequire(request) {
    try {
      return real_require(request);
    } catch (_unused) {}
  }

  function safeResolve(request) {
    try {
      return Reflect.apply(resolve, real_require, [request]);
    } catch (_unused2) {}

    return "";
  }

  safeRequire.resolve = safeResolve;
  return safeRequire;
}

/* harmony default export */ var safe_require = (src_shared.inited ? src_shared.module.safeRequire : src_shared.module.safeRequire = safe_require_init());
// CONCATENATED MODULE: ./src/real/get-proxy-details.js





function get_proxy_details_init() {
  "use strict";

  var realGetProxyDetails = safe_require(src_shared.symbol.realGetProxyDetails);

  if (typeof realGetProxyDetails === "function") {
    return realGetProxyDetails;
  }

  var useGetProxyDetails; // Define as a function expression in case it is ever proxy wrapped in the future.

  realGetProxyDetails = function (value) {
    if (useGetProxyDetails === void 0) {
      useGetProxyDetails = typeof src_binding.util.getProxyDetails === "function";
    }

    if (useGetProxyDetails && is_object_like(value)) {
      try {
        return src_binding.util.getProxyDetails(value);
      } catch (_unused) {}
    }
  };

  return realGetProxyDetails;
}

/* harmony default export */ var get_proxy_details = (src_shared.inited ? src_shared.module.realGetProxyDetails : src_shared.module.realGetProxyDetails = get_proxy_details_init());
// CONCATENATED MODULE: ./src/util/get-proxy-details.js





function util_get_proxy_details_init() {
  "use strict";

  function getProxyDetails(proxy) {
    var cache = src_shared.memoize.utilGetProxyDetails;
    var cached = cache.get(proxy);

    if (cached !== void 0) {
      return cached.details;
    }

    if (!is_object_like(proxy)) {
      return;
    }

    var details = own_proxy.instances.get(proxy) || get_proxy_details(proxy);
    cache.set(proxy, {
      details
    });
    return details;
  }

  return getProxyDetails;
}

/* harmony default export */ var util_get_proxy_details = (src_shared.inited ? src_shared.module.utilGetProxyDetails : src_shared.module.utilGetProxyDetails = util_get_proxy_details_init());
// CONCATENATED MODULE: ./src/util/unwrap-proxy.js




function unwrap_proxy_init() {
  "use strict";

  function unwrapProxy(value) {
    if (!is_object_like(value)) {
      return value;
    }

    var cache = src_shared.memoize.utilUnwrapProxy;
    var cached = cache.get(value);

    if (cached !== void 0) {
      return cached;
    }

    var details;
    var unwrapped = value;

    while ((details = util_get_proxy_details(unwrapped)) !== void 0) {
      unwrapped = details[0];
    }

    cache.set(value, unwrapped);
    return unwrapped;
  }

  return unwrapProxy;
}

/* harmony default export */ var unwrap_proxy = (src_shared.inited ? src_shared.module.utilUnwrapProxy : src_shared.module.utilUnwrapProxy = unwrap_proxy_init());
// CONCATENATED MODULE: ./src/real/path.js



/* harmony default export */ var real_path = (src_shared.inited ? src_shared.module.realPath : src_shared.module.realPath = unwrap_proxy(real_require("path")));
// CONCATENATED MODULE: ./src/safe/path.js



var safePath = src_shared.inited ? src_shared.module.safePath : src_shared.module.safePath = util_safe(real_path);
var path_basename = safePath.basename,
    delimiter = safePath.delimiter,
    dirname = safePath.dirname,
    path_extname = safePath.extname,
    path_isAbsolute = safePath.isAbsolute,
    normalize = safePath.normalize,
    relative = safePath.relative,
    path_resolve = safePath.resolve,
    sep = safePath.sep,
    toNamespacedPath = safePath.toNamespacedPath;

/* harmony default export */ var safe_path = (safePath);
// CONCATENATED MODULE: ./src/constant/char-code.js
/* eslint-disable sort-keys */
var CHAR_CODE = {
  TAB: 9,
  CARRIAGE_RETURN: 13,
  SPACE: 32,
  EXCLAMATION_MARK: 33,
  QUOTE: 34,
  NUMSIGN: 35,
  PERCENT: 37,
  APOSTROPHE: 39,
  HYPHEN_MINUS: 45,
  DOT: 46,
  FORWARD_SLASH: 47,
  DIGIT_0: 48,
  DIGIT_9: 57,
  COLON: 58,
  SEMICOLON: 59,
  LEFT_ANGLE_BRACKET: 60,
  EQUAL: 61,
  RIGHT_ANGLE_BRACKET: 62,
  AT: 64,
  UPPERCASE_A: 65,
  UPPERCASE_E: 69,
  UPPERCASE_O: 79,
  UPPERCASE_Z: 90,
  BACKWARD_SLASH: 92,
  CIRCUMFLEX_ACCENT: 94,
  UNDERSCORE: 95,
  LOWERCASE_A: 97,
  LOWERCASE_D: 100,
  LOWERCASE_E: 101,
  LOWERCASE_F: 102,
  LOWERCASE_I: 105,
  LOWERCASE_J: 106,
  LOWERCASE_L: 108,
  LOWERCASE_M: 109,
  LOWERCASE_N: 110,
  LOWERCASE_O: 111,
  LOWERCASE_S: 115,
  LOWERCASE_V: 118,
  LOWERCASE_Z: 122,
  LEFT_CURLY_BRACKET: 123,
  TILDE: 126,
  ZERO_WIDTH_NOBREAK_SPACE: 65279
};
/* harmony default export */ var char_code = (CHAR_CODE);
// CONCATENATED MODULE: ./src/constant/entry.js
/* eslint-disable sort-keys */
var ENTRY = {
  ERROR_GETTER: {},
  ERROR_STAR: {},
  GETTER_TYPE_DEFAULT: 1,
  GETTER_TYPE_STAR_CONFLICT: 2,
  INITIAL_VALUE: {},
  LOAD_INDETERMINATE: -1,
  LOAD_INCOMPLETE: 0,
  LOAD_COMPLETED: 1,
  NAMESPACE_FINALIZATION_DEFERRED: -1,
  NAMESPACE_FINALIZATION_INCOMPLETE: 0,
  NAMESPACE_FINALIZATION_COMPLETED: 1,
  SETTER_TYPE_DEFAULT: 1,
  SETTER_TYPE_DYNAMIC_IMPORT: 2,
  SETTER_TYPE_EXPORT_FROM: 3,
  SETTER_TYPE_NAMESPACE: 4,
  STATE_INITIAL: 0,
  STATE_PARSING_STARTED: 1,
  STATE_PARSING_COMPLETED: 2,
  STATE_EXECUTION_STARTED: 3,
  STATE_EXECUTION_COMPLETED: 4,
  TYPE_CJS: 1,
  TYPE_PSEUDO: 2,
  TYPE_ESM: 3,
  TYPE_JSON: 4,
  TYPE_WASM: 5,
  UPDATE_TYPE_DEFAULT: 1,
  UPDATE_TYPE_LIVE: 2,
  UPDATE_TYPE_INIT: 3
};
/* harmony default export */ var constant_entry = (ENTRY);
// CONCATENATED MODULE: ./src/constant/compiler.js
/* eslint-disable sort-keys */
var COMPILER = {
  SOURCE_TYPE_SCRIPT: 1,
  SOURCE_TYPE_MODULE: 2,
  SOURCE_TYPE_UNAMBIGUOUS: 3,
  SOURCE_TYPE_JSON: 4,
  SOURCE_TYPE_WASM: 5,
  TRANSFORMS_CONSOLE: 1,
  TRANSFORMS_DYNAMIC_IMPORT: 2,
  TRANSFORMS_EXPORT: 4,
  TRANSFORMS_EVAL: 8,
  TRANSFORMS_IMPORT: 16,
  TRANSFORMS_IMPORT_META: 32,
  TRANSFORMS_REFLECT: 64,
  TRANSFORMS_TEMPORALS: 128,
  TRANSFORMS_UNDECLARED: 256
};
/* harmony default export */ var compiler = (COMPILER);
// CONCATENATED MODULE: ./src/util/always-true.js


function always_true_init() {
  "use strict";

  function alwaysTrue() {
    return true;
  }

  return alwaysTrue;
}

/* harmony default export */ var always_true = (src_shared.inited ? src_shared.module.utilAlwaysTrue : src_shared.module.utilAlwaysTrue = always_true_init());
// CONCATENATED MODULE: ./src/fast-path.js
// A simplified version of Recast's `FastPath`.
// Copyright Ben Newman. Released under MIT license:
// https://github.com/benjamn/recast





function fast_path_init() {
  "use strict";

  class FastPath {
    constructor(ast) {
      this.stack = [ast];
    } // Temporarily push a `key` and its `value` onto `this.stack`, then call the
    // `visitor` method with a reference to `this` (modified) `FastPath` object.
    // Note that the stack is restored to its original state after the `visitor`
    // method has finished, so don't retain a reference to the path.


    call(visitor, methodName, key) {
      var stack = this.stack;
      var object = stack[stack.length - 1];
      stack.push(key, object[key]);
      var result = visitor[methodName](this);
      stack.length -= 2;
      return result;
    } // Similar to `FastPath.prototype.call()`, except that the value obtained by
    // `this.getValue()` should be array-like. The `visitor` method is called
    // with a reference to this path object for each element of the array.


    each(visitor, methodName) {
      var stack = this.stack;
      var array = stack[stack.length - 1];
      var length = array.length;
      var i = -1;

      while (++i < length) {
        stack.push(i, array[i]);
        visitor[methodName](this);
        stack.length -= 2;
      }
    }

    getNode(pos, callback) {
      var stack = this.stack;
      var i = stack.length;

      if (typeof callback !== "function") {
        callback = always_true;
      }

      if (pos !== void 0) {
        i = pos < 0 ? i + pos : pos;
      }

      while (i-- > 0) {
        // Without a complete list of node type names, we have to settle for
        // this fuzzy matching of object shapes.
        var value = stack[i--];

        if (is_object(value) && !Array.isArray(value) && callback(value)) {
          return value;
        }
      }

      return null;
    }

    getParentNode(callback) {
      return this.getNode(-2, callback);
    }

    getValue() {
      var stack = this.stack;
      return stack[stack.length - 1];
    }

  }

  set_prototype_of(FastPath.prototype, null);
  return FastPath;
}

/* harmony default export */ var fast_path = (src_shared.inited ? src_shared.module.FastPath : src_shared.module.FastPath = fast_path_init());
// CONCATENATED MODULE: ./src/magic-string.js
// A simplified version of magic-string.
// Copyright Rich Harris. Released under MIT license:
// https://github.com/Rich-Harris/magic-string



function magic_string_init() {
  "use strict";

  class Chunk {
    constructor(start, end, content) {
      this.content = content;
      this.end = end;
      this.intro = "";
      this.original = content;
      this.outro = "";
      this.next = null;
      this.start = start;
    }

    appendLeft(content) {
      this.outro += content;
    }

    appendRight(content) {
      this.intro += content;
    }

    contains(index) {
      return this.start < index && index < this.end;
    }

    edit(content) {
      this.content = content;
      this.intro = "";
      this.outro = "";
    }

    prependLeft(content) {
      this.outro = content + this.outro;
    }

    prependRight(content) {
      this.intro = content + this.intro;
    }

    split(index) {
      var sliceIndex = index - this.start;
      var originalBefore = this.original.slice(0, sliceIndex);
      var originalAfter = this.original.slice(sliceIndex);
      var newChunk = new Chunk(index, this.end, originalAfter);
      newChunk.outro = this.outro;
      newChunk.next = this.next;
      this.original = originalBefore;
      this.end = index;
      this.content = originalBefore;
      this.outro = "";
      this.next = newChunk;
      return newChunk;
    }

    toString() {
      return this.intro + this.content + this.outro;
    }

  }

  set_prototype_of(Chunk.prototype, null);

  class MagicString {
    constructor(string) {
      var chunk = new Chunk(0, string.length, string);
      this.original = string;
      this.intro = "";
      this.outro = "";
      this.firstChunk = chunk;
      this.lastSearchedChunk = chunk;
      this.byStart = new Map();
      this.byStart.set(0, chunk);
      this.byEnd = new Map();
      this.byEnd.set(string.length, chunk);
    }

    appendLeft(index, content) {
      this._split(index);

      var chunk = this.byEnd.get(index);

      if (chunk === void 0) {
        this.intro += content;
      } else {
        chunk.appendLeft(content);
      }

      return this;
    }

    appendRight(index, content) {
      this._split(index);

      var chunk = this.byStart.get(index);

      if (chunk === void 0) {
        this.outro += content;
      } else {
        chunk.appendRight(content);
      }

      return this;
    }

    overwrite(start, end, content) {
      this._split(start);

      this._split(end);

      var first = this.byStart.get(start);
      var last = this.byEnd.get(end);

      if (start === end) {
        return content ? this.appendLeft(start, content) : this;
      }

      first.edit(content);

      if (first === last) {
        return this;
      }

      var chunk = first.next;

      while (chunk !== last) {
        chunk.edit("");
        chunk = chunk.next;
      }

      chunk.edit("");
      return this;
    }

    prependLeft(index, content) {
      this._split(index);

      var chunk = this.byEnd.get(index);

      if (chunk === void 0) {
        this.intro = content + this.intro;
      } else {
        chunk.prependLeft(content);
      }

      return this;
    }

    prependRight(index, content) {
      this._split(index);

      var chunk = this.byStart.get(index);

      if (chunk === void 0) {
        this.outro = content + this.outro;
      } else {
        chunk.prependRight(content);
      }

      return this;
    }

    _split(index) {
      if (this.byStart.has(index) || this.byEnd.has(index)) {
        return;
      }

      var chunk = this.lastSearchedChunk;
      var searchForward = index > chunk.end;

      while (chunk) {
        if (chunk.contains(index)) {
          this._splitChunk(chunk, index);

          return;
        }

        chunk = searchForward ? this.byStart.get(chunk.end) : this.byEnd.get(chunk.start);
      }
    }

    _splitChunk(chunk, index) {
      var newChunk = chunk.split(index);
      this.byEnd.set(index, chunk);
      this.byStart.set(index, newChunk);
      this.byEnd.set(newChunk.end, newChunk);
      this.lastSearchedChunk = chunk;
    }

    toString() {
      var string = this.intro;
      var chunk = this.firstChunk;

      while (chunk) {
        string += chunk.toString();
        chunk = chunk.next;
      }

      return string + this.outro;
    }

  }

  set_prototype_of(MagicString.prototype, null);
  return MagicString;
}

/* harmony default export */ var magic_string = (src_shared.inited ? src_shared.module.MagicString : src_shared.module.MagicString = magic_string_init());
// CONCATENATED MODULE: ./src/vendor/acorn/acorn/src/tokentype.js
// ## Token types
// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.
// All token type variables start with an underscore, to make them
// easy to recognize.
// The `beforeExpr` property is used to disambiguate between regular
// expressions and divisions. It is set on all token types that can
// be followed by an expression (thus, a slash after them would be a
// regular expression).
//
// The `startsExpr` property is used to check if the token ends a
// `yield` expression. It is set on all token types that either can
// directly start an expression (like a quotation mark) or can
// continue an expression (like the body of a string).
//
// `isLoop` marks a keyword as starting a loop, which is important
// to know when parsing a label, in order to allow or disallow
// continue jumps to that label.
class TokenType {
  constructor(label, conf = {}) {
    this.label = label;
    this.keyword = conf.keyword;
    this.beforeExpr = !!conf.beforeExpr;
    this.startsExpr = !!conf.startsExpr;
    this.isLoop = !!conf.isLoop;
    this.isAssign = !!conf.isAssign;
    this.prefix = !!conf.prefix;
    this.postfix = !!conf.postfix;
    this.binop = conf.binop || null;
    this.updateContext = null;
  }

}

function binop(name, prec) {
  "use strict";

  return new TokenType(name, {
    beforeExpr: true,
    binop: prec
  });
}

var beforeExpr = {
  beforeExpr: true
},
    startsExpr = {
  startsExpr: true
}; // Map keyword names to token types.

var keywords = {}; // Succinct definitions of keyword token types

function kw(name, options = {}) {
  options.keyword = name;
  return keywords[name] = new TokenType(name, options);
}

var tokentype_types = {
  num: new TokenType("num", startsExpr),
  regexp: new TokenType("regexp", startsExpr),
  string: new TokenType("string", startsExpr),
  name: new TokenType("name", startsExpr),
  privateId: new TokenType("privateId", startsExpr),
  eof: new TokenType("eof"),
  // Punctuation token types.
  bracketL: new TokenType("[", {
    beforeExpr: true,
    startsExpr: true
  }),
  bracketR: new TokenType("]"),
  braceL: new TokenType("{", {
    beforeExpr: true,
    startsExpr: true
  }),
  braceR: new TokenType("}"),
  parenL: new TokenType("(", {
    beforeExpr: true,
    startsExpr: true
  }),
  parenR: new TokenType(")"),
  comma: new TokenType(",", beforeExpr),
  semi: new TokenType(";", beforeExpr),
  colon: new TokenType(":", beforeExpr),
  dot: new TokenType("."),
  question: new TokenType("?", beforeExpr),
  questionDot: new TokenType("?."),
  arrow: new TokenType("=>", beforeExpr),
  template: new TokenType("template"),
  invalidTemplate: new TokenType("invalidTemplate"),
  ellipsis: new TokenType("...", beforeExpr),
  backQuote: new TokenType("`", startsExpr),
  dollarBraceL: new TokenType("${", {
    beforeExpr: true,
    startsExpr: true
  }),
  // Operators. These carry several kinds of properties to help the
  // parser use them properly (the presence of these properties is
  // what categorizes them as operators).
  //
  // `binop`, when present, specifies that this operator is a binary
  // operator, and will refer to its precedence.
  //
  // `prefix` and `postfix` mark the operator as a prefix or postfix
  // unary operator.
  //
  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  // binary operators with a very low precedence, that should result
  // in AssignmentExpression nodes.
  eq: new TokenType("=", {
    beforeExpr: true,
    isAssign: true
  }),
  assign: new TokenType("_=", {
    beforeExpr: true,
    isAssign: true
  }),
  incDec: new TokenType("++/--", {
    prefix: true,
    postfix: true,
    startsExpr: true
  }),
  prefix: new TokenType("!/~", {
    beforeExpr: true,
    prefix: true,
    startsExpr: true
  }),
  logicalOR: binop("||", 1),
  logicalAND: binop("&&", 2),
  bitwiseOR: binop("|", 3),
  bitwiseXOR: binop("^", 4),
  bitwiseAND: binop("&", 5),
  equality: binop("==/!=/===/!==", 6),
  relational: binop("</>/<=/>=", 7),
  bitShift: binop("<</>>/>>>", 8),
  plusMin: new TokenType("+/-", {
    beforeExpr: true,
    binop: 9,
    prefix: true,
    startsExpr: true
  }),
  modulo: binop("%", 10),
  star: binop("*", 10),
  slash: binop("/", 10),
  starstar: new TokenType("**", {
    beforeExpr: true
  }),
  coalesce: binop("??", 1),
  // Keyword token types.
  _break: kw("break"),
  _case: kw("case", beforeExpr),
  _catch: kw("catch"),
  _continue: kw("continue"),
  _debugger: kw("debugger"),
  _default: kw("default", beforeExpr),
  _do: kw("do", {
    isLoop: true,
    beforeExpr: true
  }),
  _else: kw("else", beforeExpr),
  _finally: kw("finally"),
  _for: kw("for", {
    isLoop: true
  }),
  _function: kw("function", startsExpr),
  _if: kw("if"),
  _return: kw("return", beforeExpr),
  _switch: kw("switch"),
  _throw: kw("throw", beforeExpr),
  _try: kw("try"),
  _var: kw("var"),
  _const: kw("const"),
  _while: kw("while", {
    isLoop: true
  }),
  _with: kw("with"),
  _new: kw("new", {
    beforeExpr: true,
    startsExpr: true
  }),
  _this: kw("this", startsExpr),
  _super: kw("super", startsExpr),
  _class: kw("class", startsExpr),
  _extends: kw("extends", beforeExpr),
  _export: kw("export"),
  _import: kw("import", startsExpr),
  _null: kw("null", startsExpr),
  _true: kw("true", startsExpr),
  _false: kw("false", startsExpr),
  _in: kw("in", {
    beforeExpr: true,
    binop: 7
  }),
  _instanceof: kw("instanceof", {
    beforeExpr: true,
    binop: 7
  }),
  _typeof: kw("typeof", {
    beforeExpr: true,
    prefix: true,
    startsExpr: true
  }),
  _void: kw("void", {
    beforeExpr: true,
    prefix: true,
    startsExpr: true
  }),
  _delete: kw("delete", {
    beforeExpr: true,
    prefix: true,
    startsExpr: true
  })
};
// CONCATENATED MODULE: ./src/vendor/acorn/acorn/src/identifier.js
// Reserved word lists for various dialects of the language
var reservedWords = {
  3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
  5: "class enum extends super const export import",
  6: "enum",
  strict: "implements interface let package private protected public static yield",
  strictBind: "eval arguments"
}; // And the keywords

var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";
var identifier_keywords = {
  5: ecma5AndLessKeywords,
  "5module": ecma5AndLessKeywords + " export import",
  6: ecma5AndLessKeywords + " const class extends export import super"
};
var keywordRelationalOperator = /^in(stanceof)?$/; // ## Character categories
// Big ugly regular expressions that match characters in the
// whitespace, identifier, and identifier-start categories. These
// are only applied when a character is found to actually have a
// code point above 128.
// Generated by `bin/generate-identifier-regex.js`.

var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0560-\u0588\u05d0-\u05ea\u05ef-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u0860-\u086a\u08a0-\u08b4\u08b6-\u08c7\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u09fc\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d04-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e86-\u0e8a\u0e8c-\u0ea3\u0ea5\u0ea7-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1878\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c88\u1c90-\u1cba\u1cbd-\u1cbf\u1ce9-\u1cec\u1cee-\u1cf3\u1cf5\u1cf6\u1cfa\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312f\u3131-\u318e\u31a0-\u31bf\u31f0-\u31ff\u3400-\u4dbf\u4e00-\u9ffc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7bf\ua7c2-\ua7ca\ua7f5-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua8fe\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab69\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";
var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u07fd\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08d3-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u09fe\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0afa-\u0aff\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b55-\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c04\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d00-\u0d03\u0d3b\u0d3c\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d81-\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1abf\u1ac0\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf4\u1cf7-\u1cf9\u1dc0-\u1df9\u1dfb-\u1dff\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua82c\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua8ff-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f";
var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
nonASCIIidentifierStartChars = nonASCIIidentifierChars = null; // These are a run-length and offset encoded representation of the
// >0xffff code points that are a valid part of identifiers. The
// offset starts at 0x10000, and each pair of numbers represents an
// offset to the next range, and then a size of the range. They were
// generated by bin/generate-identifier-regex.js
// eslint-disable-next-line comma-spacing

var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 157, 310, 10, 21, 11, 7, 153, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 349, 41, 7, 1, 79, 28, 11, 0, 9, 21, 107, 20, 28, 22, 13, 52, 76, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 85, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 159, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 230, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 35, 56, 264, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 328, 18, 190, 0, 80, 921, 103, 110, 18, 195, 2749, 1070, 4050, 582, 8634, 568, 8, 30, 114, 29, 19, 47, 17, 3, 32, 20, 6, 18, 689, 63, 129, 74, 6, 0, 67, 12, 65, 1, 2, 0, 29, 6135, 9, 1237, 43, 8, 8952, 286, 50, 2, 18, 3, 9, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 2357, 44, 11, 6, 17, 0, 370, 43, 1301, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42717, 35, 4148, 12, 221, 3, 5761, 15, 7472, 3104, 541, 1507, 4938]; // eslint-disable-next-line comma-spacing

var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 370, 1, 154, 10, 176, 2, 54, 14, 32, 9, 16, 3, 46, 10, 54, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 161, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 193, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 84, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 406, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 330, 3, 19306, 9, 135, 4, 60, 6, 26, 9, 1014, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 5319, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 262, 6, 10, 9, 419, 13, 1495, 6, 110, 6, 6, 9, 4759, 9, 787719, 239]; // This has a complexity linear to the value of the code. The
// assumption is that looking up astral identifier characters is
// rare.

function isInAstralSet(code, set) {
  "use strict";

  var pos = 0x10000;

  for (var i = 0; i < set.length; i += 2) {
    pos += set[i];
    if (pos > code) return false;
    pos += set[i + 1];
    if (pos >= code) return true;
  }
} // Test whether a given character code starts an identifier.


function isIdentifierStart(code, astral) {
  "use strict";

  if (code < 65) return code === 36;
  if (code < 91) return true;
  if (code < 97) return code === 95;
  if (code < 123) return true;
  if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code));
  if (astral === false) return false;
  return isInAstralSet(code, astralIdentifierStartCodes);
} // Test whether a given character is part of an identifier.

function isIdentifierChar(code, astral) {
  "use strict";

  if (code < 48) return code === 36;
  if (code < 58) return true;
  if (code < 65) return false;
  if (code < 91) return true;
  if (code < 97) return code === 95;
  if (code < 123) return true;
  if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code));
  if (astral === false) return false;
  return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
}
// CONCATENATED MODULE: ./src/vendor/acorn/acorn/src/whitespace.js
// Matches a whole line break (where CRLF is considered a single
// line break). Used to count lines.
var lineBreak = /\r\n?|\n|\u2028|\u2029/;
var lineBreakG = new RegExp(lineBreak.source, "g");
function isNewLine(code, ecma2019String) {
  "use strict";

  return code === 10 || code === 13 || !ecma2019String && (code === 0x2028 || code === 0x2029);
}
var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;
// CONCATENATED MODULE: ./src/vendor/acorn/acorn/src/util.js
var _Object$prototype = Object.prototype,
    util_hasOwnProperty = _Object$prototype.hasOwnProperty,
    util_toString = _Object$prototype.toString; // Checks if an object has a property.

function util_has(obj, propName) {
  "use strict";

  return util_hasOwnProperty.call(obj, propName);
}
var isArray = Array.isArray || function (obj) {
  return util_toString.call(obj) === "[object Array]";
};
function wordsRegexp(words) {
  "use strict";

  return new RegExp("^(?:" + words.replace(/ /g, "|") + ")$");
}
// CONCATENATED MODULE: ./src/vendor/acorn/acorn/src/locutil.js
 // These are used when `options.locations` is on, for the
// `startLoc` and `endLoc` properties.

class Position {
  constructor(line, col) {
    this.line = line;
    this.column = col;
  }

  offset(n) {
    return new Position(this.line, this.column + n);
  }

}
class SourceLocation {
  constructor(p, start, end) {
    this.start = start;
    this.end = end;
    if (p.sourceFile !== null) this.source = p.sourceFile;
  }

} // The `getLineInfo` function is mostly useful when the
// `locations` option is off (for performance reasons) and you
// want to find the line/column position for a given character
// offset. `input` should be the code string that the offset refers
// into.

function getLineInfo(input, offset) {
  "use strict";

  for (var line = 1, cur = 0;;) {
    lineBreakG.lastIndex = cur;
    var match = lineBreakG.exec(input);

    if (match && match.index < offset) {
      ++line;
      cur = match.index + match[0].length;
    } else {
      return new Position(line, offset - cur);
    }
  }
}
// CONCATENATED MODULE: ./src/vendor/acorn/acorn/src/options.js

 // A second argument must be given to configure the parser process.
// These options are recognized (only `ecmaVersion` is required):

var options_defaultOptions = {
  // `ecmaVersion` indicates the ECMAScript version to parse. Must be
  // either 3, 5, 6 (or 2015), 7 (2016), 8 (2017), 9 (2018), 10
  // (2019), 11 (2020), 12 (2021), or `"latest"` (the latest version
  // the library supports). This influences support for strict mode,
  // the set of reserved words, and support for new syntax features.
  ecmaVersion: null,
  // `sourceType` indicates the mode the code should be parsed in.
  // Can be either `"script"` or `"module"`. This influences global
  // strict mode and parsing of `import` and `export` declarations.
  sourceType: "script",
  // `onInsertedSemicolon` can be a callback that will be called
  // when a semicolon is automatically inserted. It will be passed
  // the position of the comma as an offset, and if `locations` is
  // enabled, it is given the location as a `{line, column}` object
  // as second argument.
  onInsertedSemicolon: null,
  // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
  // trailing commas.
  onTrailingComma: null,
  // By default, reserved words are only enforced if ecmaVersion >= 5.
  // Set `allowReserved` to a boolean value to explicitly turn this on
  // an off. When this option has the value "never", reserved words
  // and keywords can also not be used as property names.
  allowReserved: null,
  // When enabled, a return at the top level is not considered an
  // error.
  allowReturnOutsideFunction: false,
  // When enabled, import/export statements are not constrained to
  // appearing at the top of the program, and an import.meta expression
  // in a script isn't considered an error.
  allowImportExportEverywhere: false,
  // When enabled, await identifiers are allowed to appear at the top-level scope,
  // but they are still not allowed in non-async functions.
  allowAwaitOutsideFunction: false,
  // When enabled, hashbang directive in the beginning of file
  // is allowed and treated as a line comment.
  allowHashBang: false,
  // When `locations` is on, `loc` properties holding objects with
  // `start` and `end` properties in `{line, column}` form (with
  // line being 1-based and column 0-based) will be attached to the
  // nodes.
  locations: false,
  // A function can be passed as `onToken` option, which will
  // cause Acorn to call that function with object in the same
  // format as tokens returned from `tokenizer().getToken()`. Note
  // that you are not allowed to call the parser from the
  // callback—that will corrupt its internal state.
  onToken: null,
  // A function can be passed as `onComment` option, which will
  // cause Acorn to call that function with `(block, text, start,
  // end)` parameters whenever a comment is skipped. `block` is a
  // boolean indicating whether this is a block (`/* */`) comment,
  // `text` is the content of the comment, and `start` and `end` are
  // character offsets that denote the start and end of the comment.
  // When the `locations` option is on, two more parameters are
  // passed, the full `{line, column}` locations of the start and
  // end of the comments. Note that you are not allowed to call the
  // parser from the callback—that will corrupt its internal state.
  onComment: null,
  // Nodes have their start and end characters offsets recorded in
  // `start` and `end` properties (directly on the node, rather than
  // the `loc` object, which holds line/column data. To also add a
  // [semi-standardized][range] `range` property holding a `[start,
  // end]` array with the same numbers, set the `ranges` option to
  // `true`.
  //
  // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
  ranges: false,
  // It is possible to parse multiple files into a single AST by
  // passing the tree produced by parsing the first file as
  // `program` option in subsequent parses. This will add the
  // toplevel forms of the parsed file to the `Program` (top) node
  // of an existing parse tree.
  program: null,
  // When `locations` is on, you can pass this to record the source
  // file in every node's `loc` object.
  sourceFile: null,
  // This value, if given, is stored in every node, whether
  // `locations` is on or off.
  directSourceFile: null,
  // When enabled, parenthesized expressions are represented by
  // (non-standard) ParenthesizedExpression nodes
  preserveParens: false
}; // Interpret and default an options object

var warnedAboutEcmaVersion = false;
function options_getOptions(opts) {
  "use strict";

  var options = {};

  for (var opt in options_defaultOptions) {
    options[opt] = opts && util_has(opts, opt) ? opts[opt] : options_defaultOptions[opt];
  }

  if (options.ecmaVersion === "latest") {
    options.ecmaVersion = 1e8;
  } else if (options.ecmaVersion == null) {
    if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
      warnedAboutEcmaVersion = true;
      console.warn("Since Acorn 8.0.0, options.ecmaVersion is required.\nDefaulting to 2020, but this will stop working in the future.");
    }

    options.ecmaVersion = 11;
  } else if (options.ecmaVersion >= 2015) {
    options.ecmaVersion -= 2009;
  }

  if (options.allowReserved == null) options.allowReserved = options.ecmaVersion < 5;

  if (isArray(options.onToken)) {
    var tokens = options.onToken;

    options.onToken = function (token) {
      return tokens.push(token);
    };
  }

  if (isArray(options.onComment)) options.onComment = pushComment(options, options.onComment);
  return options;
}

function pushComment(options, array) {
  "use strict";

  return function (block, text, start, end, startLoc, endLoc) {
    var comment = {
      type: block ? "Block" : "Line",
      value: text,
      start: start,
      end: end
    };
    if (options.locations) comment.loc = new SourceLocation(this, startLoc, endLoc);
    if (options.ranges) comment.range = [start, end];
    array.push(comment);
  };
}
// CONCATENATED MODULE: ./src/vendor/acorn/acorn/src/scopeflags.js
// Each scope gets a bitset that may contain these flags
var SCOPE_TOP = 1,
    SCOPE_FUNCTION = 2,
    SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION,
    SCOPE_ASYNC = 4,
    SCOPE_GENERATOR = 8,
    SCOPE_ARROW = 16,
    SCOPE_SIMPLE_CATCH = 32,
    SCOPE_SUPER = 64,
    SCOPE_DIRECT_SUPER = 128;
function functionFlags(async, generator) {
  "use strict";

  return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0);
} // Used in checkLVal* and declareName to determine the type of a binding

var BIND_NONE = 0,
    // Not a binding
BIND_VAR = 1,
    // Var-style binding
BIND_LEXICAL = 2,
    // Let- or const-style binding
BIND_FUNCTION = 3,
    // Function declaration
BIND_SIMPLE_CATCH = 4,
    // Simple (identifier pattern) catch binding
BIND_OUTSIDE = 5; // Special case for function names as bound inside the function
// CONCATENATED MODULE: ./src/vendor/acorn/acorn/src/state.js






class state_Parser {
  constructor(options, input, startPos) {
    this.options = options = options_getOptions(options);
    this.sourceFile = options.sourceFile;
    this.keywords = wordsRegexp(identifier_keywords[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
    var reserved = "";

    if (options.allowReserved !== true) {
      reserved = reservedWords[options.ecmaVersion >= 6 ? 6 : options.ecmaVersion === 5 ? 5 : 3];
      if (options.sourceType === "module") reserved += " await";
    }

    this.reservedWords = wordsRegexp(reserved);
    var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
    this.reservedWordsStrict = wordsRegexp(reservedStrict);
    this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
    this.input = String(input); // Used to signal to callers of `readWord1` whether the word
    // contained any escape sequences. This is needed because words with
    // escape sequences must not be interpreted as keywords.

    this.containsEsc = false; // Set up token state
    // The current position of the tokenizer in the input.

    if (startPos) {
      this.pos = startPos;
      this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
      this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
    } else {
      this.pos = this.lineStart = 0;
      this.curLine = 1;
    } // Properties of the current token:
    // Its type


    this.type = tokentype_types.eof; // For tokens that include more information than their type, the value

    this.value = null; // Its start and end offset

    this.start = this.end = this.pos; // And, if locations are used, the {line, column} object
    // corresponding to those offsets

    this.startLoc = this.endLoc = this.curPosition(); // Position information for the previous token

    this.lastTokEndLoc = this.lastTokStartLoc = null;
    this.lastTokStart = this.lastTokEnd = this.pos; // The context stack is used to superficially track syntactic
    // context to predict whether a regular expression is allowed in a
    // given position.

    this.context = this.initialContext();
    this.exprAllowed = true; // Figure out if it's a module code.

    this.inModule = options.sourceType === "module";
    this.strict = this.inModule || this.strictDirective(this.pos); // Used to signify the start of a potential arrow function

    this.potentialArrowAt = -1;
    this.potentialArrowInForAwait = false; // Positions to delayed-check that yield/await does not exist in default parameters.

    this.yieldPos = this.awaitPos = this.awaitIdentPos = 0; // Labels in scope.

    this.labels = []; // Thus-far undefined exports.

    this.undefinedExports = Object.create(null); // If enabled, skip leading hashbang line.

    if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!") this.skipLineComment(2); // Scope tracking for duplicate variable names (see scope.js)

    this.scopeStack = [];
    this.enterScope(SCOPE_TOP); // For RegExp validation

    this.regexpState = null; // The stack of private names.
    // Each element has two properties: 'declared' and 'used'.
    // When it exited from the outermost class definition, all used private names must be declared.

    this.privateNameStack = [];
  }

  parse() {
    var node = this.options.program || this.startNode();
    this.nextToken();
    return this.parseTopLevel(node);
  }

  get inFunction() {
    return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0;
  }

  get inGenerator() {
    return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0 && !this.currentVarScope().inClassFieldInit;
  }

  get inAsync() {
    return (this.currentVarScope().flags & SCOPE_ASYNC) > 0 && !this.currentVarScope().inClassFieldInit;
  }

  get allowSuper() {
    var _this$currentThisScop = this.currentThisScope(),
        flags = _this$currentThisScop.flags,
        inClassFieldInit = _this$currentThisScop.inClassFieldInit;

    return (flags & SCOPE_SUPER) > 0 || inClassFieldInit;
  }

  get allowDirectSuper() {
    return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0;
  }

  get treatFunctionsAsVar() {
    return this.treatFunctionsAsVarInScope(this.currentScope());
  }

  get inNonArrowFunction() {
    var _this$currentThisScop2 = this.currentThisScope(),
        flags = _this$currentThisScop2.flags,
        inClassFieldInit = _this$currentThisScop2.inClassFieldInit;

    return (flags & SCOPE_FUNCTION) > 0 || inClassFieldInit;
  }

  static extend(...plugins) {
    var cls = this;

    for (var i = 0; i < plugins.length; i++) {
      cls = plugins[i](cls);
    }

    return cls;
  }

  static parse(input, options) {
    return new this(options, input).parse();
  }

  static parseExpressionAt(input, pos, options) {
    var parser = new this(options, input, pos);
    parser.nextToken();
    return parser.parseExpression();
  }

  static tokenizer(input, options) {
    return new this(options, input);
  }

}
// CONCATENATED MODULE: ./src/vendor/acorn/acorn/src/parseutil.js



var pp = state_Parser.prototype; // ## Parser utilities

var literal = /^(?:'((?:\\.|[^'\\])*?)'|"((?:\\.|[^"\\])*?)")/;

pp.strictDirective = function (start) {
  "use strict";

  for (;;) {
    // Try to find string literal.
    skipWhiteSpace.lastIndex = start;
    start += skipWhiteSpace.exec(this.input)[0].length;
    var match = literal.exec(this.input.slice(start));
    if (!match) return false;

    if ((match[1] || match[2]) === "use strict") {
      skipWhiteSpace.lastIndex = start + match[0].length;
      var spaceAfter = skipWhiteSpace.exec(this.input),
          end = spaceAfter.index + spaceAfter[0].length;
      var next = this.input.charAt(end);
      return next === ";" || next === "}" || lineBreak.test(spaceAfter[0]) && !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "=");
    }

    start += match[0].length; // Skip semicolon, if any.

    skipWhiteSpace.lastIndex = start;
    start += skipWhiteSpace.exec(this.input)[0].length;
    if (this.input[start] === ";") start++;
  }
}; // Predicate that tests whether the next token is of the given
// type, and if yes, consumes it as a side effect.


pp.eat = function (type) {
  "use strict";

  if (this.type === type) {
    this.next();
    return true;
  } else {
    return false;
  }
}; // Tests whether parsed token is a contextual keyword.


pp.isContextual = function (name) {
  "use strict";

  return this.type === tokentype_types.name && this.value === name && !this.containsEsc;
}; // Consumes contextual keyword if possible.


pp.eatContextual = function (name) {
  "use strict";

  if (!this.isContextual(name)) return false;
  this.next();
  return true;
}; // Asserts that following token is given contextual keyword.


pp.expectContextual = function (name) {
  "use strict";

  if (!this.eatContextual(name)) this.unexpected();
}; // Test whether a semicolon can be inserted at the current position.


pp.canInsertSemicolon = function () {
  "use strict";

  return this.type === tokentype_types.eof || this.type === tokentype_types.braceR || lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
};

pp.insertSemicolon = function () {
  "use strict";

  if (this.canInsertSemicolon()) {
    if (this.options.onInsertedSemicolon) this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
    return true;
  }
}; // Consume a semicolon, or, failing that, see if we are allowed to
// pretend that there is a semicolon at this position.


pp.semicolon = function () {
  "use strict";

  if (!this.eat(tokentype_types.semi) && !this.insertSemicolon()) this.unexpected();
};

pp.afterTrailingComma = function (tokType, notNext) {
  "use strict";

  if (this.type === tokType) {
    if (this.options.onTrailingComma) this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
    if (!notNext) this.next();
    return true;
  }
}; // Expect a token of a given type. If found, consume it, otherwise,
// raise an unexpected token error.


pp.expect = function (type) {
  "use strict";

  this.eat(type) || this.unexpected();
}; // Raise an unexpected token error.


pp.unexpected = function (pos) {
  "use strict";

  this.raise(pos != null ? pos : this.start, "Unexpected token");
};

function DestructuringErrors() {
  "use strict";

  this.shorthandAssign = this.trailingComma = this.parenthesizedAssign = this.parenthesizedBind = this.doubleProto = -1;
}

pp.checkPatternErrors = function (refDestructuringErrors, isAssign) {
  "use strict";

  if (!refDestructuringErrors) return;
  if (refDestructuringErrors.trailingComma > -1) this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element");
  var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
  if (parens > -1) this.raiseRecoverable(parens, "Parenthesized pattern");
};

pp.checkExpressionErrors = function (refDestructuringErrors, andThrow) {
  "use strict";

  if (!refDestructuringErrors) return false;
  var shorthandAssign = refDestructuringErrors.shorthandAssign,
      doubleProto = refDestructuringErrors.doubleProto;
  if (!andThrow) return shorthandAssign >= 0 || doubleProto >= 0;
  if (shorthandAssign >= 0) this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns");
  if (doubleProto >= 0) this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property");
};

pp.checkYieldAwaitInDefaultParams = function () {
  "use strict";

  if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos)) this.raise(this.yieldPos, "Yield expression cannot be a default value");
  if (this.awaitPos) this.raise(this.awaitPos, "Await expression cannot be a default value");
};

pp.isSimpleAssignTarget = function (expr) {
  "use strict";

  if (expr.type === "ParenthesizedExpression") return this.isSimpleAssignTarget(expr.expression);
  return expr.type === "Identifier" || expr.type === "MemberExpression";
};
// CONCATENATED MODULE: ./src/vendor/acorn/acorn/src/expression.js
// A recursive descent parser operates by defining functions for all
// syntactic elements, and recursively calling those, each function
// advancing the input stream and returning an AST node. Precedence
// of constructs (for example, the fact that `!x[1]` means `!(x[1])`
// instead of `(!x)[1]` is handled by the fact that the parser
// function that parses unary prefix operators is called first, and
// in turn calls the function that parses `[]` subscripts — that
// way, it'll receive the node for `x[1]` already parsed, and wraps
// *that* in the unary operator node.
//
// Acorn uses an [operator precedence parser][opp] to handle binary
// operator precedence, because it is much more compact than using
// the technique outlined above, which uses different, nesting
// functions to specify precedence, for all of the ten binary
// precedence levels that JavaScript defines.
//
// [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser





var expression_pp = state_Parser.prototype; // Check if property name clashes with already added.
// Object/class getters and setters are not allowed to clash —
// either with each other or with an init property — and in
// strict mode, init properties are also not allowed to be repeated.

expression_pp.checkPropClash = function (prop, propHash, refDestructuringErrors) {
  "use strict";

  if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement") return;
  if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand)) return;
  var key = prop.key,
      name;

  switch (key.type) {
    case "Identifier":
      name = key.name;
      break;

    case "Literal":
      name = String(key.value);
      break;

    default:
      return;
  }

  var kind = prop.kind;

  if (this.options.ecmaVersion >= 6) {
    if (name === "__proto__" && kind === "init") {
      if (propHash.proto) {
        if (refDestructuringErrors) {
          if (refDestructuringErrors.doubleProto < 0) refDestructuringErrors.doubleProto = key.start; // Backwards-compat kludge. Can be removed in version 6.0
        } else this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
      }

      propHash.proto = true;
    }

    return;
  }

  name = "$" + name;
  var other = propHash[name];

  if (other) {
    var redefinition;

    if (kind === "init") {
      redefinition = this.strict && other.init || other.get || other.set;
    } else {
      redefinition = other.init || other[kind];
    }

    if (redefinition) this.raiseRecoverable(key.start, "Redefinition of property");
  } else {
    other = propHash[name] = {
      init: false,
      get: false,
      set: false
    };
  }

  other[kind] = true;
}; // ### Expression parsing
// These nest, from the most general expression type at the top to
// 'atomic', nondivisible expression types at the bottom. Most of
// the functions will simply let the function(s) below them parse,
// and, *if* the syntactic construct they handle is present, wrap
// the AST node that the inner parser gave them in another node.
// Parse a full expression. The optional arguments are used to
// forbid the `in` operator (in for loops initalization expressions)
// and provide reference for storing '=' operator inside shorthand
// property assignment in contexts where both object expression
// and object pattern might appear (so it's possible to raise
// delayed syntax error at correct position).


expression_pp.parseExpression = function (forInit, refDestructuringErrors) {
  "use strict";

  var startPos = this.start,
      startLoc = this.startLoc;
  var expr = this.parseMaybeAssign(forInit, refDestructuringErrors);

  if (this.type === tokentype_types.comma) {
    var node = this.startNodeAt(startPos, startLoc);
    node.expressions = [expr];

    while (this.eat(tokentype_types.comma)) {
      node.expressions.push(this.parseMaybeAssign(forInit, refDestructuringErrors));
    }

    return this.finishNode(node, "SequenceExpression");
  }

  return expr;
}; // Parse an assignment expression. This includes applications of
// operators like `+=`.


expression_pp.parseMaybeAssign = function (forInit, refDestructuringErrors, afterLeftParse) {
  "use strict";

  if (this.isContextual("yield")) {
    if (this.inGenerator) return this.parseYield(forInit); // The tokenizer will assume an expression is allowed after
    // `yield`, but this isn't that kind of yield
    else this.exprAllowed = false;
  }

  var ownDestructuringErrors = false,
      oldParenAssign = -1,
      oldTrailingComma = -1;

  if (refDestructuringErrors) {
    oldParenAssign = refDestructuringErrors.parenthesizedAssign;
    oldTrailingComma = refDestructuringErrors.trailingComma;
    refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
  } else {
    refDestructuringErrors = new DestructuringErrors();
    ownDestructuringErrors = true;
  }

  var startPos = this.start,
      startLoc = this.startLoc;

  if (this.type === tokentype_types.parenL || this.type === tokentype_types.name) {
    this.potentialArrowAt = this.start;
    this.potentialArrowInForAwait = forInit === "await";
  }

  var left = this.parseMaybeConditional(forInit, refDestructuringErrors);
  if (afterLeftParse) left = afterLeftParse.call(this, left, startPos, startLoc);

  if (this.type.isAssign) {
    var node = this.startNodeAt(startPos, startLoc);
    node.operator = this.value;
    if (this.type === tokentype_types.eq) left = this.toAssignable(left, false, refDestructuringErrors);

    if (!ownDestructuringErrors) {
      refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1;
    }

    if (refDestructuringErrors.shorthandAssign >= left.start) refDestructuringErrors.shorthandAssign = -1; // reset because shorthand default was used correctly

    if (this.type === tokentype_types.eq) this.checkLValPattern(left);else this.checkLValSimple(left);
    node.left = left;
    this.next();
    node.right = this.parseMaybeAssign(forInit);
    return this.finishNode(node, "AssignmentExpression");
  } else {
    if (ownDestructuringErrors) this.checkExpressionErrors(refDestructuringErrors, true);
  }

  if (oldParenAssign > -1) refDestructuringErrors.parenthesizedAssign = oldParenAssign;
  if (oldTrailingComma > -1) refDestructuringErrors.trailingComma = oldTrailingComma;
  return left;
}; // Parse a ternary conditional (`?:`) operator.


expression_pp.parseMaybeConditional = function (forInit, refDestructuringErrors) {
  "use strict";

  var startPos = this.start,
      startLoc = this.startLoc;
  var expr = this.parseExprOps(forInit, refDestructuringErrors);
  if (this.checkExpressionErrors(refDestructuringErrors)) return expr;

  if (this.eat(tokentype_types.question)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.test = expr;
    node.consequent = this.parseMaybeAssign();
    this.expect(tokentype_types.colon);
    node.alternate = this.parseMaybeAssign(forInit);
    return this.finishNode(node, "ConditionalExpression");
  }

  return expr;
}; // Start the precedence parser.


expression_pp.parseExprOps = function (forInit, refDestructuringErrors) {
  "use strict";

  var startPos = this.start,
      startLoc = this.startLoc;
  var expr = this.parseMaybeUnary(refDestructuringErrors, false);
  if (this.checkExpressionErrors(refDestructuringErrors)) return expr;
  return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, forInit);
}; // Parse binary operators with the operator precedence parsing
// algorithm. `left` is the left-hand side of the operator.
// `minPrec` provides context that allows the function to stop and
// defer further parser to one of its callers when it encounters an
// operator that has a lower precedence than the set it is parsing.


expression_pp.parseExprOp = function (left, leftStartPos, leftStartLoc, minPrec, forInit) {
  "use strict";

  var prec = this.type.binop;

  if (prec != null && (!forInit || this.type !== tokentype_types._in)) {
    if (prec > minPrec) {
      var logical = this.type === tokentype_types.logicalOR || this.type === tokentype_types.logicalAND;
      var coalesce = this.type === tokentype_types.coalesce;

      if (coalesce) {
        // Handle the precedence of `tt.coalesce` as equal to the range of logical expressions.
        // In other words, `node.right` shouldn't contain logical expressions in order to check the mixed error.
        prec = tokentype_types.logicalAND.binop;
      }

      var op = this.value;
      this.next();
      var startPos = this.start,
          startLoc = this.startLoc;
      var right = this.parseExprOp(this.parseMaybeUnary(null, false), startPos, startLoc, prec, forInit);
      var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);

      if (logical && this.type === tokentype_types.coalesce || coalesce && (this.type === tokentype_types.logicalOR || this.type === tokentype_types.logicalAND)) {
        this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
      }

      return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, forInit);
    }
  }

  return left;
};

expression_pp.buildBinary = function (startPos, startLoc, left, right, op, logical) {
  "use strict";

  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.operator = op;
  node.right = right;
  return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression");
}; // Parse unary operators, both prefix and postfix.


expression_pp.parseMaybeUnary = function (refDestructuringErrors, sawUnary, incDec) {
  "use strict";

  var startPos = this.start,
      startLoc = this.startLoc,
      expr;

  if (this.isContextual("await") && (this.inAsync || !this.inFunction && this.options.allowAwaitOutsideFunction)) {
    expr = this.parseAwait();
    sawUnary = true;
  } else if (this.type.prefix) {
    var node = this.startNode(),
        update = this.type === tokentype_types.incDec;
    node.operator = this.value;
    node.prefix = true;
    this.next();
    node.argument = this.parseMaybeUnary(null, true, update);
    this.checkExpressionErrors(refDestructuringErrors, true);
    if (update) this.checkLValSimple(node.argument);else if (this.strict && node.operator === "delete" && node.argument.type === "Identifier") this.raiseRecoverable(node.start, "Deleting local variable in strict mode");else if (node.operator === "delete" && isPrivateFieldAccess(node.argument)) this.raiseRecoverable(node.start, "Private fields can not be deleted");else sawUnary = true;
    expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
  } else {
    expr = this.parseExprSubscripts(refDestructuringErrors);
    if (this.checkExpressionErrors(refDestructuringErrors)) return expr;

    while (this.type.postfix && !this.canInsertSemicolon()) {
      var _node = this.startNodeAt(startPos, startLoc);

      _node.operator = this.value;
      _node.prefix = false;
      _node.argument = expr;
      this.checkLValSimple(expr);
      this.next();
      expr = this.finishNode(_node, "UpdateExpression");
    }
  }

  if (!incDec && this.eat(tokentype_types.starstar)) {
    if (sawUnary) this.unexpected(this.lastTokStart);else return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false), "**", false);
  } else {
    return expr;
  }
};

function isPrivateFieldAccess(node) {
  "use strict";

  return node.type === "MemberExpression" && node.property.type === "PrivateIdentifier" || node.type === "ChainExpression" && isPrivateFieldAccess(node.expression);
} // Parse call, dot, and `[]`-subscript expressions.


expression_pp.parseExprSubscripts = function (refDestructuringErrors) {
  "use strict";

  var startPos = this.start,
      startLoc = this.startLoc;
  var expr = this.parseExprAtom(refDestructuringErrors);
  if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")") return expr;
  var result = this.parseSubscripts(expr, startPos, startLoc);

  if (refDestructuringErrors && result.type === "MemberExpression") {
    if (refDestructuringErrors.parenthesizedAssign >= result.start) refDestructuringErrors.parenthesizedAssign = -1;
    if (refDestructuringErrors.parenthesizedBind >= result.start) refDestructuringErrors.parenthesizedBind = -1;
    if (refDestructuringErrors.trailingComma >= result.start) refDestructuringErrors.trailingComma = -1;
  }

  return result;
};

expression_pp.parseSubscripts = function (base, startPos, startLoc, noCalls) {
  "use strict";

  var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" && this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 && this.potentialArrowAt === base.start;
  var optionalChained = false;

  while (true) {
    var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained);
    if (element.optional) optionalChained = true;

    if (element === base || element.type === "ArrowFunctionExpression") {
      if (optionalChained) {
        var chainNode = this.startNodeAt(startPos, startLoc);
        chainNode.expression = element;
        element = this.finishNode(chainNode, "ChainExpression");
      }

      return element;
    }

    base = element;
  }
};

expression_pp.parseSubscript = function (base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained) {
  "use strict";

  var optionalSupported = this.options.ecmaVersion >= 11;
  var optional = optionalSupported && this.eat(tokentype_types.questionDot);
  if (noCalls && optional) this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions");
  var computed = this.eat(tokentype_types.bracketL);

  if (computed || optional && this.type !== tokentype_types.parenL && this.type !== tokentype_types.backQuote || this.eat(tokentype_types.dot)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.object = base;

    if (computed) {
      node.property = this.parseExpression();
      this.expect(tokentype_types.bracketR);
    } else if (this.type === tokentype_types.privateId && base.type !== "Super") {
      node.property = this.parsePrivateIdent();
    } else {
      node.property = this.parseIdent(this.options.allowReserved !== "never");
    }

    node.computed = !!computed;

    if (optionalSupported) {
      node.optional = optional;
    }

    base = this.finishNode(node, "MemberExpression");
  } else if (!noCalls && this.eat(tokentype_types.parenL)) {
    var refDestructuringErrors = new DestructuringErrors(),
        oldYieldPos = this.yieldPos,
        oldAwaitPos = this.awaitPos,
        oldAwaitIdentPos = this.awaitIdentPos;
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    var exprList = this.parseExprList(tokentype_types.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);

    if (maybeAsyncArrow && !optional && !this.canInsertSemicolon() && this.eat(tokentype_types.arrow)) {
      this.checkPatternErrors(refDestructuringErrors, false);
      this.checkYieldAwaitInDefaultParams();
      if (this.awaitIdentPos > 0) this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function");
      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      this.awaitIdentPos = oldAwaitIdentPos;
      return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true);
    }

    this.checkExpressionErrors(refDestructuringErrors, true);
    this.yieldPos = oldYieldPos || this.yieldPos;
    this.awaitPos = oldAwaitPos || this.awaitPos;
    this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;

    var _node2 = this.startNodeAt(startPos, startLoc);

    _node2.callee = base;
    _node2.arguments = exprList;

    if (optionalSupported) {
      _node2.optional = optional;
    }

    base = this.finishNode(_node2, "CallExpression");
  } else if (this.type === tokentype_types.backQuote) {
    if (optional || optionalChained) {
      this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
    }

    var _node3 = this.startNodeAt(startPos, startLoc);

    _node3.tag = base;
    _node3.quasi = this.parseTemplate({
      isTagged: true
    });
    base = this.finishNode(_node3, "TaggedTemplateExpression");
  }

  return base;
}; // Parse an atomic expression — either a single token that is an
// expression, an expression started by a keyword like `function` or
// `new`, or an expression wrapped in punctuation like `()`, `[]`,
// or `{}`.


expression_pp.parseExprAtom = function (refDestructuringErrors) {
  "use strict";

  // If a division operator appears in an expression position, the
  // tokenizer got confused, and we force it to read a regexp instead.
  if (this.type === tokentype_types.slash) this.readRegexp();
  var node,
      canBeArrow = this.potentialArrowAt === this.start;

  switch (this.type) {
    case tokentype_types._super:
      if (!this.allowSuper) this.raise(this.start, "'super' keyword outside a method");
      node = this.startNode();
      this.next();
      if (this.type === tokentype_types.parenL && !this.allowDirectSuper) this.raise(node.start, "super() call outside constructor of a subclass"); // The `super` keyword can appear at below:
      // SuperProperty:
      //     super [ Expression ]
      //     super . IdentifierName
      // SuperCall:
      //     super ( Arguments )

      if (this.type !== tokentype_types.dot && this.type !== tokentype_types.bracketL && this.type !== tokentype_types.parenL) this.unexpected();
      return this.finishNode(node, "Super");

    case tokentype_types._this:
      node = this.startNode();
      this.next();
      return this.finishNode(node, "ThisExpression");

    case tokentype_types.name:
      var startPos = this.start,
          startLoc = this.startLoc,
          containsEsc = this.containsEsc;
      var id = this.parseIdent(false);
      if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(tokentype_types._function)) return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true);

      if (canBeArrow && !this.canInsertSemicolon()) {
        if (this.eat(tokentype_types.arrow)) return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false);

        if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === tokentype_types.name && !containsEsc && (!this.potentialArrowInForAwait || this.value !== "of" || this.containsEsc)) {
          id = this.parseIdent(false);
          if (this.canInsertSemicolon() || !this.eat(tokentype_types.arrow)) this.unexpected();
          return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true);
        }
      }

      return id;

    case tokentype_types.regexp:
      var value = this.value;
      node = this.parseLiteral(value.value);
      node.regex = {
        pattern: value.pattern,
        flags: value.flags
      };
      return node;

    case tokentype_types.num:
    case tokentype_types.string:
      return this.parseLiteral(this.value);

    case tokentype_types._null:
    case tokentype_types._true:
    case tokentype_types._false:
      node = this.startNode();
      node.value = this.type === tokentype_types._null ? null : this.type === tokentype_types._true;
      node.raw = this.type.keyword;
      this.next();
      return this.finishNode(node, "Literal");

    case tokentype_types.parenL:
      var start = this.start,
          expr = this.parseParenAndDistinguishExpression(canBeArrow);

      if (refDestructuringErrors) {
        if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr)) refDestructuringErrors.parenthesizedAssign = start;
        if (refDestructuringErrors.parenthesizedBind < 0) refDestructuringErrors.parenthesizedBind = start;
      }

      return expr;

    case tokentype_types.bracketL:
      node = this.startNode();
      this.next();
      node.elements = this.parseExprList(tokentype_types.bracketR, true, true, refDestructuringErrors);
      return this.finishNode(node, "ArrayExpression");

    case tokentype_types.braceL:
      return this.parseObj(false, refDestructuringErrors);

    case tokentype_types._function:
      node = this.startNode();
      this.next();
      return this.parseFunction(node, 0);

    case tokentype_types._class:
      return this.parseClass(this.startNode(), false);

    case tokentype_types._new:
      return this.parseNew();

    case tokentype_types.backQuote:
      return this.parseTemplate();

    case tokentype_types._import:
      if (this.options.ecmaVersion >= 11) {
        return this.parseExprImport();
      } else {
        return this.unexpected();
      }

    default:
      this.unexpected();
  }
};

expression_pp.parseExprImport = function () {
  "use strict";

  var node = this.startNode(); // Consume `import` as an identifier for `import.meta`.
  // Because `this.parseIdent(true)` doesn't check escape sequences, it needs the check of `this.containsEsc`.

  if (this.containsEsc) this.raiseRecoverable(this.start, "Escape sequence in keyword import");
  var meta = this.parseIdent(true);

  switch (this.type) {
    case tokentype_types.parenL:
      return this.parseDynamicImport(node);

    case tokentype_types.dot:
      node.meta = meta;
      return this.parseImportMeta(node);

    default:
      this.unexpected();
  }
};

expression_pp.parseDynamicImport = function (node) {
  "use strict";

  this.next(); // skip `(`
  // Parse node.source.

  node.source = this.parseMaybeAssign(); // Verify ending.

  if (!this.eat(tokentype_types.parenR)) {
    var errorPos = this.start;

    if (this.eat(tokentype_types.comma) && this.eat(tokentype_types.parenR)) {
      this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()");
    } else {
      this.unexpected(errorPos);
    }
  }

  return this.finishNode(node, "ImportExpression");
};

expression_pp.parseImportMeta = function (node) {
  "use strict";

  this.next(); // skip `.`

  var containsEsc = this.containsEsc;
  node.property = this.parseIdent(true);
  if (node.property.name !== "meta") this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'");
  if (containsEsc) this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters");
  if (this.options.sourceType !== "module" && !this.options.allowImportExportEverywhere) this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module");
  return this.finishNode(node, "MetaProperty");
};

expression_pp.parseLiteral = function (value) {
  "use strict";

  var node = this.startNode();
  node.value = value;
  node.raw = this.input.slice(this.start, this.end);
  if (node.raw.charCodeAt(node.raw.length - 1) === 110) node.bigint = node.raw.slice(0, -1).replace(/_/g, "");
  this.next();
  return this.finishNode(node, "Literal");
};

expression_pp.parseParenExpression = function () {
  "use strict";

  this.expect(tokentype_types.parenL);
  var val = this.parseExpression();
  this.expect(tokentype_types.parenR);
  return val;
};

expression_pp.parseParenAndDistinguishExpression = function (canBeArrow) {
  "use strict";

  var startPos = this.start,
      startLoc = this.startLoc,
      val,
      allowTrailingComma = this.options.ecmaVersion >= 8;

  if (this.options.ecmaVersion >= 6) {
    this.next();
    var innerStartPos = this.start,
        innerStartLoc = this.startLoc;
    var exprList = [],
        first = true,
        lastIsComma = false;
    var refDestructuringErrors = new DestructuringErrors(),
        oldYieldPos = this.yieldPos,
        oldAwaitPos = this.awaitPos,
        spreadStart;
    this.yieldPos = 0;
    this.awaitPos = 0; // Do not save awaitIdentPos to allow checking awaits nested in parameters

    while (this.type !== tokentype_types.parenR) {
      first ? first = false : this.expect(tokentype_types.comma);

      if (allowTrailingComma && this.afterTrailingComma(tokentype_types.parenR, true)) {
        lastIsComma = true;
        break;
      } else if (this.type === tokentype_types.ellipsis) {
        spreadStart = this.start;
        exprList.push(this.parseParenItem(this.parseRestBinding()));
        if (this.type === tokentype_types.comma) this.raise(this.start, "Comma is not permitted after the rest element");
        break;
      } else {
        exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
      }
    }

    var innerEndPos = this.start,
        innerEndLoc = this.startLoc;
    this.expect(tokentype_types.parenR);

    if (canBeArrow && !this.canInsertSemicolon() && this.eat(tokentype_types.arrow)) {
      this.checkPatternErrors(refDestructuringErrors, false);
      this.checkYieldAwaitInDefaultParams();
      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      return this.parseParenArrowList(startPos, startLoc, exprList);
    }

    if (!exprList.length || lastIsComma) this.unexpected(this.lastTokStart);
    if (spreadStart) this.unexpected(spreadStart);
    this.checkExpressionErrors(refDestructuringErrors, true);
    this.yieldPos = oldYieldPos || this.yieldPos;
    this.awaitPos = oldAwaitPos || this.awaitPos;

    if (exprList.length > 1) {
      val = this.startNodeAt(innerStartPos, innerStartLoc);
      val.expressions = exprList;
      this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
    } else {
      val = exprList[0];
    }
  } else {
    val = this.parseParenExpression();
  }

  if (this.options.preserveParens) {
    var par = this.startNodeAt(startPos, startLoc);
    par.expression = val;
    return this.finishNode(par, "ParenthesizedExpression");
  } else {
    return val;
  }
};

expression_pp.parseParenItem = function (item) {
  "use strict";

  return item;
};

expression_pp.parseParenArrowList = function (startPos, startLoc, exprList) {
  "use strict";

  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList);
}; // New's precedence is slightly tricky. It must allow its argument to
// be a `[]` or dot subscript expression, but not a call — at least,
// not without wrapping it in parentheses. Thus, it uses the noCalls
// argument to parseSubscripts to prevent it from consuming the
// argument list.


var empty = [];

expression_pp.parseNew = function () {
  "use strict";

  if (this.containsEsc) this.raiseRecoverable(this.start, "Escape sequence in keyword new");
  var node = this.startNode();
  var meta = this.parseIdent(true);

  if (this.options.ecmaVersion >= 6 && this.eat(tokentype_types.dot)) {
    node.meta = meta;
    var containsEsc = this.containsEsc;
    node.property = this.parseIdent(true);
    if (node.property.name !== "target") this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'");
    if (containsEsc) this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters");
    if (!this.inNonArrowFunction) this.raiseRecoverable(node.start, "'new.target' can only be used in functions");
    return this.finishNode(node, "MetaProperty");
  }

  var startPos = this.start,
      startLoc = this.startLoc,
      isImport = this.type === tokentype_types._import;
  node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true);

  if (isImport && node.callee.type === "ImportExpression") {
    this.raise(startPos, "Cannot use new with import()");
  }

  if (this.eat(tokentype_types.parenL)) node.arguments = this.parseExprList(tokentype_types.parenR, this.options.ecmaVersion >= 8, false);else node.arguments = empty;
  return this.finishNode(node, "NewExpression");
}; // Parse template expression.


expression_pp.parseTemplateElement = function ({
  isTagged
}) {
  var elem = this.startNode();

  if (this.type === tokentype_types.invalidTemplate) {
    if (!isTagged) {
      this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
    }

    elem.value = {
      raw: this.value,
      cooked: null
    };
  } else {
    elem.value = {
      raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
      cooked: this.value
    };
  }

  this.next();
  elem.tail = this.type === tokentype_types.backQuote;
  return this.finishNode(elem, "TemplateElement");
};

expression_pp.parseTemplate = function ({
  isTagged = false
} = {}) {
  var node = this.startNode();
  this.next();
  node.expressions = [];
  var curElt = this.parseTemplateElement({
    isTagged
  });
  node.quasis = [curElt];

  while (!curElt.tail) {
    if (this.type === tokentype_types.eof) this.raise(this.pos, "Unterminated template literal");
    this.expect(tokentype_types.dollarBraceL);
    node.expressions.push(this.parseExpression());
    this.expect(tokentype_types.braceR);
    node.quasis.push(curElt = this.parseTemplateElement({
      isTagged
    }));
  }

  this.next();
  return this.finishNode(node, "TemplateLiteral");
};

expression_pp.isAsyncProp = function (prop) {
  "use strict";

  return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" && (this.type === tokentype_types.name || this.type === tokentype_types.num || this.type === tokentype_types.string || this.type === tokentype_types.bracketL || this.type.keyword || this.options.ecmaVersion >= 9 && this.type === tokentype_types.star) && !lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
}; // Parse an object literal or binding pattern.


expression_pp.parseObj = function (isPattern, refDestructuringErrors) {
  "use strict";

  var node = this.startNode(),
      first = true,
      propHash = {};
  node.properties = [];
  this.next();

  while (!this.eat(tokentype_types.braceR)) {
    if (!first) {
      this.expect(tokentype_types.comma);
      if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(tokentype_types.braceR)) break;
    } else first = false;

    var prop = this.parseProperty(isPattern, refDestructuringErrors);
    if (!isPattern) this.checkPropClash(prop, propHash, refDestructuringErrors);
    node.properties.push(prop);
  }

  return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
};

expression_pp.parseProperty = function (isPattern, refDestructuringErrors) {
  "use strict";

  var prop = this.startNode(),
      isGenerator,
      isAsync,
      startPos,
      startLoc;

  if (this.options.ecmaVersion >= 9 && this.eat(tokentype_types.ellipsis)) {
    if (isPattern) {
      prop.argument = this.parseIdent(false);

      if (this.type === tokentype_types.comma) {
        this.raise(this.start, "Comma is not permitted after the rest element");
      }

      return this.finishNode(prop, "RestElement");
    } // To disallow parenthesized identifier via `this.toAssignable()`.


    if (this.type === tokentype_types.parenL && refDestructuringErrors) {
      if (refDestructuringErrors.parenthesizedAssign < 0) {
        refDestructuringErrors.parenthesizedAssign = this.start;
      }

      if (refDestructuringErrors.parenthesizedBind < 0) {
        refDestructuringErrors.parenthesizedBind = this.start;
      }
    } // Parse argument.


    prop.argument = this.parseMaybeAssign(false, refDestructuringErrors); // To disallow trailing comma via `this.toAssignable()`.

    if (this.type === tokentype_types.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
      refDestructuringErrors.trailingComma = this.start;
    } // Finish


    return this.finishNode(prop, "SpreadElement");
  }

  if (this.options.ecmaVersion >= 6) {
    prop.method = false;
    prop.shorthand = false;

    if (isPattern || refDestructuringErrors) {
      startPos = this.start;
      startLoc = this.startLoc;
    }

    if (!isPattern) isGenerator = this.eat(tokentype_types.star);
  }

  var containsEsc = this.containsEsc;
  this.parsePropertyName(prop);

  if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
    isAsync = true;
    isGenerator = this.options.ecmaVersion >= 9 && this.eat(tokentype_types.star);
    this.parsePropertyName(prop, refDestructuringErrors);
  } else {
    isAsync = false;
  }

  this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
  return this.finishNode(prop, "Property");
};

expression_pp.parsePropertyValue = function (prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
  "use strict";

  if ((isGenerator || isAsync) && this.type === tokentype_types.colon) this.unexpected();

  if (this.eat(tokentype_types.colon)) {
    prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
    prop.kind = "init";
  } else if (this.options.ecmaVersion >= 6 && this.type === tokentype_types.parenL) {
    if (isPattern) this.unexpected();
    prop.kind = "init";
    prop.method = true;
    prop.value = this.parseMethod(isGenerator, isAsync);
  } else if (!isPattern && !containsEsc && this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set") && this.type !== tokentype_types.comma && this.type !== tokentype_types.braceR && this.type !== tokentype_types.eq) {
    if (isGenerator || isAsync) this.unexpected();
    prop.kind = prop.key.name;
    this.parsePropertyName(prop);
    prop.value = this.parseMethod(false);
    var paramCount = prop.kind === "get" ? 0 : 1;

    if (prop.value.params.length !== paramCount) {
      var start = prop.value.start;
      if (prop.kind === "get") this.raiseRecoverable(start, "getter should have no params");else this.raiseRecoverable(start, "setter should have exactly one param");
    } else {
      if (prop.kind === "set" && prop.value.params[0].type === "RestElement") this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params");
    }
  } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
    if (isGenerator || isAsync) this.unexpected();
    this.checkUnreserved(prop.key);
    if (prop.key.name === "await" && !this.awaitIdentPos) this.awaitIdentPos = startPos;
    prop.kind = "init";

    if (isPattern) {
      prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
    } else if (this.type === tokentype_types.eq && refDestructuringErrors) {
      if (refDestructuringErrors.shorthandAssign < 0) refDestructuringErrors.shorthandAssign = this.start;
      prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
    } else {
      prop.value = this.copyNode(prop.key);
    }

    prop.shorthand = true;
  } else this.unexpected();
};

expression_pp.parsePropertyName = function (prop) {
  "use strict";

  if (this.options.ecmaVersion >= 6) {
    if (this.eat(tokentype_types.bracketL)) {
      prop.computed = true;
      prop.key = this.parseMaybeAssign();
      this.expect(tokentype_types.bracketR);
      return prop.key;
    } else {
      prop.computed = false;
    }
  }

  return prop.key = this.type === tokentype_types.num || this.type === tokentype_types.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
}; // Initialize empty function node.


expression_pp.initFunction = function (node) {
  "use strict";

  node.id = null;
  if (this.options.ecmaVersion >= 6) node.generator = node.expression = false;
  if (this.options.ecmaVersion >= 8) node.async = false;
}; // Parse object or class method.


expression_pp.parseMethod = function (isGenerator, isAsync, allowDirectSuper) {
  "use strict";

  var node = this.startNode(),
      oldYieldPos = this.yieldPos,
      oldAwaitPos = this.awaitPos,
      oldAwaitIdentPos = this.awaitIdentPos;
  this.initFunction(node);
  if (this.options.ecmaVersion >= 6) node.generator = isGenerator;
  if (this.options.ecmaVersion >= 8) node.async = !!isAsync;
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));
  this.expect(tokentype_types.parenL);
  node.params = this.parseBindingList(tokentype_types.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
  this.parseFunctionBody(node, false, true);
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, "FunctionExpression");
}; // Parse arrow function expression with given parameters.


expression_pp.parseArrowExpression = function (node, params, isAsync) {
  "use strict";

  var oldYieldPos = this.yieldPos,
      oldAwaitPos = this.awaitPos,
      oldAwaitIdentPos = this.awaitIdentPos;
  this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
  this.initFunction(node);
  if (this.options.ecmaVersion >= 8) node.async = !!isAsync;
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  node.params = this.toAssignableList(params, true);
  this.parseFunctionBody(node, true, false);
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, "ArrowFunctionExpression");
}; // Parse function body and check parameters.


expression_pp.parseFunctionBody = function (node, isArrowFunction, isMethod) {
  "use strict";

  var isExpression = isArrowFunction && this.type !== tokentype_types.braceL;
  var oldStrict = this.strict,
      useStrict = false;

  if (isExpression) {
    node.body = this.parseMaybeAssign();
    node.expression = true;
    this.checkParams(node, false);
  } else {
    var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);

    if (!oldStrict || nonSimple) {
      useStrict = this.strictDirective(this.end); // If this is a strict mode function, verify that argument names
      // are not repeated, and it does not try to bind the words `eval`
      // or `arguments`.

      if (useStrict && nonSimple) this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list");
    } // Start a new scope with regard to labels and the `inFunction`
    // flag (restore them to their old value afterwards).


    var oldLabels = this.labels;
    this.labels = [];
    if (useStrict) this.strict = true; // Add the params to varDeclaredNames to ensure that an error is thrown
    // if a let/const declaration in the function clashes with one of the params.

    this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params)); // Ensure the function name isn't a forbidden identifier in strict mode, e.g. 'eval'

    if (this.strict && node.id) this.checkLValSimple(node.id, BIND_OUTSIDE);
    node.body = this.parseBlock(false, undefined, useStrict && !oldStrict);
    node.expression = false;
    this.adaptDirectivePrologue(node.body.body);
    this.labels = oldLabels;
  }

  this.exitScope();
};

expression_pp.isSimpleParamList = function (params) {
  "use strict";

  for (var _i = 0, _length = params == null ? 0 : params.length; _i < _length; _i++) {
    var param = params[_i];
    if (param.type !== "Identifier") return false;
  }

  return true;
}; // Checks function params for various disallowed patterns such as using "eval"
// or "arguments" and duplicate parameters.


expression_pp.checkParams = function (node, allowDuplicates) {
  "use strict";

  var nameHash = Object.create(null);

  for (var _i2 = 0, _node$params = node.params, _length2 = _node$params == null ? 0 : _node$params.length; _i2 < _length2; _i2++) {
    var param = _node$params[_i2];
    this.checkLValInnerPattern(param, BIND_VAR, allowDuplicates ? null : nameHash);
  }
}; // Parses a comma-separated list of expressions, and returns them as
// an array. `close` is the token type that ends the list, and
// `allowEmpty` can be turned on to allow subsequent commas with
// nothing in between them to be parsed as `null` (which is needed
// for array literals).


expression_pp.parseExprList = function (close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
  "use strict";

  var elts = [],
      first = true;

  while (!this.eat(close)) {
    if (!first) {
      this.expect(tokentype_types.comma);
      if (allowTrailingComma && this.afterTrailingComma(close)) break;
    } else first = false;

    var elt = void 0;
    if (allowEmpty && this.type === tokentype_types.comma) elt = null;else if (this.type === tokentype_types.ellipsis) {
      elt = this.parseSpread(refDestructuringErrors);
      if (refDestructuringErrors && this.type === tokentype_types.comma && refDestructuringErrors.trailingComma < 0) refDestructuringErrors.trailingComma = this.start;
    } else {
      elt = this.parseMaybeAssign(false, refDestructuringErrors);
    }
    elts.push(elt);
  }

  return elts;
};

expression_pp.checkUnreserved = function ({
  start,
  end,
  name
}) {
  if (this.inGenerator && name === "yield") this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator");
  if (this.inAsync && name === "await") this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function");
  if (this.currentThisScope().inClassFieldInit && name === "arguments") this.raiseRecoverable(start, "Cannot use 'arguments' in class field initializer");
  if (this.keywords.test(name)) this.raise(start, `Unexpected keyword '${name}'`);
  if (this.options.ecmaVersion < 6 && this.input.slice(start, end).indexOf("\\") !== -1) return;
  var re = this.strict ? this.reservedWordsStrict : this.reservedWords;

  if (re.test(name)) {
    if (!this.inAsync && name === "await") this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function");
    this.raiseRecoverable(start, `The keyword '${name}' is reserved`);
  }
}; // Parse the next token as an identifier. If `liberal` is true (used
// when parsing properties), it will also convert keywords into
// identifiers.


expression_pp.parseIdent = function (liberal, isBinding) {
  "use strict";

  var node = this.startNode();

  if (this.type === tokentype_types.name) {
    node.name = this.value;
  } else if (this.type.keyword) {
    node.name = this.type.keyword; // To fix https://github.com/acornjs/acorn/issues/575
    // `class` and `function` keywords push new context into this.context.
    // But there is no chance to pop the context if the keyword is consumed as an identifier such as a property name.
    // If the previous token is a dot, this does not apply because the context-managing code already ignored the keyword

    if ((node.name === "class" || node.name === "function") && (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
      this.context.pop();
    }
  } else {
    this.unexpected();
  }

  this.next(!!liberal);
  this.finishNode(node, "Identifier");

  if (!liberal) {
    this.checkUnreserved(node);
    if (node.name === "await" && !this.awaitIdentPos) this.awaitIdentPos = node.start;
  }

  return node;
};

expression_pp.parsePrivateIdent = function () {
  "use strict";

  var node = this.startNode();

  if (this.type === tokentype_types.privateId) {
    node.name = this.value;
  } else {
    this.unexpected();
  }

  this.next();
  this.finishNode(node, "PrivateIdentifier"); // For validating existence

  if (this.privateNameStack.length === 0) {
    this.raise(node.start, `Private field '#${node.name}' must be declared in an enclosing class`);
  } else {
    this.privateNameStack[this.privateNameStack.length - 1].used.push(node);
  }

  return node;
}; // Parses yield expression inside generator.


expression_pp.parseYield = function (forInit) {
  "use strict";

  if (!this.yieldPos) this.yieldPos = this.start;
  var node = this.startNode();
  this.next();

  if (this.type === tokentype_types.semi || this.canInsertSemicolon() || this.type !== tokentype_types.star && !this.type.startsExpr) {
    node.delegate = false;
    node.argument = null;
  } else {
    node.delegate = this.eat(tokentype_types.star);
    node.argument = this.parseMaybeAssign(forInit);
  }

  return this.finishNode(node, "YieldExpression");
};

expression_pp.parseAwait = function () {
  "use strict";

  if (!this.awaitPos) this.awaitPos = this.start;
  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeUnary(null, true);
  return this.finishNode(node, "AwaitExpression");
};
// CONCATENATED MODULE: ./src/vendor/acorn/acorn/src/location.js


var location_pp = state_Parser.prototype; // This function is used to raise exceptions on parse errors. It
// takes an offset integer (into the current `input`) to indicate
// the location of the error, attaches the position to the end
// of the error message, and then raises a `SyntaxError` with that
// message.

location_pp.raise = function (pos, message) {
  "use strict";

  var loc = getLineInfo(this.input, pos);
  message += " (" + loc.line + ":" + loc.column + ")";
  var err = new SyntaxError(message);
  err.pos = pos;
  err.loc = loc;
  err.raisedAt = this.pos;
  throw err;
};

location_pp.raiseRecoverable = location_pp.raise;

location_pp.curPosition = function () {
  "use strict";

  if (this.options.locations) {
    return new Position(this.curLine, this.pos - this.lineStart);
  }
};
// CONCATENATED MODULE: ./src/vendor/acorn/acorn/src/lval.js




var lval_pp = state_Parser.prototype; // Convert existing expression atom to assignable pattern
// if possible.

lval_pp.toAssignable = function (node, isBinding, refDestructuringErrors) {
  "use strict";

  if (this.options.ecmaVersion >= 6 && node) {
    switch (node.type) {
      case "Identifier":
        if (this.inAsync && node.name === "await") this.raise(node.start, "Cannot use 'await' as identifier inside an async function");
        break;

      case "ObjectPattern":
      case "ArrayPattern":
      case "AssignmentPattern":
      case "RestElement":
        break;

      case "ObjectExpression":
        node.type = "ObjectPattern";
        if (refDestructuringErrors) this.checkPatternErrors(refDestructuringErrors, true);

        for (var _i = 0, _node$properties = node.properties, _length = _node$properties == null ? 0 : _node$properties.length; _i < _length; _i++) {
          var prop = _node$properties[_i];
          this.toAssignable(prop, isBinding); // Early error:
          //   AssignmentRestProperty[Yield, Await] :
          //     `...` DestructuringAssignmentTarget[Yield, Await]
          //
          //   It is a Syntax Error if |DestructuringAssignmentTarget| is an |ArrayLiteral| or an |ObjectLiteral|.

          if (prop.type === "RestElement" && (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")) {
            this.raise(prop.argument.start, "Unexpected token");
          }
        }

        break;

      case "Property":
        // AssignmentProperty has type === "Property"
        if (node.kind !== "init") this.raise(node.key.start, "Object pattern can't contain getter or setter");
        this.toAssignable(node.value, isBinding);
        break;

      case "ArrayExpression":
        node.type = "ArrayPattern";
        if (refDestructuringErrors) this.checkPatternErrors(refDestructuringErrors, true);
        this.toAssignableList(node.elements, isBinding);
        break;

      case "SpreadElement":
        node.type = "RestElement";
        this.toAssignable(node.argument, isBinding);
        if (node.argument.type === "AssignmentPattern") this.raise(node.argument.start, "Rest elements cannot have a default value");
        break;

      case "AssignmentExpression":
        if (node.operator !== "=") this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
        node.type = "AssignmentPattern";
        delete node.operator;
        this.toAssignable(node.left, isBinding);
        break;

      case "ParenthesizedExpression":
        this.toAssignable(node.expression, isBinding, refDestructuringErrors);
        break;

      case "ChainExpression":
        this.raiseRecoverable(node.start, "Optional chaining cannot appear in left-hand side");
        break;

      case "MemberExpression":
        if (!isBinding) break;

      default:
        this.raise(node.start, "Assigning to rvalue");
    }
  } else if (refDestructuringErrors) this.checkPatternErrors(refDestructuringErrors, true);

  return node;
}; // Convert list of expression atoms to binding list.


lval_pp.toAssignableList = function (exprList, isBinding) {
  "use strict";

  var end = exprList.length;

  for (var i = 0; i < end; i++) {
    var elt = exprList[i];
    if (elt) this.toAssignable(elt, isBinding);
  }

  if (end) {
    var last = exprList[end - 1];
    if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier") this.unexpected(last.argument.start);
  }

  return exprList;
}; // Parses spread element.


lval_pp.parseSpread = function (refDestructuringErrors) {
  "use strict";

  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
  return this.finishNode(node, "SpreadElement");
};

lval_pp.parseRestBinding = function () {
  "use strict";

  var node = this.startNode();
  this.next(); // RestElement inside of a function parameter must be an identifier

  if (this.options.ecmaVersion === 6 && this.type !== tokentype_types.name) this.unexpected();
  node.argument = this.parseBindingAtom();
  return this.finishNode(node, "RestElement");
}; // Parses lvalue (assignable) atom.


lval_pp.parseBindingAtom = function () {
  "use strict";

  if (this.options.ecmaVersion >= 6) {
    switch (this.type) {
      case tokentype_types.bracketL:
        var node = this.startNode();
        this.next();
        node.elements = this.parseBindingList(tokentype_types.bracketR, true, true);
        return this.finishNode(node, "ArrayPattern");

      case tokentype_types.braceL:
        return this.parseObj(true);
    }
  }

  return this.parseIdent();
};

lval_pp.parseBindingList = function (close, allowEmpty, allowTrailingComma) {
  "use strict";

  var elts = [],
      first = true;

  while (!this.eat(close)) {
    if (first) first = false;else this.expect(tokentype_types.comma);

    if (allowEmpty && this.type === tokentype_types.comma) {
      elts.push(null);
    } else if (allowTrailingComma && this.afterTrailingComma(close)) {
      break;
    } else if (this.type === tokentype_types.ellipsis) {
      var rest = this.parseRestBinding();
      this.parseBindingListItem(rest);
      elts.push(rest);
      if (this.type === tokentype_types.comma) this.raise(this.start, "Comma is not permitted after the rest element");
      this.expect(close);
      break;
    } else {
      var elem = this.parseMaybeDefault(this.start, this.startLoc);
      this.parseBindingListItem(elem);
      elts.push(elem);
    }
  }

  return elts;
};

lval_pp.parseBindingListItem = function (param) {
  "use strict";

  return param;
}; // Parses assignment pattern around given atom if possible.


lval_pp.parseMaybeDefault = function (startPos, startLoc, left) {
  "use strict";

  left = left || this.parseBindingAtom();
  if (this.options.ecmaVersion < 6 || !this.eat(tokentype_types.eq)) return left;
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.right = this.parseMaybeAssign();
  return this.finishNode(node, "AssignmentPattern");
}; // The following three functions all verify that a node is an lvalue —
// something that can be bound, or assigned to. In order to do so, they perform
// a variety of checks:
//
// - Check that none of the bound/assigned-to identifiers are reserved words.
// - Record name declarations for bindings in the appropriate scope.
// - Check duplicate argument names, if checkClashes is set.
//
// If a complex binding pattern is encountered (e.g., object and array
// destructuring), the entire pattern is recursively checked.
//
// There are three versions of checkLVal*() appropriate for different
// circumstances:
//
// - checkLValSimple() shall be used if the syntactic construct supports
//   nothing other than identifiers and member expressions. Parenthesized
//   expressions are also correctly handled. This is generally appropriate for
//   constructs for which the spec says
//
//   > It is a Syntax Error if AssignmentTargetType of [the production] is not
//   > simple.
//
//   It is also appropriate for checking if an identifier is valid and not
//   defined elsewhere, like import declarations or function/class identifiers.
//
//   Examples where this is used include:
//     a += …;
//     import a from '…';
//   where a is the node to be checked.
//
// - checkLValPattern() shall be used if the syntactic construct supports
//   anything checkLValSimple() supports, as well as object and array
//   destructuring patterns. This is generally appropriate for constructs for
//   which the spec says
//
//   > It is a Syntax Error if [the production] is neither an ObjectLiteral nor
//   > an ArrayLiteral and AssignmentTargetType of [the production] is not
//   > simple.
//
//   Examples where this is used include:
//     (a = …);
//     const a = …;
//     try { … } catch (a) { … }
//   where a is the node to be checked.
//
// - checkLValInnerPattern() shall be used if the syntactic construct supports
//   anything checkLValPattern() supports, as well as default assignment
//   patterns, rest elements, and other constructs that may appear within an
//   object or array destructuring pattern.
//
//   As a special case, function parameters also use checkLValInnerPattern(),
//   as they also support defaults and rest constructs.
//
// These functions deliberately support both assignment and binding constructs,
// as the logic for both is exceedingly similar. If the node is the target of
// an assignment, then bindingType should be set to BIND_NONE. Otherwise, it
// should be set to the appropriate BIND_* constant, like BIND_VAR or
// BIND_LEXICAL.
//
// If the function is called with a non-BIND_NONE bindingType, then
// additionally a checkClashes object may be specified to allow checking for
// duplicate argument names. checkClashes is ignored if the provided construct
// is an assignment (i.e., bindingType is BIND_NONE).


lval_pp.checkLValSimple = function (expr, bindingType = BIND_NONE, checkClashes) {
  var isBind = bindingType !== BIND_NONE;

  switch (expr.type) {
    case "Identifier":
      if (this.strict && this.reservedWordsStrictBind.test(expr.name)) this.raiseRecoverable(expr.start, (isBind ? "Binding " : "Assigning to ") + expr.name + " in strict mode");

      if (isBind) {
        if (bindingType === BIND_LEXICAL && expr.name === "let") this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name");

        if (checkClashes) {
          if (util_has(checkClashes, expr.name)) this.raiseRecoverable(expr.start, "Argument name clash");
          checkClashes[expr.name] = true;
        }

        if (bindingType !== BIND_OUTSIDE) this.declareName(expr.name, bindingType, expr.start);
      }

      break;

    case "ChainExpression":
      this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
      break;

    case "MemberExpression":
      if (isBind) this.raiseRecoverable(expr.start, "Binding member expression");
      break;

    case "ParenthesizedExpression":
      if (isBind) this.raiseRecoverable(expr.start, "Binding parenthesized expression");
      return this.checkLValSimple(expr.expression, bindingType, checkClashes);

    default:
      this.raise(expr.start, (isBind ? "Binding" : "Assigning to") + " rvalue");
  }
};

lval_pp.checkLValPattern = function (expr, bindingType = BIND_NONE, checkClashes) {
  switch (expr.type) {
    case "ObjectPattern":
      for (var _i2 = 0, _expr$properties = expr.properties, _length2 = _expr$properties == null ? 0 : _expr$properties.length; _i2 < _length2; _i2++) {
        var prop = _expr$properties[_i2];
        this.checkLValInnerPattern(prop, bindingType, checkClashes);
      }

      break;

    case "ArrayPattern":
      for (var _i3 = 0, _expr$elements = expr.elements, _length3 = _expr$elements == null ? 0 : _expr$elements.length; _i3 < _length3; _i3++) {
        var elem = _expr$elements[_i3];
        if (elem) this.checkLValInnerPattern(elem, bindingType, checkClashes);
      }

      break;

    default:
      this.checkLValSimple(expr, bindingType, checkClashes);
  }
};

lval_pp.checkLValInnerPattern = function (expr, bindingType = BIND_NONE, checkClashes) {
  switch (expr.type) {
    case "Property":
      // AssignmentProperty has type === "Property"
      this.checkLValInnerPattern(expr.value, bindingType, checkClashes);
      break;

    case "AssignmentPattern":
      this.checkLValPattern(expr.left, bindingType, checkClashes);
      break;

    case "RestElement":
      this.checkLValPattern(expr.argument, bindingType, checkClashes);
      break;

    default:
      this.checkLValPattern(expr, bindingType, checkClashes);
  }
};
// CONCATENATED MODULE: ./src/vendor/acorn/acorn/src/node.js


class node_Node {
  constructor(parser, pos, loc) {
    this.type = "";
    this.start = pos;
    this.end = 0;
    if (parser.options.locations) this.loc = new SourceLocation(parser, loc);
    if (parser.options.directSourceFile) this.sourceFile = parser.options.directSourceFile;
    if (parser.options.ranges) this.range = [pos, 0];
  }

} // Start an AST node, attaching a start offset.

var node_pp = state_Parser.prototype;

node_pp.startNode = function () {
  "use strict";

  return new node_Node(this, this.start, this.startLoc);
};

node_pp.startNodeAt = function (pos, loc) {
  "use strict";

  return new node_Node(this, pos, loc);
}; // Finish an AST node, adding `type` and `end` properties.


function finishNodeAt(node, type, pos, loc) {
  "use strict";

  node.type = type;
  node.end = pos;
  if (this.options.locations) node.loc.end = loc;
  if (this.options.ranges) node.range[1] = pos;
  return node;
}

node_pp.finishNode = function (node, type) {
  "use strict";

  return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc);
}; // Finish node at given position


node_pp.finishNodeAt = function (node, type, pos, loc) {
  "use strict";

  return finishNodeAt.call(this, node, type, pos, loc);
};

node_pp.copyNode = function (node) {
  "use strict";

  var newNode = new node_Node(this, node.start, this.startLoc);

  for (var prop in node) {
    newNode[prop] = node[prop];
  }

  return newNode;
};
// CONCATENATED MODULE: ./src/vendor/acorn/acorn/src/scope.js


var scope_pp = state_Parser.prototype;

class Scope {
  constructor(flags) {
    this.flags = flags; // A list of var-declared names in the current lexical scope

    this.var = []; // A list of lexically-declared names in the current lexical scope

    this.lexical = []; // A list of lexically-declared FunctionDeclaration names in the current lexical scope

    this.functions = []; // A switch to disallow the identifier reference 'arguments'

    this.inClassFieldInit = false;
  }

} // The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.


scope_pp.enterScope = function (flags) {
  "use strict";

  this.scopeStack.push(new Scope(flags));
};

scope_pp.exitScope = function () {
  "use strict";

  this.scopeStack.pop();
}; // The spec says:
// > At the top level of a function, or script, function declarations are
// > treated like var declarations rather than like lexical declarations.


scope_pp.treatFunctionsAsVarInScope = function (scope) {
  "use strict";

  return scope.flags & SCOPE_FUNCTION || !this.inModule && scope.flags & SCOPE_TOP;
};

scope_pp.declareName = function (name, bindingType, pos) {
  "use strict";

  var redeclared = false;

  if (bindingType === BIND_LEXICAL) {
    var scope = this.currentScope();
    redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
    scope.lexical.push(name);
    if (this.inModule && scope.flags & SCOPE_TOP) delete this.undefinedExports[name];
  } else if (bindingType === BIND_SIMPLE_CATCH) {
    var _scope = this.currentScope();

    _scope.lexical.push(name);
  } else if (bindingType === BIND_FUNCTION) {
    var _scope2 = this.currentScope();

    if (this.treatFunctionsAsVar) redeclared = _scope2.lexical.indexOf(name) > -1;else redeclared = _scope2.lexical.indexOf(name) > -1 || _scope2.var.indexOf(name) > -1;

    _scope2.functions.push(name);
  } else {
    for (var i = this.scopeStack.length - 1; i >= 0; --i) {
      var _scope3 = this.scopeStack[i];

      if (_scope3.lexical.indexOf(name) > -1 && !(_scope3.flags & SCOPE_SIMPLE_CATCH && _scope3.lexical[0] === name) || !this.treatFunctionsAsVarInScope(_scope3) && _scope3.functions.indexOf(name) > -1) {
        redeclared = true;
        break;
      }

      _scope3.var.push(name);

      if (this.inModule && _scope3.flags & SCOPE_TOP) delete this.undefinedExports[name];
      if (_scope3.flags & SCOPE_VAR) break;
    }
  }

  if (redeclared) this.raiseRecoverable(pos, `Identifier '${name}' has already been declared`);
};

scope_pp.checkLocalExport = function (id) {
  "use strict";

  // scope.functions must be empty as Module code is always strict.
  if (this.scopeStack[0].lexical.indexOf(id.name) === -1 && this.scopeStack[0].var.indexOf(id.name) === -1) {
    this.undefinedExports[id.name] = id;
  }
};

scope_pp.currentScope = function () {
  "use strict";

  return this.scopeStack[this.scopeStack.length - 1];
};

scope_pp.currentVarScope = function () {
  "use strict";

  for (var i = this.scopeStack.length - 1;; i--) {
    var scope = this.scopeStack[i];
    if (scope.flags & SCOPE_VAR) return scope;
  }
}; // Could be useful for `this`, `new.target`, `super()`, `super.property`, and `super[property]`.


scope_pp.currentThisScope = function () {
  "use strict";

  for (var i = this.scopeStack.length - 1;; i--) {
    var scope = this.scopeStack[i];
    if (scope.flags & SCOPE_VAR && !(scope.flags & SCOPE_ARROW)) return scope;
  }
};
// CONCATENATED MODULE: ./src/vendor/acorn/acorn/src/statement.js







var statement_pp = state_Parser.prototype; // ### Statement parsing
// Parse a program. Initializes the parser, reads any number of
// statements, and wraps them in a Program node.  Optionally takes a
// `program` argument.  If present, the statements will be appended
// to its body instead of creating a new node.

statement_pp.parseTopLevel = function (node) {
  "use strict";

  var exports = Object.create(null);
  if (!node.body) node.body = [];

  while (this.type !== tokentype_types.eof) {
    var stmt = this.parseStatement(null, true, exports);
    node.body.push(stmt);
  }

  if (this.inModule) for (var _i = 0, _Object$keys = Object.keys(this.undefinedExports), _length = _Object$keys == null ? 0 : _Object$keys.length; _i < _length; _i++) {
    var name = _Object$keys[_i];
    this.raiseRecoverable(this.undefinedExports[name].start, `Export '${name}' is not defined`);
  }
  this.adaptDirectivePrologue(node.body);
  this.next();
  node.sourceType = this.options.sourceType;
  return this.finishNode(node, "Program");
};

var loopLabel = {
  kind: "loop"
},
    switchLabel = {
  kind: "switch"
};

statement_pp.isLet = function (context) {
  "use strict";

  if (this.options.ecmaVersion < 6 || !this.isContextual("let")) return false;
  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length,
      nextCh = this.input.charCodeAt(next); // For ambiguous cases, determine if a LexicalDeclaration (or only a
  // Statement) is allowed here. If context is not empty then only a Statement
  // is allowed. However, `let [` is an explicit negative lookahead for
  // ExpressionStatement, so special-case it first.

  if (nextCh === 91) return true; // '['

  if (context) return false;
  if (nextCh === 123) return true; // '{'

  if (isIdentifierStart(nextCh, true)) {
    var pos = next + 1;

    while (isIdentifierChar(this.input.charCodeAt(pos), true)) {
      ++pos;
    }

    var ident = this.input.slice(next, pos);
    if (!keywordRelationalOperator.test(ident)) return true;
  }

  return false;
}; // check 'async [no LineTerminator here] function'
// - 'async /*foo*/ function' is OK.
// - 'async /*\n*/ function' is invalid.


statement_pp.isAsyncFunction = function () {
  "use strict";

  if (this.options.ecmaVersion < 8 || !this.isContextual("async")) return false;
  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length;
  return !lineBreak.test(this.input.slice(this.pos, next)) && this.input.slice(next, next + 8) === "function" && (next + 8 === this.input.length || !isIdentifierChar(this.input.charAt(next + 8)));
}; // Parse a single statement.
//
// If expecting a statement and finding a slash operator, parse a
// regular expression literal. This is to handle cases like
// `if (foo) /blah/.exec(foo)`, where looking at the previous token
// does not help.


statement_pp.parseStatement = function (context, topLevel, exports) {
  "use strict";

  var starttype = this.type,
      node = this.startNode(),
      kind;

  if (this.isLet(context)) {
    starttype = tokentype_types._var;
    kind = "let";
  } // Most types of statements are recognized by the keyword they
  // start with. Many are trivial to parse, some require a bit of
  // complexity.


  switch (starttype) {
    case tokentype_types._break:
    case tokentype_types._continue:
      return this.parseBreakContinueStatement(node, starttype.keyword);

    case tokentype_types._debugger:
      return this.parseDebuggerStatement(node);

    case tokentype_types._do:
      return this.parseDoStatement(node);

    case tokentype_types._for:
      return this.parseForStatement(node);

    case tokentype_types._function:
      // Function as sole body of either an if statement or a labeled statement
      // works, but not when it is part of a labeled statement that is the sole
      // body of an if statement.
      if (context && (this.strict || context !== "if" && context !== "label") && this.options.ecmaVersion >= 6) this.unexpected();
      return this.parseFunctionStatement(node, false, !context);

    case tokentype_types._class:
      if (context) this.unexpected();
      return this.parseClass(node, true);

    case tokentype_types._if:
      return this.parseIfStatement(node);

    case tokentype_types._return:
      return this.parseReturnStatement(node);

    case tokentype_types._switch:
      return this.parseSwitchStatement(node);

    case tokentype_types._throw:
      return this.parseThrowStatement(node);

    case tokentype_types._try:
      return this.parseTryStatement(node);

    case tokentype_types._const:
    case tokentype_types._var:
      kind = kind || this.value;
      if (context && kind !== "var") this.unexpected();
      return this.parseVarStatement(node, kind);

    case tokentype_types._while:
      return this.parseWhileStatement(node);

    case tokentype_types._with:
      return this.parseWithStatement(node);

    case tokentype_types.braceL:
      return this.parseBlock(true, node);

    case tokentype_types.semi:
      return this.parseEmptyStatement(node);

    case tokentype_types._export:
    case tokentype_types._import:
      if (this.options.ecmaVersion > 10 && starttype === tokentype_types._import) {
        skipWhiteSpace.lastIndex = this.pos;
        var skip = skipWhiteSpace.exec(this.input);
        var next = this.pos + skip[0].length,
            nextCh = this.input.charCodeAt(next);
        if (nextCh === 40 || nextCh === 46) // '(' or '.'
          return this.parseExpressionStatement(node, this.parseExpression());
      }

      if (!this.options.allowImportExportEverywhere) {
        if (!topLevel) this.raise(this.start, "'import' and 'export' may only appear at the top level");
        if (!this.inModule) this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
      }

      return starttype === tokentype_types._import ? this.parseImport(node) : this.parseExport(node, exports);
    // If the statement does not start with a statement keyword or a
    // brace, it's an ExpressionStatement or LabeledStatement. We
    // simply start parsing an expression, and afterwards, if the
    // next token is a colon and the expression was a simple
    // Identifier node, we switch to interpreting it as a label.

    default:
      if (this.isAsyncFunction()) {
        if (context) this.unexpected();
        this.next();
        return this.parseFunctionStatement(node, true, !context);
      }

      var maybeName = this.value,
          expr = this.parseExpression();
      if (starttype === tokentype_types.name && expr.type === "Identifier" && this.eat(tokentype_types.colon)) return this.parseLabeledStatement(node, maybeName, expr, context);else return this.parseExpressionStatement(node, expr);
  }
};

statement_pp.parseBreakContinueStatement = function (node, keyword) {
  "use strict";

  var isBreak = keyword === "break";
  this.next();
  if (this.eat(tokentype_types.semi) || this.insertSemicolon()) node.label = null;else if (this.type !== tokentype_types.name) this.unexpected();else {
    node.label = this.parseIdent();
    this.semicolon();
  } // Verify that there is an actual destination to break or
  // continue to.

  var i = 0;

  for (; i < this.labels.length; ++i) {
    var lab = this.labels[i];

    if (node.label == null || lab.name === node.label.name) {
      if (lab.kind != null && (isBreak || lab.kind === "loop")) break;
      if (node.label && isBreak) break;
    }
  }

  if (i === this.labels.length) this.raise(node.start, "Unsyntactic " + keyword);
  return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
};

statement_pp.parseDebuggerStatement = function (node) {
  "use strict";

  this.next();
  this.semicolon();
  return this.finishNode(node, "DebuggerStatement");
};

statement_pp.parseDoStatement = function (node) {
  "use strict";

  this.next();
  this.labels.push(loopLabel);
  node.body = this.parseStatement("do");
  this.labels.pop();
  this.expect(tokentype_types._while);
  node.test = this.parseParenExpression();
  if (this.options.ecmaVersion >= 6) this.eat(tokentype_types.semi);else this.semicolon();
  return this.finishNode(node, "DoWhileStatement");
}; // Disambiguating between a `for` and a `for`/`in` or `for`/`of`
// loop is non-trivial. Basically, we have to parse the init `var`
// statement or expression, disallowing the `in` operator (see
// the second parameter to `parseExpression`), and then check
// whether the next token is `in` or `of`. When there is no init
// part (semicolon immediately after the opening parenthesis), it
// is a regular `for` loop.


statement_pp.parseForStatement = function (node) {
  "use strict";

  this.next();
  var awaitAt = this.options.ecmaVersion >= 9 && (this.inAsync || !this.inFunction && this.options.allowAwaitOutsideFunction) && this.eatContextual("await") ? this.lastTokStart : -1;
  this.labels.push(loopLabel);
  this.enterScope(0);
  this.expect(tokentype_types.parenL);

  if (this.type === tokentype_types.semi) {
    if (awaitAt > -1) this.unexpected(awaitAt);
    return this.parseFor(node, null);
  }

  var isLet = this.isLet();

  if (this.type === tokentype_types._var || this.type === tokentype_types._const || isLet) {
    var _init = this.startNode(),
        kind = isLet ? "let" : this.value;

    this.next();
    this.parseVar(_init, true, kind);
    this.finishNode(_init, "VariableDeclaration");

    if ((this.type === tokentype_types._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) && _init.declarations.length === 1) {
      if (this.options.ecmaVersion >= 9) {
        if (this.type === tokentype_types._in) {
          if (awaitAt > -1) this.unexpected(awaitAt);
        } else node.await = awaitAt > -1;
      }

      return this.parseForIn(node, _init);
    }

    if (awaitAt > -1) this.unexpected(awaitAt);
    return this.parseFor(node, _init);
  }

  var refDestructuringErrors = new DestructuringErrors();
  var init = this.parseExpression(awaitAt > -1 ? "await" : true, refDestructuringErrors);

  if (this.type === tokentype_types._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) {
    if (this.options.ecmaVersion >= 9) {
      if (this.type === tokentype_types._in) {
        if (awaitAt > -1) this.unexpected(awaitAt);
      } else node.await = awaitAt > -1;
    }

    this.toAssignable(init, false, refDestructuringErrors);
    this.checkLValPattern(init);
    return this.parseForIn(node, init);
  } else {
    this.checkExpressionErrors(refDestructuringErrors, true);
  }

  if (awaitAt > -1) this.unexpected(awaitAt);
  return this.parseFor(node, init);
};

statement_pp.parseFunctionStatement = function (node, isAsync, declarationPosition) {
  "use strict";

  this.next();
  return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync);
};

statement_pp.parseIfStatement = function (node) {
  "use strict";

  this.next();
  node.test = this.parseParenExpression(); // allow function declarations in branches, but only in non-strict mode

  node.consequent = this.parseStatement("if");
  node.alternate = this.eat(tokentype_types._else) ? this.parseStatement("if") : null;
  return this.finishNode(node, "IfStatement");
};

statement_pp.parseReturnStatement = function (node) {
  "use strict";

  if (!this.inFunction && !this.options.allowReturnOutsideFunction) this.raise(this.start, "'return' outside of function");
  this.next(); // In `return` (and `break`/`continue`), the keywords with
  // optional arguments, we eagerly look for a semicolon or the
  // possibility to insert one.

  if (this.eat(tokentype_types.semi) || this.insertSemicolon()) node.argument = null;else {
    node.argument = this.parseExpression();
    this.semicolon();
  }
  return this.finishNode(node, "ReturnStatement");
};

statement_pp.parseSwitchStatement = function (node) {
  "use strict";

  this.next();
  node.discriminant = this.parseParenExpression();
  node.cases = [];
  this.expect(tokentype_types.braceL);
  this.labels.push(switchLabel);
  this.enterScope(0); // Statements under must be grouped (by label) in SwitchCase
  // nodes. `cur` is used to keep the node that we are currently
  // adding statements to.

  var cur;

  for (var sawDefault = false; this.type !== tokentype_types.braceR;) {
    if (this.type === tokentype_types._case || this.type === tokentype_types._default) {
      var isCase = this.type === tokentype_types._case;
      if (cur) this.finishNode(cur, "SwitchCase");
      node.cases.push(cur = this.startNode());
      cur.consequent = [];
      this.next();

      if (isCase) {
        cur.test = this.parseExpression();
      } else {
        if (sawDefault) this.raiseRecoverable(this.lastTokStart, "Multiple default clauses");
        sawDefault = true;
        cur.test = null;
      }

      this.expect(tokentype_types.colon);
    } else {
      if (!cur) this.unexpected();
      cur.consequent.push(this.parseStatement(null));
    }
  }

  this.exitScope();
  if (cur) this.finishNode(cur, "SwitchCase");
  this.next(); // Closing brace

  this.labels.pop();
  return this.finishNode(node, "SwitchStatement");
};

statement_pp.parseThrowStatement = function (node) {
  "use strict";

  this.next();
  if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) this.raise(this.lastTokEnd, "Illegal newline after throw");
  node.argument = this.parseExpression();
  this.semicolon();
  return this.finishNode(node, "ThrowStatement");
}; // Reused empty array added for node fields that are always empty.


var statement_empty = [];

statement_pp.parseTryStatement = function (node) {
  "use strict";

  this.next();
  node.block = this.parseBlock();
  node.handler = null;

  if (this.type === tokentype_types._catch) {
    var clause = this.startNode();
    this.next();

    if (this.eat(tokentype_types.parenL)) {
      clause.param = this.parseBindingAtom();
      var simple = clause.param.type === "Identifier";
      this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
      this.checkLValPattern(clause.param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
      this.expect(tokentype_types.parenR);
    } else {
      if (this.options.ecmaVersion < 10) this.unexpected();
      clause.param = null;
      this.enterScope(0);
    }

    clause.body = this.parseBlock(false);
    this.exitScope();
    node.handler = this.finishNode(clause, "CatchClause");
  }

  node.finalizer = this.eat(tokentype_types._finally) ? this.parseBlock() : null;
  if (!node.handler && !node.finalizer) this.raise(node.start, "Missing catch or finally clause");
  return this.finishNode(node, "TryStatement");
};

statement_pp.parseVarStatement = function (node, kind) {
  "use strict";

  this.next();
  this.parseVar(node, false, kind);
  this.semicolon();
  return this.finishNode(node, "VariableDeclaration");
};

statement_pp.parseWhileStatement = function (node) {
  "use strict";

  this.next();
  node.test = this.parseParenExpression();
  this.labels.push(loopLabel);
  node.body = this.parseStatement("while");
  this.labels.pop();
  return this.finishNode(node, "WhileStatement");
};

statement_pp.parseWithStatement = function (node) {
  "use strict";

  if (this.strict) this.raise(this.start, "'with' in strict mode");
  this.next();
  node.object = this.parseParenExpression();
  node.body = this.parseStatement("with");
  return this.finishNode(node, "WithStatement");
};

statement_pp.parseEmptyStatement = function (node) {
  "use strict";

  this.next();
  return this.finishNode(node, "EmptyStatement");
};

statement_pp.parseLabeledStatement = function (node, maybeName, expr, context) {
  "use strict";

  for (var _i2 = 0, _this$labels = this.labels, _length2 = _this$labels == null ? 0 : _this$labels.length; _i2 < _length2; _i2++) {
    var label = _this$labels[_i2];
    if (label.name === maybeName) this.raise(expr.start, "Label '" + maybeName + "' is already declared");
  }

  var kind = this.type.isLoop ? "loop" : this.type === tokentype_types._switch ? "switch" : null;

  for (var i = this.labels.length - 1; i >= 0; i--) {
    var _label = this.labels[i];

    if (_label.statementStart === node.start) {
      // Update information about previous labels on this node
      _label.statementStart = this.start;
      _label.kind = kind;
    } else break;
  }

  this.labels.push({
    name: maybeName,
    kind,
    statementStart: this.start
  });
  node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
  this.labels.pop();
  node.label = expr;
  return this.finishNode(node, "LabeledStatement");
};

statement_pp.parseExpressionStatement = function (node, expr) {
  "use strict";

  node.expression = expr;
  this.semicolon();
  return this.finishNode(node, "ExpressionStatement");
}; // Parse a semicolon-enclosed block of statements, handling `"use
// strict"` declarations when `allowStrict` is true (used for
// function bodies).


statement_pp.parseBlock = function (createNewLexicalScope = true, node = this.startNode(), exitStrict) {
  node.body = [];
  this.expect(tokentype_types.braceL);
  if (createNewLexicalScope) this.enterScope(0);

  while (this.type !== tokentype_types.braceR) {
    var stmt = this.parseStatement(null);
    node.body.push(stmt);
  }

  if (exitStrict) this.strict = false;
  this.next();
  if (createNewLexicalScope) this.exitScope();
  return this.finishNode(node, "BlockStatement");
}; // Parse a regular `for` loop. The disambiguation code in
// `parseStatement` will already have parsed the init statement or
// expression.


statement_pp.parseFor = function (node, init) {
  "use strict";

  node.init = init;
  this.expect(tokentype_types.semi);
  node.test = this.type === tokentype_types.semi ? null : this.parseExpression();
  this.expect(tokentype_types.semi);
  node.update = this.type === tokentype_types.parenR ? null : this.parseExpression();
  this.expect(tokentype_types.parenR);
  node.body = this.parseStatement("for");
  this.exitScope();
  this.labels.pop();
  return this.finishNode(node, "ForStatement");
}; // Parse a `for`/`in` and `for`/`of` loop, which are almost
// same from parser's perspective.


statement_pp.parseForIn = function (node, init) {
  "use strict";

  var isForIn = this.type === tokentype_types._in;
  this.next();

  if (init.type === "VariableDeclaration" && init.declarations[0].init != null && (!isForIn || this.options.ecmaVersion < 8 || this.strict || init.kind !== "var" || init.declarations[0].id.type !== "Identifier")) {
    this.raise(init.start, `${isForIn ? "for-in" : "for-of"} loop variable declaration may not have an initializer`);
  }

  node.left = init;
  node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
  this.expect(tokentype_types.parenR);
  node.body = this.parseStatement("for");
  this.exitScope();
  this.labels.pop();
  return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement");
}; // Parse a list of variable declarations.


statement_pp.parseVar = function (node, isFor, kind) {
  "use strict";

  node.declarations = [];
  node.kind = kind;

  for (;;) {
    var decl = this.startNode();
    this.parseVarId(decl, kind);

    if (this.eat(tokentype_types.eq)) {
      decl.init = this.parseMaybeAssign(isFor);
    } else if (kind === "const" && !(this.type === tokentype_types._in || this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
      this.unexpected();
    } else if (decl.id.type !== "Identifier" && !(isFor && (this.type === tokentype_types._in || this.isContextual("of")))) {
      this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
    } else {
      decl.init = null;
    }

    node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
    if (!this.eat(tokentype_types.comma)) break;
  }

  return node;
};

statement_pp.parseVarId = function (decl, kind) {
  "use strict";

  decl.id = this.parseBindingAtom();
  this.checkLValPattern(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
};

var FUNC_STATEMENT = 1,
    FUNC_HANGING_STATEMENT = 2,
    FUNC_NULLABLE_ID = 4; // Parse a function declaration or literal (depending on the
// `statement & FUNC_STATEMENT`).
// Remove `allowExpressionBody` for 7.0.0, as it is only called with false

statement_pp.parseFunction = function (node, statement, allowExpressionBody, isAsync) {
  "use strict";

  this.initFunction(node);

  if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
    if (this.type === tokentype_types.star && statement & FUNC_HANGING_STATEMENT) this.unexpected();
    node.generator = this.eat(tokentype_types.star);
  }

  if (this.options.ecmaVersion >= 8) node.async = !!isAsync;

  if (statement & FUNC_STATEMENT) {
    node.id = statement & FUNC_NULLABLE_ID && this.type !== tokentype_types.name ? null : this.parseIdent();
    if (node.id && !(statement & FUNC_HANGING_STATEMENT)) // If it is a regular function declaration in sloppy mode, then it is
      // subject to Annex B semantics (BIND_FUNCTION). Otherwise, the binding
      // mode depends on properties of the current scope (see
      // treatFunctionsAsVar).
      this.checkLValSimple(node.id, this.strict || node.generator || node.async ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION);
  }

  var oldYieldPos = this.yieldPos,
      oldAwaitPos = this.awaitPos,
      oldAwaitIdentPos = this.awaitIdentPos;
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  this.enterScope(functionFlags(node.async, node.generator));
  if (!(statement & FUNC_STATEMENT)) node.id = this.type === tokentype_types.name ? this.parseIdent() : null;
  this.parseFunctionParams(node);
  this.parseFunctionBody(node, allowExpressionBody, false);
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, statement & FUNC_STATEMENT ? "FunctionDeclaration" : "FunctionExpression");
};

statement_pp.parseFunctionParams = function (node) {
  "use strict";

  this.expect(tokentype_types.parenL);
  node.params = this.parseBindingList(tokentype_types.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
}; // Parse a class declaration or literal (depending on the
// `isStatement` parameter).


statement_pp.parseClass = function (node, isStatement) {
  "use strict";

  this.next(); // ecma-262 14.6 Class Definitions
  // A class definition is always strict mode code.

  var oldStrict = this.strict;
  this.strict = true;
  this.parseClassId(node, isStatement);
  this.parseClassSuper(node);
  var privateNameMap = this.enterClassBody();
  var classBody = this.startNode();
  var hadConstructor = false;
  classBody.body = [];
  this.expect(tokentype_types.braceL);

  while (this.type !== tokentype_types.braceR) {
    var element = this.parseClassElement(node.superClass !== null);

    if (element) {
      classBody.body.push(element);

      if (element.type === "MethodDefinition" && element.kind === "constructor") {
        if (hadConstructor) this.raise(element.start, "Duplicate constructor in the same class");
        hadConstructor = true;
      } else if (element.key.type === "PrivateIdentifier" && isPrivateNameConflicted(privateNameMap, element)) {
        this.raiseRecoverable(element.key.start, `Identifier '#${element.key.name}' has already been declared`);
      }
    }
  }

  this.strict = oldStrict;
  this.next();
  node.body = this.finishNode(classBody, "ClassBody");
  this.exitClassBody();
  return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
};

statement_pp.parseClassElement = function (constructorAllowsSuper) {
  "use strict";

  if (this.eat(tokentype_types.semi)) return null;
  var ecmaVersion = this.options.ecmaVersion;
  var node = this.startNode();
  var keyName = "";
  var isGenerator = false;
  var isAsync = false;
  var kind = "method"; // Parse modifiers

  node.static = false;

  if (this.eatContextual("static")) {
    if (this.isClassElementNameStart() || this.type === tokentype_types.star) {
      node.static = true;
    } else {
      keyName = "static";
    }
  }

  if (!keyName && ecmaVersion >= 8 && this.eatContextual("async")) {
    if ((this.isClassElementNameStart() || this.type === tokentype_types.star) && !this.canInsertSemicolon()) {
      isAsync = true;
    } else {
      keyName = "async";
    }
  }

  if (!keyName && (ecmaVersion >= 9 || !isAsync) && this.eat(tokentype_types.star)) {
    isGenerator = true;
  }

  if (!keyName && !isAsync && !isGenerator) {
    var lastValue = this.value;

    if (this.eatContextual("get") || this.eatContextual("set")) {
      if (this.isClassElementNameStart()) {
        kind = lastValue;
      } else {
        keyName = lastValue;
      }
    }
  } // Parse element name


  if (keyName) {
    // 'async', 'get', 'set', or 'static' were not a keyword contextually.
    // The last token is any of those. Make it the element name.
    node.computed = false;
    node.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);
    node.key.name = keyName;
    this.finishNode(node.key, "Identifier");
  } else {
    this.parseClassElementName(node);
  } // Parse element value


  if (ecmaVersion < 13 || this.type === tokentype_types.parenL || kind !== "method" || isGenerator || isAsync) {
    var isConstructor = !node.static && checkKeyName(node, "constructor");
    var allowsDirectSuper = isConstructor && constructorAllowsSuper; // Couldn't move this check into the 'parseClassMethod' method for backward compatibility.

    if (isConstructor && kind !== "method") this.raise(node.key.start, "Constructor can't have get/set modifier");
    node.kind = isConstructor ? "constructor" : kind;
    this.parseClassMethod(node, isGenerator, isAsync, allowsDirectSuper);
  } else {
    this.parseClassField(node);
  }

  return node;
};

statement_pp.isClassElementNameStart = function () {
  "use strict";

  return this.type === tokentype_types.name || this.type === tokentype_types.privateId || this.type === tokentype_types.num || this.type === tokentype_types.string || this.type === tokentype_types.bracketL || this.type.keyword;
};

statement_pp.parseClassElementName = function (element) {
  "use strict";

  if (this.type === tokentype_types.privateId) {
    if (this.value === "constructor") {
      this.raise(this.start, "Classes can't have an element named '#constructor'");
    }

    element.computed = false;
    element.key = this.parsePrivateIdent();
  } else {
    this.parsePropertyName(element);
  }
};

statement_pp.parseClassMethod = function (method, isGenerator, isAsync, allowsDirectSuper) {
  "use strict";

  // Check key and flags
  var key = method.key;

  if (method.kind === "constructor") {
    if (isGenerator) this.raise(key.start, "Constructor can't be a generator");
    if (isAsync) this.raise(key.start, "Constructor can't be an async method");
  } else if (method.static && checkKeyName(method, "prototype")) {
    this.raise(key.start, "Classes may not have a static property named prototype");
  } // Parse value


  var value = method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper); // Check value

  if (method.kind === "get" && value.params.length !== 0) this.raiseRecoverable(value.start, "getter should have no params");
  if (method.kind === "set" && value.params.length !== 1) this.raiseRecoverable(value.start, "setter should have exactly one param");
  if (method.kind === "set" && value.params[0].type === "RestElement") this.raiseRecoverable(value.params[0].start, "Setter cannot use rest params");
  return this.finishNode(method, "MethodDefinition");
};

statement_pp.parseClassField = function (field) {
  "use strict";

  if (checkKeyName(field, "constructor")) {
    this.raise(field.key.start, "Classes can't have a field named 'constructor'");
  } else if (field.static && checkKeyName(field, "prototype")) {
    this.raise(field.key.start, "Classes can't have a static field named 'prototype'");
  }

  if (this.eat(tokentype_types.eq)) {
    // To raise SyntaxError if 'arguments' exists in the initializer.
    var scope = this.currentThisScope();
    var inClassFieldInit = scope.inClassFieldInit;
    scope.inClassFieldInit = true;
    field.value = this.parseMaybeAssign();
    scope.inClassFieldInit = inClassFieldInit;
  } else {
    field.value = null;
  }

  this.semicolon();
  return this.finishNode(field, "PropertyDefinition");
};

statement_pp.parseClassId = function (node, isStatement) {
  "use strict";

  if (this.type === tokentype_types.name) {
    node.id = this.parseIdent();
    if (isStatement) this.checkLValSimple(node.id, BIND_LEXICAL, false);
  } else {
    if (isStatement === true) this.unexpected();
    node.id = null;
  }
};

statement_pp.parseClassSuper = function (node) {
  "use strict";

  node.superClass = this.eat(tokentype_types._extends) ? this.parseExprSubscripts() : null;
};

statement_pp.enterClassBody = function () {
  "use strict";

  var element = {
    declared: Object.create(null),
    used: []
  };
  this.privateNameStack.push(element);
  return element.declared;
};

statement_pp.exitClassBody = function () {
  "use strict";

  var _this$privateNameStac = this.privateNameStack.pop(),
      declared = _this$privateNameStac.declared,
      used = _this$privateNameStac.used;

  var len = this.privateNameStack.length;
  var parent = len === 0 ? null : this.privateNameStack[len - 1];

  for (var i = 0; i < used.length; ++i) {
    var id = used[i];

    if (!util_has(declared, id.name)) {
      if (parent) {
        parent.used.push(id);
      } else {
        this.raiseRecoverable(id.start, `Private field '#${id.name}' must be declared in an enclosing class`);
      }
    }
  }
};

function isPrivateNameConflicted(privateNameMap, element) {
  "use strict";

  var name = element.key.name;
  var curr = privateNameMap[name];
  var next = "true";

  if (element.type === "MethodDefinition" && (element.kind === "get" || element.kind === "set")) {
    next = (element.static ? "s" : "i") + element.kind;
  } // `class { get #a(){}; static set #a(_){} }` is also conflict.


  if (curr === "iget" && next === "iset" || curr === "iset" && next === "iget" || curr === "sget" && next === "sset" || curr === "sset" && next === "sget") {
    privateNameMap[name] = "true";
    return false;
  } else if (!curr) {
    privateNameMap[name] = next;
    return false;
  } else {
    return true;
  }
}

function checkKeyName(node, name) {
  "use strict";

  var computed = node.computed,
      key = node.key;
  return !computed && (key.type === "Identifier" && key.name === name || key.type === "Literal" && key.value === name);
} // Parses module export declaration.


statement_pp.parseExport = function (node, exports) {
  "use strict";

  this.next(); // export * from '...'

  if (this.eat(tokentype_types.star)) {
    if (this.options.ecmaVersion >= 11) {
      if (this.eatContextual("as")) {
        node.exported = this.parseIdent(true);
        this.checkExport(exports, node.exported.name, this.lastTokStart);
      } else {
        node.exported = null;
      }
    }

    this.expectContextual("from");
    if (this.type !== tokentype_types.string) this.unexpected();
    node.source = this.parseExprAtom();
    this.semicolon();
    return this.finishNode(node, "ExportAllDeclaration");
  }

  if (this.eat(tokentype_types._default)) {
    // export default ...
    this.checkExport(exports, "default", this.lastTokStart);
    var isAsync;

    if (this.type === tokentype_types._function || (isAsync = this.isAsyncFunction())) {
      var fNode = this.startNode();
      this.next();
      if (isAsync) this.next();
      node.declaration = this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync);
    } else if (this.type === tokentype_types._class) {
      var cNode = this.startNode();
      node.declaration = this.parseClass(cNode, "nullableID");
    } else {
      node.declaration = this.parseMaybeAssign();
      this.semicolon();
    }

    return this.finishNode(node, "ExportDefaultDeclaration");
  } // export var|const|let|function|class ...


  if (this.shouldParseExportStatement()) {
    node.declaration = this.parseStatement(null);
    if (node.declaration.type === "VariableDeclaration") this.checkVariableExport(exports, node.declaration.declarations);else this.checkExport(exports, node.declaration.id.name, node.declaration.id.start);
    node.specifiers = [];
    node.source = null;
  } else {
    // export { x, y as z } [from '...']
    node.declaration = null;
    node.specifiers = this.parseExportSpecifiers(exports);

    if (this.eatContextual("from")) {
      if (this.type !== tokentype_types.string) this.unexpected();
      node.source = this.parseExprAtom();
    } else {
      for (var _i3 = 0, _node$specifiers = node.specifiers, _length3 = _node$specifiers == null ? 0 : _node$specifiers.length; _i3 < _length3; _i3++) {
        var spec = _node$specifiers[_i3];
        // check for keywords used as local names
        this.checkUnreserved(spec.local); // check if export is defined

        this.checkLocalExport(spec.local);
      }

      node.source = null;
    }

    this.semicolon();
  }

  return this.finishNode(node, "ExportNamedDeclaration");
};

statement_pp.checkExport = function (exports, name, pos) {
  "use strict";

  if (!exports) return;
  if (util_has(exports, name)) this.raiseRecoverable(pos, "Duplicate export '" + name + "'");
  exports[name] = true;
};

statement_pp.checkPatternExport = function (exports, pat) {
  "use strict";

  var type = pat.type;
  if (type === "Identifier") this.checkExport(exports, pat.name, pat.start);else if (type === "ObjectPattern") for (var _i4 = 0, _pat$properties = pat.properties, _length4 = _pat$properties == null ? 0 : _pat$properties.length; _i4 < _length4; _i4++) {
    var prop = _pat$properties[_i4];
    this.checkPatternExport(exports, prop);
  } else if (type === "ArrayPattern") for (var _i5 = 0, _pat$elements = pat.elements, _length5 = _pat$elements == null ? 0 : _pat$elements.length; _i5 < _length5; _i5++) {
    var elt = _pat$elements[_i5];
    if (elt) this.checkPatternExport(exports, elt);
  } else if (type === "Property") this.checkPatternExport(exports, pat.value);else if (type === "AssignmentPattern") this.checkPatternExport(exports, pat.left);else if (type === "RestElement") this.checkPatternExport(exports, pat.argument);else if (type === "ParenthesizedExpression") this.checkPatternExport(exports, pat.expression);
};

statement_pp.checkVariableExport = function (exports, decls) {
  "use strict";

  if (!exports) return;

  for (var _i6 = 0, _length6 = decls == null ? 0 : decls.length; _i6 < _length6; _i6++) {
    var decl = decls[_i6];
    this.checkPatternExport(exports, decl.id);
  }
};

statement_pp.shouldParseExportStatement = function () {
  "use strict";

  return this.type.keyword === "var" || this.type.keyword === "const" || this.type.keyword === "class" || this.type.keyword === "function" || this.isLet() || this.isAsyncFunction();
}; // Parses a comma-separated list of module exports.


statement_pp.parseExportSpecifiers = function (exports) {
  "use strict";

  var nodes = [],
      first = true; // export { x, y as z } [from '...']

  this.expect(tokentype_types.braceL);

  while (!this.eat(tokentype_types.braceR)) {
    if (!first) {
      this.expect(tokentype_types.comma);
      if (this.afterTrailingComma(tokentype_types.braceR)) break;
    } else first = false;

    var node = this.startNode();
    node.local = this.parseIdent(true);
    node.exported = this.eatContextual("as") ? this.parseIdent(true) : node.local;
    this.checkExport(exports, node.exported.name, node.exported.start);
    nodes.push(this.finishNode(node, "ExportSpecifier"));
  }

  return nodes;
}; // Parses import declaration.


statement_pp.parseImport = function (node) {
  "use strict";

  this.next(); // import '...'

  if (this.type === tokentype_types.string) {
    node.specifiers = statement_empty;
    node.source = this.parseExprAtom();
  } else {
    node.specifiers = this.parseImportSpecifiers();
    this.expectContextual("from");
    node.source = this.type === tokentype_types.string ? this.parseExprAtom() : this.unexpected();
  }

  this.semicolon();
  return this.finishNode(node, "ImportDeclaration");
}; // Parses a comma-separated list of module imports.


statement_pp.parseImportSpecifiers = function () {
  "use strict";

  var nodes = [],
      first = true;

  if (this.type === tokentype_types.name) {
    // import defaultObj, { x, y as z } from '...'
    var node = this.startNode();
    node.local = this.parseIdent();
    this.checkLValSimple(node.local, BIND_LEXICAL);
    nodes.push(this.finishNode(node, "ImportDefaultSpecifier"));
    if (!this.eat(tokentype_types.comma)) return nodes;
  }

  if (this.type === tokentype_types.star) {
    var _node = this.startNode();

    this.next();
    this.expectContextual("as");
    _node.local = this.parseIdent();
    this.checkLValSimple(_node.local, BIND_LEXICAL);
    nodes.push(this.finishNode(_node, "ImportNamespaceSpecifier"));
    return nodes;
  }

  this.expect(tokentype_types.braceL);

  while (!this.eat(tokentype_types.braceR)) {
    if (!first) {
      this.expect(tokentype_types.comma);
      if (this.afterTrailingComma(tokentype_types.braceR)) break;
    } else first = false;

    var _node2 = this.startNode();

    _node2.imported = this.parseIdent(true);

    if (this.eatContextual("as")) {
      _node2.local = this.parseIdent();
    } else {
      this.checkUnreserved(_node2.imported);
      _node2.local = _node2.imported;
    }

    this.checkLValSimple(_node2.local, BIND_LEXICAL);
    nodes.push(this.finishNode(_node2, "ImportSpecifier"));
  }

  return nodes;
}; // Set `ExpressionStatement#directive` property for directive prologues.


statement_pp.adaptDirectivePrologue = function (statements) {
  "use strict";

  for (var i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
    statements[i].directive = statements[i].expression.raw.slice(1, -1);
  }
};

statement_pp.isDirectiveCandidate = function (statement) {
  "use strict";

  return statement.type === "ExpressionStatement" && statement.expression.type === "Literal" && typeof statement.expression.value === "string" && ( // Reject parenthesized strings.
  this.input[statement.start] === "\"" || this.input[statement.start] === "'");
};
// CONCATENATED MODULE: ./src/vendor/acorn/acorn/src/tokencontext.js
// The algorithm used to determine whether a regexp can appear at a
// given point in the program is loosely based on sweet.js' approach.
// See https://github.com/mozilla/sweet.js/wiki/design



class TokContext {
  constructor(token, isExpr, preserveSpace, override, generator) {
    this.token = token;
    this.isExpr = !!isExpr;
    this.preserveSpace = !!preserveSpace;
    this.override = override;
    this.generator = !!generator;
  }

}
var tokencontext_types = {
  b_stat: new TokContext("{", false),
  b_expr: new TokContext("{", true),
  b_tmpl: new TokContext("${", false),
  p_stat: new TokContext("(", false),
  p_expr: new TokContext("(", true),
  q_tmpl: new TokContext("`", true, true, function (p) {
    return p.tryReadTemplateToken();
  }),
  f_stat: new TokContext("function", false),
  f_expr: new TokContext("function", true),
  f_expr_gen: new TokContext("function", true, false, null, true),
  f_gen: new TokContext("function", false, false, null, true)
};
var tokencontext_pp = state_Parser.prototype;

tokencontext_pp.initialContext = function () {
  "use strict";

  return [tokencontext_types.b_stat];
};

tokencontext_pp.braceIsBlock = function (prevType) {
  "use strict";

  var parent = this.curContext();
  if (parent === tokencontext_types.f_expr || parent === tokencontext_types.f_stat) return true;
  if (prevType === tokentype_types.colon && (parent === tokencontext_types.b_stat || parent === tokencontext_types.b_expr)) return !parent.isExpr; // The check for `tt.name && exprAllowed` detects whether we are
  // after a `yield` or `of` construct. See the `updateContext` for
  // `tt.name`.

  if (prevType === tokentype_types._return || prevType === tokentype_types.name && this.exprAllowed) return lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
  if (prevType === tokentype_types._else || prevType === tokentype_types.semi || prevType === tokentype_types.eof || prevType === tokentype_types.parenR || prevType === tokentype_types.arrow) return true;
  if (prevType === tokentype_types.braceL) return parent === tokencontext_types.b_stat;
  if (prevType === tokentype_types._var || prevType === tokentype_types._const || prevType === tokentype_types.name) return false;
  return !this.exprAllowed;
};

tokencontext_pp.inGeneratorContext = function () {
  "use strict";

  for (var i = this.context.length - 1; i >= 1; i--) {
    var context = this.context[i];
    if (context.token === "function") return context.generator;
  }

  return false;
};

tokencontext_pp.updateContext = function (prevType) {
  "use strict";

  var update,
      type = this.type;
  if (type.keyword && prevType === tokentype_types.dot) this.exprAllowed = false;else if (update = type.updateContext) update.call(this, prevType);else this.exprAllowed = type.beforeExpr;
}; // Token-specific context update code


tokentype_types.parenR.updateContext = tokentype_types.braceR.updateContext = function () {
  "use strict";

  if (this.context.length === 1) {
    this.exprAllowed = true;
    return;
  }

  var out = this.context.pop();

  if (out === tokencontext_types.b_stat && this.curContext().token === "function") {
    out = this.context.pop();
  }

  this.exprAllowed = !out.isExpr;
};

tokentype_types.braceL.updateContext = function (prevType) {
  "use strict";

  this.context.push(this.braceIsBlock(prevType) ? tokencontext_types.b_stat : tokencontext_types.b_expr);
  this.exprAllowed = true;
};

tokentype_types.dollarBraceL.updateContext = function () {
  "use strict";

  this.context.push(tokencontext_types.b_tmpl);
  this.exprAllowed = true;
};

tokentype_types.parenL.updateContext = function (prevType) {
  "use strict";

  var statementParens = prevType === tokentype_types._if || prevType === tokentype_types._for || prevType === tokentype_types._with || prevType === tokentype_types._while;
  this.context.push(statementParens ? tokencontext_types.p_stat : tokencontext_types.p_expr);
  this.exprAllowed = true;
};

tokentype_types.incDec.updateContext = function () {// tokExprAllowed stays unchanged

  "use strict";
};

tokentype_types._function.updateContext = tokentype_types._class.updateContext = function (prevType) {
  "use strict";

  if (prevType.beforeExpr && prevType !== tokentype_types._else && !(prevType === tokentype_types.semi && this.curContext() !== tokencontext_types.p_stat) && !(prevType === tokentype_types._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) && !((prevType === tokentype_types.colon || prevType === tokentype_types.braceL) && this.curContext() === tokencontext_types.b_stat)) this.context.push(tokencontext_types.f_expr);else this.context.push(tokencontext_types.f_stat);
  this.exprAllowed = false;
};

tokentype_types.backQuote.updateContext = function () {
  "use strict";

  if (this.curContext() === tokencontext_types.q_tmpl) this.context.pop();else this.context.push(tokencontext_types.q_tmpl);
  this.exprAllowed = false;
};

tokentype_types.star.updateContext = function (prevType) {
  "use strict";

  if (prevType === tokentype_types._function) {
    var index = this.context.length - 1;
    if (this.context[index] === tokencontext_types.f_expr) this.context[index] = tokencontext_types.f_expr_gen;else this.context[index] = tokencontext_types.f_gen;
  }

  this.exprAllowed = true;
};

tokentype_types.name.updateContext = function (prevType) {
  "use strict";

  var allowed = false;

  if (this.options.ecmaVersion >= 6 && prevType !== tokentype_types.dot) {
    if (this.value === "of" && !this.exprAllowed || this.value === "yield" && this.inGeneratorContext()) allowed = true;
  }

  this.exprAllowed = allowed;
};
// CONCATENATED MODULE: ./src/vendor/acorn/acorn/src/regexp.js
class RegExpValidationState {
  reset() {}

} // eslint-disable-next-line import/prefer-default-export



// CONCATENATED MODULE: ./src/vendor/acorn/acorn/src/tokenize.js





 // Object type used to represent tokens. Note that normally, tokens
// simply exist as properties on the parser object. This is only
// used for the onToken callback and the external tokenizer.

class tokenize_Token {
  constructor(p) {
    this.type = p.type;
    this.value = p.value;
    this.start = p.start;
    this.end = p.end;
    if (p.options.locations) this.loc = new SourceLocation(p, p.startLoc, p.endLoc);
    if (p.options.ranges) this.range = [p.start, p.end];
  }

} // ## Tokenizer

var tokenize_pp = state_Parser.prototype; // Move to the next token

tokenize_pp.next = function (ignoreEscapeSequenceInKeyword) {
  "use strict";

  if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc) this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword);
  if (this.options.onToken) this.options.onToken(new tokenize_Token(this));
  this.lastTokEnd = this.end;
  this.lastTokStart = this.start;
  this.lastTokEndLoc = this.endLoc;
  this.lastTokStartLoc = this.startLoc;
  this.nextToken();
};

tokenize_pp.getToken = function () {
  "use strict";

  this.next();
  return new tokenize_Token(this);
}; // If we're in an ES6 environment, make parsers iterable


if (typeof Symbol !== "undefined") tokenize_pp[Symbol.iterator] = function () {
  "use strict";

  var _this = this;

  return {
    next: function () {
      var token = _this.getToken();

      return {
        done: token.type === tokentype_types.eof,
        value: token
      };
    }
  };
}; // Toggle strict mode. Re-reads the next number or string to please
// pedantic tests (`"use strict"; 010;` should fail).

tokenize_pp.curContext = function () {
  "use strict";

  return this.context[this.context.length - 1];
}; // Read a single token, updating the parser object's token-related
// properties.


tokenize_pp.nextToken = function () {
  "use strict";

  var curContext = this.curContext();
  if (!curContext || !curContext.preserveSpace) this.skipSpace();
  this.start = this.pos;
  if (this.options.locations) this.startLoc = this.curPosition();
  if (this.pos >= this.input.length) return this.finishToken(tokentype_types.eof);
  if (curContext.override) return curContext.override(this);else this.readToken(this.fullCharCodeAtPos());
};

tokenize_pp.readToken = function (code) {
  "use strict";

  // Identifier or keyword. '\uXXXX' sequences are allowed in
  // identifiers, so '\' also dispatches to that.
  if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92
  /* '\' */
  ) return this.readWord();
  return this.getTokenFromCode(code);
};

tokenize_pp.fullCharCodeAtPos = function () {
  "use strict";

  var code = this.input.charCodeAt(this.pos);
  if (code <= 0xd7ff || code >= 0xdc00) return code;
  var next = this.input.charCodeAt(this.pos + 1);
  return next <= 0xdbff || next >= 0xe000 ? code : (code << 10) + next - 0x35fdc00;
};

tokenize_pp.skipBlockComment = function () {
  "use strict";

  var startLoc = this.options.onComment && this.curPosition();
  var start = this.pos,
      end = this.input.indexOf("*/", this.pos += 2);
  if (end === -1) this.raise(this.pos - 2, "Unterminated comment");
  this.pos = end + 2;

  if (this.options.locations) {
    lineBreakG.lastIndex = start;
    var match;

    while ((match = lineBreakG.exec(this.input)) && match.index < this.pos) {
      ++this.curLine;
      this.lineStart = match.index + match[0].length;
    }
  }

  if (this.options.onComment) this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos, startLoc, this.curPosition());
};

tokenize_pp.skipLineComment = function (startSkip) {
  "use strict";

  var start = this.pos;
  var startLoc = this.options.onComment && this.curPosition();
  var ch = this.input.charCodeAt(this.pos += startSkip);

  while (this.pos < this.input.length && !isNewLine(ch)) {
    ch = this.input.charCodeAt(++this.pos);
  }

  if (this.options.onComment) this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos, startLoc, this.curPosition());
}; // Called at the start of the parse and after every token. Skips
// whitespace and comments, and.


tokenize_pp.skipSpace = function () {
  "use strict";

  loop: while (this.pos < this.input.length) {
    var ch = this.input.charCodeAt(this.pos);

    switch (ch) {
      case 32:
      case 160:
        // ' '
        ++this.pos;
        break;

      case 13:
        if (this.input.charCodeAt(this.pos + 1) === 10) {
          ++this.pos;
        }

      case 10:
      case 8232:
      case 8233:
        ++this.pos;

        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }

        break;

      case 47:
        // '/'
        switch (this.input.charCodeAt(this.pos + 1)) {
          case 42:
            // '*'
            this.skipBlockComment();
            break;

          case 47:
            this.skipLineComment(2);
            break;

          default:
            break loop;
        }

        break;

      default:
        if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
          ++this.pos;
        } else {
          break loop;
        }

    }
  }
}; // Called at the end of every token. Sets `end`, `val`, and
// maintains `context` and `exprAllowed`, and skips the space after
// the token, so that the next one's `start` will point at the
// right position.


tokenize_pp.finishToken = function (type, val) {
  "use strict";

  this.end = this.pos;
  if (this.options.locations) this.endLoc = this.curPosition();
  var prevType = this.type;
  this.type = type;
  this.value = val;
  this.updateContext(prevType);
}; // ### Token reading
// This is the function that is called to fetch the next token. It
// is somewhat obscure, because it works in character codes rather
// than characters, and because operator parsing has been inlined
// into it.
//
// All in the name of speed.
//


tokenize_pp.readToken_dot = function () {
  "use strict";

  var next = this.input.charCodeAt(this.pos + 1);
  if (next >= 48 && next <= 57) return this.readNumber(true);
  var next2 = this.input.charCodeAt(this.pos + 2);

  if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) {
    // 46 = dot '.'
    this.pos += 3;
    return this.finishToken(tokentype_types.ellipsis);
  } else {
    ++this.pos;
    return this.finishToken(tokentype_types.dot);
  }
};

tokenize_pp.readToken_slash = function () {
  "use strict";

  // '/'
  var next = this.input.charCodeAt(this.pos + 1);

  if (this.exprAllowed) {
    ++this.pos;
    return this.readRegexp();
  }

  if (next === 61) return this.finishOp(tokentype_types.assign, 2);
  return this.finishOp(tokentype_types.slash, 1);
};

tokenize_pp.readToken_mult_modulo_exp = function (code) {
  "use strict";

  // '%*'
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  var tokentype = code === 42 ? tokentype_types.star : tokentype_types.modulo; // exponentiation operator ** and **=

  if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
    ++size;
    tokentype = tokentype_types.starstar;
    next = this.input.charCodeAt(this.pos + 2);
  }

  if (next === 61) return this.finishOp(tokentype_types.assign, size + 1);
  return this.finishOp(tokentype, size);
};

tokenize_pp.readToken_pipe_amp = function (code) {
  "use strict";

  // '|&'
  var next = this.input.charCodeAt(this.pos + 1);

  if (next === code) {
    if (this.options.ecmaVersion >= 12) {
      var next2 = this.input.charCodeAt(this.pos + 2);
      if (next2 === 61) return this.finishOp(tokentype_types.assign, 3);
    }

    return this.finishOp(code === 124 ? tokentype_types.logicalOR : tokentype_types.logicalAND, 2);
  }

  if (next === 61) return this.finishOp(tokentype_types.assign, 2);
  return this.finishOp(code === 124 ? tokentype_types.bitwiseOR : tokentype_types.bitwiseAND, 1);
};

tokenize_pp.readToken_caret = function () {
  "use strict";

  // '^'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) return this.finishOp(tokentype_types.assign, 2);
  return this.finishOp(tokentype_types.bitwiseXOR, 1);
};

tokenize_pp.readToken_plus_min = function (code) {
  "use strict";

  // '+-'
  var next = this.input.charCodeAt(this.pos + 1);

  if (next === code) {
    if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 && (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
      // A `-->` line comment
      this.skipLineComment(3);
      this.skipSpace();
      return this.nextToken();
    }

    return this.finishOp(tokentype_types.incDec, 2);
  }

  if (next === 61) return this.finishOp(tokentype_types.assign, 2);
  return this.finishOp(tokentype_types.plusMin, 1);
};

tokenize_pp.readToken_lt_gt = function (code) {
  "use strict";

  // '<>'
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;

  if (next === code) {
    size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
    if (this.input.charCodeAt(this.pos + size) === 61) return this.finishOp(tokentype_types.assign, size + 1);
    return this.finishOp(tokentype_types.bitShift, size);
  }

  if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 && this.input.charCodeAt(this.pos + 3) === 45) {
    // `<!--`, an XML-style comment that should be interpreted as a line comment
    this.skipLineComment(4);
    this.skipSpace();
    return this.nextToken();
  }

  if (next === 61) size = 2;
  return this.finishOp(tokentype_types.relational, size);
};

tokenize_pp.readToken_eq_excl = function (code) {
  "use strict";

  // '=!'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) return this.finishOp(tokentype_types.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2);

  if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) {
    // '=>'
    this.pos += 2;
    return this.finishToken(tokentype_types.arrow);
  }

  return this.finishOp(code === 61 ? tokentype_types.eq : tokentype_types.prefix, 1);
};

tokenize_pp.readToken_question = function () {
  "use strict";

  // '?'
  var ecmaVersion = this.options.ecmaVersion;

  if (ecmaVersion >= 11) {
    var next = this.input.charCodeAt(this.pos + 1);

    if (next === 46) {
      var next2 = this.input.charCodeAt(this.pos + 2);
      if (next2 < 48 || next2 > 57) return this.finishOp(tokentype_types.questionDot, 2);
    }

    if (next === 63) {
      if (ecmaVersion >= 12) {
        var _next = this.input.charCodeAt(this.pos + 2);

        if (_next === 61) return this.finishOp(tokentype_types.assign, 3);
      }

      return this.finishOp(tokentype_types.coalesce, 2);
    }
  }

  return this.finishOp(tokentype_types.question, 1);
};

tokenize_pp.readToken_numberSign = function () {
  "use strict";

  // '#'
  var ecmaVersion = this.options.ecmaVersion;
  var code = 35; // '#'

  if (ecmaVersion >= 13) {
    ++this.pos;
    code = this.fullCharCodeAtPos();

    if (isIdentifierStart(code, true) || code === 92
    /* '\' */
    ) {
        return this.finishToken(tokentype_types.privateId, this.readWord1());
      }
  }

  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};

tokenize_pp.getTokenFromCode = function (code) {
  "use strict";

  switch (code) {
    // The interpretation of a dot depends on whether it is followed
    // by a digit or another two dots.
    case 46:
      // '.'
      return this.readToken_dot();
    // Punctuation tokens.

    case 40:
      ++this.pos;
      return this.finishToken(tokentype_types.parenL);

    case 41:
      ++this.pos;
      return this.finishToken(tokentype_types.parenR);

    case 59:
      ++this.pos;
      return this.finishToken(tokentype_types.semi);

    case 44:
      ++this.pos;
      return this.finishToken(tokentype_types.comma);

    case 91:
      ++this.pos;
      return this.finishToken(tokentype_types.bracketL);

    case 93:
      ++this.pos;
      return this.finishToken(tokentype_types.bracketR);

    case 123:
      ++this.pos;
      return this.finishToken(tokentype_types.braceL);

    case 125:
      ++this.pos;
      return this.finishToken(tokentype_types.braceR);

    case 58:
      ++this.pos;
      return this.finishToken(tokentype_types.colon);

    case 96:
      // '`'
      if (this.options.ecmaVersion < 6) break;
      ++this.pos;
      return this.finishToken(tokentype_types.backQuote);

    case 48:
      // '0'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 120 || next === 88) return this.readRadixNumber(16); // '0x', '0X' - hex number

      if (this.options.ecmaVersion >= 6) {
        if (next === 111 || next === 79) return this.readRadixNumber(8); // '0o', '0O' - octal number

        if (next === 98 || next === 66) return this.readRadixNumber(2); // '0b', '0B' - binary number
      }

    // Anything else beginning with a digit is an integer, octal
    // number, or float.

    case 49:
    case 50:
    case 51:
    case 52:
    case 53:
    case 54:
    case 55:
    case 56:
    case 57:
      // 1-9
      return this.readNumber(false);
    // Quotes produce strings.

    case 34:
    case 39:
      // '"', "'"
      return this.readString(code);
    // Operators are parsed inline in tiny state machines. '=' (61) is
    // often referred to. `finishOp` simply skips the amount of
    // characters it is given as second argument, and returns a token
    // of the type given by its first argument.

    case 47:
      // '/'
      return this.readToken_slash();

    case 37:
    case 42:
      // '%*'
      return this.readToken_mult_modulo_exp(code);

    case 124:
    case 38:
      // '|&'
      return this.readToken_pipe_amp(code);

    case 94:
      // '^'
      return this.readToken_caret();

    case 43:
    case 45:
      // '+-'
      return this.readToken_plus_min(code);

    case 60:
    case 62:
      // '<>'
      return this.readToken_lt_gt(code);

    case 61:
    case 33:
      // '=!'
      return this.readToken_eq_excl(code);

    case 63:
      // '?'
      return this.readToken_question();

    case 126:
      // '~'
      return this.finishOp(tokentype_types.prefix, 1);

    case 35:
      // '#'
      return this.readToken_numberSign();
  }

  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};

tokenize_pp.finishOp = function (type, size) {
  "use strict";

  var str = this.input.slice(this.pos, this.pos + size);
  this.pos += size;
  return this.finishToken(type, str);
};

tokenize_pp.readRegexp = function () {
  "use strict";

  var escaped,
      inClass,
      start = this.pos;

  for (;;) {
    if (this.pos >= this.input.length) this.raise(start, "Unterminated regular expression");
    var ch = this.input.charAt(this.pos);
    if (lineBreak.test(ch)) this.raise(start, "Unterminated regular expression");

    if (!escaped) {
      if (ch === "[") inClass = true;else if (ch === "]" && inClass) inClass = false;else if (ch === "/" && !inClass) break;
      escaped = ch === "\\";
    } else escaped = false;

    ++this.pos;
  }

  var pattern = this.input.slice(start, this.pos);
  ++this.pos;
  var flagsStart = this.pos;
  var flags = this.readWord1();
  if (this.containsEsc) this.unexpected(flagsStart); // Validate pattern

  var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
  state.reset(start, pattern, flags);
  this.validateRegExpFlags(state);
  this.validateRegExpPattern(state); // Create Literal#value property value.

  var value = null;

  try {
    value = new RegExp(pattern, flags);
  } catch (e) {// ESTree requires null if it failed to instantiate RegExp object.
    // https://github.com/estree/estree/blob/a27003adf4fd7bfad44de9cef372a2eacd527b1c/es5.md#regexpliteral
  }

  return this.finishToken(tokentype_types.regexp, {
    pattern,
    flags,
    value
  });
}; // Read an integer in the given radix. Return null if zero digits
// were read, the integer value otherwise. When `len` is given, this
// will return `null` unless the integer has exactly `len` digits.


tokenize_pp.readInt = function (radix, len, maybeLegacyOctalNumericLiteral) {
  "use strict";

  // `len` is used for character escape sequences. In that case, disallow separators.
  var allowSeparators = this.options.ecmaVersion >= 12 && len === undefined; // `maybeLegacyOctalNumericLiteral` is true if it doesn't have prefix (0x,0o,0b)
  // and isn't fraction part nor exponent part. In that case, if the first digit
  // is zero then disallow separators.

  var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;
  var start = this.pos,
      total = 0,
      lastCode = 0;

  for (var i = 0, e = len == null ? Infinity : len; i < e; ++i, ++this.pos) {
    var code = this.input.charCodeAt(this.pos),
        val = void 0;

    if (allowSeparators && code === 95) {
      if (isLegacyOctalNumericLiteral) this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals");
      if (lastCode === 95) this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore");
      if (i === 0) this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits");
      lastCode = code;
      continue;
    }

    if (code >= 97) val = code - 97 + 10; // a
    else if (code >= 65) val = code - 65 + 10; // A
      else if (code >= 48 && code <= 57) val = code - 48; // 0-9
        else val = Infinity;
    if (val >= radix) break;
    lastCode = code;
    total = total * radix + val;
  }

  if (allowSeparators && lastCode === 95) this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits");
  if (this.pos === start || len != null && this.pos - start !== len) return null;
  return total;
};

function stringToNumber(str, isLegacyOctalNumericLiteral) {
  "use strict";

  if (isLegacyOctalNumericLiteral) {
    return parseInt(str, 8);
  } // `parseFloat(value)` stops parsing at the first numeric separator then returns a wrong value.


  return parseFloat(str.replace(/_/g, ""));
}

function stringToBigInt(str) {
  "use strict";

  if (typeof BigInt !== "function") {
    return null;
  } // `BigInt(value)` throws syntax error if the string contains numeric separators.


  return BigInt(str.replace(/_/g, ""));
}

tokenize_pp.readRadixNumber = function (radix) {
  "use strict";

  var start = this.pos;
  this.pos += 2; // 0x

  var val = this.readInt(radix);
  if (val == null) this.raise(this.start + 2, "Expected number in radix " + radix);

  if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
    val = stringToBigInt(this.input.slice(start, this.pos));
    ++this.pos;
  } else if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number");

  return this.finishToken(tokentype_types.num, val);
}; // Read an integer, octal integer, or floating-point number.


tokenize_pp.readNumber = function (startsWithDot) {
  "use strict";

  var start = this.pos;
  if (!startsWithDot && this.readInt(10, undefined, true) === null) this.raise(start, "Invalid number");
  var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
  if (octal && this.strict) this.raise(start, "Invalid number");
  var next = this.input.charCodeAt(this.pos);

  if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
    var _val = stringToBigInt(this.input.slice(start, this.pos));

    ++this.pos;
    if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number");
    return this.finishToken(tokentype_types.num, _val);
  }

  if (octal && /[89]/.test(this.input.slice(start, this.pos))) octal = false;

  if (next === 46 && !octal) {
    // '.'
    ++this.pos;
    this.readInt(10);
    next = this.input.charCodeAt(this.pos);
  }

  if ((next === 69 || next === 101) && !octal) {
    // 'eE'
    next = this.input.charCodeAt(++this.pos);
    if (next === 43 || next === 45) ++this.pos; // '+-'

    if (this.readInt(10) === null) this.raise(start, "Invalid number");
  }

  if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number");
  var val = stringToNumber(this.input.slice(start, this.pos), octal);
  return this.finishToken(tokentype_types.num, val);
}; // Read a string value, interpreting backslash-escapes.


tokenize_pp.readCodePoint = function () {
  "use strict";

  var ch = this.input.charCodeAt(this.pos),
      code;

  if (ch === 123) {
    // '{'
    if (this.options.ecmaVersion < 6) this.unexpected();
    var codePos = ++this.pos;
    code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
    ++this.pos;
    if (code > 0x10FFFF) this.invalidStringToken(codePos, "Code point out of bounds");
  } else {
    code = this.readHexChar(4);
  }

  return code;
};

function codePointToString(code) {
  "use strict";

  // UTF-16 Decoding
  if (code <= 0xFFFF) return String.fromCharCode(code);
  code -= 0x10000;
  return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00);
}

tokenize_pp.readString = function (quote) {
  "use strict";

  var out = "",
      chunkStart = ++this.pos;

  for (;;) {
    if (this.pos >= this.input.length) this.raise(this.start, "Unterminated string constant");
    var ch = this.input.charCodeAt(this.pos);
    if (ch === quote) break;

    if (ch === 92) {
      // '\'
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar(false);
      chunkStart = this.pos;
    } else {
      if (isNewLine(ch, this.options.ecmaVersion >= 10)) this.raise(this.start, "Unterminated string constant");
      ++this.pos;
    }
  }

  out += this.input.slice(chunkStart, this.pos++);
  return this.finishToken(tokentype_types.string, out);
}; // Reads template string tokens.


var INVALID_TEMPLATE_ESCAPE_ERROR = {};

tokenize_pp.tryReadTemplateToken = function () {
  "use strict";

  this.inTemplateElement = true;

  try {
    this.readTmplToken();
  } catch (err) {
    if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
      this.readInvalidTemplateToken();
    } else {
      throw err;
    }
  }

  this.inTemplateElement = false;
};

tokenize_pp.invalidStringToken = function (position, message) {
  "use strict";

  if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
    throw INVALID_TEMPLATE_ESCAPE_ERROR;
  } else {
    this.raise(position, message);
  }
};

tokenize_pp.readTmplToken = function () {
  "use strict";

  var out = "",
      chunkStart = this.pos;

  for (;;) {
    if (this.pos >= this.input.length) this.raise(this.start, "Unterminated template");
    var ch = this.input.charCodeAt(this.pos);

    if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) {
      // '`', '${'
      if (this.pos === this.start && (this.type === tokentype_types.template || this.type === tokentype_types.invalidTemplate)) {
        if (ch === 36) {
          this.pos += 2;
          return this.finishToken(tokentype_types.dollarBraceL);
        } else {
          ++this.pos;
          return this.finishToken(tokentype_types.backQuote);
        }
      }

      out += this.input.slice(chunkStart, this.pos);
      return this.finishToken(tokentype_types.template, out);
    }

    if (ch === 92) {
      // '\'
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar(true);
      chunkStart = this.pos;
    } else if (isNewLine(ch)) {
      out += this.input.slice(chunkStart, this.pos);
      ++this.pos;

      switch (ch) {
        case 13:
          if (this.input.charCodeAt(this.pos) === 10) ++this.pos;

        case 10:
          out += "\n";
          break;

        default:
          out += String.fromCharCode(ch);
          break;
      }

      if (this.options.locations) {
        ++this.curLine;
        this.lineStart = this.pos;
      }

      chunkStart = this.pos;
    } else {
      ++this.pos;
    }
  }
}; // Reads a template token to search for the end, without validating any escape sequences


tokenize_pp.readInvalidTemplateToken = function () {
  "use strict";

  for (; this.pos < this.input.length; this.pos++) {
    switch (this.input[this.pos]) {
      case "\\":
        ++this.pos;
        break;

      case "$":
        if (this.input[this.pos + 1] !== "{") {
          break;
        }

      // falls through

      case "`":
        return this.finishToken(tokentype_types.invalidTemplate, this.input.slice(this.start, this.pos));
      // no default
    }
  }

  this.raise(this.start, "Unterminated template");
}; // Used to read escaped characters


tokenize_pp.readEscapedChar = function (inTemplate) {
  "use strict";

  var ch = this.input.charCodeAt(++this.pos);
  ++this.pos;

  switch (ch) {
    case 110:
      return "\n";
    // 'n' -> '\n'

    case 114:
      return "\r";
    // 'r' -> '\r'

    case 120:
      return String.fromCharCode(this.readHexChar(2));
    // 'x'

    case 117:
      return codePointToString(this.readCodePoint());
    // 'u'

    case 116:
      return "\t";
    // 't' -> '\t'

    case 98:
      return "\b";
    // 'b' -> '\b'

    case 118:
      return "\u000b";
    // 'v' -> '\u000b'

    case 102:
      return "\f";
    // 'f' -> '\f'

    case 13:
      if (this.input.charCodeAt(this.pos) === 10) ++this.pos;
    // '\r\n'

    case 10:
      // ' \n'
      if (this.options.locations) {
        this.lineStart = this.pos;
        ++this.curLine;
      }

      return "";

    case 56:
    case 57:
      if (this.strict) {
        this.invalidStringToken(this.pos - 1, "Invalid escape sequence");
      }

      if (inTemplate) {
        var codePos = this.pos - 1;
        this.invalidStringToken(codePos, "Invalid escape sequence in template string");
        return null;
      }

    default:
      if (ch >= 48 && ch <= 55) {
        var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
        var octal = parseInt(octalStr, 8);

        if (octal > 255) {
          octalStr = octalStr.slice(0, -1);
          octal = parseInt(octalStr, 8);
        }

        this.pos += octalStr.length - 1;
        ch = this.input.charCodeAt(this.pos);

        if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
          this.invalidStringToken(this.pos - 1 - octalStr.length, inTemplate ? "Octal literal in template string" : "Octal literal in strict mode");
        }

        return String.fromCharCode(octal);
      }

      if (isNewLine(ch)) {
        // Unicode new line characters after \ get removed from output in both
        // template literals and strings
        return "";
      }

      return String.fromCharCode(ch);
  }
}; // Used to read character escape sequences ('\x', '\u', '\U').


tokenize_pp.readHexChar = function (len) {
  "use strict";

  var codePos = this.pos;
  var n = this.readInt(16, len);
  if (n === null) this.invalidStringToken(codePos, "Bad character escape sequence");
  return n;
}; // Read an identifier, and return it as a string. Sets `this.containsEsc`
// to whether the word contained a '\u' escape.
//
// Incrementally adds only escaped chars, adding other chunks as-is
// as a micro-optimization.


tokenize_pp.readWord1 = function () {
  "use strict";

  this.containsEsc = false;
  var word = "",
      first = true,
      chunkStart = this.pos;
  var astral = this.options.ecmaVersion >= 6;

  while (this.pos < this.input.length) {
    var ch = this.fullCharCodeAtPos();

    if (isIdentifierChar(ch, astral)) {
      this.pos += ch <= 0xffff ? 1 : 2;
    } else if (ch === 92) {
      // "\"
      this.containsEsc = true;
      word += this.input.slice(chunkStart, this.pos);
      var escStart = this.pos;
      if (this.input.charCodeAt(++this.pos) !== 117) // "u"
        this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX");
      ++this.pos;
      var esc = this.readCodePoint();
      if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral)) this.invalidStringToken(escStart, "Invalid Unicode escape");
      word += codePointToString(esc);
      chunkStart = this.pos;
    } else {
      break;
    }

    first = false;
  }

  return word + this.input.slice(chunkStart, this.pos);
}; // Read an identifier or keyword token. Will check for reserved
// words when necessary.


tokenize_pp.readWord = function () {
  "use strict";

  var word = this.readWord1();
  var type = tokentype_types.name;

  if (this.keywords.test(word)) {
    type = keywords[word];
  }

  return this.finishToken(type, word);
};
// CONCATENATED MODULE: ./src/acorn.js














var literalRegExp = /^(?:'((?:\\.|[^'])*?)'|"((?:\\.|[^"])*?)"|;)/;

/* harmony default export */ var src_acorn = ({
  Parser: state_Parser,
  createWordsRegExp: wordsRegexp,
  getLineInfo: getLineInfo,
  isIdentifierChar: isIdentifierChar,
  isIdentifierStart: isIdentifierStart,
  lineBreakRegExp: lineBreak,
  literalRegExp,
  reservedWords: reservedWords,
  skipWhiteSpaceRegExp: skipWhiteSpace,
  tokTypes: tokentype_types
});
// CONCATENATED MODULE: ./src/util/wrap.js


function wrap_init() {
  "use strict";

  function wrap(func, wrapper) {
    return function (...args) {
      return Reflect.apply(wrapper, this, [func, args]);
    };
  }

  return wrap;
}

/* harmony default export */ var util_wrap = (src_shared.inited ? src_shared.module.utilWrap : src_shared.module.utilWrap = wrap_init());
// CONCATENATED MODULE: ./src/acorn/parser/big-int.js
// A loose implementation of BigInt syntax.
// https://github.com/tc39/proposal-bigint





function big_int_init() {
  "use strict";

  var LOWERCASE_N = char_code.LOWERCASE_N;
  var Plugin = {
    enable(parser) {
      parser.readNumber = util_wrap(parser.readNumber, readNumber);
      parser.readRadixNumber = util_wrap(parser.readRadixNumber, readRadixNumber);
      return parser;
    }

  };

  function readBigInt(parser, radix) {
    var pos = parser.pos;

    if (typeof radix === "number") {
      parser.pos += 2;
    } else {
      radix = 10;
    }

    if (parser.readInt(radix) !== null && parser.input.charCodeAt(parser.pos) === LOWERCASE_N) {
      ++parser.pos;
      return parser.finishToken(tokentype_types.num, null);
    }

    parser.pos = pos;
    return null;
  }

  function readNumber(func, args) {
    var startsWithDot = args[0];

    if (!startsWithDot) {
      var result = readBigInt(this);

      if (result !== null) {
        return result;
      }
    }

    return Reflect.apply(func, this, args);
  }

  function readRadixNumber(func, args) {
    var radix = args[0];
    var result = readBigInt(this, radix);
    return result === null ? Reflect.apply(func, this, args) : result;
  }

  return Plugin;
}

/* harmony default export */ var big_int = (src_shared.inited ? src_shared.module.acornParserBigInt : src_shared.module.acornParserBigInt = big_int_init());
// CONCATENATED MODULE: ./src/parse/branch.js



function branch_init() {
  "use strict";

  var flyweight;

  function branch(parser) {
    if (flyweight === void 0 || flyweight === parser) {
      flyweight = createFlyweight();
    }

    flyweight.awaitIdentPos = parser.awaitIdentPos;
    flyweight.awaitPos = parser.awaitPos;
    flyweight.containsEsc = parser.containsEsc;
    flyweight.curLine = parser.curLine;
    flyweight.end = parser.end;
    flyweight.exprAllowed = parser.exprAllowed;
    flyweight.inModule = parser.inModule;
    flyweight.input = parser.input;
    flyweight.inTemplateElement = parser.inTemplateElement;
    flyweight.lastTokEnd = parser.lastTokEnd;
    flyweight.lastTokStart = parser.lastTokStart;
    flyweight.lineStart = parser.lineStart;
    flyweight.pos = parser.pos;
    flyweight.potentialArrowAt = parser.potentialArrowAt;
    flyweight.sourceFile = parser.sourceFile;
    flyweight.start = parser.start;
    flyweight.strict = parser.strict;
    flyweight.type = parser.type;
    flyweight.value = parser.value;
    flyweight.yieldPos = parser.yieldPos;
    return flyweight;
  }

  function createFlyweight() {
    return src_parser.create("", {
      allowAwaitOutsideFunction: true,
      allowReturnOutsideFunction: true,
      ecmaVersion: 12
    });
  }

  return branch;
}

/* harmony default export */ var parse_branch = (src_shared.inited ? src_shared.module.parseBranch : src_shared.module.parseBranch = branch_init());
// CONCATENATED MODULE: ./src/acorn/parser/class-fields.js
// A loose implementation of class fields syntax.
// https://github.com/tc39/proposal-class-fields
// https://github.com/tc39/proposal-static-class-features






function class_fields_init() {
  "use strict";

  var NUMSIGN = char_code.NUMSIGN;
  var Plugin = {
    enable(parser) {
      parser.getTokenFromCode = util_wrap(parser.getTokenFromCode, getTokenFromCode);
      parser.parseClassElement = util_wrap(parser.parseClassElement, parseClassElement);
      return parser;
    }

  };

  function getTokenFromCode(func, args) {
    var code = args[0];

    if (code !== NUMSIGN) {
      return Reflect.apply(func, this, args);
    }

    ++this.pos;
    return this.finishToken(tokentype_types.name, this.readWord1());
  }

  function parseClassElement(func, args) {
    var type = this.type;

    if (type !== tokentype_types.bracketL && type !== tokentype_types.name) {
      return Reflect.apply(func, this, args);
    }

    var branched1 = parse_branch(this);
    var dummyNode = this.startNode();
    branched1.parsePropertyName(dummyNode);
    var branched1Type = branched1.type;

    if (branched1Type === tokentype_types.parenL) {
      return Reflect.apply(func, this, args);
    }

    if (branched1Type !== tokentype_types.braceR && branched1Type !== tokentype_types.eq && branched1Type !== tokentype_types.semi) {
      if (this.isContextual("async") || this.isContextual("get") || this.isContextual("set")) {
        return Reflect.apply(func, this, args);
      }

      if (this.isContextual("static")) {
        if (branched1Type !== tokentype_types.bracketL && branched1Type !== tokentype_types.name) {
          return Reflect.apply(func, this, args);
        }

        var branched2 = parse_branch(branched1);
        branched2.parsePropertyName(dummyNode);
        var branched2Type = branched2.type;

        if (branched2Type === tokentype_types.parenL) {
          return Reflect.apply(func, this, args);
        }

        if (branched2Type !== tokentype_types.braceR && branched2Type !== tokentype_types.eq && branched2Type !== tokentype_types.semi && (branched1.isContextual("async") || branched1.isContextual("get") || branched1.isContextual("set"))) {
          return Reflect.apply(func, this, args);
        }
      }
    }

    var node = this.startNode();
    node.static = branched1Type !== tokentype_types.braceR && branched1Type !== tokentype_types.eq && this.eatContextual("static");
    this.parsePropertyName(node);
    node.value = this.eat(tokentype_types.eq) ? this.parseExpression() : null;
    this.finishNode(node, "FieldDefinition");
    this.semicolon();
    return node;
  }

  return Plugin;
}

/* harmony default export */ var class_fields = (src_shared.inited ? src_shared.module.acornParserClassFields : src_shared.module.acornParserClassFields = class_fields_init());
// CONCATENATED MODULE: ./src/constant/message.js
// Error messages are based on V8.
// https://github.com/v8/v8/blob/master/src/message-template.h
var MESSAGE = {
  ILLEGAL_AWAIT_IN_NON_ASYNC_FUNCTION: "await is only valid in async function",
  ILLEGAL_HTML_COMMENT: "HTML comments are not allowed in modules",
  ILLEGAL_IMPORT_META_OUTSIDE_MODULE: "Cannot use 'import.meta' outside a module",
  ILLEGAL_NEW_TARGET: "new.target expression is not allowed here",
  ILLEGAL_RETURN_STATEMENT: "Illegal return statement",
  INVALID_ESCAPED_RESERVED_WORD: "Keyword must not contain escaped characters",
  INVALID_IMPORT_META_ASSIGNMENT: "'import.meta' is not a valid assignment target",
  INVALID_LEFT_HAND_SIDE_ASSIGNMENT: "Invalid left-hand side in assignment",
  INVALID_OR_UNEXPECTED_TOKEN: "Invalid or unexpected token",
  UNEXPECTED_EOS: "Unexpected end of input",
  UNEXPECTED_EVAL_OR_ARGUMENTS: "Unexpected eval or arguments in strict mode",
  UNEXPECTED_IDENTIFIER: "Unexpected identifier",
  UNEXPECTED_RESERVED_WORD: "Unexpected reserved word",
  UNEXPECTED_STRICT_MODE_RESERVED_WORD: "Unexpected strict mode reserved word",
  UNEXPECTED_STRING: "Unexpected string",
  UNEXPECTED_TOKEN: "Unexpected token",
  UNTERMINATED_ARGUMENTS_LIST: "missing ) after argument list",
  UNTERMINATED_TEMPLATE: "Unterminated template literal"
};
/* harmony default export */ var constant_message = (MESSAGE);
// CONCATENATED MODULE: ./src/parse/errors.js



function errors_init() {
  "use strict";

  function createClass(Super) {
    class AcornError extends Super {
      constructor(parser, pos, message) {
        super(message);

        var _getLineInfo = getLineInfo(parser.input, pos),
            column = _getLineInfo.column,
            line = _getLineInfo.line;

        this.column = column;
        this.inModule = parser.inModule;
        this.line = line;
      }

    }

    Reflect.defineProperty(AcornError, "name", {
      configurable: true,
      value: Super.name
    });
    return AcornError;
  }

  return {
    ReferenceError: createClass(ReferenceError),
    SyntaxError: createClass(SyntaxError)
  };
}

/* harmony default export */ var parse_errors = (src_shared.inited ? src_shared.module.parseErrors : src_shared.module.parseErrors = errors_init());
// CONCATENATED MODULE: ./src/acorn/parser/error-messages.js





function error_messages_init() {
  "use strict";

  var ILLEGAL_AWAIT_IN_NON_ASYNC_FUNCTION = constant_message.ILLEGAL_AWAIT_IN_NON_ASYNC_FUNCTION,
      ILLEGAL_HTML_COMMENT = constant_message.ILLEGAL_HTML_COMMENT,
      ILLEGAL_IMPORT_META_OUTSIDE_MODULE = constant_message.ILLEGAL_IMPORT_META_OUTSIDE_MODULE,
      ILLEGAL_NEW_TARGET = constant_message.ILLEGAL_NEW_TARGET,
      ILLEGAL_RETURN_STATEMENT = constant_message.ILLEGAL_RETURN_STATEMENT,
      INVALID_ESCAPED_RESERVED_WORD = constant_message.INVALID_ESCAPED_RESERVED_WORD,
      INVALID_OR_UNEXPECTED_TOKEN = constant_message.INVALID_OR_UNEXPECTED_TOKEN,
      UNEXPECTED_EOS = constant_message.UNEXPECTED_EOS,
      UNEXPECTED_EVAL_OR_ARGUMENTS = constant_message.UNEXPECTED_EVAL_OR_ARGUMENTS,
      UNEXPECTED_IDENTIFIER = constant_message.UNEXPECTED_IDENTIFIER,
      UNEXPECTED_RESERVED_WORD = constant_message.UNEXPECTED_RESERVED_WORD,
      UNEXPECTED_STRICT_MODE_RESERVED_WORD = constant_message.UNEXPECTED_STRICT_MODE_RESERVED_WORD,
      UNEXPECTED_STRING = constant_message.UNEXPECTED_STRING,
      UNEXPECTED_TOKEN = constant_message.UNEXPECTED_TOKEN,
      UNTERMINATED_ARGUMENTS_LIST = constant_message.UNTERMINATED_ARGUMENTS_LIST,
      UNTERMINATED_TEMPLATE = constant_message.UNTERMINATED_TEMPLATE;
  var ENGINE_DUPLICATE_EXPORT = "Duplicate export of '";
  var PARSER_DUPLICATE_EXPORT = "Duplicate export '";
  var PARSER_IMPORT_EXPORT_INVALID_LEVEL = "'import' and 'export' may only appear at the top level";
  var PARSER_IMPORT_EXPORT_OUTSIDE_MODULE = "'import' and 'export' may appear only with 'sourceType: module'";
  var PARSER_INVALID_ESCAPED_RESERVED_WORD = "Escape sequence in keyword ";
  var messageLookup = new Set([ILLEGAL_AWAIT_IN_NON_ASYNC_FUNCTION, ILLEGAL_HTML_COMMENT, ILLEGAL_IMPORT_META_OUTSIDE_MODULE, ILLEGAL_NEW_TARGET, ILLEGAL_RETURN_STATEMENT, INVALID_ESCAPED_RESERVED_WORD, INVALID_OR_UNEXPECTED_TOKEN, UNEXPECTED_EOS, UNEXPECTED_EVAL_OR_ARGUMENTS, UNEXPECTED_IDENTIFIER, UNEXPECTED_RESERVED_WORD, UNEXPECTED_STRICT_MODE_RESERVED_WORD, UNEXPECTED_STRING, UNEXPECTED_TOKEN, UNTERMINATED_ARGUMENTS_LIST, UNTERMINATED_TEMPLATE]);
  var replacementMap = new Map([["'return' outside of function", ILLEGAL_RETURN_STATEMENT], ["Binding arguments in strict mode", UNEXPECTED_EVAL_OR_ARGUMENTS], ["Binding await in strict mode", UNEXPECTED_RESERVED_WORD], ["Cannot use keyword 'await' outside an async function", ILLEGAL_AWAIT_IN_NON_ASYNC_FUNCTION], ["The keyword 'await' is reserved", UNEXPECTED_RESERVED_WORD], ["The keyword 'yield' is reserved", UNEXPECTED_STRICT_MODE_RESERVED_WORD], ["Unterminated string constant", INVALID_OR_UNEXPECTED_TOKEN], ["Unterminated template", UNTERMINATED_TEMPLATE], ["'new.target' can only be used in functions", ILLEGAL_NEW_TARGET]]);
  var Plugin = {
    enable(parser) {
      parser.parseExprList = parseExprList;
      parser.raise = raise;
      parser.raiseRecoverable = raise;
      parser.unexpected = unexpected;
      return parser;
    }

  };

  function parseExprList(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
    var elements = [];
    var first = true;

    while (!this.eat(close)) {
      if (!first) {
        if (allowEmpty || close !== tokentype_types.parenR) {
          this.expect(tokentype_types.comma);
        } else if (!this.eat(tokentype_types.comma)) {
          this.raise(this.start, UNTERMINATED_ARGUMENTS_LIST);
        }

        if (allowTrailingComma && this.afterTrailingComma(close)) {
          break;
        }
      } else {
        first = false;
      }

      var element = void 0;

      if (allowEmpty && this.type === tokentype_types.comma) {
        element = null;
      } else if (this.type === tokentype_types.ellipsis) {
        element = this.parseSpread(refDestructuringErrors);

        if (refDestructuringErrors && this.type === tokentype_types.comma && refDestructuringErrors.trailingComma === -1) {
          refDestructuringErrors.trailingComma = this.start;
        }
      } else {
        element = this.parseMaybeAssign(false, refDestructuringErrors);
      }

      elements.push(element);
    }

    return elements;
  }

  function raise(pos, message) {
    if (replacementMap.has(message)) {
      message = replacementMap.get(message);
    } else if (message === PARSER_IMPORT_EXPORT_INVALID_LEVEL || message === PARSER_IMPORT_EXPORT_OUTSIDE_MODULE) {
      message = UNEXPECTED_TOKEN + " " + this.type.label;
    } else if (message.startsWith(PARSER_DUPLICATE_EXPORT)) {
      message = message.replace(PARSER_DUPLICATE_EXPORT, ENGINE_DUPLICATE_EXPORT);
    } else if (message.startsWith(PARSER_INVALID_ESCAPED_RESERVED_WORD)) {
      message = INVALID_ESCAPED_RESERVED_WORD;
    } else if (!messageLookup.has(message) && !message.startsWith(UNEXPECTED_TOKEN)) {
      return;
    }

    throw new parse_errors.SyntaxError(this, pos, message);
  }

  function unexpected(pos) {
    if (pos === void 0) {
      pos = this.start;
    }

    var message = this.type === tokentype_types.eof ? UNEXPECTED_EOS : INVALID_OR_UNEXPECTED_TOKEN;
    this.raise(pos, message);
  }

  return Plugin;
}

/* harmony default export */ var error_messages = (src_shared.inited ? src_shared.module.acornParserErrorMessages : src_shared.module.acornParserErrorMessages = error_messages_init());
// CONCATENATED MODULE: ./src/parse/lookahead.js



function lookahead_init() {
  "use strict";

  function lookahead(parser) {
    var branched = parse_branch(parser);
    branched.next();
    return branched;
  }

  return lookahead;
}

/* harmony default export */ var parse_lookahead = (src_shared.inited ? src_shared.module.parseLookahead : src_shared.module.parseLookahead = lookahead_init());
// CONCATENATED MODULE: ./src/acorn/parser/first-await-outside-function.js





function first_await_outside_function_init() {
  "use strict";

  var Plugin = {
    enable(parser) {
      parser.firstAwaitOutsideFunction = null;
      parser.parseAwait = util_wrap(parser.parseAwait, parseAwait);
      parser.parseForStatement = util_wrap(parser.parseForStatement, parseForStatement);
      return parser;
    }

  };

  function parseAwait(func, args) {
    if (!this.inAsync && !this.inFunction && this.firstAwaitOutsideFunction === null) {
      this.firstAwaitOutsideFunction = getLineInfo(this.input, this.start);
    }

    return Reflect.apply(func, this, args);
  }

  function parseForStatement(func, args) {
    if (this.inAsync || this.inFunction || this.firstAwaitOutsideFunction !== null) {
      return Reflect.apply(func, this, args);
    }

    var node = args[0];

    var _lookahead = parse_lookahead(this),
        start = _lookahead.start;

    var result = Reflect.apply(func, this, args);

    if (node.await && this.firstAwaitOutsideFunction === null) {
      this.firstAwaitOutsideFunction = getLineInfo(this.input, start);
    }

    return result;
  }

  return Plugin;
}

/* harmony default export */ var first_await_outside_function = (src_shared.inited ? src_shared.module.acornParserFirstAwaitOutSideFunction : src_shared.module.acornParserFirstAwaitOutSideFunction = first_await_outside_function_init());
// CONCATENATED MODULE: ./src/acorn/parser/first-return-outside-function.js




function first_return_outside_function_init() {
  "use strict";

  var Plugin = {
    enable(parser) {
      parser.firstReturnOutsideFunction = null;
      parser.parseReturnStatement = util_wrap(parser.parseReturnStatement, parseReturnStatement);
      return parser;
    }

  };

  function parseReturnStatement(func, args) {
    if (!this.inFunction && this.firstReturnOutsideFunction === null) {
      this.firstReturnOutsideFunction = getLineInfo(this.input, this.start);
    }

    return Reflect.apply(func, this, args);
  }

  return Plugin;
}

/* harmony default export */ var first_return_outside_function = (src_shared.inited ? src_shared.module.acornParserFirstReturnOutSideFunction : src_shared.module.acornParserFirstReturnOutSideFunction = first_return_outside_function_init());
// CONCATENATED MODULE: ./src/acorn/parser/function-params-start.js



function function_params_start_init() {
  "use strict";

  var Plugin = {
    enable(parser) {
      parser.parseFunctionParams = util_wrap(parser.parseFunctionParams, parseFunctionParams);
      return parser;
    }

  };

  function parseFunctionParams(func, args) {
    var node = args[0];
    node.functionParamsStart = this.start;
    return Reflect.apply(func, this, args);
  }

  return Plugin;
}

/* harmony default export */ var function_params_start = (src_shared.inited ? src_shared.module.acornParserFunctionParamsStart : src_shared.module.acornParserFunctionParamsStart = function_params_start_init());
// CONCATENATED MODULE: ./src/acorn/parser/html-comment.js






function html_comment_init() {
  "use strict";

  var EXCLAMATION_MARK = char_code.EXCLAMATION_MARK,
      HYPHEN_MINUS = char_code.HYPHEN_MINUS,
      LEFT_ANGLE_BRACKET = char_code.LEFT_ANGLE_BRACKET,
      RIGHT_ANGLE_BRACKET = char_code.RIGHT_ANGLE_BRACKET;
  var ILLEGAL_HTML_COMMENT = constant_message.ILLEGAL_HTML_COMMENT;
  var lineBreakRegExp = src_acorn.lineBreakRegExp;
  var Plugin = {
    enable(parser) {
      parser.readToken_lt_gt = util_wrap(parser.readToken_lt_gt, readToken_lt_gt);
      parser.readToken_plus_min = util_wrap(parser.readToken_plus_min, readToken_plus_min);
      return parser;
    }

  };

  function readToken_lt_gt(func, args) {
    if (this.inModule) {
      var code = args[0];
      var input = this.input,
          pos = this.pos;
      var next = input.charCodeAt(pos + 1); // Detect opening HTML comment, i.e. `<!--`.

      if (code === LEFT_ANGLE_BRACKET && next === EXCLAMATION_MARK && input.charCodeAt(pos + 2) === HYPHEN_MINUS && input.charCodeAt(pos + 3) === HYPHEN_MINUS) {
        this.raise(pos, ILLEGAL_HTML_COMMENT);
      }
    }

    return Reflect.apply(func, this, args);
  }

  function readToken_plus_min(func, args) {
    if (this.inModule) {
      var code = args[0];
      var input = this.input,
          lastTokEnd = this.lastTokEnd,
          pos = this.pos;
      var next = input.charCodeAt(pos + 1); // Detect closing HTML comment, i.e. `-->`.

      if (next === code && next === HYPHEN_MINUS && input.charCodeAt(pos + 2) === RIGHT_ANGLE_BRACKET && (lastTokEnd === 0 || lineBreakRegExp.test(input.slice(lastTokEnd, pos)))) {
        this.raise(pos, ILLEGAL_HTML_COMMENT);
      }
    }

    return Reflect.apply(func, this, args);
  }

  return Plugin;
}

/* harmony default export */ var html_comment = (src_shared.inited ? src_shared.module.acornParserHTMLComment : src_shared.module.acornParserHTMLComment = html_comment_init());
// CONCATENATED MODULE: ./src/acorn/parser/import.js
// Parser support for dynamic import and import meta property syntax.
// https://github.com/tc39/proposal-dynamic-import
// https://github.com/tc39/proposal-import-meta
//
// Dynamic import syntax is based on acorn-dynamic-import.
// Copyright Jordan Gensler. Released under MIT license:
// https://github.com/kesne/acorn-dynamic-import
//
// Import meta property syntax is adapted from babel-parser.
// Copyright Sebastian McKenzie and other contributors. Released under MIT license:
// https://github.com/babel/babel/blob/master/packages/babel-parser/src/parser/expression.js







function import_init() {
  "use strict";

  var ILLEGAL_IMPORT_META_OUTSIDE_MODULE = constant_message.ILLEGAL_IMPORT_META_OUTSIDE_MODULE,
      INVALID_ESCAPED_RESERVED_WORD = constant_message.INVALID_ESCAPED_RESERVED_WORD,
      INVALID_IMPORT_META_ASSIGNMENT = constant_message.INVALID_IMPORT_META_ASSIGNMENT,
      INVALID_LEFT_HAND_SIDE_ASSIGNMENT = constant_message.INVALID_LEFT_HAND_SIDE_ASSIGNMENT,
      UNEXPECTED_IDENTIFIER = constant_message.UNEXPECTED_IDENTIFIER,
      UNEXPECTED_STRING = constant_message.UNEXPECTED_STRING,
      UNEXPECTED_TOKEN = constant_message.UNEXPECTED_TOKEN;
  var Plugin = {
    enable(parser) {
      // Allow `yield import()` to parse.
      tokentype_types._import.startsExpr = true;
      parser.checkLVal = util_wrap(parser.checkLVal, checkLVal);
      parser.parseExport = util_wrap(parser.parseExport, parseExport);
      parser.parseExprAtom = util_wrap(parser.parseExprAtom, parseExprAtom);
      parser.parseNew = util_wrap(parser.parseNew, parseNew);
      parser.parseStatement = util_wrap(parser.parseStatement, parseStatement);
      parser.parseSubscript = util_wrap(parser.parseSubscript, parseSubscript);
      return parser;
    }

  };

  function checkLVal(func, args) {
    var expr = args[0];
    var exprType = expr.type;
    var start = expr.start;

    if (exprType === "CallExpression" && expr.callee.type === "Import") {
      throw new parse_errors.SyntaxError(this, start, INVALID_LEFT_HAND_SIDE_ASSIGNMENT);
    }

    if (exprType === "MetaProperty" && expr.meta.name === "import" && expr.property.name === "meta") {
      throw new parse_errors.SyntaxError(this, start, INVALID_IMPORT_META_ASSIGNMENT);
    }

    return Reflect.apply(func, this, args);
  }

  function parseExport(func, args) {
    if (parse_lookahead(this).type !== tokentype_types.star) {
      return Reflect.apply(func, this, args);
    }

    var node = args[0],
        exported = args[1];
    this.next();
    var start = this.start,
        startLoc = this.startLoc;
    this.next();
    var finishType = "ExportAllDeclaration";

    if (this.eatContextual("as")) {
      var identifier = this.parseIdent(true);
      this.checkExport(exported, identifier.name, identifier.start);
      var specifier = this.startNodeAt(start, startLoc);
      finishType = "ExportNamedDeclaration";
      specifier.exported = identifier;
      node.declaration = null;
      node.specifiers = [this.finishNode(specifier, "ExportNamespaceSpecifier")];
    }

    this.expectContextual("from");

    if (this.type !== tokentype_types.string) {
      this.unexpected();
    }

    node.source = this.parseExprAtom();
    this.semicolon();
    return this.finishNode(node, finishType);
  }

  function parseExprAtom(func, args) {
    if (this.type === tokentype_types._import) {
      var _lookahead = parse_lookahead(this),
          _type = _lookahead.type;

      if (_type === tokentype_types.dot) {
        return parseImportMetaPropertyAtom(this);
      }

      if (_type === tokentype_types.parenL) {
        return parseImportCallAtom(this);
      }

      this.unexpected();
    }

    var node = Reflect.apply(func, this, args);
    var type = node.type;

    if (type === tokentype_types._false || type === tokentype_types._null || type === tokentype_types._true) {
      node.raw = "";
    }

    return node;
  }

  function parseNew(func, args) {
    var next = parse_lookahead(this);

    if (next.type === tokentype_types._import && parse_lookahead(next).type === tokentype_types.parenL) {
      this.unexpected();
    }

    return Reflect.apply(func, this, args);
  }

  function parseSubscript(func, args) {
    var base = args[0],
        startPos = args[1],
        startLoc = args[2];

    if (base.type === "Import" && this.type === tokentype_types.parenL) {
      var callExpr = this.startNodeAt(startPos, startLoc);
      this.expect(tokentype_types.parenL);
      callExpr.arguments = [this.parseMaybeAssign()];
      callExpr.callee = base;
      this.expect(tokentype_types.parenR);
      this.finishNode(callExpr, "CallExpression");
      args[0] = callExpr;
    }

    return Reflect.apply(func, this, args);
  }

  function parseStatement(func, args) {
    var topLevel = args[1];

    if (this.type === tokentype_types._import) {
      var _lookahead2 = parse_lookahead(this),
          start = _lookahead2.start,
          type = _lookahead2.type;

      if (type === tokentype_types.dot || type === tokentype_types.parenL) {
        var node = this.startNode();
        var expr = this.parseMaybeAssign();
        return this.parseExpressionStatement(node, expr);
      }

      if (!this.inModule || !topLevel && !this.options.allowImportExportEverywhere) {
        var message;

        if (type === tokentype_types.name) {
          message = UNEXPECTED_IDENTIFIER;
        } else if (type === tokentype_types.string) {
          message = UNEXPECTED_STRING;
        } else {
          message = UNEXPECTED_TOKEN + " " + type.label;
        }

        this.raise(start, message);
      }
    }

    return Reflect.apply(func, this, args);
  }

  function parseImportCallAtom(parser) {
    var node = parser.startNode();
    parser.expect(tokentype_types._import);
    return parser.finishNode(node, "Import");
  }

  function parseImportMetaPropertyAtom(parser) {
    var node = parser.startNode();
    var meta = parser.parseIdent(true);
    node.meta = meta;
    parser.expect(tokentype_types.dot);
    var containsEsc = parser.containsEsc;
    var property = parser.parseIdent(true);
    node.property = property;

    if (property.name !== "meta") {
      parser.raise(property.start, UNEXPECTED_IDENTIFIER);
    } else if (containsEsc) {
      parser.raise(property.start, INVALID_ESCAPED_RESERVED_WORD);
    } else if (!parser.inModule) {
      parser.raise(meta.start, ILLEGAL_IMPORT_META_OUTSIDE_MODULE);
    }

    return parser.finishNode(node, "MetaProperty");
  }

  return Plugin;
}

/* harmony default export */ var parser_import = (src_shared.inited ? src_shared.module.acornParserImport : src_shared.module.acornParserImport = import_init());
// CONCATENATED MODULE: ./src/acorn/parser/numeric-separator.js
// A loose implementation of numeric separator syntax.
// https://github.com/tc39/proposal-numeric-separator



function numeric_separator_init() {
  "use strict";

  var DIGIT_0 = char_code.DIGIT_0,
      DIGIT_9 = char_code.DIGIT_9,
      LOWERCASE_A = char_code.LOWERCASE_A,
      UNDERSCORE = char_code.UNDERSCORE,
      UPPERCASE_A = char_code.UPPERCASE_A;
  var Plugin = {
    enable(parser) {
      parser.readInt = readInt;
      return parser;
    }

  };

  function readInt(radix, length) {
    var start = this.pos;
    var hasLength = typeof length === "number";
    var end = hasLength ? length : Infinity;
    var i = -1;
    var total = 0;

    while (++i < end) {
      var code = this.input.charCodeAt(this.pos);

      if (code === UNDERSCORE) {
        ++this.pos;
        continue;
      }

      var value = Infinity;

      if (code >= LOWERCASE_A) {
        value = code - LOWERCASE_A + 10;
      } else if (code >= UPPERCASE_A) {
        value = code - UPPERCASE_A + 10;
      } else if (code >= DIGIT_0 && code <= DIGIT_9) {
        value = code - DIGIT_0;
      }

      if (value >= radix) {
        break;
      }

      ++this.pos;
      total = total * radix + value;
    }

    var pos = this.pos;

    if (pos === start || hasLength && pos - start !== length) {
      return null;
    }

    return total;
  }

  return Plugin;
}

/* harmony default export */ var numeric_separator = (src_shared.inited ? src_shared.module.acornParserNumericSeparator : src_shared.module.acornParserNumericSeparator = numeric_separator_init());
// CONCATENATED MODULE: ./src/acorn/parser/raw.js



function raw_init() {
  "use strict";

  var Plugin = {
    enable(parser) {
      parser.parseLiteral = parseLiteral;
      parser.parseTemplateElement = parseTemplateElement;
      return parser;
    }

  };

  function parseLiteral(value) {
    var node = this.startNode();
    node.raw = "";
    node.value = value;
    this.next();
    return this.finishNode(node, "Literal");
  }

  function parseTemplateElement() {
    var node = this.startNode();
    node.value = {
      cooked: "",
      raw: ""
    };
    this.next();
    node.tail = this.type === tokentype_types.backQuote;
    return this.finishNode(node, "TemplateElement");
  }

  return Plugin;
}

/* harmony default export */ var raw = (src_shared.inited ? src_shared.module.acornParserLiteral : src_shared.module.acornParserLiteral = raw_init());
// CONCATENATED MODULE: ./src/util/always-false.js


function always_false_init() {
  "use strict";

  function alwaysFalse() {
    return false;
  }

  return alwaysFalse;
}

/* harmony default export */ var always_false = (src_shared.inited ? src_shared.module.utilAlwaysFalse : src_shared.module.utilAlwaysFalse = always_false_init());
// CONCATENATED MODULE: ./src/acorn/parser/tolerance.js





function tolerance_init() {
  "use strict";

  var scopes = new Map();
  var Plugin = {
    enable(parser) {
      parser.isDirectiveCandidate = always_false;
      parser.strictDirective = always_false;
      parser.isSimpleParamList = always_true;
      parser.adaptDirectivePrologue = noop;
      parser.checkLocalExport = noop;
      parser.checkParams = noop;
      parser.checkPatternErrors = noop;
      parser.checkPatternExport = noop;
      parser.checkPropClash = noop;
      parser.checkVariableExport = noop;
      parser.checkYieldAwaitInDefaultParams = noop;
      parser.declareName = noop;
      parser.invalidStringToken = noop;
      parser.validateRegExpFlags = noop;
      parser.validateRegExpPattern = noop;
      parser.checkExpressionErrors = checkExpressionErrors;
      parser.enterScope = enterScope;
      return parser;
    }

  };

  function checkExpressionErrors(refDestructuringErrors) {
    if (refDestructuringErrors) {
      return refDestructuringErrors.shorthandAssign !== -1;
    }

    return false;
  }

  function enterScope(flags) {
    this.scopeStack.push(getScope(flags));
  }

  function getScope(flags) {
    var scope = scopes.get(flags);

    if (scope === void 0) {
      scope = {
        flags,
        functions: [],
        lexical: [],
        var: []
      };
      scopes.set(flags, scope);
    }

    return scope;
  }

  return Plugin;
}

/* harmony default export */ var tolerance = (src_shared.inited ? src_shared.module.acornParserTolerance : src_shared.module.acornParserTolerance = tolerance_init());
// CONCATENATED MODULE: ./src/parse/get-identifiers-from-pattern.js


function get_identifiers_from_pattern_init() {
  "use strict";

  function getIdentifiersFromPattern(pattern) {
    var identifiers = [];
    var queue = [pattern];
    var i = -1;

    while (++i < queue.length) {
      var _pattern = queue[i];

      if (_pattern === null) {
        // The ArrayPattern `.elements` array can contain `null` to indicate
        // that the position is a hole.
        continue;
      } // Cases are ordered from most to least likely to encounter.


      switch (_pattern.type) {
        case "Identifier":
          identifiers.push(_pattern);
          break;

        case "Property":
        case "ObjectProperty":
          queue.push(_pattern.value);
          break;

        case "AssignmentPattern":
          queue.push(_pattern.left);
          break;

        case "ObjectPattern":
          queue.push(..._pattern.properties);
          break;

        case "ArrayPattern":
          queue.push(..._pattern.elements);
          break;

        case "RestElement":
          queue.push(_pattern.argument);
          break;
      }
    }

    return identifiers;
  }

  return getIdentifiersFromPattern;
}

/* harmony default export */ var get_identifiers_from_pattern = (src_shared.inited ? src_shared.module.parseGetIdentifiersFromPattern : src_shared.module.parseGetIdentifiersFromPattern = get_identifiers_from_pattern_init());
// CONCATENATED MODULE: ./src/acorn/parser/top-level.js





function top_level_init() {
  "use strict";

  var Plugin = {
    enable(parser) {
      parser.parseTopLevel = parseTopLevel;
      return parser;
    }

  };

  function parseTopLevel(node) {
    if (!Array.isArray(node.body)) {
      node.body = [];
    }

    var body = node.body;
    var exported = {};
    var funcs = new Set();
    var topIdentifiers = new Set();
    var importedBindings = new Set();
    var inModule = this.inModule;
    var top = {
      firstAwaitOutsideFunction: null,
      firstReturnOutsideFunction: null,
      identifiers: topIdentifiers,
      importedBindings,
      insertIndex: node.start,
      insertPrefix: ""
    };
    var inited = false;

    while (this.type !== tokentype_types.eof) {
      var stmt = this.parseStatement(null, true, exported);
      var expression = stmt.expression;
      var type = stmt.type;

      if (!inited) {
        // Avoid hoisting above string literal expression statements such as
        // "use strict", which may depend on occurring at the beginning of
        // their enclosing scopes.
        if (type === "ExpressionStatement" && expression.type === "Literal" && typeof expression.value === "string") {
          top.insertIndex = stmt.end;
          top.insertPrefix = ";";
        } else {
          inited = true;
        }
      }

      var object = stmt;

      if (type === "ExportDefaultDeclaration" || type === "ExportNamedDeclaration") {
        object = stmt.declaration;

        if (object !== null) {
          type = object.type;
        }
      }

      if (type === "VariableDeclaration") {
        for (var _i = 0, _object$declarations = object.declarations, _length = _object$declarations == null ? 0 : _object$declarations.length; _i < _length; _i++) {
          var declaration = _object$declarations[_i];
          var ids = get_identifiers_from_pattern(declaration.id);

          for (var _i2 = 0, _length2 = ids == null ? 0 : ids.length; _i2 < _length2; _i2++) {
            var id = ids[_i2];
            var name = id.name;

            if (inModule && funcs.has(name)) {
              raiseRedeclaration(this, id.start, name);
            }

            topIdentifiers.add(name);
          }
        }
      } else if (type === "ClassDeclaration") {
        var _object = object,
            _id = _object.id;

        if (_id !== null) {
          topIdentifiers.add(_id.name);
        }
      } else if (type === "FunctionDeclaration") {
        var _object2 = object,
            _id2 = _object2.id;

        if (_id2 !== null) {
          var _name = _id2.name;

          if (inModule && topIdentifiers.has(_name)) {
            raiseRedeclaration(this, _id2.start, _name);
          }

          funcs.add(_name);
          topIdentifiers.add(_name);
        }
      } else if (type === "ImportDeclaration") {
        for (var _i3 = 0, _object$specifiers = object.specifiers, _length3 = _object$specifiers == null ? 0 : _object$specifiers.length; _i3 < _length3; _i3++) {
          var local = _object$specifiers[_i3].local;
          var _name2 = local.name;

          if (importedBindings.has(_name2)) {
            raiseRedeclaration(this, local.start, _name2);
          }

          importedBindings.add(_name2);
          topIdentifiers.add(_name2);
        }
      }

      body.push(stmt);
    }

    this.next();
    top.firstAwaitOutsideFunction = this.firstAwaitOutsideFunction;
    top.firstReturnOutsideFunction = this.firstReturnOutsideFunction;
    node.top = top;
    return this.finishNode(node, "Program");
  }

  function raiseRedeclaration(parser, pos, name) {
    throw new parse_errors.SyntaxError(parser, pos, "Identifier '" + name + "' has already been declared");
  }

  return Plugin;
}

/* harmony default export */ var top_level = (src_shared.inited ? src_shared.module.acornParserTopLevel : src_shared.module.acornParserTopLevel = top_level_init());
// CONCATENATED MODULE: ./src/util/defaults.js



function defaults_init() {
  "use strict";

  function defaults(object) {
    var length = arguments.length;
    var i = 0;

    while (++i < length) {
      var source = arguments[i];

      for (var name in source) {
        if (has(source, name) && (object[name] === void 0 || !has(object, name))) {
          object[name] = source[name];
        }
      }
    }

    return object;
  }

  return defaults;
}

/* harmony default export */ var util_defaults = (src_shared.inited ? src_shared.module.utilDefaults : src_shared.module.utilDefaults = defaults_init());
// CONCATENATED MODULE: ./src/parser.js

















function parser_init() {
  "use strict";

  var SOURCE_TYPE_MODULE = compiler.SOURCE_TYPE_MODULE,
      SOURCE_TYPE_SCRIPT = compiler.SOURCE_TYPE_SCRIPT;
  var reservedWordsRegExp = wordsRegexp(reservedWords[6]);
  var defaultOptions = {
    allowAwaitOutsideFunction: true,
    allowReturnOutsideFunction: false,
    ecmaVersion: 12,
    sourceType: "module",
    strict: void 0
  };
  var sourceTypeMap = new Map([[SOURCE_TYPE_MODULE, "module"], [SOURCE_TYPE_SCRIPT, "script"]]);
  var Parser = {
    create,
    createOptions,
    defaultOptions,

    parse(code, options) {
      var parser = Parser.create(code, options);
      var result = parser.parse();
      result.inModule = parser.inModule;
      result.strict = parser.strict;
      return result;
    }

  };

  function create(code, options) {
    options = Parser.createOptions(options);
    var _options = options,
        strict = _options.strict;
    var parser = new state_Parser(options, code);
    big_int.enable(parser);
    class_fields.enable(parser);
    error_messages.enable(parser);
    first_await_outside_function.enable(parser);
    first_return_outside_function.enable(parser);
    function_params_start.enable(parser);
    html_comment.enable(parser);
    parser_import.enable(parser);
    numeric_separator.enable(parser);
    raw.enable(parser);
    tolerance.enable(parser);
    top_level.enable(parser);

    if (strict !== void 0) {
      parser.strict = !!strict;

      if (!parser.strict) {
        parser.reservedWords = reservedWordsRegExp;
      }
    }

    return parser;
  }

  function createOptions(value) {
    var options = util_defaults({}, value, Parser.defaultOptions);
    var sourceType = options.sourceType;
    var resolvedType = sourceTypeMap.get(sourceType);

    if (resolvedType !== void 0) {
      sourceType = resolvedType;
    }

    options.sourceType = sourceType;
    return options;
  }

  return Parser;
}

/* harmony default export */ var src_parser = (src_shared.inited ? src_shared.module.Parser : src_shared.module.Parser = parser_init());
// CONCATENATED MODULE: ./src/util/ascending-comparator.js


function ascending_comparator_init() {
  "use strict";

  function ascendingComparator(value, otherValue) {
    if (value > otherValue) {
      return 1;
    }

    if (value < otherValue) {
      return -1;
    }

    return 0;
  }

  return ascendingComparator;
}

/* harmony default export */ var ascending_comparator = (src_shared.inited ? src_shared.module.utilAscendingComparator : src_shared.module.utilAscendingComparator = ascending_comparator_init());
// CONCATENATED MODULE: ./src/visitor.js
// Based on `PathVisitor()` of ast-types.
// Copyright Ben Newman. Released under MIT license:
// https://github.com/benjamn/ast-types





function visitor_init() {
  "use strict";

  var childNamesMap = new Map();
  var visitLookup = new Set([// ConditionalExpression
  "alternate", // ReturnStatement
  "argument", // CallExpression
  "arguments", // TryStatement
  "block", // BlockStatement, FunctionDeclaration, FunctionExpression
  "body", // CallExpression
  "callee", // SwitchStatement
  "cases", // ConditionalExpression, SwitchCase
  "consequent", // ExportDefaultDeclaration, ExportNamedDeclaration
  "declaration", // VariableDeclaration
  "declarations", // SwitchStatement
  "discriminant", // ArrayPattern
  "elements", // ExpressionStatement
  "expression", // SequenceExpression, TemplateLiteral
  "expressions", // TryStatement
  "finalizer", // TryStatement
  "handler", // ForStatement, VariableDeclarator
  "init", // Property
  "key", // AssignmentExpression, AssignmentPattern
  "left", // MemberExpression
  "object", // ObjectPattern
  "properties", // AssignmentExpression, AssignmentPattern
  "right", // ClassDeclaration
  "superClass", // ForStatement, IfStatement, SwitchCase, WhileStatement
  "test", // ForStatement
  "update", // Property
  "value"]);

  class Visitor {
    visit(rootPath, options) {
      this.reset(options);
      var possibleIndexes = this.possibleIndexes;

      if (!Array.isArray(possibleIndexes) || possibleIndexes.length === 0) {
        return;
      }

      this.possibleEnd = possibleIndexes.length;
      this.possibleStart = 0;
      this.visitWithoutReset(rootPath);
    }

    visitWithoutReset(path) {
      var value = path.getValue();

      if (!is_object(value)) {
        return;
      }

      if (Array.isArray(value)) {
        path.each(this, "visitWithoutReset");
        return;
      }

      var methodName = "visit" + value.type;

      if (typeof this[methodName] === "function") {
        // The method must call `this.visitChildren(path)` to continue traversing.
        this[methodName](path);
      } else {
        this.visitChildren(path);
      }
    }

    visitChildren(path) {
      var node = path.getValue();
      var end = node.end,
          start = node.start;
      var possibleIndexes = this.possibleIndexes;
      var oldLeft = this.possibleStart;
      var oldRight = this.possibleEnd;
      var left = oldLeft;
      var right = oldRight;

      if (typeof start === "number" && typeof end === "number") {
        // Find first index not less than `node.start`.
        while (left < right && possibleIndexes[left] < start) {
          left += 1;
        } // Find first index not greater than `node.end`.


        while (left < right && possibleIndexes[right - 1] > end) {
          right -= 1;
        }
      }

      if (left < right) {
        this.possibleStart = left;
        this.possibleEnd = right;
        var names = getChildNames(node);

        for (var _i = 0, _length = names == null ? 0 : names.length; _i < _length; _i++) {
          var name = names[_i];
          path.call(this, "visitWithoutReset", name);
        }

        this.possibleStart = oldLeft;
        this.possibleEnd = oldRight;
      }
    }

  }

  function getChildNames(value) {
    var childNames = childNamesMap.get(value);

    if (childNames !== void 0) {
      return childNames;
    }

    childNames = [];
    var names = util_keys(value);
    var noComputed = value.type !== "Property" || !value.computed;

    for (var _i2 = 0, _length2 = names == null ? 0 : names.length; _i2 < _length2; _i2++) {
      var name = names[_i2];

      if (noComputed && name === "key") {
        continue;
      }

      if (visitLookup.has(name) && is_object(value[name])) {
        childNames.push(name);
      }
    }

    childNamesMap.set(value, childNames);
    return childNames;
  }

  set_prototype_of(Visitor.prototype, null);
  return Visitor;
}

/* harmony default export */ var src_visitor = (src_shared.inited ? src_shared.module.Visitor : src_shared.module.Visitor = visitor_init());
// CONCATENATED MODULE: ./src/parse/get-names-from-pattern.js



function get_names_from_pattern_init() {
  "use strict";

  function getNamesFromPattern(pattern) {
    var identifiers = get_identifiers_from_pattern(pattern);
    var result = [];

    for (var _i = 0, _length = identifiers == null ? 0 : identifiers.length; _i < _length; _i++) {
      var name = identifiers[_i].name;
      result.push(name);
    }

    return result;
  }

  return getNamesFromPattern;
}

/* harmony default export */ var get_names_from_pattern = (src_shared.inited ? src_shared.module.parseGetNamesFromPattern : src_shared.module.parseGetNamesFromPattern = get_names_from_pattern_init());
// CONCATENATED MODULE: ./src/parse/get-shadowed.js



function get_shadowed_init() {
  "use strict";

  function getShadowed(path, name, map) {
    var isArgs = name === "arguments";
    var result = null;
    path.getParentNode(function (parent) {
      var type = parent.type;

      if (type === "WithStatement") {
        var node = path.getValue();
        result = parent.object === node ? null : parent;
        return result !== null;
      }

      var cache = map.get(parent);

      if (cache === void 0) {
        cache = new Map();
        map.set(parent, cache);
      }

      var cached = cache.get(name);

      if (cached !== void 0) {
        result = cached;
        return result !== null;
      }

      var isFuncExpr = type === "FunctionExpression";
      var isNonArrowFunc = isFuncExpr || type === "FunctionDeclaration";

      if (isArgs && isNonArrowFunc) {
        result = parent;
        cache.set(name, result);
        return true;
      }

      if (type === "BlockStatement") {
        for (var _i = 0, _parent$body = parent.body, _length = _parent$body == null ? 0 : _parent$body.length; _i < _length; _i++) {
          var stmt = _parent$body[_i];

          if (stmt.type === "VariableDeclaration") {
            for (var _i2 = 0, _stmt$declarations = stmt.declarations, _length2 = _stmt$declarations == null ? 0 : _stmt$declarations.length; _i2 < _length2; _i2++) {
              var declaration = _stmt$declarations[_i2];
              var varNames = get_names_from_pattern(declaration.id);

              for (var _i3 = 0, _length3 = varNames == null ? 0 : varNames.length; _i3 < _length3; _i3++) {
                var varName = varNames[_i3];

                if (varName === name) {
                  result = declaration;
                  cache.set(name, result);
                  return true;
                }
              }
            }
          }
        }
      }

      if (type === "CatchClause") {
        var param = parent.param;

        if (param !== null && param.name === name) {
          result = param;
          cache.set(name, result);
          return true;
        }
      }

      if (isFuncExpr) {
        var id = parent.id; // Exported function declarations may not have an id.
        // For example, `export default function () {}`.

        if (id !== null && id.name === name) {
          result = parent;
          cache.set(name, result);
          return true;
        }
      }

      if (isNonArrowFunc || type === "ArrowFunctionExpression") {
        for (var _i4 = 0, _parent$params = parent.params, _length4 = _parent$params == null ? 0 : _parent$params.length; _i4 < _length4; _i4++) {
          var _param = _parent$params[_i4];

          var _getNamesFromPattern = get_names_from_pattern(_param),
              paramName = _getNamesFromPattern[0];

          if (paramName === name) {
            result = _param;
            cache.set(name, result);
            return true;
          }
        }
      }

      cache.set(name, null);
    });
    return result;
  }

  return getShadowed;
}

/* harmony default export */ var get_shadowed = (src_shared.inited ? src_shared.module.parseGetShadowed : src_shared.module.parseGetShadowed = get_shadowed_init());
// CONCATENATED MODULE: ./src/parse/is-shadowed.js



function is_shadowed_init() {
  "use strict";

  function isShadowed(path, name, map) {
    return get_shadowed(path, name, map) !== null;
  }

  return isShadowed;
}

/* harmony default export */ var is_shadowed = (src_shared.inited ? src_shared.module.parseIsShadowed : src_shared.module.parseIsShadowed = is_shadowed_init());
// CONCATENATED MODULE: ./src/parse/is-outside-function.js


function is_outside_function_init() {
  "use strict";

  function isOutsideFunction(path, name, map) {
    var result = false;
    path.getParentNode(function (parent) {
      var type = parent.type;
      var cache = map.get(parent);

      if (cache === void 0) {
        cache = new Map();
        map.set(parent, cache);
      }

      var cached = cache.get(name);

      if (cached !== void 0) {
        return result = cached;
      }

      if (type === "Program") {
        result = true;
        cache.set(name, result);
        return true;
      }

      cache.set(name, false);

      if (type === "ArrowFunctionExpression" || type === "FunctionDeclaration" || type === "FunctionExpression") {
        return true;
      }
    });
    return result;
  }

  return isOutsideFunction;
}

/* harmony default export */ var is_outside_function = (src_shared.inited ? src_shared.module.parseIsOutsideFunction : src_shared.module.parseIsOutsideFunction = is_outside_function_init());
// CONCATENATED MODULE: ./src/parse/pad.js



function pad_init() {
  "use strict";

  var CARRIAGE_RETURN = char_code.CARRIAGE_RETURN;

  function pad(code, newCode, oldStart, oldEnd) {
    var oldCode = code.slice(oldStart, oldEnd);
    var oldLines = oldCode.split("\n");
    var newLines = newCode.split("\n");
    var lastIndex = newLines.length - 1;
    var length = oldLines.length;
    var i = lastIndex - 1;

    while (++i < length) {
      var oldLine = oldLines[i];
      var lastCharCode = oldLine.charCodeAt(oldLine.length - 1);

      if (i > lastIndex) {
        newLines[i] = "";
      }

      if (lastCharCode === CARRIAGE_RETURN) {
        newLines[i] += "\r";
      }
    }

    return newLines.join("\n");
  }

  return pad;
}

/* harmony default export */ var parse_pad = (src_shared.inited ? src_shared.module.parsePad : src_shared.module.parsePad = pad_init());
// CONCATENATED MODULE: ./src/parse/overwrite.js



function overwrite_init() {
  "use strict";

  function overwrite(visitor, start, end, content) {
    var magicString = visitor.magicString;
    var padded = parse_pad(magicString.original, content, start, end);
    return magicString.overwrite(start, end, padded);
  }

  return overwrite;
}

/* harmony default export */ var parse_overwrite = (src_shared.inited ? src_shared.module.parseOverwrite : src_shared.module.parseOverwrite = overwrite_init());
// CONCATENATED MODULE: ./src/visitor/assignment.js







function assignment_init() {
  "use strict";

  var scopeMap = new Map();
  var shadowedMap = new Map();

  class AssignmentVisitor extends src_visitor {
    reset(options) {
      this.assignableBindings = null;
      this.importedBindings = null;
      this.magicString = null;
      this.possibleIndexes = null;
      this.runtimeName = null;
      this.transformImportBindingAssignments = false;
      this.transformInsideFunctions = false;
      this.transformOutsideFunctions = false;

      if (options !== void 0) {
        this.assignableBindings = options.assignableBindings;
        this.importedBindings = options.importedBindings;
        this.magicString = options.magicString;
        this.possibleIndexes = options.possibleIndexes;
        this.runtimeName = options.runtimeName;
        this.transformImportBindingAssignments = options.transformImportBindingAssignments;
        this.transformInsideFunctions = options.transformInsideFunctions;
        this.transformOutsideFunctions = options.transformOutsideFunctions;
      }
    }

    visitAssignmentExpression(path) {
      checkAndMaybeWrap(this, path, "left");
      path.call(this, "visitWithoutReset", "right");
    }

    visitUpdateExpression(path) {
      checkAndMaybeWrap(this, path, "argument");
    }

  }

  function checkAndMaybeWrap(visitor, path, childName) {
    var assignableBindings = visitor.assignableBindings,
        importedBindings = visitor.importedBindings,
        magicString = visitor.magicString,
        runtimeName = visitor.runtimeName;
    var node = path.getValue();
    var child = node[childName];
    var names = get_names_from_pattern(child);
    var end = node.end,
        start = node.start;

    if (visitor.transformImportBindingAssignments) {
      for (var _i = 0, _length = names == null ? 0 : names.length; _i < _length; _i++) {
        var name = names[_i];

        if (importedBindings.has(name) && !is_shadowed(path, name, shadowedMap)) {
          // Throw a type error for assignments to imported bindings.
          var original = magicString.original;
          var right = node.right;
          var code = runtimeName + ".b(" + JSON.stringify(original.slice(child.start, child.end)) + ',"' + node.operator + '"';

          if (right !== void 0) {
            code += "," + original.slice(right.start, right.end);
          }

          code += ")";
          parse_overwrite(visitor, start, end, code);
          break;
        }
      }
    }

    var transformInsideFunctions = visitor.transformInsideFunctions,
        transformOutsideFunctions = visitor.transformOutsideFunctions;

    if (transformInsideFunctions || transformOutsideFunctions) {
      var instrumentBoth = transformInsideFunctions && transformOutsideFunctions;

      for (var _i2 = 0, _length2 = names == null ? 0 : names.length; _i2 < _length2; _i2++) {
        var _name = names[_i2];

        if (assignableBindings.has(_name) && !is_shadowed(path, _name, shadowedMap)) {
          if (instrumentBoth || transformInsideFunctions && !is_outside_function(path, _name, scopeMap) || transformOutsideFunctions && is_outside_function(path, _name, scopeMap)) {
            // Wrap assignments to exported identifiers.
            magicString.prependLeft(start, runtimeName + ".u(").prependRight(end, ")");
            break;
          }
        }
      }
    }
  }

  return new AssignmentVisitor();
}

/* harmony default export */ var assignment = (src_shared.inited ? src_shared.module.visitorAssignment : src_shared.module.visitorAssignment = assignment_init());
// CONCATENATED MODULE: ./src/parse/is-binding-identifier.js


function is_binding_identifier_init() {
  "use strict";

  function isBindingIdentifier(node, parent) {
    if (node.type !== "Identifier") {
      return false;
    }

    if (parent === void 0) {
      return true;
    }

    var type = parent.type;

    if (type === "Property") {
      return parent.computed || parent.shorthand;
    }

    if ((type === "AssignmentExpression" || type === "AssignmentPattern") && parent.left === node || type === "UpdateExpression" && parent.argument === node || type === "BreakStatement" || type === "ContinueStatement" || type === "ImportDefaultSpecifier" || type === "ImportNamespaceSpecifier" || type === "ImportSpecifier" || type === "LabeledStatement") {
      return false;
    }

    return true;
  }

  return isBindingIdentifier;
}

/* harmony default export */ var is_binding_identifier = (src_shared.inited ? src_shared.module.parseIsBindingIdentifier : src_shared.module.parseIsBindingIdentifier = is_binding_identifier_init());
// CONCATENATED MODULE: ./src/visitor/eval.js







function eval_init() {
  "use strict";

  var TRANSFORMS_EVAL = compiler.TRANSFORMS_EVAL;
  var shadowedMap = new Map();

  class EvalVisitor extends src_visitor {
    reset(options) {
      this.magicString = null;
      this.possibleIndexes = null;
      this.runtimeName = null;
      this.strict = false;
      this.transforms = 0;
      this.transformUpdateBindings = false;

      if (options !== void 0) {
        this.magicString = options.magicString;
        this.possibleIndexes = options.possibleIndexes;
        this.runtimeName = options.runtimeName;
        this.strict = options.strict;
        this.transformUpdateBindings = options.transformUpdateBindings;
      }
    }

    visitCallExpression(path) {
      var node = path.getValue();
      var callee = node.callee;

      if (callee.name !== "eval") {
        this.visitChildren(path);
        return;
      }

      if (node.arguments.length === 0) {
        return;
      } // Support direct eval:
      // eval(code)


      this.transforms |= TRANSFORMS_EVAL;
      var end = node.end;
      var magicString = this.magicString,
          runtimeName = this.runtimeName;
      var code = this.strict ? runtimeName + ".c" : "(eval===" + runtimeName + ".v?" + runtimeName + ".c:" + runtimeName + ".k)";
      magicString.prependLeft(callee.end, "(" + code).prependRight(end, ")");

      if (this.transformUpdateBindings) {
        magicString.prependLeft(node.start, runtimeName + ".u(").prependRight(end, ")");
      }

      path.call(this, "visitWithoutReset", "arguments");
    }

    visitIdentifier(path) {
      var node = path.getValue();

      if (node.name !== "eval") {
        return;
      }

      var parent = path.getParentNode();
      var type = parent.type;

      if (type === "UnaryExpression" && parent.operator === "typeof" || !is_binding_identifier(node, parent) || is_shadowed(path, "eval", shadowedMap)) {
        return;
      } // Support indirect eval:
      // o = { eval }
      // o.e = eval
      // f(eval)
      // (0, eval)(code)


      this.transforms |= TRANSFORMS_EVAL;
      var end = node.end,
          start = node.start;
      var runtimeName = this.runtimeName;
      var code = this.strict ? runtimeName + ".e" : "(eval===" + runtimeName + ".v?" + runtimeName + ".e:eval)";

      if (type === "Property" && parent.shorthand) {
        this.magicString.prependLeft(end, ":" + code);
      } else {
        parse_overwrite(this, start, end, code);
      }
    }

  }

  return new EvalVisitor();
}

/* harmony default export */ var visitor_eval = (src_shared.inited ? src_shared.module.visitorEval : src_shared.module.visitorEval = eval_init());
// CONCATENATED MODULE: ./src/util/escape-regexp.js


function escape_regexp_init() {
  "use strict";

  var specialCharRegExp = /[\\^$.*+?()[\]{}|]/g;

  function escapeRegExp(string) {
    return typeof string === "string" ? string.replace(specialCharRegExp, "\\$&") : "";
  }

  return escapeRegExp;
}

/* harmony default export */ var escape_regexp = (src_shared.inited ? src_shared.module.utilEscapeRegExp : src_shared.module.utilEscapeRegExp = escape_regexp_init());
// CONCATENATED MODULE: ./src/parse/find-indexes.js




function find_indexes_init() {
  "use strict";

  var DOT = char_code.DOT;

  function findIndexes(code, identifiers) {
    var indexes = [];
    var length = identifiers.length;

    if (length === 0) {
      return indexes;
    }

    var lastIndex = length - 1;
    var pattern = new RegExp("\\b(?:" + function () {
      var i = -1;
      var source = "";

      while (++i < length) {
        source += escape_regexp(identifiers[i]) + (i === lastIndex ? "" : "|");
      }

      return source;
    }() + ")\\b", "g");
    var match;

    while ((match = pattern.exec(code)) !== null) {
      var _match = match,
          index = _match.index; // Make sure the match isn't preceded by a `.` character, since that
      // probably means the identifier is a property access rather than a
      // variable reference.

      if (index === 0 || code.charCodeAt(index - 1) !== DOT) {
        indexes.push(index);
      }
    }

    return indexes;
  }

  return findIndexes;
}

/* harmony default export */ var find_indexes = (src_shared.inited ? src_shared.module.parseFindIndexes : src_shared.module.parseFindIndexes = find_indexes_init());
// CONCATENATED MODULE: ./src/visitor/globals.js






function globals_init() {
  "use strict";

  var TRANSFORMS_CONSOLE = compiler.TRANSFORMS_CONSOLE,
      TRANSFORMS_REFLECT = compiler.TRANSFORMS_REFLECT;
  var shadowedMap = new Map();

  class GlobalsVisitor extends src_visitor {
    reset(options) {
      this.globals = null;
      this.magicString = null;
      this.possibleIndexes = null;
      this.runtimeName = null;
      this.transforms = 0;

      if (options !== void 0) {
        this.globals = options.globals;
        this.magicString = options.magicString;
        this.possibleIndexes = options.possibleIndexes;
        this.runtimeName = options.runtimeName;
      }
    }

    visitCallExpression(path) {
      var node = path.getValue();
      var callee = node.callee;

      if (callee.type !== "MemberExpression") {
        this.visitChildren(path);
        return;
      }

      var object = callee.object;
      var name = object.name;

      if (!this.globals.has(name)) {
        this.visitChildren(path);
        return;
      }

      var args = node.arguments;

      if (args.length === 0 || is_shadowed(path, name, shadowedMap)) {
        return;
      }

      if (name === "console") {
        var skip = true;

        for (var _i = 0, _length = args == null ? 0 : args.length; _i < _length; _i++) {
          var type = args[_i].type;

          if (type !== "Literal" && type !== "TemplateLiteral") {
            skip = false;
            break;
          }
        }

        if (skip) {
          return;
        }

        this.transforms |= TRANSFORMS_CONSOLE;
      } else if (name === "Reflect") {
        this.transforms |= TRANSFORMS_REFLECT;
      }

      this.magicString.prependLeft(object.start, this.runtimeName + ".g.");
      path.call(this, "visitWithoutReset", "arguments");
    }

    visitIdentifier(path) {
      var node = path.getValue();
      var name = node.name;

      if (!this.globals.has(name)) {
        return;
      }

      var parent = path.getParentNode();
      var type = parent.type;

      if (type === "UnaryExpression" && parent.operator === "typeof" || !is_binding_identifier(node, parent) || is_shadowed(path, name, shadowedMap)) {
        return;
      }

      if (name === "console") {
        this.transforms |= TRANSFORMS_CONSOLE;
      } else if (name === "Reflect") {
        this.transforms |= TRANSFORMS_REFLECT;
      }

      var code = this.runtimeName + ".g.";
      var pos = node.start;

      if (type === "Property" && parent.shorthand) {
        code = ":" + code + name;
        pos = node.end;
      }

      this.magicString.prependLeft(pos, code);
    }

  }

  return new GlobalsVisitor();
}

/* harmony default export */ var visitor_globals = (src_shared.inited ? src_shared.module.visitorGlobals : src_shared.module.visitorGlobals = globals_init());
// CONCATENATED MODULE: ./src/parse/index-of-pragma.js
// Based on `strictDirective()`.
// Copyright Marijn Haverbeke. Released under MIT license:
// https://github.com/acornjs/acorn



function index_of_pragma_init() {
  "use strict";

  function indexOfPragma(code, pragma) {
    var pos = 0;

    while (true) {
      skipWhiteSpace.lastIndex = pos;
      pos += skipWhiteSpace.exec(code)[0].length;
      var match = literalRegExp.exec(code.slice(pos));

      if (match === null) {
        return -1;
      }

      if ((match[1] || match[2]) === pragma) {
        return pos;
      }

      pos += match[0].length;
    }
  }

  return indexOfPragma;
}

/* harmony default export */ var index_of_pragma = (src_shared.inited ? src_shared.module.parseIndexOfPragma : src_shared.module.parseIndexOfPragma = index_of_pragma_init());
// CONCATENATED MODULE: ./src/parse/has-pragma.js



function has_pragma_init() {
  "use strict";

  var MODULE_PRAGMA = "use module";
  var SCRIPT_PRAGMA = "use script"; // A pragma width includes the enclosing quotes and trailing semicolon.

  var MODULE_PRAGMA_WIDTH = MODULE_PRAGMA.length + 3;
  var SCRIPT_PRAGMA_WIDTH = SCRIPT_PRAGMA.length + 3;

  function hasPragma(code, pragma) {
    var index = index_of_pragma(code, pragma);

    if (index === -1) {
      return false;
    }

    if (index >= SCRIPT_PRAGMA_WIDTH && pragma === MODULE_PRAGMA) {
      return index_of_pragma(code.slice(0, index), SCRIPT_PRAGMA) === -1;
    }

    if (index >= MODULE_PRAGMA_WIDTH && pragma === SCRIPT_PRAGMA) {
      return index_of_pragma(code.slice(0, index), MODULE_PRAGMA) === -1;
    }

    return true;
  }

  return hasPragma;
}

/* harmony default export */ var has_pragma = (src_shared.inited ? src_shared.module.parseHasPragma : src_shared.module.parseHasPragma = has_pragma_init());
// CONCATENATED MODULE: ./src/parse/preserve-child.js



function preserve_child_init() {
  "use strict";

  function preserveChild(visitor, parent, childName) {
    var child = parent[childName];
    var childStart = child.start;
    var parentStart = parent.start;
    var indentation = "";

    if (childStart > visitor.firstLineBreakPos) {
      var count = childStart - parentStart;
      indentation = count === 7 ? "       " : " ".repeat(count);
    }

    return parse_overwrite(visitor, parentStart, childStart, indentation);
  }

  return preserveChild;
}

/* harmony default export */ var preserve_child = (src_shared.inited ? src_shared.module.parsePreserveChild : src_shared.module.parsePreserveChild = preserve_child_init());
// CONCATENATED MODULE: ./src/parse/preserve-line.js



function preserve_line_init() {
  "use strict";

  function preserveLine(visitor, {
    end,
    start
  }) {
    return parse_overwrite(visitor, start, end, "");
  }

  return preserveLine;
}

/* harmony default export */ var preserve_line = (src_shared.inited ? src_shared.module.parsePreserveLine : src_shared.module.parsePreserveLine = preserve_line_init());
// CONCATENATED MODULE: ./src/util/escape-quotes.js



function escape_quotes_init() {
  "use strict";

  var APOSTROPHE = char_code.APOSTROPHE,
      QUOTE = char_code.QUOTE;
  var escapeRegExpMap = new Map([[APOSTROPHE, /\\?'/g], [QUOTE, /\\?"/g]]);

  function escapeQuotes(string, quoteCode = QUOTE) {
    if (typeof string !== "string") {
      return "";
    }

    var quote = String.fromCharCode(quoteCode);
    return string.replace(escapeRegExpMap.get(quoteCode), "\\" + quote);
  }

  return escapeQuotes;
}

/* harmony default export */ var escape_quotes = (src_shared.inited ? src_shared.module.utilEscapeQuotes : src_shared.module.utilEscapeQuotes = escape_quotes_init());
// CONCATENATED MODULE: ./src/util/to-string.js


function to_string_init() {
  "use strict";

  // Assign `String` to a variable so it's not removed by Terser.
  // https://github.com/terser-js/terser#the-unsafe-compress-option
  var UnmungedString = String;

  function toString(value) {
    if (typeof value === "string") {
      return value;
    }

    try {
      return UnmungedString(value);
    } catch (_unused) {}

    return "";
  }

  return toString;
}

/* harmony default export */ var to_string = (src_shared.inited ? src_shared.module.utilToString : src_shared.module.utilToString = to_string_init());
// CONCATENATED MODULE: ./src/util/unescape-quotes.js



function unescape_quotes_init() {
  "use strict";

  var APOSTROPHE = char_code.APOSTROPHE,
      QUOTE = char_code.QUOTE;
  var unescapeRegExpMap = new Map([[APOSTROPHE, /\\'/g], [QUOTE, /\\"/g]]);

  function unescapeQuotes(string, quoteCode = QUOTE) {
    if (typeof string !== "string") {
      return "";
    }

    var quote = String.fromCharCode(quoteCode);
    return string.replace(unescapeRegExpMap.get(quoteCode), quote);
  }

  return unescapeQuotes;
}

/* harmony default export */ var unescape_quotes = (src_shared.inited ? src_shared.module.utilUnescapeQuotes : src_shared.module.utilUnescapeQuotes = unescape_quotes_init());
// CONCATENATED MODULE: ./src/util/strip-quotes.js




function strip_quotes_init() {
  "use strict";

  var APOSTROPHE = char_code.APOSTROPHE,
      QUOTE = char_code.QUOTE;

  function stripQuotes(string, quoteCode) {
    if (typeof string !== "string") {
      return "";
    }

    var startCode = string.charCodeAt(0);
    var endCode = string.charCodeAt(string.length - 1);

    if (quoteCode === void 0) {
      if (startCode === APOSTROPHE && endCode === APOSTROPHE) {
        quoteCode = APOSTROPHE;
      } else if (startCode === QUOTE && endCode === QUOTE) {
        quoteCode = QUOTE;
      }
    }

    if (quoteCode === void 0) {
      return string;
    }

    var unquoted = string.slice(1, -1);
    return unescape_quotes(unquoted, quoteCode);
  }

  return stripQuotes;
}

/* harmony default export */ var strip_quotes = (src_shared.inited ? src_shared.module.utilStripQuotes : src_shared.module.utilStripQuotes = strip_quotes_init());
// CONCATENATED MODULE: ./src/util/to-string-literal.js






function to_string_literal_init() {
  "use strict";

  var QUOTE = char_code.QUOTE;
  var separatorsRegExp = /[\u2028\u2029]/g;
  var escapedSeparatorsMap = new Map([["\u2028", "\\u2028"], ["\u2029", "\\u2029"]]);

  function toStringLiteral(value, quoteCode = QUOTE) {
    var string = JSON.stringify(value);

    if (typeof string !== "string") {
      string = to_string(value);
    }

    string = string.replace(separatorsRegExp, replaceSeparators);

    if (quoteCode === QUOTE && string.charCodeAt(0) === QUOTE) {
      return string;
    }

    var quote = String.fromCharCode(quoteCode);
    var unquoted = strip_quotes(string, quoteCode);
    return quote + escape_quotes(unquoted, quoteCode) + quote;
  }

  function replaceSeparators(match) {
    return "\\" + escapedSeparatorsMap.get(match);
  }

  return toStringLiteral;
}

/* harmony default export */ var to_string_literal = (src_shared.inited ? src_shared.module.utilToStringLiteral : src_shared.module.utilToStringLiteral = to_string_literal_init());
// CONCATENATED MODULE: ./src/visitor/import-export.js












function import_export_init() {
  "use strict";

  var SOURCE_TYPE_MODULE = compiler.SOURCE_TYPE_MODULE,
      TRANSFORMS_DYNAMIC_IMPORT = compiler.TRANSFORMS_DYNAMIC_IMPORT,
      TRANSFORMS_EXPORT = compiler.TRANSFORMS_EXPORT,
      TRANSFORMS_IMPORT = compiler.TRANSFORMS_IMPORT,
      TRANSFORMS_IMPORT_META = compiler.TRANSFORMS_IMPORT_META;

  class ImportExportVisitor extends src_visitor {
    finalizeHoisting() {
      var top = this.top;
      var importedBindings = top.importedBindings;
      var code = top.insertPrefix;

      if (importedBindings.size !== 0) {
        code += (this.generateVarDeclarations ? "var " : "let ") + [...importedBindings].join(",") + ";";
      }

      code += toModuleExport(this, this.hoistedExports);
      var runtimeName = this.runtimeName;
      this.importSpecifierMap.forEach(function (map, request) {
        code += runtimeName + ".w(" + to_string_literal(request);
        var setterArgsList = "";
        map.imports.forEach(function (localNames, name) {
          var valueParam = safeName("v", localNames);
          setterArgsList += (setterArgsList === "" ? "" : ",") + '["' + name + '",' + (name === "*" ? "null" : '["' + localNames.join('","') + '"]') + ",function(" + valueParam + "){" + // Multiple local variables become a compound assignment.
          localNames.join("=") + "=" + valueParam + "}]";
        });
        map.reExports.forEach(function (localNames, name) {
          for (var _i = 0, _length = localNames == null ? 0 : localNames.length; _i < _length; _i++) {
            var localName = localNames[_i];
            setterArgsList += (setterArgsList === "" ? "" : ",") + '["' + localName + '",null,' + runtimeName + '.f("' + localName + '","' + name + '")]';
          }
        });

        if (map.star) {
          setterArgsList += (setterArgsList === "" ? "" : ",") + '["*",null,' + runtimeName + ".n()]";
        }

        if (setterArgsList !== "") {
          code += ",[" + setterArgsList + "]";
        }

        code += ");";
      });
      this.magicString.prependLeft(top.insertIndex, code);
      this.yieldIndex += code.length;
    }

    reset(options) {
      this.assignableBindings = null;
      this.firstLineBreakPos = -1;
      this.generateVarDeclarations = false;
      this.hoistedExports = null;
      this.hoistedImportsString = "";
      this.importSpecifierMap = null;
      this.magicString = null;
      this.possibleIndexes = null;
      this.runtimeName = null;
      this.sourceType = null;
      this.temporalBindings = null;
      this.top = null;
      this.transforms = 0;
      this.yieldIndex = 0;

      if (options !== void 0) {
        var magicString = options.magicString;
        this.assignableBindings = new Set();
        this.firstLineBreakPos = magicString.original.search(lineBreak);
        this.generateVarDeclarations = options.generateVarDeclarations;
        this.hoistedExports = [];
        this.importSpecifierMap = new Map();
        this.magicString = magicString;
        this.possibleIndexes = options.possibleIndexes;
        this.runtimeName = options.runtimeName;
        this.sourceType = options.sourceType;
        this.temporalBindings = new Set();
        this.top = options.top;
        this.yieldIndex = options.yieldIndex;
      }
    }

    visitCallExpression(path) {
      var node = path.getValue();
      var callee = node.callee;

      if (callee.type !== "Import") {
        this.visitChildren(path);
        return;
      }

      if (node.arguments.length === 0) {
        return;
      } // Support dynamic import:
      // import("mod")


      this.transforms |= TRANSFORMS_DYNAMIC_IMPORT;
      parse_overwrite(this, callee.start, callee.end, this.runtimeName + ".i");
      path.call(this, "visitWithoutReset", "arguments");
    }

    visitImportDeclaration(path) {
      if (this.sourceType !== SOURCE_TYPE_MODULE) {
        return;
      } // Suport import statements:
      // import defaultName from "mod"
      // import * as name from "mod"
      // import { export as alias } from "mod"
      // import { export1 , export2, ...exportN } from "mod"
      // import { export1 , export2 as alias2, [...] } from "mod"
      // import defaultName, { export1, [ , [...] ] } from "mod"
      // import defaultName, * as name from "mod"
      // import "mod"


      this.transforms |= TRANSFORMS_IMPORT;
      var importSpecifierMap = this.importSpecifierMap,
          temporalBindings = this.temporalBindings;
      var node = path.getValue();
      var request = node.source.value;
      var specifiers = node.specifiers;
      var map = importSpecifierMap.get(request);

      if (map === void 0) {
        map = createImportSpecifierMap();
        importSpecifierMap.set(request, map);
      }

      var _map = map,
          imports = _map.imports;

      for (var _i2 = 0, _length2 = specifiers == null ? 0 : specifiers.length; _i2 < _length2; _i2++) {
        var specifier = specifiers[_i2];
        var type = specifier.type;
        var importsName = "*";

        if (type === "ImportSpecifier") {
          importsName = specifier.imported.name;
        } else if (type === "ImportDefaultSpecifier") {
          importsName = "default";
        }

        var localNames = imports.get(importsName);

        if (localNames === void 0) {
          localNames = [];
          imports.set(importsName, localNames);
        }

        var localName = specifier.local.name;
        localNames.push(localName);

        if (importsName !== "*") {
          temporalBindings.add(localName);
        }
      }

      hoistImports(this, node);
    }

    visitExportAllDeclaration(path) {
      if (this.sourceType !== SOURCE_TYPE_MODULE) {
        return;
      } // Support re-exporting an imported module:
      // export * from "mod"


      this.transforms |= TRANSFORMS_EXPORT;
      var importSpecifierMap = this.importSpecifierMap;
      var node = path.getValue();
      var request = node.source.value;
      var map = importSpecifierMap.get(request);

      if (map === void 0) {
        map = createImportSpecifierMap();
        importSpecifierMap.set(request, map);
      }

      map.star = true;
      hoistImports(this, node);
    }

    visitExportDefaultDeclaration(path) {
      if (this.sourceType !== SOURCE_TYPE_MODULE) {
        return;
      }

      this.transforms |= TRANSFORMS_EXPORT;
      var node = path.getValue();
      var declaration = node.declaration;
      var magicString = this.magicString,
          runtimeName = this.runtimeName;
      var type = declaration.type;
      var id = declaration.id;

      if (id === void 0) {
        id = null;
      }

      var name = id === null ? runtimeName + "anonymous" : id.name;

      if (id !== null && type === "ClassDeclaration" || type === "FunctionDeclaration") {
        // Support exporting default function declarations:
        // export default function named() {}
        if (id === null) {
          // Convert anonymous functions to hoisted named functions.
          magicString.prependLeft(declaration.functionParamsStart, " " + name);
        }

        hoistExports(this, node, [["default", name]]);
      } else {
        // Support exporting other default declarations:
        // export default value
        var prefix = runtimeName + ".d(";
        var suffix = ");";

        if (id === null && (type === "ArrowFunctionExpression" || type === "ClassDeclaration" || type === "ClassExpression" || type === "FunctionExpression")) {
          // Assign anonymous functions to a variable so they're given a
          // temporary name, which we'll rename later to "default".
          // https://tc39.github.io/ecma262/#sec-exports-runtime-semantics-evaluation
          prefix = "const " + name + "=";
          suffix = ";" + runtimeName + ".d(" + name + ");";
        }

        if (type === "SequenceExpression") {
          // If the exported expression is a comma-separated sequence expression
          // it may not include the vital parentheses, so we should wrap the
          // expression with parentheses to make sure it's treated as a single
          // argument to `runtime.addDefaultValue()`, rather than as multiple
          // arguments.
          prefix += "(";
          suffix = ")" + suffix;
        }

        var localName = id === null ? runtimeName + ".o" : name;
        this.hoistedExports.push(["default", localName]);
        parse_overwrite(this, node.start, declaration.start, "");
        parse_overwrite(this, declaration.end, node.end, "");
        magicString.prependLeft(declaration.start, prefix).prependRight(declaration.end, suffix);
      }

      if (id !== null) {
        this.assignableBindings.add(name);
      }

      path.call(this, "visitWithoutReset", "declaration");
    }

    visitExportNamedDeclaration(path) {
      if (this.sourceType !== SOURCE_TYPE_MODULE) {
        return;
      }

      this.transforms |= TRANSFORMS_EXPORT;
      var assignableBindings = this.assignableBindings,
          magicString = this.magicString;
      var node = path.getValue();
      var declaration = node.declaration,
          source = node.source,
          specifiers = node.specifiers;

      if (declaration !== null) {
        var pairs = [];
        var type = declaration.type;

        if (type === "ClassDeclaration" || type === "FunctionDeclaration") {
          // Support exporting named class and function declarations:
          // export function named() {}
          var name = declaration.id.name;
          assignableBindings.add(name);
          pairs.push([name, name]);
        } else if (type === "VariableDeclaration") {
          // Skip adding declared names to `this.assignableBindings` if the
          // declaration is a const-kinded VariableDeclaration, because the
          // assignmentVisitor doesn't need to worry about changes to these
          // variables.
          var changeable = isChangeable(node); // Support exporting variable lists:
          // export let name1, name2, ..., nameN

          for (var _i3 = 0, _declaration$declarat = declaration.declarations, _length3 = _declaration$declarat == null ? 0 : _declaration$declarat.length; _i3 < _length3; _i3++) {
            var id = _declaration$declarat[_i3].id;
            var names = get_names_from_pattern(id);

            for (var _i4 = 0, _length4 = names == null ? 0 : names.length; _i4 < _length4; _i4++) {
              var _name = names[_i4];

              if (changeable) {
                assignableBindings.add(_name);
              }

              pairs.push([_name, _name]);
            }
          }
        }

        hoistExports(this, node, pairs);
      } else if (source === null) {
        // Support exporting specifiers:
        // export { name1, name2, ..., nameN }
        var _pairs = [];
        var topIdentifiers = this.top.identifiers;

        for (var _i5 = 0, _length5 = specifiers == null ? 0 : specifiers.length; _i5 < _length5; _i5++) {
          var specifier = specifiers[_i5];
          var exportedName = specifier.exported.name;
          var localName = specifier.local.name;

          if (!topIdentifiers.has(localName)) {
            throw new parse_errors.SyntaxError({
              inModule: true,
              input: magicString.original
            }, specifier.start, "Export '" + localName + "' is not defined in module");
          }

          assignableBindings.add(localName);

          _pairs.push([exportedName, localName]);
        }

        hoistExports(this, node, _pairs);
      } else {
        // Support re-exporting specifiers of an imported module:
        // export { name1, name2, ..., nameN } from "mod"
        var importSpecifierMap = this.importSpecifierMap;
        var request = source.value;
        var map = importSpecifierMap.get(request);

        if (map === void 0) {
          map = createImportSpecifierMap();
          importSpecifierMap.set(request, map);
        }

        for (var _i6 = 0, _length6 = specifiers == null ? 0 : specifiers.length; _i6 < _length6; _i6++) {
          var _specifier = specifiers[_i6];
          var _exportedName = _specifier.exported.name;
          var _map2 = map,
              reExports = _map2.reExports;
          var localNames = reExports.get(_exportedName);

          if (localNames === void 0) {
            localNames = [];
            reExports.set(_exportedName, localNames);
          }

          var _localName = _specifier.type === "ExportNamespaceSpecifier" ? "*" : _specifier.local.name;

          localNames.push(_localName);
        }

        hoistImports(this, node);
      }

      if (declaration !== null) {
        path.call(this, "visitWithoutReset", "declaration");
      }
    }

    visitMetaProperty(path) {
      var _path$getValue = path.getValue(),
          meta = _path$getValue.meta;

      if (meta.name === "import") {
        // Support import.meta.
        this.transforms |= TRANSFORMS_IMPORT_META;
        parse_overwrite(this, meta.start, meta.end, this.runtimeName + "._");
      }
    }

  }

  function createImportSpecifierMap() {
    return {
      imports: new Map(),
      reExports: new Map(),
      star: false
    };
  }

  function hoistExports(visitor, node, pairs) {
    visitor.hoistedExports.push(...pairs);

    if (node.declaration) {
      preserve_child(visitor, node, "declaration");
    } else {
      preserve_line(visitor, node);
    }
  }

  function hoistImports(visitor, node) {
    preserve_line(visitor, node);
  }

  function isChangeable({
    declaration,
    type
  }) {
    if (type === "ExportDefaultDeclaration") {
      var declType = declaration.type;
      return declType === "FunctionDeclaration" || declType === "ClassDeclaration";
    }

    if (type === "ExportNamedDeclaration" && declaration !== null && declaration.type === "VariableDeclaration" && declaration.kind === "const") {
      return false;
    }

    return true;
  }

  function safeName(name, localNames) {
    return localNames.indexOf(name) === -1 ? name : safeName(encode_id(name), localNames);
  }

  function toModuleExport(visitor, pairs) {
    var code = "";
    var length = pairs.length;

    if (length === 0) {
      return code;
    }

    var lastIndex = length - 1;
    var i = -1;
    code += visitor.runtimeName + ".x([";

    for (var _i7 = 0, _length7 = pairs == null ? 0 : pairs.length; _i7 < _length7; _i7++) {
      var _pairs$_i = pairs[_i7],
          exportedName = _pairs$_i[0],
          localName = _pairs$_i[1];
      code += '["' + exportedName + '",()=>' + localName + "]" + (++i === lastIndex ? "" : ",");
    }

    code += "]);";
    return code;
  }

  return new ImportExportVisitor();
}

/* harmony default export */ var import_export = (src_shared.inited ? src_shared.module.visitorImportExport : src_shared.module.visitorImportExport = import_export_init());
// CONCATENATED MODULE: ./src/visitor/require.js




function visitor_require_init() {
  "use strict";

  var shadowedMap = new Map();

  class RequireVisitor extends src_visitor {
    reset(options) {
      this.found = false;
      this.possibleIndexes = null;

      if (options !== void 0) {
        this.possibleIndexes = options.possibleIndexes;
      }
    }

    visitCallExpression(path) {
      var node = path.getValue();
      var callee = node.callee;

      if (callee.name !== "require") {
        this.visitChildren(path);
        return;
      }

      if (node.arguments.length === 0 || is_shadowed(path, "require", shadowedMap)) {
        return;
      }

      this.found = true;
      path.call(this, "visitWithoutReset", "arguments");
    }

  }

  return new RequireVisitor();
}

/* harmony default export */ var visitor_require = (src_shared.inited ? src_shared.module.visitorRequire : src_shared.module.visitorRequire = visitor_require_init());
// CONCATENATED MODULE: ./src/util/strip-shebang.js
// Based on `stripShebang()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/helpers.js



function strip_shebang_init() {
  "use strict";

  var NUMSIGN = char_code.NUMSIGN;
  var shebangRegExp = /^#!.*/;

  function stripShebang(string) {
    if (typeof string !== "string") {
      return "";
    }

    return string.charCodeAt(0) === NUMSIGN ? string.replace(shebangRegExp, "") : string;
  }

  return stripShebang;
}

/* harmony default export */ var strip_shebang = (src_shared.inited ? src_shared.module.utilStripShebang : src_shared.module.utilStripShebang = strip_shebang_init());
// CONCATENATED MODULE: ./src/parse/maybe-identifier.js



function maybe_identifier_init() {
  "use strict";

  function maybeIdentifier(path, callback) {
    var node = path.getValue();
    var parent = path.getParentNode();

    if (!is_binding_identifier(node, parent)) {
      return;
    }

    var nodeIndex = -2;

    while (parent.type === "MemberExpression") {
      nodeIndex -= 2;
      var grandParent = path.getNode(nodeIndex);

      if (grandParent === null) {
        break;
      }

      parent = grandParent;
    }

    callback(node, parent);
  }

  return maybeIdentifier;
}

/* harmony default export */ var maybe_identifier = (src_shared.inited ? src_shared.module.parseMaybeIdentifier : src_shared.module.parseMaybeIdentifier = maybe_identifier_init());
// CONCATENATED MODULE: ./src/visitor/temporal.js








function temporal_init() {
  "use strict";

  var TRANSFORMS_TEMPORALS = compiler.TRANSFORMS_TEMPORALS;
  var shadowedMap = new Map();

  class TemporalVisitor extends src_visitor {
    reset(options) {
      this.magicString = null;
      this.possibleIndexes = null;
      this.runtimeName = null;
      this.temporalBindings = null;
      this.transforms = 0;

      if (options !== void 0) {
        this.magicString = options.magicString;
        this.possibleIndexes = options.possibleIndexes;
        this.runtimeName = options.runtimeName;
        this.temporalBindings = options.temporalBindings;
      }
    }

    visitIdentifier(path) {
      var _this = this;

      var node = path.getValue();
      var name = node.name;

      if (!this.temporalBindings.has(name) || is_shadowed(path, name, shadowedMap)) {
        return;
      }

      var magicString = this.magicString,
          runtimeName = this.runtimeName;
      maybe_identifier(path, function (node, parent) {
        _this.transforms |= TRANSFORMS_TEMPORALS;
        var end = node.end,
            start = node.start;

        if (parent.shorthand) {
          magicString.prependLeft(end, ":" + runtimeName + '.a("' + name + '",' + name + ")");
          return;
        }

        var prefix = "";
        var suffix = "";

        if (parent.type === "NewExpression") {
          prefix = "(";
          suffix = ")";
        }

        parse_overwrite(_this, start, end, prefix + runtimeName + '.a("' + name + '",' + name + ")" + suffix);
      });
    }

    visitExportDefaultDeclaration(path) {
      var node = path.getValue();
      var declaration = node.declaration;

      if (declaration.type !== "FunctionDeclaration") {
        // Instrument for non-hoisted values.
        this.transforms |= TRANSFORMS_TEMPORALS;
        this.magicString.appendRight(declaration.end, this.runtimeName + '.j(["default"]);');
      }

      path.call(this, "visitWithoutReset", "declaration");
    }

    visitExportNamedDeclaration(path) {
      var node = path.getValue();
      var declaration = node.declaration,
          specifiers = node.specifiers;
      var initees = new Set();

      if (declaration !== null) {
        var type = declaration.type;

        if (type === "ClassDeclaration") {
          initees.add(declaration.id.name);
        } else if (type === "VariableDeclaration") {
          // Instrument for exported variable lists:
          // export let name1, name2, ..., nameN
          for (var _i = 0, _declaration$declarat = declaration.declarations, _length = _declaration$declarat == null ? 0 : _declaration$declarat.length; _i < _length; _i++) {
            var id = _declaration$declarat[_i].id;
            var names = get_names_from_pattern(id);

            for (var _i2 = 0, _length2 = names == null ? 0 : names.length; _i2 < _length2; _i2++) {
              var name = names[_i2];
              initees.add(name);
            }
          }
        }
      } else if (node.source === null) {
        // Instrument for exported specifiers:
        // export { name1, name2, ..., nameN }
        for (var _i3 = 0, _length3 = specifiers == null ? 0 : specifiers.length; _i3 < _length3; _i3++) {
          var specifier = specifiers[_i3];
          initees.add(specifier.exported.name);
        }
      } else {
        // Instrument for re-exported specifiers of an imported module:
        // export { name1, name2, ..., nameN } from "mod"
        for (var _i4 = 0, _length4 = specifiers == null ? 0 : specifiers.length; _i4 < _length4; _i4++) {
          var _specifier = specifiers[_i4];
          initees.add(_specifier.exported.name);
        }
      }

      if (initees.size !== 0) {
        this.transforms |= TRANSFORMS_TEMPORALS;

        var _ref = declaration || node,
            end = _ref.end;

        this.magicString.appendRight(end, ";" + this.runtimeName + ".j(" + JSON.stringify([...initees]) + ");");
      }

      if (declaration !== null) {
        path.call(this, "visitWithoutReset", "declaration");
      }
    }

  }

  return new TemporalVisitor();
}

/* harmony default export */ var temporal = (src_shared.inited ? src_shared.module.visitorTemporal : src_shared.module.visitorTemporal = temporal_init());
// CONCATENATED MODULE: ./src/visitor/undeclared.js








function undeclared_init() {
  "use strict";

  var TRANSFORMS_UNDECLARED = compiler.TRANSFORMS_UNDECLARED;
  var shadowedMap = new Map();

  class UndeclaredVisitor extends src_visitor {
    reset(options) {
      this.magicString = null;
      this.possibleIndexes = null;
      this.runtimeName = null;
      this.transforms = 0;
      this.undeclared = null;

      if (options !== void 0) {
        this.magicString = options.magicString;
        this.possibleIndexes = options.possibleIndexes;
        this.runtimeName = options.runtimeName;
        this.undeclared = options.undeclared;
      }
    }

    visitIdentifier(path) {
      var _this = this;

      var node = path.getValue();
      var name = node.name;

      if (!this.undeclared.has(name) || !is_binding_identifier(node, parent) || is_shadowed(path, name, shadowedMap)) {
        return;
      }

      var parent = path.getParentNode();
      var runtimeName = this.runtimeName;

      if (parent.type === "UnaryExpression" && parent.operator === "typeof") {
        this.transforms |= TRANSFORMS_UNDECLARED;
        parse_overwrite(this, node.start, node.end, runtimeName + ".g." + name);
        return;
      }

      maybe_identifier(path, function (node, parent) {
        _this.transforms |= TRANSFORMS_UNDECLARED;
        var end = node.end,
            start = node.start;

        if (parent.shorthand) {
          _this.magicString.prependLeft(end, ":" + runtimeName + '.t("' + name + '")');

          return;
        }

        var prefix = "";
        var suffix = "";

        if (parent.type === "NewExpression") {
          prefix = "(";
          suffix = ")";
        }

        parse_overwrite(_this, start, end, prefix + runtimeName + '.t("' + name + '")' + suffix);
      });
    }

  }

  return new UndeclaredVisitor();
}

/* harmony default export */ var visitor_undeclared = (src_shared.inited ? src_shared.module.visitorUndeclared : src_shared.module.visitorUndeclared = undeclared_init());
// CONCATENATED MODULE: ./src/compiler.js



















function compiler_init() {
  "use strict";

  var SOURCE_TYPE_MODULE = compiler.SOURCE_TYPE_MODULE,
      SOURCE_TYPE_SCRIPT = compiler.SOURCE_TYPE_SCRIPT,
      SOURCE_TYPE_UNAMBIGUOUS = compiler.SOURCE_TYPE_UNAMBIGUOUS,
      TRANSFORMS_DYNAMIC_IMPORT = compiler.TRANSFORMS_DYNAMIC_IMPORT,
      TRANSFORMS_EXPORT = compiler.TRANSFORMS_EXPORT,
      TRANSFORMS_IMPORT = compiler.TRANSFORMS_IMPORT,
      TRANSFORMS_IMPORT_META = compiler.TRANSFORMS_IMPORT_META,
      TRANSFORMS_TEMPORALS = compiler.TRANSFORMS_TEMPORALS;
  var defaultOptions = {
    cjsPaths: false,
    cjsVars: false,
    generateVarDeclarations: false,
    hint: -1,
    pragmas: true,
    runtimeName: "_",
    sourceType: SOURCE_TYPE_SCRIPT,
    strict: void 0,
    topLevelReturn: false
  };
  var Compiler = {
    createOptions,
    defaultOptions,

    // eslint-disable-next-line sort-keys
    compile(code, options) {
      code = strip_shebang(code);
      options = Compiler.createOptions(options);
      assignment.reset();
      visitor_eval.reset();
      visitor_globals.reset();
      import_export.reset();
      visitor_require.reset();
      temporal.reset();
      visitor_undeclared.reset();
      var result = {
        circular: 0,
        code,
        codeWithTDZ: null,
        filename: null,
        firstAwaitOutsideFunction: null,
        firstReturnOutsideFunction: null,
        mtime: -1,
        scriptData: null,
        sourceType: SOURCE_TYPE_SCRIPT,
        transforms: 0,
        yieldIndex: 0
      };
      var _options = options,
          hint = _options.hint;
      var _options2 = options,
          sourceType = _options2.sourceType;

      if (hint === SOURCE_TYPE_SCRIPT) {
        sourceType = SOURCE_TYPE_SCRIPT;
      } else if (hint === SOURCE_TYPE_MODULE) {
        sourceType = SOURCE_TYPE_MODULE;
      } else if (options.pragmas) {
        if (has_pragma(code, "use module")) {
          sourceType = SOURCE_TYPE_MODULE;
        } else if (has_pragma(code, "use script")) {
          sourceType = SOURCE_TYPE_SCRIPT;
        }
      }

      var possibleExportIndexes = find_indexes(code, ["export"]);
      var possibleEvalIndexes = find_indexes(code, ["eval"]);
      var possibleImportExportIndexes = find_indexes(code, ["import"]);
      var possibleChanges = possibleExportIndexes.length !== 0 || possibleEvalIndexes.length !== 0 || possibleImportExportIndexes.length !== 0;

      if (!possibleChanges && (sourceType === SOURCE_TYPE_SCRIPT || sourceType === SOURCE_TYPE_UNAMBIGUOUS)) {
        return result;
      }

      var parserOptions = {
        allowReturnOutsideFunction: options.topLevelReturn || sourceType === SOURCE_TYPE_SCRIPT,
        sourceType: sourceType === SOURCE_TYPE_SCRIPT ? SOURCE_TYPE_SCRIPT : SOURCE_TYPE_MODULE,
        strict: options.strict
      };
      var ast;
      var error;
      var threw = true;

      try {
        ast = src_parser.parse(code, parserOptions);
        threw = false;
      } catch (e) {
        error = e;
      }

      if (threw && sourceType === SOURCE_TYPE_UNAMBIGUOUS) {
        sourceType = SOURCE_TYPE_SCRIPT;
        parserOptions.allowReturnOutsideFunction = true;
        parserOptions.sourceType = sourceType;

        try {
          ast = src_parser.parse(code, parserOptions);
          threw = false;
        } catch (_unused) {}
      }

      if (threw) {
        if (options.cjsPaths) {
          error.inModule = false;
        }

        throw error;
      }

      var _options3 = options,
          cjsVars = _options3.cjsVars,
          runtimeName = _options3.runtimeName;
      var _ast = ast,
          strict = _ast.strict,
          top = _ast.top;
      var topIdentifiers = top.identifiers; // Delete extraneous properties so they aren't needlessly visited.

      Reflect.deleteProperty(ast, "inModule");
      Reflect.deleteProperty(ast, "strict");
      Reflect.deleteProperty(ast, "top");
      var magicString = new magic_string(code);
      var rootPath = new fast_path(ast);
      var yieldIndex = top.insertIndex;
      possibleImportExportIndexes.push(...possibleExportIndexes);
      possibleImportExportIndexes.sort(ascending_comparator);
      import_export.visit(rootPath, {
        generateVarDeclarations: options.generateVarDeclarations,
        magicString,
        possibleIndexes: possibleImportExportIndexes,
        runtimeName,
        sourceType: sourceType === SOURCE_TYPE_SCRIPT ? SOURCE_TYPE_SCRIPT : SOURCE_TYPE_MODULE,
        top,
        yieldIndex
      });
      var importExportTransforms = import_export.transforms;
      var transformsDynamicImport = (importExportTransforms & TRANSFORMS_DYNAMIC_IMPORT) !== 0;
      var transformsExport = (importExportTransforms & TRANSFORMS_EXPORT) !== 0;
      var transformsImport = (importExportTransforms & TRANSFORMS_IMPORT) !== 0;
      var transformsImportMeta = (importExportTransforms & TRANSFORMS_IMPORT_META) !== 0;

      if (sourceType === SOURCE_TYPE_UNAMBIGUOUS) {
        if (transformsExport || transformsImportMeta || transformsImport) {
          sourceType = SOURCE_TYPE_MODULE;
        } else {
          sourceType = SOURCE_TYPE_SCRIPT;
        }
      }

      if (transformsDynamicImport || transformsImport) {
        var globals = new Set(["Reflect", "console"]);
        var possibleGlobalsNames = [];

        if (topIdentifiers.has("console")) {
          globals.delete("console");
        } else {
          possibleGlobalsNames.push("console");
        }

        if (topIdentifiers.has("Reflect")) {
          globals.delete("Reflect");
        } else {
          possibleGlobalsNames.push("Reflect");
        }

        visitor_globals.visit(rootPath, {
          globals,
          magicString,
          possibleIndexes: find_indexes(code, possibleGlobalsNames),
          runtimeName
        });
      }

      if (!topIdentifiers.has("eval")) {
        visitor_eval.visit(rootPath, {
          magicString,
          possibleIndexes: possibleEvalIndexes,
          runtimeName,
          strict,
          transformUpdateBindings: transformsExport
        });
      }

      var possibleAssignableBindingsIndexes;

      if (transformsExport || transformsImport) {
        var assignableBindings = import_export.assignableBindings;
        possibleAssignableBindingsIndexes = find_indexes(code, [...assignableBindings]);

        if (cjsVars) {
          visitor_require.visit(rootPath, {
            possibleIndexes: find_indexes(code, ["require"])
          });
        }

        var importedBindings = top.importedBindings;
        var transformImportBindingAssignments = !visitor_require.found && importedBindings.size !== 0;
        var possibleAssignmentIndexes = possibleAssignableBindingsIndexes;

        if (transformImportBindingAssignments) {
          possibleAssignmentIndexes.push(...find_indexes(code, [...importedBindings]));
          possibleAssignmentIndexes.sort(ascending_comparator);
        }

        assignment.visit(rootPath, {
          assignableBindings,
          importedBindings,
          magicString,
          possibleIndexes: possibleAssignmentIndexes,
          runtimeName,
          transformImportBindingAssignments,
          transformInsideFunctions: true
        });
        import_export.finalizeHoisting();
      }

      if (!cjsVars && sourceType === SOURCE_TYPE_MODULE) {
        var possibleNames = ["__dirname", "__filename", "arguments", "exports", "module", "require"];
        var undeclared = new Set();
        var undeclaredNames = [];

        for (var _i = 0, _length = possibleNames == null ? 0 : possibleNames.length; _i < _length; _i++) {
          var name = possibleNames[_i];

          if (!topIdentifiers.has(name)) {
            undeclared.add(name);
            undeclaredNames.push(name);
          }
        }

        visitor_undeclared.visit(rootPath, {
          magicString,
          possibleIndexes: find_indexes(code, undeclaredNames),
          runtimeName,
          undeclared
        });
      }

      result.transforms = visitor_eval.transforms | visitor_globals.transforms | importExportTransforms | visitor_undeclared.transforms;

      if (result.transforms !== 0) {
        yieldIndex = import_export.yieldIndex;
        result.code = magicString.toString();
      }

      if (transformsImport) {
        // Pick `importExportVisitor` properties outside of the `codeWithTDZ`
        // getter/setter to preserve their values.
        var _assignableBindings = import_export.assignableBindings,
            temporalBindings = import_export.temporalBindings;
        set_deferred(result, "codeWithTDZ", function () {
          var possibleTemporalIndexes = find_indexes(code, [...temporalBindings]);
          possibleTemporalIndexes.push(...possibleExportIndexes);
          possibleTemporalIndexes.sort(ascending_comparator);
          assignment.visit(rootPath, {
            assignableBindings: _assignableBindings,
            magicString,
            possibleIndexes: possibleAssignableBindingsIndexes,
            runtimeName,
            transformOutsideFunctions: true
          });
          temporal.visit(rootPath, {
            magicString,
            possibleIndexes: possibleTemporalIndexes,
            runtimeName,
            temporalBindings
          });
          var temporalTransforms = temporal.transforms;
          result.transforms |= temporalTransforms;
          return (temporalTransforms & TRANSFORMS_TEMPORALS) === 0 ? null : magicString.toString();
        });
        result.circular = -1;
      }

      result.firstAwaitOutsideFunction = top.firstAwaitOutsideFunction;
      result.firstReturnOutsideFunction = top.firstReturnOutsideFunction;
      result.sourceType = sourceType;
      result.yieldIndex = yieldIndex;
      return result;
    }

  };

  function createOptions(value) {
    return util_defaults({}, value, Compiler.defaultOptions);
  }

  return Compiler;
}

/* harmony default export */ var src_compiler = (src_shared.inited ? src_shared.module.Compiler : src_shared.module.Compiler = compiler_init());
// CONCATENATED MODULE: ./src/safe/buffer.js


/* harmony default export */ var safe_buffer = (src_shared.inited ? src_shared.module.SafeBuffer : src_shared.module.SafeBuffer = util_safe(src_shared.external.Buffer));
// CONCATENATED MODULE: ./src/generic/buffer.js




function buffer_init() {
  "use strict";

  return {
    alloc: safe_buffer.alloc,
    concat: safe_buffer.concat,
    slice: unapply(safe_buffer.prototype.slice)
  };
}

/* harmony default export */ var generic_buffer = (src_shared.inited ? src_shared.module.GenericBuffer : src_shared.module.GenericBuffer = buffer_init());
// CONCATENATED MODULE: ./src/real/fs.js



/* harmony default export */ var fs = (src_shared.inited ? src_shared.module.realFs : src_shared.module.realFs = unwrap_proxy(real_require("fs")));
// CONCATENATED MODULE: ./src/safe/fs.js






function fs_init() {
  "use strict";

  var safeFs = util_safe(fs);
  var native = safeFs.realpathSync.native;

  if (typeof native === "function") {
    src_shared.realpathNativeSync = native;
  }

  if (has(safeFs, "constants")) {
    set_property(safeFs, "constants", util_safe(safeFs.constants));
  }

  set_property(safeFs, "Stats", util_safe(safeFs.Stats));
  return safeFs;
}

var fs_safeFs = src_shared.inited ? src_shared.module.safeFs : src_shared.module.safeFs = fs_init();
var closeSync = fs_safeFs.closeSync,
    constants = fs_safeFs.constants,
    futimesSync = fs_safeFs.futimesSync,
    mkdirSync = fs_safeFs.mkdirSync,
    openSync = fs_safeFs.openSync,
    readdirSync = fs_safeFs.readdirSync,
    readFileSync = fs_safeFs.readFileSync,
    realpathSync = fs_safeFs.realpathSync,
    Stats = fs_safeFs.Stats,
    fs_statSync = fs_safeFs.statSync,
    unlinkSync = fs_safeFs.unlinkSync,
    writeFileSync = fs_safeFs.writeFileSync;

/* harmony default export */ var safe_fs = (fs_safeFs);
// CONCATENATED MODULE: ./src/env/last-arg-match.js



function last_arg_match_init() {
  "use strict";

  function lastArgMatch(args, pattern, index = 1) {
    var length = args == null ? 0 : args.length;

    while (length--) {
      var match = pattern.exec(args[length]);

      if (match !== null) {
        return strip_quotes(match[index]);
      }
    }
  }

  return lastArgMatch;
}

/* harmony default export */ var last_arg_match = (src_shared.inited ? src_shared.module.envLastArgMatch : src_shared.module.envLastArgMatch = last_arg_match_init());
// CONCATENATED MODULE: ./src/util/get-object-tag.js


function get_object_tag_init() {
  "use strict";

  var toString = Object.prototype.toString;

  function getObjectTag(value) {
    return toString.call(value);
  }

  return getObjectTag;
}

/* harmony default export */ var get_object_tag = (src_shared.inited ? src_shared.module.utilGetToStringTag : src_shared.module.utilGetToStringTag = get_object_tag_init());
// CONCATENATED MODULE: ./src/real/util.js



/* harmony default export */ var util = (src_shared.inited ? src_shared.module.realUtil : src_shared.module.realUtil = unwrap_proxy(real_require("util")));
// CONCATENATED MODULE: ./src/safe/util.js







function util_init() {
  "use strict";

  var safeUtil = util_safe(util);
  var inspect = safeUtil.inspect;
  var custom = inspect.custom; // Node < 6.6.0 uses the property "inspect" as the custom inspection key
  // instead of the `util.inspect.custom` symbol.

  src_shared.customInspectKey = typeof custom === "symbol" ? custom : "inspect";
  var defaultOptions = inspect.defaultOptions;

  if (!is_object_like(defaultOptions)) {
    defaultOptions = {
      breakLength: 60,
      colors: false,
      compact: true,
      customInspect: true,
      depth: 2,
      maxArrayLength: 100,
      showHidden: false,
      showProxy: false
    };
  }

  src_shared.defaultInspectOptions = defaultOptions;

  if (has(safeUtil, "types")) {
    set_property(safeUtil, "types", util_safe(safeUtil.types));
  }

  return safeUtil;
}

var util_safeUtil = src_shared.inited ? src_shared.module.safeUtil : src_shared.module.safeUtil = util_init();
var deprecate = util_safeUtil.deprecate,
    util_inspect = util_safeUtil.inspect,
    util_types = util_safeUtil.types;

/* harmony default export */ var safe_util = (util_safeUtil);
// CONCATENATED MODULE: ./src/util/is-regexp.js





function is_regexp_init() {
  "use strict";

  if (typeof (util_types && util_types.isRegExp) === "function") {
    return util_types.isRegExp;
  }

  return function isRegExp(value) {
    return is_object(value) && get_object_tag(value) === "[object RegExp]";
  };
}

/* harmony default export */ var is_regexp = (src_shared.inited ? src_shared.module.utilIsRegExp : src_shared.module.utilIsRegExp = is_regexp_init());
// CONCATENATED MODULE: ./src/util/to-matcher.js



function to_matcher_init() {
  "use strict";

  function toMatcher(source) {
    if (typeof source === "function") {
      return function (value) {
        return source(value);
      };
    }

    if (is_regexp(source)) {
      return function (value) {
        return source.test(value);
      };
    }

    return function (value) {
      return value === source;
    };
  }

  return toMatcher;
}

/* harmony default export */ var to_matcher = (src_shared.inited ? src_shared.module.utilToMatcher : src_shared.module.utilToMatcher = to_matcher_init());
// CONCATENATED MODULE: ./src/util/matches.js



function matches_init() {
  "use strict";

  function matches(array, pattern) {
    var matcher;

    for (var _i = 0, _length = array == null ? 0 : array.length; _i < _length; _i++) {
      var value = array[_i];

      if (matcher === void 0) {
        matcher = to_matcher(pattern);
      }

      if (matcher(value)) {
        return true;
      }
    }

    return false;
  }

  return matches;
}

/* harmony default export */ var util_matches = (src_shared.inited ? src_shared.module.utilMatches : src_shared.module.utilMatches = matches_init());
// CONCATENATED MODULE: ./src/util/parse-command.js


function parse_command_init() {
  "use strict";

  // Regexes in Depth: Advanced Quoted String Matching
  // http://blog.stevenlevithan.com/archives/match-quoted-string
  var parseRegExp = /(?:[^ "'\\]|\\.)*(["'])(?:(?!\1)[^\\]|\\.)*\1|(?:[^ "'\\]|\\.)+/g;

  function parseCommand(string) {
    var result = [];

    if (typeof string === "string") {
      var match;

      while ((match = parseRegExp.exec(string)) !== null) {
        result.push(match[0]);
      }
    }

    return result;
  }

  return parseCommand;
}

/* harmony default export */ var parse_command = (src_shared.inited ? src_shared.module.utilParseCommand : src_shared.module.utilParseCommand = parse_command_init());
// CONCATENATED MODULE: ./src/env/get-flags.js








function get_flags_init() {
  "use strict";

  function getFlags() {
    var commandArgs = parse_command(env.NODE_OPTIONS);

    if (Array.isArray(execArgv)) {
      commandArgs.push(...execArgv);
    }

    var flags = {};
    set_deferred(flags, "abortOnUncaughtException", function () {
      return util_matches(commandArgs, "--abort-on-uncaught-exception");
    });
    set_deferred(flags, "check", function () {
      return util_matches(commandArgs, /^(?:--check|-c)$/);
    });
    set_deferred(flags, "esModuleSpecifierResolution", function () {
      return last_arg_match(commandArgs, /^--es-module-specifier-resolution=(.+)$/);
    });
    set_deferred(flags, "eval", function () {
      return util_matches(commandArgs, /^(?:--eval|-e)$/);
    });
    set_deferred(flags, "experimentalJSONModules", function () {
      return util_matches(commandArgs, "--experimental-json-modules");
    });
    set_deferred(flags, "experimentalPolicy", function () {
      return util_matches(commandArgs, "--experimental-policy");
    });
    set_deferred(flags, "experimentalREPLAwait", function () {
      return util_matches(commandArgs, "--experimental-repl-await");
    });
    set_deferred(flags, "experimentalWorker", function () {
      return util_matches(commandArgs, "--experimental-worker");
    });
    set_deferred(flags, "exposeInternals", function () {
      return util_matches(commandArgs, /^--expose[-_]internals$/);
    });
    set_deferred(flags, "inspectBrk", function () {
      return util_matches(commandArgs, /^--(?:debug|inspect)-brk(?:=.+)?$/);
    });
    set_deferred(flags, "interactive", function () {
      return util_matches(commandArgs, /^(?:--interactive|-i)$/);
    });
    set_deferred(flags, "pendingDeprecation", function () {
      return util_matches(commandArgs, "--pending-deprecation");
    });
    set_deferred(flags, "preserveSymlinks", function () {
      return util_matches(commandArgs, "--preserve-symlinks");
    });
    set_deferred(flags, "preserveSymlinksMain", function () {
      return util_matches(commandArgs, "--preserve-symlinks-main");
    });
    set_deferred(flags, "print", function () {
      return util_matches(commandArgs, /^(?:--print|-pe?)$/);
    });
    set_deferred(flags, "type", function () {
      return last_arg_match(commandArgs, /^--type=(.+)$/);
    });
    set_deferred(flags, "inspect", function () {
      return flags.inspectBrk || util_matches(commandArgs, /^--(?:debug|inspect)(?:=.*)?$/);
    });
    set_deferred(flags, "preloadModules", function () {
      var flagRegExp = /^(?:--require|-r)$/;
      var length = commandArgs.length;
      var result = [];
      var i = -1;

      while (++i < length) {
        if (flagRegExp.test(commandArgs[i])) {
          result.push(strip_quotes(commandArgs[++i]));
        }
      }

      return result;
    });
    return flags;
  }

  return getFlags;
}

/* harmony default export */ var get_flags = (src_shared.inited ? src_shared.module.envGetFlags : src_shared.module.envGetFlags = get_flags_init());
// CONCATENATED MODULE: ./src/path/is-absolute.js





function is_absolute_init() {
  "use strict";

  var FORWARD_SLASH = char_code.FORWARD_SLASH;

  function isAbsolute(value) {
    if (typeof value !== "string" || value.length === 0) {
      return false;
    }

    if (value.charCodeAt(0) === FORWARD_SLASH) {
      var WIN32 = constant_env.WIN32; // Protocol relative URLs are not paths.

      var code1 = value.charCodeAt(1);

      if (!WIN32) {
        return code1 !== FORWARD_SLASH;
      }
    }

    return path_isAbsolute(value);
  }

  return isAbsolute;
}

/* harmony default export */ var is_absolute = (src_shared.inited ? src_shared.module.pathIsAbsolute : src_shared.module.pathIsAbsolute = is_absolute_init());
// CONCATENATED MODULE: ./src/env/is-win32.js



function is_win32_init() {
  "use strict";

  function isWin32() {
    return platform === "win32";
  }

  return isWin32;
}

/* harmony default export */ var is_win32 = (src_shared.inited ? src_shared.module.envIsWin32 : src_shared.module.envIsWin32 = is_win32_init());
// CONCATENATED MODULE: ./src/path/is-sep.js




function is_sep_init() {
  "use strict";

  var BACKWARD_SLASH = char_code.BACKWARD_SLASH,
      FORWARD_SLASH = char_code.FORWARD_SLASH;
  var WIN32 = is_win32();

  function isSep(value) {
    if (typeof value === "number") {
      return value === FORWARD_SLASH || WIN32 && value === BACKWARD_SLASH;
    }

    return value === "/" || WIN32 && value === "\\";
  }

  return isSep;
}

/* harmony default export */ var is_sep = (src_shared.inited ? src_shared.module.pathIsSep : src_shared.module.pathIsSep = is_sep_init());
// CONCATENATED MODULE: ./src/path/is-relative.js




function is_relative_init() {
  "use strict";

  var DOT = char_code.DOT;

  function isRelative(value) {
    if (typeof value !== "string") {
      return false;
    }

    var length = value.length;

    if (length === 0) {
      return false;
    }

    var code = value.charCodeAt(0);

    if (code !== DOT) {
      return false;
    }

    if (length === 1) {
      return true;
    }

    code = value.charCodeAt(1);

    if (code === DOT) {
      if (length === 2) {
        return true;
      }

      code = value.charCodeAt(2);
    }

    return is_sep(code);
  }

  return isRelative;
}

/* harmony default export */ var is_relative = (src_shared.inited ? src_shared.module.pathIsRelativePath : src_shared.module.pathIsRelativePath = is_relative_init());
// CONCATENATED MODULE: ./src/util/is-path.js




function is_path_init() {
  "use strict";

  function isPath(value) {
    if (typeof value !== "string" || value.length === 0) {
      return false;
    }

    return is_relative(value) || is_absolute(value);
  }

  return isPath;
}

/* harmony default export */ var is_path = (src_shared.inited ? src_shared.module.utilIsPath : src_shared.module.utilIsPath = is_path_init());
// CONCATENATED MODULE: ./node_modules/json-6/dist/index.mjs
function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var json6 = createCommonjsModule(function (module, exports) {

  const version = "1.1.1";
  const VALUE_UNDEFINED = -1;
  const VALUE_UNSET = 0;
  const VALUE_NULL = 1;
  const VALUE_TRUE = 2;
  const VALUE_FALSE = 3;
  const VALUE_STRING = 4;
  const VALUE_NUMBER = 5;
  const VALUE_OBJECT = 6;
  const VALUE_ARRAY = 7;
  const VALUE_NEG_NAN = 8;
  const VALUE_NAN = 9;
  const VALUE_NEG_INFINITY = 10;
  const VALUE_INFINITY = 11; // const VALUE_DATE = 12  // unused yet

  const VALUE_EMPTY = 13; // [,] makes an array with 'empty item'

  const WORD_POS_RESET = 0;
  const WORD_POS_TRUE_1 = 1;
  const WORD_POS_TRUE_2 = 2;
  const WORD_POS_TRUE_3 = 3;
  const WORD_POS_FALSE_1 = 5;
  const WORD_POS_FALSE_2 = 6;
  const WORD_POS_FALSE_3 = 7;
  const WORD_POS_FALSE_4 = 8;
  const WORD_POS_NULL_1 = 9;
  const WORD_POS_NULL_2 = 10;
  const WORD_POS_NULL_3 = 11;
  const WORD_POS_UNDEFINED_1 = 12;
  const WORD_POS_UNDEFINED_2 = 13;
  const WORD_POS_UNDEFINED_3 = 14;
  const WORD_POS_UNDEFINED_4 = 15;
  const WORD_POS_UNDEFINED_5 = 16;
  const WORD_POS_UNDEFINED_6 = 17;
  const WORD_POS_UNDEFINED_7 = 18;
  const WORD_POS_UNDEFINED_8 = 19;
  const WORD_POS_NAN_1 = 20;
  const WORD_POS_NAN_2 = 21;
  const WORD_POS_INFINITY_1 = 22;
  const WORD_POS_INFINITY_2 = 23;
  const WORD_POS_INFINITY_3 = 24;
  const WORD_POS_INFINITY_4 = 25;
  const WORD_POS_INFINITY_5 = 26;
  const WORD_POS_INFINITY_6 = 27;
  const WORD_POS_INFINITY_7 = 28;
  const WORD_POS_FIELD = 29;
  const WORD_POS_AFTER_FIELD = 30;
  const WORD_POS_END = 31;
  const CONTEXT_UNKNOWN = 0;
  const CONTEXT_IN_ARRAY = 1; // const CONTEXT_IN_OBJECT = 2

  const CONTEXT_OBJECT_FIELD = 3;
  const CONTEXT_OBJECT_FIELD_VALUE = 4;
  const contexts = [];

  function getContext() {
    return contexts.pop() || {
      context: CONTEXT_UNKNOWN,
      elements: null,
      element_array: null
    };
  }

  function dropContext(ctx) {
    contexts.push(ctx);
  }

  const buffers = [];

  function getBuffer() {
    let buf = buffers.pop();
    if (!buf) buf = {
      buf: null,
      n: 0
    };else buf.n = 0;
    return buf;
  }

  function dropBuffer(buf) {
    buffers.push(buf);
  }

  const JSON6 =  exports // istanbul ignore next
  ;
  /*
  let _DEBUG_LL = true;
  let _DEBUG_PARSING = true;
  let _DEBUG_PARSING_STACK = true;
  
  const log = function(type) {
  	if (type === '_DEBUG_PARSING' && !_DEBUG_PARSING) {
  		return;
  	}
  	if (type === '_DEBUG_PARSING_STACK' && !_DEBUG_PARSING_STACK) {
  		return;
  	}
  	if (type === '_DEBUG_LL' && !_DEBUG_LL) {
  		return;
  	}
  	console.log.apply(console, [].slice.call(arguments, 1));
  };
  */

  JSON6.escape = function (string) {
    let output = '';
    if (!string) return string;

    for (let n = 0; n < string.length; n++) {
      const ch = string[n];

      if (ch == '"' || ch == '\\' || ch == '`' || ch == '\'') {
        output += '\\';
      }

      output += ch;
    }

    return output;
  };

  JSON6.begin = function (cb, reviver) {
    const val = {
      name: null,
      // name of this value (if it's contained in an object)
      value_type: VALUE_UNSET,
      // value from above indiciating the type of this value
      string: '',
      // the string value of this value (strings and number types only)
      contains: null
    };
    const pos = {
      line: 1,
      col: 1
    };
    let n = 0;
    let word = WORD_POS_RESET,
        status = true,
        negative = false,
        result = null,
        elements = undefined,
        element_array = [],
        parse_context = CONTEXT_UNKNOWN,
        comment = 0,
        fromHex = false,
        decimal = false,
        exponent = false,
        exponent_sign = false,
        exponent_digit = false,
        gatheringStringFirstChar = null,
        gatheringString = false,
        gatheringNumber = false,
        stringEscape = false,
        cr_escaped = false,
        unicodeWide = false,
        stringUnicode = false,
        stringHex = false,
        hex_char = 0,
        hex_char_len = 0,
        completed = false;
    const context_stack = {
      first: null,
      last: null,
      saved: null,

      push(node) {
        let recover = this.saved;

        if (recover) {
          this.saved = recover.next;
          recover.node = node;
          recover.next = null;
          recover.prior = this.last;
        } else {
          recover = {
            node: node,
            next: null,
            prior: this.last
          };
        }

        if (!this.last) this.first = recover;
        this.last = recover;
      },

      pop() {
        const result = this.last;
        if (!(this.last = result.prior)) this.first = null;
        result.next = this.saved;
        this.saved = result;
        return result.node;
      }

    };
    const inQueue = {
      first: null,
      last: null,
      saved: null,

      push(node) {
        let recover = this.saved;

        if (recover) {
          this.saved = recover.next;
          recover.node = node;
          recover.next = null;
          recover.prior = this.last;
        } else {
          recover = {
            node: node,
            next: null,
            prior: this.last
          };
        }

        if (!this.last) this.first = recover;else this.last.next = recover;
        this.last = recover;
      },

      shift() {
        const result = this.first;
        if (!result) return null;
        this.first = result.next;
        if (!this.first) this.last = null;
        result.next = this.saved;
        this.saved = result; // node is in saved...

        return result.node;
      },

      unshift(node) {
        // usage in this module, recover will ALWAYS have a saved to use.
        const recover = this.saved; //if( recover ) {

        this.saved = recover.next;
        recover.node = node;
        recover.next = this.first;
        recover.prior = null; //} else { recover = { node : node, next : this.first, prior : null }; }

        if (!this.first) this.last = recover;
        this.first = recover;
      }

    };

    function throwEndError(leader
    /* , c */
    ) {
      throw new Error(`${leader} at ${n} [${pos.line}:${pos.col}]`);
    }

    return {
      finalError() {
        if (comment !== 0) {
          // most of the time everything's good.
          switch (comment) {
            case 1:
              return throwEndError("Comment began at end of document");

            case 2:
              console.log("Warning: '//' comment without end of line ended document");
              break;

            case 3:
              return throwEndError("Open comment '/*' is missing close at end of document");

            case 4:
              return throwEndError("Incomplete '/* *' close at end of document");
          }
        }

        if (gatheringString) throwEndError("Incomplete string");
      },

      value() {
        this.finalError();
        const r = result;
        result = undefined;
        return r;
      },

      reset() {
        word = WORD_POS_RESET;
        status = true;
        if (inQueue.last) inQueue.last.next = inQueue.save;
        inQueue.save = inQueue.first;
        inQueue.first = inQueue.last = null;
        if (context_stack.last) context_stack.last.next = context_stack.save;
        context_stack.save = inQueue.first;
        context_stack.first = context_stack.last = null; //= [];

        element_array = null;
        elements = undefined;
        parse_context = CONTEXT_UNKNOWN;
        val.value_type = VALUE_UNSET;
        val.name = null;
        val.string = '';
        pos.line = 1;
        pos.col = 1;
        negative = false;
        comment = 0;
        completed = false;
        gatheringString = false;
        stringEscape = false; // string stringEscape intro

        cr_escaped = false; // carraige return escaped
        //stringUnicode = false;  // reading \u
        //unicodeWide = false;  // reading \u{} in string
        //stringHex = false;  // reading \x in string
      },

      write(msg) {
        let retcode;
        if (msg !== undefined && typeof msg !== "string") msg = String(msg);
        if (!status) throw new Error("Parser is in an error state, please reset.");

        for (retcode = this._write(msg, false); retcode > 0; retcode = this._write()) {
          this.finalError();
          if (typeof reviver === 'function') (function walk(holder, key) {
            const value = holder[key];

            if (value && typeof value === 'object') {
              for (const k in value) {
                if (Object.prototype.hasOwnProperty.call(value, k)) {
                  const v = walk(value, k);

                  if (v !== undefined) {
                    value[k] = v;
                  } else {
                    delete value[k];
                  }
                }
              }
            }

            return reviver.call(holder, key, value);
          })({
            '': result
          }, '');
          cb(result);
          result = undefined;
          if (retcode < 2) break;
        }

        if (retcode) this.finalError();
      },

      _write(msg, complete_at_end) {
        let input;
        let buf;
        let retval = 0;

        function throwError(leader, c) {
          throw new Error(`${leader} '${String.fromCodePoint(c)}' unexpected at ${n} (near '${buf.substr(n > 4 ? n - 4 : 0, n > 4 ? 3 : n - 1)}[${String.fromCodePoint(c)}]${buf.substr(n, 10)}') [${pos.line}:${pos.col}]`);
        }

        function RESET_VAL() {
          val.value_type = VALUE_UNSET;
          val.string = '';
        }

        function arrayPush() {
          switch (val.value_type) {
            case VALUE_NUMBER:
              element_array.push((negative ? -1 : 1) * Number(val.string));
              break;

            case VALUE_STRING:
              element_array.push(val.string);
              break;

            case VALUE_TRUE:
              element_array.push(true);
              break;

            case VALUE_FALSE:
              element_array.push(false);
              break;

            case VALUE_NEG_NAN:
              element_array.push(-NaN);
              break;

            case VALUE_NAN:
              element_array.push(NaN);
              break;

            case VALUE_NEG_INFINITY:
              element_array.push(-Infinity);
              break;

            case VALUE_INFINITY:
              element_array.push(Infinity);
              break;

            case VALUE_NULL:
              element_array.push(null);
              break;

            case VALUE_UNDEFINED:
              element_array.push(undefined);
              break;

            case VALUE_EMPTY:
              element_array.push(undefined);
              delete element_array[element_array.length - 1];
              break;

            case VALUE_OBJECT:
              element_array.push(val.contains);
              break;

            case VALUE_ARRAY:
              element_array.push(val.contains);
              break;
          }
        }

        function objectPush() {
          switch (val.value_type) {
            case VALUE_NUMBER:
              elements[val.name] = (negative ? -1 : 1) * Number(val.string);
              break;

            case VALUE_STRING:
              elements[val.name] = val.string;
              break;

            case VALUE_TRUE:
              elements[val.name] = true;
              break;

            case VALUE_FALSE:
              elements[val.name] = false;
              break;

            case VALUE_NEG_NAN:
              elements[val.name] = -NaN;
              break;

            case VALUE_NAN:
              elements[val.name] = NaN;
              break;

            case VALUE_NEG_INFINITY:
              elements[val.name] = -Infinity;
              break;

            case VALUE_INFINITY:
              elements[val.name] = Infinity;
              break;

            case VALUE_NULL:
              elements[val.name] = null;
              break;

            case VALUE_UNDEFINED:
              elements[val.name] = undefined;
              break;

            case VALUE_OBJECT:
              elements[val.name] = val.contains;
              break;

            case VALUE_ARRAY:
              elements[val.name] = val.contains;
              break;
          }
        }

        function gatherString(start_c) {
          let retval = 0;

          while (retval == 0 && n < buf.length) {
            let str = buf.charAt(n);
            const cInt = buf.codePointAt(n++);

            if (cInt >= 0x10000) {
              str += buf.charAt(n);
              n++;
            } //console.log( "gathering....", stringEscape, str, cInt, unicodeWide, stringHex, stringUnicode, hex_char_len );


            pos.col++;

            if (cInt == start_c) {
              //( cInt == 34/*'"'*/ ) || ( cInt == 39/*'\''*/ ) || ( cInt == 96/*'`'*/ ) )
              if (stringEscape) {
                if (stringHex) throwError("Incomplete hexidecimal sequence", cInt);else if (unicodeWide) throwError("Incomplete long unicode sequence", cInt);else if (stringUnicode) throwError("Incomplete unicode sequence", cInt);

                if (cr_escaped) {
                  cr_escaped = false; // \\ \r  '  :end string, the backslash was used for \r

                  retval = 1; // complete string.
                } else val.string += str; // escaped start quote


                stringEscape = false;
              } else {
                // quote matches, not escaped, and not processing escape...
                retval = 1;
              }
            } else if (stringEscape) {
              if (unicodeWide) {
                if (cInt == 125
                /*'}'*/
                ) {
                    val.string += String.fromCodePoint(hex_char);
                    unicodeWide = false;
                    stringUnicode = false;
                    stringEscape = false;
                    continue;
                  }

                hex_char *= 16;
                if (cInt >= 48
                /*'0'*/
                && cInt <= 57
                /*'9'*/
                ) hex_char += cInt - 0x30;else if (cInt >= 65
                /*'A'*/
                && cInt <= 70
                /*'F'*/
                ) hex_char += cInt - 65 + 10;else if (cInt >= 97
                /*'a'*/
                && cInt <= 102
                /*'f'*/
                ) hex_char += cInt - 97 + 10;else {
                  throwError("(escaped character, parsing hex of \\u)", cInt);
                }
                continue;
              } else if (stringHex || stringUnicode) {
                if (hex_char_len === 0 && cInt === 123
                /*'{'*/
                ) {
                    unicodeWide = true;
                    continue;
                  }

                hex_char *= 16;
                if (cInt >= 48
                /*'0'*/
                && cInt <= 57
                /*'9'*/
                ) hex_char += cInt - 0x30;else if (cInt >= 65
                /*'A'*/
                && cInt <= 70
                /*'F'*/
                ) hex_char += cInt - 65 + 10;else if (cInt >= 97
                /*'a'*/
                && cInt <= 102
                /*'f'*/
                ) hex_char += cInt - 97 + 10;else {
                  throwError(stringUnicode ? "(escaped character, parsing hex of \\u)" : "(escaped character, parsing hex of \\x)", cInt);
                }
                hex_char_len++;

                if (stringUnicode) {
                  if (hex_char_len == 4) {
                    val.string += String.fromCodePoint(hex_char);
                    stringUnicode = false;
                    stringEscape = false;
                  }
                } else if (hex_char_len == 2) {
                  val.string += String.fromCodePoint(hex_char);
                  stringHex = false;
                  stringEscape = false;
                }

                continue;
              }

              switch (cInt) {
                case 13
                /*'\r'*/
                :
                  cr_escaped = true;
                  pos.col = 1;
                  continue;

                case 0x2028: // LS (Line separator)

                case 0x2029:
                  // PS (paragraph separator)
                  pos.col = 1;
                // no return to get newline reset, so reset line pos.
                // Fallthrough

                case 10
                /*'\n'*/
                :
                  if (cr_escaped) {
                    // \\ \r \n
                    cr_escaped = false;
                  } else {
                    // \\ \n
                    pos.col = 1;
                  }

                  pos.line++;
                  break;

                case 116
                /*'t'*/
                :
                  val.string += '\t';
                  break;

                case 98
                /*'b'*/
                :
                  val.string += '\b';
                  break;

                case 48
                /*'0'*/
                :
                  val.string += '\0';
                  break;

                case 110
                /*'n'*/
                :
                  val.string += '\n';
                  break;

                case 114
                /*'r'*/
                :
                  val.string += '\r';
                  break;

                case 102
                /*'f'*/
                :
                  val.string += '\f';
                  break;

                case 120
                /*'x'*/
                :
                  stringHex = true;
                  hex_char_len = 0;
                  hex_char = 0;
                  continue;

                case 117
                /*'u'*/
                :
                  stringUnicode = true;
                  hex_char_len = 0;
                  hex_char = 0;
                  continue;

                default:
                  val.string += str;
                  break;
              } //console.log( "other..." );


              stringEscape = false;
            } else if (cInt === 92
            /*'\\'*/
            ) {
                stringEscape = true;
              } else {
              if (cr_escaped) {
                cr_escaped = false; // \\ \r <any other character>

                pos.line++;
                pos.col = 2; // newline, plus one character.
              }

              val.string += str;
            }
          }

          return retval;
        }

        function collectNumber() {
          let _n;

          while ((_n = n) < buf.length) {
            const str = buf.charAt(_n);
            const cInt = buf.codePointAt(n++);

            if (cInt >= 0x10000) {
              throwError("fault while parsing number;", cInt);
            } //log('_DEBUG_PARSING', "in getting number:", n, cInt, String.fromCodePoint(cInt) );


            if (cInt == 95
            /*_*/
            ) continue;
            pos.col++; // leading zeros should be forbidden.

            if (cInt >= 48
            /*'0'*/
            && cInt <= 57
            /*'9'*/
            ) {
                if (exponent) {
                  exponent_digit = true;
                }

                val.string += str;
              } else if (cInt == 45
            /*'-'*/
            || cInt == 43
            /*'+'*/
            ) {
                if (val.string.length == 0 || exponent && !exponent_sign && !exponent_digit) {
                  val.string += str;
                  exponent_sign = true;
                } else {
                  status = false;
                  throwError("fault while parsing number;", cInt); // break;
                }
              } else if (cInt == 46
            /*'.'*/
            ) {
                if (!decimal && !fromHex && !exponent) {
                  val.string += str;
                  decimal = true;
                } else {
                  status = false;
                  throwError("fault while parsing number;", cInt); // break;
                }
              } else if (cInt == 120
            /*'x'*/
            || cInt == 98
            /*'b'*/
            || cInt == 111
            /*'o'*/
            || cInt == 88
            /*'X'*/
            || cInt == 66
            /*'B'*/
            || cInt == 79
            /*'O'*/
            ) {
                // hex conversion.
                if (!fromHex && val.string == '0') {
                  fromHex = true;
                  val.string += str;
                } else {
                  status = false;
                  throwError("fault while parsing number;", cInt); // break;
                }
              } else if (cInt == 101
            /*'e'*/
            || cInt == 69
            /*'E'*/
            ) {
              if (!exponent) {
                val.string += str;
                exponent = true;
              } else {
                status = false;
                throwError("fault while parsing number;", cInt); // break;
              }
            } else {
              if (cInt == 32
              /*' '*/
              || cInt == 160
              /* &nbsp */
              || cInt == 13 || cInt == 10 || cInt == 9 || cInt == 0xFEFF || cInt == 44
              /*','*/
              || cInt == 125
              /*'}'*/
              || cInt == 93
              /*']'*/
              || cInt == 58
              /*':'*/
              ) {
                  break;
                } else {
                if (complete_at_end) {
                  status = false;
                  throwError("fault while parsing number;", cInt);
                }

                break;
              }
            }
          }

          n = _n;

          if (!complete_at_end && n == buf.length) {
            gatheringNumber = true;
          } else {
            gatheringNumber = false;
            val.value_type = VALUE_NUMBER;

            if (parse_context == CONTEXT_UNKNOWN) {
              completed = true;
            }
          }
        }

        if (!status) return -1;

        if (msg && msg.length) {
          input = getBuffer();
          input.buf = msg;
          inQueue.push(input);
        } else {
          if (gatheringNumber) {
            //console.log( "Force completed.")
            gatheringNumber = false;
            val.value_type = VALUE_NUMBER;

            if (parse_context == CONTEXT_UNKNOWN) {
              completed = true;
            } else {
              throw new Error("context stack is not empty at flush");
            }

            retval = 1; // if returning buffers, then obviously there's more in this one.
          }
        }

        while (status && (input = inQueue.shift())) {
          n = input.n;
          buf = input.buf;

          if (gatheringString) {
            const string_status = gatherString(gatheringStringFirstChar);

            if (string_status > 0) {
              gatheringString = false;
              val.value_type = VALUE_STRING;
            }
          }

          if (gatheringNumber) {
            collectNumber();
          }

          while (!completed && status && n < buf.length) {
            let str = buf.charAt(n);
            const cInt = buf.codePointAt(n++);

            if (cInt >= 0x10000) {
              str += buf.charAt(n);
              n++;
            } //// log('_DEBUG_PARSING', "parsing at ", cInt, str );
            //log('_DEBUG_LL', "processing: ", cInt, str, pos, comment, parse_context, word, val );


            pos.col++;

            if (comment) {
              // '/'
              if (comment == 1) {
                // '/'
                if (cInt == 42
                /*'*'*/
                ) {
                    comment = 3;
                  } // '/*'
                else if (cInt != 47
                  /*'/'*/
                  ) {
                      // '//'(NOT)
                      throwError("fault while parsing;", cInt);
                    } else comment = 2; // '//' (valid)

              } else if (comment == 2) {
                // '// ...'
                if (cInt == 10
                /*'\n'*/
                || cInt == 13
                /*'\r'*/
                ) comment = 0;
              } else if (comment == 3) {
                // '/*... '
                if (cInt == 42
                /*'*'*/
                ) comment = 4;
              } else {
                // if( comment == 4 ) { // '/* ... *'
                if (cInt == 47
                /*'/'*/
                ) comment = 0;else comment = 3; // any other char, goto expect * to close */
              }

              continue;
            }

            switch (cInt) {
              case 47
              /*'/'*/
              :
                comment = 1;
                break;

              case 123
              /*'{'*/
              :
                if (word == WORD_POS_FIELD || word == WORD_POS_AFTER_FIELD || parse_context == CONTEXT_OBJECT_FIELD && word == WORD_POS_RESET) {
                  throwError("fault while parsing; getting field name unexpected ", cInt); // break;
                }

                {
                  const old_context = getContext(); //log('_DEBUG_PARSING', "Begin a new object; previously pushed into elements; but wait until trailing comma or close previously:%d", val.value_type );

                  val.value_type = VALUE_OBJECT;
                  const tmpobj = {};
                  if (parse_context == CONTEXT_UNKNOWN) result = elements = tmpobj;
                  old_context.context = parse_context;
                  old_context.elements = elements;
                  old_context.element_array = element_array;
                  old_context.name = val.name;
                  elements = tmpobj; //log('_DEBUG_PARSING_STACK',"push context (open object): ", context_stack.length );

                  context_stack.push(old_context);
                  RESET_VAL();
                  parse_context = CONTEXT_OBJECT_FIELD;
                }
                break;

              case 91
              /*'['*/
              :
                if (parse_context == CONTEXT_OBJECT_FIELD || word == WORD_POS_FIELD || word == WORD_POS_AFTER_FIELD) {
                  throwError("Fault while parsing; while getting field name unexpected", cInt); // break;
                }

                if (val.value_type == VALUE_UNSET || val.value_type == VALUE_UNDEFINED) {
                  const old_context = getContext(); //log('_DEBUG_PARSING', "Begin a new array; previously pushed into elements; but wait until trailing comma or close previously:%d", val.value_type );

                  val.value_type = VALUE_ARRAY;
                  const tmparr = [];
                  if (parse_context == CONTEXT_UNKNOWN) result = element_array = tmparr; //else if( parse_context == CONTEXT_IN_ARRAY )
                  //    element_array.push( tmparr );
                  else if (parse_context == CONTEXT_OBJECT_FIELD_VALUE) elements[val.name] = tmparr;
                  old_context.context = parse_context;
                  old_context.elements = elements;
                  old_context.element_array = element_array;
                  old_context.name = val.name;
                  element_array = tmparr; //log('_DEBUG_PARSING_STACK', "push context (open array): ", context_stack.length );

                  context_stack.push(old_context);
                  RESET_VAL();
                  parse_context = CONTEXT_IN_ARRAY;
                } else {
                  throwError("Unexpected array open after previous value", cInt);
                }

                break;

              case 58
              /*':'*/
              :
                ////log('_DEBUG_PARSING', "colon context:", parse_context );
                if (parse_context == CONTEXT_OBJECT_FIELD) {
                  word = WORD_POS_RESET;
                  val.name = val.string;
                  val.string = '';
                  parse_context = CONTEXT_OBJECT_FIELD_VALUE;
                  val.value_type = VALUE_UNSET;
                } else {
                  if (parse_context == CONTEXT_IN_ARRAY) throwError("(in array, got colon out of string):parsing fault;", cInt);else throwError("(outside any object, got colon out of string):parsing fault;", cInt);
                }

                break;

              case 125
              /*'}'*/
              :
                ////log('_DEBUG_PARSING', "close bracket context:", word, parse_context );
                if (word == WORD_POS_END) {
                  // allow starting a new word
                  word = WORD_POS_RESET;
                } // coming back after pushing an array or sub-object will reset the context to FIELD, so an end with a field should still push value.


                if (parse_context == CONTEXT_OBJECT_FIELD) {
                  //log('_DEBUG_PARSING', "close object; empty object %d", val.value_type );
                  //RESET_VAL();
                  val.value_type = VALUE_OBJECT;
                  val.contains = elements;
                  const old_context = context_stack.pop(); //log('_DEBUG_PARSING_STACK',"object pop stack (close obj)", context_stack.length, old_context );

                  val.name = old_context.name;
                  parse_context = old_context.context; // this will restore as IN_ARRAY or OBJECT_FIELD

                  elements = old_context.elements;
                  element_array = old_context.element_array;
                  dropContext(old_context);

                  if (parse_context == CONTEXT_UNKNOWN) {
                    completed = true;
                  }
                } else if (parse_context == CONTEXT_OBJECT_FIELD_VALUE) {
                  // first, add the last value
                  //log('_DEBUG_PARSING', "close object; push item '%s' %d", val.name, val.value_type );
                  if (val.value_type != VALUE_UNSET) {
                    objectPush();
                  } else {
                    throwError("Fault while parsing field value, close with no value", cInt);
                  }

                  val.value_type = VALUE_OBJECT;
                  val.contains = elements;
                  const old_context = context_stack.pop(); //log('_DEBUG_PARSING_STACK',"object pop stack (close object)", context_stack.length, old_context );

                  val.name = old_context.name;
                  parse_context = old_context.context; // this will restore as IN_ARRAY or OBJECT_FIELD

                  elements = old_context.elements;
                  element_array = old_context.element_array;
                  dropContext(old_context);

                  if (parse_context == CONTEXT_UNKNOWN) {
                    completed = true;
                  }
                } else {
                  throwError("Fault while parsing; unexpected", cInt);
                }

                negative = false;
                break;

              case 93
              /*']'*/
              :
                if (word == WORD_POS_END) word = WORD_POS_RESET;

                if (parse_context == CONTEXT_IN_ARRAY) {
                  //log('_DEBUG_PARSING', "close array, push last element: %d", val.value_type );
                  if (val.value_type != VALUE_UNSET) {
                    arrayPush();
                  }

                  val.value_type = VALUE_ARRAY;
                  val.contains = element_array;
                  {
                    const old_context = context_stack.pop(); //log('_DEBUG_PARSING_STACK',"object pop stack (close array)", context_stack.length );

                    val.name = old_context.name;
                    parse_context = old_context.context;
                    elements = old_context.elements;
                    element_array = old_context.element_array;
                    dropContext(old_context);
                  }

                  if (parse_context == CONTEXT_UNKNOWN) {
                    completed = true;
                  }
                } else {
                  throwError(`bad context ${parse_context}; fault while parsing`, cInt); // fault
                }

                negative = false;
                break;

              case 44
              /*','*/
              :
                if (word == WORD_POS_END) word = WORD_POS_RESET; // allow collect new keyword
                //log('_DEBUG_PARSING', "comma context:", parse_context, val );

                if (parse_context == CONTEXT_IN_ARRAY) {
                  if (val.value_type == VALUE_UNSET) val.value_type = VALUE_EMPTY; // in an array, elements after a comma should init as undefined...
                  //log('_DEBUG_PARSING', "back in array; push item %d", val.value_type );

                  arrayPush();
                  RESET_VAL(); // undefined allows [,,,] to be 4 values and [1,2,3,] to be 4 values with an undefined at end.
                } else if (parse_context == CONTEXT_OBJECT_FIELD_VALUE) {
                  // after an array value, it will have returned to OBJECT_FIELD anyway
                  //log('_DEBUG_PARSING', "comma after field value, push field to object: %s", val.name );
                  parse_context = CONTEXT_OBJECT_FIELD;

                  if (val.value_type != VALUE_UNSET) {
                    objectPush();
                    RESET_VAL();
                  } else throwError("Unexpected comma after object field name", cInt);
                } else {
                  status = false;
                  throwError("bad context; excessive commas while parsing;", cInt); // fault
                }

                negative = false;
                break;

              default:
                if (parse_context == CONTEXT_OBJECT_FIELD) {
                  switch (cInt) {
                    case 96: //'`':

                    case 34: //'"':

                    case 39:
                      //'\'':
                      if (word == WORD_POS_RESET) {
                        if (val.value_type != VALUE_UNSET) throwError("String begin after previous value", cInt);
                        const string_status = gatherString(cInt); //log('_DEBUG_PARSING', "string gather for object field name :", val.string, string_status );

                        if (string_status) {
                          val.value_type = VALUE_STRING;
                        } else {
                          gatheringStringFirstChar = cInt;
                          gatheringString = true;
                        }
                      } else {
                        throwError("fault while parsing; quote not at start of field name", cInt);
                      }

                      break;

                    case 10:
                      //'\n':
                      pos.line++;
                      pos.col = 1;
                    // fall through to normal space handling - just updated line/col position

                    case 13: //'\r':

                    case 32: //' ':

                    case 160: //&nbsp:

                    case 9: //'\t':

                    case 0xFEFF:
                      // ZWNBS is WS though
                      if (word == WORD_POS_END) {
                        // allow collect new keyword
                        word = WORD_POS_RESET;
                      } else if (word == WORD_POS_FIELD) {
                        word = WORD_POS_AFTER_FIELD;
                      } // skip whitespace


                      break;

                    default:
                      if (word == WORD_POS_AFTER_FIELD) {
                        status = false;
                        throwError("fault while parsing; character unexpected", cInt);
                      }

                      if (word == WORD_POS_RESET) word = WORD_POS_FIELD;
                      val.string += str;
                      break;
                    // default
                  }
                } else switch (cInt) {
                  case 96: //'`':

                  case 34: //'"':

                  case 39:
                    {
                      //'\'':
                      if (val.value_type === VALUE_UNSET) {
                        const string_status = gatherString(cInt); //log('_DEBUG_PARSING', "string gather for object field value :", val.string, string_status, completed, input.n, buf.length );

                        if (string_status) {
                          val.value_type = VALUE_STRING;
                          word = WORD_POS_END;
                        } else {
                          gatheringStringFirstChar = cInt;
                          gatheringString = true;
                        }
                      } else throwError("String unexpected", cInt);

                      break;
                    }

                  case 10:
                    //'\n':
                    pos.line++;
                    pos.col = 1;
                  // Fallthrough

                  case 32: //' ':

                  case 160: // &nbsp

                  case 9: //'\t':

                  case 13: //'\r':

                  case 0xFEFF:
                    //'\uFEFF':
                    if (word == WORD_POS_END) {
                      word = WORD_POS_RESET;

                      if (parse_context == CONTEXT_UNKNOWN) {
                        completed = true;
                      }

                      break;
                    }

                    if (word !== WORD_POS_RESET) {
                      // breaking in the middle of gathering a keyword.
                      status = false;
                      throwError("fault parsing whitespace", cInt);
                    }

                    break;
                  //----------------------------------------------------------
                  //  catch characters for true/false/null/undefined which are values outside of quotes

                  case 116:
                    //'t':
                    if (word == WORD_POS_RESET) word = WORD_POS_TRUE_1;else if (word == WORD_POS_INFINITY_6) word = WORD_POS_INFINITY_7;else {
                      status = false;
                      throwError("fault parsing", cInt);
                    } // fault

                    break;

                  case 114:
                    //'r':
                    if (word == WORD_POS_TRUE_1) word = WORD_POS_TRUE_2;else {
                      status = false;
                      throwError("fault parsing", cInt);
                    } // fault

                    break;

                  case 117:
                    //'u':
                    if (word == WORD_POS_TRUE_2) word = WORD_POS_TRUE_3;else if (word == WORD_POS_NULL_1) word = WORD_POS_NULL_2;else if (word == WORD_POS_RESET) word = WORD_POS_UNDEFINED_1;else {
                      status = false;
                      throwError("fault parsing", cInt);
                    } // fault

                    break;

                  case 101:
                    //'e':
                    if (word == WORD_POS_TRUE_3) {
                      val.value_type = VALUE_TRUE;
                      word = WORD_POS_END;
                    } else if (word == WORD_POS_FALSE_4) {
                      val.value_type = VALUE_FALSE;
                      word = WORD_POS_END;
                    } else if (word == WORD_POS_UNDEFINED_3) word = WORD_POS_UNDEFINED_4;else if (word == WORD_POS_UNDEFINED_7) word = WORD_POS_UNDEFINED_8;else {
                      status = false;
                      throwError("fault parsing", cInt);
                    } // fault


                    break;

                  case 110:
                    //'n':
                    if (word == WORD_POS_RESET) word = WORD_POS_NULL_1;else if (word == WORD_POS_UNDEFINED_1) word = WORD_POS_UNDEFINED_2;else if (word == WORD_POS_UNDEFINED_6) word = WORD_POS_UNDEFINED_7;else if (word == WORD_POS_INFINITY_1) word = WORD_POS_INFINITY_2;else if (word == WORD_POS_INFINITY_4) word = WORD_POS_INFINITY_5;else {
                      status = false;
                      throwError("fault parsing", cInt);
                    } // fault

                    break;

                  case 100:
                    //'d':
                    if (word == WORD_POS_UNDEFINED_2) word = WORD_POS_UNDEFINED_3;else if (word == WORD_POS_UNDEFINED_8) {
                      val.value_type = VALUE_UNDEFINED;
                      word = WORD_POS_END;
                    } else {
                      status = false;
                      throwError("fault parsing", cInt);
                    } // fault

                    break;

                  case 105:
                    //'i':
                    if (word == WORD_POS_UNDEFINED_5) word = WORD_POS_UNDEFINED_6;else if (word == WORD_POS_INFINITY_3) word = WORD_POS_INFINITY_4;else if (word == WORD_POS_INFINITY_5) word = WORD_POS_INFINITY_6;else {
                      status = false;
                      throwError("fault parsing", cInt);
                    } // fault

                    break;

                  case 108:
                    //'l':
                    if (word == WORD_POS_NULL_2) word = WORD_POS_NULL_3;else if (word == WORD_POS_NULL_3) {
                      val.value_type = VALUE_NULL;
                      word = WORD_POS_END;
                    } else if (word == WORD_POS_FALSE_2) word = WORD_POS_FALSE_3;else {
                      status = false;
                      throwError("fault parsing", cInt);
                    } // fault

                    break;

                  case 102:
                    //'f':
                    if (word == WORD_POS_RESET) word = WORD_POS_FALSE_1;else if (word == WORD_POS_UNDEFINED_4) word = WORD_POS_UNDEFINED_5;else if (word == WORD_POS_INFINITY_2) word = WORD_POS_INFINITY_3;else {
                      status = false;
                      throwError("fault parsing", cInt);
                    } // fault

                    break;

                  case 97:
                    //'a':
                    if (word == WORD_POS_FALSE_1) word = WORD_POS_FALSE_2;else if (word == WORD_POS_NAN_1) word = WORD_POS_NAN_2;else {
                      status = false;
                      throwError("fault parsing", cInt);
                    } // fault

                    break;

                  case 115:
                    //'s':
                    if (word == WORD_POS_FALSE_3) word = WORD_POS_FALSE_4;else {
                      status = false;
                      throwError("fault parsing", cInt);
                    } // fault

                    break;

                  case 73:
                    //'I':
                    if (word == WORD_POS_RESET) word = WORD_POS_INFINITY_1;else {
                      status = false;
                      throwError("fault parsing", cInt);
                    } // fault

                    break;

                  case 78:
                    //'N':
                    if (word == WORD_POS_RESET) word = WORD_POS_NAN_1;else if (word == WORD_POS_NAN_2) {
                      val.value_type = negative ? VALUE_NEG_NAN : VALUE_NAN;
                      negative = false;
                      word = WORD_POS_END;
                    } else {
                      status = false;
                      throwError("fault parsing", cInt);
                    } // fault

                    break;

                  case 121:
                    //'y':
                    if (word == WORD_POS_INFINITY_7) {
                      val.value_type = negative ? VALUE_NEG_INFINITY : VALUE_INFINITY;
                      negative = false;
                      word = WORD_POS_END;
                    } else {
                      status = false;
                      throwError("fault parsing", cInt);
                    } // fault


                    break;

                  case 45:
                    //'-':
                    if (word == WORD_POS_RESET) negative = !negative;else {
                      status = false;
                      throwError("fault parsing", cInt);
                    } // fault

                    break;

                  case 43:
                    //'+':
                    if (word !== WORD_POS_RESET) {
                      status = false;
                      throwError("fault parsing", cInt);
                    } // fault


                    break;
                  //
                  //----------------------------------------------------------

                  default:
                    if (cInt >= 48
                    /*'0'*/
                    && cInt <= 57
                    /*'9'*/
                    || cInt == 43
                    /*'+'*/
                    || cInt == 46
                    /*'.'*/
                    || cInt == 45
                    /*'-'*/
                    ) {
                      fromHex = false;
                      exponent = false;
                      exponent_sign = false;
                      exponent_digit = false;
                      decimal = false;
                      val.string = str;
                      input.n = n;
                      collectNumber();
                    } else {
                      status = false;
                      throwError("fault parsing", cInt);
                    }

                    break;
                  // default
                }

                break;
              // default of high level switch
            }

            if (completed) {
              if (word == WORD_POS_END) {
                word = WORD_POS_RESET;
              }

              break;
            }
          }

          if (n == buf.length) {
            dropBuffer(input);

            if (gatheringString || gatheringNumber || parse_context == CONTEXT_OBJECT_FIELD) {
              retval = 0;
            } else {
              if (parse_context == CONTEXT_UNKNOWN && (val.value_type != VALUE_UNSET || result)) {
                completed = true;
                retval = 1;
              }
            }
          } else {
            // put these back into the stack.
            input.n = n;
            inQueue.unshift(input);
            retval = 2; // if returning buffers, then obviously there's more in this one.
          }

          if (completed) break;
        }

        if (completed && val.value_type != VALUE_UNSET) {
          switch (val.value_type) {
            case VALUE_NUMBER:
              result = (negative ? -1 : 1) * Number(val.string);
              break;

            case VALUE_STRING:
              result = val.string;
              break;

            case VALUE_TRUE:
              result = true;
              break;

            case VALUE_FALSE:
              result = false;
              break;

            case VALUE_NULL:
              result = null;
              break;

            case VALUE_UNDEFINED:
              result = undefined;
              break;

            case VALUE_NAN:
              result = NaN;
              break;

            case VALUE_NEG_NAN:
              result = -NaN;
              break;

            case VALUE_INFINITY:
              result = Infinity;
              break;

            case VALUE_NEG_INFINITY:
              result = -Infinity;
              break;

            case VALUE_OBJECT:
              // never happens
              result = val.contains;
              break;

            case VALUE_ARRAY:
              // never happens
              result = val.contains;
              break;
          }

          negative = false;
          val.string = '';
          val.value_type = VALUE_UNSET;
        }

        completed = false;
        return retval;
      }

    };
  };

  const _parser = [Object.freeze(JSON6.begin())];
  let _parse_level = 0;

  JSON6.parse = function (msg, reviver) {
    //var parser = JSON6.begin();
    const parse_level = _parse_level++;
    if (_parser.length <= parse_level) _parser.push(Object.freeze(JSON6.begin()));
    const parser = _parser[parse_level];
    if (typeof msg !== "string") msg = String(msg);
    parser.reset();

    if (parser._write(msg, true) > 0) {
      const result = parser.value();
      if (typeof reviver === 'function') (function walk(holder, key) {
        const value = holder[key];

        if (value && typeof value === 'object') {
          for (const k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              const v = walk(value, k);

              if (v !== undefined) {
                value[k] = v;
              } else {
                delete value[k];
              }
            }
          }
        }

        return reviver.call(holder, key, value);
      })({
        '': result
      }, '');
      _parse_level--;
      return result;
    } else parser.finalError();

    return undefined;
  };

  JSON6.stringify = JSON.stringify; //---------------------------------------------------------------------------
  //  Stringify
  //---------------------------------------------------------------------------

  JSON6.stringifierActive = null;

  JSON6.stringifier = function () {
    const keywords = {
      ["true"]: true,
      ["false"]: false,
      ["null"]: null,
      ["NaN"]: NaN,
      ["Infinity"]: Infinity,
      ["undefined"]: undefined
    };
    let useQuote = '"';
    let ignoreNonEnumerable = false;
    return {
      stringify(o, r, s, as) {
        return stringify(this, o, r, s, as);
      },

      setQuote(q) {
        useQuote = q;
      },

      get ignoreNonEnumerable() {
        return ignoreNonEnumerable;
      },

      set ignoreNonEnumerable(val) {
        ignoreNonEnumerable = val;
      }

    };

    function getIdentifier(s) {
      if ("number" === typeof s && !isNaN(s)) {
        return ["'", s.toString(), "'"].join();
      }

      if (!s.length) return useQuote + useQuote; // should check also for if any non ident in string...

      return s in keywords
      /* [ "true","false","null","NaN","Infinity","undefined"].find( keyword=>keyword===s )*/
      || /([0-9-])/.test(s[0]) || /((\n|\r|\t)|[ #{}()<>!+\-*/.:,])/.test(s) ? useQuote + JSON6.escape(s) + useQuote : s;
    }

    function stringify(stringifier, object, replacer, space, asField) {
      if (object === undefined) return "undefined";
      if (object === null) return "null";
      let gap;
      let indent;
      let i;
      const spaceType = typeof space;
      const repType = typeof replacer;
      gap = "";
      indent = "";
      const stringifier_ = JSON6.stringifierActive;
      JSON6.stringifierActive = stringifier;

      if (!asField) {
        asField = "";
      } // If the space parameter is a number, make an indent string containing that
      // many spaces.


      if (spaceType === "number") {
        for (i = 0; i < space; i += 1) {
          indent += " ";
        } // If the space parameter is a string, it will be used as the indent string.

      } else if (spaceType === "string") {
        indent = space;
      } // If there is a replacer, it must be a function or an array.
      // Otherwise, throw an error.


      const rep = replacer;

      if (replacer && repType !== "function" && (repType !== "object" || typeof replacer.length !== "number")) {
        throw new Error("JSON6.stringify unknown replacer type.");
      }

      const r = str(asField, {
        [asField]: object
      });
      JSON6.stringifierActive = stringifier_; //DEBUG_STRINGIFY_OUTPUT && console.trace( "Stringify Result:", r );

      return r; // from https://github.com/douglascrockford/JSON-js/blob/master/json2.js#L181

      function str(key, holder) {
        // Produce a string from holder[key].
        let i; // The loop counter.

        let k; // The member key.

        let v; // The member value.

        let length;
        const mind = gap;
        let partial;
        let value = holder[key];
        if ("string" === typeof value) value = getIdentifier(value);

        if (value !== undefined && value !== null && typeof value === "object" && typeof toJSOX === "function") {
          // is encoding?
          gap += indent;
          gap = mind;
        } // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.


        if (typeof rep === "function") {
          value = rep.call(holder, key, value);
        } // What happens next depends on the value's type.


        switch (typeof value) {
          case "string":
            return value;

          case "number":
            return '' + value;
          //useQuote+JSOX.escape( value )+useQuote;

          case "boolean":
            return String(value);

          case "object":
            //_DEBUG_STRINGIFY && console.log( "ENTERING OBJECT EMISSION WITH:", v );
            //if( v ) return v;
            // Due to a specification blunder in ECMAScript, typeof null is "object",
            // so watch out for that case.
            if (!value) {
              return "null";
            } // Make an array to hold the partial results of stringifying this object value.


            gap += indent;
            partial = []; // If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === "object") {
              length = rep.length; //_DEBUG_STRINGIFY && console.log( "Working through replacer" );

              for (i = 0; i < length; i += 1) {
                if (typeof rep[i] === "string") {
                  k = rep[i];
                  v = str(k, value);

                  if (v) {
                    partial.push(getIdentifier(k) + (gap ? ": " : ":") + v);
                  }
                }
              }
            } else {
              // Otherwise, iterate through all of the keys in the object.
              const keys = []; //_DEBUG_STRINGIFY && console.log( "is something in something?", k, value );

              for (k in value) {
                if (ignoreNonEnumerable) if (!Object.prototype.propertyIsEnumerable.call(value, k)) {
                  //_DEBUG_STRINGIFY && console.log( "skipping non-enuerable?", k );
                  continue;
                } // sort properties into keys.

                if (Object.prototype.hasOwnProperty.call(value, k)) {
                  let n;

                  for (n = 0; n < keys.length; n++) if (keys[n] > k) {
                    keys.splice(n, 0, k);
                    break;
                  }

                  if (n === keys.length) keys.push(k);
                }
              } //_DEBUG_STRINGIFY && console.log( "Expanding object keys:", v, keys );


              for (let n = 0; n < keys.length; n++) {
                k = keys[n];

                if (Object.prototype.hasOwnProperty.call(value, k)) {
                  v = str(k, value);

                  if (v) {
                    partial.push(getIdentifier(k) + (gap ? ": " : ":") + v);
                  }
                }
              }
            } // Join all of the member texts together, separated with commas,
            // and wrap them in braces.
            //_DEBUG_STRINGIFY && console.log( "partial:", partial, protoConverter )


            v = '' + (partial.length === 0 ? "{}" : gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}");
            gap = mind; //_DEBUG_STRINGIFY && console.log(" Resulting phrase from this part is:", v );

            return v;
        }
      }
    }
  };

  JSON6.stringify = function (object, replacer, space) {
    const stringifier = JSON6.stringifier();
    return stringifier.stringify(object, replacer, space);
  };

  JSON6.version = version;
});

var lib = json6;

/* harmony default export */ var dist = (lib);

// CONCATENATED MODULE: ./src/util/quotify-json.js


function quotify_json_init() {
  "use strict";

  var booleanLookup = new Set(["false", "true"]);
  var quoteLookup = new Set(['"', "'"]);
  var unquotedRegExp = /(|[^a-zA-Z])([a-zA-Z]+)([^a-zA-Z]|)/g;

  function quotifyJSON(string) {
    if (typeof string !== "string" || string === "") {
      return string;
    }

    return string.replace(unquotedRegExp, function (match, prefix, value, suffix) {
      if (!quoteLookup.has(prefix) && !booleanLookup.has(value) && !quoteLookup.has(suffix)) {
        return prefix + '"' + value + '"' + suffix;
      }

      return match;
    });
  }

  return quotifyJSON;
}

/* harmony default export */ var quotify_json = (src_shared.inited ? src_shared.module.utilQuotifyJSON : src_shared.module.utilQuotifyJSON = quotify_json_init());
// CONCATENATED MODULE: ./src/util/parse-json6.js




function parse_json6_init() {
  "use strict";

  function parseJSON6(string) {
    return tryParse(string) || tryParse(quotify_json(string));
  }

  function tryParse(string) {
    if (typeof string === "string" && string.length) {
      try {
        return dist.parse(string);
      } catch (_unused) {}
    }

    return null;
  }

  return parseJSON6;
}

/* harmony default export */ var parse_json6 = (src_shared.inited ? src_shared.module.utilParseJSON6 : src_shared.module.utilParseJSON6 = parse_json6_init());
// CONCATENATED MODULE: ./src/util/strip-bom.js
// Based on `stripBOM()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/helpers.js



function strip_bom_init() {
  "use strict";

  var ZERO_WIDTH_NOBREAK_SPACE = char_code.ZERO_WIDTH_NOBREAK_SPACE;

  function stripBOM(string) {
    if (typeof string !== "string") {
      return "";
    }

    return string.charCodeAt(0) === ZERO_WIDTH_NOBREAK_SPACE ? string.slice(1) : string;
  }

  return stripBOM;
}

/* harmony default export */ var strip_bom = (src_shared.inited ? src_shared.module.utilStripBOM : src_shared.module.utilStripBOM = strip_bom_init());
// CONCATENATED MODULE: ./src/fs/read-file.js




function read_file_init() {
  "use strict";

  function readFile(filename, options) {
    var content = null;

    try {
      content = readFileSync(filename, options);
    } catch (_unused) {}

    if (content && options === "utf8") {
      return strip_bom(content);
    }

    return content;
  }

  return readFile;
}

/* harmony default export */ var read_file = (src_shared.inited ? src_shared.module.fsReadFile : src_shared.module.fsReadFile = read_file_init());
// CONCATENATED MODULE: ./src/env/get-options.js








function get_options_init() {
  "use strict";

  var APOSTROPHE = char_code.APOSTROPHE,
      LEFT_CURLY_BRACKET = char_code.LEFT_CURLY_BRACKET,
      QUOTE = char_code.QUOTE;

  function getOptions() {
    var ESM_OPTIONS = env && env.ESM_OPTIONS;

    if (typeof ESM_OPTIONS !== "string") {
      return null;
    }

    var options = ESM_OPTIONS.trim();

    if (is_path(options)) {
      options = read_file(path_resolve(options), "utf8");
      options = options === null ? "" : options.trim();
    }

    if (options === "") {
      return null;
    }

    var code0 = options.charCodeAt(0);

    if (code0 === APOSTROPHE || code0 === LEFT_CURLY_BRACKET || code0 === QUOTE) {
      options = parse_json6(options);
    }

    return options;
  }

  return getOptions;
}

/* harmony default export */ var get_options = (src_shared.inited ? src_shared.module.envGetOptions : src_shared.module.envGetOptions = get_options_init());
// CONCATENATED MODULE: ./src/builtin-ids.js




function builtin_ids_init() {
  "use strict";

  var ids = __non_webpack_module__.constructor.builtinModules;

  if (Array.isArray(ids) && Object.isFrozen(ids)) {
    ids = Array.from(ids);
  } else {
    var _getFlags = get_flags(),
        exposeInternals = _getFlags.exposeInternals;

    ids = [];

    for (var name in src_binding.natives) {
      if (exposeInternals) {
        if (name !== "internal/bootstrap_loaders" && name !== "internal/bootstrap/loaders") {
          ids.push(name);
        }
      } else if (!name.startsWith("internal/")) {
        ids.push(name);
      }
    }
  }

  return ids.sort();
}

/* harmony default export */ var builtin_ids = (src_shared.inited ? src_shared.module.builtinIds : src_shared.module.builtinIds = builtin_ids_init());
// CONCATENATED MODULE: ./src/builtin-lookup.js



function builtin_lookup_init() {
  "use strict";

  return new Set(builtin_ids);
}

/* harmony default export */ var builtin_lookup = (src_shared.inited ? src_shared.module.builtinLookup : src_shared.module.builtinLookup = builtin_lookup_init());
// CONCATENATED MODULE: ./src/env/has-inspector.js






function has_inspector_init() {
  "use strict";

  function hasInspector() {
    if (process_config.variables.v8_enable_inspector === 1) {
      return true;
    } // Use `safeRequire()` because an `ERR_INSPECTOR_NOT_AVAILABLE` error may
    // be thrown on initialization.


    return builtin_lookup.has("inspector") && is_object_like(safe_require("inspector"));
  }

  return hasInspector;
}

/* harmony default export */ var has_inspector = (src_shared.inited ? src_shared.module.envHasInspector : src_shared.module.envHasInspector = has_inspector_init());
// CONCATENATED MODULE: ./src/env/is-brave.js




function is_brave_init() {
  "use strict";

  function isBrave() {
    return has(process_versions, "Brave");
  }

  return isBrave;
}

/* harmony default export */ var is_brave = (src_shared.inited ? src_shared.module.envIsBrave : src_shared.module.envIsBrave = is_brave_init());
// CONCATENATED MODULE: ./src/util/is-own-path.js



function is_own_path_init() {
  "use strict";

  var PACKAGE_FILENAMES = esm.PACKAGE_FILENAMES;

  function isOwnPath(thePath) {
    if (typeof thePath === "string") {
      for (var _i = 0, _length = PACKAGE_FILENAMES == null ? 0 : PACKAGE_FILENAMES.length; _i < _length; _i++) {
        var filename = PACKAGE_FILENAMES[_i];

        if (thePath === filename) {
          return true;
        }
      }
    }

    return false;
  }

  return isOwnPath;
}

/* harmony default export */ var is_own_path = (src_shared.inited ? src_shared.module.utilIsOwnPath : src_shared.module.utilIsOwnPath = is_own_path_init());
// CONCATENATED MODULE: ./src/env/has-loader-module.js




function has_loader_module_init() {
  "use strict";

  function hasLoaderModule(modules) {
    return util_matches(modules, function ({
      filename
    }) {
      return is_own_path(filename);
    });
  }

  return hasLoaderModule;
}

/* harmony default export */ var has_loader_module = (src_shared.inited ? src_shared.module.envHasLoaderModule : src_shared.module.envHasLoaderModule = has_loader_module_init());
// CONCATENATED MODULE: ./src/env/is-internal.js


function is_internal_init() {
  "use strict";

  function isInternal() {
    return __non_webpack_module__.id.startsWith("internal/");
  }

  return isInternal;
}

/* harmony default export */ var is_internal = (src_shared.inited ? src_shared.module.envIsInternal : src_shared.module.envIsInternal = is_internal_init());
// CONCATENATED MODULE: ./src/root-module.js
var rootModule = __non_webpack_module__;
var _rootModule = rootModule,
    root_module_parent = _rootModule.parent;
var root_module_seen = new Set();

while (root_module_parent != null && !root_module_seen.has(root_module_parent)) {
  root_module_seen.add(root_module_parent);
  rootModule = root_module_parent;
  root_module_parent = rootModule.parent;
}

/* harmony default export */ var root_module = (rootModule);
// CONCATENATED MODULE: ./src/env/is-preloaded.js





function is_preloaded_init() {
  "use strict";

  function isPreloaded() {
    if (is_internal()) {
      return true;
    }

    return root_module.id === "internal/preload" && has_loader_module(root_module.children);
  }

  return isPreloaded;
}

/* harmony default export */ var is_preloaded = (src_shared.inited ? src_shared.module.envIsPreloaded : src_shared.module.envIsPreloaded = is_preloaded_init());
// CONCATENATED MODULE: ./src/env/is-check.js





function is_check_init() {
  "use strict";

  function isCheck() {
    var length = process_argv.length;
    return (length === 1 || length === 2) && get_flags().check && is_preloaded();
  }

  return isCheck;
}

/* harmony default export */ var is_check = (src_shared.inited ? src_shared.module.envIsCheck : src_shared.module.envIsCheck = is_check_init());
// CONCATENATED MODULE: ./src/env/is-cli.js




function is_cli_init() {
  "use strict";

  function isCLI() {
    return process_argv.length > 1 && is_preloaded();
  }

  return isCLI;
}

/* harmony default export */ var is_cli = (src_shared.inited ? src_shared.module.envIsCLI : src_shared.module.envIsCLI = is_cli_init());
// CONCATENATED MODULE: ./src/env/is-development.js



function is_development_init() {
  "use strict";

  function isDevelopment() {
    return env.NODE_ENV === "development";
  }

  return isDevelopment;
}

/* harmony default export */ var is_development = (src_shared.inited ? src_shared.module.envIsDevelopment : src_shared.module.envIsDevelopment = is_development_init());
// CONCATENATED MODULE: ./src/env/is-electron.js





function is_electron_init() {
  "use strict";

  function isElectron() {
    return has(process_versions, "electron") || is_brave();
  }

  return isElectron;
}

/* harmony default export */ var is_electron = (src_shared.inited ? src_shared.module.envIsElectron : src_shared.module.envIsElectron = is_electron_init());
// CONCATENATED MODULE: ./src/env/is-electron-renderer.js




function is_electron_renderer_init() {
  "use strict";

  function isElectronRenderer() {
    return process_type === "renderer" && is_electron();
  }

  return isElectronRenderer;
}

/* harmony default export */ var is_electron_renderer = (src_shared.inited ? src_shared.module.envIsElectronRenderer : src_shared.module.envIsElectronRenderer = is_electron_renderer_init());
// CONCATENATED MODULE: ./src/env/is-print.js





function is_print_init() {
  "use strict";

  function isPrint() {
    return process_argv.length === 1 && get_flags().print && is_preloaded();
  }

  return isPrint;
}

/* harmony default export */ var is_print = (src_shared.inited ? src_shared.module.envIsPrint : src_shared.module.envIsPrint = is_print_init());
// CONCATENATED MODULE: ./src/env/is-eval.js






function is_eval_init() {
  "use strict";

  function isEval() {
    if (is_print()) {
      return true;
    }

    if (process_argv.length !== 1 || !is_preloaded()) {
      return false;
    }

    var flags = get_flags();
    return flags.eval || !stdin.isTTY && !flags.interactive;
  }

  return isEval;
}

/* harmony default export */ var is_eval = (src_shared.inited ? src_shared.module.envIsEval : src_shared.module.envIsEval = is_eval_init());
// CONCATENATED MODULE: ./src/env/is-jasmine.js



function is_jasmine_init() {
  "use strict";

  var PACKAGE_PARENT_NAME = esm.PACKAGE_PARENT_NAME;

  function isJamine() {
    return PACKAGE_PARENT_NAME === "jasmine";
  }

  return isJamine;
}

/* harmony default export */ var is_jasmine = (src_shared.inited ? src_shared.module.envIsJamine : src_shared.module.envIsJamine = is_jasmine_init());
// CONCATENATED MODULE: ./src/env/is-ndb.js




function is_ndb_init() {
  "use strict";

  function isNdb() {
    return has(process_versions, "ndb");
  }

  return isNdb;
}

/* harmony default export */ var is_ndb = (src_shared.inited ? src_shared.module.envIsNdb : src_shared.module.envIsNdb = is_ndb_init());
// CONCATENATED MODULE: ./src/env/is-nyc.js




function is_nyc_init() {
  "use strict";

  function isNyc() {
    return has(env, "NYC_ROOT_ID");
  }

  return isNyc;
}

/* harmony default export */ var is_nyc = (src_shared.inited ? src_shared.module.envIsNyc : src_shared.module.envIsNyc = is_nyc_init());
// CONCATENATED MODULE: ./src/env/is-repl.js






function is_repl_init() {
  "use strict";

  function isREPL() {
    if (process_argv.length !== 1) {
      return false;
    }

    if (is_preloaded()) {
      return true;
    }

    return root_module.id === "<repl>" && root_module.filename === null && root_module.loaded === false && root_module.parent == null && has_loader_module(root_module.children);
  }

  return isREPL;
}

/* harmony default export */ var is_repl = (src_shared.inited ? src_shared.module.envIsREPL : src_shared.module.envIsREPL = is_repl_init());
// CONCATENATED MODULE: ./src/env/is-runkit.js




function is_runkit_init() {
  "use strict";

  function isRunkit() {
    return has(env, "RUNKIT_HOST");
  }

  return isRunkit;
}

/* harmony default export */ var is_runkit = (src_shared.inited ? src_shared.module.envIsRunkit : src_shared.module.envIsRunkit = is_runkit_init());
// CONCATENATED MODULE: ./src/env/is-tink.js



function is_tink_init() {
  "use strict";

  var PACKAGE_PARENT_NAME = esm.PACKAGE_PARENT_NAME;

  function isTink() {
    return PACKAGE_PARENT_NAME === "tink";
  }

  return isTink;
}

/* harmony default export */ var is_tink = (src_shared.inited ? src_shared.module.envIsTink : src_shared.module.envIsTink = is_tink_init());
// CONCATENATED MODULE: ./src/env/is-yarn-pnp.js




function is_yarn_pnp_init() {
  "use strict";

  function isYarnPnP() {
    return has(process_versions, "pnp");
  }

  return isYarnPnP;
}

/* harmony default export */ var is_yarn_pnp = (src_shared.inited ? src_shared.module.envIsYarnPnP : src_shared.module.envIsYarnPnP = is_yarn_pnp_init());
// CONCATENATED MODULE: ./src/constant/env.js






















var ENV = {};
set_deferred(ENV, "BRAVE", is_brave);
set_deferred(ENV, "CHECK", is_check);
set_deferred(ENV, "CLI", is_cli);
set_deferred(ENV, "DEVELOPMENT", is_development);
set_deferred(ENV, "ELECTRON", is_electron);
set_deferred(ENV, "ELECTRON_RENDERER", is_electron_renderer);
set_deferred(ENV, "EVAL", is_eval);
set_deferred(ENV, "FLAGS", get_flags);
set_deferred(ENV, "HAS_INSPECTOR", has_inspector);
set_deferred(ENV, "INTERNAL", is_internal);
set_deferred(ENV, "JASMINE", is_jasmine);
set_deferred(ENV, "NDB", is_ndb);
set_deferred(ENV, "NYC", is_nyc);
set_deferred(ENV, "OPTIONS", get_options);
set_deferred(ENV, "PRELOADED", is_preloaded);
set_deferred(ENV, "PRINT", is_print);
set_deferred(ENV, "REPL", is_repl);
set_deferred(ENV, "RUNKIT", is_runkit);
set_deferred(ENV, "TINK", is_tink);
set_deferred(ENV, "WIN32", is_win32);
set_deferred(ENV, "YARN_PNP", is_yarn_pnp);
/* harmony default export */ var constant_env = (ENV);
// CONCATENATED MODULE: ./src/fs/stat-sync.js





function stat_sync_init() {
  "use strict";

  var ELECTRON = constant_env.ELECTRON;
  var StatsProto = Stats.prototype;

  function statSync(thePath) {
    if (typeof thePath !== "string") {
      return null;
    }

    var cache = src_shared.moduleState.statSync;
    var cached;

    if (cache !== null) {
      cached = cache.get(thePath);

      if (cached !== void 0) {
        return cached;
      }
    }

    try {
      cached = fs_statSync(thePath); // Electron and Muon return a plain object for asar files.
      // https://github.com/electron/electron/blob/master/lib/common/asar.js
      // https://github.com/brave/muon/blob/master/lib/common/asar.js

      if (ELECTRON && !(cached instanceof Stats)) {
        set_prototype_of(cached, StatsProto);
      }
    } catch (_unused) {
      cached = null;
    }

    if (cache !== null) {
      cache.set(thePath, cached);
    }

    return cached;
  }

  return statSync;
}

/* harmony default export */ var stat_sync = (src_shared.inited ? src_shared.module.fsStatSync : src_shared.module.fsStatSync = stat_sync_init());
// CONCATENATED MODULE: ./src/path/to-namespaced-path.js



function to_namespaced_path_init() {
  "use strict";

  return typeof toNamespacedPath === "function" ? toNamespacedPath : safe_path._makeLong;
}

/* harmony default export */ var to_namespaced_path = (src_shared.inited ? src_shared.module.pathToNamespacedPath : src_shared.module.pathToNamespacedPath = to_namespaced_path_init());
// CONCATENATED MODULE: ./src/fs/stat-fast.js






function stat_fast_init() {
  "use strict";

  var isFile = Stats.prototype.isFile;
  var useFastPath;

  function statFast(thePath) {
    if (typeof thePath !== "string") {
      return -1;
    }

    var cache = src_shared.moduleState.statFast;
    var cached;

    if (cache !== null) {
      cached = cache.get(thePath);

      if (cached !== void 0) {
        return cached;
      }
    }

    cached = statBase(thePath);

    if (cache !== null) {
      cache.set(thePath, cached);
    }

    return cached;
  }

  function statBase(thePath) {
    if (useFastPath === void 0) {
      useFastPath = typeof src_binding.fs.internalModuleStat === "function";
    }

    if (useFastPath) {
      try {
        return statFastPath(thePath);
      } catch (_unused) {}

      useFastPath = false;
    }

    return statFastFallback(thePath);
  }

  function statFastFallback(thePath) {
    var stat = stat_sync(thePath);

    if (stat !== null) {
      return Reflect.apply(isFile, stat, []) ? 0 : 1;
    }

    return -1;
  }

  function statFastPath(thePath) {
    // Used to speed up loading. Returns 0 if the path refers to a file,
    // 1 when it's a directory, or a negative number on error (usually ENOENT).
    // The speedup comes from not creating thousands of Stat and Error objects.
    var result = typeof thePath === "string" ? src_binding.fs.internalModuleStat(to_namespaced_path(thePath)) : -1;
    return result < 0 ? -1 : result;
  }

  return statFast;
}

/* harmony default export */ var stat_fast = (src_shared.inited ? src_shared.module.fsStatFast : src_shared.module.fsStatFast = stat_fast_init());
// CONCATENATED MODULE: ./src/fs/exists.js



function exists_init() {
  "use strict";

  function exists(thePath) {
    return stat_fast(thePath) !== -1;
  }

  return exists;
}

/* harmony default export */ var fs_exists = (src_shared.inited ? src_shared.module.fsExists : src_shared.module.fsExists = exists_init());
// CONCATENATED MODULE: ./src/util/get-cache-path-hash.js


function get_cache_path_hash_init() {
  "use strict";

  function getCachePathHash(cacheName) {
    return typeof cacheName === "string" ? cacheName.slice(0, 8) : "";
  }

  return getCachePathHash;
}

/* harmony default export */ var get_cache_path_hash = (src_shared.inited ? src_shared.module.utilGetCachePathHash : src_shared.module.utilGetCachePathHash = get_cache_path_hash_init());
// CONCATENATED MODULE: ./src/path/is-ext-mjs.js



function is_ext_mjs_init() {
  "use strict";

  var DOT = char_code.DOT,
      LOWERCASE_J = char_code.LOWERCASE_J,
      LOWERCASE_M = char_code.LOWERCASE_M,
      LOWERCASE_S = char_code.LOWERCASE_S;

  function isExtMJS(filename) {
    if (typeof filename !== "string") {
      return false;
    }

    var length = filename.length;
    return length > 4 && filename.charCodeAt(length - 3) === LOWERCASE_M && filename.charCodeAt(length - 4) === DOT && filename.charCodeAt(length - 2) === LOWERCASE_J && filename.charCodeAt(length - 1) === LOWERCASE_S;
  }

  return isExtMJS;
}

/* harmony default export */ var is_ext_mjs = (src_shared.inited ? src_shared.module.pathIsExtMJS : src_shared.module.pathIsExtMJS = is_ext_mjs_init());
// CONCATENATED MODULE: ./src/util/get.js


function get_init() {
  "use strict";

  function get(object, name, receiver) {
    if (object != null) {
      try {
        return receiver === void 0 ? object[name] : Reflect.get(object, name, receiver);
      } catch (_unused) {}
    }
  }

  return get;
}

/* harmony default export */ var util_get = (src_shared.inited ? src_shared.module.utilGet : src_shared.module.utilGet = get_init());
// CONCATENATED MODULE: ./src/util/get-env.js




function get_env_init() {
  "use strict";

  function getEnv(name) {
    return util_get(process.env, name);
  }

  return getEnv;
}

/* harmony default export */ var get_env = (src_shared.inited ? src_shared.module.utilGetEnv : src_shared.module.utilGetEnv = get_env_init());
// CONCATENATED MODULE: ./src/util/is-directory.js



function is_directory_init() {
  "use strict";

  function isDirectory(thePath) {
    return stat_fast(thePath) === 1;
  }

  return isDirectory;
}

/* harmony default export */ var is_directory = (src_shared.inited ? src_shared.module.utilIsDirectory : src_shared.module.utilIsDirectory = is_directory_init());
// CONCATENATED MODULE: ./src/fs/mkdir.js



function mkdir_init() {
  "use strict";

  function mkdir(dirPath) {
    if (typeof dirPath === "string") {
      try {
        mkdirSync(dirPath);
        return true;
      } catch (_unused) {}
    }

    return false;
  }

  return mkdir;
}

/* harmony default export */ var fs_mkdir = (src_shared.inited ? src_shared.module.fsMkdir : src_shared.module.fsMkdir = mkdir_init());
// CONCATENATED MODULE: ./src/fs/mkdirp.js





function mkdirp_init() {
  "use strict";

  function mkdirp(dirPath) {
    if (typeof dirPath !== "string") {
      return false;
    }

    var paths = [];

    while (true) {
      if (is_directory(dirPath)) {
        break;
      }

      paths.push(dirPath);
      var parentPath = dirname(dirPath);

      if (dirPath === parentPath) {
        break;
      }

      dirPath = parentPath;
    }

    var length = paths.length;

    while (length--) {
      if (!fs_mkdir(paths[length])) {
        return false;
      }
    }

    return true;
  }

  return mkdirp;
}

/* harmony default export */ var fs_mkdirp = (src_shared.inited ? src_shared.module.fsMkdirp : src_shared.module.fsMkdirp = mkdirp_init());
// CONCATENATED MODULE: ./src/util/parse-json.js


function parse_json_init() {
  "use strict";

  function parseJSON(string) {
    if (typeof string === "string" && string.length) {
      try {
        return JSON.parse(string);
      } catch (_unused) {}
    }

    return null;
  }

  return parseJSON;
}

/* harmony default export */ var parse_json = (src_shared.inited ? src_shared.module.utilParseJSON : src_shared.module.utilParseJSON = parse_json_init());
// CONCATENATED MODULE: ./src/path/normalize.js



function normalize_init() {
  "use strict";

  var WIN32 = is_win32();
  var backwardSlashRegExp = /\\/g;

  function posixNormalize(filename) {
    return typeof filename === "string" ? filename : "";
  }

  function win32Normalize(filename) {
    return typeof filename === "string" ? filename.replace(backwardSlashRegExp, "/") : "";
  }

  return WIN32 ? win32Normalize : posixNormalize;
}

/* harmony default export */ var path_normalize = (src_shared.inited ? src_shared.module.pathNormalize : src_shared.module.pathNormalize = normalize_init());
// CONCATENATED MODULE: ./src/path/relative.js





function relative_init() {
  "use strict";

  var BACKWARD_SLASH = char_code.BACKWARD_SLASH,
      FORWARD_SLASH = char_code.FORWARD_SLASH;
  var WIN32 = is_win32();

  function posixRelative(from, to) {
    var fromStart = 1;
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;
    var toStart = 1;
    var toEnd = to.length;
    var toLen = toEnd - toStart; // Compare paths to find the longest common path from root.

    var length = fromLen < toLen ? fromLen : toLen;
    var i = -1;
    var lastCommonSep = -1;

    while (++i <= length) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === FORWARD_SLASH) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from="/foo/bar" to="/foo/bar/baz"
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root.
            // For example: from="/" to="/foo"
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === FORWARD_SLASH) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from="/foo/bar/baz" to="/foo/bar"
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from="/foo" to="/"
            lastCommonSep = 0;
          }
        }

        break;
      }

      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);

      if (fromCode !== toCode) {
        break;
      } else if (fromCode === FORWARD_SLASH) {
        lastCommonSep = i;
      }
    }

    var out = ""; // Generate the relative path based on the path difference between `to`
    // and `from`.

    i = fromStart + lastCommonSep;

    while (++i <= fromEnd) {
      if (i === fromEnd || from.charCodeAt(i) === FORWARD_SLASH) {
        out += out.length === 0 ? ".." : "/..";
      }
    } // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts.


    if (out.length !== 0) {
      return out + to.slice(toStart + lastCommonSep);
    }

    toStart += lastCommonSep;

    if (to.charCodeAt(toStart) === FORWARD_SLASH) {
      ++toStart;
    }

    return to.slice(toStart);
  }

  function win32Relative(from, to) {
    var fromEnd = from.length;
    var toEnd = to.length;
    var fromLowered = from.toLowerCase();
    var toLowered = to.toLowerCase(); // Trim any leading backslashes.

    var fromStart = -1;

    while (++fromStart < fromEnd) {
      if (from.charCodeAt(fromStart) !== BACKWARD_SLASH) {
        break;
      }
    }

    var fromLen = fromEnd - fromStart; // Trim any leading backslashes.

    var toStart = -1;

    while (++toStart < toEnd) {
      if (to.charCodeAt(toStart) !== BACKWARD_SLASH) {
        break;
      }
    }

    var toLen = toEnd - toStart; // Compare paths to find the longest common path from root.

    var length = fromLen < toLen ? fromLen : toLen;
    var i = -1;
    var lastCommonSep = -1;

    while (++i <= length) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === BACKWARD_SLASH) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from="C:\\foo\\bar" to="C:\\foo\\bar\\baz"
            return to.slice(toStart + i + 1);
          } else if (i === 2) {
            // We get here if `from` is the device root.
            // For example: from="C:\\" to="C:\\foo"
            return to.slice(toStart + i);
          }
        }

        if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === BACKWARD_SLASH) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from="C:\\foo\\bar" to="C:\\foo"
            lastCommonSep = i;
          } else if (i === 2) {
            // We get here if `to` is the device root.
            // For example: from="C:\\foo\\bar" to="C:\\"
            lastCommonSep = 3;
          }
        }

        break;
      }

      var fromCode = fromLowered.charCodeAt(fromStart + i);
      var toCode = toLowered.charCodeAt(toStart + i);

      if (fromCode !== toCode) {
        break;
      }

      if (fromCode === BACKWARD_SLASH) {
        lastCommonSep = i;
      }
    } // We found a mismatch before the first common path separator was seen, so
    // return the original `to`.


    if (i !== length && lastCommonSep === -1) {
      return to;
    }

    var out = "";

    if (lastCommonSep === -1) {
      lastCommonSep = 0;
    } // Generate the relative path based on the path difference between `to` and
    // `from`.


    i = fromStart + lastCommonSep;

    while (++i <= fromEnd) {
      if (i === fromEnd || from.charCodeAt(i) === BACKWARD_SLASH) {
        out += out.length === 0 ? ".." : "/..";
      }
    } // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts.


    if (out.length > 0) {
      return out + path_normalize(to.slice(toStart + lastCommonSep));
    }

    toStart += lastCommonSep;

    if (to.charCodeAt(toStart) === BACKWARD_SLASH) {
      ++toStart;
    }

    return path_normalize(to.slice(toStart));
  }

  return WIN32 ? win32Relative : posixRelative;
}

/* harmony default export */ var path_relative = (src_shared.inited ? src_shared.module.pathRelative : src_shared.module.pathRelative = relative_init());
// CONCATENATED MODULE: ./src/fs/remove-file.js



function remove_file_init() {
  "use strict";

  function removeFile(filename) {
    if (typeof filename === "string") {
      try {
        unlinkSync(filename);
        return true;
      } catch (_unused) {}
    }

    return false;
  }

  return removeFile;
}

/* harmony default export */ var remove_file = (src_shared.inited ? src_shared.module.fsRemoveFile : src_shared.module.fsRemoveFile = remove_file_init());
// CONCATENATED MODULE: ./src/fs/write-file.js



function write_file_init() {
  "use strict";

  function writeFile(filename, bufferOrString, options) {
    if (typeof filename === "string") {
      try {
        writeFileSync(filename, bufferOrString, options);
        return true;
      } catch (_unused) {}
    }

    return false;
  }

  return writeFile;
}

/* harmony default export */ var write_file = (src_shared.inited ? src_shared.module.fsWriteFile : src_shared.module.fsWriteFile = write_file_init());
// CONCATENATED MODULE: ./src/caching-compiler.js



















function caching_compiler_init() {
  "use strict";

  var SOURCE_TYPE_MODULE = compiler.SOURCE_TYPE_MODULE,
      SOURCE_TYPE_SCRIPT = compiler.SOURCE_TYPE_SCRIPT;
  var TYPE_ESM = constant_entry.TYPE_ESM;
  var PACKAGE_VERSION = esm.PACKAGE_VERSION;
  var CachingCompiler = {
    compile(code, options = {}) {
      if (!options.eval && options.filename && options.cachePath) {
        return compileAndWrite(code, options);
      }

      return compile(code, options);
    },

    from(entry) {
      var pkg = entry.package;
      var cache = pkg.cache;
      var cacheName = entry.cacheName;
      var meta = cache.meta.get(cacheName);

      if (meta === void 0) {
        return null;
      }

      var length = meta.length;
      var result = {
        circular: 0,
        code: null,
        codeWithTDZ: null,
        filename: null,
        firstAwaitOutsideFunction: null,
        firstReturnOutsideFunction: null,
        mtime: -1,
        scriptData: null,
        sourceType: SOURCE_TYPE_SCRIPT,
        transforms: 0,
        yieldIndex: -1
      };

      if (length > 2) {
        var filename = meta[7];

        if (typeof filename === "string") {
          result.filename = path_resolve(pkg.cachePath, filename);
        }

        var deflatedFirstAwaitOutsideFunction = meta[5];

        if (deflatedFirstAwaitOutsideFunction !== null) {
          result.firstAwaitOutsideFunction = inflateLineInfo(deflatedFirstAwaitOutsideFunction);
        }

        var deflatedFirstReturnOutsideFunction = meta[6];

        if (deflatedFirstReturnOutsideFunction !== null) {
          result.firstReturnOutsideFunction = inflateLineInfo(deflatedFirstReturnOutsideFunction);
        }

        result.mtime = +meta[3];
        result.sourceType = +meta[4];
        result.transforms = +meta[2];
      }

      if (length > 7 && result.sourceType === SOURCE_TYPE_MODULE) {
        entry.type = TYPE_ESM;
        result.circular = +meta[8];
        result.yieldIndex = +meta[9];
      }

      var offsetStart = meta[0],
          offsetEnd = meta[1];

      if (offsetStart !== -1 && offsetEnd !== -1) {
        result.scriptData = generic_buffer.slice(cache.buffer, offsetStart, offsetEnd);
      }

      entry.compileData = result;
      cache.compile.set(cacheName, result);
      return result;
    }

  };

  function compile(code, options) {
    var result = src_compiler.compile(code, toCompileOptions(options));

    if (options.eval) {
      return result;
    }

    result.filename = options.filename;
    result.mtime = options.mtime;
    return result;
  }

  function compileAndWrite(code, options) {
    var cacheName = options.cacheName,
        cachePath = options.cachePath;
    var result = compile(code, options);

    if (!cacheName || !cachePath || result.transforms === 0) {
      return result;
    }

    var pendingWrites = src_shared.pendingWrites;
    var compileDatas = pendingWrites.get(cachePath);

    if (compileDatas === void 0) {
      compileDatas = new Map();
      pendingWrites.set(cachePath, compileDatas);
    }

    compileDatas.set(cacheName, result);
    return result;
  }

  function deflateLineInfo({
    column,
    line
  }) {
    return [column, line];
  }

  function inflateLineInfo([column, line]) {
    return {
      column,
      line
    };
  }

  function onExit() {
    setMaxListeners(Math.max(getMaxListeners() - 1, 0));
    var pendingScripts = src_shared.pendingScripts,
        pendingWrites = src_shared.pendingWrites;
    var dir = src_shared.package.dir;
    dir.forEach(function (cache, cachePath) {
      if (cachePath === "") {
        return;
      }

      var noCacheDir = !fs_mkdirp(cachePath);
      var dirty = cache.dirty;

      if (!dirty && !noCacheDir) {
        dirty = !!parse_json(get_env("ESM_DISABLE_CACHE"));
        cache.dirty = dirty;
      }

      if (dirty || noCacheDir) {
        dir.delete(cachePath);
        pendingScripts.delete(cachePath);
        pendingWrites.delete(cachePath);
      }

      if (noCacheDir) {
        return;
      }

      if (dirty) {
        writeMarker(cachePath + sep + ".dirty");
        remove_file(cachePath + sep + ".data.blob");
        remove_file(cachePath + sep + ".data.json");
        cache.compile.forEach(function (compileData, cacheName) {
          remove_file(cachePath + sep + cacheName);
        });
      }
    });
    var pendingScriptDatas = new Map();
    var useCreateCachedData = src_shared.support.createCachedData;
    pendingScripts.forEach(function (scripts, cachePath) {
      var cache = dir.get(cachePath);
      var compileDatas = cache.compile;
      var metas = cache.meta;
      scripts.forEach(function (script, cacheName) {
        var compileData = compileDatas.get(cacheName);

        if (compileData === void 0) {
          compileData = null;
        }

        var cachedData;

        if (compileData !== null) {
          cachedData = compileData.scriptData;

          if (cachedData === null) {
            cachedData = void 0;
          }
        }

        var changed = false;
        var scriptData = null;

        if (cachedData === void 0) {
          if (useCreateCachedData && typeof script.createCachedData === "function") {
            scriptData = script.createCachedData();
          } else if (script.cachedDataProduced) {
            scriptData = script.cachedData;
          }
        }

        if (scriptData !== null && scriptData.length) {
          changed = true;
        }

        if (compileData !== null) {
          if (scriptData !== null) {
            compileData.scriptData = scriptData;
          } else if (cachedData !== void 0 && script.cachedDataRejected) {
            changed = true;
            var meta = metas.get(cacheName);

            if (meta !== void 0) {
              meta[0] = -1;
              meta[1] = -1;
            }

            scriptData = null;
            compileData.scriptData = null;
          }
        }

        if (changed && cacheName !== "") {
          var scriptDatas = pendingScriptDatas.get(cachePath);

          if (scriptDatas === void 0) {
            scriptDatas = new Map();
            pendingScriptDatas.set(cachePath, scriptDatas);
          }

          scriptDatas.set(cacheName, scriptData);
        }
      });
    });
    pendingScriptDatas.forEach(function (scriptDatas, cachePath) {
      var cache = dir.get(cachePath);
      var compileDatas = cache.compile;
      var metas = cache.meta;
      scriptDatas.forEach(function (scriptData, cacheName) {
        var meta = metas.get(cacheName);

        if (meta !== void 0) {
          return;
        }

        meta = [-1, -1];
        var compileData = compileDatas.get(cacheName);

        if (compileData === void 0) {
          compileData = null;
        }

        if (compileData !== null) {
          var _compileData = compileData,
              filename = _compileData.filename,
              firstAwaitOutsideFunction = _compileData.firstAwaitOutsideFunction,
              firstReturnOutsideFunction = _compileData.firstReturnOutsideFunction,
              mtime = _compileData.mtime,
              sourceType = _compileData.sourceType,
              transforms = _compileData.transforms;
          var deflatedFirstAwaitOutsideFunction = firstAwaitOutsideFunction === null ? null : deflateLineInfo(firstAwaitOutsideFunction);
          var deflatedFirstReturnOutsideFunction = firstReturnOutsideFunction === null ? null : deflateLineInfo(firstReturnOutsideFunction);

          if (sourceType === SOURCE_TYPE_SCRIPT) {
            if (transforms !== 0) {
              meta.push(transforms, mtime, sourceType, deflatedFirstAwaitOutsideFunction, deflatedFirstReturnOutsideFunction, path_relative(cachePath, filename));
            }
          } else {
            meta.push(transforms, mtime, sourceType, deflatedFirstAwaitOutsideFunction, deflatedFirstReturnOutsideFunction, path_relative(cachePath, filename), compileData.circular, compileData.yieldIndex);
          }
        }

        metas.set(cacheName, meta);
      });
      var buffer = cache.buffer;
      var buffers = [];
      var jsonMeta = {};
      var offset = 0;
      metas.forEach(function (meta, cacheName) {
        var scriptData = scriptDatas.get(cacheName);

        if (scriptData === void 0) {
          var compileData = compileDatas.get(cacheName);

          if (compileData === void 0) {
            compileData = null;
          }

          var offsetStart = meta[0],
              offsetEnd = meta[1];
          scriptData = null;

          if (compileData !== null) {
            scriptData = compileData.scriptData;
          } else if (offsetStart !== -1 && offsetEnd !== -1) {
            scriptData = generic_buffer.slice(buffer, offsetStart, offsetEnd);
          }
        }

        if (scriptData !== null) {
          meta[0] = offset;
          offset += scriptData.length;
          meta[1] = offset;
          buffers.push(scriptData);
        }

        jsonMeta[cacheName] = meta;
      });
      write_file(cachePath + sep + ".data.blob", generic_buffer.concat(buffers));
      write_file(cachePath + sep + ".data.json", JSON.stringify({
        meta: jsonMeta,
        version: PACKAGE_VERSION
      }));
    });
    pendingWrites.forEach(function (compileDatas, cachePath) {
      compileDatas.forEach(function (compileData, cacheName) {
        if (write_file(cachePath + sep + cacheName, compileData.code)) {
          removeExpired(cachePath, cacheName);
        }
      });
    });
  }

  function removeExpired(cachePath, cacheName) {
    var cache = src_shared.package.dir.get(cachePath);
    var compileDatas = cache.compile;
    var metas = cache.meta;
    var pathHash = get_cache_path_hash(cacheName);
    compileDatas.forEach(function (compileData, otherCacheName) {
      if (otherCacheName !== cacheName && otherCacheName.startsWith(pathHash)) {
        compileDatas.delete(otherCacheName);
        metas.delete(otherCacheName);
        remove_file(cachePath + sep + otherCacheName);
      }
    });
  }

  function toCompileOptions(options = {}) {
    var cjsPaths = options.cjsPaths,
        cjsVars = options.cjsVars,
        topLevelReturn = options.topLevelReturn;

    if (is_ext_mjs(options.filename)) {
      cjsPaths = void 0;
      cjsVars = void 0;
      topLevelReturn = void 0;
    }

    var runtimeName = options.runtimeName;

    if (options.eval) {
      // Set `topLevelReturn` to `true` so that the "Illegal return statement"
      // syntax error will occur within `eval()`.
      return {
        cjsPaths,
        cjsVars,
        runtimeName,
        topLevelReturn: true
      };
    }

    return {
      cjsPaths,
      cjsVars,
      generateVarDeclarations: options.generateVarDeclarations,
      hint: options.hint,
      pragmas: options.pragmas,
      runtimeName,
      sourceType: options.sourceType,
      strict: options.strict,
      topLevelReturn
    };
  }

  function writeMarker(filename) {
    if (!fs_exists(filename)) {
      write_file(filename, "");
    }
  } // Create cache in an "exit" event handler. "SIGINT" and "SIGTERM" events are
  // not safe to observe because handlers conflict with applications managing
  // "SIGINT" and "SIGTERM" themselves.


  setMaxListeners(getMaxListeners() + 1);
  once("exit", to_external_function(onExit));
  return CachingCompiler;
}

/* harmony default export */ var caching_compiler = (src_shared.inited ? src_shared.module.CachingCompiler : src_shared.module.CachingCompiler = caching_compiler_init());
// CONCATENATED MODULE: ./src/constant/package.js
/* eslint-disable sort-keys */
var PACKAGE = {
  MODE_STRICT: 1,
  MODE_AUTO: 2,
  MODE_ALL: 3,
  RANGE_ALL: "*"
};
/* harmony default export */ var constant_package = (PACKAGE);
// CONCATENATED MODULE: ./src/safe/array.js


/* harmony default export */ var safe_array = (src_shared.inited ? src_shared.module.SafeArray : src_shared.module.SafeArray = util_safe(src_shared.external.Array));
// CONCATENATED MODULE: ./src/generic/array.js




function array_init() {
  "use strict";

  var ArrayProto = Array.prototype;
  var SafeProto = safe_array.prototype;
  return {
    concat: unapply(SafeProto.concat),
    from: safe_array.from,
    indexOf: unapply(ArrayProto.indexOf),
    join: unapply(ArrayProto.join),
    of: safe_array.of,
    push: unapply(ArrayProto.push),
    unshift: unapply(ArrayProto.unshift)
  };
}

/* harmony default export */ var generic_array = (src_shared.inited ? src_shared.module.GenericArray : src_shared.module.GenericArray = array_init());
// CONCATENATED MODULE: ./src/generic/object.js



function object_init() {
  "use strict";

  var ExObject = src_shared.external.Object;
  return {
    create(proto, properties) {
      if (properties === null) {
        properties = void 0;
      }

      if (proto === null || is_object_like(proto)) {
        return Object.create(proto, properties);
      }

      return properties === void 0 ? new ExObject() : Object.defineProperties(new ExObject(), properties);
    }

  };
}

/* harmony default export */ var generic_object = (src_shared.inited ? src_shared.module.GenericObject : src_shared.module.GenericObject = object_init());
// CONCATENATED MODULE: ./src/real/module.js



/* harmony default export */ var real_module = (src_shared.inited ? src_shared.module.RealModule : src_shared.module.RealModule = unwrap_proxy(real_require("module")));
// CONCATENATED MODULE: ./src/safe/module.js



/* harmony default export */ var safe_module = (src_shared.inited ? src_shared.module.SafeModule : src_shared.module.SafeModule = util_safe(real_module));
// CONCATENATED MODULE: ./src/safe/object.js


/* harmony default export */ var safe_object = (src_shared.inited ? src_shared.module.SafeObject : src_shared.module.SafeObject = util_safe(src_shared.external.Object));
// CONCATENATED MODULE: ./src/util/assign.js



function assign_init() {
  "use strict";

  function assign(object) {
    var length = arguments.length;
    var i = 0;

    while (++i < length) {
      var source = arguments[i];

      for (var name in source) {
        if (has(source, name)) {
          object[name] = source[name];
        }
      }
    }

    return object;
  }

  return assign;
}

/* harmony default export */ var util_assign = (src_shared.inited ? src_shared.module.utilAssign : src_shared.module.utilAssign = assign_init());
// CONCATENATED MODULE: ./src/util/decode-uri-component.js


function decode_uri_component_init() {
  "use strict";

  var _decodeURIComponent = decodeURIComponent;
  return function decodeURIComponent(string) {
    return typeof string === "string" ? _decodeURIComponent(string) : "";
  };
}

/* harmony default export */ var decode_uri_component = (src_shared.inited ? src_shared.module.utilDecodeURIComponent : src_shared.module.utilDecodeURIComponent = decode_uri_component_init());
// CONCATENATED MODULE: ./src/real/punycode.js






function punycode_init() {
  "use strict";

  if (!builtin_lookup.has("punycode")) {
    return;
  }

  var realPunycode = safe_require("punycode");

  if (is_object_like(realPunycode)) {
    return unwrap_proxy(realPunycode);
  }
}

/* harmony default export */ var punycode = (src_shared.inited ? src_shared.module.realPunycode : src_shared.module.realPunycode = punycode_init());
// CONCATENATED MODULE: ./src/safe/punycode.js



var safePunycode = src_shared.inited ? src_shared.module.safePunycode : src_shared.module.safePunycode = util_safe(punycode);
var punycode_toUnicode = safePunycode === void 0 ? void 0 : safePunycode.toUnicode;
/* harmony default export */ var safe_punycode = (safePunycode);
// CONCATENATED MODULE: ./src/real/url.js



/* harmony default export */ var real_url = (src_shared.inited ? src_shared.module.realURL : src_shared.module.realURL = unwrap_proxy(real_require("url")));
// CONCATENATED MODULE: ./src/safe/url.js



var safeURL = src_shared.inited ? src_shared.module.safeURL : src_shared.module.safeURL = util_safe(real_url);
var URL = safeURL.URL,
    url_domainToUnicode = safeURL.domainToUnicode,
    url_parse = safeURL.parse;

/* harmony default export */ var safe_url = (safeURL);
// CONCATENATED MODULE: ./src/util/domain-to-unicode.js




function domain_to_unicode_init() {
  "use strict";

  var toUnicode = typeof url_domainToUnicode === "function" ? url_domainToUnicode : punycode_toUnicode;

  function domainToUnicode(domain) {
    return typeof domain === "string" ? toUnicode(domain) : "";
  }

  return domainToUnicode;
}

/* harmony default export */ var domain_to_unicode = (src_shared.inited ? src_shared.module.utilDomainToUnicode : src_shared.module.utilDomainToUnicode = domain_to_unicode_init());
// CONCATENATED MODULE: ./src/path/has-encoded-sep.js



function has_encoded_sep_init() {
  "use strict";

  var WIN32 = constant_env.WIN32;
  var posixRegExp = /%2f/i;
  var win32RegExp = /%5c|%2f/i;

  function hasEncodedSep(string) {
    if (typeof string !== "string") {
      return false;
    }

    return WIN32 ? win32RegExp.test(string) : posixRegExp.test(string);
  }

  return hasEncodedSep;
}

/* harmony default export */ var has_encoded_sep = (src_shared.inited ? src_shared.module.pathHasEncodedSep : src_shared.module.pathHasEncodedSep = has_encoded_sep_init());
// CONCATENATED MODULE: ./src/util/parse-url.js




function parse_url_init() {
  "use strict";

  var FORWARD_SLASH = char_code.FORWARD_SLASH;
  var useURL = typeof URL === "function";
  var legacyNames = ["hash", "host", "hostname", "href", "pathname", "port", "protocol", "search"];

  function parseURL(url) {
    var cache = src_shared.memoize.utilParseURL;
    var cached = cache.get(url);

    if (cached !== void 0) {
      return cached;
    }

    if (typeof url === "string" && url.length > 1 && url.charCodeAt(0) === FORWARD_SLASH && url.charCodeAt(1) === FORWARD_SLASH) {
      // Prefix protocol relative URLs with "file:"
      url = "file:" + url;
    }

    cached = useURL ? new URL(url) : legacyFallback(url);
    cache.set(url, cached);
    return cached;
  }

  function legacyFallback(url) {
    var result = url_parse(url);

    for (var _i = 0, _length = legacyNames == null ? 0 : legacyNames.length; _i < _length; _i++) {
      var name = legacyNames[_i];

      if (typeof result[name] !== "string") {
        result[name] = "";
      }
    }

    return result;
  }

  return parseURL;
}

/* harmony default export */ var parse_url = (src_shared.inited ? src_shared.module.utilParseURL : src_shared.module.utilParseURL = parse_url_init());
// CONCATENATED MODULE: ./src/util/get-file-path-from-url.js









function get_file_path_from_url_init() {
  "use strict";

  var COLON = char_code.COLON,
      FORWARD_SLASH = char_code.FORWARD_SLASH,
      LOWERCASE_A = char_code.LOWERCASE_A,
      LOWERCASE_Z = char_code.LOWERCASE_Z,
      UPPERCASE_A = char_code.UPPERCASE_A,
      UPPERCASE_Z = char_code.UPPERCASE_Z;
  var WIN32 = constant_env.WIN32;

  function getFilePathFromURL(url) {
    var parsed = typeof url === "string" ? parse_url(url) : url;
    var pathname = parsed.pathname;

    if (pathname === "" || parsed.protocol !== "file:" || has_encoded_sep(pathname)) {
      return "";
    }

    var host = parsed.host;
    pathname = decode_uri_component(pathname); // Section 2: Syntax
    // https://tools.ietf.org/html/rfc8089#section-2

    if (host !== "" && host !== "localhost") {
      return WIN32 ? "\\\\" + domain_to_unicode(host) + normalize(pathname) : "";
    }

    if (!WIN32) {
      return pathname;
    } // Section E.2: DOS and Windows Drive Letters
    // https://tools.ietf.org/html/rfc8089#appendix-E.2
    // https://tools.ietf.org/html/rfc8089#appendix-E.2.2


    if (pathname.length < 3 || pathname.charCodeAt(2) !== COLON) {
      return "";
    }

    var code1 = pathname.charCodeAt(1); // Drive letters must be `[A-Za-z]:/`
    // All slashes of pathnames are forward slashes.

    if ((code1 >= UPPERCASE_A && code1 <= UPPERCASE_Z || code1 >= LOWERCASE_A && code1 <= LOWERCASE_Z) && pathname.charCodeAt(3) === FORWARD_SLASH) {
      return normalize(pathname).slice(1);
    }

    return "";
  }

  return getFilePathFromURL;
}

/* harmony default export */ var get_file_path_from_url = (src_shared.inited ? src_shared.module.utilGetFilePathFromURL : src_shared.module.utilGetFilePathFromURL = get_file_path_from_url_init());
// CONCATENATED MODULE: ./src/util/is-file-origin.js



function is_file_origin_init() {
  "use strict";

  var COLON = char_code.COLON,
      FORWARD_SLASH = char_code.FORWARD_SLASH,
      LOWERCASE_E = char_code.LOWERCASE_E,
      LOWERCASE_F = char_code.LOWERCASE_F,
      LOWERCASE_I = char_code.LOWERCASE_I,
      LOWERCASE_L = char_code.LOWERCASE_L;

  function isFileOrigin(url) {
    if (typeof url !== "string") {
      return false;
    }

    var length = url.length;
    return length > 7 && url.charCodeAt(0) === LOWERCASE_F && url.charCodeAt(1) === LOWERCASE_I && url.charCodeAt(2) === LOWERCASE_L && url.charCodeAt(3) === LOWERCASE_E && url.charCodeAt(4) === COLON && url.charCodeAt(5) === FORWARD_SLASH && url.charCodeAt(6) === FORWARD_SLASH;
  }

  return isFileOrigin;
}

/* harmony default export */ var is_file_origin = (src_shared.inited ? src_shared.module.utilIsFileOrigin : src_shared.module.utilIsFileOrigin = is_file_origin_init());
// CONCATENATED MODULE: ./src/util/get-module-dirname.js







function get_module_dirname_init() {
  "use strict";

  function getModuleDirname(mod) {
    if (is_object(mod)) {
      var path = mod.path;

      if (typeof path === "string") {
        return path;
      }

      var id = mod.id;

      if (builtin_lookup.has(id)) {
        return "";
      }

      var filename = mod.filename;

      if (filename === null && typeof id === "string") {
        filename = is_file_origin(id) ? get_file_path_from_url(id) : id;
      }

      if (typeof filename === "string") {
        return dirname(filename);
      }
    }

    return ".";
  }

  return getModuleDirname;
}

/* harmony default export */ var get_module_dirname = (src_shared.inited ? src_shared.module.utilGetModuleDirname : src_shared.module.utilGetModuleDirname = get_module_dirname_init());
// CONCATENATED MODULE: ./src/path/is-ext-node.js



function is_ext_node_init() {
  "use strict";

  var DOT = char_code.DOT,
      LOWERCASE_D = char_code.LOWERCASE_D,
      LOWERCASE_E = char_code.LOWERCASE_E,
      LOWERCASE_N = char_code.LOWERCASE_N,
      LOWERCASE_O = char_code.LOWERCASE_O;

  function isExtNode(filename) {
    if (typeof filename !== "string") {
      return false;
    }

    var length = filename.length;
    return length > 5 && filename.charCodeAt(length - 4) === LOWERCASE_N && filename.charCodeAt(length - 5) === DOT && filename.charCodeAt(length - 3) === LOWERCASE_O && filename.charCodeAt(length - 2) === LOWERCASE_D && filename.charCodeAt(length - 1) === LOWERCASE_E;
  }

  return isExtNode;
}

/* harmony default export */ var is_ext_node = (src_shared.inited ? src_shared.module.pathIsExtNode : src_shared.module.pathIsExtNode = is_ext_node_init());
// CONCATENATED MODULE: ./src/util/copy-property.js




function copy_property_init() {
  "use strict";

  function copyProperty(object, source, name) {
    if (!is_object_like(object) || !is_object_like(source)) {
      return object;
    }

    var descriptor = Reflect.getOwnPropertyDescriptor(source, name);

    if (descriptor !== void 0) {
      if (is_data_property_descriptor(descriptor)) {
        object[name] = source[name];
      } else {
        Reflect.defineProperty(object, name, descriptor);
      }
    }

    return object;
  }

  return copyProperty;
}

/* harmony default export */ var copy_property = (src_shared.inited ? src_shared.module.utilCopyProperty : src_shared.module.utilCopyProperty = copy_property_init());
// CONCATENATED MODULE: ./src/util/is-error.js




function is_error_init() {
  "use strict";

  var types = safe_util.types;

  if (typeof (types && types.isNativeError) === "function") {
    return types.isNativeError;
  }

  var isNativeError = src_binding.util.isNativeError;
  return typeof isNativeError === "function" ? isNativeError : safe_util.isError;
}

/* harmony default export */ var is_error = (src_shared.inited ? src_shared.module.utilIsError : src_shared.module.utilIsError = is_error_init());
// CONCATENATED MODULE: ./src/error/capture-stack-trace.js



function capture_stack_trace_init() {
  "use strict";

  // Collect the call stack using the V8 stack trace API.
  // https://v8.dev/docs/stack-trace-api#stack-trace-collection-for-custom-exceptions
  var _captureStackTrace = Error.captureStackTrace;

  function captureStackTrace(error, beforeFunc) {
    if (is_error(error)) {
      if (typeof beforeFunc === "function") {
        _captureStackTrace(error, beforeFunc);
      } else {
        _captureStackTrace(error);
      }
    }

    return error;
  }

  return captureStackTrace;
}

/* harmony default export */ var capture_stack_trace = (src_shared.inited ? src_shared.module.errorCaptureStackTrace : src_shared.module.errorCaptureStackTrace = capture_stack_trace_init());
// CONCATENATED MODULE: ./src/util/native-trap.js



function native_trap_init() {
  "use strict";

  function nativeTrap(func) {
    function trap(...args) {
      try {
        return Reflect.apply(func, this, args);
      } catch (e) {
        capture_stack_trace(e, trap);
        throw e;
      }
    }

    return trap;
  }

  return nativeTrap;
}

/* harmony default export */ var native_trap = (src_shared.inited ? src_shared.module.utilNativeTrap : src_shared.module.utilNativeTrap = native_trap_init());
// CONCATENATED MODULE: ./src/util/empty-array.js


function empty_array_init() {
  "use strict";

  return [];
}

/* harmony default export */ var empty_array = (src_shared.inited ? src_shared.module.utilEmptyArray : src_shared.module.utilEmptyArray = empty_array_init());
// CONCATENATED MODULE: ./src/util/empty-object.js


function empty_object_init() {
  "use strict";

  return {};
}

/* harmony default export */ var empty_object = (src_shared.inited ? src_shared.module.utilEmptyObject : src_shared.module.utilEmptyObject = empty_object_init());
// CONCATENATED MODULE: ./src/util/is-own-proxy.js








function is_own_proxy_init() {
  "use strict";

  var PROXY_PREFIX = constant_inspect.PROXY_PREFIX;
  var PACKAGE_PREFIX = esm.PACKAGE_PREFIX;
  var endMarkerRegExp = new RegExp("[\\[\"']" + escape_regexp(PACKAGE_PREFIX) + ":proxy['\"\\]]\\s*:\\s*1\\s*\\}\\s*.?$");
  var liteInspectOptions = {
    breakLength: Infinity,
    colors: false,
    compact: true,
    customInspect: false,
    depth: 0,
    maxArrayLength: 0,
    showHidden: false,
    showProxy: true
  };
  var markerInspectOptions = {
    breakLength: Infinity,
    colors: false,
    compact: true,
    customInspect: false,
    depth: 1,
    maxArrayLength: 0,
    showHidden: true,
    showProxy: true
  };
  var inspectDepth = 0;

  function isOwnProxy(value) {
    return own_proxy.instances.has(value) || isOwnProxyFallback(value);
  }

  function isOwnProxyFallback(value) {
    if (!src_shared.support.inspectProxies || !is_object_like(value) || ++inspectDepth !== 1) {
      return false;
    }

    var inspected;

    try {
      inspected = util_inspect(value, liteInspectOptions);
    } finally {
      inspectDepth -= 1;
    }

    if (!inspected.startsWith(PROXY_PREFIX)) {
      return false;
    }

    inspectDepth += 1;

    try {
      inspected = util_inspect(value, markerInspectOptions);
    } finally {
      inspectDepth -= 1;
    }

    return endMarkerRegExp.test(inspected);
  }

  return isOwnProxy;
}

/* harmony default export */ var is_own_proxy = (src_shared.inited ? src_shared.module.utilIsOwnProxy : src_shared.module.utilIsOwnProxy = is_own_proxy_init());
// CONCATENATED MODULE: ./src/util/unwrap-own-proxy.js




function unwrap_own_proxy_init() {
  "use strict";

  function unwrapOwnProxy(value) {
    if (!is_object_like(value)) {
      return value;
    }

    var cache = src_shared.memoize.utilUnwrapOwnProxy;
    var cached = cache.get(value);

    if (cached !== void 0) {
      return cached;
    }

    var instances = own_proxy.instances;
    var details;
    var unwrapped = value;

    while ((details = instances.get(unwrapped)) !== void 0) {
      unwrapped = details[0];
    }

    cache.set(value, unwrapped);
    return unwrapped;
  }

  return unwrapOwnProxy;
}

/* harmony default export */ var unwrap_own_proxy = (src_shared.inited ? src_shared.module.utilUnwrapOwnProxy : src_shared.module.utilUnwrapOwnProxy = unwrap_own_proxy_init());
// CONCATENATED MODULE: ./src/shim/function-prototype-to-string.js








function function_prototype_to_string_init() {
  "use strict";

  var proxyNativeSourceText = src_shared.proxyNativeSourceText;
  var NATIVE_SOURCE_TEXT = proxyNativeSourceText === "" ? "function () { [native code] }" : proxyNativeSourceText;
  var Shim = {
    enable(context) {
      // Avoid a silent fail accessing `context.Function` in Electron 1.
      var FuncProto = Reflect.getOwnPropertyDescriptor(context, "Function").value.prototype;
      var cache = src_shared.memoize.shimFunctionPrototypeToString;

      if (check(FuncProto, cache)) {
        return context;
      }

      var apply = native_trap(function (toString, thisArg) {
        if (proxyNativeSourceText !== "" && is_own_proxy(thisArg)) {
          thisArg = unwrap_own_proxy(thisArg);
        }

        try {
          return Reflect.apply(toString, thisArg, empty_array);
        } catch (e) {
          if (typeof thisArg !== "function") {
            throw e;
          }
        }

        if (is_own_proxy(thisArg)) {
          try {
            return Reflect.apply(toString, unwrap_own_proxy(thisArg), empty_array);
          } catch (_unused) {}
        } // Section 19.2.3.5: Function.prototype.toString()
        // Step 3: Return "function () { [native code] }" for callable objects.
        // https://tc39.github.io/Function-prototype-toString-revision/#proposal-sec-function.prototype.tostring


        return NATIVE_SOURCE_TEXT;
      });

      if (Reflect.defineProperty(FuncProto, "toString", {
        configurable: true,
        value: new own_proxy(FuncProto.toString, {
          apply
        }),
        writable: true
      })) {
        cache.set(FuncProto, true);
      }

      return context;
    }

  };

  function check(FuncProto, cache) {
    var cached = cache.get(FuncProto);

    if (cached !== void 0) {
      return cached;
    }

    cached = true;

    try {
      var _toString = FuncProto.toString;

      if (typeof _toString === "function") {
        cached = Reflect.apply(_toString, new own_proxy(_toString, empty_object), empty_array) === Reflect.apply(_toString, _toString, empty_array);
      }
    } catch (_unused2) {
      cached = false;
    }

    cache.set(FuncProto, cached);
    return cached;
  }

  return Shim;
}

/* harmony default export */ var function_prototype_to_string = (src_shared.inited ? src_shared.module.shimFunctionPrototypeToString : src_shared.module.shimFunctionPrototypeToString = function_prototype_to_string_init());
// CONCATENATED MODULE: ./src/util/mask-function.js













function maskFunction(func, source) {
  "use strict";

  if (typeof source !== "function") {
    return func;
  }

  var cache = src_shared.memoize.utilMaskFunction;
  var cached = cache.get(func);

  if (cached !== void 0) {
    return cached.proxy;
  }

  cached = cache.get(source);

  if (cached !== void 0) {
    source = cached.source;
  }

  var proxy = new own_proxy(func, {
    get(func, name, receiver) {
      if (name === "toString" && !has(func, "toString")) {
        return cached.toString;
      }

      if (receiver === proxy) {
        receiver = func;
      }

      return Reflect.get(func, name, receiver);
    }

  });
  var sourceProto = has(source, "prototype") ? source.prototype : void 0;

  if (is_object_like(sourceProto)) {
    var proto = has(func, "prototype") ? func.prototype : void 0;

    if (!is_object_like(proto)) {
      proto = generic_object.create();
      Reflect.defineProperty(func, "prototype", {
        value: proto,
        writable: true
      });
    }

    Reflect.defineProperty(proto, "constructor", {
      configurable: true,
      value: proxy,
      writable: true
    });
    set_prototype_of(proto, get_prototype_of(sourceProto));
  } else {
    var descriptor = Reflect.getOwnPropertyDescriptor(source, "prototype");

    if (descriptor === void 0) {
      Reflect.deleteProperty(func, "prototype");
    } else {
      Reflect.defineProperty(func, "prototype", descriptor);
    }
  }

  copy_property(func, source, "name");
  set_prototype_of(func, get_prototype_of(source));
  cached = {
    proxy,
    source,
    toString: new own_proxy(func.toString, {
      apply: native_trap(function (toString, thisArg, args) {
        if (!src_loader.state.package.default.options.debug && typeof thisArg === "function" && unwrap_own_proxy(thisArg) === func) {
          thisArg = cached.source;
        }

        return Reflect.apply(toString, thisArg, args);
      })
    })
  };
  cache.set(func, cached);
  cache.set(proxy, cached);
  return proxy;
}

function_prototype_to_string.enable(src_shared.safeGlobal);
/* harmony default export */ var mask_function = (maskFunction);
// CONCATENATED MODULE: ./src/util/is-module-namespace-object-like.js




function is_module_namespace_object_like_init() {
  "use strict";

  function isModuleNamespaceObjectLike(value) {
    if (!is_object(value) || get_prototype_of(value) !== null) {
      return false;
    }

    var descriptor = Reflect.getOwnPropertyDescriptor(value, Symbol.toStringTag);
    return descriptor !== void 0 && descriptor.configurable === false && descriptor.enumerable === false && descriptor.writable === false && descriptor.value === "Module";
  }

  return isModuleNamespaceObjectLike;
}

/* harmony default export */ var is_module_namespace_object_like = (src_shared.inited ? src_shared.module.utilIsModuleNamespaceObjectLike : src_shared.module.utilIsModuleNamespaceObjectLike = is_module_namespace_object_like_init());
// CONCATENATED MODULE: ./src/util/is-proxy-inspectable.js





function is_proxy_inspectable_init() {
  "use strict";

  function isProxyInspectable(value) {
    if (!is_object_like(value)) {
      return false;
    }

    return typeof value === "function" || Array.isArray(value) || Reflect.has(value, Symbol.toStringTag) || value === builtin_entries.process.module.exports || get_object_tag(value) === "[object Object]";
  }

  return isProxyInspectable;
}

/* harmony default export */ var is_proxy_inspectable = (src_shared.inited ? src_shared.module.utilIsProxyInspectable : src_shared.module.utilIsProxyInspectable = is_proxy_inspectable_init());
// CONCATENATED MODULE: ./src/util/is-native-like-function.js



function is_native_like_function_init() {
  "use strict";

  // `Function#toString()` is used to extract the coerced string source of a
  // function regardless of any custom `toString()` method it may have.
  var toString = Function.prototype.toString; // A native method, e.g. `Function#toString()`, is used as a template to
  // compare other native methods against. Escape special RegExp characters
  // and remove method identifiers before converting the template to a regexp.

  var markerRegExp = /toString|(function ).*?(?=\\\()/g;
  var nativeFuncRegExp = RegExp("^" + escape_regexp(toString.call(toString)).replace(markerRegExp, "$1.*?") + "$");

  function isNativeLikeFunction(value) {
    if (typeof value === "function") {
      // A try-catch is needed in Node < 10 to avoid a type error when
      // coercing proxy wrapped functions.
      try {
        return nativeFuncRegExp.test(toString.call(value));
      } catch (_unused) {}
    }

    return false;
  }

  return isNativeLikeFunction;
}

/* harmony default export */ var is_native_like_function = (src_shared.inited ? src_shared.module.utilIsNativeLikeFunction : src_shared.module.utilIsNativeLikeFunction = is_native_like_function_init());
// CONCATENATED MODULE: ./src/util/is-proxy.js








function is_proxy_init() {
  "use strict";

  if (typeof (util_types && util_types.isProxy) === "function") {
    return util_types.isProxy;
  }

  var PROXY_PREFIX = constant_inspect.PROXY_PREFIX;
  var liteInspectOptions = {
    breakLength: Infinity,
    colors: false,
    compact: true,
    customInspect: false,
    depth: 0,
    maxArrayLength: 0,
    showHidden: false,
    showProxy: true
  };
  var useGetProxyDetails;
  return function isProxyFallback(value) {
    if (own_proxy.instances.has(value)) {
      return true;
    }

    if (useGetProxyDetails === void 0) {
      useGetProxyDetails = typeof src_binding.util.getProxyDetails === "function";
    }

    if (useGetProxyDetails) {
      return !!util_get_proxy_details(value);
    }

    return src_shared.support.inspectProxies && is_object_like(value) && util_inspect(value, liteInspectOptions).startsWith(PROXY_PREFIX);
  };
}

/* harmony default export */ var is_proxy = (src_shared.inited ? src_shared.module.utilIsProxy : src_shared.module.utilIsProxy = is_proxy_init());
// CONCATENATED MODULE: ./src/util/is-native-function.js




function is_native_function_init() {
  "use strict";

  function isNativeFunction(value) {
    if (!is_native_like_function(value)) {
      return false;
    }

    var name = value.name; // Section 19.2.3.2: Function#bind()
    // Step 11: Bound function names start with "bound ".
    // https://tc39.github.io/ecma262/#sec-function.prototype.bind

    if (typeof name === "string" && name.startsWith("bound ")) {
      return false;
    }

    return !is_proxy(value);
  }

  return isNativeFunction;
}

/* harmony default export */ var is_native_function = (src_shared.inited ? src_shared.module.utilIsNativeFunction : src_shared.module.utilIsNativeFunction = is_native_function_init());
// CONCATENATED MODULE: ./src/util/is-stack-trace-maskable.js




function is_stack_trace_maskable_init() {
  "use strict";

  function isStackTraceMaskable(error) {
    if (!is_error(error)) {
      return false;
    }

    var descriptor = Reflect.getOwnPropertyDescriptor(error, "stack");

    if (descriptor !== void 0 && descriptor.configurable === true && descriptor.enumerable === false && typeof descriptor.get === "function" && typeof descriptor.set === "function" && !is_native_function(descriptor.get) && !is_native_function(descriptor.set)) {
      return false;
    }

    return true;
  }

  return isStackTraceMaskable;
}

/* harmony default export */ var is_stack_trace_maskable = (src_shared.inited ? src_shared.module.utilIsStackTraceMaskable : src_shared.module.utilIsStackTraceMaskable = is_stack_trace_maskable_init());
// CONCATENATED MODULE: ./src/constant/wasm.js
var WASM = {
  // The encoding of a WASM module starts with a 4-byte magic cookie.
  // https://webassembly.github.io/spec/core/binary/modules.html#binary-module
  MAGIC_COOKIE: "\0asm"
};
/* harmony default export */ var wasm = (WASM);
// CONCATENATED MODULE: ./src/util/set-hidden-value.js




function set_hidden_value_init() {
  "use strict";

  var useSetHiddenValue;

  function setHiddenValue(object, name, value) {
    if (useSetHiddenValue === void 0) {
      useSetHiddenValue = typeof src_binding.util.setHiddenValue === "function";
    }

    if (useSetHiddenValue && typeof name === src_shared.utilBinding.hiddenKeyType && name != null && is_object_like(object)) {
      try {
        return src_binding.util.setHiddenValue(object, name, value);
      } catch (_unused) {}
    }

    return false;
  }

  return setHiddenValue;
}

/* harmony default export */ var set_hidden_value = (src_shared.inited ? src_shared.module.utilSetHiddenValue : src_shared.module.utilSetHiddenValue = set_hidden_value_init());
// CONCATENATED MODULE: ./src/error/decorate-stack-trace.js




function decorate_stack_trace_init() {
  "use strict";

  function decorateStackTrace(error) {
    if (is_error(error)) {
      set_hidden_value(error, src_shared.utilBinding.errorDecoratedSymbol, true);
    }

    return error;
  }

  return decorateStackTrace;
}

/* harmony default export */ var decorate_stack_trace = (src_shared.inited ? src_shared.module.errorDecorateStackTrace : src_shared.module.errorDecorateStackTrace = decorate_stack_trace_init());
// CONCATENATED MODULE: ./src/util/encode-uri.js


function encode_uri_init() {
  "use strict";

  var _encodeURI = encodeURI;
  return function encodeURI(string) {
    return typeof string === "string" ? _encodeURI(string) : "";
  };
}

/* harmony default export */ var encode_uri = (src_shared.inited ? src_shared.module.utilEncodeURI : src_shared.module.utilEncodeURI = encode_uri_init());
// CONCATENATED MODULE: ./src/util/get-url-from-file-path.js
// A simplified version of file-url.
// Copyright Sindre Sorhus. Released under MIT license:
// https://github.com/sindresorhus/file-url







function get_url_from_file_path_init() {
  "use strict";

  var FORWARD_SLASH = char_code.FORWARD_SLASH;
  var encodeCharsRegExp = /[?#]/g;
  var encodeCharMap = new Map([["#", "%23"], ["?", "%3F"]]);

  function encodeChar(char) {
    return encodeCharMap.get(char);
  }

  function getURLFromFilePath(filename) {
    var length = typeof filename === "string" ? filename.length : 0;

    if (length === 0) {
      return "file:///";
    }

    var oldFilename = filename;
    var oldLength = length;
    filename = path_normalize(path_resolve(filename)); // Section 3.3: Escape Path Components
    // https://tools.ietf.org/html/rfc3986#section-3.3

    filename = encode_uri(filename).replace(encodeCharsRegExp, encodeChar);
    length = filename.length;

    if (filename.charCodeAt(length - 1) !== FORWARD_SLASH && is_sep(oldFilename.charCodeAt(oldLength - 1))) {
      filename += "/";
    }

    var i = -1; // eslint-disable-next-line no-empty

    while (++i < length && filename.charCodeAt(i) === FORWARD_SLASH) {}

    if (i > 1) {
      filename = "/" + filename.slice(i);
    } else if (i === 0) {
      filename = "/" + filename;
    }

    return "file://" + filename;
  }

  return getURLFromFilePath;
}

/* harmony default export */ var get_url_from_file_path = (src_shared.inited ? src_shared.module.utilGetURLFromFilePath : src_shared.module.utilGetURLFromFilePath = get_url_from_file_path_init());
// CONCATENATED MODULE: ./src/util/get-module-url.js





function get_module_url_init() {
  "use strict";

  function getModuleURL(request) {
    if (typeof request === "string") {
      return is_path(request) ? get_url_from_file_path(request) : request;
    }

    if (is_object(request)) {
      var filename = request.filename,
          id = request.id;

      if (typeof filename === "string") {
        return get_url_from_file_path(filename);
      }

      if (typeof id === "string") {
        return id;
      }
    }

    return "";
  }

  return getModuleURL;
}

/* harmony default export */ var get_module_url = (src_shared.inited ? src_shared.module.utilGetModuleURL : src_shared.module.utilGetModuleURL = get_module_url_init());
// CONCATENATED MODULE: ./src/util/is-parse-error.js



function is_parse_error_init() {
  "use strict";

  function isParseError(value) {
    for (var name in parse_errors) {
      if (value instanceof parse_errors[name]) {
        return true;
      }
    }

    return false;
  }

  return isParseError;
}

/* harmony default export */ var is_parse_error = (src_shared.inited ? src_shared.module.utilIsParseError : src_shared.module.utilIsParseError = is_parse_error_init());
// CONCATENATED MODULE: ./src/util/replace-without.js



function replace_without_init() {
  "use strict";

  var ZERO_WIDTH_JOINER = constant_char.ZERO_WIDTH_JOINER;
  var WITHOUT_TOKEN = ZERO_WIDTH_JOINER + "WITHOUT" + ZERO_WIDTH_JOINER;

  function replaceWithout(string, without, replacer) {
    if (typeof string !== "string" || typeof without !== "string") {
      return string;
    }

    var result = replacer(string.replace(without, WITHOUT_TOKEN));
    return typeof result === "string" ? result.replace(WITHOUT_TOKEN, function () {
      return without;
    }) : string;
  }

  return replaceWithout;
}

/* harmony default export */ var replace_without = (src_shared.inited ? src_shared.module.utilReplaceWithout : src_shared.module.utilReplaceWithout = replace_without_init());
// CONCATENATED MODULE: ./src/util/untransform-runtime.js


function untransform_runtime_init() {
  "use strict";

  var assertImportedBindingRegExp = /\w+\u200D\.a\("(.+?)",\1\)/g;
  var assertUndeclaredRegExp = /\w+\u200D\.t\("(.+?)"\)/g;
  var evalCallExpRegExp = /\(eval===(\w+\u200D)\.v\?\1\.c:\1\.k\)/g;
  var indirectEvalRegExp = /\(eval===(\w+\u200D)\.v\?\1\.e:eval\)/g;
  var runtimeRegExp = /\w+\u200D\.(\w+)(\.)?/g;
  var throwConstAssignmentRegExp = /\w+\u200D\.b\("(.+?)","(.+?)",?/g;

  function untransformRuntime(string) {
    if (typeof string !== "string") {
      return "";
    }

    return string.replace(assertImportedBindingRegExp, replaceAssert).replace(assertUndeclaredRegExp, replaceAssert).replace(evalCallExpRegExp, replaceEvalCallExp).replace(indirectEvalRegExp, replaceIndirectEval).replace(throwConstAssignmentRegExp, replaceThrowConstAssignment).replace(runtimeRegExp, replaceRuntime);
  }

  function replaceAssert(match, name) {
    return name;
  }

  function replaceEvalCallExp() {
    return "";
  }

  function replaceIndirectEval() {
    return "eval";
  }

  function replaceRuntime(match, name, dot = "") {
    if (name === "e") {
      return "eval" + dot;
    }

    if (name === "_" || name === "i") {
      return "import" + dot;
    }

    if (name === "r") {
      return "require" + dot;
    }

    return "";
  }

  function replaceThrowConstAssignment(match, left, operator) {
    return "(" + left + operator;
  }

  return untransformRuntime;
}

/* harmony default export */ var untransform_runtime = (src_shared.inited ? src_shared.module.utilUntransformRuntime : src_shared.module.utilUntransformRuntime = untransform_runtime_init());
// CONCATENATED MODULE: ./src/error/scrub-stack-trace.js




function scrub_stack_trace_init() {
  "use strict";

  var PACKAGE_FILENAMES = esm.PACKAGE_FILENAMES;
  var columnInfoRegExp = /:1:\d+(?=\)?$)/gm;
  var traceRegExp = /(\n +at .+)+$/;

  function scrubStackTrace(stack) {
    if (typeof stack !== "string") {
      return "";
    }

    var match = traceRegExp.exec(stack);

    if (match === null) {
      return stack;
    }

    var index = match.index;
    var message = stack.slice(0, index);
    var trace = stack.slice(index).split("\n").filter(function (line) {
      for (var _i = 0, _length = PACKAGE_FILENAMES == null ? 0 : PACKAGE_FILENAMES.length; _i < _length; _i++) {
        var filename = PACKAGE_FILENAMES[_i];

        if (line.indexOf(filename) !== -1) {
          return false;
        }
      }

      return true;
    }).join("\n").replace(columnInfoRegExp, ":1");
    return message + untransform_runtime(trace);
  }

  return scrubStackTrace;
}

/* harmony default export */ var scrub_stack_trace = (src_shared.inited ? src_shared.module.errorScrubStackTrace : src_shared.module.errorScrubStackTrace = scrub_stack_trace_init());
// CONCATENATED MODULE: ./src/util/to-external-error.js




function to_external_error_init() {
  "use strict";

  var _shared$external = src_shared.external,
      ExError = _shared$external.Error,
      ExEvalError = _shared$external.EvalError,
      ExRangeError = _shared$external.RangeError,
      ExReferenceError = _shared$external.ReferenceError,
      ExSyntaxError = _shared$external.SyntaxError,
      ExTypeError = _shared$external.TypeError,
      ExURIError = _shared$external.URIError;
  var protoMap = new Map([["Error", ExError.prototype], ["EvalError", ExEvalError.prototype], ["RangeError", ExRangeError.prototype], ["ReferenceError", ExReferenceError.prototype], ["SyntaxError", ExSyntaxError.prototype], ["TypeError", ExTypeError.prototype], ["URIError", ExURIError.prototype]]);

  function toExternalError(error) {
    if (error instanceof Error) {
      var _getPrototypeOf = get_prototype_of(error),
          name = _getPrototypeOf.name;

      var proto = protoMap.get(name);

      if (proto !== void 0) {
        set_prototype_of(error, proto);
      }
    }

    return error;
  }

  return toExternalError;
}

/* harmony default export */ var to_external_error = (src_shared.inited ? src_shared.module.utilToExternalError : src_shared.module.utilToExternalError = to_external_error_init());
// CONCATENATED MODULE: ./src/error/mask-stack-trace.js


















function mask_stack_trace_init() {
  "use strict";

  var MAGIC_COOKIE = wasm.MAGIC_COOKIE;
  var arrowRegExp = /^(.+)\n( *\^+)\n(\n)?/m;
  var atNameRegExp = /^( *at (?:.+? \()?)(.+?)(?=:\d+)/gm;
  var blankRegExp = /^\s*$/;
  var headerRegExp = /^(.+?):(\d+)(?=\n)/;

  function maskStackTrace(error, options = {}) {
    if (!is_error(error)) {
      return error;
    }

    var column;
    var lineNumber;
    var content = options.content,
        filename = options.filename,
        inModule = options.inModule;
    var fromParser = is_parse_error(error);

    if (fromParser) {
      column = error.column;
      lineNumber = error.line;

      if (inModule === void 0) {
        inModule = error.inModule;
      }

      Reflect.deleteProperty(error, "column");
      Reflect.deleteProperty(error, "inModule");
      Reflect.deleteProperty(error, "line");
    }

    to_external_error(error);
    var stack = util_get(error, "stack");

    if (typeof stack !== "string") {
      return error;
    }

    var oldString = tryErrorToString(error); // Defer any file read operations until `error.stack` is accessed. Ideally,
    // we'd wrap `error` in a proxy to defer the initial `error.stack` access.
    // However, `Error.captureStackTrace()` will throw when receiving a proxy
    // wrapped error object.

    Reflect.defineProperty(error, "stack", {
      configurable: true,
      get: to_external_function(function () {
        // Prevent re-entering the getter by triggering the setter to convert
        // `error.stack` from an accessor property to a data property.
        this.stack = "";
        var message = to_string(util_get(this, "message"));
        var name = to_string(util_get(this, "name"));
        var newString = tryErrorToString(this);
        var masked = stack.replace(oldString, function () {
          return newString;
        });
        masked = fromParser ? maskParserStack(masked, name, message, lineNumber, column, content, filename) : maskEngineStack(masked, content, filename);
        var scrubber = inModule ? function (stack) {
          return fileNamesToURLs(scrub_stack_trace(stack));
        } : scrub_stack_trace;
        return this.stack = replace_without(masked, newString, scrubber);
      }),
      set: to_external_function(function (value) {
        Reflect.defineProperty(this, "stack", {
          configurable: true,
          value,
          writable: true
        });
      })
    });
    decorate_stack_trace(error);
    return error;
  }

  function maskEngineStack(stack, content, filename) {
    var match = headerRegExp.exec(stack);

    if (match === null) {
      return typeof filename === "string" ? filename + ":1\n" + stack : stack;
    }

    var header = match[0];
    var scriptFilename = match[1];
    var lineNumber = +match[2];
    var contentLines;
    var contentLine;
    var useDecoratorLine = scriptFilename !== filename && is_path(scriptFilename);

    if (!useDecoratorLine) {
      if (typeof content !== "string" && typeof filename === "string" && path_extname(filename) !== ".wasm") {
        content = read_file(filename, "utf8");
      }

      if (typeof content === "string" && !content.startsWith(MAGIC_COOKIE)) {
        var lineIndex = lineNumber - 1;
        contentLines = content.split("\n");

        if (lineIndex > -1 && lineIndex < contentLines.length) {
          contentLine = contentLines[lineIndex];
        } else {
          contentLine = "";
        }
      } else {
        useDecoratorLine = true;
      }
    }

    var foundArrow = false;
    stack = stack.replace(arrowRegExp, function (match, decoratorLine, decoratorArrow, decoratorNewline = "") {
      foundArrow = true;

      if (useDecoratorLine) {
        contentLine = decoratorLine;
      }

      if (typeof contentLine !== "string") {
        return "";
      }

      if (lineNumber === 1) {
        var wrapper = get_silent(src_module, "wrapper");

        if (Array.isArray(wrapper)) {
          var prefix = wrapper[0];

          if (typeof prefix === "string" && decoratorLine.startsWith(prefix)) {
            var length = prefix.length;
            decoratorLine = decoratorLine.slice(length);
            decoratorArrow = decoratorArrow.slice(length);
          }
        }
      }

      return decoratorLine === contentLine ? contentLine + "\n" + decoratorArrow + "\n" + decoratorNewline : contentLine + (contentLine ? "\n\n" : "\n");
    });

    if (foundArrow) {
      return stack;
    }

    if (contentLine && typeof contentLine === "string") {
      var length = header.length;
      stack = stack.slice(0, length) + "\n" + contentLine + "\n" + stack.slice(length);
    }

    return stack;
  } // Transform parser stack trace from:
  // <type>: <message> (<lineNumber>:<column>)
  //   ...
  // to:
  // path/to/file.js:<lineNumber>
  // <line of code, from the original source, where the error occurred>
  // <column indicator arrow>
  //
  // <type>: <message>
  //   ...


  function maskParserStack(stack, name, message, lineNumber, column, content, filename) {
    var spliceArgs = [0, 1];

    if (typeof filename === "string") {
      spliceArgs.push(filename + ":" + lineNumber);

      if (typeof content !== "string") {
        content = read_file(filename, "utf8");
      }
    }

    if (typeof content === "string") {
      var contentLines = content.split("\n");
      var lineIndex = lineNumber - 1;

      if (lineIndex < contentLines.length) {
        var decoratorArrow = "^";

        if (message.startsWith("Export '")) {
          // Increase arrow count to the length of the identifier.
          decoratorArrow = decoratorArrow.repeat(message.indexOf("'", 8) - 8);
        }

        var contentLine = contentLines[lineIndex];

        if (!blankRegExp.test(contentLine)) {
          spliceArgs.push(contentLine, " ".repeat(column) + decoratorArrow, "");
        }
      }
    }

    var stackLines = stack.split("\n");
    spliceArgs.push(name + ": " + message);
    stackLines.splice(...spliceArgs);
    return stackLines.join("\n");
  }

  function fileNamesToURLs(stack) {
    return stack.replace(headerRegExp, replaceHeader).replace(atNameRegExp, replaceAtName);
  }

  function replaceAtName(match, prefix, name) {
    return prefix + get_module_url(name);
  }

  function replaceHeader(match, filename, lineNumber) {
    return get_module_url(filename) + ":" + lineNumber;
  }

  function tryErrorToString(error) {
    try {
      return to_string(util_get(error, "name")) + ": " + to_string(util_get(error, "message"));
    } catch (_unused) {}

    return "";
  }

  return maskStackTrace;
}

/* harmony default export */ var mask_stack_trace = (src_shared.inited ? src_shared.module.errorMaskStackTrace : src_shared.module.errorMaskStackTrace = mask_stack_trace_init());
// CONCATENATED MODULE: ./src/util/prepare-value.js




function prepareValue(value) {
  "use strict";

  // This function may be called before `Loader.state.package.default` is set.
  var defaultPkg = src_loader.state.package.default;

  if ((defaultPkg === null || !defaultPkg.options.debug) && is_stack_trace_maskable(value)) {
    mask_stack_trace(value);
  }

  return value;
}

/* harmony default export */ var prepare_value = (prepareValue);
// CONCATENATED MODULE: ./src/util/is-module-namespace-object.js




function is_module_namespace_object_init() {
  "use strict";

  function isModuleNamespaceObject(value) {
    return is_object(value) && Reflect.has(value, src_shared.symbol.namespace) && is_own_proxy(value);
  }

  return isModuleNamespaceObject;
}

/* harmony default export */ var is_module_namespace_object = (src_shared.inited ? src_shared.module.utilIsModuleNamespaceObject : src_shared.module.utilIsModuleNamespaceObject = is_module_namespace_object_init());
// CONCATENATED MODULE: ./src/util/is-updatable-descriptor.js




function is_updatable_descriptor_init() {
  "use strict";

  function isUpdatableDescriptor(descriptor) {
    // Section 9.1.6.3: ValidateAndApplyPropertyDescriptor()
    // Step 7: If the data descriptor is not configurable or writable,
    // then the value must be the same.
    // https://tc39.github.io/ecma262/#sec-validateandapplypropertydescriptor
    return is_object(descriptor) && (descriptor.configurable === true || descriptor.writable === true) && has(descriptor, "value");
  }

  return isUpdatableDescriptor;
}

/* harmony default export */ var is_updatable_descriptor = (src_shared.inited ? src_shared.module.utilIsUpdatableDescriptor : src_shared.module.utilIsUpdatableDescriptor = is_updatable_descriptor_init());
// CONCATENATED MODULE: ./src/util/is-updatable-get.js


function is_updatable_get_init() {
  "use strict";

  function isUpdatableGet(object, name) {
    var descriptor = Reflect.getOwnPropertyDescriptor(object, name);

    if (descriptor !== void 0) {
      // Section 9.5.8: [[Get]]()
      // Step 10: If either the data descriptor is not configurable or writable,
      // or the accessor descriptor has no getter, then the value must be the same.
      // https://tc39.github.io/ecma262/#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver
      return descriptor.configurable === true || descriptor.writable === true || typeof descriptor.get === "function";
    }

    return true;
  }

  return isUpdatableGet;
}

/* harmony default export */ var is_updatable_get = (src_shared.inited ? src_shared.module.utilIsUpdatableGet : src_shared.module.utilIsUpdatableGet = is_updatable_get_init());
// CONCATENATED MODULE: ./src/util/own-property-names.js



function own_property_names_init() {
  "use strict";

  function ownPropertyNames(object) {
    return is_object_like(object) ? Object.getOwnPropertyNames(object) : [];
  }

  return ownPropertyNames;
}

/* harmony default export */ var own_property_names = (src_shared.inited ? src_shared.module.utilOwnPropertyNames : src_shared.module.utilOwnPropertyNames = own_property_names_init());
// CONCATENATED MODULE: ./src/util/to-raw-module-namespace-object.js



function to_raw_module_namespace_object_init() {
  "use strict";

  var toStringTagDescriptor = {
    value: "Module"
  };

  function toRawModuleNamespaceObject(object) {
    // Section 9.4.6: Module Namespace Exotic Objects
    // Module namespace objects have a `null` [[Prototype]].
    // https://tc39.github.io/ecma262/#sec-module-namespace-exotic-objects
    var namespace = {
      __proto__: null
    }; // Section 26.3.1: @@toStringTag
    // Module namespace objects have a @@toStringTag value of "Module".
    // https://tc39.github.io/ecma262/#sec-@@tostringtag

    Reflect.defineProperty(namespace, Symbol.toStringTag, toStringTagDescriptor);
    return util_assign(namespace, object);
  }

  return toRawModuleNamespaceObject;
}

/* harmony default export */ var to_raw_module_namespace_object = (src_shared.inited ? src_shared.module.utilToRawModuleNamespaceObject : src_shared.module.utilToRawModuleNamespaceObject = to_raw_module_namespace_object_init());
// CONCATENATED MODULE: ./src/util/proxy-inspectable.js



















var UNINITIALIZED_BINDING = "<uninitialized>";
var UNINITIALIZED_VALUE = {};
var nonWhitespaceRegExp = /\S/;

function proxyInspectable(object, options, map) {
  "use strict";

  if (!is_proxy_inspectable(object)) {
    return object;
  }

  if (map === void 0) {
    map = new Map();
  } else {
    var cached = map.get(object);

    if (cached !== void 0) {
      return cached;
    }
  }

  var objectIsProxy;
  var objectIsOwnProxy;
  var inspecting = false;
  var proxy = new own_proxy(object, {
    get(object, name, receiver) {
      if (receiver === proxy) {
        receiver = object;
      }

      var customInspectKey = src_shared.customInspectKey;
      var value = Reflect.get(object, name, receiver);
      var newValue = value;

      if (value === builtin_inspect && (name === customInspectKey || name === "inspect")) {
        newValue = util_inspect;
      } else if (inspecting || name !== customInspectKey) {
        if (name === "toString" && typeof value === "function") {
          newValue = generic_function.bind(value, object);
        }
      } else {
        newValue = to_external_function(function (...args) {
          inspecting = true;
          var recurseTimes = args[0],
              context = args[1];
          var contextAsOptions = util_assign(generic_object.create(), context);
          var showProxy = options.showProxy;
          contextAsOptions.customInspect = options.customInspect;
          contextAsOptions.depth = recurseTimes;
          contextAsOptions.showProxy = showProxy;

          try {
            if (object === UNINITIALIZED_VALUE) {
              return contextAsOptions.colors ? stylize(UNINITIALIZED_BINDING, "special") : UNINITIALIZED_BINDING;
            }

            if (is_module_namespace_object(object)) {
              return formatNamespaceObject(object, contextAsOptions);
            }

            if (objectIsOwnProxy === void 0) {
              objectIsOwnProxy = is_own_proxy(object);
            }

            if (objectIsProxy === void 0) {
              objectIsProxy = is_proxy(object);
            }

            if (!showProxy || !objectIsProxy || objectIsOwnProxy) {
              if (typeof value !== "function") {
                contextAsOptions.customInspect = true;
              }

              contextAsOptions.showProxy = false;
              return util_inspect(proxy, contextAsOptions);
            }

            return formatProxy(object, contextAsOptions);
          } finally {
            inspecting = false;
          }
        });
      }

      if (newValue !== value && is_updatable_get(object, name)) {
        return newValue;
      }

      return prepare_value(value);
    },

    getOwnPropertyDescriptor(object, name) {
      var descriptor = Reflect.getOwnPropertyDescriptor(object, name);

      if (is_updatable_descriptor(descriptor)) {
        var value = descriptor.value;

        if (is_object_like(value)) {
          descriptor.value = proxyInspectable(value, options, map);
        }
      }

      return descriptor;
    }

  });
  map.set(object, proxy);
  map.set(proxy, proxy);
  return proxy;
}

function formatNamespaceObject(namespace, context) {
  "use strict";

  // Avoid `Object.keys()` because it calls `[[GetOwnProperty]]()`,
  // which calls `[[Get]]()`, which calls `GetBindingValue()`,
  // which throws for uninitialized bindings.
  //
  // Section 8.1.1.5.1: GetBindingValue()
  // Step 5: Throw a reference error if the binding is uninitialized.
  // https://tc39.github.io/ecma262/#sec-module-environment-records-getbindingvalue-n-s
  var names = own_property_names(namespace);
  var object = to_raw_module_namespace_object();

  for (var _i = 0, _length = names == null ? 0 : names.length; _i < _length; _i++) {
    var name = names[_i];
    object[name] = tryGet(namespace, name);
  }

  var result = builtin_inspect(object, context);
  var indentation = result.slice(0, result.search(nonWhitespaceRegExp));
  var trimmed = result.slice(result.indexOf("{"), result.lastIndexOf("}") + 1);
  return indentation + "[Module] " + trimmed;
}

function formatProxy(proxy, context) {
  "use strict";

  var details = util_get_proxy_details(proxy);
  var object = proxy;

  if (details !== void 0) {
    object = new Proxy(toInspectable(details[0], context), toInspectable(details[1], context));
  }

  var contextAsOptions = util_assign({}, context);
  contextAsOptions.customInspect = true;
  return util_inspect(object, contextAsOptions);
}

function stylize(string, styleType) {
  "use strict";

  var style = builtin_inspect.styles[styleType];

  if (style === void 0) {
    return string;
  }

  var _builtinInspect$color = builtin_inspect.colors[style],
      foregroundCode = _builtinInspect$color[0],
      backgroundCode = _builtinInspect$color[1];
  return "\u001B[" + foregroundCode + "m" + string + "\u001B[" + backgroundCode + "m";
}

function toInspectable(value, options) {
  "use strict";

  return {
    __proto__: null,
    [src_shared.customInspectKey]: to_external_function(function (recurseTimes) {
      var contextAsOptions = util_assign(generic_object.create(), options);
      contextAsOptions.depth = recurseTimes;
      return builtin_inspect(value, contextAsOptions);
    })
  };
}

function tryGet(object, name) {
  "use strict";

  try {
    return Reflect.get(object, name);
  } catch (_unused) {}

  return UNINITIALIZED_VALUE;
}

/* harmony default export */ var proxy_inspectable = (proxyInspectable);
// CONCATENATED MODULE: ./src/util/inspect.js











var inspect_PROXY_PREFIX = constant_inspect.PROXY_PREFIX;

function inspect_inspect(...args) {
  var value = args[0],
      options = args[1],
      depth = args[2];

  if (!is_object_like(value)) {
    return Reflect.apply(util_inspect, this, args);
  }

  value = prepare_value(value);
  var customOptions = generic_object.create();

  if (typeof options === "boolean") {
    customOptions.showHidden = true;
  } else {
    util_assign(customOptions, options);
  }

  var defaultInspectOptions = src_shared.defaultInspectOptions;
  var customInspect = has(customOptions, "customInspect") ? customOptions.customInspect : defaultInspectOptions.customInspect;
  var showProxy = has(customOptions, "showProxy") ? customOptions.showProxy : defaultInspectOptions.showProxy;

  if (depth !== void 0 && !has(customOptions, "depth")) {
    customOptions.depth = depth;
  }

  args[0] = value;
  args[1] = customOptions;
  var result = Reflect.apply(tryInspect, this, args);

  if (!is_proxy_inspectable(value) || result.indexOf(inspect_PROXY_PREFIX) === -1 && !is_module_namespace_object_like(value)) {
    return result;
  }

  customOptions.customInspect = customInspect;
  customOptions.showProxy = showProxy;
  options = util_assign(generic_object.create(), customOptions);
  args[0] = proxy_inspectable(value, options);
  customOptions.customInspect = true;
  customOptions.showProxy = false;
  return Reflect.apply(util_inspect, this, args);
}

function tryInspect(...args) {
  try {
    return Reflect.apply(util_inspect, this, args);
  } catch (_unused) {}

  return "";
}

/* harmony default export */ var src_util_inspect = (inspect_inspect);
// CONCATENATED MODULE: ./src/util/proxy-wrap.js



function proxy_wrap_init() {
  "use strict";

  function proxyWrap(func, wrapper) {
    return new own_proxy(func, {
      apply(func, thisArg, args) {
        return Reflect.apply(wrapper, thisArg, [func, args]);
      },

      construct(func, args, newTarget) {
        return Reflect.construct(wrapper, [func, args], newTarget);
      }

    });
  }

  return proxyWrap;
}

/* harmony default export */ var proxy_wrap = (src_shared.inited ? src_shared.module.utilProxyWrap : src_shared.module.utilProxyWrap = proxy_wrap_init());
// CONCATENATED MODULE: ./src/util/to-wrapper.js


function to_wrapper_init() {
  "use strict";

  function toWrapper(func) {
    return function (unwrapped, args) {
      return Reflect.apply(func, this, args);
    };
  }

  return toWrapper;
}

/* harmony default export */ var to_wrapper = (src_shared.inited ? src_shared.module.utilToWrapper : src_shared.module.utilToWrapper = to_wrapper_init());
// CONCATENATED MODULE: ./src/builtin/inspect.js




var builtinInspect = proxy_wrap(safe_util.inspect, to_wrapper(src_util_inspect));
/* harmony default export */ var builtin_inspect = (builtinInspect);
// CONCATENATED MODULE: ./src/util/format-with-options.js
// Based on `util.formatWithOptions()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/util/inspect.js








var format_with_options_LOWERCASE_D = char_code.LOWERCASE_D,
    format_with_options_LOWERCASE_F = char_code.LOWERCASE_F,
    format_with_options_LOWERCASE_I = char_code.LOWERCASE_I,
    format_with_options_LOWERCASE_J = char_code.LOWERCASE_J,
    format_with_options_LOWERCASE_O = char_code.LOWERCASE_O,
    format_with_options_LOWERCASE_S = char_code.LOWERCASE_S,
    PERCENT = char_code.PERCENT,
    UPPERCASE_O = char_code.UPPERCASE_O;

function formatWithOptions(options, ...args) {
  var first = args[0];
  var argsLength = args.length;
  var argsIndex = 0;
  var join = "";
  var result = "";

  if (typeof first === "string") {
    if (argsLength === 1) {
      return first;
    }

    var length = first.length;
    var lastIndex = length - 1;
    var oOptions;
    var sOptions;
    var i = -1;
    var lastPos = 0;

    while (++i < lastIndex) {
      if (first.charCodeAt(i) === PERCENT) {
        var nextCode = first.charCodeAt(++i);

        if (argsIndex + 1 !== argsLength) {
          var segment = void 0;

          switch (nextCode) {
            case format_with_options_LOWERCASE_S:
              {
                var value = args[++argsIndex];

                if (typeof value === "bigint") {
                  segment = value + "n";
                } else if (is_object(value)) {
                  if (sOptions === void 0) {
                    sOptions = util_assign({}, options, {
                      breakLength: 120,
                      colors: false,
                      compact: true,
                      depth: 0
                    });
                  }

                  segment = src_util_inspect(value, sOptions);
                } else {
                  segment = String(value);
                }

                break;
              }

            case format_with_options_LOWERCASE_J:
              segment = tryStringify(args[++argsIndex]);
              break;

            case format_with_options_LOWERCASE_D:
              {
                var _value = args[++argsIndex];
                var type = typeof _value;

                if (type === "bigint") {
                  segment = _value + "n";
                } else if (type === "symbol") {
                  segment = "NaN";
                } else {
                  segment = Number(_value) + "";
                }

                break;
              }

            case UPPERCASE_O:
              segment = src_util_inspect(args[++argsIndex], options);
              break;

            case format_with_options_LOWERCASE_O:
              if (oOptions === void 0) {
                oOptions = util_assign({}, options, {
                  depth: 4,
                  showHidden: true,
                  showProxy: true
                });
              }

              segment = src_util_inspect(args[++argsIndex], oOptions);
              break;

            case format_with_options_LOWERCASE_I:
              {
                var _value2 = args[++argsIndex];

                var _type = typeof _value2;

                if (_type === "bigint") {
                  segment = _value2 + "n";
                } else if (_type === "symbol") {
                  segment = "NaN";
                } else {
                  segment = parseInt(_value2) + "";
                }

                break;
              }

            case format_with_options_LOWERCASE_F:
              {
                var _value3 = args[++argsIndex];
                segment = typeof _value3 === "symbol" ? "NaN" : parseFloat(_value3) + "";
                break;
              }

            case PERCENT:
              result += first.slice(lastPos, i);
              lastPos = i + 1;
          }

          if (lastPos !== i - 1) {
            result += first.slice(lastPos, i - 1);
          }

          result += segment;
          lastPos = i + 1;
        } else if (nextCode === PERCENT) {
          result += first.slice(lastPos, i);
          lastPos = i + 1;
        }
      }
    }

    if (lastPos !== 0) {
      ++argsIndex;
      join = " ";

      if (lastPos < length) {
        result += first.slice(lastPos);
      }
    }
  }

  while (argsIndex < argsLength) {
    var _value4 = args[argsIndex];
    result += join + (typeof _value4 === "string" ? _value4 : src_util_inspect(_value4, options));
    join = " ";
    ++argsIndex;
  }

  return result;
}

function tryStringify(value) {
  "use strict";

  try {
    return JSON.stringify(value);
  } catch (e) {
    if (is_error(e)) {
      if (util_get(e, "name") === "TypeError" && util_get(e, "message") === src_shared.circularErrorMessage) {
        return "[Circular]";
      }

      to_external_error(e);
    }

    throw e;
  }
}

/* harmony default export */ var format_with_options = (formatWithOptions);
// CONCATENATED MODULE: ./src/util/format.js
// Based on `util.format()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/util/inspect.js



function format(...args) {
  return format_with_options(empty_object, ...args);
}

/* harmony default export */ var util_format = (format);
// CONCATENATED MODULE: ./src/builtin/util.js











 // `util.formatWithOptions()` and `util.types` were added in Node 10.

var safeFormatWithOptions = safe_util.formatWithOptions;
var safeTypes = safe_util.types;
var builtinTypes;

if (is_object_like(safeTypes)) {
  builtinTypes = generic_object.create();
  var builtinIsModuleNamespaceObject = proxy_wrap(safeTypes.isModuleNamespaceObject, to_wrapper(is_module_namespace_object));
  var builtinIsProxy = proxy_wrap(safeTypes.isProxy, function (func, [value]) {
    return func(value) && !is_own_proxy(value);
  });
  var typesNames = own_keys(safeTypes);

  for (var util_i = 0, util_length = typesNames == null ? 0 : typesNames.length; util_i < util_length; util_i++) {
    var util_name = typesNames[util_i];

    if (util_name === "isModuleNamespaceObject") {
      builtinTypes.isModuleNamespaceObject = builtinIsModuleNamespaceObject;
    } else if (util_name === "isProxy") {
      builtinTypes.isProxy = builtinIsProxy;
    } else {
      copy_property(builtinTypes, safeTypes, util_name);
    }
  }
}

var builtinUtil = generic_object.create();
var utilNames = own_keys(safe_util);

for (var util_i2 = 0, util_length2 = utilNames == null ? 0 : utilNames.length; util_i2 < util_length2; util_i2++) {
  var builtin_util_name = utilNames[util_i2];

  if (builtin_util_name === "format") {
    builtinUtil.format = proxy_wrap(safe_util.format, to_wrapper(util_format));
  } else if (builtin_util_name === "formatWithOptions") {
    if (typeof safeFormatWithOptions === "function") {
      builtinUtil.formatWithOptions = proxy_wrap(safeFormatWithOptions, to_wrapper(format_with_options));
    }
  } else if (builtin_util_name === "inspect") {
    builtinUtil.inspect = builtin_inspect;
  } else if (builtin_util_name === "types") {
    if (builtinTypes !== void 0) {
      builtinUtil.types = builtinTypes;
    }
  } else {
    copy_property(builtinUtil, safe_util, builtin_util_name);
  }
}

/* harmony default export */ var builtin_util = (builtinUtil);
// CONCATENATED MODULE: ./src/real/console.js



/* harmony default export */ var real_console = (src_shared.inited ? src_shared.module.realConsole : src_shared.module.realConsole = unwrap_proxy(real_require("console")));
// CONCATENATED MODULE: ./src/safe/console.js






function console_init() {
  "use strict";

  var safeConsole = util_safe(real_console);
  var Console = safeConsole.Console;
  set_property(safeConsole, "Console", mask_function(util_safe(Console), Console));
  return safeConsole;
}

/* harmony default export */ var safe_console = (src_shared.inited ? src_shared.module.safeConsole : src_shared.module.safeConsole = console_init());
// CONCATENATED MODULE: ./src/safe/global-console.js


/* harmony default export */ var global_console = (src_shared.inited ? src_shared.module.safeGlobalConsole : src_shared.module.safeGlobalConsole = util_safe(console));
// CONCATENATED MODULE: ./src/builtin/console.js

























var ELECTRON_RENDERER = constant_env.ELECTRON_RENDERER,
    FLAGS = constant_env.FLAGS,
    HAS_INSPECTOR = constant_env.HAS_INSPECTOR;
var SafeConsole = safe_console.Console;
var console_SafeProto = SafeConsole.prototype;
var SafeProtoNames = own_keys(console_SafeProto);
var dirOptions = {
  customInspect: true
};
var wrapperMap = createWrapperMap(console_SafeProto);
var isConsoleSymbol = findByRegExp(Object.getOwnPropertySymbols(safe_console), /IsConsole/i);

if (typeof isConsoleSymbol !== "symbol") {
  isConsoleSymbol = Symbol("kIsConsole");
}

function assertWrapper(func, [expression, ...rest]) {
  return Reflect.apply(func, this, [expression, ...transform(rest, toCustomInspectable)]);
}

function createBuiltinConsole() {
  "use strict";

  var newBuiltinConsole = tryCreateConsole(safe_process);

  if (newBuiltinConsole === null) {
    return real_console;
  }

  if (HAS_INSPECTOR && FLAGS.inspect) {
    var consoleCall = src_binding.inspector.consoleCall;
    var originalConsole = src_shared.originalConsole;
    var useConsoleCall = typeof consoleCall === "function";
    var emptyConfig = useConsoleCall ? {} : null;
    var originalNames = util_keys(originalConsole);

    for (var _i = 0, _length = originalNames == null ? 0 : originalNames.length; _i < _length; _i++) {
      var name = originalNames[_i];

      if (!isKeyAssignable(name)) {
        continue;
      }

      var originalFunc = originalConsole[name];

      if (typeof originalFunc === "function") {
        var builtinFunc = newBuiltinConsole[name];

        if (useConsoleCall && typeof builtinFunc === "function" && has(newBuiltinConsole, name)) {
          // Use `consoleCall()` to combine `builtinFunc()` and
          // `originalFunc()` without adding to the call stack.
          set_property(newBuiltinConsole, name, generic_function.bind(consoleCall, void 0, originalFunc, builtinFunc, emptyConfig));
        } else {
          set_property(newBuiltinConsole, name, originalFunc);
        }
      }
    }
  } else if (ELECTRON_RENDERER) {
    var globalNames = util_keys(global_console);

    for (var _i2 = 0, _length2 = globalNames == null ? 0 : globalNames.length; _i2 < _length2; _i2++) {
      var _name = globalNames[_i2];

      if (!isKeyAssignable(_name)) {
        continue;
      }

      var globalFunc = global_console[_name];

      if (typeof globalFunc === "function") {
        set_property(newBuiltinConsole, _name, globalFunc);
      }
    }
  }

  var safeNames = own_keys(safe_console);

  for (var _i3 = 0, _length3 = safeNames == null ? 0 : safeNames.length; _i3 < _length3; _i3++) {
    var _name2 = safeNames[_i3];

    if (isKeyAssignable(_name2) && !has(newBuiltinConsole, _name2)) {
      copy_property(newBuiltinConsole, safe_console, _name2);
    }
  }

  newBuiltinConsole.Console = console_Console;
  return newBuiltinConsole;
}

function createBuiltinMethodMap(consoleObject) {
  "use strict";

  var names = util_keys(consoleObject);
  var newBuiltinMethodMap = new Map();

  for (var _i4 = 0, _length4 = names == null ? 0 : names.length; _i4 < _length4; _i4++) {
    var name = names[_i4];
    var func = consoleObject[name];
    var globalFunc = global_console[name];

    if (typeof func === "function" && typeof globalFunc === "function" && (!isKeyAssignable(name) || is_native_like_function(globalFunc))) {
      newBuiltinMethodMap.set(globalFunc, func);
    }
  }

  return newBuiltinMethodMap;
}

function createConsole({
  stderr,
  stdout
}) {
  var ConsoleProto = console_Console.prototype;
  var newConsole = Reflect.construct(console_Console, src_shared.support.consoleOptions ? [{
    stderr,
    stdout
  }] : [stdout, stderr]);
  set_prototype_of(newConsole, generic_object.create());

  for (var _i5 = 0, _length5 = SafeProtoNames == null ? 0 : SafeProtoNames.length; _i5 < _length5; _i5++) {
    var name = SafeProtoNames[_i5];

    if (isKeyAssignable(name) && !has(newConsole, name)) {
      copy_property(newConsole, ConsoleProto, name);
    }
  }

  return newConsole;
}

function createWrapperMap(consoleObject) {
  "use strict";

  var wrappedLog = console_wrapBuiltin(consoleObject.log, logWrapper);
  var newWrapperMap = new Map([["assert", console_wrapBuiltin(consoleObject.assert, assertWrapper)], ["debug", wrappedLog], ["dir", console_wrapBuiltin(consoleObject.dir, dirWrapper)], ["dirxml", wrappedLog], ["info", wrappedLog], ["log", wrappedLog], ["trace", console_wrapBuiltin(consoleObject.trace)], ["warn", console_wrapBuiltin(consoleObject.warn)]]);
  var names = util_keys(consoleObject);

  for (var _i6 = 0, _length6 = names == null ? 0 : names.length; _i6 < _length6; _i6++) {
    var name = names[_i6];

    if (isKeyAssignable(name) && !newWrapperMap.has(name)) {
      var func = consoleObject[name];

      if (typeof func === "function") {
        newWrapperMap.set(name, console_wrapBuiltin(func));
      }
    }
  }

  return newWrapperMap;
}

function defaultWrapper(func, args) {
  "use strict";

  return Reflect.apply(func, this, args);
}

function dirWrapper(func, [object, options]) {
  return Reflect.apply(func, this, [{
    [src_shared.customInspectKey](recurseTimes, context) {
      var contextAsOptions = util_assign({}, context, options);
      contextAsOptions.customInspect = has(options, "customInspect") ? options.customInspect : false;
      contextAsOptions.depth = recurseTimes;
      return builtin_util.inspect(object, contextAsOptions);
    }

  }, dirOptions]);
}

function findByRegExp(array, regexp) {
  "use strict";

  for (var _i7 = 0, _length7 = array == null ? 0 : array.length; _i7 < _length7; _i7++) {
    var value = array[_i7];

    if (regexp.test(to_string(value))) {
      return value;
    }
  }
}

function isKeyAssignable(name) {
  "use strict";

  return name !== "Console" && name !== "constructor";
}

function logWrapper(func, args) {
  "use strict";

  return Reflect.apply(func, this, transform(args, toCustomInspectable));
}

function toCustomInspectable(value) {
  "use strict";

  if (!is_object(value)) {
    return value;
  }

  return {
    [src_shared.customInspectKey](recurseTimes, context) {
      var contextAsOptions = util_assign({}, context);
      contextAsOptions.depth = recurseTimes;
      return builtin_util.inspect(value, contextAsOptions);
    }

  };
}

function transform(array, iteratee) {
  "use strict";

  var length = array.length;
  var i = -1;

  while (++i < length) {
    array[i] = iteratee(array[i]);
  }

  return array;
}

function tryCreateConsole(processObject) {
  "use strict";

  try {
    return createConsole(processObject);
  } catch (_unused) {}

  return null;
}

function console_wrapBuiltin(builtinFunc, wrapper = defaultWrapper) {
  // Define method with shorthand syntax so it's not constructable.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions#Method_definitions_are_not_constructable
  var object = {
    method(...args) {
      var defaultInspectOptions = src_shared.defaultInspectOptions;
      var customInspect = defaultInspectOptions.customInspect;
      set_property(defaultInspectOptions, "customInspect", true);

      try {
        return Reflect.apply(wrapper, this, [builtinFunc, args]);
      } finally {
        set_property(defaultInspectOptions, "customInspect", customInspect);
      }
    }

  };
  return mask_function(object.method, builtinFunc);
}

var console_Console = mask_function(function (...args) {
  var newTarget = new.target;

  if (newTarget === void 0) {
    return Reflect.construct(console_Console, args);
  }

  this[isConsoleSymbol] = true;
  var ConsoleProto = console_Console.prototype;
  var ConsoleProtoNames = util_keys(ConsoleProto);

  for (var _i8 = 0, _length8 = ConsoleProtoNames == null ? 0 : ConsoleProtoNames.length; _i8 < _length8; _i8++) {
    var name = ConsoleProtoNames[_i8];

    if (isKeyAssignable(name)) {
      var func = this[name];

      if (typeof func === "function") {
        this[name] = generic_function.bind(func, this);
      }
    }
  }

  var newSafeConsole = Reflect.construct(SafeConsole, args, newTarget);
  var newSafeNames = own_keys(newSafeConsole);

  for (var _i9 = 0, _length9 = newSafeNames == null ? 0 : newSafeNames.length; _i9 < _length9; _i9++) {
    var _name3 = newSafeNames[_i9];

    if (isKeyAssignable(_name3) && !has(this, _name3)) {
      copy_property(this, newSafeConsole, _name3);
    }
  }
}, SafeConsole);
var console_ConsoleProto = console_Console.prototype;

for (var console_i10 = 0, console_length10 = SafeProtoNames == null ? 0 : SafeProtoNames.length; console_i10 < console_length10; console_i10++) {
  var console_name = SafeProtoNames[console_i10];

  if (!isKeyAssignable(console_name)) {
    continue;
  }

  var console_wrapped = wrapperMap.get(console_name);

  if (console_wrapped === void 0) {
    copy_property(console_ConsoleProto, console_SafeProto, console_name);
  } else {
    var console_descriptor = Reflect.getOwnPropertyDescriptor(console_SafeProto, console_name);
    Reflect.defineProperty(console_ConsoleProto, console_name, {
      configurable: console_descriptor.configurable,
      enumerable: console_descriptor.enumerable,
      value: console_wrapped,
      writable: console_descriptor.writable === true || typeof console_descriptor.set === "function"
    });
  }
}

Reflect.defineProperty(console_Console, Symbol.hasInstance, {
  value: to_external_function(function (instance) {
    return instance[isConsoleSymbol];
  })
});
var builtinConsole;
var builtinMethodMap;
var console_proxy = new own_proxy(console, {
  get(console, name, receiver) {
    if (receiver === console_proxy) {
      receiver = console;
    }

    var value = Reflect.get(console, name, receiver);

    if (is_updatable_get(console, name)) {
      if (builtinConsole === void 0) {
        builtinConsole = createBuiltinConsole();
        builtinMethodMap = createBuiltinMethodMap(builtinConsole);
      }

      var builtinMethod = builtinMethodMap.get(value);

      if (builtinMethod !== void 0) {
        return builtinMethod;
      }
    }

    return value;
  },

  getOwnPropertyDescriptor(console, name) {
    var descriptor = Reflect.getOwnPropertyDescriptor(console, name);

    if (is_updatable_descriptor(descriptor)) {
      if (builtinConsole === void 0) {
        builtinConsole = createBuiltinConsole();
        builtinMethodMap = createBuiltinMethodMap(builtinConsole);
      }

      var builtinMethod = builtinMethodMap.get(descriptor.value);

      if (builtinMethod !== void 0) {
        descriptor.value = builtinMethod;
      }
    }

    return descriptor;
  }

});
/* harmony default export */ var builtin_console = (console_proxy);
// CONCATENATED MODULE: ./src/util/assign-properties.js




function assign_properties_init() {
  "use strict";

  function assignProperties(object) {
    var length = arguments.length;
    var i = 0;

    while (++i < length) {
      var source = arguments[i];
      var names = own_keys(source);

      for (var _i = 0, _length = names == null ? 0 : names.length; _i < _length; _i++) {
        var name = names[_i];
        copy_property(object, source, name);
      }
    }

    return object;
  }

  return assignProperties;
}

/* harmony default export */ var assign_properties = (src_shared.inited ? src_shared.module.utilAssignProperties : src_shared.module.utilAssignProperties = assign_properties_init());
// CONCATENATED MODULE: ./src/real/timers.js



/* harmony default export */ var timers = (src_shared.inited ? src_shared.module.realTimers : src_shared.module.realTimers = unwrap_proxy(real_require("timers")));
// CONCATENATED MODULE: ./src/safe/timers.js






function timers_init() {
  "use strict";

  var ELECTRON = constant_env.ELECTRON;
  var safeTimers = util_safe(timers);

  if (ELECTRON) {
    var unsafeGlobal = src_shared.unsafeGlobal;
    set_property(safeTimers, "setImmediate", unsafeGlobal.setImmediate);
    set_property(safeTimers, "setInterval", unsafeGlobal.setInterval);
    set_property(safeTimers, "setTimeout", unsafeGlobal.setTimeout);
  }

  return safeTimers;
}

var timers_safeTimers = src_shared.inited ? src_shared.module.safeTimers : src_shared.module.safeTimers = timers_init();
var setImmediate = timers_safeTimers.setImmediate;

/* harmony default export */ var safe_timers = (timers_safeTimers);
// CONCATENATED MODULE: ./src/builtin/timers.js




/* harmony default export */ var builtin_timers = (src_shared.inited ? src_shared.module.builtinTimers : src_shared.module.builtinTimers = assign_properties(generic_object.create(), safe_timers));
// CONCATENATED MODULE: ./src/real/vm.js



/* harmony default export */ var real_vm = (src_shared.inited ? src_shared.module.realVM : src_shared.module.realVM = unwrap_proxy(real_require("vm")));
// CONCATENATED MODULE: ./src/safe/vm.js










function vm_init() {
  "use strict";

  var safeVM = util_safe(real_vm);
  var Script = safeVM.Script;
  var SafeScript = util_safe(Script);
  var SafeProto = SafeScript.prototype;
  var contextifyProto = get_prototype_of(Script.prototype);
  var names = all_keys(contextifyProto);

  for (var _i = 0, _length = names == null ? 0 : names.length; _i < _length; _i++) {
    var name = names[_i];

    if (!has(SafeProto, name)) {
      copy_property(SafeProto, contextifyProto, name);
    }
  }

  set_prototype_of(SafeProto, contextifyProto);
  set_property(safeVM, "Script", SafeScript);
  return safeVM;
}

var vm_safeVM = src_shared.inited ? src_shared.module.safeVM : src_shared.module.safeVM = vm_init();
var vm_Script = vm_safeVM.Script;

/* harmony default export */ var safe_vm = (vm_safeVM);
// CONCATENATED MODULE: ./src/builtin/vm.js






function builtin_vm_init() {
  "use strict";

  var builtinVM = generic_object.create();
  var names = own_keys(safe_vm);

  for (var _i = 0, _length = names == null ? 0 : names.length; _i < _length; _i++) {
    var name = names[_i];

    if (name !== "Module" && name !== "SourceTextModule") {
      copy_property(builtinVM, safe_vm, name);
    }
  }

  return builtinVM;
}

/* harmony default export */ var builtin_vm = (src_shared.inited ? src_shared.module.builtinVM : src_shared.module.builtinVM = builtin_vm_init());
// CONCATENATED MODULE: ./src/builtin-modules.js










var builtinModules = {
  __proto__: null
};
var builtin_modules_cache = src_shared.memoize.builtinModules;

function getExports(id) {
  "use strict";

  switch (id) {
    case "console":
      return builtin_console;

    case "module":
      return src_module;

    case "timers":
      return builtin_timers;

    case "util":
      return builtin_util;

    case "vm":
      return builtin_vm;
  }

  return unwrap_proxy(real_require(id));
}

var builtin_modules_loop = function (id) {
  set_deferred(builtinModules, id, function () {
    "use strict";

    var cached = builtin_modules_cache.get(id);

    if (cached !== void 0) {
      return cached;
    }

    var mod = new src_module(id);
    mod.exports = getExports(id);
    mod.loaded = true;

    if (id !== "console" && id !== "module" && id !== "util") {
      builtin_modules_cache.set(id, mod);
    }

    return mod;
  });
};

for (var builtin_modules_i = 0, builtin_modules_length = builtin_ids == null ? 0 : builtin_ids.length; builtin_modules_i < builtin_modules_length; builtin_modules_i++) {
  var builtin_modules_id = builtin_ids[builtin_modules_i];

  builtin_modules_loop(builtin_modules_id);
}

/* harmony default export */ var builtin_modules = (builtinModules);
// CONCATENATED MODULE: ./src/util/instance-of.js



function instance_of_init() {
  "use strict";

  function instanceOf(value, Ctor) {
    var CtorProto = Ctor.prototype;
    var proto = value;

    while ((proto = get_prototype_of(proto)) !== null) {
      if (proto === CtorProto) {
        return true;
      }
    }

    return false;
  }

  return instanceOf;
}

/* harmony default export */ var instance_of = (src_shared.inited ? src_shared.module.utilInstanceOf : src_shared.module.utilInstanceOf = instance_of_init());
// CONCATENATED MODULE: ./src/util/get-getter.js


function get_getter_init() {
  "use strict";

  var __lookupGetter__ = Object.prototype.__lookupGetter__;

  function getGetter(object, name) {
    var useAsDescriptor = name === void 0;

    if (useAsDescriptor || !src_shared.support.lookupShadowed) {
      var descriptor = useAsDescriptor ? object : Reflect.getOwnPropertyDescriptor(object, name);

      if (descriptor !== void 0) {
        return descriptor.get;
      }

      if (useAsDescriptor) {
        return;
      }
    }

    return __lookupGetter__.call(object, name);
  }

  return getGetter;
}

/* harmony default export */ var get_getter = (src_shared.inited ? src_shared.module.utilGetGetter : src_shared.module.utilGetGetter = get_getter_init());
// CONCATENATED MODULE: ./src/util/get-setter.js


function get_setter_init() {
  "use strict";

  var __lookupSetter__ = Object.prototype.__lookupSetter__;

  function getSetter(object, name) {
    var useAsDescriptor = name === void 0;

    if (useAsDescriptor || !src_shared.support.lookupShadowed) {
      var descriptor = useAsDescriptor ? object : Reflect.getOwnPropertyDescriptor(object, name);

      if (descriptor !== void 0) {
        return descriptor.set;
      }

      if (useAsDescriptor) {
        return;
      }
    }

    return __lookupSetter__.call(object, name);
  }

  return getSetter;
}

/* harmony default export */ var get_setter = (src_shared.inited ? src_shared.module.utilGetSetter : src_shared.module.utilGetSetter = get_setter_init());
// CONCATENATED MODULE: ./src/util/is-arrow-function.js


function is_arrow_function_init() {
  "use strict";

  // `Function#toString()` is used to extract the coerced string source of a
  // function regardless of any custom `toString()` method it may have.
  var toString = Function.prototype.toString;
  var arrowFuncRegex = /^[^=]*=>/;

  function isArrowFunction(value) {
    if (typeof value === "function") {
      // A try-catch is needed in Node < 10 to avoid a type error when
      // coercing proxy wrapped functions.
      try {
        return arrowFuncRegex.test(toString.call(value));
      } catch (_unused) {}
    }

    return false;
  }

  return isArrowFunction;
}

/* harmony default export */ var is_arrow_function = (src_shared.inited ? src_shared.module.utilIsArrowFunction : src_shared.module.utilIsArrowFunction = is_arrow_function_init());
// CONCATENATED MODULE: ./src/util/is-bound-function.js



function is_bound_function_init() {
  "use strict";

  function isBoundFunction(value) {
    if (!is_native_like_function(value)) {
      return false;
    }

    var name = value.name; // Section 19.2.3.2: Function#bind()
    // Step 11: Bound function names start with "bound ".
    // https://tc39.github.io/ecma262/#sec-function.prototype.bind

    return typeof name === "string" && name.startsWith("bound ");
  }

  return isBoundFunction;
}

/* harmony default export */ var is_bound_function = (src_shared.inited ? src_shared.module.utilIsBoundFunction : src_shared.module.utilIsBoundFunction = is_bound_function_init());
// CONCATENATED MODULE: ./src/util/is-class-function.js


function is_class_function_init() {
  "use strict";

  // `Function#toString()` is used to extract the coerced string source of a
  // function regardless of any custom `toString()` method it may have.
  var toString = Function.prototype.toString;
  var classFuncRegex = /^class /;

  function isClassFunction(value) {
    if (typeof value === "function") {
      // A try-catch is needed in Node < 10 to avoid a type error when
      // coercing proxy wrapped functions.
      try {
        return classFuncRegex.test(toString.call(value));
      } catch (_unused) {}
    }

    return false;
  }

  return isClassFunction;
}

/* harmony default export */ var is_class_function = (src_shared.inited ? src_shared.module.utilIsClassFunction : src_shared.module.utilIsClassFunction = is_class_function_init());
// CONCATENATED MODULE: ./src/util/is-class-like-function.js




function is_class_like_function_init() {
  "use strict";

  var UPPERCASE_A = char_code.UPPERCASE_A,
      UPPERCASE_Z = char_code.UPPERCASE_Z;

  function isClassLikeFunction(value) {
    if (typeof value === "function") {
      if (is_class_function(value)) {
        return true;
      }

      var name = value.name;

      if (typeof name === "string") {
        var code = name.charCodeAt(0);
        return code >= UPPERCASE_A && code <= UPPERCASE_Z;
      }
    }

    return false;
  }

  return isClassLikeFunction;
}

/* harmony default export */ var is_class_like_function = (src_shared.inited ? src_shared.module.utilIsClassLikeFunction : src_shared.module.utilIsClassLikeFunction = is_class_like_function_init());
// CONCATENATED MODULE: ./src/util/is-plain-object.js




function is_plain_object_init() {
  "use strict";

  function isPlainObject(value) {
    if (!is_object(value)) {
      return false;
    }

    var proto = get_prototype_of(value);
    var nextProto = proto;
    var rootProto = null;

    while (nextProto) {
      rootProto = nextProto;
      nextProto = get_prototype_of(rootProto);
    }

    return proto === rootProto;
  }

  return isPlainObject;
}

/* harmony default export */ var is_plain_object = (src_shared.inited ? src_shared.module.utilIsPlainObject : src_shared.module.utilIsPlainObject = is_plain_object_init());
// CONCATENATED MODULE: ./src/util/is-updatable-set.js


function is_updatable_set_init() {
  "use strict";

  function isUpdatableSet(object, name) {
    var descriptor = Reflect.getOwnPropertyDescriptor(object, name);

    if (descriptor !== void 0) {
      // Section 9.5.9: [[Set]]()
      // Step 11: If either the data descriptor is not configurable or writable,
      // or the accessor descriptor has no setter, then the value must be the same.
      // https://tc39.github.io/ecma262/#sec-proxy-object-internal-methods-and-internal-slots-set-p-v-receiver
      return descriptor.configurable === true || descriptor.writable === true || typeof descriptor.set === "function";
    }

    return true;
  }

  return isUpdatableSet;
}

/* harmony default export */ var is_updatable_set = (src_shared.inited ? src_shared.module.utilIsUpdatableSet : src_shared.module.utilIsUpdatableSet = is_updatable_set_init());
// CONCATENATED MODULE: ./src/util/proxy-exports.js




















function proxy_exports_init() {
  "use strict";

  function proxyExports(entry) {
    var exported = entry.module.exports;

    if (!is_object_like(exported)) {
      return exported;
    }

    var cache = src_shared.memoize.utilProxyExports;
    var cached = cache.get(exported);

    if (cached !== void 0) {
      return cached.proxy;
    }

    var get = to_external_function(function (exported, name, receiver) {
      if (receiver === proxy) {
        receiver = exported;
      }

      var hasPropertyGetter = get_getter(exported, name) !== void 0;
      var value = Reflect.get(exported, name, receiver);

      if (hasPropertyGetter) {
        tryUpdateBindings(name, value);
      }

      return value;
    });

    var maybeWrap = function (exported, func) {
      if (typeof func !== "function" || is_arrow_function(func) || is_bound_function(func) || is_class_like_function(func)) {
        return func;
      }

      var wrapper = cached.wrap.get(func);

      if (wrapper !== void 0) {
        return wrapper;
      }

      wrapper = new own_proxy(func, {
        apply: native_trap(function (func, thisArg, args) {
          // Check `entry.completeMutableNamespace` and `entry.completeNamespace`
          // because they're proxies that native methods could be invoked on.
          if (thisArg === proxy || thisArg === entry.completeMutableNamespace || thisArg === entry.completeNamespace) {
            thisArg = exported;
          }

          return Reflect.apply(func, thisArg, args);
        })
      });
      cached.wrap.set(func, wrapper);
      cached.unwrap.set(wrapper, func);
      return wrapper;
    };

    var tryUpdateBindings = function (name, value) {
      var getters = entry.getters;
      var getter = getters[name];

      if (getter === void 0) {
        entry.updateBindings();
        return;
      }

      entry.addGetter(name, function () {
        return value;
      });

      try {
        entry.updateBindings(name);
      } finally {
        getters[name] = getter;
      }
    };

    var handler = {
      defineProperty(exported, name, descriptor) {
        var value = descriptor.value;

        if (typeof value === "function") {
          var unwrapped = cached.unwrap.get(value);
          descriptor.value = unwrapped === void 0 ? value : unwrapped;
        } // Use `Object.defineProperty()` instead of `Reflect.defineProperty()`
        // to throw the appropriate error if something goes wrong.
        // https://tc39.github.io/ecma262/#sec-definepropertyorthrow


        safe_object.defineProperty(exported, name, descriptor);

        if (typeof descriptor.get === "function" && typeof handler.get !== "function") {
          handler.get = get;
        }

        if (has(entry.getters, name)) {
          entry.addGetter(name, function () {
            return entry.exports[name];
          });
          entry.updateBindings(name);
        }

        return true;
      },

      deleteProperty(exported, name) {
        if (Reflect.deleteProperty(exported, name)) {
          if (has(entry.getters, name)) {
            entry.addGetter(name, function () {
              return entry.exports[name];
            });
            entry.updateBindings(name);
          }

          return true;
        }

        return false;
      },

      set(exported, name, value, receiver) {
        if (!is_updatable_set(exported, name)) {
          return false;
        }

        var unwrapped = typeof value === "function" ? cached.unwrap.get(value) : void 0;

        if (unwrapped !== void 0) {
          value = unwrapped;
        }

        if (receiver === proxy) {
          receiver = exported;
        }

        var hasPropertySetter = get_setter(exported, name) !== void 0;

        if (Reflect.set(exported, name, value, receiver)) {
          if (has(entry.getters, name)) {
            entry.addGetter(name, function () {
              return entry.exports[name];
            });
            entry.updateBindings(hasPropertySetter ? void 0 : name);
          } else if (hasPropertySetter) {
            entry.updateBindings();
          }

          return true;
        }

        return false;
      }

    };
    var builtin = entry.builtin;
    var names = builtin ? null : util_keys(exported);

    for (var _i = 0, _length = names == null ? 0 : names.length; _i < _length; _i++) {
      var name = names[_i];

      if (typeof Reflect.getOwnPropertyDescriptor(exported, name).get === "function") {
        handler.get = get;
        break;
      }
    }

    if (!src_shared.support.nativeProxyReceiver || !builtin && !is_plain_object(exported)) {
      // Once Node < 10 is no longer supported the `getOwnPropertyDescriptor()`
      // trap can be removed and the `get()` trap can be conditionally dropped
      // for `exported` values that return "[object Function]" or "[object Object]"
      // from `getObjectTag(exported)`.
      // https://bugs.chromium.org/p/v8/issues/detail?id=5773
      handler.get = function (exported, name, receiver) {
        if (receiver === proxy) {
          receiver = exported;
        }

        var value = get(exported, name, receiver);
        var newValue = value;

        if (name === Symbol.toStringTag) {
          // Produce the `Symbol.toStringTag` value, otherwise
          // `getObjectTag(proxy)` will return "[object Object]"
          // for non-function targets.
          newValue = getToStringTag(exported, value);
        }

        newValue = maybeWrap(exported, newValue);

        if (newValue !== value && is_updatable_get(exported, name)) {
          return newValue;
        }

        return value;
      };

      handler.getOwnPropertyDescriptor = function (exported, name) {
        var descriptor = Reflect.getOwnPropertyDescriptor(exported, name);

        if (is_updatable_descriptor(descriptor)) {
          var value = descriptor.value;

          if (typeof value === "function") {
            descriptor.value = maybeWrap(exported, value);
          }
        }

        return descriptor;
      };
    } else if (builtin && is_object(exported) && !Reflect.has(exported, Symbol.toStringTag) && get_object_tag(exported) !== "[object Object]") {
      handler.get = function (exported, name, receiver) {
        if (receiver === proxy) {
          receiver = exported;
        }

        var value = Reflect.get(exported, name, receiver);

        if (name === Symbol.toStringTag) {
          var newValue = getToStringTag(exported, value);

          if (newValue !== value && is_updatable_get(exported, name)) {
            return newValue;
          }
        }

        return value;
      };
    }

    var proxy = new own_proxy(exported, handler);
    cached = {
      proxy,
      unwrap: new WeakMap(),
      wrap: new WeakMap()
    };
    cache.set(exported, cached);
    cache.set(proxy, cached);
    return proxy;
  }

  function getToStringTag(exported, value) {
    if (typeof exported !== "function" && typeof value !== "string") {
      // Section 19.1.3.6: Object.prototype.toString()
      // Step 16: If `Type(tag)` is not `String`, let `tag` be `builtinTag`.
      // https://tc39.github.io/ecma262/#sec-object.prototype.tostring
      var toStringTag = get_object_tag(exported).slice(8, -1);
      return toStringTag === "Object" ? value : toStringTag;
    }

    return value;
  }

  return proxyExports;
}

/* harmony default export */ var proxy_exports = (src_shared.inited ? src_shared.module.utilProxyExports : src_shared.module.utilProxyExports = proxy_exports_init());
// CONCATENATED MODULE: ./src/builtin-entries.js











var FuncHasInstance = Function.prototype[Symbol.hasInstance];

function createEntry(id) {
  "use strict";

  var mod = builtin_modules[id];
  var exported = mod.exports;
  var unwrapped = exported;
  var isFunc = typeof unwrapped === "function";

  if (isFunc && id !== "assert") {
    var func = unwrapped;
    var prototype = func.prototype;
    var hasInstance = mask_function(function (instance) {
      if ((this === exported || this === proxyFunc) && instance instanceof func) {
        return true;
      }

      return instance_of(instance, this);
    }, FuncHasInstance);
    var proxyFunc = new own_proxy(func, {
      get(func, name, receiver) {
        if (receiver === exported || receiver === proxyFunc) {
          receiver = func;
        }

        var value = Reflect.get(func, name, receiver);
        var newValue = value;

        if (name === Symbol.hasInstance) {
          newValue = hasInstance;
        } else if (value === func) {
          newValue = exported;
        } else if (value === prototype) {
          newValue = proxyProto;
        }

        if (newValue !== value && is_updatable_get(func, name)) {
          return newValue;
        }

        return value;
      },

      getOwnPropertyDescriptor(func, name) {
        var descriptor = Reflect.getOwnPropertyDescriptor(func, name);

        if (descriptor !== void 0 && descriptor.value === prototype && is_updatable_descriptor(descriptor)) {
          descriptor.value = proxyProto;
        }

        return descriptor;
      }

    });
    var proxyProto = new own_proxy(prototype, {
      get(prototype, name, receiver) {
        if (receiver === proxyProto) {
          receiver = prototype;
        }

        var value = Reflect.get(prototype, name, receiver);

        if (value === func && is_updatable_get(prototype, name)) {
          return exported;
        }

        return value;
      },

      getOwnPropertyDescriptor(prototype, name) {
        var descriptor = Reflect.getOwnPropertyDescriptor(prototype, name);

        if (descriptor !== void 0 && descriptor.value === func && is_updatable_descriptor(descriptor)) {
          descriptor.value = exported;
        }

        return descriptor;
      }

    });
    mod.exports = proxyFunc;
  }

  var entry = src_entry.get(mod);
  entry.builtin = true;
  exported = proxy_exports(entry);
  mod.exports = exported;
  entry.exports = exported;

  if (isFunc && id === "module") {
    unwrapped.prototype.constructor = exported;
  }

  entry.loaded();
  return entry;
}

var builtinEntries = {
  __proto__: null
};
var builtin_entries_cache = src_shared.memoize.builtinEntries;

var builtin_entries_loop = function (id) {
  set_deferred(builtinEntries, id, function () {
    "use strict";

    var cached = builtin_entries_cache.get(id);

    if (cached !== void 0) {
      return cached;
    }

    var entry = createEntry(id);

    if (id !== "console" && id !== "module" && id !== "util") {
      builtin_entries_cache.set(id, entry);
    }

    return entry;
  });
};

for (var builtin_entries_i = 0, builtin_entries_length = builtin_ids == null ? 0 : builtin_ids.length; builtin_entries_i < builtin_entries_length; builtin_entries_i++) {
  var builtin_entries_id = builtin_ids[builtin_entries_i];

  builtin_entries_loop(builtin_entries_id);
}

/* harmony default export */ var builtin_entries = (builtinEntries);
// CONCATENATED MODULE: ./src/builtin/reflect.js






function reflect_init() {
  "use strict";

  var ExReflect = src_shared.external.Reflect;
  var exDefineProperty = ExReflect.defineProperty,
      exDeleteProperty = ExReflect.deleteProperty,
      exSet = ExReflect.set;

  function wrapBuiltin(builtinFunc) {
    return mask_function(function (...args) {
      var target = args[0];

      try {
        return Reflect.apply(builtinFunc, this, args);
      } catch (e) {
        if (is_module_namespace_object(target)) {
          return false;
        }

        throw e;
      }
    }, builtinFunc);
  }

  var BuiltinReflect = generic_object.create();
  assign_properties(BuiltinReflect, ExReflect);

  if (typeof exDefineProperty === "function") {
    BuiltinReflect.defineProperty = wrapBuiltin(exDefineProperty);
  }

  if (typeof exDeleteProperty === "function") {
    BuiltinReflect.deleteProperty = wrapBuiltin(exDeleteProperty);
  }

  if (typeof exSet === "function") {
    BuiltinReflect.set = wrapBuiltin(exSet);
  }

  return BuiltinReflect;
}

/* harmony default export */ var reflect = (src_shared.inited ? src_shared.module.builtinReflect : src_shared.module.builtinReflect = reflect_init());
// CONCATENATED MODULE: ./src/builtin/global.js







function global_init() {
  "use strict";

  var builtinMap = {
    Reflect: reflect,

    get console() {
      return builtin_entries.console.module.exports;
    }

  };
  var externalMap = new Map([["Reflect", src_shared.external.Reflect], ["console", console]]);
  var proxy = new own_proxy(src_shared.unsafeGlobal, {
    get(unsafeGlobal, name, receiver) {
      if (receiver === proxy) {
        receiver = unsafeGlobal;
      }

      var value = Reflect.get(unsafeGlobal, name, receiver);

      if (externalMap.has(name)) {
        var newValue = builtinMap[name];

        if (newValue !== value && value === externalMap.get(name) && is_updatable_get(unsafeGlobal, name)) {
          return newValue;
        }
      }

      return value;
    },

    getOwnPropertyDescriptor(unsafeGlobal, name) {
      var descriptor = Reflect.getOwnPropertyDescriptor(unsafeGlobal, name);

      if (externalMap.has(name) && descriptor !== void 0 && descriptor.value === externalMap.get(name) && is_updatable_descriptor(descriptor)) {
        descriptor.value = builtinMap[name];
      }

      return descriptor;
    }

  });
  return proxy;
}

/* harmony default export */ var builtin_global = (src_shared.inited ? src_shared.module.builtinGlobal : src_shared.module.builtinGlobal = global_init());
// CONCATENATED MODULE: ./src/error/get-builtin-error-constructor.js




function get_builtin_error_constructor_init() {
  "use strict";

  var ExError = src_shared.external.Error;

  function getBuiltinErrorConstructor(error) {
    if (error instanceof Error || error === Error.prototype) {
      return Error;
    }

    if (error instanceof ExError || error === ExError.prototype) {
      return ExError;
    }

    var proto = error;

    while ((proto = get_prototype_of(proto)) !== null) {
      var Ctor = proto.constructor;

      if (typeof Ctor === "function" && Ctor.name === "Error" && is_native_function(Ctor)) {
        return Ctor;
      }
    }

    return ExError;
  }

  return getBuiltinErrorConstructor;
}

/* harmony default export */ var get_builtin_error_constructor = (src_shared.inited ? src_shared.module.errorGetBuiltinErrorConstructor : src_shared.module.errorGetBuiltinErrorConstructor = get_builtin_error_constructor_init());
// CONCATENATED MODULE: ./src/error/construct-error.js





function construct_error_init() {
  "use sloppy";

  var STACK_TRACE_LIMIT = esm.STACK_TRACE_LIMIT;

  function constructError(ErrorCtor, args, suggestedLimit = STACK_TRACE_LIMIT) {
    var BuiltinError = get_builtin_error_constructor(ErrorCtor.prototype);
    var stackTraceLimitDescriptor = Reflect.getOwnPropertyDescriptor(BuiltinError, "stackTraceLimit");
    var oldStackTraceLimit = stackTraceLimitDescriptor === void 0 ? void 0 : stackTraceLimitDescriptor.value;
    var shouldSetStackTraceLimit = suggestedLimit === 0 || typeof oldStackTraceLimit !== "number" || Number.isNaN(oldStackTraceLimit) || oldStackTraceLimit < suggestedLimit;

    if (shouldSetStackTraceLimit) {
      set_property(BuiltinError, "stackTraceLimit", suggestedLimit);
    }

    var error = Reflect.construct(ErrorCtor, args);

    if (shouldSetStackTraceLimit) {
      if (stackTraceLimitDescriptor === void 0) {
        Reflect.deleteProperty(BuiltinError, "stackTraceLimit");
      } else {
        Reflect.defineProperty(BuiltinError, "stackTraceLimit", stackTraceLimitDescriptor);
      }
    }

    return error;
  }

  return constructError;
}

/* harmony default export */ var construct_error = (src_shared.inited ? src_shared.module.errorConstructError : src_shared.module.errorConstructError = construct_error_init());
// CONCATENATED MODULE: ./src/error/get-location-from-stack-trace.js







function get_location_from_stack_trace_init() {
  "use strict";

  var headerRegExp = /^(.+?):(\d+)(?=\n)/; // eslint-disable-next-line no-useless-escape

  var locRegExp = /^ *at (?:.+? \()?(.+?):(\d+)(?:\:(\d+))?/gm;

  function getLocationFromStackTrace(error) {
    if (!is_error(error)) {
      return null;
    }

    var stack = util_get(error, "stack");

    if (typeof stack !== "string") {
      return null;
    }

    var message = to_string(util_get(error, "message"));
    stack = stack.replace(message, "");
    var match = headerRegExp.exec(stack);

    if (match !== null) {
      var _match = match,
          filename = _match[1],
          lineNumber = _match[2];

      if (isFilename(filename)) {
        return {
          column: 0,
          filename,
          line: lineNumber
        };
      }
    }

    locRegExp.lastIndex = 0;

    while ((match = locRegExp.exec(stack)) !== null) {
      var _match2 = match,
          _filename = _match2[1],
          _lineNumber = _match2[2],
          column = _match2[3];

      if (isFilename(_filename)) {
        return {
          column,
          filename: _filename,
          line: _lineNumber
        };
      }
    }

    return null;
  }

  function isFilename(value) {
    return is_path(value) && !is_own_path(value);
  }

  return getLocationFromStackTrace;
}

/* harmony default export */ var get_location_from_stack_trace = (src_shared.inited ? src_shared.module.errorGetLocationFromStackTrace : src_shared.module.errorGetLocationFromStackTrace = get_location_from_stack_trace_init());
// CONCATENATED MODULE: ./src/util/get-module-name.js



function get_module_name_init() {
  "use strict";

  function getModuleName(mod) {
    if (is_object(mod)) {
      var filename = mod.filename,
          id = mod.id;

      if (typeof id === "string") {
        if (id === "." && typeof filename === "string") {
          return filename;
        }

        return id;
      }

      if (typeof filename === "string") {
        return filename;
      }
    }

    return "";
  }

  return getModuleName;
}

/* harmony default export */ var get_module_name = (src_shared.inited ? src_shared.module.utilGetModuleName : src_shared.module.utilGetModuleName = get_module_name_init());
// CONCATENATED MODULE: ./src/util/inspect-trunc.js


function inspectTrunc(value, limit = 128) {
  var inspected = src_util_inspect(value);
  return inspected.length > limit ? inspected.slice(0, limit) + "..." : inspected;
}

/* harmony default export */ var inspect_trunc = (inspectTrunc);
// CONCATENATED MODULE: ./src/errors.js














function src_errors_init() {
  "use strict";

  var APOSTROPHE = char_code.APOSTROPHE;
  var PACKAGE_VERSION = esm.PACKAGE_VERSION;
  var _shared$external = src_shared.external,
      ExError = _shared$external.Error,
      ExReferenceError = _shared$external.ReferenceError,
      ExSyntaxError = _shared$external.SyntaxError,
      ExTypeError = _shared$external.TypeError;
  var templateMap = new Map();
  var errors = {
    MAIN_NOT_FOUND: function (request, jsonPath) {
      var error = new ExError("Cannot find module " + to_string_literal(request, APOSTROPHE) + '. Please verify that the package.json has a valid "main" entry');
      error.code = "MODULE_NOT_FOUND";
      error.path = jsonPath;
      error.requestPath = request;
      return error;
    },
    MODULE_NOT_FOUND: function (request, parent) {
      var requireStack = getStructuredRequireStack(parent);
      var message = "Cannot find module " + to_string_literal(request, APOSTROPHE);

      if (requireStack.length !== 0) {
        message += "\nRequire stack:\n- " + requireStack.join("\n- ");
      }

      var error = new ExError(message);
      error.code = "MODULE_NOT_FOUND";
      error.requireStack = requireStack;
      return error;
    }
  };
  addBuiltinError("ERR_CONST_ASSIGNMENT", constAssignment, ExTypeError);
  addBuiltinError("ERR_EXPORT_CYCLE", exportCycle, ExSyntaxError);
  addBuiltinError("ERR_EXPORT_MISSING", exportMissing, ExSyntaxError);
  addBuiltinError("ERR_EXPORT_STAR_CONFLICT", exportStarConflict, ExSyntaxError);
  addBuiltinError("ERR_INVALID_ESM_FILE_EXTENSION", invalidExtension, ExError);
  addBuiltinError("ERR_INVALID_ESM_OPTION", invalidPkgOption, ExError);
  addBuiltinError("ERR_NS_ASSIGNMENT", namespaceAssignment, ExTypeError);
  addBuiltinError("ERR_NS_DEFINITION", namespaceDefinition, ExTypeError);
  addBuiltinError("ERR_NS_DELETION", namespaceDeletion, ExTypeError);
  addBuiltinError("ERR_NS_EXTENSION", namespaceExtension, ExTypeError);
  addBuiltinError("ERR_NS_REDEFINITION", namespaceRedefinition, ExTypeError);
  addBuiltinError("ERR_UNDEFINED_IDENTIFIER", undefinedIdentifier, ExReferenceError);
  addBuiltinError("ERR_UNKNOWN_ESM_OPTION", unknownPkgOption, ExError);
  addNodeError("ERR_INVALID_ARG_TYPE", invalidArgType, ExTypeError);
  addNodeError("ERR_INVALID_ARG_VALUE", invalidArgValue, ExError);
  addNodeError("ERR_INVALID_PROTOCOL", invalidProtocol, ExError);
  addNodeError("ERR_MODULE_RESOLUTION_LEGACY", moduleResolutionLegacy, ExError);
  addNodeError("ERR_REQUIRE_ESM", requireESM, ExError);
  addNodeError("ERR_UNKNOWN_FILE_EXTENSION", unknownFileExtension, ExError);

  function addBuiltinError(code, template, Super) {
    errors[code] = createBuiltinErrorClass(Super, code);
    templateMap.set(code, template);
  }

  function addNodeError(code, template, Super) {
    errors[code] = createNodeErrorClass(Super, code);
    templateMap.set(code, template);
  }

  function createBuiltinErrorClass(Super, code) {
    return function BuiltinError(...args) {
      var length = args.length;
      var last = length === 0 ? null : args[length - 1];
      var beforeFunc = typeof last === "function" ? args.pop() : null;
      var template = templateMap.get(code);
      var message = template(...args);
      var error;

      if (beforeFunc === null) {
        error = construct_error(Super, [message]);
      } else {
        error = construct_error(Super, [message], 0);
        capture_stack_trace(error, beforeFunc);
      }

      var loc = get_location_from_stack_trace(error);

      if (loc !== null) {
        var stack = util_get(error, "stack");

        if (typeof stack === "string") {
          Reflect.defineProperty(error, "stack", {
            configurable: true,
            value: loc.filename + ":" + loc.line + "\n" + stack,
            writable: true
          });
        }
      }

      return error;
    };
  }

  function createNodeErrorClass(Super, code) {
    return class NodeError extends Super {
      constructor(...args) {
        var template = templateMap.get(code);
        super(template(...args));
        var name = to_string(util_get(this, "name")); // Add the error code to the name to include it in the stack trace.

        Reflect.defineProperty(this, "name", {
          configurable: true,
          value: name + " [" + code + "]",
          writable: true
        }); // Access the stack to generate the error message including the error
        // code from the name.

        util_get(this, "stack"); // Reset the name to the actual name.

        Reflect.deleteProperty(this, "name");
      }

      get code() {
        return code;
      }

      set code(value) {
        set_property(this, "code", value);
      }

    };
  }

  function getStructuredRequireStack(parent) {
    var stack = [];
    var seen = new Set();

    while (parent != null && !seen.has(parent)) {
      seen.add(parent);
      stack.push(get_module_name(parent));
      parent = parent.parent;
    }

    return stack;
  }

  function stringifyName(name) {
    return typeof name === "symbol" ? to_string(name) : to_string_literal(name, APOSTROPHE);
  }

  function constAssignment() {
    return "Assignment to constant variable.";
  }

  function exportCycle(request, name) {
    return "Detected cycle while resolving name '" + name + "' in '" + get_module_url(request) + "'";
  }

  function exportMissing(request, name) {
    return "The requested module '" + get_module_url(request) + "' does not provide an export named '" + name + "'";
  }

  function exportStarConflict(request, name) {
    return "The requested module '" + get_module_url(request) + "' contains conflicting star exports for name '" + name + "'";
  }

  function invalidArgType(name, expected, actual) {
    var message = "The '" + name + "' argument must be " + expected;

    if (arguments.length > 2) {
      message += ". Received type " + (actual === null ? "null" : typeof actual);
    }

    return message;
  }

  function invalidArgValue(name, value, reason = "is invalid") {
    return "The argument '" + name + "' " + reason + ". Received " + inspect_trunc(value);
  }

  function invalidExtension(request) {
    return "Cannot load module from .mjs: " + get_module_url(request);
  }

  function invalidPkgOption(name, value, unquoted) {
    return "The esm@" + PACKAGE_VERSION + " option " + (unquoted ? to_string(name) : to_string_literal(name, APOSTROPHE)) + " is invalid. Received " + inspect_trunc(value);
  }

  function invalidProtocol(protocol, expected) {
    return "Protocol '" + protocol + "' not supported. Expected '" + expected + "'";
  }

  function moduleResolutionLegacy(id, fromPath, foundPath) {
    return id + " not found by import in " + fromPath + ". Legacy behavior in require() would have found it at " + foundPath;
  }

  function namespaceAssignment(request, name) {
    return "Cannot assign to read only module namespace property " + stringifyName(name) + " of " + get_module_url(request);
  }

  function namespaceDefinition(request, name) {
    return "Cannot define module namespace property " + stringifyName(name) + " of " + get_module_url(request);
  }

  function namespaceDeletion(request, name) {
    return "Cannot delete module namespace property " + stringifyName(name) + " of " + get_module_url(request);
  }

  function namespaceExtension(request, name) {
    return "Cannot add module namespace property " + stringifyName(name) + " to " + get_module_url(request);
  }

  function namespaceRedefinition(request, name) {
    return "Cannot redefine module namespace property " + stringifyName(name) + " of " + get_module_url(request);
  }

  function requireESM(request) {
    return "Must use import to load module: " + get_module_url(request);
  }

  function undefinedIdentifier(name) {
    return name + " is not defined";
  }

  function unknownFileExtension(filename) {
    return "Unknown file extension: " + filename;
  }

  function unknownPkgOption(name) {
    return "Unknown esm@" + PACKAGE_VERSION + " option: " + name;
  }

  return errors;
}

/* harmony default export */ var src_errors = (src_shared.inited ? src_shared.module.errors : src_shared.module.errors = src_errors_init());
// CONCATENATED MODULE: ./src/bundled-lookup.js



function bundled_lookup_init() {
  "use strict";

  var BRAVE = constant_env.BRAVE,
      ELECTRON = constant_env.ELECTRON;
  var bundledLookup = new Set();

  if (ELECTRON) {
    bundledLookup.add("electron");
  }

  if (BRAVE) {
    bundledLookup.add("ad-block").add("tracking-protection");
  }

  return bundledLookup;
}

/* harmony default export */ var bundled_lookup = (src_shared.inited ? src_shared.module.bundledLookup : src_shared.module.bundledLookup = bundled_lookup_init());
// CONCATENATED MODULE: ./src/path/is-ext-js.js



function is_ext_js_init() {
  "use strict";

  var DOT = char_code.DOT,
      LOWERCASE_J = char_code.LOWERCASE_J,
      LOWERCASE_S = char_code.LOWERCASE_S;

  function isExtJS(filename) {
    if (typeof filename !== "string") {
      return false;
    }

    var length = filename.length;
    return length > 3 && filename.charCodeAt(length - 3) === DOT && filename.charCodeAt(length - 2) === LOWERCASE_J && filename.charCodeAt(length - 1) === LOWERCASE_S;
  }

  return isExtJS;
}

/* harmony default export */ var is_ext_js = (src_shared.inited ? src_shared.module.pathIsExtJS : src_shared.module.pathIsExtJS = is_ext_js_init());
// CONCATENATED MODULE: ./src/module/internal/read-package.js






function read_package_init() {
  "use strict";

  var mainFieldRegExp = /"main"/;

  function readPackage(dirPath, fields) {
    var cache = src_shared.memoize.moduleInternalReadPackage;
    var fieldsLength = fields === void 0 ? 0 : fields.length;
    var cacheKey = dirPath + "\0";

    if (fieldsLength > 0) {
      cacheKey += fieldsLength === 1 ? fields[0] : fields.join();
    }

    var cached = cache.get(cacheKey);

    if (cached !== void 0) {
      return cached;
    }

    var jsonPath = dirPath + sep + "package.json";
    var jsonContent = read_file(jsonPath, "utf8");

    if (jsonContent === null || jsonContent === "" || fieldsLength === 1 && fields[0] === "main" && !mainFieldRegExp.test(jsonContent)) {
      return null;
    }

    var result;

    try {
      result = JSON.parse(jsonContent);
    } catch (e) {
      e.message = "Error parsing " + jsonPath + ": " + e.message;
      e.path = jsonPath;
      to_external_error(e);
      throw e;
    }

    if (is_object(result)) {
      cache.set(cacheKey, result);
      return result;
    }

    return null;
  }

  return readPackage;
}

/* harmony default export */ var read_package = (src_shared.inited ? src_shared.module.moduleInternalReadPackage : src_shared.module.moduleInternalReadPackage = read_package_init());
// CONCATENATED MODULE: ./src/fs/realpath.js







function realpath_init() {
  "use strict";

  var ELECTRON = constant_env.ELECTRON,
      WIN32 = constant_env.WIN32;
  var realpathNativeSync = src_shared.realpathNativeSync;
  var useBuiltin = ELECTRON || WIN32;
  var useNative = !useBuiltin && typeof realpathNativeSync === "function";
  var useBinding;

  function realpath(thePath) {
    if (typeof thePath !== "string") {
      return "";
    }

    var cache = src_shared.memoize.fsRealpath;
    var cached = cache.get(thePath);

    if (cached !== void 0) {
      return cached;
    }

    cached = useNative ? realpathNative(thePath) : realpathFallback(thePath);

    if (cached !== "") {
      cache.set(thePath, cached);
    }

    return cached;
  }

  function realpathBinding(thePath) {
    if (typeof thePath === "string") {
      try {
        return src_binding.fs.realpath(to_namespaced_path(thePath));
      } catch (_unused) {}
    }

    return "";
  }

  function realpathFallback(thePath) {
    try {
      return realpathSync(thePath);
    } catch (e) {
      if (is_error(e) && e.code === "ENOENT") {
        if (useBinding === void 0) {
          useBinding = !useBuiltin && !src_shared.support.realpathNative && typeof src_binding.fs.realpath === "function";
        }

        if (useBinding) {
          return realpathBinding(thePath);
        }
      }
    }

    return "";
  }

  function realpathNative(thePath) {
    try {
      return realpathNativeSync(thePath);
    } catch (_unused2) {}

    return realpathFallback(thePath);
  }

  return realpath;
}

/* harmony default export */ var fs_realpath = (src_shared.inited ? src_shared.module.fsRealpath : src_shared.module.fsRealpath = realpath_init());
// CONCATENATED MODULE: ./src/module/internal/find-path.js
// Based on `Module._findPath()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js




















var find_path_APOSTROPHE = char_code.APOSTROPHE,
    find_path_DOT = char_code.DOT;
var find_path_FLAGS = constant_env.FLAGS,
    TINK = constant_env.TINK,
    YARN_PNP = constant_env.YARN_PNP;
var MAIN_NOT_FOUND = src_errors.MAIN_NOT_FOUND;
var find_path_isFile = Stats.prototype.isFile;
var find_path_mainFields = ["main"];
var preserveAllSymlinks = TINK || YARN_PNP;
var resolveSymlinks = !preserveAllSymlinks && !find_path_FLAGS.preserveSymlinks;
var resolveSymlinksMain = !preserveAllSymlinks && !find_path_FLAGS.preserveSymlinksMain;

function findPath(request, paths, isMain = false, fields, exts) {
  var pathsLength = paths.length;
  var cacheKey = request + "\0" + (pathsLength === 1 ? paths[0] : generic_array.join(paths)) + "\0";

  if (fields !== void 0) {
    cacheKey += fields.length === 1 ? fields[0] : fields.join();
  }

  cacheKey += "\0";

  if (exts !== void 0) {
    cacheKey += exts.length === 1 ? exts[0] : exts.join();
  }

  cacheKey += "\0";

  if (isMain) {
    cacheKey += "1";
  }

  var cache = src_shared.memoize.moduleInternalFindPath;
  var cached = cache.get(cacheKey);

  if (cached !== void 0) {
    return cached;
  }

  var useRealpath = isMain ? resolveSymlinksMain : resolveSymlinks;
  var isAbs = is_absolute(request);

  if (!isAbs && pathsLength === 0) {
    return "";
  }

  var requestLength = request.length;
  var trailingSlash = requestLength !== 0;

  if (trailingSlash) {
    var code = request.charCodeAt(requestLength - 1);

    if (code === find_path_DOT) {
      code = request.charCodeAt(requestLength - 2);

      if (code === find_path_DOT) {
        code = request.charCodeAt(requestLength - 3);
      }
    }

    trailingSlash = is_sep(code);
  }

  if (isAbs) {
    if (useRealpath) {
      paths = [dirname(request)];
      request = path_basename(request);
    } else {
      paths = [request];
    }
  }

  for (var _i = 0, _paths = paths, _length = _paths == null ? 0 : _paths.length; _i < _length; _i++) {
    var curPath = _paths[_i];

    if (!isAbs && stat_fast(curPath) !== 1) {
      continue;
    }

    var thePath = curPath;

    if (useRealpath) {
      thePath = fs_realpath(curPath);

      if (thePath === "") {
        continue;
      }
    }

    if (isAbs) {
      if (useRealpath) {
        thePath += sep + request;
      }
    } else {
      thePath = path_resolve(thePath, request);
    }

    var rc = -1;
    var stat = null;

    if (is_ext_js(thePath) || is_ext_mjs(thePath)) {
      stat = stat_sync(thePath);

      if (stat !== null) {
        rc = Reflect.apply(find_path_isFile, stat, []) ? 0 : 1;
      }
    } else {
      rc = stat_fast(thePath);
    }

    var foundPath = "";

    if (!trailingSlash) {
      // If a file.
      if (rc === 0) {
        foundPath = useRealpath ? fs_realpath(thePath) : thePath;
      }

      if (foundPath === "") {
        if (exts === void 0) {
          exts = util_keys(src_module._extensions);
        }

        foundPath = tryExtensions(thePath, exts, isMain);
      }
    } // If a directory.


    if (rc === 1 && foundPath === "") {
      if (exts === void 0) {
        exts = util_keys(src_module._extensions);
      }

      if (fields === void 0) {
        fields = find_path_mainFields;
      }

      foundPath = tryPackage(request, thePath, fields, exts, isMain);
    }

    if (foundPath !== "") {
      cache.set(cacheKey, foundPath);
      return foundPath;
    }
  }

  return "";
}

function tryExtensions(thePath, exts, isMain) {
  "use strict";

  for (var _i2 = 0, _length2 = exts == null ? 0 : exts.length; _i2 < _length2; _i2++) {
    var ext = exts[_i2];
    var foundPath = tryFilename(thePath + ext, isMain);

    if (foundPath !== "") {
      return foundPath;
    }
  }

  return "";
}

function tryField(dirPath, fieldPath, exts, isMain) {
  "use strict";

  if (typeof fieldPath !== "string") {
    return "";
  }

  var thePath = path_resolve(dirPath, fieldPath);
  var foundPath = tryFilename(thePath, isMain);

  if (foundPath === "") {
    foundPath = tryExtensions(thePath, exts, isMain);
  }

  if (foundPath === "") {
    foundPath = tryExtensions(thePath + sep + "index", exts, isMain);
  }

  return foundPath;
}

function tryFilename(filename, isMain) {
  "use strict";

  var rc = -1;

  if (is_ext_js(filename) || is_ext_mjs(filename)) {
    var stat = stat_sync(filename);

    if (stat !== null) {
      rc = Reflect.apply(find_path_isFile, stat, []) ? 0 : 1;
    }
  } else {
    rc = stat_fast(filename);
  }

  if (rc) {
    return "";
  }

  var useRealpath = isMain ? resolveSymlinksMain : resolveSymlinks;
  return useRealpath ? fs_realpath(filename) : filename;
}

function tryPackage(request, dirPath, fields, exts, isMain) {
  "use strict";

  var json = read_package(dirPath, fields);

  if (json === null) {
    return tryExtensions(dirPath + sep + "index", exts, isMain);
  }

  var field;
  var fieldValue;
  var foundPath;

  for (var _i3 = 0, _length3 = fields == null ? 0 : fields.length; _i3 < _length3; _i3++) {
    field = fields[_i3];
    fieldValue = json[field];
    foundPath = tryField(dirPath, fieldValue, exts, isMain);

    if (foundPath !== "" && (field === "main" || !is_ext_mjs(foundPath))) {
      return foundPath;
    }
  }

  var jsonPath = dirPath + sep + "package.json";
  foundPath = tryExtensions(dirPath + sep + "index", exts, isMain);

  if (foundPath === "") {
    throw new MAIN_NOT_FOUND(request, jsonPath);
  }

  if (find_path_FLAGS.pendingDeprecation) {
    emitWarning("Invalid " + to_string_literal(field, find_path_APOSTROPHE) + " field in " + to_string_literal(jsonPath, find_path_APOSTROPHE) + " of " + inspect_trunc(fieldValue) + ". Please either fix or report it to the module author", "DeprecationWarning", "DEP0128");
  }

  return foundPath;
}

/* harmony default export */ var find_path = (findPath);
// CONCATENATED MODULE: ./src/pnp.js
var pnp_pnp = {};
/* harmony default export */ var src_pnp = (pnp_pnp);
// CONCATENATED MODULE: ./src/util/validate-string.js



function validate_string_init() {
  "use strict";

  var ERR_INVALID_ARG_TYPE = src_errors.ERR_INVALID_ARG_TYPE;

  function validateString(value, name) {
    if (typeof value !== "string") {
      throw new ERR_INVALID_ARG_TYPE(name, "string", value);
    }
  }

  return validateString;
}

/* harmony default export */ var validate_string = (src_shared.inited ? src_shared.module.utilValidateString : src_shared.module.utilValidateString = validate_string_init());
// CONCATENATED MODULE: ./src/module/static/node-module-paths.js
// Based on `Module._nodeModulePaths()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js









var node_module_paths_BACKWARD_SLASH = char_code.BACKWARD_SLASH,
    node_module_paths_COLON = char_code.COLON;
var node_module_paths_ELECTRON = constant_env.ELECTRON,
    node_module_paths_WIN32 = constant_env.WIN32;
var nmChars = Array.prototype.map.call("node_modules", function (char) {
  return char.charCodeAt(0);
}).reverse();
var nmLength = nmChars.length;
var nodeModulePaths = mask_function(function (from) {
  "use strict";

  validate_string(from, "from"); // Electron and Muon patch `Module_nodeModulePaths()` to remove paths outside the app.
  // https://github.com/electron/electron/blob/master/lib/common/reset-search-paths.js
  // https://github.com/brave/muon/blob/master/lib/common/reset-search-paths.js

  if (node_module_paths_ELECTRON) {
    return safe_module._nodeModulePaths(from);
  }

  from = path_resolve(from); // Return early not only to avoid unnecessary work, but to avoid returning
  // an array of two items for a root path.

  if (node_module_paths_WIN32) {
    // Return root node_modules when path is "D:\\".
    if (from.length > 1 && from.charCodeAt(from.length - 1) === node_module_paths_BACKWARD_SLASH && from.charCodeAt(from.length - 2) === node_module_paths_COLON) {
      return generic_array.of(from + "node_modules");
    }
  } else if (from === "/") {
    return generic_array.of("/node_modules");
  } // This approach only works when the path is guaranteed to be absolute.
  // Doing a fully-edge-case-correct `path.split()` that works on both Windows
  // and Posix is non-trivial.


  var _from = from,
      length = _from.length;
  var last = length;
  var nmCount = 0;
  var paths = generic_array.of();

  while (length--) {
    var code = from.charCodeAt(length); // The path segment separator check ("\" and "/") was used to get
    // node_modules path for every path segment.

    if (is_sep(code)) {
      if (nmCount !== nmLength) {
        generic_array.push(paths, from.slice(0, last) + sep + "node_modules");
      }

      last = length;
      nmCount = 0;
    } else if (nmCount !== -1) {
      if (nmChars[nmCount] === code) {
        nmCount += 1;
      } else {
        nmCount = -1;
      }
    }
  }

  if (!node_module_paths_WIN32) {
    // Append "/node_modules" to handle root paths.
    generic_array.push(paths, "/node_modules");
  }

  return paths;
}, real_module._nodeModulePaths);
/* harmony default export */ var node_module_paths = (nodeModulePaths);
// CONCATENATED MODULE: ./src/module/internal/resolve-lookup-paths.js
// Based on `Module._resolveLookupPaths()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js








var RUNKIT = constant_env.RUNKIT;
var resolve_lookup_paths_PACKAGE_DIRNAME = esm.PACKAGE_DIRNAME;
var availableModulesPath;

function resolveLookupPaths(request, parent = null, skipGlobalPaths = false) {
  var parentFilename = parent !== null && parent.filename; // Look outside if not a relative path.

  if (!is_relative(request)) {
    var parentPaths = parent !== null && parent.paths;

    var _paths = parentPaths ? generic_array.from(parentPaths) : generic_array.of();

    if (parentPaths && !skipGlobalPaths) {
      generic_array.push(_paths, ...src_loader.state.module.globalPaths);
    }

    if (RUNKIT) {
      if (availableModulesPath === void 0) {
        availableModulesPath = dirname(resolve_lookup_paths_PACKAGE_DIRNAME);
      }

      _paths.push(availableModulesPath);
    }

    return _paths.length ? _paths : null;
  }

  if (typeof parentFilename === "string") {
    return generic_array.of(dirname(parentFilename));
  }

  var paths = skipGlobalPaths ? node_module_paths(".") : src_module._nodeModulePaths(".");
  generic_array.unshift(paths, ".");
  return paths;
}

/* harmony default export */ var resolve_lookup_paths = (resolveLookupPaths);
// CONCATENATED MODULE: ./src/module/esm/resolve-filename.js




























var resolve_filename_FORWARD_SLASH = char_code.FORWARD_SLASH;
var resolve_filename_TYPE_CJS = constant_entry.TYPE_CJS,
    resolve_filename_TYPE_PSEUDO = constant_entry.TYPE_PSEUDO;
var resolve_filename_ELECTRON = constant_env.ELECTRON,
    resolve_filename_FLAGS = constant_env.FLAGS,
    resolve_filename_YARN_PNP = constant_env.YARN_PNP;
var ERR_INVALID_PROTOCOL = src_errors.ERR_INVALID_PROTOCOL,
    ERR_MODULE_RESOLUTION_LEGACY = src_errors.ERR_MODULE_RESOLUTION_LEGACY,
    ERR_UNKNOWN_FILE_EXTENSION = src_errors.ERR_UNKNOWN_FILE_EXTENSION,
    MODULE_NOT_FOUND = src_errors.MODULE_NOT_FOUND;
var localhostRegExp = /^\/\/localhost\b/;
var queryHashRegExp = /[?#].*$/;
var strictExts = [".mjs", ".js", ".json", ".node"];
var strictFields = ["main"];
var strictExtsLookup = new Set(strictExts);

function resolveFilename(request, parent, isMain = false, options) {
  // Electron and Muon patch `Module._resolveFilename()`.
  // https://github.com/electron/electron/blob/master/lib/common/reset-search-paths.js
  // https://github.com/brave/muon/blob/master/lib/common/reset-search-paths.js
  if (resolve_filename_ELECTRON && bundled_lookup.has(request)) {
    return safe_module._resolveFilename(request, parent, isMain, options);
  }

  if (builtin_lookup.has(request)) {
    return request;
  }

  if (resolve_filename_YARN_PNP) {
    return src_pnp._resolveFilename(request, parent, isMain, options);
  }

  var isAbs = is_absolute(request);
  var parentEntry = src_entry.get(parent);

  if (parentEntry !== null) {
    parentEntry.updateFilename();
  }

  var fromPath;

  if (isAbs) {
    fromPath = dirname(request);
  } else {
    fromPath = parentEntry === null ? "" : parentEntry.dirname;
  }

  var cache;
  var cacheKey;

  if (!is_object(options)) {
    cache = src_shared.memoize.moduleESMResolveFilename;
    cacheKey = request + "\0" + fromPath + "\0" + (isMain ? "1" : "");
    var cached = cache.get(cacheKey);

    if (cached !== void 0) {
      return cached;
    }
  }

  var isRel = !isAbs && is_relative(request);
  var isPath = isAbs || isRel;
  var pkgOptions = src_package.get(fromPath).options;
  var cjsPaths = pkgOptions.cjs.paths;
  var fields = pkgOptions.mainFields;

  if (parentEntry !== null && parentEntry.extname === ".mjs") {
    cjsPaths = false;
    fields = strictFields;
  }

  var foundPath = "";

  if (!isPath && (request.charCodeAt(0) === resolve_filename_FORWARD_SLASH || request.indexOf(":") !== -1)) {
    var parsed = parse_url(request);
    foundPath = get_file_path_from_url(parsed);

    if (foundPath === "" && parsed.protocol !== "file:" && !localhostRegExp.test(request)) {
      var _error = new ERR_INVALID_PROTOCOL(parsed.protocol, "file:");

      maybeMaskStackTrace(_error, parentEntry);
      throw _error;
    }

    if (foundPath !== "") {
      foundPath = _resolveFilename(foundPath, parent, isMain, options, empty_array, empty_array, true);
    }
  } else if (isPath) {
    var pathname = request.replace(queryHashRegExp, "");

    if (!has_encoded_sep(pathname)) {
      var paths = isAbs ? [""] : [fromPath];
      var exts;

      if (!cjsPaths) {
        exts = resolve_filename_FLAGS.esModuleSpecifierResolution === "explicit" ? empty_array : strictExts;
      }

      pathname = decode_uri_component(pathname);
      foundPath = find_path(pathname, paths, isMain, fields, exts);
    }
  } else if (!has_encoded_sep(request)) {
    var decoded = decode_uri_component(request); // Prevent resolving non-local dependencies:
    // https://github.com/nodejs/node-eps/blob/master/002-es-modules.md#432-removal-of-non-local-dependencies

    var skipGlobalPaths = !cjsPaths;

    var _exts = cjsPaths ? void 0 : strictExts;

    foundPath = _resolveFilename(decoded, parent, isMain, options, fields, _exts, skipGlobalPaths);

    if (foundPath === "" && builtin_lookup.has(decoded)) {
      if (cache !== void 0) {
        cache.set(cacheKey, decoded);
      }

      return decoded;
    }
  }

  if (foundPath !== "") {
    if (cjsPaths || isMain || is_ext_js(foundPath) || is_ext_mjs(foundPath) || strictExtsLookup.has(path_extname(foundPath))) {
      if (cache !== void 0) {
        cache.set(cacheKey, foundPath);
      }

      return foundPath;
    }

    var _error2 = new ERR_UNKNOWN_FILE_EXTENSION(foundPath);

    maybeMaskStackTrace(_error2, parentEntry);
    throw _error2;
  }

  foundPath = tryLegacyResolveFilename(request, parent, isMain, options);

  if (foundPath !== "") {
    if (cjsPaths) {
      if (cache !== void 0) {
        cache.set(cacheKey, foundPath);
      }

      return foundPath;
    }

    var _error3 = new ERR_MODULE_RESOLUTION_LEGACY(request, fromPath, foundPath);

    maybeMaskStackTrace(_error3, parentEntry);
    throw _error3;
  }

  var error = new MODULE_NOT_FOUND(request, parent);
  maybeMaskStackTrace(error, parentEntry);
  throw error;
}

function _resolveFilename(request, parent, isMain, options, fields, exts, skipGlobalPaths) {
  "use strict";

  var paths;

  if (options && Array.isArray(options.paths)) {
    paths = resolveLookupPathsFrom(request, options.paths, skipGlobalPaths);
  } else {
    paths = resolve_lookup_paths(request, parent, skipGlobalPaths);

    if (paths === null) {
      paths = [];
    }
  }

  return find_path(request, paths, isMain, fields, exts);
}

function maybeMaskStackTrace(error, parentEntry) {
  "use strict";

  if (!src_loader.state.package.default.options.debug) {
    var maskOptions = {
      filename: null,
      inModule: false
    };

    if (parentEntry !== null) {
      var parentType = parentEntry.type;
      maskOptions.filename = parentEntry.filename;
      maskOptions.inModule = (!parentEntry.package.options.cjs.paths || parentEntry.extname === ".mjs") && parentType !== resolve_filename_TYPE_CJS && parentType !== resolve_filename_TYPE_PSEUDO;
    }

    mask_stack_trace(error, maskOptions);
  }

  return error;
}

function resolveLookupPathsFrom(request, fromPaths, skipGlobalPaths) {
  "use strict";

  var fakeParent = new src_module("");
  var paths = [];

  for (var _i = 0, _length = fromPaths == null ? 0 : fromPaths.length; _i < _length; _i++) {
    var fromPath = fromPaths[_i];
    fakeParent.paths = node_module_paths(fromPath);
    var lookupPaths = resolve_lookup_paths(request, fakeParent, skipGlobalPaths);

    for (var _i2 = 0, _length2 = lookupPaths == null ? 0 : lookupPaths.length; _i2 < _length2; _i2++) {
      var lookupPath = lookupPaths[_i2];

      if (paths.indexOf(lookupPath) === -1) {
        paths.push(lookupPath);
      }
    }
  }

  return paths;
}

function tryLegacyResolveFilename(request, parent, isMain, options) {
  "use strict";

  try {
    return src_module._resolveFilename(request, parent, isMain, options);
  } catch (_unused) {}

  return "";
}

/* harmony default export */ var resolve_filename = (resolveFilename);
// CONCATENATED MODULE: ./src/module/internal/dual-resolve-filename.js



function dualResolveFilename(request, parent, isMain, options) {
  "use strict";

  var error;

  try {
    return resolve_filename(request, parent, isMain, options);
  } catch (e) {
    error = e;
  }

  try {
    return src_module._resolveFilename(request, parent, isMain, options);
  } catch (_unused) {}

  throw error;
}

/* harmony default export */ var dual_resolve_filename = (dualResolveFilename);
// CONCATENATED MODULE: ./src/module/internal/load.js
// Based on `Module._load()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js













var STATE_PARSING_COMPLETED = constant_entry.STATE_PARSING_COMPLETED;

function load(filename, parent, isMain = false, cache, loader) {
  var loaderModuleState = src_loader.state.module;
  var parsing = src_shared.moduleState.parsing;
  var entry;
  var mod = cache[filename];

  if (mod === void 0 && cache === loaderModuleState.scratchCache) {
    mod = src_module._cache[filename];
  }

  var foundMod = mod !== void 0;

  if (foundMod) {
    var children = parent != null && parent.children;

    if (Array.isArray(children) && generic_array.indexOf(children, mod) === -1) {
      generic_array.push(children, mod);
    }

    entry = src_entry.get(mod);

    if (parsing || mod.loaded || entry.state !== STATE_PARSING_COMPLETED) {
      return entry;
    }
  } else if (has(builtin_entries, filename)) {
    return builtin_entries[filename];
  } else {
    mod = new src_module(filename, parent);
    mod.filename = is_file_origin(filename) ? get_file_path_from_url(filename) : filename;
    entry = src_entry.get(mod);

    if (isMain) {
      mod.id = ".";
      loaderModuleState.mainModule = mod;
      process.mainModule = mod;
    }
  }

  var _entry = entry,
      compileData = _entry.compileData;
  var ext = entry.extname;

  if (foundMod || compileData !== null && compileData.code !== null || ext === ".json" || ext === ".wasm") {
    loader(entry);
    return entry;
  }

  var _mod = mod,
      _compile = _mod._compile;
  var shouldRestore = has(mod, "_compile");
  set_property(mod, "_compile", to_external_function(function (content, filename) {
    "use strict";

    if (shouldRestore) {
      set_property(this, "_compile", _compile);
    } else {
      Reflect.deleteProperty(this, "_compile");
    }

    var compileWrapper = has(this, src_shared.symbol._compile) ? this[src_shared.symbol._compile] : null;
    var compile = _compile;

    if (typeof compileWrapper === "function") {
      compile = compileWrapper;
      Reflect.deleteProperty(this, src_shared.symbol._compile);
    }

    return Reflect.apply(compile, this, [content, filename]);
  }));
  loader(entry);
  return entry;
}

/* harmony default export */ var internal_load = (load);
// CONCATENATED MODULE: ./src/util/decode-uri.js


function decode_uri_init() {
  "use strict";

  var _decodeURI = decodeURI;
  return function decodeURI(string) {
    return typeof string === "string" ? _decodeURI(string) : "";
  };
}

/* harmony default export */ var decode_uri = (src_shared.inited ? src_shared.module.utilDecodeURI : src_shared.module.utilDecodeURI = decode_uri_init());
// CONCATENATED MODULE: ./src/util/get-url-query-fragment.js




function get_url_query_fragment_init() {
  "use strict";

  var questionMarkHashRegExp = /[?#]/;

  function getURLQueryFragment(request) {
    var index = typeof request === "string" ? request.search(questionMarkHashRegExp) : -1;
    return index === -1 ? "" : decode_uri(encode_uri(request.slice(index)));
  }

  return getURLQueryFragment;
}

/* harmony default export */ var get_url_query_fragment = (src_shared.inited ? src_shared.module.utilGetURLQueryFragment : src_shared.module.utilGetURLQueryFragment = get_url_query_fragment_init());
// CONCATENATED MODULE: ./src/module/internal/find-compiler-extension.js



function find_compiler_extension_init() {
  "use strict";

  function findCompilerExtension(extCompilers, entry) {
    var basename = entry.basename,
        extname = entry.extname,
        filename = entry.filename;

    if (extname === "") {
      return extname;
    }

    var extIndex = filename.length - extname.length;
    var index;
    var fromIndex = 0;

    while ((index = basename.indexOf(".", fromIndex)) !== -1) {
      fromIndex = index + 1;

      if (index === 0) {
        continue;
      }

      var done = index === extIndex;
      var ext = done ? extname : basename.slice(index);

      if (has(extCompilers, ext)) {
        return ext;
      }

      if (done) {
        break;
      }
    }

    return "";
  }

  return findCompilerExtension;
}

/* harmony default export */ var find_compiler_extension = (src_shared.inited ? src_shared.module.moduleInternalFindCompilerExtension : src_shared.module.moduleInternalFindCompilerExtension = find_compiler_extension_init());
// CONCATENATED MODULE: ./src/module/esm/loader.js






var loader_STATE_PARSING_COMPLETED = constant_entry.STATE_PARSING_COMPLETED,
    loader_TYPE_CJS = constant_entry.TYPE_CJS,
    loader_TYPE_PSEUDO = constant_entry.TYPE_PSEUDO;

function loader_loader(entry, filename, parentEntry) {
  "use strict";

  var parsing = src_shared.moduleState.parsing;
  entry.updateFilename(filename);

  if (parentEntry === null) {
    parentEntry = entry;
  }

  var extensions = src_loader.state.module.extensions;
  var ext = entry.extname;
  var parentExt = parentEntry.extname;
  var parentType = parentEntry.type;
  var parentIsCJS = parentType === loader_TYPE_CJS;
  var parentIsMJS = parentExt === ".mjs";
  var parentIsPseudo = parentType === loader_TYPE_PSEUDO;

  if (parentIsCJS || parentIsPseudo || ext === ".js" || (ext === ".cjs" || parentEntry.package.options.cjs.extensions) && !parentIsMJS) {
    extensions = src_module._extensions;
  }

  var foundExt = find_compiler_extension(extensions, entry);

  if (foundExt === "") {
    foundExt = ".js";
  }

  var mod = entry.module;

  if (!mod.paths) {
    if (parentIsCJS || parentIsPseudo || entry.package.options.cjs.paths && !parentIsMJS && ext !== ".mjs") {
      mod.paths = src_module._nodeModulePaths(entry.dirname);
    } else {
      mod.paths = node_module_paths(entry.dirname);
    }
  }

  if (parsing && foundExt !== ".cjs" && foundExt !== ".js" && foundExt !== ".json" && foundExt !== ".mjs" && foundExt !== ".wasm") {
    entry.state = loader_STATE_PARSING_COMPLETED;
    return;
  }

  extensions[foundExt](mod, filename);

  if (!parsing && !mod.loaded) {
    mod.loaded = true;
  }
}

/* harmony default export */ var esm_loader = (loader_loader);
// CONCATENATED MODULE: ./src/module/esm/load.js



















var load_TYPE_CJS = constant_entry.TYPE_CJS,
    load_TYPE_PSEUDO = constant_entry.TYPE_PSEUDO;

function load_load(request, parent, isMain = false, preload) {
  var parsing = src_shared.moduleState.parsing;
  var parentEntry = src_entry.get(parent);
  var parentCJS = parentEntry === null ? null : parentEntry.package.options.cjs;
  var parentIsMJS = parentEntry === null ? false : parentEntry.extname === ".mjs";
  var parentType = parentEntry === null ? -1 : parentEntry.type;
  var filename;

  if (parentEntry !== null && parentCJS.paths && !parentIsMJS) {
    filename = dual_resolve_filename(request, parent, isMain);
  } else {
    filename = resolve_filename(request, parent, isMain);
  }

  var fromPath = dirname(filename);

  if (fromPath === "." && builtin_lookup.has(filename)) {
    request = filename;
  }

  var pkg = src_package.from(filename);
  var cjs = pkg.options.cjs;
  var queryFragment = get_url_query_fragment(request);
  var _Loader$state$module = src_loader.state.module,
      moduleCache = _Loader$state$module.moduleCache,
      scratchCache = _Loader$state$module.scratchCache;
  var cache = src_module._cache;
  var isUnexposed = !cjs.cache;
  request = queryFragment === "" ? filename : get_url_from_file_path(filename) + queryFragment;

  if (is_ext_mjs(filename) || has(moduleCache, request)) {
    cache = moduleCache;
  } else if (parsing) {
    cache = scratchCache;
  } else if (has(scratchCache, request)) {
    var mod = scratchCache[request];

    if (isUnexposed && src_entry.get(mod).type !== load_TYPE_CJS) {
      cache = moduleCache;
    }

    cache[request] = mod;
    Reflect.deleteProperty(scratchCache, request);
  }

  var loaderCalled = false;

  var sanitize = function (entry) {
    "use strict";

    var isCJS = entry.type === load_TYPE_CJS;

    if (isCJS) {
      isUnexposed = false;
    }

    if (isMain && isUnexposed) {
      Reflect.deleteProperty(process, "mainModule");
    }

    if (isCJS && parentEntry !== null && (parentIsMJS || parentType !== load_TYPE_CJS && parentType !== load_TYPE_PSEUDO && !parentCJS.cache)) {
      try {
        entry.module.parent = void 0;
      } catch (_unused) {
        /* jest freezes module */
      }
    }
  };

  var entry = internal_load(request, parent, isMain, cache, function (entry) {
    "use strict";

    loaderCalled = true;
    cache[request] = entry.module;

    if (parentEntry !== null) {
      parentEntry.children[entry.name] = entry;
    }

    if (!parsing) {
      sanitize(entry);
    }

    if (typeof preload === "function") {
      preload(entry);
    }

    tryLoader(entry, filename, parentEntry, cache, request);
  });

  if (parsing) {
    sanitize(entry);
  }

  if (!loaderCalled && typeof preload === "function") {
    preload(entry);
  }

  if (parentEntry !== null) {
    parentEntry._lastChild = entry;
  }

  return entry;
}

function tryLoader(entry, filename, parentEntry, cache, cacheKey) {
  "use strict";

  var error;
  var threw = true;

  try {
    esm_loader(entry, filename, parentEntry);
    threw = false;
  } catch (e) {
    error = e;
    throw error;
  } finally {
    if (threw) {
      if (entry.type !== load_TYPE_CJS) {
        // Unlike CJS, for other module types errors are preserved for
        // subsequent loads.
        Reflect.defineProperty(cache, cacheKey, {
          configurable: true,
          enumerable: true,
          get: to_external_function(function () {
            throw error;
          }),
          set: to_external_function(function (value) {
            set_property(this, cacheKey, value);
          })
        });
      } else {
        Reflect.deleteProperty(cache, cacheKey);
      }
    }
  }
}

/* harmony default export */ var esm_load = (load_load);
// CONCATENATED MODULE: ./src/module/esm/validate-deep.js





function validate_deep_init() {
  "use strict";

  var LOAD_COMPLETED = constant_entry.LOAD_COMPLETED,
      NAMESPACE_FINALIZATION_DEFERRED = constant_entry.NAMESPACE_FINALIZATION_DEFERRED,
      SETTER_TYPE_EXPORT_FROM = constant_entry.SETTER_TYPE_EXPORT_FROM,
      TYPE_CJS = constant_entry.TYPE_CJS,
      TYPE_JSON = constant_entry.TYPE_JSON,
      TYPE_PSEUDO = constant_entry.TYPE_PSEUDO;
  var ERR_EXPORT_CYCLE = src_errors.ERR_EXPORT_CYCLE,
      ERR_EXPORT_MISSING = src_errors.ERR_EXPORT_MISSING;

  function validateDeep(entry, seen) {
    var children = entry.children;

    if (seen === void 0) {
      seen = new Set();
    } else if (seen.has(entry)) {
      return;
    }

    seen.add(entry);

    for (var name in children) {
      var childEntry = children[name];

      if (childEntry.type !== TYPE_CJS) {
        validateDeep(childEntry, seen);
      }

      validate(childEntry, entry);
    }
  }

  function isCyclicalExport(entry, exportedName, seen) {
    var name = entry.name;

    if (seen === void 0) {
      seen = new Set();
    } else if (seen.has(name)) {
      return true;
    }

    seen.add(name);

    for (var _i = 0, _entry$setters$export = entry.setters[exportedName], _length = _entry$setters$export == null ? 0 : _entry$setters$export.length; _i < _length; _i++) {
      var setter = _entry$setters$export[_i];

      if (setter.type === SETTER_TYPE_EXPORT_FROM && isCyclicalExport(setter.owner, setter.exportedName, seen)) {
        return true;
      }
    }

    return false;
  }

  function raiseExportError(entry, exportedName, parentEntry) {
    var setters = entry.setters[exportedName];
    var setterIndex = setters.findIndex(function ({
      owner
    }) {
      return owner === parentEntry;
    });

    if (setterIndex !== -1) {
      var ErrorCtor = isCyclicalExport(entry, exportedName) ? ERR_EXPORT_CYCLE : ERR_EXPORT_MISSING; // Remove problematic setter to unblock subsequent imports.

      setters.splice(setterIndex, 1);
      throw new ErrorCtor(entry.module, exportedName);
    }
  }

  function validate(entry, parentEntry) {
    var parentIsMJS = parentEntry.extname === ".mjs";
    var parentNamedExports = parentEntry.package.options.cjs.namedExports && !parentIsMJS;

    if (entry._namespaceFinalized === NAMESPACE_FINALIZATION_DEFERRED) {
      return;
    }

    var type = entry.type;
    var isCJS = type === TYPE_CJS;
    var isLoaded = entry._loaded === LOAD_COMPLETED;
    var defaultOnly = (isCJS || type === TYPE_JSON) && !parentNamedExports && !entry.builtin || type === TYPE_PSEUDO && parentIsMJS;

    if (isCJS && !defaultOnly && !isLoaded) {
      return;
    }

    var cache = entry._validation;
    var getters = entry.getters;
    var settersMap = entry.setters;
    var namespace;

    for (var exportedName in settersMap) {
      if (defaultOnly) {
        if (exportedName === "*" || exportedName === "default") {
          continue;
        }

        raiseExportError(entry, exportedName, parentEntry);
      }

      var cached = cache.get(exportedName);

      if (cached === true) {
        continue;
      }

      if (namespace === void 0) {
        namespace = isLoaded ? entry.getExportByName("*", parentEntry) : getters;
      }

      if (has(namespace, exportedName)) {
        var getter = getters[exportedName];
        var _getter = getter,
            owner = _getter.owner;

        if (owner.type === TYPE_CJS && owner._loaded !== LOAD_COMPLETED) {
          continue;
        }

        if (!getter.deferred) {
          cache.set(exportedName, true);
          continue;
        }

        var seen = new Set();

        while (getter !== void 0 && getter.deferred) {
          if (seen.has(getter)) {
            getter = void 0;
          } else {
            seen.add(getter);
            getter = getter.owner.getters[getter.id];
          }
        }

        if (getter !== void 0) {
          getters[exportedName] = getter;
          cache.set(exportedName, true);
          continue;
        }
      }

      cache.set(exportedName, false);
      raiseExportError(entry, exportedName, parentEntry);
    }
  }

  return validateDeep;
}

/* harmony default export */ var validate_deep = (src_shared.inited ? src_shared.module.moduleEsmValidateDeep : src_shared.module.moduleEsmValidateDeep = validate_deep_init());
// CONCATENATED MODULE: ./src/module/esm/validate-shallow.js




function validate_shallow_init() {
  "use strict";

  var ERR_EXPORT_MISSING = src_errors.ERR_EXPORT_MISSING;

  function validateShallow(entry, parentEntry) {
    var cache = entry._validation;
    var settersMap = entry.setters;
    var namespace;

    for (var exportedName in settersMap) {
      var cached = cache.get(exportedName);

      if (cached === true) {
        continue;
      }

      if (namespace === void 0) {
        namespace = entry.getExportByName("*", parentEntry);
      }

      if (has(namespace, exportedName)) {
        cache.set(exportedName, true);
        continue;
      }

      cache.set(exportedName, false);
      var setters = settersMap[exportedName];
      var setterIndex = setters.findIndex(function ({
        owner
      }) {
        return owner === parentEntry;
      });

      if (setterIndex !== -1) {
        // Remove problematic setter to unblock subsequent imports.
        setters.splice(setterIndex, 1);
        throw new ERR_EXPORT_MISSING(entry.module, exportedName);
      }
    }
  }

  return validateShallow;
}

/* harmony default export */ var validate_shallow = (src_shared.inited ? src_shared.module.moduleEsmValidateShallow : src_shared.module.moduleEsmValidateShallow = validate_shallow_init());
// CONCATENATED MODULE: ./src/module/esm/import.js












var ERR_INVALID_ESM_FILE_EXTENSION = src_errors.ERR_INVALID_ESM_FILE_EXTENSION;
var import_TYPE_CJS = constant_entry.TYPE_CJS,
    import_TYPE_ESM = constant_entry.TYPE_ESM,
    import_STATE_PARSING_COMPLETED = constant_entry.STATE_PARSING_COMPLETED,
    UPDATE_TYPE_INIT = constant_entry.UPDATE_TYPE_INIT;

function esmImport(request, parentEntry, setterArgsList, isDynamic = false) {
  var moduleState = src_shared.moduleState;
  var parsing = moduleState.parsing;
  var entry = null;
  var finalizeCalled = false;

  var addChild = function (entry, childEntry, name = childEntry.name) {
    entry.children[name] = childEntry;
    childEntry.addSetters(setterArgsList, entry);
  };

  var finalize = function () {
    "use strict";

    if (finalizeCalled) {
      return;
    }

    finalizeCalled = true;
    var exported = tryRequire(request, parentEntry);

    if (entry === null) {
      entry = getEntryFrom(request, exported, parentEntry);
      addChild(parentEntry, entry);
    } else if (!Object.is(entry.module.exports, exported)) {
      var _entry = entry,
          name = _entry.name;
      entry = getEntryFrom(request, exported, parentEntry);
      addChild(parentEntry, entry, name);
    }

    entry.loaded();
    entry.updateBindings(null, UPDATE_TYPE_INIT);
    validate_shallow(entry, parentEntry);
  };

  var preload = function (entry) {
    return addChild(parentEntry, entry);
  };

  if (isDynamic || parsing) {
    if (isDynamic) {
      moduleState.parsing = true;
    }

    try {
      entry = tryLoad(request, parentEntry, preload);
    } finally {
      if (isDynamic) {
        moduleState.parsing = false;
      }
    }

    if (entry !== null) {
      entry.updateBindings();

      if (isDynamic && entry.state === import_STATE_PARSING_COMPLETED && entry.type !== import_TYPE_CJS) {
        validate_deep(entry);
      }
    }
  } else {
    entry = tryLoad(request, parentEntry, preload);
  }

  if (parsing) {
    if (entry === null) {
      var exported = tryRequire(request, parentEntry);
      entry = getEntryFrom(request, exported, parentEntry);
      addChild(parentEntry, entry);
    }

    entry._finalize = finalize;
  }

  if (parentEntry.extname === ".mjs" && entry !== null && entry.type === import_TYPE_ESM && entry.extname !== ".mjs") {
    throw ERR_INVALID_ESM_FILE_EXTENSION(entry.module);
  }

  if (!parsing) {
    finalize();
  }
}

function getEntryFrom(request, exported, parentEntry) {
  "use strict";

  var _lastChild = parentEntry._lastChild;

  if (_lastChild !== null && Object.is(_lastChild.module.exports, exported)) {
    return _lastChild;
  }

  var filename = import_tryDualResolveFilename(request, parentEntry.module);
  var mod = new src_module(filename);
  mod.exports = exported;
  mod.loaded = true;

  if (is_path(filename)) {
    mod.filename = filename;
  }

  return src_entry.get(mod);
}

function import_tryDualResolveFilename(request, parent, isMain) {
  "use strict";

  try {
    return dual_resolve_filename(request, parent, isMain);
  } catch (_unused) {}

  if (is_path(request)) {
    var parentFilename = parent.filename;
    return typeof parentFilename === "string" ? path_resolve(parentFilename, request) : path_resolve(request);
  }

  return request;
}

function tryLoad(request, parentEntry, preload) {
  "use strict";

  var moduleState = src_shared.moduleState;
  moduleState.requireDepth += 1;
  var entry;
  var error;
  var threw = true;

  try {
    entry = esm_load(request, parentEntry.module, false, preload);
    threw = false;
  } catch (e) {
    error = e;
  }

  moduleState.requireDepth -= 1;

  if (!threw) {
    return entry;
  }

  if (parentEntry.extname === ".mjs" || !is_error(error)) {
    throw error;
  }

  var _error = error,
      code = _error.code;

  if (code !== "ERR_INVALID_PROTOCOL" && code !== "MODULE_NOT_FOUND") {
    throw error;
  }

  return null;
}

function tryRequire(request, parentEntry) {
  "use strict";

  parentEntry._passthruRequire = true;

  try {
    return parentEntry.module.require(request);
  } finally {
    parentEntry._passthruRequire = false;
  }
}

/* harmony default export */ var esm_import = (esmImport);
// CONCATENATED MODULE: ./src/util/identity.js


function identity_init() {
  "use strict";

  function identity(value) {
    return value;
  }

  return identity;
}

/* harmony default export */ var identity = (src_shared.inited ? src_shared.module.utilIdentity : src_shared.module.utilIdentity = identity_init());
// CONCATENATED MODULE: ./src/runtime.js




















var ERROR_GETTER = constant_entry.ERROR_GETTER,
    ERROR_STAR = constant_entry.ERROR_STAR,
    GETTER_TYPE_STAR_CONFLICT = constant_entry.GETTER_TYPE_STAR_CONFLICT,
    runtime_LOAD_COMPLETED = constant_entry.LOAD_COMPLETED,
    runtime_NAMESPACE_FINALIZATION_DEFERRED = constant_entry.NAMESPACE_FINALIZATION_DEFERRED,
    SETTER_TYPE_DYNAMIC_IMPORT = constant_entry.SETTER_TYPE_DYNAMIC_IMPORT,
    runtime_SETTER_TYPE_EXPORT_FROM = constant_entry.SETTER_TYPE_EXPORT_FROM,
    SETTER_TYPE_NAMESPACE = constant_entry.SETTER_TYPE_NAMESPACE,
    runtime_TYPE_CJS = constant_entry.TYPE_CJS,
    runtime_TYPE_ESM = constant_entry.TYPE_ESM,
    runtime_TYPE_PSEUDO = constant_entry.TYPE_PSEUDO,
    UPDATE_TYPE_LIVE = constant_entry.UPDATE_TYPE_LIVE;
var ERR_CONST_ASSIGNMENT = src_errors.ERR_CONST_ASSIGNMENT,
    ERR_UNDEFINED_IDENTIFIER = src_errors.ERR_UNDEFINED_IDENTIFIER;
var runtime_shared$external = src_shared.external,
    ExPromise = runtime_shared$external.Promise,
    evalIndirect = runtime_shared$external.eval;
var Runtime = {
  addDefaultValue(value) {
    this.addExportGetters([["default", function () {
      return value;
    }]]);

    if (value === void 0) {
      this.initBindings(["default"]);
    }
  },

  addExportFromSetter(importedName, exportedName = importedName) {
    var _this = this;

    var setter = createAccessor(runtime_SETTER_TYPE_EXPORT_FROM, function (value, childEntry) {
      "use strict";

      var entry = _this.entry;

      if (entry._loaded === runtime_LOAD_COMPLETED) {
        return true;
      }

      if (childEntry.type === runtime_TYPE_CJS && childEntry._loaded !== runtime_LOAD_COMPLETED) {
        entry._namespaceFinalized = runtime_NAMESPACE_FINALIZATION_DEFERRED;
      }

      entry.addGetterFrom(childEntry, importedName, exportedName);
    });
    setter.exportedName = exportedName;
    return setter;
  },

  addExportGetters(getterArgsList) {
    this.entry.addGetters(getterArgsList);
  },

  addNamespaceSetter() {
    var _this2 = this;

    return createAccessor(SETTER_TYPE_NAMESPACE, function (value, childEntry) {
      "use strict";

      var entry = _this2.entry;

      if (entry._loaded === runtime_LOAD_COMPLETED) {
        return true;
      }

      var childIsLoaded = childEntry._loaded === runtime_LOAD_COMPLETED;

      if (!childIsLoaded && childEntry.type === runtime_TYPE_CJS) {
        entry._namespaceFinalized = runtime_NAMESPACE_FINALIZATION_DEFERRED;
        return;
      }

      var childGetters = childEntry.getters;
      var getters = entry.getters,
          name = entry.name;
      var namespace = childIsLoaded ? childEntry.getExportByName("*", entry) : childEntry.getters;

      for (var exportedName in namespace) {
        if (exportedName === "default") {
          continue;
        }

        var ownerName = void 0;
        var getter = getters[exportedName];

        if (getter !== void 0) {
          ownerName = getter.owner.name;

          if (name === ownerName) {
            continue;
          }
        }

        var childOwnerName = childGetters[exportedName].owner.name;

        if (getter === void 0 || ownerName === childOwnerName) {
          entry.addGetterFrom(childEntry, exportedName);
        }

        ownerName = getters[exportedName].owner.name;

        if (ownerName !== name && ownerName !== childOwnerName) {
          entry.addGetter(exportedName, createAccessor(GETTER_TYPE_STAR_CONFLICT, function () {
            return ERROR_STAR;
          }));
        }
      }
    });
  },

  assertImportedBinding: function assertImportedBinding(name, value) {
    "use strict";

    if (this.entry.importedBindings.get(name) !== true) {
      throw new ERR_UNDEFINED_IDENTIFIER(name, assertImportedBinding);
    }

    return value;
  },
  assertUndeclared: function assertUndeclared(name) {
    "use strict";

    var unsafeGlobal = src_shared.unsafeGlobal;

    if (!has(unsafeGlobal, name)) {
      throw new ERR_UNDEFINED_IDENTIFIER(name, assertUndeclared);
    }

    return unsafeGlobal[name];
  },

  compileEval(content) {
    // Section 18.2.1.1: PerformEval()
    // Setp 2: Only evaluate strings.
    // https://tc39.github.io/ecma262/#sec-performeval
    if (typeof content !== "string") {
      return content;
    }

    var entry = this.entry;
    var cjs = entry.package.options.cjs;
    var isMJS = entry.extname === ".mjs";
    var cjsVars = cjs.vars && !isMJS;

    try {
      return caching_compiler.compile(content, {
        cjsVars,
        eval: true,
        runtimeName: entry.runtimeName
      }).code;
    } catch (e) {
      if (!src_loader.state.package.default.options.debug && is_stack_trace_maskable(e)) {
        var type = entry.type;
        mask_stack_trace(e, {
          content,
          filename: "eval",
          inModule: (!cjs.paths || isMJS) && type !== runtime_TYPE_CJS && type !== runtime_TYPE_PSEUDO
        });
      } else {
        to_external_error(e);
      }

      throw e;
    }
  },

  compileGlobalEval(content) {
    if (typeof content !== "string") {
      return content;
    }

    var entry = this.entry;
    var cjs = entry.package.options.cjs;
    var isMJS = entry.extname === ".mjs";
    var runtimeName = entry.runtimeName;
    var cjsVars = cjs.vars && !isMJS;
    var code;

    try {
      var compileData = caching_compiler.compile(content, {
        cjsVars,
        eval: true,
        runtimeName
      });

      if (compileData.transforms === 0) {
        return content;
      }

      code = compileData.code;
    } catch (e) {
      if (!src_loader.state.package.default.options.debug && is_stack_trace_maskable(e)) {
        var type = entry.type;
        mask_stack_trace(e, {
          content,
          filename: "eval",
          inModule: (!cjs.paths || isMJS) && type !== runtime_TYPE_CJS && type !== runtime_TYPE_PSEUDO
        });
      } else {
        to_external_error(e);
      }

      throw e;
    }

    var unsafeGlobal = src_shared.unsafeGlobal;

    if (has(unsafeGlobal, runtimeName)) {
      return code;
    }

    var runtime = this;
    Reflect.defineProperty(unsafeGlobal, runtimeName, {
      configurable: true,
      get: to_external_function(function () {
        "use strict";

        Reflect.deleteProperty(this, runtimeName);
        return runtime;
      })
    });
    code = (has_pragma(code, "use strict") ? '"use strict";' : "") + "let " + runtimeName + "=global." + runtimeName + ";" + code;
    return code;
  },

  dynamicImport(request) {
    var entry = this.entry;
    return new ExPromise(function (resolvePromise, rejectPromise) {
      "use strict";

      setImmediate(function () {
        try {
          // Section 2.2.1: Runtime Semantics: Evaluation
          // Step 6: Coerce request to a string.
          // https://tc39.github.io/proposal-dynamic-import/#sec-import-call-runtime-semantics-evaluation
          if (typeof request !== "string") {
            request = request + "";
          }

          var lastValue;
          var timerId;
          var setterArgsList = [["*", null, createAccessor(SETTER_TYPE_DYNAMIC_IMPORT, function (value, childEntry) {
            if (childEntry._loaded === runtime_LOAD_COMPLETED) {
              lastValue = value;

              if (timerId === void 0) {
                timerId = setImmediate(function () {
                  return resolvePromise(lastValue);
                });
              }

              return true;
            }
          })]];
          esm_import(request, entry, setterArgsList, true);
        } catch (e) {
          if (!src_loader.state.package.default.options.debug && is_stack_trace_maskable(e)) {
            mask_stack_trace(e, {
              inModule: !entry.package.options.cjs.paths || entry.extname === ".mjs"
            });
          } else {
            to_external_error(e);
          }

          rejectPromise(e);
        }
      });
    });
  },

  enable(entry, exported) {
    if (entry.runtime !== null) {
      return entry.runtime;
    }

    var mod = entry.module;
    var runtime = mod.exports;

    var boundCompileEval = function (code) {
      return Runtime.compileEval.call(runtime, code);
    };

    var boundGlobalEval = function (code) {
      return Runtime.globalEval.call(runtime, code);
    };

    entry.exports = exported;
    set_deferred(runtime, "meta", function () {
      "use strict";

      var id = entry.id;
      var url = null;

      if (is_file_origin(id)) {
        url = id;
      } else if (is_path(id)) {
        url = get_url_from_file_path(id);
      }

      return {
        __proto__: null,
        url
      };
    });
    runtime.addDefaultValue = Runtime.addDefaultValue;
    runtime.addExportFromSetter = Runtime.addExportFromSetter;
    runtime.addExportGetters = Runtime.addExportGetters;
    runtime.addNamespaceSetter = Runtime.addNamespaceSetter;
    runtime.assertImportedBinding = Runtime.assertImportedBinding;
    runtime.assertUndeclared = Runtime.assertUndeclared;
    runtime.compileEval = boundCompileEval;
    runtime.compileGlobalEval = Runtime.compileGlobalEval;
    runtime.dynamicImport = Runtime.dynamicImport;
    runtime.entry = entry;
    runtime.global = builtin_global;
    runtime.globalEval = boundGlobalEval;
    runtime.import = Runtime.import;
    runtime.initBindings = Runtime.initBindings;
    runtime.resumeChildren = Runtime.resumeChildren;
    runtime.run = Runtime.run;
    runtime.runResult = void 0;
    runtime.throwConstAssignment = Runtime.throwConstAssignment;
    runtime.updateBindings = Runtime.updateBindings;
    runtime._ = runtime;
    runtime.a = runtime.assertImportedBinding;
    runtime.b = runtime.throwConstAssignment;
    runtime.c = runtime.compileEval;
    runtime.d = runtime.addDefaultValue;
    runtime.e = runtime.globalEval;
    runtime.f = runtime.addExportFromSetter;
    runtime.g = runtime.global;
    runtime.i = runtime.dynamicImport;
    runtime.j = runtime.initBindings;
    runtime.k = identity;
    runtime.n = runtime.addNamespaceSetter;
    runtime.o = ERROR_GETTER;
    runtime.r = runtime.run;
    runtime.s = runtime.resumeChildren;
    runtime.t = runtime.assertUndeclared;
    runtime.u = runtime.updateBindings;
    runtime.v = evalIndirect;
    runtime.w = runtime.import;
    runtime.x = runtime.addExportGetters;
    return entry.runtime = runtime;
  },

  globalEval(content) {
    return evalIndirect(this.compileGlobalEval(content));
  },

  import(request, setterArgsList) {
    return esm_import(request, this.entry, setterArgsList);
  },

  initBindings(names) {
    this.entry.updateBindings(names);
  },

  resumeChildren() {
    this.entry.resumeChildren();
  },

  run(moduleWrapper) {
    var entry = this.entry;
    var runner = entry.type === runtime_TYPE_ESM ? runESM : runCJS;
    return this.runResult = runner(entry, moduleWrapper);
  },

  throwConstAssignment: function throwConstAssignment() {
    "use strict";

    throw new ERR_CONST_ASSIGNMENT(throwConstAssignment);
  },

  updateBindings(valueToPassThrough) {
    this.entry.updateBindings(null, UPDATE_TYPE_LIVE); // Returns the `valueToPassThrough()` parameter to allow the value of the
    // original expression to pass through. For example,
    //
    //   export let a = 1
    //   a += 3
    //
    // becomes
    //
    //   runtime.addExportGetters([["a", () => a]])
    //   let a = 1
    //   runtime.updateBindings(a += 3)
    //
    // This ensures `entry.updateBindings()` runs immediately after assignment,
    // without interfering with the larger computation.

    return valueToPassThrough;
  }

};

function createAccessor(type, accessor) {
  "use strict";

  accessor.type = type;
  return accessor;
}

function runCJS(entry, moduleWrapper) {
  "use strict";

  var mod = entry.module;
  var exported = entry.exports;
  mod.exports = exported;
  return Reflect.apply(moduleWrapper, exported, [exported, make_require_function(mod)]);
}

function runESM(entry, moduleWrapper) {
  "use strict";

  var mod = entry.module;
  var exported = entry.exports;
  mod.exports = exported;

  if (entry.package.options.cjs.vars && entry.extname !== ".mjs") {
    return Reflect.apply(moduleWrapper, exported, [exported, make_require_function(mod)]);
  }

  return Reflect.apply(moduleWrapper, void 0, []);
}

/* harmony default export */ var src_runtime = (Runtime);
// CONCATENATED MODULE: ./src/safe/json.js


/* harmony default export */ var safe_json = (src_shared.inited ? src_shared.module.safeJSON : src_shared.module.safeJSON = util_safe(src_shared.external.JSON));
// CONCATENATED MODULE: ./src/util/create-source-map.js





function create_source_map_init() {
  "use strict";

  var newlineRegExp = /\n/g;

  function createSourceMap(filename, content) {
    if (!is_path(filename)) {
      return "";
    }

    var lineCount = 0;
    var mapping = "";

    while (lineCount === 0 || newlineRegExp.test(content)) {
      // Each segment has 4 VLQ fields. They are:
      //  - The starting column index of the current line.
      //  - The index of the source file.
      //  - The starting line index in the source that this segment
      //    corresponds to, relative to the previous value.
      //  - The starting column index in the source that this segment
      //    corresponds to, relative to the previous value.
      //
      // Integer to VLQ value map:
      //  0 -> "A"
      //  1 -> "C"
      //
      // For more details see
      // https://sourcemaps.info/spec.html#h.qz3o9nc69um5 and
      // https://github.com/Rich-Harris/vlq#what-is-a-vlq-string.
      mapping += (lineCount ? ";" : "") + "AA" + (lineCount ? "C" : "A") + "A";
      lineCount += 1;
    }

    return '{"version":3,"sources":[' + to_string_literal(get_url_from_file_path(filename)) + '],"names":[],"mappings":"' + mapping + '"}';
  }

  return createSourceMap;
}

/* harmony default export */ var create_source_map = (src_shared.inited ? src_shared.module.utilCreateSourceMap : src_shared.module.utilCreateSourceMap = create_source_map_init());
// CONCATENATED MODULE: ./src/util/create-inline-source-map.js




function create_inline_source_map_init() {
  "use strict";

  function createInlineSourceMap(filename, content) {
    var sourceMap = create_source_map(filename, content);

    if (sourceMap === "") {
      return sourceMap;
    }

    return "//# sourceMappingURL=data:application/json;charset=utf-8," + encode_uri(sourceMap);
  }

  return createInlineSourceMap;
}

/* harmony default export */ var create_inline_source_map = (src_shared.inited ? src_shared.module.utilCreateInlineSourceMap : src_shared.module.utilCreateInlineSourceMap = create_inline_source_map_init());
// CONCATENATED MODULE: ./src/module/internal/compile-source.js






function compile_source_init() {
  "use strict";

  var SEMICOLON = char_code.SEMICOLON;
  var SOURCE_TYPE_MODULE = compiler.SOURCE_TYPE_MODULE;

  function compileSource(compileData, options = {}) {
    var compile = compileData.sourceType === SOURCE_TYPE_MODULE ? compileESM : compileCJS;
    return compile(compileData, options);
  }

  function compileCJS(compileData, options) {
    var async = options.async;
    var changed = compileData.transforms !== 0;
    var content = compileData.code;

    if (changed) {
      var returnRun = compileData.firstReturnOutsideFunction !== null;
      var runtimeName = options.runtimeName;

      if (compileData.firstAwaitOutsideFunction === null) {
        async = false;
      }

      content = "const " + runtimeName + "=exports;" + (returnRun ? "return " : "") + runtimeName + ".r((" + (async ? "async " : "") + "function(exports,require){" + content + "\n}))";
    } else if (async) {
      changed = true;
      content = "(async () => { " + strip_shebang(content) + "\n})();";
    }

    if (changed && options.sourceMap) {
      content += create_inline_source_map(compileData.filename, content);
    }

    return content;
  }

  function compileESM(compileData, options) {
    var cjsVars = options.cjsVars,
        runtimeName = options.runtimeName;
    var returnRun = compileData.firstReturnOutsideFunction !== null;
    var yieldCode = "yield;" + runtimeName + ".s();";
    var yieldIndex = compileData.yieldIndex;
    var async = options.async;

    if (compileData.firstAwaitOutsideFunction === null) {
      async = false;
    }

    var code = compileData.code;

    if (compileData.transforms === 0) {
      code = strip_shebang(code);
    }

    if (yieldIndex !== -1) {
      if (yieldIndex === 0) {
        code = yieldCode + code;
      } else {
        code = code.slice(0, yieldIndex) + (code.charCodeAt(yieldIndex - 1) === SEMICOLON ? "" : ";") + yieldCode + code.slice(yieldIndex);
      }
    }

    var content = "const " + runtimeName + "=exports;" + (cjsVars ? "" : "__dirname=__filename=arguments=exports=module=require=void 0;") + (returnRun ? "return " : "") + runtimeName + ".r((" + (async ? "async " : "") + "function *" + "(" + (cjsVars ? "exports,require" : "") + '){"use strict";' + code + "\n}))";

    if (options.sourceMap) {
      content += create_inline_source_map(compileData.filename, content);
    }

    return content;
  }

  return compileSource;
}

/* harmony default export */ var compile_source = (src_shared.inited ? src_shared.module.moduleInternalCompileSource : src_shared.module.moduleInternalCompileSource = compile_source_init());
// CONCATENATED MODULE: ./src/util/get-source-mapping-url.js
// Inspired by `findMagicComment()`.
// https://chromium.googlesource.com/v8/v8.git/+/master/src/inspector/search-util.cc



function get_source_mapping_url_init() {
  "use strict";

  var APOSTROPHE = char_code.APOSTROPHE,
      AT = char_code.AT,
      EQUAL = char_code.EQUAL,
      FORWARD_SLASH = char_code.FORWARD_SLASH,
      NUMSIGN = char_code.NUMSIGN,
      QUOTE = char_code.QUOTE,
      SPACE = char_code.SPACE,
      TAB = char_code.TAB;
  var NAME = "sourceMappingURL";
  var NAME_LENGTH = NAME.length;
  var MIN_LENGTH = NAME_LENGTH + 6;

  function getSourceMappingURL(content) {
    if (typeof content !== "string") {
      return "";
    }

    var length = content.length;

    if (length < MIN_LENGTH) {
      return "";
    }

    var match = null;
    var pos = length;

    while (match === null) {
      pos = content.lastIndexOf(NAME, pos);

      if (pos === -1 || pos < 4) {
        return "";
      }

      var equalPos = pos + NAME_LENGTH;
      var urlPos = equalPos + 1;
      pos -= 4; // Codeify the regexp check, /\/\/[@#][ \t]/, before `NAME`.

      if (content.charCodeAt(pos) !== FORWARD_SLASH || content.charCodeAt(pos + 1) !== FORWARD_SLASH) {
        continue;
      }

      var code = content.charCodeAt(pos + 2);

      if (code !== AT && code !== NUMSIGN) {
        continue;
      }

      code = content.charCodeAt(pos + 3);

      if (code !== SPACE && code !== TAB) {
        continue;
      } // Check for "=" after `NAME`.


      if (equalPos < length && content.charCodeAt(equalPos) !== EQUAL) {
        continue;
      }

      if (urlPos === length) {
        return "";
      }

      match = content.slice(urlPos);
    }

    var newLinePos = match.indexOf("\n");

    if (newLinePos !== -1) {
      match = match.slice(0, newLinePos);
    }

    match = match.trim();
    var matchLength = match.length;
    var i = -1;

    while (++i < matchLength) {
      var _code = match.charCodeAt(i);

      if (_code === APOSTROPHE || _code === QUOTE || _code === SPACE || _code === TAB) {
        return "";
      }
    }

    return match;
  }

  return getSourceMappingURL;
}

/* harmony default export */ var get_source_mapping_url = (src_shared.inited ? src_shared.module.utilGetSourceMappingURL : src_shared.module.utilGetSourceMappingURL = get_source_mapping_url_init());
// CONCATENATED MODULE: ./src/error/get-stack-frames.js






function get_stack_frames_init() {
  "use sloppy";

  var getStructuredStackTrace = to_external_function(function (error, trace) {
    return trace;
  });

  function getStackFrames(error) {
    if (!is_error(error)) {
      return [];
    }

    var BuiltinError = get_builtin_error_constructor(error);
    var prepareStackTraceDescriptor = Reflect.getOwnPropertyDescriptor(BuiltinError, "prepareStackTrace");
    set_property(BuiltinError, "prepareStackTrace", getStructuredStackTrace);
    var stack = error.stack;

    if (prepareStackTraceDescriptor === void 0) {
      Reflect.deleteProperty(BuiltinError, "prepareStackTrace");
    } else {
      Reflect.defineProperty(BuiltinError, "prepareStackTrace", prepareStackTraceDescriptor);
    }

    return Array.isArray(stack) ? stack : [];
  }

  return getStackFrames;
}

/* harmony default export */ var get_stack_frames = (src_shared.inited ? src_shared.module.errorGetStackFrames : src_shared.module.errorGetStackFrames = get_stack_frames_init());
// CONCATENATED MODULE: ./src/util/is-identifier-name.js



function is_identifier_name_init() {
  "use strict";

  function isIdentifierName(name) {
    if (typeof name !== "string" || name.length === 0) {
      return false;
    }

    var i = 0;
    var point = name.codePointAt(i);

    if (!isIdentifierStart(point, true)) {
      return false;
    }

    var prevPoint = point; // Code points higher than U+FFFF, i.e. 0xFFFF or 65535 in decimal, belong
    // to the astral planes which are represented by surrogate pairs and require
    // incrementing `i` by 2.
    // https://mathiasbynens.be/notes/javascript-unicode#unicode-basics

    while ((point = name.codePointAt(i += prevPoint > 0xFFFF ? 2 : 1)) !== void 0) {
      if (!isIdentifierChar(point, true)) {
        return false;
      }

      prevPoint = point;
    }

    return true;
  }

  return isIdentifierName;
}

/* harmony default export */ var is_identifier_name = (src_shared.inited ? src_shared.module.utilIsIdentifierName : src_shared.module.utilIsIdentifierName = is_identifier_name_init());
// CONCATENATED MODULE: ./src/util/is-object-empty.js



function is_object_empty_init() {
  "use strict";

  function isObjectEmpty(object) {
    for (var name in object) {
      if (has(object, name)) {
        return false;
      }
    }

    return true;
  }

  return isObjectEmpty;
}

/* harmony default export */ var is_object_empty = (src_shared.inited ? src_shared.module.utilIsObjectEmpty : src_shared.module.utilIsObjectEmpty = is_object_empty_init());
// CONCATENATED MODULE: ./src/module/internal/compile.js






































var SOURCE_TYPE_JSON = compiler.SOURCE_TYPE_JSON,
    compile_SOURCE_TYPE_MODULE = compiler.SOURCE_TYPE_MODULE,
    compile_SOURCE_TYPE_SCRIPT = compiler.SOURCE_TYPE_SCRIPT,
    compile_SOURCE_TYPE_UNAMBIGUOUS = compiler.SOURCE_TYPE_UNAMBIGUOUS,
    SOURCE_TYPE_WASM = compiler.SOURCE_TYPE_WASM,
    compile_TRANSFORMS_EVAL = compiler.TRANSFORMS_EVAL;
var compile_ERROR_GETTER = constant_entry.ERROR_GETTER,
    compile_NAMESPACE_FINALIZATION_DEFERRED = constant_entry.NAMESPACE_FINALIZATION_DEFERRED,
    STATE_EXECUTION_COMPLETED = constant_entry.STATE_EXECUTION_COMPLETED,
    STATE_EXECUTION_STARTED = constant_entry.STATE_EXECUTION_STARTED,
    STATE_INITIAL = constant_entry.STATE_INITIAL,
    compile_STATE_PARSING_COMPLETED = constant_entry.STATE_PARSING_COMPLETED,
    STATE_PARSING_STARTED = constant_entry.STATE_PARSING_STARTED,
    compile_TYPE_CJS = constant_entry.TYPE_CJS,
    compile_TYPE_ESM = constant_entry.TYPE_ESM,
    compile_TYPE_JSON = constant_entry.TYPE_JSON,
    TYPE_WASM = constant_entry.TYPE_WASM;
var DEVELOPMENT = constant_env.DEVELOPMENT,
    compile_ELECTRON_RENDERER = constant_env.ELECTRON_RENDERER,
    compile_FLAGS = constant_env.FLAGS,
    NDB = constant_env.NDB;
var compile_ILLEGAL_AWAIT_IN_NON_ASYNC_FUNCTION = constant_message.ILLEGAL_AWAIT_IN_NON_ASYNC_FUNCTION;
var MODE_ALL = constant_package.MODE_ALL,
    MODE_AUTO = constant_package.MODE_AUTO;
var dummyParser = {
  input: ""
};
var exportsRegExp = /^.*?\bexports\b/;

function compile_compile(caller, entry, content, filename, fallback) {
  "use strict";

  var ext = entry.extname;
  var mod = entry.module;
  var pkg = entry.package;
  var options = pkg.options;
  var pkgMode = options.mode;
  var hint = -1;
  var isJSON = false;
  var isWASM = false;
  var sourceType = compile_SOURCE_TYPE_SCRIPT;

  if (ext === ".cjs") {
    hint = compile_SOURCE_TYPE_SCRIPT;
  } else if (ext === ".json") {
    hint = SOURCE_TYPE_JSON;
    isJSON = true;
  } else if (ext === ".mjs") {
    hint = compile_SOURCE_TYPE_MODULE;
  } else if (ext === ".wasm") {
    hint = SOURCE_TYPE_WASM;
    isWASM = true;
  }

  if (pkgMode === MODE_ALL) {
    sourceType = compile_SOURCE_TYPE_MODULE;
  } else if (pkgMode === MODE_AUTO) {
    sourceType = compile_SOURCE_TYPE_UNAMBIGUOUS;
  }

  var defaultPkg = src_loader.state.package.default;
  var isDefaultPkg = pkg === defaultPkg;
  var isMJS = entry.extname === ".mjs";
  var compileData = entry.compileData;

  if (compileData === null) {
    var cacheName = entry.cacheName;
    compileData = caching_compiler.from(entry);

    if (compileData === null || compileData.transforms !== 0) {
      if (isJSON || isWASM) {
        entry.type = isJSON ? compile_TYPE_JSON : TYPE_WASM;
        compileData = {
          circular: 0,
          code: null,
          codeWithTDZ: null,
          filename: null,
          firstAwaitOutsideFunction: null,
          firstReturnOutsideFunction: null,
          mtime: -1,
          scriptData: null,
          sourceType: hint,
          transforms: 0,
          yieldIndex: -1
        };
      } else {
        var cjs = options.cjs;
        var cjsPaths = cjs.paths && !isMJS;
        var cjsVars = cjs.vars && !isMJS;
        var scriptData = compileData === null ? null : compileData.scriptData;
        var topLevelReturn = cjs.topLevelReturn && !isMJS;
        compileData = tryCompile(caller, entry, content, {
          cacheName,
          cachePath: pkg.cachePath,
          cjsPaths,
          cjsVars,
          filename,
          hint,
          mtime: entry.mtime,
          runtimeName: entry.runtimeName,
          sourceType,
          topLevelReturn
        });
        compileData.scriptData = scriptData;

        if (compileData.sourceType === compile_SOURCE_TYPE_MODULE) {
          entry.type = compile_TYPE_ESM;
        }

        if (isDefaultPkg && entry.type === compile_TYPE_CJS && compileData.transforms === compile_TRANSFORMS_EVAL) {
          // Under the default package configuration, discard changes for CJS
          // modules with only `eval()` transformations.
          compileData.code = content;
          compileData.transforms = 0;
        }
      }

      entry.compileData = compileData;
      pkg.cache.compile.set(cacheName, compileData);
    }
  }

  if (compileData !== null && compileData.code === null) {
    compileData.code = content;
  }

  var isESM = entry.type === compile_TYPE_ESM;
  var useFallback = false;

  if (!isESM && !isWASM && typeof fallback === "function") {
    var parentEntry = src_entry.get(entry.parent);
    var parentIsESM = parentEntry === null ? false : parentEntry.type === compile_TYPE_ESM;
    var parentPkg = parentEntry === null ? null : parentEntry.package;

    if (!parentIsESM && (isDefaultPkg || parentPkg === defaultPkg)) {
      useFallback = true;
    }
  }

  if (useFallback) {
    entry.type = compile_TYPE_CJS;
    var frames = get_stack_frames(construct_error(Error, empty_array));

    for (var _i = 0, _length = frames == null ? 0 : frames.length; _i < _length; _i++) {
      var frame = frames[_i];
      var framePath = frame.getFileName();

      if (is_absolute(framePath) && !is_own_path(framePath)) {
        return fallback(content);
      }
    }

    return tryRun(entry, filename, fallback);
  }

  var moduleState = src_shared.moduleState;
  var isSideloaded = false;

  if (!moduleState.parsing) {
    if ((isESM || isJSON || isWASM) && entry.state === STATE_INITIAL) {
      isSideloaded = true;
      moduleState.parsing = true;
      entry.state = STATE_PARSING_STARTED;
    } else {
      return tryRun(entry, filename, fallback);
    }
  }

  if (isESM || isJSON || isWASM) {
    try {
      var result = tryRun(entry, filename, fallback);

      if (compileData.circular === -1) {
        compileData.circular = isDescendant(entry, entry) ? 1 : 0;
      }

      if (compileData.circular === 1) {
        entry.circular = true;

        if (isESM) {
          entry.runtime = null;
          mod.exports = generic_object.create();
          var _compileData = compileData,
              codeWithTDZ = _compileData.codeWithTDZ;

          if (codeWithTDZ !== null) {
            compileData.code = codeWithTDZ;
          }

          result = tryRun(entry, filename, fallback);
        }
      }

      entry.updateBindings();

      if (entry._namespaceFinalized !== compile_NAMESPACE_FINALIZATION_DEFERRED) {
        entry.finalizeNamespace();
      }

      if (!isSideloaded) {
        return result;
      }
    } finally {
      if (isSideloaded) {
        moduleState.parsing = false;
      }
    }
  }

  return tryRun(entry, filename, fallback);
}

function isDescendant(entry, parentEntry, seen) {
  "use strict";

  if (seen === void 0) {
    seen = new Set();
  } else if (seen.has(parentEntry)) {
    return false;
  }

  seen.add(parentEntry);
  var children = parentEntry.children;

  for (var name in children) {
    var childEntry = children[name];

    if (entry === childEntry || isDescendant(entry, childEntry, seen)) {
      return true;
    }
  }

  return false;
}

function tryCompile(caller, entry, content, options) {
  "use strict";

  var error;

  try {
    return caching_compiler.compile(content, options);
  } catch (e) {
    error = e;
  }

  entry.state = STATE_INITIAL;

  if (!src_loader.state.package.default.options.debug && is_stack_trace_maskable(error)) {
    capture_stack_trace(error, caller);
    mask_stack_trace(error, {
      content,
      filename: options.filename
    });
  } else {
    to_external_error(error);
  }

  throw error;
}

function tryRun(entry, filename, fallback) {
  "use strict";

  var compileData = entry.compileData,
      type = entry.type;
  var isESM = type === compile_TYPE_ESM;
  var isJSON = type === compile_TYPE_JSON;
  var isMJS = entry.extname === ".mjs";
  var isWASM = type === TYPE_WASM;
  var runtime = entry.runtime;

  if (runtime === null) {
    if (isESM || compileData.transforms !== 0) {
      runtime = src_runtime.enable(entry, generic_object.create());
    } else {
      runtime = generic_object.create();
      entry.runtime = runtime;
    }
  }

  var pkg = entry.package;
  var async = useAsync(entry);
  var cjs = pkg.options.cjs;
  var firstPass = runtime.runResult === void 0;
  var mod = entry.module;
  var parsing = src_shared.moduleState.parsing;
  var error;
  var result;
  var threw = false;
  entry.state = parsing ? STATE_PARSING_STARTED : STATE_EXECUTION_STARTED;

  if (firstPass) {
    entry.running = true;

    if (isJSON) {
      runtime.runResult = function* () {
        var parsed = jsonParse(entry, filename, fallback);
        yield;
        jsonEvaluate(entry, parsed);
      }();
    } else if (isWASM) {
      runtime.runResult = function* () {
        // Use a `null` [[Prototype]] for `importObject` because the lookup
        // includes inherited properties.
        var importObject = {
          __proto__: null
        };
        var wasmMod = wasmParse(entry, filename, importObject);
        yield;
        wasmEvaluate(entry, wasmMod, importObject);
      }();
    } else {
      var cjsVars = cjs.vars && !isMJS;
      var source = compile_source(compileData, {
        async,
        cjsVars,
        runtimeName: entry.runtimeName,
        sourceMap: useSourceMap(entry)
      });

      if (isESM) {
        try {
          if (entry._ranthruCompile) {
            result = Reflect.apply(proto_compile, mod, [source, filename]);
          } else {
            entry._ranthruCompile = true;
            result = mod._compile(source, filename);
          }
        } catch (e) {
          threw = true;
          error = e;
        }
      } else {
        var _compile = mod._compile;

        runtime.runResult = function* () {
          yield; // Avoid V8 tail call optimization bug with --harmony flag in Node 6.
          // https://bugs.chromium.org/p/v8/issues/detail?id=5322

          return result = Reflect.apply(_compile, mod, [source, filename]);
        }();
      }
    }

    entry.running = false;
  }

  var _runtime = runtime,
      runResult = _runtime.runResult;

  if (!threw && !parsing && firstPass) {
    entry.running = true;

    try {
      runResult.next();
    } catch (e) {
      threw = true;
      error = e;
    }

    entry.running = false;
  }

  var firstAwaitOutsideFunction = compileData.firstAwaitOutsideFunction;
  var inModule = (!cjs.paths || isMJS) && entry.type !== compile_TYPE_CJS;

  if (!threw && !entry.running && async && isESM && firstAwaitOutsideFunction !== null && !is_object_empty(entry.getters)) {
    threw = true;
    error = new parse_errors.SyntaxError(dummyParser, compile_ILLEGAL_AWAIT_IN_NON_ASYNC_FUNCTION);
    error.column = firstAwaitOutsideFunction.column;
    error.inModule = inModule;
    error.line = firstAwaitOutsideFunction.line;
  }

  if (!threw && !entry.running) {
    entry.running = true;

    try {
      result = runResult.next().value;
    } catch (e) {
      threw = true;
      error = e;
    }

    entry.running = false;
  }

  if (!threw) {
    if (isESM || isWASM) {
      Reflect.defineProperty(mod, "loaded", {
        configurable: true,
        enumerable: true,
        get: to_external_function(function () {
          return false;
        }),
        set: to_external_function(function (value) {
          if (value) {
            set_property(this, "loaded", value);
            entry.updateBindings();
            entry.loaded();
          }
        })
      });
    }

    entry.state = parsing ? compile_STATE_PARSING_COMPLETED : STATE_EXECUTION_COMPLETED;
    return result;
  }

  entry.state = STATE_INITIAL;

  if (src_loader.state.package.default.options.debug || !is_stack_trace_maskable(error)) {
    to_external_error(error);
    throw error;
  }

  var message = to_string(util_get(error, "message"));
  var name = util_get(error, "name");

  if (isESM && (name === "SyntaxError" || name === "ReferenceError" && exportsRegExp.test(message))) {
    pkg.cache.dirty = true;
  }

  var loc = get_location_from_stack_trace(error);

  if (loc !== null) {
    filename = loc.filename;
  }

  mask_stack_trace(error, {
    filename,
    inModule
  });
  throw error;
}

function useAsync(entry) {
  "use strict";

  return entry.package.options.await && src_shared.support.await && entry.extname !== ".mjs";
}

function useSourceMap(entry) {
  "use strict";

  var sourceMap = entry.package.options.sourceMap;
  return sourceMap !== false && (sourceMap || DEVELOPMENT || compile_ELECTRON_RENDERER || NDB || compile_FLAGS.inspect) && get_source_mapping_url(entry.compileData.code) === "";
}

function jsonEvaluate(entry, parsed) {
  "use strict";

  entry.exports = parsed;
  entry.module.exports = parsed;
  var getters = entry.getters;

  var _loop = function (name) {
    entry.addGetter(name, function () {
      return entry.exports[name];
    });
  };

  for (var name in getters) {
    _loop(name);
  }

  entry.addGetter("default", function () {
    return entry.exports;
  });
}

function jsonParse(entry, filename, fallback) {
  "use strict";

  var mod = entry.module;
  var exported = mod.exports;
  var state = entry.state;
  var useFallback = false;

  if (typeof fallback === "function") {
    var parentEntry = src_entry.get(entry.parent);
    useFallback = parentEntry !== null && parentEntry.package.options.cjs.extensions && parentEntry.extname !== ".mjs";
  }

  var content = useFallback ? null : strip_bom(read_file(filename, "utf8"));
  var error;
  var parsed;
  var threw = true;

  try {
    if (useFallback) {
      fallback();
      parsed = mod.exports;
    } else {
      parsed = safe_json.parse(content);
    }

    threw = false;
  } catch (e) {
    error = e;

    if (!useFallback) {
      error.message = filename + ": " + error.message;
    }
  }

  if (useFallback) {
    entry.state = state;
    set_property(mod, "exports", exported);
  }

  if (threw) {
    throw error;
  }

  var names = util_keys(parsed);

  for (var _i2 = 0, _length2 = names == null ? 0 : names.length; _i2 < _length2; _i2++) {
    var name = names[_i2];

    if (is_identifier_name(name)) {
      entry.addGetter(name, function () {
        return compile_ERROR_GETTER;
      });
    }
  }

  entry.addGetter("default", function () {
    return compile_ERROR_GETTER;
  });
  return parsed;
}

function wasmEvaluate(entry, wasmMod, importObject) {
  "use strict";

  entry.resumeChildren();
  var children = entry.children;

  for (var request in importObject) {
    var name = importObject[request];
    importObject[request] = children[name].module.exports;
  }

  var exported = entry.module.exports;
  var getters = entry.getters;
  var wasmInstance = new WebAssembly.Instance(wasmMod, importObject);
  var wasmExported = util_assign(generic_object.create(), wasmInstance.exports);
  entry.exports = wasmExported;

  var _loop2 = function (_name) {
    var getter = function () {
      return entry.exports[_name];
    };

    if (has(getters, _name)) {
      entry.addGetter(_name, getter);
    }

    Reflect.defineProperty(exported, _name, {
      configurable: true,
      enumerable: true,
      get: to_external_function(getter),
      set: to_external_function(function (value) {
        set_property(this, _name, value);
      })
    });
  };

  for (var _name in wasmExported) {
    _loop2(_name);
  }
}

function wasmParse(entry, filename, importObject) {
  "use strict";

  var wasmMod = new WebAssembly.Module(read_file(filename));
  var exportDescriptions = WebAssembly.Module.exports(wasmMod);
  var importDescriptions = WebAssembly.Module.imports(wasmMod);

  for (var _i3 = 0, _length3 = exportDescriptions == null ? 0 : exportDescriptions.length; _i3 < _length3; _i3++) {
    var name = exportDescriptions[_i3].name;

    if (is_identifier_name(name)) {
      entry.addGetter(name, function () {
        return compile_ERROR_GETTER;
      });
    }
  }

  var _loop3 = function (request, _name2) {
    esm_import(request, entry, [[_name2, [_name2], function (value, childEntry) {
      importObject[request] = childEntry.name;
    }]]);
  };

  for (var _i4 = 0, _length4 = importDescriptions == null ? 0 : importDescriptions.length; _i4 < _length4; _i4++) {
    var _importDescriptions$_ = importDescriptions[_i4],
        request = _importDescriptions$_.module,
        _name2 = _importDescriptions$_.name;

    _loop3(request, _name2);
  }

  return wasmMod;
}

/* harmony default export */ var internal_compile = (compile_compile);
// CONCATENATED MODULE: ./src/real/crypto.js



/* harmony default export */ var real_crypto = (src_shared.inited ? src_shared.module.realCrypto : src_shared.module.realCrypto = unwrap_proxy(real_require("crypto")));
// CONCATENATED MODULE: ./src/safe/crypto.js





function crypto_init() {
  "use strict";

  var safeCrypto = util_safe(real_crypto);
  set_property(safeCrypto, "Hash", util_safe(safeCrypto.Hash));
  return safeCrypto;
}

var crypto_safeCrypto = src_shared.inited ? src_shared.module.safeCrypto : src_shared.module.safeCrypto = crypto_init();
var Hash = crypto_safeCrypto.Hash,
    timingSafeEqual = crypto_safeCrypto.timingSafeEqual;

/* harmony default export */ var safe_crypto = (crypto_safeCrypto);
// CONCATENATED MODULE: ./src/util/md5.js



function md5_init() {
  "use strict";

  function md5(string) {
    var hash = new Hash("md5");

    if (typeof string === "string") {
      hash.update(string);
    }

    return hash.digest("hex");
  }

  return md5;
}

/* harmony default export */ var util_md5 = (src_shared.inited ? src_shared.module.utilMD5 : src_shared.module.utilMD5 = md5_init());
// CONCATENATED MODULE: ./src/util/get-cache-name.js





function get_cache_name_init() {
  "use strict";

  var PACKAGE_VERSION = esm.PACKAGE_VERSION;
  var EMPTY_MD5_HASH = "d41d8cd98f00b204e9800998ecf8427e";

  function getCacheName(cacheKey, options = {}) {
    var cachePath = options.cachePath,
        filename = options.filename;
    var pathHash = EMPTY_MD5_HASH;

    if (typeof cachePath === "string" && typeof filename === "string") {
      // While MD5 isn't suitable for verification of untrusted data,
      // it's great for revving files. See Sufian Rhazi's post for more details.
      // https://blog.risingstack.com/automatic-cache-busting-for-your-css/
      pathHash = util_md5(path_relative(cachePath, filename));
    }

    var stateHash = util_md5(PACKAGE_VERSION + "\0" + JSON.stringify(options.packageOptions) + "\0" + cacheKey);
    return pathHash.slice(0, 8) + stateHash.slice(0, 8) + ".js";
  }

  return getCacheName;
}

/* harmony default export */ var get_cache_name = (src_shared.inited ? src_shared.module.utilGetCacheName : src_shared.module.utilGetCacheName = get_cache_name_init());
// CONCATENATED MODULE: ./src/module/static/wrap.js
// Based on `Module.wrap()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js



var wrap_wrap = mask_function(function (script) {
  "use strict";

  return src_module.wrapper[0] + script + src_module.wrapper[1];
}, real_module.wrap);
/* harmony default export */ var static_wrap = (wrap_wrap);
// CONCATENATED MODULE: ./src/module/static/wrapper.js
// Based on `Module.wrapper`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js

var wrapper_wrapper = generic_array.of("(function (exports, require, module, __filename, __dirname) { ", "\n});");
/* harmony default export */ var static_wrapper = (wrapper_wrapper);
// CONCATENATED MODULE: ./src/module/proto/compile.js
// Based on `Module#_compile()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js




























var compile_STATE_INITIAL = constant_entry.STATE_INITIAL,
    proto_compile_STATE_PARSING_COMPLETED = constant_entry.STATE_PARSING_COMPLETED,
    proto_compile_TYPE_ESM = constant_entry.TYPE_ESM;
var compile_ELECTRON = constant_env.ELECTRON;
var compile_PACKAGE_RANGE = esm.PACKAGE_RANGE;
var MODE_STRICT = constant_package.MODE_STRICT;
var compileFunctionParams = ["exports", "require", "module", "__filename", "__dirname"];
var RealProto = real_module.prototype;
var contentPackage;
var resolvedArgv;
var useBufferArg;
var useLegacyWrapper;
var useRunInContext;
var proto_compile_compile = mask_function(function (content, filename) {
  "use strict";

  validate_string(content, "content");
  validate_string(filename, "filename");
  var entry = src_entry.get(this);
  var state = entry.state;
  var isInitial = state === compile_STATE_INITIAL;

  if (entry.package.options.mode !== MODE_STRICT && entry.extname !== ".mjs" && (isInitial || state === proto_compile_STATE_PARSING_COMPLETED)) {
    if (contentPackage === void 0) {
      var defaultOptions = src_loader.state.package.default.options;
      var cjsOptions = util_assign({}, defaultOptions.cjs);
      var options = util_assign({}, defaultOptions);
      options.cache = false;
      options.cjs = cjsOptions;
      contentPackage = new src_package("", compile_PACKAGE_RANGE, options);
    }

    entry.initialize();
    entry.cacheName = get_cache_name(content);
    entry.package = contentPackage;
    entry.runtimeName = src_shared.runtimeName;

    var _result;

    try {
      _result = internal_compile(proto_compile_compile, entry, content, filename);
    } finally {
      if (isInitial) {
        entry.state = compile_STATE_INITIAL;
      }
    }

    return _result;
  }

  if (useLegacyWrapper === void 0) {
    useLegacyWrapper = compile_ELECTRON || !src_shared.support.vmCompileFunction;

    if (!useLegacyWrapper) {
      var proxy = new own_proxy(static_wrapper, {
        defineProperty(staticWrapper, name, descriptor) {
          useLegacyWrapper = true; // Use `Object.defineProperty()` instead of `Reflect.defineProperty()`
          // to throw the appropriate error if something goes wrong.
          // https://tc39.github.io/ecma262/#sec-definepropertyorthrow

          safe_object.defineProperty(staticWrapper, name, descriptor);
          return true;
        },

        set(staticWrapper, name, value, receiver) {
          useLegacyWrapper = true;

          if (receiver === proxy) {
            receiver = staticWrapper;
          }

          return Reflect.set(staticWrapper, name, value, receiver);
        }

      });
      Reflect.defineProperty(src_module, "wrap", {
        configurable: true,
        enumerable: true,
        get: to_external_function(function () {
          return static_wrap;
        }),
        set: to_external_function(function (value) {
          useLegacyWrapper = true;
          set_property(this, "wrap", value);
        })
      });
      Reflect.defineProperty(src_module, "wrapper", {
        configurable: true,
        enumerable: true,
        get: to_external_function(function () {
          return proxy;
        }),
        set: to_external_function(function (value) {
          useLegacyWrapper = true;
          set_property(this, "wrapper", value);
        })
      });
    }
  }

  var compileData = entry.compileData;
  var cachedData;

  if (compileData !== null) {
    var scriptData = compileData.scriptData;

    if (scriptData !== null) {
      cachedData = scriptData;
    }
  }

  var preparedContent = strip_shebang(content);

  if (src_loader.state.module.breakFirstLine) {
    if (resolvedArgv === void 0) {
      // Lazily resolve `process.argv[1]` which is needed for setting the
      // breakpoint when Node is called with the --inspect-brk flag.
      var argv = process.argv[1]; // Enter the REPL if no file path argument is provided.

      resolvedArgv = argv ? src_module._resolveFilename(argv) : "repl";
    } // Set breakpoint on module start.


    if (filename === resolvedArgv) {
      src_loader.state.module.breakFirstLine = false; // Remove legacy breakpoint indicator.

      Reflect.deleteProperty(process, "_breakFirstLine");

      if (get_source_mapping_url(preparedContent) === "") {
        preparedContent += create_inline_source_map(filename, preparedContent);
      }

      preparedContent = "debugger;" + preparedContent;
    }
  }

  var exported = this.exports;
  var unsafeGlobal = src_shared.unsafeGlobal;
  var args = [exported, make_require_function(this), this, filename, dirname(filename)];

  if (compile_ELECTRON) {
    args.push(process, unsafeGlobal);

    if (useBufferArg === void 0) {
      var wrap = src_module.wrap;
      useBufferArg = typeof wrap === "function" && String(wrap("")).indexOf("Buffer") !== -1;
    }

    if (useBufferArg) {
      args.push(src_shared.external.Buffer);
    }
  }

  if (useRunInContext === void 0) {
    useRunInContext = unsafeGlobal !== src_shared.defaultGlobal;

    if (useRunInContext) {
      useLegacyWrapper = true;
    }
  }

  var isESM = entry.type === proto_compile_TYPE_ESM;
  var compiledWrapper;
  var script;

  if (isESM || useLegacyWrapper) {
    preparedContent = isESM ? static_wrap(preparedContent) : src_module.wrap(preparedContent);
    script = new real_vm.Script(preparedContent, {
      cachedData,
      filename,
      produceCachedData: !src_shared.support.createCachedData
    });
    compiledWrapper = useRunInContext ? script.runInContext(src_shared.unsafeContext, {
      filename
    }) : script.runInThisContext({
      filename
    });
  } else {
    script = real_vm.compileFunction(preparedContent, compileFunctionParams, {
      cachedData,
      filename,
      produceCachedData: true
    });
    compiledWrapper = script;
  }

  var cachePath = entry.package.cachePath;

  if (cachePath !== "") {
    var pendingScripts = src_shared.pendingScripts;
    var scripts = pendingScripts.get(cachePath);

    if (scripts === void 0) {
      scripts = new Map();
      pendingScripts.set(cachePath, scripts);
    }

    scripts.set(entry.cacheName, script);
  }

  var moduleState = src_shared.moduleState;
  var noDepth = moduleState.requireDepth === 0;

  if (noDepth) {
    moduleState.statFast = new Map();
    moduleState.statSync = new Map();
  }

  var result = Reflect.apply(compiledWrapper, exported, args);

  if (noDepth) {
    moduleState.statFast = null;
    moduleState.statSync = null;
  }

  return result;
}, RealProto._compile);
/* harmony default export */ var proto_compile = (proto_compile_compile);
// CONCATENATED MODULE: ./src/module/cjs/loader.js



function cjs_loader_loader(entry, filename) {
  "use strict";

  entry.updateFilename(filename);
  var foundExt = find_compiler_extension(src_module._extensions, entry);

  if (foundExt === "") {
    foundExt = ".js";
  }

  var mod = entry.module;
  mod.paths = src_module._nodeModulePaths(entry.dirname);

  src_module._extensions[foundExt](mod, filename);

  if (!mod.loaded) {
    mod.loaded = true;
    entry.loaded();
  }
}

/* harmony default export */ var cjs_loader = (cjs_loader_loader);
// CONCATENATED MODULE: ./src/module/proto/load.js
// Based on `Module#load()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js








var load_RealProto = real_module.prototype;
var proto_load_load = mask_function(function (filename) {
  "use strict";

  validate_string(filename, "filename");

  if (this.loaded) {
    throw new src_shared.external.Error("Module already loaded: " + this.id);
  }

  var entry = src_entry.get(this);
  var _entry = entry,
      id = _entry.id;
  var scratchCache = src_loader.state.module.scratchCache; // Reassociate entries from the parse phase for modules created
  // via `new Module()`.

  if (has(scratchCache, id)) {
    var otherEntry = src_entry.get(scratchCache[id]);

    if (entry !== otherEntry) {
      otherEntry.exports = this.exports;
      otherEntry.module = this;
      otherEntry.runtime = null;
      entry = otherEntry;
      src_entry.set(this, otherEntry);
      Reflect.deleteProperty(scratchCache, id);
    }
  }

  cjs_loader(entry, filename);
}, load_RealProto.load);
/* harmony default export */ var proto_load = (proto_load_load);
// CONCATENATED MODULE: ./src/module/proto/require.js
// Based on `Module#require()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js









var ERR_INVALID_ARG_VALUE = src_errors.ERR_INVALID_ARG_VALUE;
var require_RealProto = real_module.prototype;
var require_req = mask_function(function (request) {
  "use strict";

  validate_string(request, "request");

  if (request === "") {
    throw new ERR_INVALID_ARG_VALUE("request", request, "must be a non-empty string");
  }

  var moduleState = src_shared.moduleState;
  moduleState.requireDepth += 1;

  try {
    var parentEntry = is_ext_mjs(this.filename) ? src_entry.get(this) : null;

    if (parentEntry !== null && parentEntry._passthruRequire) {
      parentEntry._passthruRequire = false;
      return esm_load(request, this).module.exports;
    }

    return src_module._load(request, this);
  } finally {
    moduleState.requireDepth -= 1;
  }
}, require_RealProto.require);
/* harmony default export */ var proto_require = (require_req);
// CONCATENATED MODULE: ./src/util/safe-default-properties.js






function safe_default_properties_init() {
  "use strict";

  function safeDefaultProperties(object) {
    var length = arguments.length;
    var i = 0;

    while (++i < length) {
      var source = arguments[i];
      var names = own_keys(source);

      for (var _i = 0, _length = names == null ? 0 : names.length; _i < _length; _i++) {
        var name = names[_i];

        if (has(source, name) && (!has(object, name) || util_get(object, name) === void 0)) {
          safe_copy_property(object, source, name);
        }
      }
    }

    return object;
  }

  return safeDefaultProperties;
}

/* harmony default export */ var safe_default_properties = (src_shared.inited ? src_shared.module.utilSafeDefaultProperties : src_shared.module.utilSafeDefaultProperties = safe_default_properties_init());
// CONCATENATED MODULE: ./src/module/static/create-require-from-path.js
// Based on `Module.createRequireFromPath()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js






var createRequireFromPath = mask_function(function (filename) {
  "use strict";

  validate_string(filename, "filename");
  var parent = new src_module(filename);
  parent.filename = filename;
  parent.paths = src_module._nodeModulePaths(dirname(filename));
  return make_require_function(parent);
}, real_module.createRequireFromPath);
/* harmony default export */ var create_require_from_path = (createRequireFromPath);
// CONCATENATED MODULE: ./src/module/static/find-path.js
// Based on `Module._findPath()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js




var find_path_findPath = mask_function(function (request, paths, isMain) {
  "use strict";

  validate_string(request, "request");

  if (!Array.isArray(paths)) {
    paths = [];
  }

  var result = find_path(request, paths, isMain);

  return result === "" ? false : result;
}, real_module._findPath);
/* harmony default export */ var static_find_path = (find_path_findPath);
// CONCATENATED MODULE: ./src/util/safe-get-env.js





function safe_get_env_init() {
  "use strict";

  var useSafeGetEnv;

  function safeGetEnv(name) {
    if (useSafeGetEnv === void 0) {
      useSafeGetEnv = typeof src_binding.util.safeGetenv === "function";
    }

    if (useSafeGetEnv) {
      try {
        return src_binding.util.safeGetenv(to_string(name));
      } catch (_unused) {}
    }

    return get_env(name);
  }

  return safeGetEnv;
}

/* harmony default export */ var safe_get_env = (src_shared.inited ? src_shared.module.utilSafeGetEnv : src_shared.module.utilSafeGetEnv = safe_get_env_init());
// CONCATENATED MODULE: ./src/module/internal/init-global-paths.js
// Based on `Module._initPaths()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js






function init_global_paths_init() {
  "use strict";

  function initGlobalPaths() {
    var isWin = process.platform === "win32";
    var homeDir;
    var nodePath;

    if (isWin) {
      homeDir = get_env("USERPROFILE");
      nodePath = get_env("HOME");
    } else {
      // Use `safeGetEnv()` to ensure nothing is returned when the setuid bit is set,
      // i.e. when Node is ran with privileges other than the user executing it.
      // https://github.com/nodejs/node/pull/18511
      homeDir = safe_get_env("HOME");
      nodePath = safe_get_env("NODE_PATH");
    }

    var paths;

    if (homeDir && typeof homeDir === "string") {
      paths = [path_resolve(homeDir, ".node_modules"), path_resolve(homeDir, ".node_libraries")];
    } else {
      paths = [];
    } // The executable path, `$PREFIX\node.exe` on Windows or `$PREFIX/lib/node`
    // everywhere else, where `$PREFIX` is the root of the Node.js installation.


    var prefixDir = path_resolve(process.execPath, "..", isWin ? "" : "..");
    paths.push(path_resolve(prefixDir, "lib", "node"));

    if (nodePath && typeof nodePath === "string") {
      var nodePaths = nodePath.split(delimiter);
      var oldPaths = paths;
      paths = [];

      for (var _i = 0, _length = nodePaths == null ? 0 : nodePaths.length; _i < _length; _i++) {
        var thePath = nodePaths[_i];

        if (typeof thePath === "string" && thePath !== "") {
          paths.push(thePath);
        }
      }

      paths.push(...oldPaths);
    }

    return paths;
  }

  return initGlobalPaths;
}

/* harmony default export */ var init_global_paths = (src_shared.inited ? src_shared.module.moduleInternalInitGlobalPaths : src_shared.module.moduleInternalInitGlobalPaths = init_global_paths_init());
// CONCATENATED MODULE: ./src/module/static/init-paths.js
// Based on `Module._initPaths()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js






var initPaths = mask_function(function () {
  "use strict";

  var globalPaths = init_global_paths();
  src_loader.state.module.globalPaths = globalPaths;
  src_module.globalPaths = generic_array.from(globalPaths);
}, real_module._initPaths);
/* harmony default export */ var init_paths = (initPaths);
// CONCATENATED MODULE: ./src/module/static/load.js
// Based on `Module._load()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js













var load_TYPE_ESM = constant_entry.TYPE_ESM;
var load_MODE_STRICT = constant_package.MODE_STRICT;
var ERR_REQUIRE_ESM = src_errors.ERR_REQUIRE_ESM;
var static_load_load = mask_function(function (request, parent, isMain = false) {
  validate_string(request, "request");
  var parsing = src_shared.moduleState.parsing;
  var parentEntry = src_entry.get(parent);

  if (parentEntry !== null && parentEntry._passthruRequire) {
    parentEntry._passthruRequire = false;
    return esm_load(request, parent, isMain).module.exports;
  }

  var parentIsStrict = parentEntry !== null && parentEntry.package.options.mode === load_MODE_STRICT;

  var filename = src_module._resolveFilename(request, parent, isMain);

  var scratchCache = src_loader.state.module.scratchCache;
  var cache = src_module._cache;

  if (parsing) {
    cache = scratchCache;
  } else if (has(scratchCache, filename)) {
    cache[filename] = scratchCache[filename];
    Reflect.deleteProperty(scratchCache, filename);
  }

  var loaderCalled = false;

  var entry = internal_load(filename, parent, isMain, cache, function (entry) {
    "use strict";

    loaderCalled = true;
    cache[filename] = entry.module;

    if (parentIsStrict || entry.extname === ".mjs") {
      entry._passthruCompile = true;
    }

    load_tryLoader(entry, cache, filename, filename);
  });

  if (!loaderCalled && parentIsStrict && entry.type === load_TYPE_ESM) {
    throw new ERR_REQUIRE_ESM(filename);
  }

  if (parentEntry !== null) {
    parentEntry._lastChild = entry;
  }

  return entry.module.exports;
}, real_module._load);

function load_tryLoader(entry, cache, cacheKey, filename) {
  "use strict";

  var mod = entry.module;
  var threw = true;

  try {
    mod.load(filename);
    threw = false;
  } finally {
    entry._passthruCompile = false;

    if (threw) {
      Reflect.deleteProperty(cache, cacheKey);
    }
  }
}

/* harmony default export */ var static_load = (static_load_load);
// CONCATENATED MODULE: ./src/module/static/preload-modules.js
// Based on `Module._preloadModules()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js









var preloadModules = mask_function(function (requests) {
  "use strict";

  if (!Array.isArray(requests) || requests.length === 0) {
    return;
  }

  var parent = new src_module("internal/preload", null);

  try {
    parent.paths = src_module._nodeModulePaths(cwd());
  } catch (e) {
    if (!is_error(e) || e.code !== "ENOENT") {
      preload_modules_maybeMaskStackTrace(e);
      throw e;
    }
  }

  try {
    for (var _i = 0, _length = requests == null ? 0 : requests.length; _i < _length; _i++) {
      var request = requests[_i];

      parent.require(request);
    }
  } catch (e) {
    preload_modules_maybeMaskStackTrace(e);
    throw e;
  }
}, real_module._preloadModules);

function preload_modules_maybeMaskStackTrace(error) {
  "use strict";

  if (!src_loader.state.package.default.options.debug && is_stack_trace_maskable(error)) {
    mask_stack_trace(error);
  } else {
    to_external_error(error);
  }
}

/* harmony default export */ var preload_modules = (preloadModules);
// CONCATENATED MODULE: ./src/module/static/resolve-lookup-paths.js
// Based on `Module._resolveLookupPaths()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js






var resolve_lookup_paths_resolveLookupPaths = mask_function(function (request, parent, newReturn = false) {
  validate_string(request, "request");

  if (builtin_lookup.has(request)) {
    return newReturn ? null : generic_array.of(request, generic_array.of());
  }

  var paths = resolve_lookup_paths(request, parent);

  return newReturn ? paths : generic_array.of(request, paths);
}, real_module._resolveLookupPaths);
/* harmony default export */ var static_resolve_lookup_paths = (resolve_lookup_paths_resolveLookupPaths);
// CONCATENATED MODULE: ./src/module/static/resolve-filename.js
// Based on `Module._resolveFilename()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js




















var static_resolve_filename_TYPE_CJS = constant_entry.TYPE_CJS,
    static_resolve_filename_TYPE_PSEUDO = constant_entry.TYPE_PSEUDO;
var static_resolve_filename_ELECTRON = constant_env.ELECTRON;
var resolve_filename_MODULE_NOT_FOUND = src_errors.MODULE_NOT_FOUND;
var resolve_filename_resolveFilename = mask_function(function (request, parent, isMain = false, options) {
  validate_string(request, "request"); // Electron and Muon patch `Module._resolveFilename()`.
  // https://github.com/electron/electron/blob/master/lib/common/reset-search-paths.js
  // https://github.com/brave/muon/blob/master/lib/common/reset-search-paths.js

  if (static_resolve_filename_ELECTRON && bundled_lookup.has(request)) {
    return safe_module._resolveFilename(request, parent, isMain, options);
  }

  if (builtin_lookup.has(request)) {
    return request;
  }

  var isAbs = is_absolute(request);
  var parentEntry = src_entry.get(parent);

  if (parentEntry !== null) {
    parentEntry.updateFilename();
  }

  var fromPath;

  if (isAbs) {
    fromPath = dirname(request);
  } else {
    fromPath = parentEntry === null ? "" : parentEntry.dirname;
  }

  var cache;
  var cacheKey;

  if (!is_object(options)) {
    cache = src_shared.memoize.moduleStaticResolveFilename;
    cacheKey = request + "\0" + fromPath + "\0" + (isMain ? "1" : "");
    var cached = cache.get(cacheKey);

    if (cached !== void 0) {
      return cached;
    }
  }

  var isRel = !isAbs && is_relative(request);
  var isPath = isAbs || isRel;
  var paths;

  if (isPath && src_module._findPath === static_find_path && src_module._resolveLookupPaths === static_resolve_lookup_paths) {
    paths = [fromPath];
  } else if (cache === void 0 && Array.isArray(options.paths)) {
    paths = resolve_filename_resolveLookupPathsFrom(request, options.paths);
  } else {
    paths = src_module._resolveLookupPaths(request, parent, true);
  }

  var foundPath = src_module._findPath(request, paths, isMain);

  if (foundPath === false) {
    foundPath = "";
  }

  if (foundPath !== "") {
    if (cache !== void 0) {
      cache.set(cacheKey, foundPath);
    }

    return foundPath;
  }

  var error = new resolve_filename_MODULE_NOT_FOUND(request, parent);

  if (!src_loader.state.package.default.options.debug) {
    var maskOptions = {
      filename: null,
      inModule: false
    };

    if (parentEntry !== null) {
      var parentType = parentEntry.type;
      maskOptions.filename = parentEntry.filename;
      maskOptions.inModule = (!parentEntry.package.options.cjs.paths || parentEntry.extname === ".mjs") && parentType !== static_resolve_filename_TYPE_CJS && parentType !== static_resolve_filename_TYPE_PSEUDO;
    }

    mask_stack_trace(error, maskOptions);
  }

  throw error;
}, real_module._resolveFilename);

function resolve_filename_resolveLookupPathsFrom(request, fromPaths) {
  "use strict";

  var fakeParent = new src_module("");
  var paths = [];

  for (var _i = 0, _length = fromPaths == null ? 0 : fromPaths.length; _i < _length; _i++) {
    var fromPath = fromPaths[_i];
    fakeParent.paths = src_module._nodeModulePaths(fromPath);

    var lookupPaths = src_module._resolveLookupPaths(request, fakeParent, true);

    for (var _i2 = 0, _length2 = lookupPaths == null ? 0 : lookupPaths.length; _i2 < _length2; _i2++) {
      var lookupPath = lookupPaths[_i2];

      if (paths.indexOf(lookupPath) === -1) {
        paths.push(lookupPath);
      }
    }
  }

  return paths;
}

/* harmony default export */ var static_resolve_filename = (resolve_filename_resolveFilename);
// CONCATENATED MODULE: ./src/module.js



























var module_ELECTRON = constant_env.ELECTRON;
var Module = mask_function(function (id = "", parent) {
  this.children = generic_array.of();
  this.exports = generic_object.create();
  this.filename = null;
  this.id = id;
  this.loaded = false;
  this.parent = parent;
  this.paths = void 0;
  this.path = get_module_dirname(this);
  var children = parent == null ? null : parent.children;

  if (Array.isArray(children)) {
    generic_array.push(children, this);
  }
}, real_module);
Module._cache = require.cache;
Module._extensions = {
  __proto__: null
};
Module._findPath = static_find_path;
Module._initPaths = init_paths;
Module._load = static_load;
Module._nodeModulePaths = node_module_paths;
Module._preloadModules = preload_modules;
Module._resolveFilename = static_resolve_filename;
Module._resolveLookupPaths = static_resolve_lookup_paths;
Module.Module = Module;
Module.builtinModules = Object.freeze(generic_array.from(builtin_ids));
Module.createRequireFromPath = create_require_from_path;
Module.wrap = static_wrap; // Initialize `Module._extensions` with only the enumerable string keyed
// properties of `RealModule._extensions` to avoid `shared.symbol.wrapper`
// and other meta properties.

util_assign(Module._extensions, real_module._extensions);
safe_default_properties(Module, real_module);

if (!is_object_like(Module._cache)) {
  Module._cache = {
    __proto__: null
  };
}

if (Module._cache !== real_module._cache) {
  // Ensure `.node` files are cached in the real `Module._cache`
  // when `require.cache` is different than `Module._cache`.
  Module._cache = new own_proxy(Module._cache, {
    defineProperty(cache, name, descriptor) {
      var _cache = real_module._cache;

      if (is_ext_node(name) && is_object_like(_cache)) {
        Reflect.defineProperty(_cache, name, descriptor);
      } // Use `Object.defineProperty()` instead of `Reflect.defineProperty()`
      // to throw the appropriate error if something goes wrong.
      // https://tc39.github.io/ecma262/#sec-definepropertyorthrow


      safe_object.defineProperty(cache, name, descriptor);
      return true;
    },

    deleteProperty(cache, name) {
      var _cache = real_module._cache;

      if (is_ext_node(name) && is_object_like(_cache)) {
        Reflect.deleteProperty(_cache, name);
      }

      return Reflect.deleteProperty(cache, name);
    },

    set(cache, name, value, receiver) {
      var _cache = real_module._cache;

      if (is_ext_node(name) && is_object_like(_cache)) {
        Reflect.set(_cache, name, value);
      }

      return Reflect.set(cache, name, value, receiver);
    }

  });
}

if (!module_ELECTRON || !Array.isArray(safe_module.wrapper)) {
  Module.wrapper = static_wrapper;
}

var ModuleProto = Module.prototype;
ModuleProto._compile = proto_compile;
ModuleProto.constructor = Module;
ModuleProto.load = proto_load;
ModuleProto.require = proto_require;

if (!Array.isArray(Module.globalPaths)) {
  Module._initPaths();
}

/* harmony default export */ var src_module = (Module);
// CONCATENATED MODULE: ./src/module/esm/extensions.js





var extensions_extensions = {
  __proto__: null
};

extensions_extensions[".js"] = function (mod, filename) {
  "use strict";

  mod._compile(strip_bom(readFileSync(filename, "utf8")), filename);
};

extensions_extensions[".json"] = function (mod, filename) {
  "use strict";

  var content = readFileSync(filename, "utf8");
  var exported;

  try {
    exported = safe_json.parse(content);
  } catch (e) {
    e.message = filename + ": " + e.message;
    throw e;
  }

  mod.exports = exported;
};

extensions_extensions[".node"] = function (mod, filename) {
  "use strict";

  return dlopen(mod, to_namespaced_path(filename));
};

/* harmony default export */ var esm_extensions = (extensions_extensions);
// CONCATENATED MODULE: ./src/loader.js








var loader_FLAGS = constant_env.FLAGS;

class loader_Loader {
  // TODO: Remove this eslint comment when the false positive is resolved.
  // eslint-disable-next-line no-undef
  static init(cacheKey) {
    var loader = src_shared.loader;
    var cached = loader.get(cacheKey);

    if (cached === void 0) {
      cached = {
        module: {
          breakFirstLine: loader_FLAGS.inspectBrk && !loader_FLAGS.eval,
          extensions: esm_extensions,
          globalPaths: Array.from(src_module.globalPaths),
          mainModule: process.mainModule,
          moduleCache: {
            __proto__: null
          },
          scratchCache: {
            __proto__: null
          }
        },
        package: {
          cache: new Map(),
          default: null
        }
      };
      loader.set(cacheKey, cached);
    }

    return loader_Loader.state = cached;
  }

}

loader_Loader.state = null;
set_deferred(loader_Loader, "state", function () {
  return loader_Loader.init(JSON.stringify(src_package.createOptions()));
});
set_prototype_of(loader_Loader.prototype, null);
/* harmony default export */ var src_loader = (loader_Loader);
// CONCATENATED MODULE: ./src/module/esm/parse-load.js




var parse_load_STATE_PARSING_COMPLETED = constant_entry.STATE_PARSING_COMPLETED,
    parse_load_TYPE_CJS = constant_entry.TYPE_CJS;

function parseLoad(request, parent, isMain) {
  "use strict";

  var moduleState = src_shared.moduleState;
  moduleState.parsing = true;
  moduleState.requireDepth += 1;
  var entry;

  try {
    entry = esm_load(request, parent, isMain);
  } finally {
    moduleState.parsing = false;
    moduleState.requireDepth -= 1;
  }

  try {
    entry.updateBindings();

    if (entry.state === parse_load_STATE_PARSING_COMPLETED) {
      if (entry.type !== parse_load_TYPE_CJS) {
        validate_deep(entry);
      }

      entry = esm_load(request, parent, isMain);
    }
  } finally {
    moduleState.requireDepth -= 1;
  }

  return entry;
}

/* harmony default export */ var parse_load = (parseLoad);
// CONCATENATED MODULE: ./src/util/is-cache-name.js




function is_cache_name_init() {
  "use strict";

  var DIGIT_0 = char_code.DIGIT_0,
      DIGIT_9 = char_code.DIGIT_9,
      LOWERCASE_A = char_code.LOWERCASE_A,
      LOWERCASE_Z = char_code.LOWERCASE_Z;

  function isCacheName(value) {
    if (typeof value !== "string" || value.length !== 19 || !is_ext_js(value)) {
      return false;
    }

    var i = -1;

    while (++i < 16) {
      var code = value.charCodeAt(i);

      if (!(code >= LOWERCASE_A && code <= LOWERCASE_Z || code >= DIGIT_0 && code <= DIGIT_9)) {
        return false;
      }
    }

    return true;
  }

  return isCacheName;
}

/* harmony default export */ var is_cache_name = (src_shared.inited ? src_shared.module.utilIsCacheName : src_shared.module.utilIsCacheName = is_cache_name_init());
// CONCATENATED MODULE: ./src/path/is-ext-json.js



function is_ext_json_init() {
  "use strict";

  var DOT = char_code.DOT,
      LOWERCASE_J = char_code.LOWERCASE_J,
      LOWERCASE_N = char_code.LOWERCASE_N,
      LOWERCASE_O = char_code.LOWERCASE_O,
      LOWERCASE_S = char_code.LOWERCASE_S;

  function isExtJSON(filename) {
    if (typeof filename !== "string") {
      return false;
    }

    var length = filename.length;
    return length > 5 && filename.charCodeAt(length - 4) === LOWERCASE_J && filename.charCodeAt(length - 5) === DOT && filename.charCodeAt(length - 3) === LOWERCASE_S && filename.charCodeAt(length - 2) === LOWERCASE_O && filename.charCodeAt(length - 1) === LOWERCASE_N;
  }

  return isExtJSON;
}

/* harmony default export */ var is_ext_json = (src_shared.inited ? src_shared.module.pathIsExtJSON : src_shared.module.pathIsExtJSON = is_ext_json_init());
// CONCATENATED MODULE: ./src/util/is-file.js



function is_file_init() {
  "use strict";

  function isFile(thePath) {
    return stat_fast(thePath) === 0;
  }

  return isFile;
}

/* harmony default export */ var is_file = (src_shared.inited ? src_shared.module.utilIsFile : src_shared.module.utilIsFile = is_file_init());
// CONCATENATED MODULE: ./src/fs/read-json.js




function read_json_init() {
  "use strict";

  function readJSON(filename) {
    var content = read_file(filename, "utf8");
    return content === null ? null : parse_json(content);
  }

  return readJSON;
}

/* harmony default export */ var read_json = (src_shared.inited ? src_shared.module.fsReadJSON : src_shared.module.fsReadJSON = read_json_init());
// CONCATENATED MODULE: ./src/fs/read-json6.js




function read_json6_init() {
  "use strict";

  function readJSON6(filename) {
    var content = read_file(filename, "utf8");
    return content === null ? null : parse_json6(content);
  }

  return readJSON6;
}

/* harmony default export */ var read_json6 = (src_shared.inited ? src_shared.module.fsReadJSON6 : src_shared.module.fsReadJSON6 = read_json6_init());
// CONCATENATED MODULE: ./src/fs/readdir.js



function readdir_init() {
  "use strict";

  function readdir(dirPath) {
    if (typeof dirPath === "string") {
      try {
        return readdirSync(dirPath);
      } catch (_unused) {}
    }

    return null;
  }

  return readdir;
}

/* harmony default export */ var fs_readdir = (src_shared.inited ? src_shared.module.fsReaddir : src_shared.module.fsReaddir = readdir_init());
// EXTERNAL MODULE: ./node_modules/semver/index.js
var semver = __webpack_require__("./node_modules/semver/index.js");

// CONCATENATED MODULE: ./src/package.js

































var package_APOSTROPHE = char_code.APOSTROPHE,
    package_DOT = char_code.DOT;
var OPTIONS = constant_env.OPTIONS;
var package_PACKAGE_RANGE = esm.PACKAGE_RANGE,
    package_PACKAGE_VERSION = esm.PACKAGE_VERSION;
var package_MODE_ALL = constant_package.MODE_ALL,
    package_MODE_AUTO = constant_package.MODE_AUTO,
    package_MODE_STRICT = constant_package.MODE_STRICT,
    RANGE_ALL = constant_package.RANGE_ALL;
var ERR_INVALID_ESM_OPTION = src_errors.ERR_INVALID_ESM_OPTION,
    ERR_UNKNOWN_ESM_OPTION = src_errors.ERR_UNKNOWN_ESM_OPTION;
var ESMRC_FILENAME = ".esmrc";
var PACKAGE_JSON_FILENAME = "package.json";
var esmrcExts = [".mjs", ".cjs", ".js", ".json"];
var package_defaultOptions = {
  await: false,
  cache: true,
  cjs: {
    cache: false,
    dedefault: false,
    esModule: false,
    extensions: false,
    mutableNamespace: false,
    namedExports: false,
    paths: false,
    topLevelReturn: false,
    vars: false
  },
  debug: false,
  force: false,
  mainFields: ["main"],
  mode: package_MODE_STRICT,
  sourceMap: void 0,
  wasm: false
};
var zeroConfigOptions = {
  cjs: {
    cache: true,
    dedefault: false,
    esModule: true,
    extensions: true,
    mutableNamespace: true,
    namedExports: true,
    paths: true,
    topLevelReturn: false,
    vars: true
  },
  mode: package_MODE_AUTO
};

class package_Package {
  // TODO: Remove this eslint comment when the false positive is resolved.
  // eslint-disable-next-line no-undef
  constructor(dirPath, range, options) {
    options = package_Package.createOptions(options);
    var cachePath = "";

    if (typeof options.cache === "string") {
      cachePath = path_resolve(dirPath, options.cache);
    } else if (options.cache !== false) {
      cachePath = dirPath + sep + "node_modules" + sep + ".cache" + sep + "esm";
    }

    var dir = src_shared.package.dir;

    if (!dir.has(cachePath)) {
      var cache = {
        buffer: null,
        compile: null,
        meta: null
      };
      var buffer = null;
      var compileDatas = new Map();
      var metas = null;

      if (cachePath !== "") {
        var cacheNames = fs_readdir(cachePath);
        var hasBuffer = false;
        var hasDirtyMarker = false;
        var hasMetas = false;

        for (var _i = 0, _length = cacheNames == null ? 0 : cacheNames.length; _i < _length; _i++) {
          var cacheName = cacheNames[_i];

          if (is_cache_name(cacheName)) {
            // Later, we'll change the cached value to its associated compiler result,
            // but for now we merely register that a cache file exists.
            compileDatas.set(cacheName, null);
          } else if (cacheName.charCodeAt(0) === package_DOT) {
            if (cacheName === ".data.blob") {
              hasBuffer = true;
            } else if (cacheName === ".data.json") {
              hasMetas = true;
            } else if (cacheName === ".dirty") {
              hasDirtyMarker = true;
              break;
            }
          }
        }

        var isCacheInvalid = hasDirtyMarker;
        var json = null;

        if (hasMetas && !isCacheInvalid) {
          json = read_json(cachePath + sep + ".data.json");
          isCacheInvalid = json === null || !has(json, "version") || json.version !== package_PACKAGE_VERSION || !has(json, "meta") || !is_object(json.meta);
        }

        if (isCacheInvalid) {
          hasBuffer = false;
          hasMetas = false;
          compileDatas = new Map();

          if (hasDirtyMarker) {
            remove_file(cachePath + sep + ".dirty");
          }

          clearBabelCache(cachePath);
        }

        if (hasBuffer) {
          buffer = read_file(cachePath + sep + ".data.blob");
        }

        if (hasMetas) {
          var jsonMeta = json.meta;

          var _cacheNames = util_keys(jsonMeta);

          metas = new Map();

          for (var _i2 = 0, _length2 = _cacheNames == null ? 0 : _cacheNames.length; _i2 < _length2; _i2++) {
            var _cacheName = _cacheNames[_i2];
            metas.set(_cacheName, jsonMeta[_cacheName]);
          }
        }
      }

      if (buffer === null) {
        buffer = generic_buffer.alloc(0);
      }

      if (metas === null) {
        metas = new Map();
      }

      cache.buffer = buffer;
      cache.compile = compileDatas;
      cache.meta = metas;
      dir.set(cachePath, cache);
    }

    this.cache = dir.get(cachePath);
    this.cachePath = cachePath;
    this.dirPath = dirPath;
    this.options = options;
    this.range = range;
  }

  clone() {
    var options = this.options;
    var cjsOptions = options.cjs;
    var cloned = util_assign({
      __proto__: package_Package.prototype
    }, this);
    var clonedOptions = util_assign({}, options);
    clonedOptions.cjs = util_assign({}, cjsOptions);
    cloned.options = clonedOptions;
    return cloned;
  }

  static get(dirPath, forceOptions) {
    if (dirPath === ".") {
      dirPath = cwd();
    }

    var pkgState = src_loader.state.package;
    var cache = pkgState.cache;

    if (dirPath === "" && !cache.has("")) {
      // Set `topLevelReturn` to `true` so that the "Illegal return statement"
      // syntax error will occur within the REPL.
      cache.set("", new package_Package("", package_PACKAGE_RANGE, {
        cache: false,
        cjs: {
          topLevelReturn: true
        }
      }));
    }

    var result = getInfo(dirPath, {
      __proto__: null,
      forceOptions,
      type: void 0
    });
    return result === null ? pkgState.default : result;
  }

  static from(request, forceOptions) {
    var dirPath = ".";

    if (typeof request === "string") {
      dirPath = builtin_lookup.has(request) ? "" : dirname(request);
    } else {
      dirPath = get_module_dirname(request);
    }

    return package_Package.get(dirPath, forceOptions);
  }

  static set(dirPath, pkg) {
    src_loader.state.package.cache.set(dirPath, pkg);
  }

}

package_Package.createOptions = package_createOptions;
package_Package.defaultOptions = package_defaultOptions;
package_Package.state = null;

function clearBabelCache(cachePath) {
  "use strict";

  var babelCachePath = path_resolve(cachePath, "../@babel/register");
  var cacheNames = fs_readdir(babelCachePath);

  for (var _i3 = 0, _length3 = cacheNames == null ? 0 : cacheNames.length; _i3 < _length3; _i3++) {
    var cacheName = cacheNames[_i3];

    if (is_ext_json(cacheName)) {
      remove_file(babelCachePath + sep + cacheName);
    }
  }
}

function package_createOptions(value) {
  "use strict";

  var defaultOptions = package_Package.defaultOptions;
  var names = [];
  var options = {};

  if (typeof value === "string") {
    names.push("mode");
    options.mode = value;
  } else {
    var possibleNames = util_keys(value);

    for (var _i4 = 0, _length4 = possibleNames == null ? 0 : possibleNames.length; _i4 < _length4; _i4++) {
      var name = possibleNames[_i4];

      if (has(defaultOptions, name)) {
        names.push(name);
        options[name] = value[name];
      } else if (name === "sourcemap" && possibleNames.indexOf("sourceMap") === -1) {
        options.sourceMap = value.sourcemap;
      } else {
        throw new ERR_UNKNOWN_ESM_OPTION(name);
      }
    }
  }

  if (names.indexOf("cjs") === -1) {
    options.cjs = zeroConfigOptions.cjs;
  }

  if (names.indexOf("mode") === -1) {
    options.mode = zeroConfigOptions.mode;
  }

  var cjsOptions = createOptionsCJS(options.cjs);
  util_defaults(options, defaultOptions);
  options.cjs = cjsOptions;
  var awaitOption = options.await;

  if (isFlag(awaitOption)) {
    options.await = !!awaitOption;
  } else {
    throw new ERR_INVALID_ESM_OPTION("await", awaitOption);
  }

  var cache = options.cache;

  if (isFlag(cache)) {
    options.cache = !!cache;
  } else if (typeof cache !== "string") {
    throw new ERR_INVALID_ESM_OPTION("cache", cache);
  }

  var debug = options.debug;

  if (isFlag(debug)) {
    options.debug = !!debug;
  } else {
    throw new ERR_INVALID_ESM_OPTION("debug", debug);
  }

  var force = options.force;

  if (isFlag(force)) {
    options.force = !!force;
  } else {
    throw new ERR_INVALID_ESM_OPTION("force", cache);
  }

  var defaultMainFields = defaultOptions.mainFields;
  var mainFields = options.mainFields;

  if (!Array.isArray(mainFields)) {
    mainFields = [mainFields];
  }

  if (mainFields === defaultMainFields) {
    mainFields = [defaultMainFields[0]];
  } else {
    mainFields = Array.from(mainFields, function (field) {
      if (typeof field !== "string") {
        throw new ERR_INVALID_ESM_OPTION("mainFields", mainFields);
      }

      return field;
    });
  }

  if (mainFields.indexOf("main") === -1) {
    mainFields.push("main");
  }

  options.mainFields = mainFields;
  var mode = options.mode;

  if (mode === package_MODE_ALL || mode === "all") {
    options.mode = package_MODE_ALL;
  } else if (mode === package_MODE_AUTO || mode === "auto") {
    options.mode = package_MODE_AUTO;
  } else if (mode === package_MODE_STRICT || mode === "strict") {
    options.mode = package_MODE_STRICT;
  } else {
    throw new ERR_INVALID_ESM_OPTION("mode", mode);
  }

  var sourceMap = options.sourceMap;

  if (isFlag(sourceMap)) {
    options.sourceMap = !!sourceMap;
  } else if (sourceMap !== void 0) {
    throw new ERR_INVALID_ESM_OPTION("sourceMap", sourceMap);
  }

  var wasmOption = options.wasm;

  if (isFlag(wasmOption)) {
    options.wasm = !!wasmOption;
  } else {
    throw new ERR_INVALID_ESM_OPTION("wasm", wasmOption);
  }

  return options;
}

function createOptionsCJS(value) {
  "use strict";

  var defaultCJS = package_Package.defaultOptions.cjs;
  var options = {};

  if (value === void 0) {
    return util_assign(options, defaultCJS);
  }

  if (!is_object(value)) {
    var _names = util_keys(defaultCJS);

    var optionsValue = !!value;

    for (var _i5 = 0, _length5 = _names == null ? 0 : _names.length; _i5 < _length5; _i5++) {
      var name = _names[_i5];
      options[name] = isExplicitName(name) ? false : optionsValue;
    }

    return options;
  }

  var names = [];
  var possibleNames = util_keys(value);

  for (var _i6 = 0, _length6 = possibleNames == null ? 0 : possibleNames.length; _i6 < _length6; _i6++) {
    var _name = possibleNames[_i6];

    if (has(defaultCJS, _name)) {
      names.push(_name);
      options[_name] = value[_name];
    } else if (_name === "interop" && possibleNames.indexOf("esModule") === -1) {
      options.esModule = value.interop;
    } else {
      throw new ERR_UNKNOWN_ESM_OPTION("cjs[" + to_string_literal(_name, package_APOSTROPHE) + "]");
    }
  }

  var useZeroConfig = true;

  for (var _i7 = 0, _length7 = names == null ? 0 : names.length; _i7 < _length7; _i7++) {
    var _name2 = names[_i7];
    var _optionsValue = options[_name2];

    if (isFlag(_optionsValue)) {
      var flagValue = !!_optionsValue;

      if (flagValue && !isExplicitName(_name2)) {
        useZeroConfig = false;
      }

      options[_name2] = flagValue;
    } else {
      throw new ERR_INVALID_ESM_OPTION("cjs[" + to_string_literal(_name2, package_APOSTROPHE) + "]", _optionsValue, true);
    }
  }

  var defaultSource = useZeroConfig ? zeroConfigOptions.cjs : defaultCJS;
  return util_defaults(options, defaultSource);
}

function findRoot(dirPath) {
  "use strict";

  if (path_basename(dirPath) === "node_modules" || is_file(dirPath + sep + PACKAGE_JSON_FILENAME)) {
    return dirPath;
  }

  var parentPath = dirname(dirPath);

  if (parentPath === dirPath) {
    return "";
  }

  return path_basename(parentPath) === "node_modules" ? dirPath : findRoot(parentPath);
}

function getInfo(dirPath, state) {
  "use strict";

  var pkgState = src_loader.state.package;
  var cache = pkgState.cache;
  var defaultPkg = pkgState.default;
  var pkg = null;

  if (cache.has(dirPath)) {
    pkg = cache.get(dirPath);

    if (pkg !== null || state.forceOptions === void 0) {
      return pkg;
    }
  }

  if (path_basename(dirPath) === "node_modules") {
    cache.set(dirPath, null);
    return null;
  }

  if (defaultPkg && defaultPkg.options.force) {
    // Clone the default package to avoid the parsing phase fallback path
    // of module/internal/compile.
    pkg = defaultPkg.clone();
  } else {
    pkg = readInfo(dirPath, state);
  }

  if (pkg === null) {
    var parentPath = dirname(dirPath);

    if (parentPath !== dirPath) {
      pkg = getInfo(parentPath, state);
    }
  }

  cache.set(dirPath, pkg);
  return pkg;
}

function getRange(json, name) {
  "use strict";

  if (has(json, name)) {
    var object = json[name];

    if (has(object, "esm")) {
      return Object(semver["validRange"])(object.esm);
    }
  }

  return null;
}

function getRoot(dirPath) {
  "use strict";

  var root = src_shared.package.root;
  var cached = root.get(dirPath);

  if (cached === void 0) {
    cached = findRoot(dirPath) || dirPath;
    root.set(dirPath, cached);
  }

  return cached;
}

function isExplicitName(name) {
  "use strict";

  return name === "dedefault" || name === "topLevelReturn";
}

function isFlag(value) {
  "use strict";

  return typeof value === "boolean" || value === 0 || value === 1;
}

function readInfo(dirPath, state) {
  "use strict";

  var pkg;
  var optionsPath = dirPath + sep + ESMRC_FILENAME;
  var options = is_file(optionsPath) ? read_file(optionsPath, "utf8") : null;
  var optionsFound = options !== null;

  if (optionsFound) {
    options = parse_json6(options);
  } else {
    optionsPath = find_path(optionsPath, empty_array, false, esmrcExts);
  }

  var forceOptions = state.forceOptions;
  state.forceOptions = void 0;

  if (optionsPath !== "" && !optionsFound) {
    optionsFound = true;

    if (is_ext_json(optionsPath)) {
      options = read_json6(optionsPath);
    } else {
      var cache = src_loader.state.package.cache;
      var moduleState = src_shared.moduleState;
      var parsing = moduleState.parsing;
      pkg = new package_Package(dirPath, RANGE_ALL, {
        cache: package_Package.createOptions(forceOptions).cache
      });
      moduleState.parsing = false;
      cache.set(dirPath, pkg);

      try {
        pkg.options = package_Package.createOptions(parse_load(optionsPath, null).module.exports);
      } finally {
        cache.set(dirPath, null);
        moduleState.parsing = parsing;
      }
    }
  }

  var pkgPath = dirPath + sep + PACKAGE_JSON_FILENAME;
  var pkgJSON = is_file(pkgPath) ? read_file(pkgPath, "utf8") : null;
  var parentPkg;

  if (forceOptions === void 0 && pkgJSON === null) {
    if (optionsFound) {
      parentPkg = getInfo(dirname(dirPath), state);
    } else {
      return null;
    }
  }

  var pkgParsed = 0;

  if (pkgJSON !== null && !optionsFound) {
    pkgJSON = parse_json(pkgJSON);
    pkgParsed = pkgJSON === null ? -1 : 1;

    if (pkgParsed === 1 && !optionsFound && has(pkgJSON, "esm")) {
      optionsFound = true;
      options = pkgJSON.esm;
    }
  }

  var range = null;

  if (forceOptions !== void 0) {
    range = RANGE_ALL;
  } else if (parentPkg) {
    range = parentPkg.range;
  } else {
    if (pkgParsed === 0 && pkgJSON !== null) {
      pkgJSON = parse_json(pkgJSON);
      pkgParsed = pkgJSON === null ? -1 : 1;
    } // A package.json may have `esm` in its "devDependencies" object because
    // it expects another package or application to enable ESM loading in
    // production, but needs `esm` during development.


    if (pkgParsed === 1) {
      range = getRange(pkgJSON, "dependencies") || getRange(pkgJSON, "peerDependencies");
    }

    if (range === null) {
      if (optionsFound || getRange(pkgJSON, "devDependencies")) {
        range = RANGE_ALL;
      } else {
        return null;
      }
    }
  }

  if (pkg !== void 0) {
    pkg.range = range;
    return pkg;
  }

  if (forceOptions !== void 0 && !optionsFound) {
    optionsFound = true;
    options = forceOptions;
  }

  if (options === true || !optionsFound) {
    optionsFound = true;
    options = OPTIONS;
  }

  if (pkgParsed !== 1 && pkgJSON === null) {
    dirPath = getRoot(dirPath);
  }

  return new package_Package(dirPath, range, options);
}

set_prototype_of(package_Package.prototype, null);
/* harmony default export */ var src_package = (package_Package);
// CONCATENATED MODULE: ./src/util/get-cache-state-hash.js


function get_cache_state_hash_init() {
  "use strict";

  function getCacheStateHash(cacheName) {
    // Slice out the file extension, which is 3 characters long, to get the
    // last remaining 8 characters.
    return typeof cacheName === "string" ? cacheName.slice(-11, -3) : "";
  }

  return getCacheStateHash;
}

/* harmony default export */ var get_cache_state_hash = (src_shared.inited ? src_shared.module.utilGetCacheStateHash : src_shared.module.utilGetCacheStateHash = get_cache_state_hash_init());
// CONCATENATED MODULE: ./src/generic/date.js



function date_init() {
  "use strict";

  return {
    getTime: unapply(Date.prototype.getTime)
  };
}

/* harmony default export */ var date = (src_shared.inited ? src_shared.module.GenericDate : src_shared.module.GenericDate = date_init());
// CONCATENATED MODULE: ./src/fs/get-stat-timestamp.js




function get_stat_timestamp_init() {
  "use strict";

  function getStatTimestamp(stat, type) {
    if (!is_object(stat)) {
      return -1;
    }

    var milliseconds = stat[type + "Ms"]; // Add 0.5 to avoid rounding down.
    // https://github.com/nodejs/node/pull/12607

    return typeof milliseconds === "number" ? Math.round(milliseconds + 0.5) : date.getTime(stat[type]);
  }

  return getStatTimestamp;
}

/* harmony default export */ var get_stat_timestamp = (src_shared.inited ? src_shared.module.fsGetStatTimestamp : src_shared.module.fsGetStatTimestamp = get_stat_timestamp_init());
// CONCATENATED MODULE: ./src/util/is-called-from-strict-code.js






function is_called_from_strict_code_init() {
  "use sloppy";

  function isCalledFromStrictCode() {
    var frames = get_stack_frames(construct_error(Error, empty_array));

    for (var _i = 0, _length = frames == null ? 0 : frames.length; _i < _length; _i++) {
      var frame = frames[_i];
      var filename = frame.getFileName();

      if (filename && !is_own_path(filename) && !frame.isNative()) {
        return frame.getFunction() === void 0;
      }
    }

    return false;
  }

  return isCalledFromStrictCode;
}

/* harmony default export */ var is_called_from_strict_code = (src_shared.inited ? src_shared.module.utilIsCalledFromStrictCode : src_shared.module.utilIsCalledFromStrictCode = is_called_from_strict_code_init());
// CONCATENATED MODULE: ./src/util/is-descriptor-match.js



function is_descriptor_match_init() {
  "use strict";

  function isDescriptorMatch(currentDescriptor, newDescriptor) {
    if (!is_object(currentDescriptor)) {
      return !is_object(newDescriptor);
    }

    for (var name in newDescriptor) {
      if (!Object.is(currentDescriptor[name], newDescriptor[name])) {
        return false;
      }
    }

    return true;
  }

  return isDescriptorMatch;
}

/* harmony default export */ var is_descriptor_match = (src_shared.inited ? src_shared.module.utilIsDescriptorMatch : src_shared.module.utilIsDescriptorMatch = is_descriptor_match_init());
// CONCATENATED MODULE: ./src/util/is-enumerable.js


function is_enumerable_init() {
  "use strict";

  var propertyIsEnumerable = Object.prototype.propertyIsEnumerable;

  function isEnumerable(object, name) {
    return object != null && propertyIsEnumerable.call(object, name);
  }

  return isEnumerable;
}

/* harmony default export */ var is_enumerable = (src_shared.inited ? src_shared.module.utilIsEnumerable : src_shared.module.utilIsEnumerable = is_enumerable_init());
// CONCATENATED MODULE: ./src/shim/puppeteer-execution-context-prototype-evaluate-handle.js









function puppeteer_execution_context_prototype_evaluate_handle_init() {
  "use strict";

  var Shim = {
    enable(exported) {
      var cache = src_shared.memoize.shimPuppeteerExecutionContextPrototypeEvaluateHandle;

      if (check(exported, cache)) {
        return exported;
      }

      var ExecutionContextProto = exported.ExecutionContext.prototype;
      var evaluateHandleWrapper = proxy_wrap(ExecutionContextProto.evaluateHandle, function (evaluateHandle, args) {
        var pageFunction = args[0];

        if (typeof pageFunction === "function") {
          var pageFunctionProxy = new own_proxy(pageFunction, {
            get(pageFunction, name, receiver) {
              if (name === "toString" && !has(pageFunction, "toString")) {
                return toStringProxy;
              }

              if (receiver === pageFunctionProxy) {
                receiver = pageFunction;
              }

              return Reflect.get(pageFunction, name, receiver);
            }

          });
          var toStringProxy = new own_proxy(pageFunction.toString, {
            apply: native_trap(function (toString, thisArg, args) {
              if (thisArg === pageFunctionProxy) {
                thisArg = pageFunction;
              }

              var result = Reflect.apply(toString, thisArg, args);
              return typeof result === "string" ? untransform_runtime(result) : result;
            })
          });
          args[0] = pageFunctionProxy;
        }

        return Reflect.apply(evaluateHandle, this, args);
      });

      if (Reflect.defineProperty(ExecutionContextProto, "evaluateHandle", {
        configurable: true,
        value: evaluateHandleWrapper,
        writable: true
      })) {
        cache.set(ExecutionContextProto, true);
      }

      return exported;
    }

  };

  function check(exported, cache) {
    var ExecutionContext = is_object_like(exported) ? exported.ExecutionContext : void 0;
    var ExecutionContextProto = typeof ExecutionContext === "function" ? ExecutionContext.prototype : void 0;
    var evaluateHandle = is_object_like(ExecutionContextProto) ? ExecutionContextProto.evaluateHandle : void 0;

    if (typeof evaluateHandle !== "function") {
      return true;
    }

    var cached = cache.get(ExecutionContextProto);

    if (cached !== void 0) {
      return cached;
    }

    cached = is_own_proxy(evaluateHandle);
    cache.set(ExecutionContextProto, cached);
    return cached;
  }

  return Shim;
}

/* harmony default export */ var puppeteer_execution_context_prototype_evaluate_handle = (src_shared.inited ? src_shared.module.shimPuppeteerExecutionContextPrototypeEvaluateHandle : src_shared.module.shimPuppeteerExecutionContextPrototypeEvaluateHandle = puppeteer_execution_context_prototype_evaluate_handle_init());
// CONCATENATED MODULE: ./src/entry.js





































var UPPERCASE_E = char_code.UPPERCASE_E;
var entry_ERROR_GETTER = constant_entry.ERROR_GETTER,
    entry_ERROR_STAR = constant_entry.ERROR_STAR,
    GETTER_TYPE_DEFAULT = constant_entry.GETTER_TYPE_DEFAULT,
    entry_GETTER_TYPE_STAR_CONFLICT = constant_entry.GETTER_TYPE_STAR_CONFLICT,
    INITIAL_VALUE = constant_entry.INITIAL_VALUE,
    entry_LOAD_COMPLETED = constant_entry.LOAD_COMPLETED,
    LOAD_INCOMPLETE = constant_entry.LOAD_INCOMPLETE,
    LOAD_INDETERMINATE = constant_entry.LOAD_INDETERMINATE,
    NAMESPACE_FINALIZATION_COMPLETED = constant_entry.NAMESPACE_FINALIZATION_COMPLETED,
    NAMESPACE_FINALIZATION_INCOMPLETE = constant_entry.NAMESPACE_FINALIZATION_INCOMPLETE,
    SETTER_TYPE_DEFAULT = constant_entry.SETTER_TYPE_DEFAULT,
    entry_SETTER_TYPE_DYNAMIC_IMPORT = constant_entry.SETTER_TYPE_DYNAMIC_IMPORT,
    entry_SETTER_TYPE_EXPORT_FROM = constant_entry.SETTER_TYPE_EXPORT_FROM,
    entry_SETTER_TYPE_NAMESPACE = constant_entry.SETTER_TYPE_NAMESPACE,
    entry_STATE_INITIAL = constant_entry.STATE_INITIAL,
    entry_STATE_EXECUTION_COMPLETED = constant_entry.STATE_EXECUTION_COMPLETED,
    entry_STATE_EXECUTION_STARTED = constant_entry.STATE_EXECUTION_STARTED,
    entry_TYPE_CJS = constant_entry.TYPE_CJS,
    entry_TYPE_ESM = constant_entry.TYPE_ESM,
    entry_TYPE_JSON = constant_entry.TYPE_JSON,
    entry_TYPE_PSEUDO = constant_entry.TYPE_PSEUDO,
    entry_TYPE_WASM = constant_entry.TYPE_WASM,
    UPDATE_TYPE_DEFAULT = constant_entry.UPDATE_TYPE_DEFAULT,
    entry_UPDATE_TYPE_INIT = constant_entry.UPDATE_TYPE_INIT,
    entry_UPDATE_TYPE_LIVE = constant_entry.UPDATE_TYPE_LIVE;
var ERR_EXPORT_STAR_CONFLICT = src_errors.ERR_EXPORT_STAR_CONFLICT,
    ERR_NS_ASSIGNMENT = src_errors.ERR_NS_ASSIGNMENT,
    ERR_NS_DEFINITION = src_errors.ERR_NS_DEFINITION,
    ERR_NS_DELETION = src_errors.ERR_NS_DELETION,
    ERR_NS_EXTENSION = src_errors.ERR_NS_EXTENSION,
    ERR_NS_REDEFINITION = src_errors.ERR_NS_REDEFINITION,
    entry_ERR_UNDEFINED_IDENTIFIER = src_errors.ERR_UNDEFINED_IDENTIFIER;
var PUPPETEER_EXECUTION_CONTEXT_PATH_SEGMENT = sep + "lib" + sep + "ExecutionContext.js";
var PUPPETEER_PACKAGE_PATH_SEGMENT = sep + "puppeteer" + sep;
var PUPPETEER_UPPERCASE_E_CHAR_OFFSET = -19; // Detect packages installed via NPM that have an mtime of
// 1985-10-26T08:15Z

var A_LONG_TIME_AGO_MS = new Date("1985-10-27T00:00Z").getTime();
var pseudoDescriptor = {
  value: true
};

class entry_Entry {
  constructor(mod) {
    this.initialize(mod);
  }

  static get(mod) {
    if (!is_object(mod)) {
      return null;
    }

    var cache = src_shared.entry.cache;
    var entry = cache.get(mod);

    if (entry === void 0) {
      entry = new entry_Entry(mod);
    } else if (entry.type === entry_TYPE_CJS && entry._loaded === entry_LOAD_COMPLETED) {
      var bridged = src_shared.bridged;
      var exported = entry.module.exports;
      var foundEntry = bridged.get(exported);

      if (foundEntry !== void 0) {
        entry = foundEntry;
        bridged.delete(exported);
      }
    }

    if (entry !== void 0) {
      entry_Entry.set(mod, entry);
    }

    return entry;
  }

  static has(mod) {
    return src_shared.entry.cache.has(mod);
  }

  static set(mod, entry) {
    if (is_object(mod)) {
      src_shared.entry.cache.set(mod, entry);
    }
  }

  addGetter(name, getter) {
    if (!has(getter, "id")) {
      getter.id = name;
    }

    if (!has(getter, "owner")) {
      getter.owner = this;
    }

    if (!has(getter, "type")) {
      getter.type = GETTER_TYPE_DEFAULT;
    }

    var type = this.type;

    if (type !== entry_TYPE_CJS && type !== entry_TYPE_PSEUDO && name === "default") {
      var value = tryGetter(getter); // Give default exported anonymous functions the name "default".
      // https://tc39.github.io/ecma262/#sec-exports-runtime-semantics-evaluation

      if (typeof value === "function" && value.name === this.runtimeName + "anonymous") {
        Reflect.defineProperty(value, "name", {
          configurable: true,
          value: "default"
        });
      }
    }

    this.getters[name] = getter;
    return this;
  }

  addGetters(argsList) {
    for (var _i = 0, _length = argsList == null ? 0 : argsList.length; _i < _length; _i++) {
      var _argsList$_i = argsList[_i],
          name = _argsList$_i[0],
          getter = _argsList$_i[1];
      this.addGetter(name, getter);
    }

    return this;
  }

  addGetterFrom(otherEntry, importedName, exportedName = importedName) {
    var _this = this;

    if (importedName === "*") {
      return this.addGetter(exportedName, function () {
        return otherEntry.getExportByName("*", _this);
      });
    }

    var otherGetters = otherEntry.getters;
    var otherGetter = otherGetters[importedName];

    if (otherEntry.type !== entry_TYPE_ESM && this.extname === ".mjs") {
      otherGetter = function () {
        return otherEntry.partialNamespace[importedName];
      };

      otherGetter.owner = otherEntry;
    }

    if (otherGetter === void 0) {
      otherGetter = function () {
        return otherEntry.getters[importedName]();
      };

      otherGetter.deferred = true;
      otherGetter.id = importedName;
      otherGetter.owner = otherEntry;
    }

    return this.addGetter(exportedName, otherGetter);
  }

  addSetter(name, localNames, setter, parentEntry) {
    setter.last = INITIAL_VALUE;
    setter.localNames = localNames;
    setter.owner = parentEntry;

    if (!has(setter, "exportedName")) {
      setter.exportedName = null;
    }

    if (!has(setter, "type")) {
      setter.type = SETTER_TYPE_DEFAULT;
    }

    var settersMap = this.setters;

    if (!has(settersMap, name)) {
      settersMap[name] = [];
    }

    settersMap[name].push(setter);
    var importedBindings = parentEntry.importedBindings;

    for (var _i2 = 0, _length2 = localNames == null ? 0 : localNames.length; _i2 < _length2; _i2++) {
      var _name = localNames[_i2];

      if (!importedBindings.has(_name)) {
        importedBindings.set(_name, false);
      }
    }

    return this;
  }

  addSetters(argsList, parentEntry) {
    for (var _i3 = 0, _length3 = argsList == null ? 0 : argsList.length; _i3 < _length3; _i3++) {
      var _argsList$_i2 = argsList[_i3],
          name = _argsList$_i2[0],
          localNames = _argsList$_i2[1],
          setter = _argsList$_i2[2];
      this.addSetter(name, localNames, setter, parentEntry);
    }

    return this;
  }

  finalizeNamespace() {
    if (this._namespaceFinalized === NAMESPACE_FINALIZATION_COMPLETED) {
      return this;
    }

    this._namespaceFinalized = NAMESPACE_FINALIZATION_COMPLETED; // Table 29: Internal Slots of Module Namespace Exotic Objects
    // Properties should be assigned in `Array#sort()` order.
    // https://tc39.github.io/ecma262/#table-29

    var getters = this.getters;
    var names = util_keys(getters).sort();

    for (var _i4 = 0, _length4 = names == null ? 0 : names.length; _i4 < _length4; _i4++) {
      var name = names[_i4];

      if (getters[name].type !== entry_GETTER_TYPE_STAR_CONFLICT) {
        this._completeMutableNamespace[name] = INITIAL_VALUE;
        this._completeNamespace[name] = INITIAL_VALUE;
      }
    } // Section 9.4.6: Module Namespace Exotic Objects
    // Namespace objects should be sealed.
    // https://tc39.github.io/ecma262/#sec-module-namespace-exotic-objects


    Object.seal(this._completeNamespace);
    var type = this.type;

    if (type === entry_TYPE_ESM || type === entry_TYPE_WASM) {
      return this;
    }

    if (this.builtin) {
      var _names = ["default"];
      var possibleNames = util_keys(this.exports);

      for (var _i5 = 0, _length5 = possibleNames == null ? 0 : possibleNames.length; _i5 < _length5; _i5++) {
        var _name2 = possibleNames[_i5];

        if (is_identifier_name(_name2)) {
          _names.push(_name2);
        }
      }

      _names.sort();

      Reflect.deleteProperty(this._partialMutableNamespace, "default");
      Reflect.deleteProperty(this._partialNamespace, "default");

      for (var _i6 = 0, _length6 = _names == null ? 0 : _names.length; _i6 < _length6; _i6++) {
        var _name3 = _names[_i6];
        this._partialMutableNamespace[_name3] = INITIAL_VALUE;
        this._partialNamespace[_name3] = INITIAL_VALUE;
      }
    }

    Object.seal(this._partialNamespace);
    return this;
  }

  getExportByName(name, parentEntry) {
    var type = this.type;

    if (type === entry_TYPE_ESM || type === entry_TYPE_WASM) {
      return getExportByNameFast(this, name, parentEntry);
    }

    return getExportByName(this, name, parentEntry);
  }

  initialize(mod = this.module) {
    var _this2 = this;

    // The namespace object change indicator.
    this._changed = false; // The raw mutable namespace object for ESM importers.

    this._completeMutableNamespace = to_raw_module_namespace_object(); // The raw namespace object for ESM importers.

    this._completeNamespace = to_raw_module_namespace_object(); // The entry finalization handler.

    this._finalize = null; // The last child entry loaded.

    this._lastChild = null; // The loaded state of the module.

    this._loaded = LOAD_INCOMPLETE; // The finalized state of the namespace object.

    this._namespaceFinalized = NAMESPACE_FINALIZATION_INCOMPLETE; // The raw mutable namespace object for non-ESM importers.

    this._partialMutableNamespace = to_raw_module_namespace_object({
      default: INITIAL_VALUE
    }); // The raw namespace object for non-ESM importers.

    this._partialNamespace = to_raw_module_namespace_object({
      default: INITIAL_VALUE
    }); // The passthru indicator for `module._compile()`.

    this._passthruCompile = false; // The passthru indicator for `module.require()`.

    this._passthruRequire = false; // The runthru indicator for `module._compile()`.

    this._ranthruCompile = false; // The import validation cache.

    this._validation = new Map([["*", true]]); // The module basename.

    this.basename = null; // The builtin module indicator.

    this.builtin = false; // The child entries of the module.

    this.children = {
      __proto__: null
    }; // The circular import indicator.

    this.circular = false; // The module dirname.

    this.dirname = null; // The `module.exports` value at the time the module loaded.

    this.exports = mod.exports; // The module extname.

    this.extname = null; // The module filename.

    this.filename = null; // Getters for local variables exported by the module.

    this.getters = {
      __proto__: null
    }; // The unique id for the module cache.

    this.id = mod.id; // The initialized state of bindings imported by the module.

    this.importedBindings = new Map(); // The module the entry is managing.

    this.module = mod; // The name of the module.

    this.name = null; // The module parent.

    this.parent = mod.parent; // The paused state of the entry generator.

    this.running = false; // The runtime object reference.

    this.runtime = null; // Setters for assigning to local variables in parent modules.

    this.setters = {
      __proto__: null
    }; // Initialize empty namespace setter so they're merged properly.

    this.setters["*"] = []; // The state of the module.

    this.state = entry_STATE_INITIAL; // The entry type of the module.

    this.type = entry_TYPE_CJS; // The cache name of the module.

    set_deferred(this, "cacheName", function () {
      var pkg = _this2.package;
      return get_cache_name(_this2.mtime, {
        cachePath: pkg.cachePath,
        filename: _this2.filename,
        packageOptions: pkg.options
      });
    }); // The source compilation data of the module.

    set_deferred(this, "compileData", function () {
      var compileData = caching_compiler.from(_this2);

      if (compileData !== null && compileData.transforms !== 0) {
        var content = read_file(_this2.package.cachePath + sep + _this2.cacheName, "utf8");

        if (content !== null) {
          compileData.code = content;
        }
      }

      return compileData;
    }); // The mutable namespace object that ESM importers receive.

    set_deferred(this, "completeMutableNamespace", function () {
      return createMutableNamespaceProxy(_this2, _this2._completeMutableNamespace);
    }); // The namespace object that ESM importers receive.

    set_deferred(this, "completeNamespace", function () {
      return createImmutableNamespaceProxy(_this2, _this2._completeNamespace);
    }); // The mtime of the module.

    set_deferred(this, "mtime", function () {
      var filename = _this2.filename;

      if (is_path(filename)) {
        var stat = stat_sync(filename);

        if (stat !== null) {
          // If the mtime is long ago, use the ctime instead.
          var properTime = get_stat_timestamp(stat, "mtime");

          if (properTime < A_LONG_TIME_AGO_MS) {
            properTime = get_stat_timestamp(stat, "ctime");
          }

          return properTime;
        }
      }

      return -1;
    }); // The package data of the module.

    set_deferred(this, "package", function () {
      return src_package.from(_this2.module);
    }); // The mutable namespace object that non-ESM importers receive.

    set_deferred(this, "partialMutableNamespace", function () {
      return createMutableNamespaceProxy(_this2, _this2._partialMutableNamespace);
    }); // The namespace object that non-ESM importers receive.

    set_deferred(this, "partialNamespace", function () {
      return createImmutableNamespaceProxy(_this2, _this2._partialNamespace);
    }); // The name of the runtime identifier.

    set_deferred(this, "runtimeName", function () {
      return encode_id("_" + get_cache_state_hash(_this2.cacheName).slice(0, 3));
    });
    this.updateFilename(true);
  }

  loaded() {
    var _this3 = this;

    if (this._loaded !== LOAD_INCOMPLETE) {
      return this._loaded;
    }

    var mod = this.module;

    if (!mod.loaded) {
      return this._loaded = LOAD_INCOMPLETE;
    }

    this._loaded = LOAD_INDETERMINATE;
    var children = this.children;

    for (var name in children) {
      if (!children[name].module.loaded) {
        return this._loaded = LOAD_INCOMPLETE;
      }
    }

    var cjs = this.package.options.cjs;
    var exported = mod.exports;

    if (this.type === entry_TYPE_CJS) {
      if (cjs.esModule && exported != null && exported.__esModule) {
        this.type = entry_TYPE_PSEUDO;
      }

      var names = getExportsObjectKeys(this, exported);

      var _loop = function (_name4) {
        _this3.addGetter(_name4, function () {
          return _this3.exports[_name4];
        });
      };

      for (var _i7 = 0, _length7 = names == null ? 0 : names.length; _i7 < _length7; _i7++) {
        var _name4 = names[_i7];

        _loop(_name4);
      }

      if (this.type === entry_TYPE_CJS) {
        var filename = this.filename;

        if (typeof filename === "string" && filename.charCodeAt(filename.length + PUPPETEER_UPPERCASE_E_CHAR_OFFSET) === UPPERCASE_E && filename.endsWith(PUPPETEER_EXECUTION_CONTEXT_PATH_SEGMENT) && filename.indexOf(PUPPETEER_PACKAGE_PATH_SEGMENT) !== -1) {
          puppeteer_execution_context_prototype_evaluate_handle.enable(exported);
        }

        this.addGetter("default", function () {
          return _this3.exports;
        });
        exported = proxy_exports(this);
      }

      this.exports = exported;
    } else if (this.type === entry_TYPE_JSON) {
      exported = proxy_exports(this);
      mod.exports = exported;
      this.exports = exported;
    } else {
      if (this.extname === ".mjs") {
        mod.exports = createImmutableExportsProxy(this, exported);
      } else {
        var _names2 = getExportsObjectKeys(this);

        if (cjs.dedefault && _names2.length === 1 && _names2[0] === "default") {
          mod.exports = exported.default;
        } else {
          if (cjs.esModule && !has(this.getters, "__esModule")) {
            Reflect.defineProperty(exported, "__esModule", pseudoDescriptor);
          }

          mod.exports = cjs.mutableNamespace ? createMutableExportsProxy(this, exported) : createImmutableExportsProxy(this, exported);
        }
      }
    }

    this.finalizeNamespace();
    return this._loaded = entry_LOAD_COMPLETED;
  }

  resumeChildren() {
    var children = this.children;

    for (var name in children) {
      var childEntry = children[name];

      if (childEntry.running) {
        continue;
      }

      var runtime = childEntry.runtime;
      var runResult = runtime === null ? void 0 : runtime.runResult;
      var threw = true;

      try {
        if (runResult !== void 0 && childEntry.state < entry_STATE_EXECUTION_STARTED) {
          childEntry.state = entry_STATE_EXECUTION_STARTED;
          childEntry.running = true;
          runResult.next();
          childEntry.module.loaded = true;
          childEntry.running = false;
        }

        if (typeof childEntry._finalize === "function") {
          childEntry._finalize();
        } else {
          childEntry.loaded();
          childEntry.updateBindings(null, entry_UPDATE_TYPE_INIT);
          validate_shallow(childEntry, this);
        }

        threw = false;
      } finally {
        childEntry.state = threw ? entry_STATE_INITIAL : entry_STATE_EXECUTION_COMPLETED;
      }
    }
  }

  updateBindings(names, updateType = UPDATE_TYPE_DEFAULT, seen) {
    var shouldUpdateParents = this.circular || updateType === entry_UPDATE_TYPE_LIVE || updateType === entry_UPDATE_TYPE_INIT;

    if (shouldUpdateParents && seen !== void 0 && seen.has(this)) {
      return this;
    }

    if (typeof names === "string") {
      names = [names];
    } // Lazily initialize set of parent entries whose setters might need to run.


    var parentEntries;
    this._changed = false;
    runGetters(this, names);
    runSetters(this, names, function (setter) {
      var parentEntry = setter.owner;
      var importedBindings = parentEntry.importedBindings;

      if (setter.last !== entry_ERROR_GETTER) {
        for (var _i8 = 0, _setter$localNames = setter.localNames, _length8 = _setter$localNames == null ? 0 : _setter$localNames.length; _i8 < _length8; _i8++) {
          var name = _setter$localNames[_i8];
          importedBindings.set(name, true);
        }
      }

      if (shouldUpdateParents) {
        if (parentEntries === void 0) {
          parentEntries = new Set();
        }

        parentEntries.add(parentEntry);
      }
    }, updateType);
    this._changed = false;

    if (parentEntries === void 0) {
      return this;
    }

    var parentUpdateType = updateType;

    if (parentUpdateType !== UPDATE_TYPE_DEFAULT) {
      parentUpdateType = entry_UPDATE_TYPE_LIVE;
    }

    if (seen === void 0) {
      seen = new Set();
    }

    seen.add(this); // If any of the setters updated the bindings of a parent module,
    // or updated local variables that are exported by that parent module,
    // then we must re-run any setters registered by that parent module.

    parentEntries.forEach(function (parentEntry) {
      parentEntry.loaded();
      parentEntry.updateBindings(null, parentUpdateType, seen);
    });
    return this;
  }

  updateFilename(filename, force) {
    var mod = this.module;

    if (typeof filename === "boolean") {
      force = filename;
      filename = void 0;
    }

    if (filename !== void 0) {
      mod.filename = filename;
    }

    if (!force && this.filename === mod.filename) {
      return this;
    }

    var modDirname = get_module_dirname(mod);
    var modFilename = mod.filename;
    this.dirname = modDirname;
    this.filename = modFilename;
    this.name = get_module_name(mod);

    if (modDirname === "") {
      this.basename = modFilename;
      this.extname = "";
    } else if (typeof modFilename !== "string") {
      this.basename = "";
      this.extname = "";
    } else {
      this.basename = modDirname === "." ? path_basename(modFilename) : modFilename.slice(modDirname.length + 1);
      this.extname = path_extname(modFilename);
    }

    return this;
  }

}

function assignCommonNamespaceHandlerTraps(handler, entry, proxy) {
  "use strict";

  handler.get = function (namespace, name, receiver) {
    var getters = entry.getters;
    var getter = getters[name];
    var hasGetter = getter !== void 0;
    var getterValue;
    var getterCalled = false;

    if (typeof name === "string" && has(namespace, name) && is_enumerable(namespace, name)) {
      var errored = entry._namespaceFinalized !== NAMESPACE_FINALIZATION_COMPLETED;

      if (!errored && hasGetter) {
        getterCalled = true;
        getterValue = getter();
        errored = getterValue === entry_ERROR_GETTER;
      }

      if (errored) {
        throw new entry_ERR_UNDEFINED_IDENTIFIER(name, handler.get);
      }
    }

    if (entry.type === entry_TYPE_PSEUDO && name === "default" && namespace === entry._partialNamespace) {
      // Treat like CJS within `.mjs` files.
      return entry.exports;
    }

    if (hasGetter) {
      return getterCalled ? getterValue : getter();
    }

    if (receiver === proxy) {
      receiver = namespace;
    }

    return Reflect.get(namespace, name, receiver);
  };

  handler.getOwnPropertyDescriptor = function (namespace, name) {
    var descriptor = Reflect.getOwnPropertyDescriptor(namespace, name);

    if (descriptor !== void 0) {
      descriptor.value = handler.get(namespace, name);
    }

    return descriptor;
  };

  handler.has = function (namespace, name) {
    return name === src_shared.symbol.namespace || Reflect.has(namespace, name);
  };

  handler.preventExtensions = function (namespace) {
    return entry._namespaceFinalized === NAMESPACE_FINALIZATION_COMPLETED && Reflect.preventExtensions(namespace);
  };
}

function assignImmutableNamespaceHandlerTraps(handler, entry) {
  "use sloppy";

  handler.defineProperty = function (namespace, name, descriptor) {
    if (entry._namespaceFinalized === NAMESPACE_FINALIZATION_COMPLETED && has(namespace, name) && is_descriptor_match(Reflect.getOwnPropertyDescriptor(namespace, name), descriptor)) {
      return Reflect.defineProperty(namespace, name, descriptor);
    }

    if (!is_called_from_strict_code()) {
      return false;
    }

    if (has(namespace, name)) {
      throw new ERR_NS_REDEFINITION(entry.module, name);
    } else {
      throw new ERR_NS_DEFINITION(entry.module, name);
    }
  };

  handler.deleteProperty = function (namespace, name) {
    if (Reflect.deleteProperty(namespace, name)) {
      return true;
    }

    if (!is_called_from_strict_code()) {
      return false;
    }

    throw new ERR_NS_DELETION(entry.module, name);
  };

  handler.set = function (namespace, name) {
    if (!is_called_from_strict_code()) {
      return false;
    }

    if (has(namespace, name)) {
      throw new ERR_NS_ASSIGNMENT(entry.module, name);
    }

    throw new ERR_NS_EXTENSION(entry.module, name);
  };
}

function assignMutableNamespaceHandlerTraps(handler, entry, proxy) {
  "use strict";

  handler.defineProperty = function (namespace, name, descriptor) {
    if (entry._namespaceFinalized !== NAMESPACE_FINALIZATION_COMPLETED) {
      return false;
    } // Use `Object.defineProperty()` instead of `Reflect.defineProperty()`
    // to throw the appropriate error if something goes wrong.
    // https://tc39.github.io/ecma262/#sec-definepropertyorthrow


    safe_object.defineProperty(entry.exports, name, descriptor);

    if (has(namespace, name)) {
      entry.addGetter(name, function () {
        return entry.exports[name];
      });
      entry.updateBindings(name);
    }

    return Reflect.isExtensible(namespace) || Reflect.defineProperty(namespace, name, descriptor);
  };

  handler.deleteProperty = function (namespace, name) {
    if (Reflect.deleteProperty(entry.exports, name)) {
      if (has(namespace, name)) {
        entry.addGetter(name, function () {
          return entry.exports[name];
        });
        entry.updateBindings(name);
      }

      return Reflect.isExtensible(namespace);
    }

    return false;
  };

  var oldGet = handler.get;

  if (typeof oldGet === "function") {
    handler.get = function (namespace, name, receiver) {
      var exported = entry.exports;
      var value = oldGet(namespace, name, receiver);

      if (has(exported, name)) {
        var newValue = Reflect.get(exported, name, receiver);
        var type = entry.type;

        if (newValue !== value && (type !== entry_TYPE_CJS && type !== entry_TYPE_JSON || name !== "default") && is_updatable_get(namespace, name)) {
          return newValue;
        }
      }

      return value;
    };
  }

  handler.getOwnPropertyDescriptor = function (namespace, name) {
    var descriptor = Reflect.getOwnPropertyDescriptor(namespace, name);

    if (descriptor === void 0 ? !Reflect.isExtensible(namespace) : !is_updatable_descriptor(descriptor)) {
      return descriptor;
    }

    var exported = entry.exports;

    if (has(exported, name)) {
      var exportedDescriptor = Reflect.getOwnPropertyDescriptor(exported, name);
      var value;

      if (has(exportedDescriptor, "value")) {
        value = exportedDescriptor.value;
      } else if (typeof exportedDescriptor.get === "function") {
        value = tryGetter(exportedDescriptor.get);

        if (value === entry_ERROR_GETTER) {
          return descriptor;
        }
      }

      if (descriptor === void 0) {
        // Section 9.5.5: [[GetOwnProperty]]()
        // Step 17: Throw a type error if the resulting descriptor is
        // non-configurable while the target descriptor is `undefined` or
        // configurable.
        // https://tc39.github.io/ecma262/#sec-proxy-object-internal-methods-and-internal-slots-getownproperty-p
        return {
          configurable: true,
          enumerable: exportedDescriptor.enumerable,
          value,
          writable: exportedDescriptor.writable === true || typeof exportedDescriptor.set === "function"
        };
      }

      descriptor.value = value;
    } else if (descriptor !== void 0) {
      descriptor.value = handler.get(namespace, name);
    }

    return descriptor;
  };

  handler.set = function (namespace, name, value, receiver) {
    if (!is_updatable_set(namespace, name)) {
      return false;
    }

    var exported = entry.exports;

    if (receiver === proxy) {
      receiver = exported;
    }

    if (Reflect.set(exported, name, value, receiver)) {
      if (has(namespace, name)) {
        entry.addGetter(name, function () {
          return entry.exports[name];
        });
        entry.updateBindings(name);
      }

      return true;
    }

    return false;
  };
}

function createImmutableExportsProxy(entry, exported) {
  "use strict";

  var handler = initNamespaceHandler();
  var proxy = new own_proxy(exported, handler);
  assignCommonNamespaceHandlerTraps(handler, entry, proxy);
  assignImmutableNamespaceHandlerTraps(handler, entry);
  Reflect.deleteProperty(handler, "has");

  for (var name in handler) {
    to_external_function(handler[name]);
  }

  Object.seal(exported);
  return proxy;
}

function createImmutableNamespaceProxy(entry, namespace) {
  "use strict";

  // Section 9.4.6: Module Namespace Exotic Objects
  // Namespace objects should be sealed.
  // https://tc39.github.io/ecma262/#sec-module-namespace-exotic-objects
  var handler = initNamespaceHandler();
  var proxy = new own_proxy(namespace, handler);
  assignCommonNamespaceHandlerTraps(handler, entry, proxy);
  assignImmutableNamespaceHandlerTraps(handler, entry);

  for (var name in handler) {
    to_external_function(handler[name]);
  }

  return proxy;
}

function createMutableExportsProxy(entry, exported) {
  "use strict";

  var handler = initNamespaceHandler();
  var proxy = new own_proxy(exported, handler);
  assignCommonNamespaceHandlerTraps(handler, entry, proxy);
  assignMutableNamespaceHandlerTraps(handler, entry, proxy);
  Reflect.deleteProperty(handler, "has");

  for (var name in handler) {
    to_external_function(handler[name]);
  }

  return proxy;
}

function createMutableNamespaceProxy(entry, namespace) {
  "use strict";

  var handler = initNamespaceHandler();
  var proxy = new own_proxy(namespace, handler);
  assignCommonNamespaceHandlerTraps(handler, entry, proxy);
  assignMutableNamespaceHandlerTraps(handler, entry, proxy);

  for (var name in handler) {
    to_external_function(handler[name]);
  }

  return proxy;
}

function getExportByName(entry, name, parentEntry) {
  "use strict";

  var parentIsMJS = parentEntry.extname === ".mjs";
  var type = entry.type;

  if (name !== "*") {
    if (entry._loaded !== entry_LOAD_COMPLETED) {
      return entry_ERROR_GETTER;
    }

    if (type === entry_TYPE_PSEUDO && parentIsMJS && name === "default") {
      return entry.exports;
    }

    var getter = entry.getters[name];
    return getter === void 0 ? entry_ERROR_GETTER : getter();
  }

  var parentCJS = parentEntry.package.options.cjs;
  var parentNamedExports = parentCJS.namedExports && !parentIsMJS;
  var parentMutableNamespace = parentCJS.mutableNamespace && !parentIsMJS;
  var useImmutableNamespace = !parentMutableNamespace || entry.extname === ".mjs";
  var usePartialNamespace = !parentNamedExports && type !== entry_TYPE_ESM;

  if (useImmutableNamespace) {
    return usePartialNamespace ? entry.partialNamespace : entry.completeNamespace;
  }

  return usePartialNamespace ? entry.partialMutableNamespace : entry.completeMutableNamespace;
}

function getExportByNameFast(entry, name, parentEntry) {
  "use strict";

  if (name !== "*") {
    var getter = entry.getters[name];
    return getter === void 0 ? entry_ERROR_GETTER : tryGetter(getter);
  }

  var parentMutableNamespace = parentEntry.package.options.cjs.mutableNamespace && parentEntry.extname !== ".mjs";
  var useImmutableNamespace = !parentMutableNamespace || entry.extname === ".mjs";
  return useImmutableNamespace ? entry.completeNamespace : entry.completeMutableNamespace;
}

function getExportsObjectKeys(entry, exported = entry.exports) {
  var type = entry.type;
  var possibleNames;

  if (type === entry_TYPE_CJS || type === entry_TYPE_PSEUDO) {
    var isFunc = typeof exported === "function";
    var ownNames = own_property_names(exported);
    var proto = get_prototype_of(exported);
    possibleNames = [];

    for (var _i9 = 0, _length9 = ownNames == null ? 0 : ownNames.length; _i9 < _length9; _i9++) {
      var name = ownNames[_i9];

      if (!is_enumerable(exported, name) && (name === "__esModule" || isFunc && name === "prototype" || has(proto, name) && !is_enumerable(proto, name))) {
        continue;
      }

      possibleNames.push(name);
    }
  } else {
    possibleNames = util_keys(exported);
  }

  var result = [];

  for (var _i10 = 0, _possibleNames = possibleNames, _length10 = _possibleNames == null ? 0 : _possibleNames.length; _i10 < _length10; _i10++) {
    var _name5 = _possibleNames[_i10];

    if (is_identifier_name(_name5)) {
      result.push(_name5);
    }
  }

  return result;
}

function initNamespaceHandler() {
  "use strict";

  return {
    defineProperty: null,
    deleteProperty: null,
    get: null,
    getOwnPropertyDescriptor: null,
    has: null,
    set: null
  };
}

function runGetter(entry, name) {
  "use strict";

  var getter = entry.getters[name];

  if (getter === void 0 || getter.type === entry_GETTER_TYPE_STAR_CONFLICT) {
    return;
  }

  var exported = entry.exports;
  var value = tryGetter(getter);

  if (!has(exported, name) || !Object.is(exported[name], value)) {
    entry._changed = true;
    exported[name] = value;
  }
}

function runGetters(entry, names) {
  "use strict";

  if (entry.type === entry_TYPE_ESM) {
    if (Array.isArray(names)) {
      for (var _i11 = 0, _length11 = names == null ? 0 : names.length; _i11 < _length11; _i11++) {
        var name = names[_i11];
        runGetter(entry, name);
      }
    } else {
      for (var _name6 in entry.getters) {
        runGetter(entry, _name6);
      }
    }
  }
}

function runSetter(entry, name, callback, updateType) {
  "use strict";

  var setters = entry.setters[name];

  if (setters === void 0) {
    return;
  }

  var isLoaded = entry._loaded === entry_LOAD_COMPLETED;
  var isNsChanged = entry._changed;
  var length = setters.length;

  while (length--) {
    var setter = setters[length];
    var value = entry.getExportByName(name, setter.owner);

    if (value === entry_ERROR_STAR) {
      setters.splice(length, 1);
      throw new ERR_EXPORT_STAR_CONFLICT(entry.module, name);
    }

    var type = setter.type;
    var changed = type !== entry_SETTER_TYPE_DYNAMIC_IMPORT && !Object.is(setter.last, value);
    var isDynamicImport = isLoaded && type === entry_SETTER_TYPE_DYNAMIC_IMPORT;
    var isExportFrom = type === entry_SETTER_TYPE_EXPORT_FROM;
    var isExportNs = isNsChanged && type === entry_SETTER_TYPE_NAMESPACE;
    var isInit = updateType === entry_UPDATE_TYPE_INIT;

    if (changed || isDynamicImport || isExportFrom || isExportNs || isInit) {
      setter.last = value;
      var setterValue = value === entry_ERROR_GETTER ? void 0 : value;

      if (setter(setterValue, entry)) {
        setters.splice(length, 1);
      }

      if (changed || !isExportFrom) {
        callback(setter);
      }
    }
  }
}

function runSetters(entry, names, callback, updateType) {
  "use strict";

  if (Array.isArray(names)) {
    for (var _i12 = 0, _length12 = names == null ? 0 : names.length; _i12 < _length12; _i12++) {
      var name = names[_i12];
      runSetter(entry, name, callback, updateType);
    }
  } else {
    for (var _name7 in entry.setters) {
      runSetter(entry, _name7, callback, updateType);
    }
  }
}

function tryGetter(getter) {
  "use strict";

  try {
    return getter();
  } catch (_unused) {}

  return entry_ERROR_GETTER;
}

set_prototype_of(entry_Entry.prototype, null);
/* harmony default export */ var src_entry = (entry_Entry);
// CONCATENATED MODULE: ./src/util/is-installed.js



function is_installed_init() {
  "use strict";

  var WIN32 = constant_env.WIN32;
  var nodeModulesRegExp = WIN32 ? /[\\/]node_modules[\\/]/ : /\/node_modules\//;

  function isInstalled({
    filename
  }) {
    return typeof filename === "string" && nodeModulesRegExp.test(filename);
  }

  return isInstalled;
}

/* harmony default export */ var is_installed = (src_shared.inited ? src_shared.module.utilIsInstalled : src_shared.module.utilIsInstalled = is_installed_init());
// CONCATENATED MODULE: ./src/util/is-own-module.js



function is_own_module_init() {
  "use strict";

  var PACKAGE_DIRNAME = esm.PACKAGE_DIRNAME;

  function isOwnModule({
    filename
  }) {
    return typeof filename === "string" && filename.startsWith(PACKAGE_DIRNAME);
  }

  return isOwnModule;
}

/* harmony default export */ var is_own_module = (src_shared.inited ? src_shared.module.utilIsOwnModule : src_shared.module.utilIsOwnModule = is_own_module_init());
// CONCATENATED MODULE: ./src/module/internal/make-require-function.js
// Based on `makeRequireFunction()`.
// Copyright Node.js contributors. Released under MIT license:
// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/helpers.js











var realResolve = real_require.resolve;
var realPaths = realResolve && realResolve.paths;
var make_require_function_symbol = src_shared.symbol;
var ownExportsMap = new Map([[make_require_function_symbol.entry, src_entry], [make_require_function_symbol.realGetProxyDetails, get_proxy_details], [make_require_function_symbol.realRequire, real_require], [make_require_function_symbol.runtime, src_runtime], [make_require_function_symbol.shared, src_shared]]);

function makeRequireFunction(mod, requirer, resolver) {
  "use strict";

  var isOwn = is_own_module(mod);

  var req = function require(request) {
    var exported = isOwn ? ownRequire(request) : void 0;
    return exported === void 0 ? requirer.call(mod, request) : exported;
  };

  function resolve(request, options) {
    validate_string(request, "request");
    return resolver.call(mod, request, options);
  }

  function paths(request) {
    validate_string(request, "request");
    return src_module._resolveLookupPaths(request, mod, true);
  }

  if (typeof requirer !== "function") {
    requirer = function (request) {
      return mod.require(request);
    };
  }

  if (typeof resolver !== "function") {
    resolver = function (request, options) {
      return src_module._resolveFilename(request, mod, false, options);
    };
  }

  req.cache = src_module._cache;
  req.extensions = src_module._extensions;
  req.main = process.mainModule;
  req.resolve = resolve;
  resolve.paths = paths;

  if (!is_installed(mod)) {
    resolve.paths = mask_function(paths, realPaths);
    req.resolve = mask_function(resolve, realResolve);
    req = mask_function(req, real_require);
  }

  return req;
}

function ownRequire(request) {
  "use strict";

  if (typeof request === "symbol") {
    return ownExportsMap.get(request);
  }
}

/* harmony default export */ var make_require_function = (makeRequireFunction);
// CONCATENATED MODULE: ./src/util/prepare-context.js










function prepare_context_init() {
  "use strict";

  var possibleBuiltins = ["Array", "ArrayBuffer", "Atomics", "BigInt", "BigInt64Array", "BigUint64Array", "Boolean", "DataView", "Date", "Error", "EvalError", "Float32Array", "Float64Array", "Function", "Int16Array", "Int32Array", "Int8Array", "Map", "Number", "Object", "Promise", "Proxy", "RangeError", "ReferenceError", "Reflect", "RegExp", "Set", "SharedArrayBuffer", "String", "Symbol", "SyntaxError", "TypeError", "URIError", "Uint16Array", "Uint32Array", "Uint8Array", "Uint8ClampedArray", "WeakMap", "WeakSet"];
  var reassignableBuiltins = ["Buffer", "URL", "URLSearchParams", "clearImmediate", "clearInterval", "clearTimeout", "console", "global", "process", "setImmediate", "setInterval", "setTimeout"];

  function prepareContext(context) {
    var defaultGlobal = src_shared.defaultGlobal;

    if (context === defaultGlobal) {
      return context;
    }

    var names = all_keys(defaultGlobal);

    for (var _i = 0, _length = names == null ? 0 : names.length; _i < _length; _i++) {
      var name = names[_i];
      var descriptor = void 0;

      if (name === "global") {
        descriptor = {
          configurable: true,
          enumerable: true,
          value: context,
          writable: true
        };
      } else if (name === "GLOBAL" || name === "root") {
        descriptor = getDeprecatedGlobalDescriptor(name, context);
      } else if (!has(context, name)) {
        descriptor = Reflect.getOwnPropertyDescriptor(defaultGlobal, name);
      }

      if (descriptor !== void 0) {
        Reflect.defineProperty(context, name, descriptor);
      }
    } // For an unknown reason some `context` properties aren't accessible as
    // free global variables unless they're deleted and reassigned.


    for (var _i2 = 0, _length2 = reassignableBuiltins == null ? 0 : reassignableBuiltins.length; _i2 < _length2; _i2++) {
      var _name = reassignableBuiltins[_i2];

      var _descriptor = Reflect.getOwnPropertyDescriptor(context, _name);

      if (_descriptor !== void 0 && Reflect.deleteProperty(context, _name)) {
        Reflect.defineProperty(context, _name, _descriptor);
      }
    }

    var descriptors = new Map();

    for (var _i3 = 0, _length3 = possibleBuiltins == null ? 0 : possibleBuiltins.length; _i3 < _length3; _i3++) {
      var _name2 = possibleBuiltins[_i3];

      if (has(context, _name2)) {
        descriptors.set(_name2, Reflect.getOwnPropertyDescriptor(context, _name2)); // Delete shadowed builtins to expose those of its realm.

        Reflect.deleteProperty(context, _name2);
      }
    }

    if (descriptors.size === 0) {
      return context;
    }

    var realmBuiltins = new vm_Script("({" + function () {
      var names = descriptors.keys();
      var status;
      var code = "";

      do {
        status = names.next();
        code += toBuiltinPropertySnippet(status.value) + (status.done ? "" : ",");
      } while (!status.done);

      return code;
    }() + "})").runInContext(context);
    descriptors.forEach(function (descriptor, name) {
      Reflect.defineProperty(context, name, descriptor);
      var Builtin = context[name];
      var RealmBuiltin = realmBuiltins[name];

      if (Builtin === RealmBuiltin || !is_object_like(Builtin) || !is_object_like(RealmBuiltin)) {
        return;
      }

      if (name === "Error") {
        RealmBuiltin.prepareStackTrace = function (...args) {
          return Reflect.apply(Builtin.prepareStackTrace, Builtin, args);
        };
      } else if (name === "Object") {
        Reflect.defineProperty(Builtin, Symbol.hasInstance, {
          configurable: true,
          value: function (instance) {
            if (this === Builtin) {
              return instance instanceof RealmBuiltin || instance_of(instance, Builtin);
            }

            return instance_of(instance, this);
          }
        });
      }

      if (typeof RealmBuiltin === "function") {
        set_prototype_of(RealmBuiltin, get_prototype_of(Builtin));

        if (has(RealmBuiltin, "prototype")) {
          var RealmProto = RealmBuiltin.prototype;

          if (is_object_like(RealmProto)) {
            var BuiltinProto = Builtin.prototype;
            set_prototype_of(RealmProto, BuiltinProto);

            if (has(BuiltinProto, "constructor")) {
              Reflect.defineProperty(RealmProto, "constructor", Reflect.getOwnPropertyDescriptor(BuiltinProto, "constructor"));
            }
          }
        }
      }
    });
    return context;
  }

  function getDeprecatedGlobalDescriptor(name, context) {
    var depCode = "DEP0016";
    var depMessage = "'" + name + "' is deprecated, use 'global'";
    return {
      configurable: true,
      get: deprecate(function () {
        return context;
      }, depMessage, depCode),
      set: deprecate(function (value) {
        Reflect.defineProperty(this, name, {
          configurable: true,
          value,
          writable: true
        });
      }, depMessage, depCode)
    };
  }

  function toBuiltinPropertySnippet(name) {
    var snippet = name + ":";

    if (name === "Array") {
      snippet += "[].constructor";
    } else if (name === "BigInt") {
      snippet += "1n.constructor";
    } else if (name === "Boolean") {
      snippet += "true.constructor";
    } else if (name === "Function") {
      snippet += "(function () {}).constructor";
    } else if (name === "Number") {
      snippet += "1..constructor";
    } else if (name === "Object") {
      snippet += "({}).constructor";
    } else if (name === "RegExp") {
      snippet += "/./.constructor";
    } else if (name === "String") {
      snippet += '"".constructor';
    } else {
      snippet += "this." + name;
    }

    return snippet;
  }

  return prepareContext;
}

/* harmony default export */ var prepare_context = (src_shared.inited ? src_shared.module.utilPrepareContext : src_shared.module.utilPrepareContext = prepare_context_init());
// CONCATENATED MODULE: ./src/util/satisfies.js



function satisfies_init() {
  "use strict";

  var satisfiesOptions = {
    includePrerelease: true
  };

  function satisfies(version, range) {
    if (typeof version !== "string" || typeof range !== "string") {
      return false;
    }

    var cacheKey = version + "\0" + range;
    var cache = src_shared.memoize.utilSatisfies;
    var cached = cache.get(cacheKey);

    if (cached === void 0) {
      cached = Object(semver["satisfies"])(version, range, satisfiesOptions);
      cache.set(cacheKey, cached);
    }

    return cached;
  }

  return satisfies;
}

/* harmony default export */ var util_satisfies = (src_shared.inited ? src_shared.module.utilSatisfies : src_shared.module.utilSatisfies = satisfies_init());
// CONCATENATED MODULE: ./src/hook/global.js


function hook(global) {
  "use strict";

  global.console = builtin_entries.console.module.exports;
  global.process = builtin_entries.process.module.exports;
}

/* harmony default export */ var hook_global = (hook);
// CONCATENATED MODULE: ./src/env/has-loader-value.js












function has_loader_value_init() {
  "use strict";

  var HYPHEN_MINUS = char_code.HYPHEN_MINUS;

  function hasLoaderValue(value) {
    if (typeof value === "string") {
      if (is_path(value)) {
        var thePath = value;

        if (path_extname(thePath) === "") {
          thePath += sep + "index.js";
        }

        if (is_own_path(fs_realpath(thePath))) {
          return true;
        }
      } else if (value.charCodeAt(0) !== HYPHEN_MINUS && is_own_path(tryDualResolveFilename(value, root_module, false))) {
        return true;
      }
    } else if (is_object_like(value)) {
      var names = util_keys(value);

      for (var _i = 0, _length = names == null ? 0 : names.length; _i < _length; _i++) {
        var name = names[_i];

        if (hasLoaderValue(value[name])) {
          return true;
        }
      }
    }

    return false;
  }

  function tryDualResolveFilename(request, parent, isMain) {
    var entryState = src_shared.entry;
    var entryCache = entryState.cache;
    var pkgState = src_loader.state.package;
    var pkgCache = pkgState.cache;
    entryState.cache = new WeakMap();
    pkgState.cache = new Map();
    var result;
    var threw = true;

    try {
      result = dual_resolve_filename(request, parent, isMain);
      threw = false;
    } catch (_unused) {}

    entryState.cache = entryCache;
    pkgState.cache = pkgCache;

    if (threw) {
      return "";
    }

    return result;
  }

  return hasLoaderValue;
}

/* harmony default export */ var has_loader_value = (src_shared.inited ? src_shared.module.envHasLoaderValue : src_shared.module.envHasLoaderValue = has_loader_value_init());
// CONCATENATED MODULE: ./src/env/has-loader-arg.js






function has_loader_arg_init() {
  "use strict";

  var LEFT_CURLY_BRACKET = char_code.LEFT_CURLY_BRACKET;

  function hasLoaderArg(args) {
    return util_matches(args, function (arg) {
      return arg.charCodeAt(0) === LEFT_CURLY_BRACKET ? has_loader_value(parse_json(arg)) : has_loader_value(arg);
    });
  }

  return hasLoaderArg;
}

/* harmony default export */ var has_loader_arg = (src_shared.inited ? src_shared.module.envHasLoaderArg : src_shared.module.envHasLoaderArg = has_loader_arg_init());
// CONCATENATED MODULE: ./src/env/is-sideloaded.js










function is_sideloaded_init() {
  "use strict";

  function isSideloaded() {
    if (is_jasmine() || is_nyc()) {
      return true;
    }

    var args = process_argv.slice(2);

    if (args.length === 0) {
      return false;
    }

    var filename = fs_realpath(process_argv[1]);
    var nodeModulesIndex = filename.lastIndexOf(sep + "node_modules" + sep);

    if (nodeModulesIndex === -1 || !has_loader_arg(args)) {
      return false;
    }

    var entryState = src_shared.entry;
    var entryCache = entryState.cache;
    var pkgState = src_loader.state.package;
    var pkgCache = pkgState.cache;
    entryState.cache = new WeakMap();
    pkgState.cache = new Map();
    var result = false;

    if (src_package.get(cwd()) !== null || src_package.get(filename.slice(0, nodeModulesIndex + 1)) !== null) {
      result = true;
    }

    entryState.cache = entryCache;
    pkgState.cache = pkgCache;
    return result;
  }

  return isSideloaded;
}

/* harmony default export */ var is_sideloaded = (src_shared.inited ? src_shared.module.envIsSideloaded : src_shared.module.envIsSideloaded = is_sideloaded_init());
// CONCATENATED MODULE: ./src/util/max-satisfying.js




function max_satisfying_init() {
  "use strict";

  function maxSatisfying(versions, range) {
    if (!Array.isArray(versions) || typeof range !== "string") {
      return null;
    }

    var cacheKey = (versions.length === 1 ? versions[0] : generic_array.join(versions)) + "\0" + range;
    var cache = src_shared.memoize.utilMaxSatisfying;
    var cached = cache.get(cacheKey);

    if (cached === void 0) {
      cached = Object(semver["maxSatisfying"])(versions, range);
      cache.set(cacheKey, cached);
    }

    return cached;
  }

  return maxSatisfying;
}

/* harmony default export */ var max_satisfying = (src_shared.inited ? src_shared.module.utilMaxSatisfying : src_shared.module.utilMaxSatisfying = max_satisfying_init());
// CONCATENATED MODULE: ./src/util/set-silent.js



function set_silent_init() {
  "use strict";

  function setSilent(object, name, value) {
    util_silent(function () {
      try {
        object[name] = value;
      } catch (_unused) {}
    });
  }

  return setSilent;
}

/* harmony default export */ var set_silent = (src_shared.inited ? src_shared.module.utilSetSilent : src_shared.module.utilSetSilent = set_silent_init());
// CONCATENATED MODULE: ./src/wrapper.js
// This module is important for `esm` versioning support and should be changed
// as little as possible. Please ensure any changes are backwards compatible.










function wrapper_init() {
  "use strict";

  var PACKAGE_RANGE = esm.PACKAGE_RANGE;
  var Wrapper = {
    find(object, name, range) {
      var map = getMap(object, name);

      if (map !== null) {
        var maxVersion = max_satisfying(map.versions, range);

        if (maxVersion !== null) {
          var wrapper = map.wrappers.get(maxVersion);

          if (wrapper !== void 0) {
            return wrapper;
          }
        }
      }

      return null;
    },

    manage(object, name, wrapper) {
      var func = Wrapper.unwrap(object, name);
      var manager = proxy_wrap(func, function (func, args) {
        var newTarget = new.target;
        return newTarget === void 0 ? Reflect.apply(wrapper, this, [manager, func, args]) : Reflect.construct(wrapper, [manager, func, args], newTarget);
      });
      Reflect.defineProperty(manager, src_shared.symbol.wrapper, {
        configurable: true,
        value: func
      });
      set_silent(object, name, manager);
    },

    unwrap(object, name) {
      var manager = util_silent(function () {
        return object[name];
      });
      var symbol = src_shared.symbol.wrapper;
      return has(manager, symbol) ? manager[symbol] : manager;
    },

    wrap(object, name, wrapper) {
      var map = getOrCreateMap(object, name);

      if (map.wrappers.get(PACKAGE_RANGE) === void 0) {
        generic_array.push(map.versions, PACKAGE_RANGE);
        map.wrappers.set(PACKAGE_RANGE, to_external_function(wrapper));
      }
    }

  };

  function createMap(object, name) {
    // Store the wrapper map as `object[shared.symbol.wrapper][name]` rather
    // than on the function so other code can modify the same property without
    // interfering with our wrapper.
    var store = getOrCreateStore(object);
    var map = {
      raw: Wrapper.unwrap(object, name),
      versions: [],
      wrappers: new Map()
    };
    store.set(name, map);
    return map;
  }

  function createStore(object) {
    var value = new Map();
    Reflect.defineProperty(object, src_shared.symbol.wrapper, {
      configurable: true,
      value
    });
    return value;
  }

  function getMap(object, name) {
    var store = getStore(object);
    var map;

    if (store !== null) {
      map = store.get(name);
    }

    return map === void 0 ? null : map;
  }

  function getOrCreateMap(object, name) {
    var map = getMap(object, name);
    return map === null ? createMap(object, name) : map;
  }

  function getOrCreateStore(object) {
    var store = getStore(object);
    return store === null ? createStore(object) : store;
  }

  function getStore(object) {
    var symbol = src_shared.symbol.wrapper;
    return has(object, symbol) ? object[symbol] : null;
  }

  return Wrapper;
}

/* harmony default export */ var src_wrapper = (src_shared.inited ? src_shared.module.Wrapper : src_shared.module.Wrapper = wrapper_init());
// CONCATENATED MODULE: ./src/util/relax-range.js



function relax_range_init() {
  "use strict";

  var CIRCUMFLEX_ACCENT = char_code.CIRCUMFLEX_ACCENT,
      DIGIT_0 = char_code.DIGIT_0,
      DIGIT_9 = char_code.DIGIT_9,
      EQUAL = char_code.EQUAL,
      LOWERCASE_V = char_code.LOWERCASE_V,
      TILDE = char_code.TILDE;

  function relaxRange(range) {
    if (typeof range !== "string") {
      return "*";
    }

    var code0 = range.charCodeAt(0);

    if (code0 !== CIRCUMFLEX_ACCENT) {
      if (code0 >= DIGIT_0 && code0 <= DIGIT_9) {
        return "^" + range;
      }

      if (code0 === TILDE || code0 === LOWERCASE_V || code0 === EQUAL) {
        return "^" + range.slice(1);
      }
    }

    return range;
  }

  return relaxRange;
}

/* harmony default export */ var relax_range = (src_shared.inited ? src_shared.module.utilRelaxRange : src_shared.module.utilRelaxRange = relax_range_init());
// CONCATENATED MODULE: ./src/hook/main.js














function main_hook(Mod) {
  "use strict";

  function managerWrapper(manager, func, args) {
    var _realProcess$argv = process.argv,
        mainPath = _realProcess$argv[1];
    var filename = dual_resolve_filename(mainPath, null, true);
    var pkg = src_package.from(filename);
    var wrapped = src_wrapper.find(Mod, "runMain", relax_range(pkg.range));
    return wrapped === null ? Reflect.apply(func, this, args) : Reflect.apply(wrapped, this, [manager, func, args]);
  }

  function methodWrapper() {
    var _realProcess$argv2 = process.argv,
        mainPath = _realProcess$argv2[1];
    var filename = dual_resolve_filename(mainPath, null, true);
    var defaultPkg = src_loader.state.package.default;
    var dirPath = dirname(filename);

    if (src_package.get(dirPath) === defaultPkg) {
      // Clone the default package to avoid the parsing phase fallback path
      // of module/internal/compile.
      src_package.set(dirPath, defaultPkg.clone());
    }

    try {
      parse_load(mainPath, null, true);
    } catch (e) {
      if (!defaultPkg.options.debug && is_stack_trace_maskable(e)) {
        mask_stack_trace(e, {
          filename
        });
      } else {
        to_external_error(e);
      }

      throw e;
    }

    tickCallback();
  }

  function tickCallback() {
    var _tickCallback = get_silent(process, "_tickCallback");

    if (typeof _tickCallback === "function") {
      Reflect.apply(_tickCallback, process, []);
    }
  }

  src_wrapper.manage(Mod, "runMain", managerWrapper);
  src_wrapper.wrap(Mod, "runMain", methodWrapper);
  src_module.runMain = Mod.runMain;
}

/* harmony default export */ var main = (main_hook);
// CONCATENATED MODULE: ./src/hook/module.js




























var module_STATE_EXECUTION_COMPLETED = constant_entry.STATE_EXECUTION_COMPLETED,
    module_STATE_EXECUTION_STARTED = constant_entry.STATE_EXECUTION_STARTED,
    module_STATE_INITIAL = constant_entry.STATE_INITIAL;
var module_OPTIONS = constant_env.OPTIONS;
var module_PACKAGE_VERSION = esm.PACKAGE_VERSION;
var module_MODE_ALL = constant_package.MODE_ALL,
    module_MODE_AUTO = constant_package.MODE_AUTO,
    module_RANGE_ALL = constant_package.RANGE_ALL;
var module_ERR_REQUIRE_ESM = src_errors.ERR_REQUIRE_ESM;
var module_exts = [".js", ".json", ".mjs", ".cjs", ".wasm"];
var importExportRegExp = /^.*?\b(?:im|ex)port\b/;
var realExtsJS = real_module._extensions[".js"];

function module_hook(Mod, parent) {
  "use strict";

  var _extensions = Mod._extensions;
  var passthruMap = new Map();
  var parentPkg = src_package.from(parent);

  if (parentPkg === null) {
    parentPkg = src_package.from(parent, module_OPTIONS || true);
  }

  var defaultPkg = parentPkg.clone();
  var defaultOptions = defaultPkg.options;
  defaultPkg.range = module_RANGE_ALL;

  if (!defaultOptions.force && defaultOptions.mode === module_MODE_ALL) {
    defaultOptions.mode = module_MODE_AUTO;
  }

  src_loader.state.package.default = defaultPkg;
  src_module._extensions = _extensions;
  var jsManager = createManager(".js");

  function createManager(ext) {
    return function managerWrapper(manager, func, args) {
      var filename = args[1];
      var pkg = src_package.from(filename);
      var wrapped = src_wrapper.find(_extensions, ext, relax_range(pkg.range));
      return wrapped === null ? tryPassthru.call(this, func, args, pkg) : Reflect.apply(wrapped, this, [manager, func, args]);
    };
  }

  function jsWrapper(manager, func, args) {
    var _this = this;

    var mod = args[0],
        filename = args[1];
    var shouldOverwrite = !src_entry.has(mod);
    var entry = src_entry.get(mod);
    var ext = entry.extname;
    var pkg = entry.package;

    var compileFallback = function (content) {
      entry.state = module_STATE_EXECUTION_STARTED;

      if (typeof content === "string") {
        var _compile2 = mod._compile;

        var _shouldRestore = has(mod, "_compile");

        set_property(mod, "_compile", to_external_function(function (ignoredContent, filename) {
          if (_shouldRestore) {
            set_property(this, "_compile", _compile2);
          } else {
            Reflect.deleteProperty(this, "_compile");
          }

          return Reflect.apply(_compile2, this, [content, filename]);
        }));
      }

      var result;
      var threw = true;

      try {
        result = tryPassthru.call(_this, func, args, pkg);
        threw = false;
      } finally {
        entry.state = threw ? module_STATE_INITIAL : module_STATE_EXECUTION_COMPLETED;
      }

      return result;
    };

    if (shouldOverwrite) {
      set_prototype_of(mod, src_module.prototype);
    }

    if (entry._passthruCompile || shouldOverwrite && ext === ".mjs") {
      entry._passthruCompile = false;
      return compileFallback();
    }

    var compileData = entry.compileData;

    if (compileData !== null && compileData.code !== null || ext === ".json" || ext === ".wasm") {
      entry._ranthruCompile = true;
      internal_compile(manager, entry, null, filename, compileFallback);
      return;
    }

    if (this === src_loader.state.module.extensions) {
      entry._ranthruCompile = true;
      internal_compile(manager, entry, read_file(filename, "utf8"), filename, compileFallback);
      return;
    }

    var _compile = mod._compile;
    var shouldRestore = shouldOverwrite && has(mod, "_compile");
    var compileWrapper = to_external_function(function (content, filename) {
      if (shouldOverwrite) {
        if (shouldRestore) {
          set_property(this, "_compile", _compile);
        } else {
          Reflect.deleteProperty(this, "_compile");
        }
      }

      var compileWrapper = has(this, src_shared.symbol._compile) ? this[src_shared.symbol._compile] : null;

      if (typeof compileWrapper === "function") {
        Reflect.deleteProperty(this, src_shared.symbol._compile);
        Reflect.apply(compileWrapper, this, [content, filename]);
      } else {
        internal_compile(manager, entry, content, filename, compileFallback);
      }
    });

    if (shouldOverwrite) {
      set_property(mod, "_compile", compileWrapper);
    } else {
      entry._ranthruCompile = true;
      Reflect.defineProperty(mod, src_shared.symbol._compile, {
        configurable: true,
        value: compileWrapper
      });
    }

    if ((compileData === null || compileData.transforms === 0) && passthruMap.get(func)) {
      return tryPassthru.call(this, func, args, pkg);
    }

    mod._compile(read_file(filename, "utf8"), filename);
  }

  for (var _i = 0, _length = module_exts == null ? 0 : module_exts.length; _i < _length; _i++) {
    var ext = module_exts[_i];
    var extIsMJS = ext === ".mjs";

    if (extIsMJS && !has(_extensions, ext)) {
      _extensions[ext] = mask_function(mjsCompiler, realExtsJS);
    }

    var extIsWASM = ext === ".wasm";

    if (extIsWASM && !src_shared.support.wasm) {
      continue;
    }

    if (!has(_extensions, ext)) {
      _extensions[ext] = realExtsJS;
    }

    var extCompiler = src_wrapper.unwrap(_extensions, ext);
    var passthru = typeof extCompiler === "function" && !has(extCompiler, src_shared.symbol.mjs);

    if (extIsMJS && passthru) {
      try {
        extCompiler();
      } catch (e) {
        if (is_error(e) && e.code === "ERR_REQUIRE_ESM") {
          passthru = false;
        }
      }
    }

    src_wrapper.manage(_extensions, ext, jsManager);
    src_wrapper.wrap(_extensions, ext, jsWrapper);
    passthruMap.set(extCompiler, passthru);
    src_loader.state.module.extensions[ext] = _extensions[ext];
  }
}

function mjsCompiler(mod, filename) {
  "use strict";

  throw new module_ERR_REQUIRE_ESM(filename);
}

function tryPassthru(func, args, pkg) {
  "use strict";

  var error;

  try {
    return Reflect.apply(func, this, args);
  } catch (e) {
    error = e;
  }

  if (src_loader.state.package.default.options.debug || !is_stack_trace_maskable(error)) {
    to_external_error(error);
    throw error;
  }

  var name = util_get(error, "name");
  var filename = args[1];

  if (name === "SyntaxError") {
    var message = to_string(util_get(error, "message"));
    var range = pkg.range;

    if (importExportRegExp.test(message) && !util_satisfies(module_PACKAGE_VERSION, range)) {
      var newMessage = "Expected esm@" + range + ". Using esm@" + module_PACKAGE_VERSION + ": " + filename;
      Reflect.defineProperty(error, "message", {
        configurable: true,
        value: newMessage,
        writable: true
      });
      var stack = util_get(error, "stack");

      if (typeof stack === "string") {
        Reflect.defineProperty(error, "stack", {
          configurable: true,
          value: stack.replace(message, function () {
            return newMessage;
          }),
          writable: true
        });
      }
    }

    pkg.cache.dirty = true;
  }

  var loc = get_location_from_stack_trace(error);

  if (loc !== null) {
    filename = loc.filename;
  }

  mask_stack_trace(error, {
    filename
  });
  throw error;
}

Reflect.defineProperty(mjsCompiler, src_shared.symbol.mjs, {
  value: true
});
/* harmony default export */ var hook_module = (module_hook);
// CONCATENATED MODULE: ./src/hook/pnp.js




var pnp_FLAGS = constant_env.FLAGS;
var yarnPnpFilenameRegExp = new RegExp(`${escape_regexp(sep)}\\.pnp\\.c?js$`);

function pnp_hook(pnp) {
  "use strict";

  var _cache = src_module._cache;

  for (var name in _cache) {
    if (yarnPnpFilenameRegExp.test(name)) {
      Reflect.deleteProperty(_cache, name);
      break;
    }
  }

  for (var _i = 0, _FLAGS$preloadModules = pnp_FLAGS.preloadModules, _length = _FLAGS$preloadModules == null ? 0 : _FLAGS$preloadModules.length; _i < _length; _i++) {
    var request = _FLAGS$preloadModules[_i];

    if (yarnPnpFilenameRegExp.test(request)) {
      src_module._preloadModules([request]);

      pnp._resolveFilename = src_module._resolveFilename;
      break;
    }
  }
}

/* harmony default export */ var hook_pnp = (pnp_hook);
// CONCATENATED MODULE: ./src/hook/process.js







var process_PACKAGE_RANGE = esm.PACKAGE_RANGE;

function process_hook(processObject) {
  "use strict";

  function exceptionManagerWrapper(manager, func, args) {
    var wrapped = src_wrapper.find(processObject, "_fatalException", process_PACKAGE_RANGE);
    return wrapped === null ? Reflect.apply(func, this, args) : Reflect.apply(wrapped, this, [manager, func, args]);
  }

  function exceptionMethodWrapper(manager, func, args) {
    var error = args[0];

    if (!src_loader.state.package.default.options.debug && is_stack_trace_maskable(error)) {
      mask_stack_trace(error);
    } else {
      to_external_error(error);
    }

    return Reflect.apply(func, this, args);
  }

  function warningManagerWrapper(manager, func, args) {
    var wrapped = src_wrapper.find(processObject, "emitWarning", process_PACKAGE_RANGE);
    return wrapped === null ? Reflect.apply(func, this, args) : Reflect.apply(wrapped, this, [manager, func, args]);
  }

  function warningMethodWrapper(manager, func, args) {
    var stack = args[0];

    if (typeof stack === "string") {
      args[0] = scrub_stack_trace(stack);
    }

    return Reflect.apply(func, this, args);
  }

  src_wrapper.manage(processObject, "_fatalException", exceptionManagerWrapper);
  src_wrapper.wrap(processObject, "_fatalException", exceptionMethodWrapper);
  src_wrapper.manage(processObject, "emitWarning", warningManagerWrapper);
  src_wrapper.wrap(processObject, "emitWarning", warningMethodWrapper);
}

/* harmony default export */ var hook_process = (process_hook);
// CONCATENATED MODULE: ./src/hook/require.js










var require_TYPE_CJS = constant_entry.TYPE_CJS;
var require_ERR_INVALID_ARG_VALUE = src_errors.ERR_INVALID_ARG_VALUE;

function require_hook(parent) {
  "use strict";

  function requirer(request) {
    validate_string(request, "request");

    if (request === "") {
      throw new require_ERR_INVALID_ARG_VALUE("request", request, "must be a non-empty string");
    }

    var filename = dual_resolve_filename(request, parent);
    var defaultPkg = src_loader.state.package.default;
    var dirPath = dirname(filename);

    if (src_package.get(dirPath) === defaultPkg) {
      // Clone the default package to avoid the parsing phase fallback path
      // of module/internal/compile.
      src_package.set(dirPath, defaultPkg.clone());
    }

    var entry = parse_load(request, parent);
    var exported = entry.module.exports;

    if (entry.type !== require_TYPE_CJS) {
      src_shared.bridged.set(exported, entry);
    }

    return exported;
  }

  function resolver(request, options) {
    return dual_resolve_filename(request, parent, false, options);
  }

  var req = make_require_function(parent, requirer, resolver);
  req.main = src_loader.state.module.mainModule;
  return req;
}

/* harmony default export */ var hook_require = (require_hook);
// CONCATENATED MODULE: ./src/shim/process-binding-util-get-proxy-details.js









function process_binding_util_get_proxy_details_init() {
  "use strict";

  var Shim = {
    enable(context) {
      var cache = src_shared.memoize.shimProcessBindingUtilGetProxyDetails;
      var getProxyDetails;
      var utilBinding;
      util_silent(function () {
        try {
          utilBinding = context.process.binding("util");
          getProxyDetails = utilBinding.getProxyDetails;
        } catch (_unused) {}
      });

      if (check(utilBinding, getProxyDetails, cache)) {
        return context;
      }

      var trap = native_trap(function (getProxyDetails, ...rest) {
        var _rest = rest[rest.length - 1],
            value = _rest[0];

        if (!is_own_proxy(value)) {
          return Reflect.apply(getProxyDetails, utilBinding, [value]);
        }
      });

      if (set_property(utilBinding, "getProxyDetails", new own_proxy(getProxyDetails, {
        apply: trap,
        construct: trap
      }))) {
        cache.set(utilBinding, true);
      }

      return context;
    }

  };

  function check(utilBinding, getProxyDetails, cache) {
    if (!is_object_like(utilBinding) || typeof getProxyDetails !== "function") {
      return true;
    }

    var cached = cache.get(utilBinding);

    if (cached !== void 0) {
      return cached;
    }

    cached = true;

    try {
      cached = getProxyDetails(new own_proxy(empty_object, empty_object)) === void 0;
    } catch (_unused2) {}

    cache.set(utilBinding, cached);
    return cached;
  }

  return Shim;
}

/* harmony default export */ var process_binding_util_get_proxy_details = (src_shared.inited ? src_shared.module.shimProcessBindingUtilGetProxyDetails : src_shared.module.shimProcessBindingUtilGetProxyDetails = process_binding_util_get_proxy_details_init());
// CONCATENATED MODULE: ./src/real/repl.js



/* harmony default export */ var repl = (src_shared.inited ? src_shared.module.realREPL : src_shared.module.realREPL = unwrap_proxy(real_require("repl")));
// CONCATENATED MODULE: ./src/safe/repl.js



var safeREPL = src_shared.inited ? src_shared.module.safeREPL : src_shared.module.safeREPL = util_safe(repl);
var REPLServer = safeREPL.REPLServer;

/* harmony default export */ var safe_repl = (safeREPL);
// CONCATENATED MODULE: ./src/acorn/acorn/parse.js





function parse_init() {
  "use strict";

  var SOURCE_TYPE_MODULE = compiler.SOURCE_TYPE_MODULE,
      SOURCE_TYPE_SCRIPT = compiler.SOURCE_TYPE_SCRIPT;
  var Plugin = {
    enable(acorn) {
      acorn.parse = parse;
    }

  };

  function parse(code, options) {
    var ast;
    var error;
    var threw = true;
    options = util_defaults({
      sourceType: SOURCE_TYPE_MODULE,
      strict: false
    }, options);

    try {
      ast = src_parser.parse(code, options);
      threw = false;
    } catch (e) {
      error = e;
    }

    if (threw) {
      options.sourceType = SOURCE_TYPE_SCRIPT;

      try {
        ast = src_parser.parse(code, options);
        threw = false;
      } catch (_unused) {}
    }

    if (threw) {
      throw error;
    }

    return ast;
  }

  return Plugin;
}

/* harmony default export */ var acorn_parse = (src_shared.inited ? src_shared.module.acornAcornParse : src_shared.module.acornAcornParse = parse_init());
// CONCATENATED MODULE: ./src/acorn/internal/acorn.js






function acorn_init() {
  "use strict";

  var INTERNAL = constant_env.INTERNAL;
  var Plugin = {
    enable() {
      if (INTERNAL) {
        var acorn = safe_require("internal/deps/acorn/acorn/dist/acorn");

        if (is_object_like(acorn)) {
          acorn_parse.enable(acorn);
        }
      }
    }

  };
  return Plugin;
}

/* harmony default export */ var internal_acorn = (src_shared.inited ? src_shared.module.acornInternalAcorn : src_shared.module.acornInternalAcorn = acorn_init());
// CONCATENATED MODULE: ./src/acorn/walk/dynamic-import.js
// Based on acorn-dynamic-import.
// Copyright Jordan Gensler. Released under MIT license:
// https://github.com/kesne/acorn-dynamic-import



function dynamic_import_init() {
  "use strict";

  var Plugin = {
    enable(walk) {
      walk.base.Import = noop;
      return walk;
    }

  };
  return Plugin;
}

/* harmony default export */ var dynamic_import = (src_shared.inited ? src_shared.module.acornWalkDynamicImport : src_shared.module.acornWalkDynamicImport = dynamic_import_init());
// CONCATENATED MODULE: ./src/acorn/internal/walk.js






function walk_init() {
  "use strict";

  var INTERNAL = constant_env.INTERNAL;
  var Plugin = {
    enable() {
      if (INTERNAL) {
        var walk = safe_require("internal/deps/acorn/acorn-walk/dist/walk");

        if (is_object_like(walk)) {
          dynamic_import.enable(walk);
        }
      }
    }

  };
  return Plugin;
}

/* harmony default export */ var internal_walk = (src_shared.inited ? src_shared.module.acornInternalWalk : src_shared.module.acornInternalWalk = walk_init());
// CONCATENATED MODULE: ./src/hook/vm.js







































var vm_SOURCE_TYPE_MODULE = compiler.SOURCE_TYPE_MODULE,
    vm_SOURCE_TYPE_UNAMBIGUOUS = compiler.SOURCE_TYPE_UNAMBIGUOUS;
var vm_STATE_EXECUTION_COMPLETED = constant_entry.STATE_EXECUTION_COMPLETED,
    vm_STATE_EXECUTION_STARTED = constant_entry.STATE_EXECUTION_STARTED,
    vm_STATE_PARSING_COMPLETED = constant_entry.STATE_PARSING_COMPLETED,
    vm_STATE_PARSING_STARTED = constant_entry.STATE_PARSING_STARTED,
    vm_TYPE_CJS = constant_entry.TYPE_CJS,
    vm_TYPE_ESM = constant_entry.TYPE_ESM;
var CHECK = constant_env.CHECK,
    EVAL = constant_env.EVAL,
    vm_FLAGS = constant_env.FLAGS,
    vm_HAS_INSPECTOR = constant_env.HAS_INSPECTOR,
    vm_INTERNAL = constant_env.INTERNAL,
    REPL = constant_env.REPL;
var vm_ERR_INVALID_ARG_TYPE = src_errors.ERR_INVALID_ARG_TYPE;

function vm_hook(vm) {
  "use strict";

  var entry;

  function managerWrapper(manager, createScript, args) {
    var wrapped = src_wrapper.find(vm, "createScript", "*");
    return Reflect.apply(wrapped, this, [manager, createScript, args]);
  }

  function methodWrapper(manager, createScript, [content, scriptOptions]) {
    scriptOptions = util_assign({}, scriptOptions);
    scriptOptions.produceCachedData = true;
    var cacheName = get_cache_name(content);
    var compileDatas = entry.package.cache.compile;
    var _entry = entry,
        runtimeName = _entry.runtimeName;
    var compileData = compileDatas.get(cacheName);

    if (compileData === void 0) {
      compileData = null;
    }

    entry.state = vm_STATE_PARSING_STARTED;

    if (compileData === null) {
      var compilerOptions = {
        cjsPaths: true,
        cjsVars: true,
        generateVarDeclarations: true,
        pragmas: false,
        runtimeName,
        sourceType: vm_SOURCE_TYPE_UNAMBIGUOUS,
        strict: false
      };
      compileData = tryWrapper(caching_compiler.compile, [content, compilerOptions], content);
      compileDatas.set(cacheName, compileData);
    } else if (compileData.scriptData !== null && scriptOptions.produceCachedData && !has(scriptOptions, "cachedData")) {
      scriptOptions.cachedData = compileData.scriptData;
    }

    entry.state = vm_STATE_PARSING_COMPLETED;
    var code = "(()=>{" + 'var g=Function("return this")(),' + "m=g.module," + "e=m&&m.exports," + 'n="' + runtimeName + '";' + "if(e&&!g[n]){" + "m.exports=e.entry.exports;" + "require=e.entry.require;" + "e.entry.addBuiltinModules(g);" + "Reflect.defineProperty(g,n,{" + "__proto__:null," + "value:e" + "})" + "}" + "})();" + compileData.code;
    var script = tryWrapper.call(vm, createScript, [code, scriptOptions], content);

    if (script.cachedDataProduced) {
      compileData.scriptData = script.cachedData;
    }

    var runInWrapper = function (runInFunc, args) {
      entry._validation.clear();

      entry.cacheName = cacheName;
      entry.compileData = compileData;
      entry.state = vm_STATE_EXECUTION_STARTED;
      entry.type = compileData.sourceType === vm_SOURCE_TYPE_MODULE ? vm_TYPE_ESM : vm_TYPE_CJS;
      var result = tryWrapper.call(this, runInFunc, args, content);
      entry.state = vm_STATE_EXECUTION_COMPLETED;
      return result;
    };

    script.runInContext = util_wrap(script.runInContext, runInWrapper);
    script.runInThisContext = util_wrap(script.runInThisContext, runInWrapper);
    return script;
  }

  function setupCheck() {
    vm.Script = proxy_wrap(vm.Script, function (Script, [code, options]) {
      vm.Script = Script;
      var wrapper = get_silent(src_module, "wrapper");

      if (Array.isArray(wrapper)) {
        var prefix = wrapper[0],
            suffix = wrapper[1];

        if (typeof prefix === "string" && typeof suffix === "string") {
          code = code.slice(prefix.length, -suffix.length);
        }
      }

      setupEntry(root_module);
      return vm.createScript(code, options);
    });
  }

  function setupEntry(mod) {
    set_prototype_of(mod, src_module.prototype);
    entry = src_entry.get(mod);
    entry.addBuiltinModules = createAddBuiltinModules(entry);
    entry.package = src_package.get("");
    entry.require = make_require_function(mod);
    entry.runtime = null;
    entry.runtimeName = src_shared.runtimeName;
    src_runtime.enable(entry, generic_object.create());
  }

  function setupEval() {
    vm.runInThisContext = proxy_wrap(vm.runInThisContext, function (runInThisContext, [code, options]) {
      vm.runInThisContext = runInThisContext;
      setupEntry(src_shared.unsafeGlobal.module);
      return vm.createScript(code, options).runInThisContext(options);
    });
    real_module.prototype._compile = src_module.prototype._compile;
  }

  function setupREPL() {
    var createContext = REPLServer.prototype.createContext;

    if (root_module.id === "<repl>") {
      setupEntry(root_module);
    } else if (typeof createContext === "function") {
      REPLServer.prototype.createContext = proxy_wrap(createContext, function () {
        REPLServer.prototype.createContext = createContext;
        Reflect.defineProperty(this, "writer", {
          configurable: true,
          enumerable: true,

          get() {
            return void 0;
          },

          set(value) {
            var writer = mask_function(function (object) {
              return builtin_inspect(object, writer.options);
            }, value);
            writer.options = value.options;
            writer.options.colors = this.useColors;
            Reflect.defineProperty(builtin_inspect, "replDefaults", {
              configurable: true,
              enumerable: true,

              get() {
                return writer.options;
              },

              set(options) {
                if (!is_object(options)) {
                  throw new vm_ERR_INVALID_ARG_TYPE("options", "Object", options);
                }

                return util_assign(writer.options, options);
              }

            });
            set_property(this, "writer", writer);
            set_property(repl, "writer", writer);
            return writer;
          }

        });
        var context = Reflect.apply(createContext, this, []);
        var mod = context.module;
        Reflect.defineProperty(src_shared.unsafeGlobal, "module", {
          configurable: true,

          get() {
            return mod;
          },

          set(value) {
            mod = value;
            setupEntry(mod);
          }

        });
        setupEntry(mod);
        return context;
      });
    }

    builtin_vm.createScript = vm.createScript;

    if (vm_INTERNAL && vm_FLAGS.experimentalREPLAwait) {
      internal_acorn.enable();
      internal_walk.enable();
    } // Exit for Node 10+.


    if (src_shared.support.replShowProxy) {
      set_property(util, "inspect", builtin_inspect);
      return;
    }

    var _inspect = util.inspect;
    set_getter(util, "inspect", to_external_function(function () {
      // Prevent re-entering the getter by triggering the setter to convert
      // `util.inspect()` from an accessor property to a data property.
      this.inspect = builtin_inspect; // The first getter call occurs in Node's lib/repl.js as an assignment
      // to `repl.writer()`. It needs to be the original `util.inspect()`
      // for ANSI coloring to be enabled.
      // https://github.com/nodejs/node/blob/v9.11.1/lib/repl.js#L377-L382

      return _inspect;
    }));
    set_setter(util, "inspect", to_external_function(function (value) {
      set_property(this, "inspect", value);
    }));
  }

  src_wrapper.manage(vm, "createScript", managerWrapper);
  src_wrapper.wrap(vm, "createScript", methodWrapper);

  if (CHECK) {
    setupCheck();
  } else if (EVAL) {
    setupEval();
  } else if (REPL) {
    setupREPL();
  }
}

function createAddBuiltinModules(entry) {
  "use strict";

  var lazyModules = ["assert", "async_hooks", "buffer", "child_process", "cluster", "crypto", "dgram", "dns", "domain", "events", "fs", "http", "http2", "https", "net", "os", "path", "perf_hooks", "punycode", "querystring", "readline", "repl", "stream", "string_decoder", "tls", "tty", "url", "util", "v8", "vm", "zlib"];
  var length = lazyModules.length;

  if (vm_HAS_INSPECTOR) {
    lazyModules.push("inspector");
  }

  if (vm_FLAGS.experimentalWorker) {
    lazyModules.push("worker_threads");
  }

  if (lazyModules.length !== length) {
    lazyModules.sort();
  }

  return function addBuiltinModules(context) {
    var req = entry.require;
    exposeObject(context, "console", req("console"));
    exposeObject(context, "process", req("process"));

    var _loop = function (name) {
      var set = to_external_function(function (value) {
        Reflect.defineProperty(this, name, {
          configurable: true,
          value,
          writable: true
        });
      });
      Reflect.defineProperty(context, name, {
        configurable: true,
        get: to_external_function(function () {
          // Prevent re-entering the getter by triggering the setter to convert
          // `context[name]` from an accessor property to a data property.
          this[name] = void 0;
          var exported = req(name);
          Reflect.defineProperty(this, name, {
            configurable: true,
            get: function () {
              return exported;
            },
            set
          });
          return exported;
        }),
        set
      });
    };

    for (var _i = 0, _length = lazyModules == null ? 0 : lazyModules.length; _i < _length; _i++) {
      var name = lazyModules[_i];

      _loop(name);
    }
  };
}

function exposeObject(context, name, value) {
  "use strict";

  // Objects exposed on the global object must have the property attributes
  // { [[Configurable]]: true, [[Enumerable]]: false, [[Writable]]: true }.
  // https://heycam.github.io/webidl/#es-namespaces
  Reflect.defineProperty(context, name, {
    configurable: true,
    value,
    writable: true
  });
}

function tryWrapper(func, args, content) {
  "use strict";

  var error;

  try {
    return Reflect.apply(func, this, args);
  } catch (e) {
    error = e;
  }

  if (!src_loader.state.package.default.options.debug && is_stack_trace_maskable(error)) {
    mask_stack_trace(error, {
      content
    });
  } else {
    to_external_error(error);
  }

  throw error;
}

/* harmony default export */ var hook_vm = (vm_hook);
// CONCATENATED MODULE: ./src/index.js
































var src_CHECK = constant_env.CHECK,
    CLI = constant_env.CLI,
    src_EVAL = constant_env.EVAL,
    src_INTERNAL = constant_env.INTERNAL,
    PRELOADED = constant_env.PRELOADED,
    src_REPL = constant_env.REPL,
    src_YARN_PNP = constant_env.YARN_PNP;
var src_ERR_INVALID_ARG_TYPE = src_errors.ERR_INVALID_ARG_TYPE;
var safeGlobal = src_shared.safeGlobal,
    src_unsafeGlobal = src_shared.unsafeGlobal;
var src_exported;

if (src_shared.inited && !src_shared.reloaded) {
  function_prototype_to_string.enable(src_unsafeGlobal);
  process_binding_util_get_proxy_details.enable(src_unsafeGlobal);

  src_exported = function (mod, options) {
    "use strict";

    if (!is_object(mod)) {
      throw new src_ERR_INVALID_ARG_TYPE("module", "object");
    }

    var cacheKey;

    if (options === void 0) {
      var pkg = src_package.from(mod);

      if (pkg !== null) {
        cacheKey = JSON.stringify(pkg.options);
      }
    } else {
      options = src_package.createOptions(options);
      cacheKey = JSON.stringify({
        name: get_module_name(mod),
        options
      });
    }

    if (cacheKey !== void 0) {
      src_loader.init(cacheKey);
    }

    if (options !== void 0) {
      // Resolve the package configuration with forced `options` and cache
      // in `Loader.state.package.cache` after `Loader.state` is initialized.
      src_package.from(mod, options);
    }

    hook_module(src_module, mod);

    if (!is_installed(mod)) {
      hook_process(process);
    }

    if (src_YARN_PNP) {
      hook_pnp(src_pnp);
    }

    return hook_require(mod);
  };
} else {
  src_exported = src_shared;
  src_exported.inited = true;
  src_exported.reloaded = false;
  function_prototype_to_string.enable(safeGlobal);
  process_binding_util_get_proxy_details.enable(safeGlobal);
  function_prototype_to_string.enable(src_unsafeGlobal);
  process_binding_util_get_proxy_details.enable(src_unsafeGlobal);

  if (src_CHECK) {
    hook_vm(real_vm);
  } else if (src_EVAL || src_REPL) {
    hook_module(src_module);
    hook_process(process);
    hook_vm(real_vm);
  } else if (CLI || src_INTERNAL || is_sideloaded()) {
    hook_module(real_module);
    main(real_module);
    hook_process(process);
  }

  if (src_INTERNAL) {
    hook_global(src_unsafeGlobal);
  }

  if (PRELOADED && src_YARN_PNP) {
    hook_pnp(src_pnp);
  }
}

/* harmony default export */ var src = __webpack_exports__["default"] = (src_exported);

/***/ })

/******/ })["default"];