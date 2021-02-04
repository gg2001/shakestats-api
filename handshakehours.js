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
	const nameToOI = {};
	const nameToValue = {};
	const nameToHighest = {};
	const names = [];

	let openInterest = 0;
	let totalBids = 0;
	let totalNames = 0;
	let totalBurned = 16530108;

	const dates = [];
	const datesJSON = [];
	const dateOI = {};
	const dateBids = {};
	const dateTxs = {};
	const dateBurns = {};
	const dateNames = {};

	for (let i = 52297; i < 53305; i++) {
		console.log(i);
		const contents = await client.execute('getblockbyheight', [i, 1, 1]);
		const blockDate = new Date(contents.time * 1000).toISOString().substring(0, 13);
		if (!(blockDate in dateOI) || !(blockDate in dateBids) || !(blockDate in dateTxs) || !(blockDate in dateNames)) {
			dates.push(blockDate);
			dateOI[blockDate] = 0;
			dateBids[blockDate] = 0;
			dateTxs[blockDate] = 0;
			dateNames[blockDate] = 0;
			dateBurns[blockDate] = totalBurned;
		}
		for (let j = 0; j < contents.tx.length; j++) {
			dateTxs[blockDate]++;
			for (let k = 0; k < contents.tx[j].vout.length; k++) {
				if (contents.tx[j].vout[k].covenant.action === "BID") {
					dateBids[blockDate]++;
					totalBids++;
					if (!(contents.tx[j].vout[k].covenant.items[0] in hashToName)) {
						hashToName[contents.tx[j].vout[k].covenant.items[0]] = await client.execute('getnamebyhash', [contents.tx[j].vout[k].covenant.items[0]]);
						dateNames[blockDate]++;
						totalNames++;
					}
					console.log(hashToName[contents.tx[j].vout[k].covenant.items[0]]);
					if (!(hashToName[contents.tx[j].vout[k].covenant.items[0]] in nameToOI)) {
						nameToOI[hashToName[contents.tx[j].vout[k].covenant.items[0]]] = contents.tx[j].vout[k].value;
					} else {
						nameToOI[hashToName[contents.tx[j].vout[k].covenant.items[0]]] += contents.tx[j].vout[k].value;
					}
					dateOI[blockDate] += contents.tx[j].vout[k].value;
					openInterest += contents.tx[j].vout[k].value;
					if (!(hashToName[contents.tx[j].vout[k].covenant.items[0]] in nameToValue) || !(hashToName[contents.tx[j].vout[k].covenant.items[0]] in nameToHighest)) {
						const nameinfo = await client.execute('getnameinfo', [hashToName[contents.tx[j].vout[k].covenant.items[0]]]);
						if (nameinfo.info !== null) {
							nameToValue[hashToName[contents.tx[j].vout[k].covenant.items[0]]] = nameinfo.info.value;
							nameToHighest[hashToName[contents.tx[j].vout[k].covenant.items[0]]] = nameinfo.info.highest;
						} else {
							nameToValue[hashToName[contents.tx[j].vout[k].covenant.items[0]]] = 0;
							nameToHighest[hashToName[contents.tx[j].vout[k].covenant.items[0]]] = 0;
						}
					}
				} else if (contents.tx[j].vout[k].covenant.action === "REGISTER") {
					dateBurns[blockDate] += contents.tx[j].vout[k].value;
					totalBurned += contents.tx[j].vout[k].value;
				}
			}
		}
	}

	for (const property in nameToOI) {
		names.push({
			col1: property,
			col2: nameToOI[property],
			col3: nameToValue[property],
			col4: nameToHighest[property]
		});
	}

	
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

	console.log(datesJSON);

	sortByKey(names, "col2");

	const returnFinalNames = [];
	let counter = 1;
	for (const property in names) {
		returnFinalNames.push({
			col1: counter,
			col2: names[property].col1,
			col3: names[property].col2,
			col4: names[property].col3 / 1000000,
			col5: names[property].col4 / 1000000
		});
		counter++;
	}

	//fs.writeFileSync('names.json', JSON.stringify(returnFinalNames));
	fs.writeFileSync('dates-2.json', JSON.stringify(datesJSON));
	console.log(openInterest);
	console.log(totalBids);
	console.log(totalNames, names.length);
	console.log(totalBurned);
})();
