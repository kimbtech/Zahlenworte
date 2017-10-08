function  transformGerman( num ) {
	return transformGermanPolish( num, 'de' );
}
function  transformPolish( num ) {
	return transformGermanPolish( num, 'pl' );
}

function  transformGermanPolish( num, lang ) {

	function getUtils() {
		var exports = {};
		
		exports.withOverrides = function (overrides, algo, val) {
		  if (overrides[val]) {
		    return overrides[val];
		  }
		  return algo(val);
		};
		
		exports.firstPropFrom = function (object, i) {
		  for (;; ++i) {
		    if (object.hasOwnProperty(i)) {
		      return object[i];
		    }
		  }
		};
		
		exports.splitHandle = function (opts, val) {
		  var pos = val.length - opts.cutOffLowest;
		  var handleHigherPart = opts.handleHigherPart || opts.handleParts;
		  var handleLowerPart = opts.handleLowerPart || opts.handleParts;
		  return opts.join(handleHigherPart(val.substr(0, pos)),
		    handleLowerPart(val.substr(pos)));
		};
		
		return exports;
	}
	
	function getParticles() {
		var exports = {};
		
		function Particle(particle) {
		  if (!(this instanceof Particle)) {
		    return new Particle(particle);
		  }
		  Object.defineProperty(this, 'id', { value: particle });
		}
		
		Particle.prototype = {
		  toString: function () {
		    return this.id;
		  },
		  toSource: function () {
		    return 'P("' + this.id + '")';
		  }
		};
		
		Particle.addMod = function (name, toStringGenerator) {
		  Particle.prototype[name] = function (/* ... */) {
		    var superToString = this.toString;
		    var newP = Object.create(this);
		    var toString = toStringGenerator.apply(newP, arguments);
		    Object.defineProperty(newP, 'toString', { value: function (after, before) {
		      if (arguments.length === 0) {
		        return Particle.prototype.toString.apply(this);
		      }
		      var _ret = toString.apply(this, arguments);
		      return (typeof _ret !== 'undefined') ? _ret : superToString.apply(this, arguments);
		    }});
		    return newP;
		  };
		};
		
		function contextMatches(where, when, after, before) {
		  var val = {
		    before: after,
		    after: before
		  }[where];
		  return (when === (val || '') || (when === '*' && typeof val !== 'undefined'));
		}
		
		Particle.addMod('mutates', function (mutatesWhere, mutatesWhen, mutatesTo) {
		  return function (after, before) {
		    if (contextMatches(mutatesWhere, mutatesWhen, after, before)) {
		      return mutatesTo;
		    }
		  };
		});
		
		Particle.addMod('looses', function (loosesWhere, loosesWhen, loosesHowMuch) {
		  var oldToString = this.toString;
		  return function (after, before) {
		    var v;
		    if (contextMatches(loosesWhere, loosesWhen, after, before)) {
		      v = oldToString.apply(this, arguments);
		      return v.substr(0, v.length - loosesHowMuch);
		    }
		  };
		});
		
		Particle.addMod('asSuffix', function () {
		  return function (after, before) {
		    if (!before) return '';
		  };
		});
		
		Particle.addMod('asPrefix', function () {
		  return function (after, before) {
		    if (!after) return '';
		  };
		});
		
		Particle.addMod('asJoiner', function () {
		  return function (after, before) {
		    if (!after || !before) return '';
		  };
		});
		
		Particle.addMod('hides', function (hidesWhere, hidesWhen) {
		  return function (after, before) {
		    if (contextMatches(hidesWhere, hidesWhen, after, before)) {
		      return '';
		    }
		  };
		});
		
		function psToSource(ps) {
		  return ps.map(function (p) {
		    return p.toSource ? p.toSource() : ('String("' + String(p) + '")');
		  }).join(', ');
		}
		
		function conditionalToString(p, k, ps) {
		  return p && p.toString(ps[k+1] && String(ps[k+1]), ps[k-1] && String(ps[k-1]));
		}
		
		function Particles(ps) {
		  if (arguments.length > 1) {
		    ps = Array.prototype.slice.call(arguments);
		  }
		  if (!(this instanceof Particles)) {
		    return new Particles(ps);
		  }
		
		  this.toString = function () {
		    if (typeof this._string === 'undefined') {
		      this._string = ps.filter(conditionalToString)
		        .map(conditionalToString)
		        .join('');
		    }
		    return this._string;
		  };
		
		  this.toSource = function () {
		    return 'Ps([' + psToSource(ps) + '])';
		  };
		}
		
		function Words(ps) {
		  if (arguments.length > 1) {
		    ps = Array.prototype.slice.call(arguments);
		  }
		  if (!(this instanceof Words)) {
		    return new Words(ps);
		  }
		
		  this.toString = function () {
		    if (typeof this._string === 'undefined') {
		      this._string = ps.filter(conditionalToString)
		        .map(conditionalToString)
		        .join(' ');
		    }
		    return this._string;
		  };
		
		  this.toSource = function () {
		    return 'Ws([' + psToSource(ps) + '])';
		  };
		}
		
		exports.Particles = Particles;
		exports.Particle = Particle;
		exports.Words = Words;

		
		return exports;
	}

	var utils = getUtils();
	var particles = getParticles();
	
	if( lang == 'de' ){
		var P = particles.Particle;
		var Particles = particles.Particles;
		
		var lessThanHundred = (function () {
		  var atoms = {
		     0: P('null').hides('after', '*').hides('before', '*'),
		     2: P('zwei').mutates('before', 'zig', 'zwan'),
		     3: 'drei',
		     4: 'vier',
		     5: 'fünf',
		     6: P('sechs').looses('before', 'zehn', 1).looses('before', 'zig', 1),
		     7: P('sieben').looses('before', 'zehn', 2).looses('before', 'zig', 2),
		     8: 'acht',
		     9: 'neun',
		    11: 'elf',
		    12: 'zwölf'
		  };
		  var atomsByGender = {
		    f: Object.create(atoms),
		    m: Object.create(atoms)
		  };
		  atomsByGender.f['1'] = P('eine').mutates('before', 'zig', 'ze');
		  atomsByGender.m['1'] = P('eins').looses('before', '*', 1)
		    .mutates('before', 'zig', 'ze');
		
		  var tenUnd = P('und').hides('before', 'zehn').asJoiner();
		  var tenZig = P('zig').asSuffix()
		    .mutates('after', 'drei', 'ßig')
		    .mutates('after', 'eine', 'hn')
		    .mutates('after', 'eins', 'hn');
		
		  return function (val, params) {
		    return utils.withOverrides(atomsByGender[params.gender], function (val) {
		      return utils.splitHandle({
		        cutOffLowest: 1,
		        join: function (ten, single) {
		          return Particles(single, tenUnd, Particles(ten, tenZig));
		        },
		        handleParts: function (val) { return _inWords(val, params); }
		      }, val);
		    }, val);
		  };
		}());
		
		var medium = function (joiner, pos) {
		  joiner = P(joiner).asSuffix();
		  return function (val, params) {
		    return utils.splitHandle({
		      cutOffLowest: pos,
		      join: function (higher, lower) {
		        return Particles(higher, joiner, lower);
		      },
		      handleHigherPart: function (val) {
		        return _inWords(val, {});
		      },
		      handleLowerPart: function (val) {
		        return _inWords(val, params);
		      }
		    }, val);
		  };
		};
		
		var biggie = function (nounP, cutOff) {
		  var biggieSpace = P(' ').asPrefix();
		  nounP = nounP.asSuffix();
		  return function (val, params) {
		    return utils.splitHandle({
		      cutOffLowest: cutOff,
		      join: function (higher, lower) {
		        higher = String(higher);
		        var res = [];
		        // The big nouns need to know if they come after 'eine', so we split it off
		        if (higher.substr(-4) === 'eine') {
		          res = res.concat([ higher.substr(0, higher.length - 4), 'eine' ]);
		        } else {
		          res.push(higher);
		        }
		        res = res.concat([ nounP, biggieSpace, lower ]);
		        return Particles(res);
		      },
		      handleHigherPart: function (val) {
		        return _inWords(val, {gender: 'f'});
		      },
		      handleLowerPart: function (val) {
		        return _inWords(val, params);
		      }
		    }, val);
		  };
		};
		
		// FIXME: Bigger numbers
		var handlers = (function () {
		  var h = [
		    {d: 2, h: lessThanHundred},
		    {d: 3, h: medium.bind(null, 'hundert')},
		    {d: 6, h: medium.bind(null, 'tausend')},
		    {d: 9, h: biggie.bind(null, P(' Millionen').looses('after', 'eine', 2))},
		    {d: 12, h: biggie.bind(null, P(' Milliarden').looses('after', 'eine', 1))},
		    {d: 15, h: biggie.bind(null, P(' Billionen').looses('after', 'eine', 2))},
		    {d: 18, h: biggie.bind(null, P(' Billiarden').looses('after', 'eine', 1))},
		    {d: 21, h: biggie.bind(null, P(' Trillionen').looses('after', 'eine', 2))},
		    {d: 24, h: biggie.bind(null, P(' Trilliarden').looses('after', 'eine', 1))},
		    {d: 27, h: biggie.bind(null, P(' Quadrillionen').looses('after', 'eine', 2))},
		    {d: 30, h: biggie.bind(null, P(' Quadrilliarden').looses('after', 'eine', 1))},
		  ];
		  var handlers = {
		    max: h[h.length - 1].d
		  };
		  for (var i = 0; i < h.length; ++i) {
		    handlers[h[i].d] = i > 0 ? h[i].h(h[i-1].d) : h[i].h;
		  }
		  return handlers;
		}());
		
		function _inWords(val, params) {
		  params.gender = params.gender || 'm';
		  return utils.firstPropFrom(handlers, val.length)(val, params);
		}
		
		function inWords(val, params) {
		  val = String(val);
		  if (val.length > inWords.max) {
		    throw new Error('too big');
		  }
		  return String(_inWords(val, params || {}));
		}
		inWords.max = handlers.max;

		return inWords( num );
	}
	else if( lang == 'pl' ){
		/*
		 * Based on  https://github.com/exu/slownie.js
		 */
		
		var P = particles.Particle;
		var Particles = particles.Particles;
		
		var joinSpace = P(' ').asJoiner();
		
		var lessThanHundred = (function () {
		  var atoms = {
		     0: P('zero').hides('after', '*').hides('before', '*'),
		     1: P('jeden').mutates('before', 'dziesiąt', 'na') // FIXME joining thing
		      .mutates('before', 'naście', 'jede'),
		     2: P('dwa').mutates('before', 'set', 'dwie'),
		     3: 'trzy',
		     4: P('cztery').mutates('before', 'naście', 'czter')
		      .mutates('before', 'dziesiąt', 'czter'),
		     5: P('pięć').mutates('before', 'naście', 'pięt'),
		     6: P('sześć').mutates('before', 'naście', 'szes'),
		     7: 'siedem',
		     8: 'osiem',
		     9: P('dziewięć').mutates('before', 'naście', 'dziewięt'),
		    10: 'dziesięć'
		  };
		
		  var tenDziesiat = P('dziesiąt').asSuffix()
		    .mutates('after', 'jeden', 'ście')
		    .mutates('after', 'dwa', 'dzieścia')
		    .mutates('after', 'trzy', 'dzieści')
		    .mutates('after', 'cztery', 'dzieści');
		
		  var buildLessThanHundred = function (v) {
		    return utils.splitHandle({
		      cutOffLowest: 1,
		      join: function (ten, single) {
		        var tenPs = Particles(ten, tenDziesiat);
		        return Particles(v < 20 ? [single, tenPs] : [tenPs, joinSpace, single]);
		      },
		      handleParts: _inWords
		    }, v);
		  };
		  return utils.withOverrides.bind(null, atoms, buildLessThanHundred);
		}());
		
		var createBiggie = (function () {
		  var JEDEN_SOLO = 'JEDENSOLO';
		
		  return function (pos, opts) {
		    var joiner;
		
		    if (typeof opts === 'string') {
		      opts = {
		        jeden: opts,
		        other: ' ' + opts + 'ów',
		
		        'dwa': ' ' + opts + 'y',
		        'trzy': ' ' + opts + 'y',
		        'cztery': ' ' + opts + 'y'
		      };
		    }
		
		    joiner = P(opts.other).mutates('after', JEDEN_SOLO, opts.jeden);
		    joiner = [ 'dwa', 'trzy', 'cztery' ].reduce(function (p, otherP) {
		      return p.mutates('after', otherP, opts[otherP]);
		    }, joiner);
		
		    return function (val) {
		      return utils.splitHandle({
		        cutOffLowest: pos,
		        join: function (higher, lower) {
		          // jeden is left out if it is the only number before the biggie
		          if (String(higher).match(/^\s*jeden\s*$/)) {
		            return Particles(joiner.toString(' ', JEDEN_SOLO), joinSpace, lower);
		          }
		
		          // This has been really difficult because 1000 (tysięcy) needs to react
		          // on the previous particle but also has to check on the total
		          // higher particles, since it is a suffix.
		
		          // FIXME: Will fail pretty soon on JS’ Unicode RegExp issues wrt \b
		          if (higher instanceof Particles) {
		            higher = String(higher).split(/\b/);
		          } else {
		            higher = [ higher ];
		          }
		          return Particles(higher.concat([joiner.asSuffix(), joinSpace, lower]));
		        },
		        handleParts: _inWords
		      }, val);
		    };
		  };
		}());
		
		var handlers = (function () {
		  var h = [
		    {d: 2, h: lessThanHundred},
		    {d: 3, h: {
		      jeden: 'sto',
		      other: 'set',
		
		      'dwa': 'ście',
		      'trzy': 'sta',
		      'cztery': 'sta'
		    }},
		    {d: 6, h: {
		      jeden: 'tysiąc',
		      other: ' tysięcy',
		
		      'dwa': ' tysiące',
		      'trzy': ' tysiące',
		      'cztery': ' tysiące'
		    }},
		  ];
		  var n = 6;
		  [ 'milion', 'miliard', 'bilion', 'biliard', 'trylion', 'tryliard',
		    'kwadrylion' ].forEach(function (p) {
		    h.push({d: n+=3, h: p});
		  });
		  var handlers = {
		    max: h[h.length - 1].d
		  };
		  for (var i = 0; i < h.length; ++i) {
		    if (typeof h[i].h !== 'function') {
		       h[i].h = createBiggie(h[i-1].d, h[i].h);
		    }
		    handlers[h[i].d] = h[i].h;
		  }
		  return handlers;
		}());
		
		function _inWords(val) {
		  return utils.firstPropFrom(handlers, val.length)(val);
		}
		
		function inWords(val) {
		  val = String(val);
		  if (val.length > inWords.max) {
		    throw new Error('too big');
		  }
		  // FIXME: Should not be here
		  return String(_inWords(val)).replace(/^\s+/, '').replace(/ {2}/g, ' ');
		}
		inWords.max = handlers.max;
		
		return inWords( num );
	}
	else{
		throw new Error( 'Unknown Language' );
	}
}