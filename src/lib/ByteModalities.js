import CryptoJS from "crypto-js";

class ByteModalities {
  static explanations = [
    {
      name: "Noetic",
      value: "wrapValue(byteValue + soulByte)",
      explanation:
        "The original byte value combined with the soul byte, wrapping around to 0 if it exceeds 255. This represents a contextualized understanding of the raw data through the lens of the block's soul signature.",
    },
    {
      name: "Shadow",
      value: "wrapValue(255 - byteValue + soulByte)",
      explanation:
        "The complement of the byte value (255 - byteValue) combined with the soul byte, wrapping around if necessary. This creates a 'shadow' or inverse representation of the original byte.",
    },
    {
      name: "Cowl",
      value:
        "wrapValue(255 - Math.abs(byteValue - (255 - byteValue)) + soulByte)",
      explanation:
        "Reflects the symmetrical difference between the byte value and its complement, combined with the soul byte. This creates a 'cowl' effect, emphasizing the byte's position relative to the midpoint of the range.",
    },
    {
      name: "Light",
      value: "wrapValue(Math.floor(Math.pow(byteValue, 2) / 255) + soulByte)",
      explanation:
        "A non-linear transformation of the byte value (squared and scaled), combined with the soul byte. This represents the 'energy' or 'intensity' of the byte.",
    },
    {
      name: "Reflection",
      value: "wrapValue(Math.abs(byteValue - 128) + soulByte)",
      explanation:
        "The absolute distance from the midpoint (128) of the byte range, combined with the soul byte. This reflects how far the byte is from the center of its possible values.",
    },
    {
      name: "Amplifier",
      value: "wrapValue((byteValue * (index + 1)) + soulByte)",
      explanation:
        "Amplifies the byte value based on its position in the Merkle root, then combines with the soul byte. This represents increasing momentum through the hash structure.",
    },
    {
      name: "Echo",
      value: "wrapValue(Math.max(byteValue - index * 8, 0) + soulByte)",
      explanation:
        "Creates a linear decay effect, reducing the byte value based on its position, then combines with the soul byte. This represents a simple and consistent echo through the Merkle root.",
    },
    {
      name: "Harmonic",
      value: "wrapValue((byteValue * 2 * (index + 1)) + soulByte)",
      explanation:
        "Creates a harmonic series based on the byte's position in the Merkle root, then combines with the soul byte. This is analogous to musical or physical harmonics.",
    },
    {
      name: "Spectral",
      value: "wrapValue(((255 - byteValue) * (index + 1)) + soulByte)",
      explanation:
        "Amplifies the complement of the byte value based on its position, then combines with the soul byte. This creates a counterpart to Amplifier in the byte's spectrum.",
    },
    {
      name: "Dissonance",
      value: "wrapValue((Math.abs(byteValue - 128) * (index + 1)) + soulByte)",
      explanation:
        "Scales the deviation from the midpoint by the byte's position, then combines with the soul byte. This represents increasing dissonance through the Merkle root.",
    },
  ];

  constructor(merkleRoot, blockHash, blockTime) {
    if (!/^[0-9a-fA-F]+$/.test(merkleRoot)) {
      throw new Error("Invalid hexadecimal string for merkle root");
    }
    this.hash = merkleRoot.toLowerCase();
    this.bytes = this.hash.match(/.{2}/g).map((byte) => parseInt(byte, 16));

    this.blockHash = blockHash;
    this.blockTime = blockTime;

    this.soulSignature = this.createSoulSignature();
    this.soulBytes = this.soulSignature
      .match(/.{2}/g)
      .map((byte) => parseInt(byte, 16));
  }

  getSoulByte(index) {
    return this.soulBytes[index % this.soulBytes.length];
  }

  static wrapValue(value) {
    if (value > 255) {
      return value % 256;
    }
    return value;
  }

  getModality(mode, index, depth = 0, maxDepth = 3) {
    const modeArray = Array.isArray(mode) ? mode : [mode];

    if (depth === 0) {
      return this.calculateModality(modeArray[0], index);
    }

    if (depth >= maxDepth) {
      return this.calculateModality(modeArray[0], index);
    }

    const baseValue = this.calculateModality(modeArray[0], index);
    const nextMode =
      this.explanations[baseValue % this.explanations.length].name;

    return this.getModality(nextMode, baseValue, depth + 1, maxDepth);
  }

