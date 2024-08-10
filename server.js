const express = require('express');
const BitcoinCore = require('bitcoin-core');
const cors = require('cors');

const client = new BitcoinCore({
  network: 'mainnet',
  username: 'iffy',
  password: 'b+cC0r3K1NeKt',
  host: '127.0.0.1',
  port: 8332,
});

const app = express();
const port = 6623;

app.use(cors({
    origin: '*', // allow all origins
}));

// get current block height
app.get('/api/bestblockheight', async (req, res) => {
  try {
    const bestBlockHeight = await client.getBlockCount();
    res.json(bestBlockHeight);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// get block info for a block height
app.get('/api/block/:blockHeight', async (req, res) => {
  const blockHeight = parseInt(req.params.blockHeight);
  if (isNaN(blockHeight) || blockHeight < 0) {
    res.status(400).send('Invalid block height');
    return;
  }

  try {
    const blockHash = await client.getBlockHash(blockHeight);
    const block = await client.getBlock(blockHash);
    res.json(block);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// get crypto joules for a block height
app.get('/api/crypto-joules/:blockHeight', async (req, res) => {
  const blockHeight = parseInt(req.params.blockHeight);
  if (isNaN(blockHeight) || blockHeight < 0) {
    res.status(400).send('Invalid block height');
    return;
  }

  try {
    const blockHash = await client.getBlockHash(blockHeight);
    const block = await client.getBlock(blockHash);
    const blockTransactions = block.tx;
    const cryptoJoules = [];

    for (const txid of blockTransactions) {
      const tx = await client.getRawTransaction(txid, true);
      const vout = tx.vout.find(vout => vout.scriptPubKey.addresses.includes('bc1q2t7t9q7v7q4zvz0xj6m2z4n4x3z3z4z3z4z3z4'));
      if (vout) {
        cryptoJoules.push({
          txid,
          value: vout.value,
          n: vout.n,
        });
      }
    }

    res.json(cryptoJoules);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// get transaction data for the given hash
app.get('/api/transaction/:txid', async (req, res) => {
  const txid = req.params.txid;
  try {
    const tx = await client.getRawTransaction(txid, true);
    res.json(tx);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
