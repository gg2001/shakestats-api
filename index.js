require('dotenv').config();
const { NodeClient } = require('hs-client');
const { Network } = require('hsd');
const network = Network.get('main');

const express = require('express');
const app = express();
const port = 8000;

const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

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

app.post('/block', async (req, res) => {
  console.log(req.body);
  res.send(true);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});