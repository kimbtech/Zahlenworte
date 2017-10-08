function transformFrench(num) {
	return transformFrenchDanishDutch( num, 'fr' );
}
function transformDanish(num) {
	return transformFrenchDanishDutch( num, 'da' );
}
function transformDutch(num) {
	return transformFrenchDanishDutch( num, 'nl' );
}

function transformFrenchDanishDutch( num, lang ){

	// http://en.wiktionary.org/wiki/Appendix:French_numbers
	var france_ones = ['zéro', 'et-un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'once', 'douce', 'treize', 'quatorze', 'quinze', 'seize'];
	
	france_ones[71] = "soixante-et-onze";
	france_ones[72] = "soixante-douze";
	france_ones[73] = "soixante-treize";
	france_ones[74] = "soixante-quatorze";
	france_ones[75] = "soixante-quinze";
	france_ones[76] = "soixante-seize";
	france_ones[80] = 'quatre-vingts';
	france_ones[81] = 'quatre-vingt-un';
	france_ones[91] = 'quatre-vingt-onze';
	france_ones[92] = 'quatre-vingt-douze';
	france_ones[93] = 'quatre-vingt-treize';
	france_ones[94] = 'quatre-vingt-quatorze';
	france_ones[95] = 'quatre-vingt-quinze';
	france_ones[96] = 'quatre-vingt-seize';
	
	var langs = {
		da: {
			ones: ['nul', 'en', 'to', 'tre', 'fire', 'fem', 'seks', 'syv', 'otte', 'ni', 'ti', 'elleve', 'tolv', 'tretten', 'fjorten', 'femten', 'seksten', 'sytten', 'atten', 'nitten', 'tyve'],
			tens: ['', 'ti', 'toti', 'treti', 'firti', 'femti', 'seksti', 'syvti', 'otteti', 'niti'],
			groupNamesSingular: ['et', 'et hundrede', 'et tusind', 'en million', 'en milliard'],
			groupNamesPlural: ['', 'hundrede', 'tusind', 'millioner', 'milliarder'],
			groupSeparator: ' og ',
			space: ' '
		},
		fr: {
			ones: france_ones,
			tens: ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'],
			groupNamesSingular: ['un', 'cent', 'mille', 'un-million', 'un-milliard'],
			groupNamesPlural: ['', 'cent', 'mille', 'millions', 'milliards'],
			groupSeparator: '-',
			space: '-',
			postTransform: function(str){
				// when cent is at the end of the number, it takes an s, but when it's followed by another number, the s is dropped.
				str = str.replace(/-cent$/,'-cents');
				// fix 1
				str = str.replace(/^et-un$/,'un');
				return str;
			}
		}, 
		nl: {
			ones: ['nul', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf', 'twaalf', 'dertien', 'veertien', 'vijftien', 'zestien', 'zeventien', 'achttien', 'negentien'],
			tens: ['', 'tien', '+twintig', '+dertig', '+veertig', '+vijftig', '+zestig', '+zeventig', '+tachtig', '+negentig'],
			groupNamesSingular: ['een', 'honderd', 'duizend ', 'één miljoen ', 'één miljard '],
			groupNamesPlural: ['', 'honderd', 'duizend ', ' miljoen ', ' miljard '],
			groupSeparator: '',
			space: '',
			reverseOnes: true,
			postTransform: function(str){
				str = str.replace(/^\+/g,'');
				str = str.replace(/e\+/g,'eën');
				str = str.replace(/\+/g,'en');
				str = str.replace(/(^|\s)een(\s|$)/g, '$1één$2');
				return str;
			}
		}
	};


	function isNumber(obj) {
		return obj != null && !isNaN(obj) && toString.call(obj) == '[object Number]';
	}
	
	function trim(input, space) {
		if (space === '') {
			return input;
		}
	
		var trimmer = new RegExp('^' + space + '+|' + space + '+$', 'g');
		return input.replace(trimmer, '');
	}
	
	function group(amount) {
		var str = amount.toString();
		var powers = t.groupPowers || [0, 2, 3, 6, 9];
	
		var groups = [];
	
		for (var i = 0; i < powers.length; i++) {
			var from = i < powers.length - 1 ? -1 * powers[i + 1] : 0;
			var to = -1 * powers[i] || undefined;
			groups.push(str.slice(from, to));
		}
	
		return groups;
	}
	
	function amountToText(amount) {
		if (t.ones[amount]) {
			return t.ones[amount];
		}
		// this part is a bit iffy
		if (amount <= 99) {
			var str = amount.toString();
			var ret = t.tens[str[0]];
			if (str[1] !== '0') {
				ret = t.reverseOnes ? t.ones[str[1]] + t.space + ret :
					ret + t.space + t.ones[str[1]];
			}
			return trim(ret, t.space);
		}
	
		var groups = group(amount);
		var output = '';
		for (var i = 0; i < groups.length; i++) {
			var num = parseInt(groups[i], 10);
			if (num > 0) {
				var sep = output ? t.groupSeparator : '';
				var groupName = num > 1 ?
					amountToText(num) + t.space + t.groupNamesPlural[i] :
					t.groupNamesSingular[i];
				output =  groupName + sep + output;
			}
		}
		return trim(output, t.space);
	}
	
	function wrap(amount) {
		if (!isNumber(amount)) {
			throw new Error('Input is not a number');
		}
		amount = Math.floor(amount); // discard decimals
		var res = amountToText(amount);
		if (t.postTransform) {
			res = t.postTransform(res);
		}
		return res;
	}

	var t = langs[lang];
	return wrap(num);
}


