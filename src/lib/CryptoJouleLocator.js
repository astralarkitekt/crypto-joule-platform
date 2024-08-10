import CryptoJS from 'crypto-js';
import { hashCycle } from './hashCycle.js';
import TriQuanta from './TriQuanta';

export default class CryptoJouleLocator {
    
    constructor(triQuanta, txn, blockTime) {
        this.triQuanta = triQuanta;
        this.txn = txn;
        this.blockTime = blockTime;
        this.forces = this.triQuanta.getForces();
        this.cryptoJoules = [];
        this.hashCycles = this.precomputeHashCycles();
    }

    getForces() {
        return this.forces;
    }

    getSoulSignature() {
        // block SoulSignature + txn hash + block time
        return CryptoJS.SHA256(this.triQuanta.soulSignature + this.txn + this.blockTime).toString();
    }

    getTriQuanta() {
        return this.triQuanta;
    }

    getTransactionHash() {
        return this.txn;
    }
    
    getBlockTime() {
        return this.blockTime;
    }

    precomputeHashCycles() {
        const soulSignature = this.getSoulSignature();
        let prevHash = soulSignature;
        const hashCycles = [];
        
        for (let i = 0; i < 256; i++) {
            if(i === 0) {
                hashCycles.push(soulSignature);
            } else {
                const cycledHash = hashCycle(soulSignature, prevHash);
                hashCycles.push(cycledHash);
                prevHash = cycledHash;
            }
        }
        
        return hashCycles;
    }

    getParcelCryptoJouleForce(i) {
        if(this.hashCycles[i] === undefined) {
            return null;
        }

        const hashCycle = this.hashCycles[i];
        const tq = new TriQuanta(hashCycle);

        return tq;
    }

    locateCryptoJoules(i) {
        // get the dominant force
        const dominantForceName = this.triQuanta.getDominantForceName();
        const dominantForce = this.forces[dominantForceName];
        
        // get the Transaction hash
        const txnHash = this.txn;

        // search the Transaction for the dominant force
        const txBytes = this.txn.match(/.{2}/g); // split the txn hash into bytes
        
        txBytes.forEach((byte, index) => {
            if (byte === dominantForce) {
                const triQuanta = this.getParcelCryptoJouleForce(index);
                this.cryptoJoules.push({
                    parcel: i,
                    byte,
                    index,
                    triQuanta
                });
            }
        });
        
        return this.cryptoJoules.length > 0 ? this.cryptoJoules : null;
    }
}