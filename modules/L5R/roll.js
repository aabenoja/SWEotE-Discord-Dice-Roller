const config = require('../../config').config;
const printEmoji = require('../').print;
const writeData = require('../').writeData;
const readData = require('../').readData;
const dice = ['white', 'black', 'success', 'opportunity', 'strife', 'explosiveSuccess'];
const rollDice = require('../').dice;
const asyncForEach = require('../').asyncForEach;
const diceFaces = {
	black: ['', 's', 'st', 'et', 'o', 'ot'],
	white: ['', '', 's', 's', 'so', 'st', 'st', 'e', 'et', 'o', 'o', 'o'],
	success: ['s'],
	opportunity: ['o'],
	explosiveSuccess: ['e'],
	strife: ['t']
};

async function roll(params, message, bot, desc, channelEmoji, add) {
	new Promise(async resolve => {
		let diceResult = initDiceResult();
		if (add) diceResult.roll = {...diceResult.roll, ...await readData(bot, message, 'diceResult')};
		if (!params[0] || !params.length) {
			message.reply('No dice rolled.');
			return;
		}
		//process each identifier and set it into an array
		let diceOrder = await processType(params, message);
		if (!diceOrder) resolve();

		//rolls each die and begins rollResults
		await asyncForEach(diceOrder, color => diceResult.roll[color].push(diceFaces[color][rollDice(diceFaces[color].length)-1]));

		//counts the symbols rolled and returns them in diceResult.results
		countSymbols(diceResult, message, bot, desc, channelEmoji);
		writeData(bot, message, 'diceResult', diceResult.roll);
		resolve()
	}).catch(error => message.reply(`That's an Error! ${error}`));

}

async function keep(params, message, bot, desc, channelEmoji, reroll) {
	new Promise(async resolve => {
			let Object = {black: [], white: [], success: [], opportunity: [], strife: [], explosiveSuccess: []};
			let diceResult = initDiceResult(), keeperResults = initDiceResult();
			diceResult.roll = {...diceResult.roll, ...await readData(bot, message, 'diceResult')};
			if (!diceResult) resolve();
			if (params.length === 1) params = params[0].split('');

			params.forEach(target => {
				target = +target;
				let roll = diceResult.roll;
				switch (true) {
					case (roll.white.length >= target):
						Object.white.push(target);
						break;
					case (roll.black.length + roll.white.length >= target):
						Object.black.push(target - roll.black.length);
						break;
					case (roll.black.length + roll.white.length + roll.success.length >= target):
						Object.success.push(target - (roll.black.length + roll.white.length));
						break;
					case (roll.black.length + roll.white.length + roll.success.length + roll.opportunity.length >= target):
						Object.opportunity.push(target - (roll.black.length + roll.white.length + roll.success.length));
						break;
					case (roll.black.length + roll.white.length + roll.success.length + roll.opportunity.length + roll.strife.length >= target):
						Object.strife.push(target - (roll.black.length + roll.white.length + roll.success.length + roll.opportunity.length));
						break;
					case (roll.black.length + roll.white.length + roll.success.length + roll.opportunity.length + roll.strife.length + roll.explosiveSuccess.length >= target):
						Object.explosiveSuccess.push(target - (roll.black.length + roll.white.length + roll.success.length + roll.opportunity.length + roll.strife.length));
						break;
				}
			});

			if (reroll) keeperResults.roll = {...diceResult.roll};
			await asyncForEach(dice, color => {
				Object[color].forEach((die, index) => {
					if (reroll) keeperResults.roll[color].splice(index, 1, diceFaces[color][rollDice(diceFaces[color].length)-1]);
					else keeperResults.roll[color].push(diceResult.roll[color][die - 1]);
				})
			});
			countSymbols(keeperResults, message, bot, desc, channelEmoji);
			writeData(bot, message, 'diceResult', keeperResults.roll);
		}
	).catch(error => message.reply(`That's an Error! ${error}`));
}

//init diceResult
function initDiceResult() {
	return {
		roll: {
			white: [],
			black: [],
			success: [],
			opportunity: [],
			strife: [],
			explosiveSuccess: []
		},
		results: {
			face: '',
			success: 0,
			opportunity: 0,
			strife: 0,
			explosiveSuccess: {
				white: 0,
				black: 0,
			}
		}
	};
}