  calculateModality(modalityName, index, sb = false) {
    const byteValue = this.bytes[index];
    const soulByte = sb ? sb : this.getSoulByte(index);

    switch (modalityName) {
      case "Noetic":
        return this.wrapValue(byteValue + soulByte);
      case "Shadow":
        return this.wrapValue(255 - byteValue + soulByte);
      case "Cowl":
        return this.wrapValue(
          255 - Math.abs(byteValue - (255 - byteValue)) + soulByte
        );
      case "Light":
        return this.wrapValue(
          Math.floor(Math.pow(byteValue, 2) / 255) + soulByte
        );
      case "Reflection":
        return this.wrapValue(Math.abs(byteValue - 128) + soulByte);
      case "Amplifier":
        return this.wrapValue(byteValue * (index + 1) + soulByte);
      case "Echo":
        return this.wrapValue(Math.max(byteValue - index * 8, 0) + soulByte);
      case "Harmonic":
        return this.wrapValue(byteValue * 2 * (index + 1) + soulByte);
      case "Spectral":
        return this.wrapValue((255 - byteValue) * (index + 1) + soulByte);
      case "Dissonance":
        return this.wrapValue(
          Math.abs(byteValue - 128) * (index + 1) + soulByte
        );
      default:
        throw new Error(`Unknown modality: ${modalityName}`);
    }
  }

  depadHash(hash) {
    let depaddedHash = hash.replace(/^0+/, "");
    if (depaddedHash.length % 2 !== 0) {
      depaddedHash = "0" + depaddedHash;
    }
    return depaddedHash;
  }

  createSoulSignature() {
    const dataToHash = this.blockHash + this.hash + this.blockTime;
    this.soulSignature = CryptoJS.SHA256(dataToHash).toString();
    return this.soulSignature;
  }

  getSoulSignature() {
    return this.soulSignature;
  }

  getAllModalities(index, depth = 3) {
    return this.explanations.map((modality) => ({
      name: modality.name,
      value: this.getModality([modality.name], index, 0, depth),
    }));
  }

  static getModalityExplanation(modalityName) {
    return this.explanations.find(
      (explanation) => explanation.name === modalityName
    );
  }

  static getByteModality(modalityName, index, byteValue, soulByte) {
    switch (modalityName) {
      case "Noetic":
        return ByteModalities.wrapValue(byteValue + soulByte);
      case "Shadow":
        return ByteModalities.wrapValue(255 - byteValue + soulByte);
      case "Cowl":
        return ByteModalities.wrapValue(
          255 - Math.abs(byteValue - (255 - byteValue)) + soulByte
        );
      case "Light":
        return ByteModalities.wrapValue(
          Math.floor(Math.pow(byteValue, 2) / 255) + soulByte
        );
      case "Reflection":
        return ByteModalities.wrapValue(Math.abs(byteValue - 128) + soulByte);
      case "Amplifier":
        return ByteModalities.wrapValue(byteValue * (index + 1) + soulByte);
      case "Echo":
        return ByteModalities.wrapValue(
          Math.max(byteValue - index * 8, 0) + soulByte
        );
      case "Harmonic":
        return ByteModalities.wrapValue(byteValue * 2 * (index + 1) + soulByte);
      case "Spectral":
        return ByteModalities.wrapValue(
          (255 - byteValue) * (index + 1) + soulByte
        );
      case "Dissonance":
        return ByteModalities.wrapValue(
          Math.abs(byteValue - 128) * (index + 1) + soulByte
        );
      default:
        throw new Error(`Unknown modality: ${modalityName}`);
    }
  }

  static getModalitiesForByte(index, byteValue, soulByte) {
    return ByteModalities.explanations.map((modality) => ({
      name: modality.name,
      value: ByteModalities.getByteModality(
        modality.name,
        index,
        byteValue,
        soulByte
      ),
    }));
  }
}

export default ByteModalities;
