require('dotenv').config();
const fs = require('fs');
const { NodeClient } = require('hs-client');
const { Network } = require('hsd');
const network = Network.get('main');

function sortByKey(array, key) {
	return array.sort(function (a, b) {
		var x = a[key]; var y = b[key];
		return ((x > y) ? -1 : ((x < y) ? 1 : 0));
	});
}

const clientOptions = {
	network: network.type,
	port: network.rpcPort,
	apiKey: process.env.HSD_APIKEY
}

const client = new NodeClient(clientOptions);

(async () => {
	const clientinfo = await client.getInfo();
	console.log(clientinfo);

	const hashToName = {};

  const names = [];

	const nameOI = {};
	const nameValue = {};
	const nameHighest = {};

	let totalNames = 1008788;
	let totalBurned = 20706526.29781442;

	const dates = [];

	const dateOI = {};
	const dateBids = {};
	const dateTxs = {};
	const dateBurns = {};
	const dateNames = {};

  const blocks = [];

  const blockHash = {};
  const blockTime = {};
	const blockOI = {};
	const blockBids = {};
	const blockTxs = {};
	const blockBurns = {};
	const blockNames = {};

	for (let i = 61965; i < (clientinfo.chain.height); i++) {
		console.log(i);
		const contents = await client.execute('getblockbyheight', [i, 1, 1]);
		const blockDate = new Date(contents.time * 1000).toISOString().split('T')[0];
		blockTime[i] = new Date(contents.time * 1000);
		blockHash[i] = contents.hash;
		if (!(blockDate in dateOI) || !(blockDate in dateBids) || !(blockDate in dateTxs) || !(blockDate in dateBurns) || !(blockDate in dateNames)) {
			dates.push(blockDate);
			dateOI[blockDate] = 0;
			dateBids[blockDate] = 0;
			dateTxs[blockDate] = 0;
			dateNames[blockDate] = totalNames;
			dateBurns[blockDate] = totalBurned;
		}
		if (!(i in dateOI) || !(i in dateBids) || !(i in dateTxs) || !(i in dateBurns) || !(i in dateNames)) {
			blocks.push(i);
			blockOI[i] = 0;
			blockBids[i] = 0;
			blockTxs[i] = 0;
			blockNames[i] = totalNames;
			blockBurns[i] = totalBurned;
		}
		for (let j = 0; j < contents.tx.length; j++) {
			dateTxs[blockDate]++;
			blockTxs[i]++;
			for (let k = 0; k < contents.tx[j].vout.length; k++) {
				if (contents.tx[j].vout[k].covenant.action === "BID") {
					dateBids[blockDate]++;
					blockBids[i]++;
					if (!(contents.tx[j].vout[k].covenant.items[0] in hashToName)) {
						hashToName[contents.tx[j].vout[k].covenant.items[0]] = await client.execute('getnamebyhash', [contents.tx[j].vout[k].covenant.items[0]]);
						dateNames[blockDate]++;
						blockNames[i]++;
						totalNames++;
					}
					// console.log(hashToName[contents.tx[j].vout[k].covenant.items[0]]);
					if (!(hashToName[contents.tx[j].vout[k].covenant.items[0]] in nameOI)) {
						nameOI[hashToName[contents.tx[j].vout[k].covenant.items[0]]] = contents.tx[j].vout[k].value;
					} else {
						nameOI[hashToName[contents.tx[j].vout[k].covenant.items[0]]] += contents.tx[j].vout[k].value;
					}
					dateOI[blockDate] += contents.tx[j].vout[k].value;
					blockOI[i] += contents.tx[j].vout[k].value;
					if (!(hashToName[contents.tx[j].vout[k].covenant.items[0]] in nameValue) || !(hashToName[contents.tx[j].vout[k].covenant.items[0]] in nameHighest)) {
						const nameinfo = await client.execute('getnameinfo', [hashToName[contents.tx[j].vout[k].covenant.items[0]]]);
						if (nameinfo.info !== null) {
							nameValue[hashToName[contents.tx[j].vout[k].covenant.items[0]]] = nameinfo.info.value;
							nameHighest[hashToName[contents.tx[j].vout[k].covenant.items[0]]] = nameinfo.info.highest;
						} else {
							nameValue[hashToName[contents.tx[j].vout[k].covenant.items[0]]] = 0;
							nameHighest[hashToName[contents.tx[j].vout[k].covenant.items[0]]] = 0;
						}
					}
				} else if (contents.tx[j].vout[k].covenant.action === "REGISTER") {
					dateBurns[blockDate] += contents.tx[j].vout[k].value;
					blockBurns[i] += contents.tx[j].vout[k].value;
					totalBurned += contents.tx[j].vout[k].value;
				}
			}
		}
	}

	const datesJSON = [];

	for (const dateKey in dates) {
		datesJSON.push({
			"name": dates[dateKey],
			"Bids": dateBids[dates[dateKey]],
			"Open Interest": dateOI[dates[dateKey]],
			"Names": dateNames[dates[dateKey]],
			"Transactions": dateTxs[dates[dateKey]],
			"Burned": dateBurns[dates[dateKey]],
			"Max Supply": 2040000000 - dateBurns[dates[dateKey]],
		});
	}

	const blocksJSON = [];

	for (const dateKey in blocks) {
		blocksJSON.push({
			"name": blocks[dateKey],
			"Time": blockTime[blocks[dateKey]],
			"Bids": blockBids[blocks[dateKey]],
			"Open Interest": blockOI[blocks[dateKey]],
			"Names": blockNames[blocks[dateKey]],
			"Transactions": blockTxs[blocks[dateKey]],
			"Burned": blockBurns[blocks[dateKey]],
			"Max Supply": 2040000000 - blockBurns[blocks[dateKey]],
		});
	}

	for (const property in nameOI) {
		names.push({
			col1: property,
			col2: nameOI[property],
			col3: nameValue[property] / 1000000,
			col4: nameHighest[property] / 1000000
		});
	}

	fs.writeFileSync('namesfin.json', JSON.stringify(names));
	fs.writeFileSync('datesfin.json', JSON.stringify(datesJSON));
	fs.writeFileSync('blocksfin.json', JSON.stringify(blocksJSON));

	
	console.log(dates);
	console.log(names);
	console.log(totalBurned);
	console.log(names.length);
	console.log(blocks.length);
})();
