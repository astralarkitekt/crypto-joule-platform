import { hashCycle } from "../../src/lib/hashCycle.js";
import * as THREE from "three";
// get sky and water
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { Water } from "three/examples/jsm/objects/Water.js";
// I want the player to be able to walk around
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

export default class CryptoJouleExplorer {
  constructor(container, txnData, cryptoJoule) {
    this.container = container;
    this.txnData = txnData;
    this.cryptoJoule = cryptoJoule;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0xff9900, 1); // Set the background color
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Append the renderer's canvas to the container
    if (typeof container === "string") {
      document
        .getElementById(container.replace("#", ""))
        .appendChild(this.renderer.domElement);
    } else {
      container.appendChild(this.renderer.domElement);
    }

    this.camera.position.z = 60;
    this.camera.position.y = 64;

    this.init();
  }

  init() {
    this.lighting = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    this.scene.add(this.lighting);

    const sky = new Sky();
    sky.scale.setScalar(10000);
    this.scene.add(sky);

    const terrain = new THREE.Group();
    this.scene.add(terrain);

    this.terraform();

    // look at the cube
    this.camera.lookAt(terrain.position);

    this.animate = this.animate.bind(this);
    this.animate();
  }

  terraform() {
    // Placeholder for your terraform logic
    const parcelArea = this.txnData.size * this.txnData.size; // size of the parcel = size exponent 2 (square)
    const dominantScale = 3;
    const subdominantScale = 2;
    const tertiaryScale = 1;

    let { dominant, subdominant, tertiary } =
      this.cryptoJoule.triQuanta.getRanking();
    dominant = parseInt(dominant, 16);
    subdominant = parseInt(subdominant, 16);
    tertiary = parseInt(tertiary, 16);

    const arrayOfForces = [];
    for (let i = 0; i < dominant; i++) {
      arrayOfForces.push(dominant);
    }

    for (let i = 0; i < subdominant; i++) {
      arrayOfForces.push(subdominant);
    }

    for (let i = 0; i < tertiary; i++) {
      arrayOfForces.push(tertiary);
    }

    // figure out how many bytes you need to fill the parcel
    const bytesNeeded = Math.round((arrayOfForces.length / 32) * 2 - 1);

    // use the Soul Signature to advance to this parcel's index
    let soulSignatures = [this.cryptoJoule.triQuanta.soulSignature];
    let soulSignature = this.cryptoJoule.triQuanta.soulSignature;
    let prevSoulSignature = this.cryptoJoule.triQuanta.soulSignature;

    for (let i = 0; i < bytesNeeded; i++) {
      const cycledHash = hashCycle(soulSignature, prevSoulSignature);
      soulSignatures.push(cycledHash);
      prevSoulSignature = cycledHash;
    }

    // slice off the number of bytes needed after joining and exploding the soul signatures into soulBytes
    const terrainBytes = soulSignatures
      .join("")
      .match(/.{2}/g)
      .slice(0, arrayOfForces.length);

    // use the terrainBytes to select a force from the array for each byte, removing the force entry from the array
    const terrainForces = [];
    terrainBytes.forEach((byte) => {
      // convert byte to percentage
      const bytePercentage = parseInt(byte, 16) / 255;
      // select the array index based on the percentage
      const forceIndex = Math.floor(bytePercentage * arrayOfForces.length);
      // get the force
      let force = arrayOfForces[forceIndex];
      // remove the force from the array
      arrayOfForces.splice(forceIndex, 1);

      switch (force) {
        case dominant:
          force = dominantScale * force * parseInt(byte, 16) % 255;
          break;
        case subdominant:
          force = subdominantScale * force * parseInt(byte, 16) % 255;
          break;
        case tertiary:
          force = tertiaryScale * force * parseInt(byte, 16) % 255;
          break;
      }
      // add the force to the terrainForces array
      terrainForces.push(force);
    });
  }

  getInstancedCube(instances) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    return new THREE.InstancedMesh(geometry, material, instances);
  }

  animate() {
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.animate);
  }
}
