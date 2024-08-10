function hashCycle(hash, previousHash = null) {
    if (previousHash === null) {
      previousHash = hash;
    }

    // split the hash into byte pairs
    const hashBytes = hash.match(/.{2}/g);
    const hashIntegers = hashBytes.map((byte) => parseInt(byte, 16));
  
    // split the previous hash into byte pairs
    const prevBytes = previousHash.match(/.{2}/g);
    const prevIntegers = prevBytes.map((byte) => parseInt(byte, 16));
  
    // add the hash integers to the previous hash integers to synth
    // a new hash
    const synthHash = [];
    for (let i = 0; i < hashIntegers.length; i++) {
      const sum = hashIntegers[i] + prevIntegers[i];
      const pair = sum % 256; // modulo 256 to get a byte
      synthHash.push(pair);
    }
  
    // convert the synthHash back to a hex 64-character hex string
    const synthHashHex = synthHash.map((byte) =>
      byte.toString(16).padStart(2, "0")
    );
    return synthHashHex.join("");
  }

  export { hashCycle };