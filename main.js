// Funktionen
//	Zufallszahl zwischen von und bis
function randomInt(min, max){
	return Math.round( Math.random() * (max-min) + min );
}

//Main Logic
//	Sprachen => Funktionen
//		je ein Parameter Zahl und Wort als Rückgabe
var langs = {
	"Deutsch" : transformGerman,
	"Englisch" : transformEnglish,
	"Französisch" : transformFrench,
	"Dänisch" : transformDanish,
	"Niederländisch" : transformDutch,
	"Polnisch" : transformPolish,
	"Russisch" : transformRussian
};
//	Stoppen wenn Wiederholungskette gefunden, statt wenn immer die gleiche Zahl/ Länge
var stopOnRepeat = false;

/**
 * Test für eine Zahl durchführen (maximal 1.000 Versuche)
 * @param {int} num Zu testende Zahl
 * @param {String} lang Zu nutzende Sprache (ein Key der langs Liste)
 * @param {function} ausgabe (optional) Callback zur Ausgabe
 *						Parameter Objekt { number Zahl, name Wort, lenght Länge }
 * @return Array mit Zahl die wiederkehrt [ Zahl, Wort, Anzahl, false ], false,
 *		bei stopOnRepeat == true, unter Key 3 Liste der Endlosfolge
 */
function testNumber( num, lang, ausgabe ) {
	// Endlosfolge aus Zahlen bis Wiederholung bestimmen
	function generateFolge(num, numLen ){
		//nur Parameter 1 beim Grundaufruf
		if( typeof numLen === "undefined" ){
			var numLen = num;
		}
		//rekursiv
		word = toWord( num );
		if( word.length != numLen ){
			return word + ',' + generateFolge( word.length, numLen );
		}
		else{
			return word;
		}
	}
	
	//Sprache mittels Funktion wählen
	var toWord = langs[lang];
	// fuer Schleife
	var word, numLenBef = null, numLen, numLenS = [];
	//maximal 1000 Versuche
	for (var i = 0; i < 1000; i++) {
		//zu Wort
		word = toWord( num );
		//Länge bestimmen
		numLen = word.length;
		// Ausgabe?
		if( typeof ausgabe === "function" ){
			//Callback
			ausgabe({ number : num, name: word, length : numLen });
		}
		//mit letztem vergleichen 
		if( numLen === numLenBef ){
			//wiederholend, also Erfolg
			return [ num, word, i, false ];
		}
		//schonmal diese Zahl/ Länge gehabt
		else if( stopOnRepeat && numLenS.indexOf( numLen ) !== -1 ){
			return [ num, word, i, generateFolge( numLen ) ];
		}
		//zur Liste der Längen hinzufügen
		numLenS.push( numLen );
		//aktuelle Länge jetzt des davor
		numLenBef = numLen;
		//naechste Nummer
		num = numLen;
	}
	//nach 1000 nichts gefunden
	return false;
}

