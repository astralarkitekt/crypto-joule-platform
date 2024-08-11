import { hashCycle } from "../../src/lib/hashCycle.js";
import ByteModalities from "../../src/lib/ByteModalities.js";

import * as THREE from "three";
// get sky and water
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { Water } from "three/examples/jsm/objects/Water.js";
// I want a soft bloom effect
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

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
    this.terrain = new THREE.Group();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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

    this.camera.position.z = 5;
    this.camera.position.y = 10;

    // Add orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true;

    this.init();
  }

  init() {
    // add an environment
    this.scene.fog = new THREE.Fog(0x000000, 1, 1000);

    // add lighting
    this.lighting = new THREE.HemisphereLight(0xffffbb, 0x080820, 15);
    this.scene.add(this.lighting);
    // add a directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);

    const sky = new Sky();
    sky.scale.setScalar(450000);

    const phi = THREE.MathUtils.degToRad(90);
    const theta = THREE.MathUtils.degToRad(180);
    const sunPos = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
    sky.material.uniforms.sunPosition.value = sunPos;
    this.scene.add(sky);

    const terrain = this.calculateTerrain();
    this.terraform(terrain);

    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const water = new Water(waterGeometry, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load("/textures/waternormals.jpg", function (texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }),
        alpha: 1.0,
        sunDirection: this.lighting.position.clone().normalize(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: this.scene.fog !== undefined
    });
    water.rotation.x = -Math.PI / 2;
    this.scene.add(water);
    
    this.animate = this.animate.bind(this);
    this.animate();
  }

  getSoulBytes() {
    return this.cryptoJoule.triQuanta.soulSignature.match(/.{2}/g);
  }

  calculateTerrain() {
    const totalCubes = 768; // 3 bytes in triQuanta of parcel * 256 (the max value of a byte)

    // get and calculate the triQuanta forces total value
    const { dominant, subdominant, tertiary } =
      this.cryptoJoule.triQuanta.getRanking();
    const totalForces =
      parseInt(dominant, 16) +
      parseInt(subdominant, 16) +
      parseInt(tertiary, 16);

    // normalize the forces against the total forces
    const dominantProportion = parseInt(dominant, 16) / totalForces;
    const subdominantProportion = parseInt(subdominant, 16) / totalForces;
    const tertiaryProportion = parseInt(tertiary, 16) / totalForces;

    // calculate the number of cubes for each force against the total cubes
    const dominantCubes = Math.floor(totalCubes * dominantProportion);
    const subdominantCubes = Math.floor(totalCubes * subdominantProportion);
    const tertiaryCubes = Math.floor(totalCubes * tertiaryProportion);

    return { dominantCubes, subdominantCubes, tertiaryCubes };
  }

  terraform(terrain) {
    // get the soul signature and soul bytes
    const soulSignature = this.cryptoJoule.triQuanta.soulSignature;
    const soulBytes = this.getSoulBytes();
  
    const totalCubes = terrain.dominantCubes + terrain.subdominantCubes + terrain.tertiaryCubes;
  
    const { dominant, subdominant, tertiary } = this.cryptoJoule.triQuanta.getRanking();
  
    // fill an array with the total number of cubes where the value is the appropriate force
    const terrainArray = [];
    for (let i = 0; i < totalCubes; i++) {
      if (i < terrain.dominantCubes) {
        terrainArray.push(dominant);
      } else if (i < terrain.dominantCubes + terrain.subdominantCubes) {
        terrainArray.push(subdominant);
      } else {
        terrainArray.push(tertiary);
      }
    }
  
    // extend the soul signature so there is at minimum 1 byte per cube
    let extendedSoulSignature = soulSignature;
    let previousSoulSignature = soulSignature;
    while (extendedSoulSignature.length < totalCubes * 2) {
      const cycledSoulSignature = hashCycle(soulSignature, previousSoulSignature);
      extendedSoulSignature += cycledSoulSignature;
      previousSoulSignature = cycledSoulSignature;
    }
    const extendedSoulBytes = extendedSoulSignature.match(/.{2}/g).slice(0, totalCubes);
  
    // create the cubes
    const instances = totalCubes;
    const cubes = this.getInstancedCubes(instances);
  
    // do layout to it
    const terrainSizes = [];
    let xOffset = 0;
    let zOffset = 0;
    for (let i = 0; i < extendedSoulBytes.length; i++) {
      const index = i;
      const soulInt = parseInt(extendedSoulBytes[i], 16);
      const soulPercent = soulInt / 255;
      const tArrIndex = Math.floor(soulPercent * terrainArray.length);
      const terrainSize = parseInt(terrainArray[tArrIndex], 16);
      terrainArray.splice(tArrIndex, 1);
      terrainSizes.push(terrainSize);
  
      const byteModalities = ByteModalities.getModalitiesForByte(index, terrainSize, soulInt);
      
      // Ensure byteModalities values are valid numbers
      const width = (byteModalities[0].value / 255) + 1;
      const depth = (byteModalities[0].value / 255) + 1;
      const height = (byteModalities[5].value / 255) + 1;
      const color = (byteModalities[8].value / 255) * 360;
      
      if (isNaN(width) || isNaN(depth) || isNaN(height)) {
        console.error(`Invalid values at index ${i}: width: ${width}, depth: ${depth}, height: ${height}`);
        continue; // Skip this iteration if values are invalid
      }
  
    //   console.log(`Positioning cube ${i} at xOffset: ${xOffset}, yOffset: ${height / 2}, zOffset: ${zOffset}`);
    cubes.setMatrixAt(i, new THREE.Matrix4().makeScale(width, height, depth));
    cubes.setColorAt(i, new THREE.Color(`hsl(${color}, 50%, 50%)`));
      cubes.setMatrixAt(i, new THREE.Matrix4().makeTranslation(xOffset, height / 2, zOffset));
      cubes.instanceMatrix.needsUpdate = true;
  
      xOffset += width;
      if (xOffset >= this.txnData.size) {
        xOffset = 0;
        zOffset += depth;
      }
  
    //   console.log(`After incrementing: xOffset: ${xOffset}, zOffset: ${zOffset}`);
    }
  
    // update the cubes instance matrix
    cubes.instanceMatrix.needsUpdate = true;
    this.terrain.add(cubes);
    this.scene.add(this.terrain);
    this.camera.lookAt(this.terrain.position);
  }
  

  getInstancedCubes(instances) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    //geometry.translate(-1 / 2, 0, -1 / 2);
    const material = new THREE.MeshStandardMaterial({
        // color: 0x00ffff,
        roughness: 0.125,
        metalness: 0.875,
        opacity: 0.675,
    });
    return new THREE.InstancedMesh(geometry, material, instances);
  }

  animate() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.animate.bind(this));
  }
}
