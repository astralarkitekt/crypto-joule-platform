import * as THREE from 'three';
// get sky and water
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
// I want the player to be able to walk around
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';


export default class CryptoJouleExplorer {
    constructor(container) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0xff9900, 1); // Set the background color
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Append the renderer's canvas to the container
        if (typeof container === 'string') {
            
            document.getElementById(container.replace('#','')).appendChild(this.renderer.domElement);
        } else {
            container.appendChild(this.renderer.domElement);
        }

        this.camera.position.z = 5;
        this.camera.position.y = 2;

        this.init();
    }

    init() {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshStandardMaterial({ color: 0x0099ff });
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);

        this.lighting = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
        this.scene.add(this.lighting);

        const sky = new Sky();
        sky.scale.setScalar(10000);
        this.scene.add(sky);


        this.animate = this.animate.bind(this);
        this.animate();

    }

    terraform() {
        // Placeholder for your terraform logic
    }

    animate() {
        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.animate);
    }
}
