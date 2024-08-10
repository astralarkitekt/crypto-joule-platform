import CryptoJS from 'crypto-js';

export default class TriQuanta {

    constructor(soulSignature) {
        this.soulSignature = soulSignature;
        this.triQuanta = this.calculateTriQuanta();
    }

    calculateTriQuanta() {
        // this.soulSignature % max value of 4 hex bytes
        const bigSoul = BigInt('0x' + this.soulSignature);
        // convert max value of 4 hex bytes to BigInt
        const maxBytesValue = BigInt(0xFFFFFFFF);
        const rawQuanta = (bigSoul % maxBytesValue).toString(16).padStart(8, '0');
        
        // get the Modulator (observer) byte (last byte)
        const modulator = rawQuanta.slice(-2);
        const unModulatedQuanta = rawQuanta.slice(0, -2);

        // modulate the quanta
        const modulatedQuanta = this.modulateQuanta(unModulatedQuanta, modulator);
        return modulatedQuanta;
    }

    modulateQuanta(quanta, modulator) {
        
        const intModulator = parseInt(modulator, 16);

        // explode the quanta into 3 bytes
        const byte1 = parseInt(quanta.slice(0, 2), 16);
        const byte2 = parseInt(quanta.slice(2, 4), 16);
        const byte3 = parseInt(quanta.slice(4, 6), 16);

        // add the modulator to the bytes % 255
        const modulatedByte1 = ((byte1 + intModulator) % 255).toString(16).padStart(2, '0');
        const modulatedByte2 = ((byte2 + intModulator) % 255).toString(16).padStart(2, '0');
        const modulatedByte3 = ((byte3 + intModulator) % 255).toString(16).padStart(2, '0');

        // return the modulated quanta
        const modulatedQuanta = modulatedByte1 + modulatedByte2 + modulatedByte3;
        return modulatedQuanta;
    }

    getTriQuanta() {
        return this.triQuanta;
    }

    getRanking() {
        // create an array of the 3 bytes
        const bytes = this.triQuanta.match(/.{2}/g);
        
        // convert each byte to an integer
        bytes.forEach((byte, index) => {
            bytes[index] = parseInt(byte, 16);
        });

        // sort the bytes in ascending order
        const sortedBytes = bytes.sort((a, b) => a - b);
        
        return {
            dominant: sortedBytes[2].toString(16).padStart(2, '0'),
            subdominant: sortedBytes[1].toString(16).padStart(2, '0'),
            tertiary: sortedBytes[0].toString(16).padStart(2, '0'),
        };
    }

    getForces() {
        const bytes = this.triQuanta.match(/.{2}/g);
        const sortedBytes = bytes.sort((a, b) => a - b);
        return {
            genesis: bytes[0],
            stasis: bytes[1],
            metamorphosis: bytes[2],
        }
    }

    getDominantForceName() {
        const forceNames = Object.keys(this.getForces());
        const tqForceValues = Object.values(this.getForces());
        const forces = this.getRanking();

        // get the dominant force value from forces
        // then identify the force name from getRanking
        // return the force name
        const dominantForceValue = forces.dominant;
        const dominantForceIndex = tqForceValues.indexOf(dominantForceValue);
        return forceNames[dominantForceIndex];
    }

    getSubdominantForceName() {
        const forceNames = Object.keys(this.getForces());
        const tqForceValues = Object.values(this.getForces());
        const forces = this.getRanking();

        // get the subdominant force value from forces
        // then identify the force name from getRanking
        // return the force name
        const subdominantForceValue = forces.subdominant;
        const subdominantForceIndex = tqForceValues.indexOf(subdominantForceValue);
        return forceNames[subdominantForceIndex];
    }

    getTertiaryForceName() {
        const forceNames = Object.keys(this.getForces());
        const tqForceValues = Object.values(this.getForces());
        const forces = this.getRanking();

        // get the tertiary force value from forces
        // then identify the force name from getRanking
        // return the force name
        const tertiaryForceValue = forces.tertiary;
        const tertiaryForceIndex = tqForceValues.indexOf(tertiaryForceValue);
        return forceNames[tertiaryForceIndex];
    }
}