//processes the params and give an array of the type of dice to roll
function processType(params, message) {
	return new Promise(resolve => {
		let diceOrder = [], finalOrder = [];
		if (params[0].match(/\d+/g)) {
			for (let i = 0; i < params.length; i++) {
				let diceQty = params[i].replace(/\D/g, "");
				let color = params[i].replace(/\d/g, "");
				if (diceQty > config.maxRollsPerDie) {
					message.reply('Roll exceeds max roll per die limit of ' + config.maxRollsPerDie + ' . Please try again.');
					resolve(0);
				}
				for (let j = 0; j < diceQty; j++) diceOrder.push(color);
			}
		} else {
			params = params.join('');
			for (let i = 0; i < params.length; i++) diceOrder.push(params[i]);
		}

		diceOrder.forEach(die => {
			switch (die) {
				case 'black':
				case 'b':
				case 'blk':
				case 'ring':
				case 'r':
					finalOrder.push('black');
					break;
				case 'white':
				case 'w':
				case 'skill':
				case 's':
					finalOrder.push('white');
					break;
				case 'success':
				case 'suc':
				case '+':
					finalOrder.push('success');
					break;
				case 'strife':
				case 'str':
				case 't':
					finalOrder.push('strife');
					break;
				case 'opportunity':
				case 'o':
					finalOrder.push('opportunity');
					break;
				case 'explosiveSuccess':
				case 'e':
				case 'exp':
					finalOrder.push('explosiveSuccess');
					break;
				default:
					break;
			}
		});
		resolve(finalOrder);
	}).catch(error => message.reply(`That's an Error! ${error}`));
}

function countSymbols(diceResult, message, bot, desc, channelEmoji) {
	diceResult.results = {
		face: '',
		success: 0,
		opportunity: 0,
		strife: 0,
		explosiveSuccess: {
			white: 0,
			black: 0,
		},
	};
	dice.forEach(color => {
		if (diceResult.roll[color]) {
			diceResult.roll[color].forEach(face => {
				if (color === 'white' || color === 'black') diceResult.results.face += printEmoji(`${color}${face}`, bot, channelEmoji);
				else diceResult.results.face += printEmoji(`${color}`, bot, channelEmoji);
				for (let i = 0; face.length > i; i++) {
					switch (face[i]) {
						case 'e':
							diceResult.results.explosiveSuccess[color]++;
							diceResult.results.success++;
							break;
						case 's':
							diceResult.results.success++;
							break;
						case 'o':
							diceResult.results.opportunity++;
							break;
						case 't':
							diceResult.results.strife++;
							break;
						default:
							break;
					}
				}
			});
		}
	});
	printResults(diceResult.results, message, bot, desc, channelEmoji);
}

function printResults(diceResult, message, bot, desc, channelEmoji) {
	let symbolOrder = ['success', 'opportunity', 'strife'];
	let response = '';
	//prints faces
	if (diceResult.face) {
		if (diceResult.face.length > 1500) diceResult.face = 'Too many dice to display.';
		message.channel.send(diceResult.face);
	} else {
		message.reply("No dice rolled.");
		return;
	}
	if (diceResult.explosiveSuccess.white > 0 || diceResult.explosiveSuccess.black > 0) {
		response += printEmoji('explosiveSuccess', bot, channelEmoji) + '(';
		Object.keys(diceResult.explosiveSuccess).forEach((color) => {
			if (diceResult.explosiveSuccess[color] > 0) response += printEmoji(`${color}`, bot, channelEmoji) + diceResult.explosiveSuccess[color] + ' ';
		});
		response += ') ';
	}
	//prints symbols
	symbolOrder.forEach(symbol => {
		if (diceResult[symbol] !== 0) response += printEmoji(`${symbol}`, bot, channelEmoji) + diceResult[symbol] + ' ';
	});
	if (diceResult.face) message.reply(desc + " results:" + "\n\n\t" + response);
}

exports.roll = roll;
exports.keep = keep;
