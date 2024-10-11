import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import hologramVertexShader from './shaders/hologram/vertex.glsl'
import hologramFragmentShader from './shaders/hologram/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })
const debugObject={}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
//Lights
const directionalLight = new THREE.DirectionalLight(0xff80c0, 100);
directionalLight.position.set(0, 2, 0); // You can adjust this position
directionalLight.castShadow = true;

scene.background = new THREE.Color(0x1E1E2E);
/**
 * Water
 */

//Color
debugObject.depthColor = '#186691'
debugObject.surfaceColor= '#9bd8ff'



//add gui control for the hologram color
const materialParameters = {}
materialParameters.Color = '#ff0000'
gui.addColor(materialParameters, 'Color').name('Hologram Color').onChange(()=>{
    hologramMaterial.uniforms.uColor.value.set(materialParameters.Color);
})

const hologramMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(materialParameters.Color) }
    },
    vertexShader: hologramVertexShader,
    fragmentShader: hologramFragmentShader,
    transparent: true,
    //the problem with the sircle plane meshes are double sides
    //fixed by inverting the normals on the fragment shader by checking if gl_FrontFacing is false
    // still visible a bit but not as bad to fully fix add depthWrite= false
    depthWrite: false,
    side: THREE.DoubleSide,
    transparent: true,
    blending: THREE.AdditiveBlending,
});





/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
//inifinty geometry test

class LemniscateCurve extends THREE.Curve {
    constructor(scale = 1) {
        super();
        this.scale = scale;
    }

    getPoint(t, optionalTarget = new THREE.Vector3()) {
        const a = this.scale;
        const theta = t * 2 * Math.PI;
        const x = (a * Math.sqrt(2) * Math.cos(theta)) / (Math.sin(theta) * Math.sin(theta) + 1);
        const y = (a * Math.sqrt(2) * Math.cos(theta) * Math.sin(theta)) / (Math.sin(theta) * Math.sin(theta) + 1);
        const z = 0; // Keep it flat for now
        return optionalTarget.set(x, y, z);
    }
}

// Create the lemniscate curve
const lemniscateCurve = new LemniscateCurve(1);

// Create the tube geometry around the lemniscate curve
const tubeGeometry = new THREE.TubeGeometry(lemniscateCurve, 100, 0.1, 20, true);



// Create a mesh with the cube geometry and crystal material
const crystalCube = new THREE.Mesh(tubeGeometry, hologramMaterial);

crystalCube.castShadow = true;
// Add the crystal cube to the scene
scene.add(crystalCube);


//torus
const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 64, Math.PI * 2);
 // Red color for the torus
const torus = new THREE.Mesh(torusGeometry, hologramMaterial);
scene.add(torus);
torus.position.x = -3

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 6)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true;
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
 
    //hologram
    hologramMaterial.uniforms.uTime.value = elapsedTime;
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

