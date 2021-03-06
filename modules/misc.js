const config = require("../config.js").config;
const firebase = require('firebase');
const seedrandom = require('seedrandom');
var rng = seedrandom('added entropy.', { entropy: true });

var Species =
["Aleena", "Anx", "Aqualish", "Arcona", "Arkanian Offshoot", "Arkanian", "Barabel", "Bardottan", "Besalisk", "Bith", "Bothan", "Caamasi", "Cathar", "Cerean", "Chadra-Fan", "Chagrian", "Chevin", "Chiss", "Clawdite", "Corellian Human", "Dashade", "Defel", "Devaronian", "Drall", "Dressellian", "Droid", "Dug", "Duros", "Elom", "Elomin", "Ewok", "Falleen", "Farghul", "Gamorrean", "Gand", "Gank", "Givin", "Gossam", "Gotal", "Gran", "Gungan", "Herglic", "Human", "Hutt", "Iktotchi", "Ishi Tib", "Ithorian", "Jawa", "Kalleran", "Kel Dor", "Klatooinian", "Kubaz", "Kyuzo", "Lannik", "Lepi", "Mandalorian Human", "Mirialan", "Mon Calamari", "Mustafarian", "Muun", "Nagai", "Nautolan", "Neimoidian", "Nikto", "Noghri", "Ortolan", "Pantoran", "Pau'an", "Polis Massan", "Quarren", "Quermian", "Rodian", "Ryn", "Sakiyan", "Sathari", "Selkath", "Selonian", "Shistavanen", "Sluissi", "Snivvian", "Squib", "Sullustan", "Talz", "Thakwaash", "Togorian", "Togruta", "Toydarians", "Trandoshan", "Twi'lek", "Ubese", "Ugnaught", "Verpine", "Weequay", "Whiphid", "Wookiee", "Xexto", "Zabrak", "Zeltron", "Zygerrian"];

function gleepglop (message) {
  let roll = Math.floor(Math.random() * (Species.length))
  let gleepglop = Species[roll];
  message.reply("A wild " + gleepglop + " appears!")
}

function polyhedral(sides, str, message) {
  var total = 0;
  //no modifier
  if (str.length < 1) {
    console.log("No modifier, straight d100 roll");
      let r = dice(sides);
      total = +r;
      message.reply(" rolled a d" + sides + ": " + total);
  //addition modifier
  } else if (str.includes("+") || str[0][0] == "+") {
		console.log("+ modifier detected");
        var modifier = (str[str.length - 1]).replace(/\D/g, "");
        let r = dice(sides);
        total = +r + +modifier;
        message.reply(" rolled a d" + sides + ": " + r + " + " + modifier + " " + "for a total of " + total);
	//subtraction modifier
  } else if (str.includes("-") || str[0][0] == "-") {
    	console.log("- modifier detected");
        var modifier = (str[str.length - 1]).replace(/\D/g, "");
        let r = dice(sides);
        total = +r - +modifier;
        message.reply(" rolled a d" + sides + ": " + r + " - " + modifier + " " + "for a total of " + total);
    }
    return total;
}

function dice(sides) {
  let number = Math.floor(Math.random() * sides) + 1;
  return number;
}

function cryptoDice(sides) {
  let number = Math.floor(rng() * sides) + 1;
  return number;
}

module.exports = {
    gleepglop: gleepglop,
    olddice: dice,
    polyhedral: polyhedral,
    dice:cryptoDice
};