// Interface
$( function () {
	//StopOnRepeat Checkbox Button
	$( "input#stopOnRepeat" ).click( function () {
		stopOnRepeat = !stopOnRepeat;
	});
	
	//Sprachen wählbar
	var options = '';
	$.each( langs, function (k, v) {
		options += '<option value="'+k+'">'+k+'</option>';
	});
	$( "select#einzelnSprache" ).append( options );
	$( "select#mehrfachSprache" ).append( options );
	$( "select#alleSprache" ).append( options );
	
	/*
		Einzeln
	*/
	$( "button#einzelnStart" ).click( function () {
		//Werte
		var number = $( "input#einzelnZahl" ).val();
		var lang = $( "select#einzelnSprache" ).val();
		
		// gefuellt?
		if( number != '' && lang != '' ){
			// zu Zahl
			number = parseInt( number );
		
			//rechnen und Ausgabe (Tabelle) mittels Callback
			var log = '<table><tr><th>Zahl</th><th>Wort</th><th>Wortlänge</th></tr>';
			var erg = testNumber( number, lang, function (val) {
				log += '<tr><td align="right">'+ val.number +'</td><td>'+ val.name +'</td><td align="right">'+ val.length +'</td></tr>';
			});
			if( erg !== false && erg[3] === false ){
				log += '<tr><td>&rarr;</td><td>'+ erg[1] +'</td><td align="right">'+ erg[0] +'</td></tr>';
			}
			else if( erg !== false && stopOnRepeat && erg[3] !== false ){
				log += '<tr><td>&rarr;</td><td>'+ erg[3] +'</td><td><b>Endlosfolge</b></td></tr>';
			}
			log += '</table>';
			if ( erg !== false) {
				log += 'Schritte: '+ erg[2];
			}
			$( "div#einzelnOutput" ).html( log );
		}
	});
	
	/*
		Mehrfach
	*/
	$( "button#mehrfachStart" ).click( function () {
		//Werte
		var von = $( "input#mehrfachVon" ).val();
		var bis = $( "input#mehrfachBis" ).val();
		var anzahl = $( "input#mehrfachAnzahl" ).val();
		var lang = $( "select#mehrfachSprache" ).val();
		
		// gefuellt?
		if( von != '' && bis != '' && anzahl != '' && lang != '' ){
			// zu Zahl
			von = parseInt( von );
			bis = parseInt( bis );
			anzahl = parseInt( anzahl );
			
			//Zahlen zufällig erstellen und testen
			var log = '<table><tr><th>Zahl</th><th colspan="2">Ergebnis</th><th>Schritte</th></tr>', erg, number;
			for (var i = 0; i < anzahl; i++) {
				number = randomInt( von, bis );
				erg = testNumber( number, lang);
				if( erg === false ){
					log += '<tr><td align="right">'+ number +'</td><td>-</td><td>-</td><td>-</td></tr>';
				}
				else {
					log += '<tr><td align="right">'+ number +'</td><td>&nbsp;&nbsp;&nbsp;&nbsp; '+ erg[0] +'</td><td>'+ erg[1] +'</td><td align="right">'+ erg[2] + ( stopOnRepeat && erg[3] !== false ? ' <b>Endlosfolge</b>' : '' ) +'</td></tr>';
				} 
			}
			
			log += '</table>';
			$( "div#mehrfachOutput" ).html( log );
		}
	});
	
	/*
		Alle
	*/
	$( "button#alleStart" ).click( function () {
		//Werte
		var von = $( "input#alleVon" ).val();
		var bis = $( "input#alleBis" ).val();
		var lang = $( "select#alleSprache" ).val();
		
		// gefuellt?
		if( von != '' && bis != '' && lang != '' ){
			// zu Zahl
			von = parseInt( von );
			bis = parseInt( bis );
			var error = false;
			
			//Zahlen zufällig erstellen und testen
			var log = '<table><tr><th>Zahl</th><th colspan="2">Ergebnis</th><th>Schritte</th></tr>', erg, number;
			for (var number = von; number <= bis; number++) {
				erg = testNumber( number, lang);
				if( erg === false ){
					log += '<tr><td align="right">'+ number +'</td><td>-</td><td>-</td><td>-</td></tr>';
					error = true;
				}
				else {
					log += '<tr><td align="right">'+ number +'</td><td>&nbsp;&nbsp;&nbsp;&nbsp; '+ erg[0] +'</td><td>'+ erg[1] +'</td><td align="right">'+ erg[2] + ( stopOnRepeat && erg[3] !== false ? ' <b>Endlosfolge</b>' : '' ) +'</td></tr>';
				} 
			}
			log += '</table>';
			if( error ){
				log = '<p><b style="color:red;">Nicht erfolgreich!</b></p>' + log;
			}
			else {
				log = '<p><b style="color:green;">Erfolgreich!</b></p>' + log;
			}
			$( "div#alleOutput" ).html( log );
		}
	});
});