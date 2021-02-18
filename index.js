require('dotenv').config();
const { NodeClient } = require('hs-client');
const { Network } = require('hsd');
const network = Network.get('main');

const express = require('express');
const app = express();
const port = 8000;

const clientOptions = {
	network: network.type,
	port: network.rpcPort,
	apiKey: process.env.HSD_APIKEY
}

const client = new NodeClient(clientOptions);


app.get('/info', async (req, res) => {
  const clientinfo = await client.getInfo();
  res.send(clientinfo);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});