const express = require('express');
const BitcoinCore = require('bitcoin-core');

const client = new BitcoinCore({
  network: 'mainnet',
  username: 'iffy',
  password: 'b+cC0r3K1NeKt',
  host: 'localhost',
  port: 8332,
});

const app = express();
const port = 7777;

app.get('/api/block/:hash', async (req, res) => {
  try {
    const block = await client.getBlock(req.params.hash, 2);
    res.json(block);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.get('/api/bestblockhash', async (req, res) => {
  try {
    const bestBlockHash = await client.getBestBlockHash();
    res.json(bestBlockHash);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
