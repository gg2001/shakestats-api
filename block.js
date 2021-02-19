require('dotenv').config();
const { NodeClient } = require('hs-client');
const { Network, ChainEntry } = require('hsd');
const network = Network.get('main');

const clientOptions = {
	network: network.type,
	port: network.rpcPort,
	apiKey: process.env.HSD_APIKEY
}

const client = new NodeClient(clientOptions);

(async () => {
  // bclient handles the connection, the auth, and the channel subscriptions
  await client.open();

  // use socket connection to request data
  const tip = await client.getTip();
  console.log(tip);
})();

// listen for new blocks
client.bind('chain connect', async (raw) => {
  const block = ChainEntry.fromRaw(raw);
  //console.log('Node - Chain Connect Event:\n', block);
  const contents = await client.execute('getblockbyheight', [block.height, 1, 1]);
  console.log(contents);
});