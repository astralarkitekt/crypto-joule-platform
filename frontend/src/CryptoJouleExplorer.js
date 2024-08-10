import { hashCycle } from "../../src/lib/hashCycle.js";
import ByteModalities from "../../src/lib/ByteModalities.js";
import * as THREE from "three";
// get sky and water
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { Water } from "three/examples/jsm/objects/Water.js";
// I want the player to be able to walk around
//import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
// I want orbit controls
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class CryptoJouleExplorer {
  constructor(container, txnData, cryptoJoule, blockInfo) {
    this.container = container;
    this.txnData = txnData;
    this.cryptoJoule = cryptoJoule;
    this.blockInfo = blockInfo;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
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

    this.camera.position.z = 250;
    this.camera.position.y = 500;

    // Add orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true;

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

    this.terraform(terrain);

    // look at the cube
    this.camera.lookAt(terrain.position);

    this.animate = this.animate.bind(this);
    this.animate();
  }

  terraform(terrain) {
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
    const terrainCubes = this.getInstancedCube(terrainBytes.length);
    terrainBytes.forEach((byte, index) => {
      // convert byte to percentage
      const bytePercentage = parseInt(byte, 16) / 255;
      // select the array index based on the percentage
      const forceIndex = Math.floor(bytePercentage * arrayOfForces.length);
      // get the force
      let force = arrayOfForces[forceIndex];

      // remove the force from the array
      arrayOfForces.splice(forceIndex, 1);
      let cubeForceFactor = 1;
      switch (force) {
        case dominant:
          force = (dominantScale * force * parseInt(byte, 16)) % 255;
          cubeForceFactor = dominantScale;
          break;
        case subdominant:
          force = (subdominantScale * force * parseInt(byte, 16)) % 255;
          cubeForceFactor = subdominantScale;
          break;
        case tertiary:
          force = (tertiaryScale * force * parseInt(byte, 16)) % 255;
          cubeForceFactor = tertiaryScale;
          break;
      }
      // add the force to the terrainForces array
      terrainForces.push(force);

      // get the byte modalities of force
      const byteModalities = ByteModalities.getModalitiesForByte(
        index,
        force,
        parseInt(byte, 16)
      );

      // scale the cube at the index
      terrainCubes.setMatrixAt(
        index,
        new THREE.Matrix4().makeScale(force + cubeForceFactor, ((byteModalities[5].value / 255) * force) + cubeForceFactor, force + cubeForceFactor)
      );
      // color the cube at the index
      terrainCubes.setColorAt(
        index,
        new THREE.Color(
          `hsl(${Math.floor((byteModalities[8].value / 255) * 360)}, 50%, 50%)`
        )
      );

      if (index > 0) {
        // now to determine the positioning of the cube
        const sides = [1, 2, 3, 4];
        const prevCube = new THREE.Matrix4();
        terrainCubes.getMatrixAt(index - 1, prevCube);

        // get the position of the previous cube
        const prevPosition = new THREE.Vector3();
        const prevScale = new THREE.Vector3();
        const prevRotation = new THREE.Quaternion();
        prevCube.decompose(prevPosition, prevRotation, prevScale);

        // choose a side on the previous cube to attach the current cube
        // using the byte modalities Reflection
        const side = sides[Math.floor((byteModalities[4].value / 255) * sides.length)];
        
        // get the width of the previous cube and divide by 2 to get the positional offset
        const prevWidth = prevScale.x;
        const offset = (prevWidth / 2);

        // get the position of the current cube
        const currentCube = new THREE.Matrix4();
        let position = new THREE.Vector3();
        let rotation = new THREE.Quaternion();
        let scale = new THREE.Vector3();
        terrainCubes.getMatrixAt(index, currentCube)
        currentCube.decompose(position, rotation, scale);

        // position the cube based on the proper side of the previous cube using x and z offsets
        // 1 = top, 2 = right, 3 = bottom, 4 = left
        switch (side) {
          case 1:
            position = new THREE.Vector3(prevPosition.x, prevPosition.y, prevPosition.z + prevWidth);
            break;
          case 2:
            position = new THREE.Vector3(prevPosition.x + prevWidth, prevPosition.y, prevPosition.z);
            break;
          case 3:
            position = new THREE.Vector3(prevPosition.x, prevPosition.y, prevPosition.z - prevWidth);
            break;
          case 4:
            position = new THREE.Vector3(prevPosition.x - prevWidth, prevPosition.y, prevPosition.z);
            break;
        }

        // set the position of the cube makeTranslation?
        terrainCubes.setMatrixAt(index, new THREE.Matrix4().makeTranslation(position.x, position.y, position.z));
        // terrainCubes.setMatrixAt(index, new THREE.Matrix4().makeScale(scale.x, scale.y, scale.z));
        terrainCubes.instanceMatrix.needsUpdate = true;

      } else {
        // position the cube at the origin
        terrainCubes.setMatrixAt(
          index,
          new THREE.Matrix4().makeTranslation(0, 0, 0)
        );
      }
    });

    // add the terrainCubes to the terrain group
    terrain.add(terrainCubes);

    // add the terrain to the scene
    this.scene.add(terrain);
  }

  getInstancedCube(instances) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    return new THREE.InstancedMesh(geometry, material, instances);
  }

  animate() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.animate.bind(this));
  }
}
