import * as THREE from "three";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { createNoise2D } from "simplex-noise";
import alea from "alea";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

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

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5,
      0.125,
      0.05
    );
    this.composer.addPass(bloomPass);

    if (typeof container === "string") {
      document
        .getElementById(container.replace("#", ""))
        .appendChild(this.renderer.domElement);
    } else {
      container.appendChild(this.renderer.domElement);
    }

    this.camera.position.set(-841.8949, 263.6994, -138.2921);
    this.loadModel();

    this.controls = new PointerLockControls(
      this.camera,
      this.renderer.domElement
    );
    this.scene.add(this.controls.getObject());

    this.init();

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.prevTime = performance.now();

    this.animate = this.animate.bind(this);
    this.animate();

    this.addEventListeners();
  }

  addEventListeners() {
    const onKeyDown = (event) => {
      switch (event.code) {
        case "KeyW":
          this.moveForward = true;
          break;
        case "KeyS":
          this.moveBackward = true;
          break;
        case "KeyA":
          this.moveLeft = true;
          break;
        case "KeyD":
          this.moveRight = true;
          break;
      }
    };

    const onKeyUp = (event) => {
      switch (event.code) {
        case "KeyW":
          this.moveForward = false;
          break;
        case "KeyS":
          this.moveBackward = false;
          break;
        case "KeyA":
          this.moveLeft = false;
          break;
        case "KeyD":
          this.moveRight = false;
          break;
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("click", () => this.controls.lock());
  }

  loadModel() {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/node_modules/three/examples/jsm/libs/draco/");
    dracoLoader.setDecoderConfig({ type: "js" });
    loader.setDRACOLoader(dracoLoader);
    const theShip = "/models/harbinger-of-dawn-0.3.glb";
    
      loader.load(theShip, (gltf) => {
        const ship = gltf.scene;
        // copy the coordinates of the camera + z offset of 10
        ship.position.copy(this.camera.position).add(new THREE.Vector3(0, -2, -10));
        this.camera.add(ship);
        this.scene.add(this.camera);
        }, undefined, (error)=>{
            console.error("GLTF Loader error: ", error);
        });
  }

  init() {
    this.scene.fog = new THREE.FogExp2(0x000000, 0.00025);

    this.lighting = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    this.scene.add(this.lighting);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
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
  }

  getSoulBytes() {
    return this.cryptoJoule.triQuanta.soulSignature.match(/.{2}/g);
  }

  generateTerrain() {
    const { dominant, subdominant, tertiary } =
      this.cryptoJoule.triQuanta.getRanking();

    const domPrng = alea(dominant);
    const subPrng = alea(subdominant);
    const terPrng = alea(tertiary);

    const domNoise = createNoise2D(domPrng);
    const subNoise = createNoise2D(subPrng);
    const terNoise = createNoise2D(terPrng);

    const size = this.txnData.size;
    const segments = size * 4;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);

    for (let i = 0; i < geometry.attributes.position.count; i++) {
      const x = geometry.attributes.position.getX(i);
      const y = geometry.attributes.position.getY(i);

      const frequencyScale1 = 0.05;
      const frequencyScale2 = 0.1;
      const frequencyScale3 = 0.015;
      const amplitudeScale1 = 5;
      const amplitudeScale2 = 3;
      const amplitudeScale3 = 2;

      const noiseValue1 =
        domNoise(x * frequencyScale1, y * frequencyScale1) * amplitudeScale1;
      const noiseValue2 =
        subNoise(x * frequencyScale2, y * frequencyScale2) * amplitudeScale2;
      const noiseValue3 =
        terNoise(x * frequencyScale3, y * frequencyScale3) * amplitudeScale3;

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

    const scale = 10000 / size;
    terrain.scale.set(scale, scale, scale);

    this.terrain.add(terrain);
  }

  animate() {
    const time = performance.now();
    const delta = (time - this.prevTime) / 1000;

    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;

    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveLeft) - Number(this.moveRight);
    this.direction.normalize();

    if (this.moveForward || this.moveBackward)
      this.velocity.z -= this.direction.z * 2400.0 * delta;
    if (this.moveLeft || this.moveRight)
      this.velocity.x -= this.direction.x * 2400.0 * delta;

    this.controls.getObject().translateX(this.velocity.x * delta);
    this.controls.getObject().translateZ(this.velocity.z * delta);

    this.prevTime = time;

    const water = this.scene.children.find((child) => child instanceof Water);
    if (water) {
      water.material.uniforms.time.value += 1.0 / 180.0;
    }

    const sun = this.scene.children.find((child) => child instanceof Sky);
    if (sun) {
      sun.material.uniforms.sunPosition.value.x += 0.1;
    }

    this.composer.render();
    window.requestAnimationFrame(this.animate.bind(this));
  }
}
