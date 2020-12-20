require('dotenv').config();
const fs = require('fs');
const {NodeClient} = require('hs-client');
const {Network} = require('hsd');
const network = Network.get('main');

function sortByKey(array, key) {
    return array.sort(function(a, b) {
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

  for (let i = 0; i < 46100; i++) {
  	console.log(i);
	const contents = await client.execute('getblockbyheight', [ i, 1, 1 ]);
	for (let j = 0; j < contents.tx.length; j++) {
		for (let k = 0; k < contents.tx[j].vout.length; k++) {
			if (contents.tx[j].vout[k].covenant.action === "BID") {
				if (!(contents.tx[j].vout[k].covenant.items[0] in hashToName)) {
					hashToName[contents.tx[j].vout[k].covenant.items[0]] = await client.execute('getnamebyhash', [ contents.tx[j].vout[k].covenant.items[0] ]);
				}
				console.log(hashToName[contents.tx[j].vout[k].covenant.items[0]]);
				if (!(hashToName[contents.tx[j].vout[k].covenant.items[0]] in nameToOI)) {
					nameToOI[hashToName[contents.tx[j].vout[k].covenant.items[0]]] = contents.tx[j].vout[k].value;
				} else {
					nameToOI[hashToName[contents.tx[j].vout[k].covenant.items[0]]] += contents.tx[j].vout[k].value;
				}
				if (!(hashToName[contents.tx[j].vout[k].covenant.items[0]] in nameToValue) || !(hashToName[contents.tx[j].vout[k].covenant.items[0]] in nameToHighest)) {
					const nameinfo = await client.execute('getnameinfo', [ hashToName[contents.tx[j].vout[k].covenant.items[0]] ]);
					if (nameinfo.info !== null) {
						nameToValue[hashToName[contents.tx[j].vout[k].covenant.items[0]]] = nameinfo.info.value;
						nameToHighest[hashToName[contents.tx[j].vout[k].covenant.items[0]]] = nameinfo.info.highest;
					} else {
						nameToValue[hashToName[contents.tx[j].vout[k].covenant.items[0]]] = 0;
						nameToHighest[hashToName[contents.tx[j].vout[k].covenant.items[0]]] = 0;
					}
				}
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

  sortByKey(names, "col2");
  fs.writeFileSync('names.json', JSON.stringify(names));
  console.log(names);
})();
