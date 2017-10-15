function transformRussian( num ){

/*
 * Copyright 2013 Valentyn Kolesnikov
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 /*
  * Changes by KIMB-technologies, only the number will be transfered to russian word.
  * (a bit dirty, just deleted parts of the code)
  */

var currencyList =
{
  "CurrencyList": {
    "RUS": {
      "item": [
        {
          "-value": "0",
          "-text": "ноль"
        },
        {
          "-value": "1000_10",
          "-text": "тысяч,миллионов,миллиардов,триллионов"
        },
        {
          "-value": "1000_1",
          "-text": "тысяча,миллион,миллиард,триллион"
        },
        {
          "-value": "1000_234",
          "-text": "тысячи,миллиона,миллиарда,триллиона"
        },
        {
          "-value": "1000_5",
          "-text": "тысяч,миллионов,миллиардов,триллионов"
        },
        {
          "-value": "10_19",
          "-text": "десять,одиннадцать,двенадцать,тринадцать,четырнадцать,пятнадцать,шестнадцать,семнадцать,восемнадцать,девятнадцать"
        },
        {
          "-value": "1",
          "-text": "одна,один,один,одна"
        },
        {
          "-value": "2",
          "-text": "две,два,два,две"
        },
        {
          "-value": "3_9",
          "-text": "три,четыре,пять,шесть,семь,восемь,девять"
        },
        {
          "-value": "100_900",
          "-text": "сто ,двести ,триста ,четыреста ,пятьсот ,шестьсот ,семьсот ,восемьсот ,девятьсот "
        },
        {
          "-value": "20_90",
          "-text": "двадцать ,тридцать ,сорок ,пятьдесят ,шестьдесят ,семьдесят ,восемьдесят ,девяносто "
        },
        {
          "-value": "pdv",
          "-text": "в т.ч. НДС "
        },
        {
          "-value": "pdv_value",
          "-text": "18"
        }
      ]
	},
    "RUR": [
      {
        "-CurrID": "810",
        "-CurrName": "Российские рубли",
        "-language": "RUS",
        "-RubOneUnit": "",
        "-RubTwoUnit": "",
        "-RubFiveUnit": "",
        "-RubSex": "M",
        "-RubShortUnit": "",
        "-KopOneUnit": "",
        "-KopTwoUnit": "",
        "-KopFiveUnit": "",
        "-KopSex": ""
      }
    ]
  }
};

/**
 * Converts numbers to symbols.
 *
 * @author Valentyn V Kolesnikov
 * @version $Revision$ $Date$
*/

    /** Currency. */
var Currency = (function () {
    function Currency() {
    }
    Currency.UAH = 'UAH';

    Currency.RUR = 'RUR';

    Currency.USD = 'USD';

    Currency.PER10 = 'PER10';

    Currency.PER100 = 'PER100';

    Currency.PER1000 = 'PER1000';

    Currency.PER10000 = 'PER10000';
    return Currency;
})();

    /** Language. */
var Language = (function () {
    function Language() {
    }
    Language.RUS = 'RUS';

    Language.UKR = 'UKR';

    Language.ENG = 'ENG';
    return Language;
})();

    /** Pennies. */
var Pennies = (function () {
    function Pennies() {
    }
    Pennies.NUMBER = 'NUMBER';

    Pennies.TEXT = 'TEXT';
    return Pennies;
})();

var StringBuilder = (function () {
    function StringBuilder() {
        this._buffer = [];
    }
    StringBuilder.prototype.append = function (text) {
        this._buffer[this._buffer.length] = text;
        return this;
    };

    StringBuilder.prototype.insert = function (index, text) {
        this._buffer.splice(index, 0, text);
        return this;
    };

    StringBuilder.prototype.length = function () {
        return this.toString().length;
    };

    StringBuilder.prototype.deleteCharAt = function (index) {
        var str = this.toString();
        this._buffer = [];
        this.append(str.substring(0, index));
        return this;
    };

    StringBuilder.prototype.toString = function () {
        return this._buffer.join("");
    };
    return StringBuilder;
})();

var MoneyToStr = (function () {
    MoneyToStr.NUM0 = 0;
    MoneyToStr.NUM1 = 1;
    MoneyToStr.NUM2 = 2;
    MoneyToStr.NUM3 = 3;
    MoneyToStr.NUM4 = 4;
    MoneyToStr.NUM5 = 5;
    MoneyToStr.NUM6 = 6;
    MoneyToStr.NUM7 = 7;
    MoneyToStr.NUM8 = 8;
    MoneyToStr.NUM9 = 9;
    MoneyToStr.NUM10 = 10;
    MoneyToStr.NUM11 = 11;
    MoneyToStr.NUM12 = 12;
    MoneyToStr.NUM100 = 100;
    MoneyToStr.NUM1000 = 1000;
    MoneyToStr.NUM10000 = 10000;
    MoneyToStr.INDEX_0 = 0;
    MoneyToStr.INDEX_1 = 1;
    MoneyToStr.INDEX_2 = 2;
    MoneyToStr.INDEX_3 = 3;

    MoneyToStr.percentToStr = function (amount, lang) {
        if (amount == null) {
            throw new Error("amount is null");
        }
        if (lang == null) {
            throw new Error("Language is null");
        }
        var intPart = parseInt(amount);
        var fractPart = 0;
        var result;
        if (amount == parseInt(amount)) {
            result = new MoneyToStr(Currency.PER10, lang, Pennies.TEXT).convert(amount, 0);
        } else if ((amount * MoneyToStr.NUM10).toFixed(4) == parseInt(amount * MoneyToStr.NUM10)) {
            fractPart = Math.round((amount - intPart) * MoneyToStr.NUM10);
            result = new MoneyToStr(Currency.PER10, lang, Pennies.TEXT).convert(intPart, fractPart);
        } else if ((amount * MoneyToStr.NUM100).toFixed(4) == parseInt(amount * MoneyToStr.NUM100)) {
            fractPart = Math.round((amount - intPart) * MoneyToStr.NUM100);
            result = new MoneyToStr(Currency.PER100, lang, Pennies.TEXT).convert(intPart, fractPart);
        } else if ((amount * MoneyToStr.NUM1000).toFixed(4) == parseInt(amount * MoneyToStr.NUM1000)) {
            fractPart = Math.round((amount - intPart) * MoneyToStr.NUM1000);
            result = new MoneyToStr(Currency.PER1000, lang, Pennies.TEXT).convert(intPart, fractPart);
        } else {
            fractPart = Math.round((amount - intPart) * MoneyToStr.NUM10000);
            result = new MoneyToStr(Currency.PER10000, lang, Pennies.TEXT).convert(intPart, fractPart);
        }
        return result;
    }

    function MoneyToStr(currency, language, pennies) {
        this.currency = currency;
        this.language = language;
        this.pennies = pennies;
        var languageElement = language;
        var items = currencyList['CurrencyList'][languageElement]['item'];
        this.messages = {};
        for (var index in items) {
            var languageItem = items[index];
            if (languageItem["-text"]) {
                this.messages[languageItem["-value"]] = languageItem["-text"].split(",");
            }
        }
        var currencyItem = currencyList['CurrencyList'][currency]
        var theISOElement = null;
        for (var index in currencyItem) {
            if (currencyItem[index]["-language"] == language) {
                theISOElement = currencyItem[index];
                break;
            }
        }
        if (theISOElement == null) {
            throw new Error("Currency not found " + currency);
        }
        this.rubOneUnit = theISOElement["-RubOneUnit"];
        this.rubTwoUnit = theISOElement["-RubTwoUnit"];
        this.rubFiveUnit = theISOElement["-RubFiveUnit"];
        this.kopOneUnit = theISOElement["-KopOneUnit"];
        this.kopTwoUnit = theISOElement["-KopTwoUnit"];
        this.kopFiveUnit = theISOElement["-KopFiveUnit"];
        this.rubSex = theISOElement["-RubSex"];
        this.kopSex = theISOElement["-KopSex"];
    }

    /**
     * Converts double value to the text description.
     *
     * @param theMoney
     *            the amount of money in format major.minor
     * @return the string description of money value
     */
    MoneyToStr.prototype.convertValue = function (theMoney) {
        if (typeof theMoney === undefined || theMoney == null) {
            throw new Error("theMoney is null");
        }
        var intPart = parseInt(theMoney);
        var fractPart = Math.round((theMoney - intPart) * MoneyToStr.NUM100);
        if (this.currency == Currency.PER1000) {
            fractPart = Math.round((theMoney - intPart) * MoneyToStr.NUM1000);
        }
        return this.convert(intPart, fractPart);
    }

    /**
     * Converts number to currency. Usage: MoneyToStr moneyToStr = new MoneyToStr("UAH"); String result =
     * moneyToStr.convert(123D); Expected: result = сто двадцять три гривні 00 копійок
     *
     * @param theMoney
     *            the amount of money major currency
     * @param theKopeiki
     *            the amount of money minor currency
     * @return the string description of money value
     */
    MoneyToStr.prototype.convert = function (theMoney) {
        if (typeof theMoney === undefined || theMoney == null) {
            throw new Error("theMoney is null");
        }
        var money2str = new StringBuilder();
        var triadNum = 0;
        var theTriad = 0;
        var intPart = theMoney;
        if (intPart == 0) {
            money2str.append(this.messages["0"][0] + " ");
        }
        do {
            theTriad = parseInt(intPart % MoneyToStr.NUM1000);
            money2str.insert(0, this.triad2Word(theTriad, triadNum, this.rubSex));
            if (triadNum == 0) {
                var range10 = parseInt((theTriad % MoneyToStr.NUM100) / MoneyToStr.NUM10);
                var range = parseInt(theTriad % MoneyToStr.NUM10);
                if (range10 == MoneyToStr.NUM1) {
                    money2str.append(this.rubFiveUnit);
                } else {
                    switch (range) {
                    case MoneyToStr.NUM1:
                        money2str.append(this.rubOneUnit);
                        break;
                    case MoneyToStr.NUM2:
                    case MoneyToStr.NUM3:
                    case MoneyToStr.NUM4:
                        money2str.append(this.rubTwoUnit);
                        break;
                    default:
                        money2str.append(this.rubFiveUnit);
                        break;
                    }
                }
            }
            intPart = parseInt(intPart / MoneyToStr.NUM1000);
            triadNum++;
        } while (intPart > 0);

        return money2str.toString().trim();
    }

    MoneyToStr.prototype.triad2Word = function (triad, triadNum, sex) {
        var triadWord = new StringBuilder();

        if (triad == 0) {
            return "";
        }

        var range = this.check1(triad, triadWord);
        if (this.language == Language.ENG && triadWord.length() > 0 && triad % MoneyToStr.NUM10 == 0) {
            triadWord.deleteCharAt(triadWord.length() - 1);
            triadWord.append(" ");
        }

        var range10 = range;
        range = parseInt(triad % MoneyToStr.NUM10);
        this.check2(triadNum, sex, triadWord, triad, range10);
        switch (triadNum) {
        case MoneyToStr.NUM0:
            break;
        case MoneyToStr.NUM1:
        case MoneyToStr.NUM2:
        case MoneyToStr.NUM3:
        case MoneyToStr.NUM4:
            if (range10 == MoneyToStr.NUM1) {
                triadWord.append(this.messages["1000_10"][triadNum - 1] + " ");
            } else {
                switch (range) {
                case MoneyToStr.NUM1:
                    triadWord.append(this.messages["1000_1"][triadNum - 1] + " ");
                    break;
                case MoneyToStr.NUM2:
                case MoneyToStr.NUM3:
                case MoneyToStr.NUM4:
                    triadWord.append(this.messages["1000_234"][triadNum - 1] + " ");
                    break;
                default:
                    triadWord.append(this.messages["1000_5"][triadNum - 1] + " ");
                    break;
                }
            }
            break;
        default:
            triadWord.append("??? ");
            break;
        }
        return triadWord.toString();
    }

    /**
     * @param triadNum the triad num
     * @param sex the sex
     * @param triadWord the triad word
     * @param triad the triad
     * @param range10 the range 10
     */
    MoneyToStr.prototype.check2 = function (triadNum, sex, triadWord, triad, range10) {
        var range = parseInt(triad % MoneyToStr.NUM10);
        if (range10 == 1) {
            triadWord.append(this.messages["10_19"][range] + " ");
        } else {
            switch (range) {
            case MoneyToStr.NUM1:
                if (triadNum == MoneyToStr.NUM1) {
                    triadWord.append(this.messages["1"][MoneyToStr.INDEX_0] + " ");
                } else if (triadNum == MoneyToStr.NUM2 || triadNum == MoneyToStr.NUM3 || triadNum == MoneyToStr.NUM4) {
                    triadWord.append(this.messages["1"][MoneyToStr.INDEX_1] + " ");
                } else if ("M" == sex) {
                    triadWord.append(this.messages["1"][MoneyToStr.INDEX_2] + " ");
                } else if ("F" == sex) {
                    triadWord.append(this.messages["1"][MoneyToStr.INDEX_3] + " ");
                }
                break;
            case MoneyToStr.NUM2:
                if (triadNum == MoneyToStr.NUM1) {
                    triadWord.append(this.messages["2"][MoneyToStr.INDEX_0] + " ");
                } else if (triadNum == MoneyToStr.NUM2 || triadNum == MoneyToStr.NUM3 || triadNum == MoneyToStr.NUM4) {
                    triadWord.append(this.messages["2"][MoneyToStr.INDEX_1] + " ");
                } else if ("M" == sex) {
                    triadWord.append(this.messages["2"][MoneyToStr.INDEX_2] + " ");
                } else if ("F" == sex) {
                    triadWord.append(this.messages["2"][MoneyToStr.INDEX_3] + " ");
                }
                break;
            case MoneyToStr.NUM3:
            case MoneyToStr.NUM4:
            case MoneyToStr.NUM5:
            case MoneyToStr.NUM6:
            case MoneyToStr.NUM7:
            case MoneyToStr.NUM8:
            case MoneyToStr.NUM9:
                triadWord.append(["", "", ""].concat(this.messages["3_9"])[range] + " ");
                break;
            default:
                break;
            }
        }
    }

    /**
     * @param triad the triad
     * @param triadWord the triad word
     * @return the range
     */
    MoneyToStr.prototype.check1 = function (triad, triadWord) {
        var range = parseInt(triad / MoneyToStr.NUM100);
        triadWord.append([""].concat(this.messages["100_900"])[range]);

        range = parseInt((triad % MoneyToStr.NUM100) / MoneyToStr.NUM10);
        triadWord.append(["", ""].concat(this.messages["20_90"])[range]);
        return range;
    }
    return MoneyToStr;
})();

	return  new MoneyToStr(Currency.RUR, Language.RUS, Pennies.TEXT).convert(num);
}