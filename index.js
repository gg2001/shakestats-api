require('dotenv').config();
const {NodeClient} = require('hs-client');
const {Network} = require('hsd');
const network = Network.get('main');

const clientOptions = {
  network: network.type,
  port: network.rpcPort,
  apiKey: process.env.HSD_APIKEY
}

const client = new NodeClient(clientOptions);

(async () => {
  const clientinfo = await client.getInfo();
  console.log(clientinfo);
  const result = await client.execute('getblockbyheight', [ 12345, 1, 1 ]);
	console.log(result.tx[0].vout);
})();
