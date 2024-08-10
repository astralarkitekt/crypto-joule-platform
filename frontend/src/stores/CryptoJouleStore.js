// create a pinia store
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import axios from 'axios';

import ByteModalities from "../../../src/lib/ByteModalities.js";
import TriQuanta from "../../../src/lib/TriQuanta.js";
import CryptoJouleLocator from "../../../src/lib/CryptoJouleLocator.js";

const API_URL = 'http://localhost:6623/api/';

axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

export const useCryptoJouleStore = defineStore({
    id: 'crypto-joule',
    state: () => ({
        blockHeight: null,
        blockInfo: null,
        blockTransactions: [],
        byteModalities: null,
        soulSignature: null,
        triQuanta: null,
        blockForces: [],
        cryptoJoules: [],
        initialized: false
    }),
    actions: {
        async initializeStore(blockHeight) {
            try {
                if(blockHeight < 0) {
                    console.error("Invalid block height", blockHeight);
                    return;
                }

                const bestBlockHeight = this.fetchBestBlockHeight();

                if(!blockHeight > bestBlockHeight) {
                    console.error("Block height exceeds best block height", blockHeight, bestBlockHeight);
                    return;
                }
                
                // empty all state
                this.blockHeight = null;
                this.blockInfo = null;
                this.blockTransactions = [];
                this.byteModalities = null;
                this.soulSignature = null;
                this.triQuanta = null;
                this.blockForces = [];
                this.cryptoJoules = [];
                this.initialized = false;

                this.setBlockHeight(blockHeight);
                this.blockInfo = await this.fetchBlockInfo(blockHeight);
                this.setBlockInfo(this.blockInfo);
                this.setBlockTransactions(this.blockInfo.tx);

                console.log("Block Info", this.blockInfo);
                this.byteModalities = new ByteModalities(
                    this.blockInfo.merkleroot,
                    this.blockInfo.hash,
                    this.blockInfo.time
                );
                this.setByteModalities(this.byteModalities);
                this.setSoulSignature(this.byteModalities.getSoulSignature());

                this.triQuanta = new TriQuanta(this.soulSignature);
                this.setTriQuanta(this.triQuanta);
                this.setBlockForces(this.triQuanta.getForces());

                // discover crypto joules
                this.blockInfo.tx.forEach((tx, index) => {
                    const cjLocator = new CryptoJouleLocator(
                        this.triQuanta,
                        tx,
                        this.blockInfo.time
                    );
                    const located = cjLocator.locateCryptoJoules(index);

                    if(located != null) {
                        this.cryptoJoules.push(cjLocator);
                    }
                });
                this.initialized = true;
                console.log("Initialized: ", this.initialized);
            } catch (error) {
                console.error("Error initializing store: ", error);
            }
        },
        // setters
        setBlockForces(blockForces) {
            this.blockForces = blockForces;
        },
        setBlockHeight(blockHeight) {
            this.blockHeight = blockHeight
        },
        setBlockInfo(blockHeader) {
            this.blockHeader = blockHeader
        },
        setByteModalities(byteModalities) {
            this.byteModalities = byteModalities
        },
        setSoulSignature(soulSignature) {
            this.soulSignature = soulSignature
        },
        setTriQuanta(triQuanta) {
            this.triQuanta = triQuanta
        },
        setBlockTransactions(blockTransactions) {
            this.blockTransactions = blockTransactions
        },
        setCryptoJoules(cryptoJoules) {
            this.cryptoJoules = cryptoJoules
        },
        // fetchers
        async fetchBestBlockHeight() {
            // fetch best block height
            const bestBlockHeight = await axios.get(`${API_URL}bestblockheight`);
            return bestBlockHeight.data;
        },
        async fetchBlockInfo(blockHeight) {
            // fetch block info
            const blockInfo = await axios.get(`${API_URL}block/${blockHeight}`);
            return blockInfo.data;
        },
        populateCryptoJoules(blockInfo) {
            // populate crypto joules
        },
        async verifyCryptoJoule(parcelIndex, byteIndex, blockInfo) {
            // verify crypto joule
            if(!this.cryptoJoules || this.cryptoJoules.length === 0) {
                await this.populateCryptoJoules(blockInfo);
                console.log(this.state);
            }

            // now verify the crypto joule


            // todo: remove
            return true;
        },
        getCryptoJoule(parcelIndex, byteIndex) {
            // loop through crypto joules and find the one we want
            for(const cjLocator of this.cryptoJoules) {
                for(const joule of cjLocator.cryptoJoules) {
                    if(joule.parcel === parcelIndex && joule.index === byteIndex) {
                        return joule;
                    }
                }
            }
            return false;
        }
    }
});