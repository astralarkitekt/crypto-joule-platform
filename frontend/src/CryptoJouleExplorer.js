import { hashCycle } from "../../src/lib/hashCycle.js";
import ByteModalities from "../../src/lib/ByteModalities.js";

import * as THREE from "three";
// get sky and water
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { Water } from "three/examples/jsm/objects/Water.js";
// I want a soft bloom effect
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import { createNoise2D, createNoise3D } from "simplex-noise";
import alea from "alea";

// first person controls
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
      100000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // is it appropriate to set up passes here? I want to add a bloom effect
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5,
      0.125,
      0.05
    );
    this.composer.addPass(bloomPass);

    // Append the renderer's canvas to the container
    if (typeof container === "string") {
      document
        .getElementById(container.replace("#", ""))
        .appendChild(this.renderer.domElement);
    } else {
      container.appendChild(this.renderer.domElement);
    }

    this.camera.position.x = -841.8949;
    this.camera.position.y = 263.6994;
    this.camera.position.z = -138.2921;

    // Add orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true;
    // limit the orbit controls so you can pan down to the water level
    this.controls.maxPolarAngle = Math.PI / 2.1;

    this.init();
  }

  init() {
    // add an environment
    this.scene.fog = new THREE.FogExp2(0x000000, 0.00025);

    // add lighting
    this.lighting = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    this.scene.add(this.lighting);
    // add a directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.top = 1000;
    directionalLight.shadow.camera.bottom = -1000;
    directionalLight.shadow.camera.left = -1000;
    directionalLight.shadow.camera.right = 1000;
    directionalLight.shadow.camera.far = 1000;
    directionalLight.shadow.camera.near = 0.125;
    this.scene.add(directionalLight);

    const sky = new Sky();
    sky.scale.setScalar(450000);

    const phi = THREE.MathUtils.degToRad(90);
    const theta = THREE.MathUtils.degToRad(180);
    const sunPos = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
    sky.material.uniforms.sunPosition.value = sunPos;
    this.scene.add(sky);

    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load(
        "/textures/waternormals.jpg",
        function (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
      ),
      alpha: 1.0,
      sunDirection: this.lighting.position.clone().normalize(),
      sunColor: 0xff9900,
      waterColor: 0x00ffff,
      distortionScale: 3.7,
      fog: this.scene.fog !== undefined,
    });
    water.rotation.x = -Math.PI / 2;
    this.scene.add(water);

    this.generateTerrain();
    this.scene.add(this.terrain);

    // add a mousewheel event listener to console.log the camera position
    window.addEventListener("wheel", () => {
      console.log(this.camera.position);
    });

    this.animate = this.animate.bind(this);
    this.animate();
  }

  getSoulBytes() {
    return this.cryptoJoule.triQuanta.soulSignature.match(/.{2}/g);
  }

  generateTerrain() {
    const { dominant, subdominant, tertiary } = this.cryptoJoule.triQuanta.getRanking();
    
    const domPrng = alea(dominant);
    const subPrng = alea(subdominant);
    const terPrng = alea(tertiary);

    const domNoise = createNoise2D(domPrng);
    const subNoise = createNoise2D(subPrng);
    const terNoise = createNoise2D(terPrng);

    
    // use the txnData.size property to create a complex plane
    const size = this.txnData.size;
    const segments = size * 4;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);

    // this generates the noise of the terrain
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      const x = geometry.attributes.position.getX(i);
      const y = geometry.attributes.position.getY(i);

      const frequencyScale1 = 0.05;
      const frequencyScale2 = 0.1;
      const frequencyScale3 = 0.015;
      const amplitudeScale1 = 5;
      const amplitudeScale2 = 3;
      const amplitudeScale3 = 2;

      const noiseValue1 = domNoise(x * frequencyScale1, y * frequencyScale1) * amplitudeScale1;
      const noiseValue2 = subNoise(x * frequencyScale2, y * frequencyScale2) * amplitudeScale2;
      const noiseValue3 = terNoise(x * frequencyScale3, y * frequencyScale3) * amplitudeScale3;

      const combinedNoise = noiseValue1 + noiseValue2 + noiseValue3;
      geometry.attributes.position.setZ(i, combinedNoise);
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: 0x009900,
      side: THREE.DoubleSide,
    });
    const terrain = new THREE.Mesh(geometry, material);
    terrain.receiveShadow = true;
    terrain.castShadow = true;
    terrain.rotation.x = -Math.PI / 2;

    const scale = 10000 / size; // percentage of the size
    
    // scale the terrain up to 10000
    terrain.scale.set(scale, scale, scale);

    this.terrain.add(terrain);
  }

  animate() {
    this.controls.update();

    // water
    const water = this.scene.children.find((child) => child instanceof Water);
    if (water) {
      water.material.uniforms.time.value += 1.0 / 180.0;
    }

    // animate the sun as though it's moving
    const sun = this.scene.children.find((child) => child instanceof Sky);
    if (sun) {
      sun.material.uniforms.sunPosition.value.x += 0.1;
    }

    // bloom
    this.composer.render();
    window.requestAnimationFrame(this.animate.bind(this));
  }
}
