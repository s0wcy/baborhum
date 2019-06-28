import * as THREE from 'three'
import GLTFLoader from 'three-gltf-loader'
import CameraControls from 'camera-controls'
CameraControls.install( { THREE: THREE } )

// import vertexShader from '../glsl/vertexShader.vert'
// import fragmentShader from '../glsl/fragmentShader.frag'

// import cow from '../../static/models/cow/scene.gltf'
import meat from '../../static/models/meat/scene.gltf'

export default class Template {
    constructor(_DOMel) {

        // DOM config
        this.$container = _DOMel

        this.containerSize = {

            width: this.$container.offsetWidth,
            height: this.$container.offsetHeight,

        }


        /**
         * Camera
         */
        this.cameraProps = {

            fov: 75,
            aspect: this.containerSize.width / this.containerSize.height,
            near: 1,
            far: 1000,
            target: new THREE.Vector3(0, 0, 50),
            sideTarget: new THREE.Vector3(50, 100, 100)

        }

        this.camera = new THREE.PerspectiveCamera(

            this.cameraProps.fov,
            this.cameraProps.aspect,
            this.cameraProps.near,
            this.cameraProps.far,

        )

        this.initCamera()


        /**
         * Scene
         */

        this.scene = new THREE.Scene()
        this.scene.autoUpdate = true


        /**
         * Renderer
         */
        this.renderer = new THREE.WebGLRenderer({

            alpha: true

        })
        this.renderer.shadowMap.enabled = true

        // Append Canvas
        this.renderer.domElement.classList.add('confettis')
        this.$container.appendChild(this.renderer.domElement)


        /**
         * Light
         */
        this.light1 = new THREE.DirectionalLight( 0xffffff, 1.2 )
        this.light2 = new THREE.AmbientLight( 0x404040 )
        this.light1.position.set(0, 80, -20)
        this.light2.position.set(0, 80, 20)
        this.light1.castShadow = true
        this.scene.add(this.light1)


        /**
         * Magic here
         */
        this.mesh = new THREE.Mesh(

            new THREE.CubeGeometry(10000, 10, 10000),
            new THREE.MeshBasicMaterial({ color: 0xf9f9f9 })

        )
        this.mesh.position.y = 0

        // this.scene.add(this.mesh)

        this.gltfLoader = new GLTFLoader()
        
        this.gltfLoader.load(
            meat,
            (gltf) => {
                this.cowModel = gltf.scene.children[0]
                this.scene.add( gltf.scene )
                gltf.scene.children[0].castShadow = true
                this.cameraMoveTo(this.cameraControls, gltf.scene, 0, 600)
            },
            (xhr) => {
                console.log( `${( xhr.loaded / xhr.total * 100 )}% loaded` )
            }
        )

        this.meatModel = this.gltfLoader.load(
            meat,
            (gltf) => {
                this.scene.add( gltf.scene )
                gltf.scene.children[0].castShadow = true
                gltf.scene.position.set(300, 100, 400)
            },
            (xhr) => {
                console.log( `${( xhr.loaded / xhr.total * 100 )}% loaded` )
            }
        )


        /**
         * Controler
         */
        this.controlerProps = {

            zoom: {

                min: 0,
                max: 400,
                speed: 0.2

            },

            rotateSpeed: 0.1,
            damping: 1

        }

        this.clock = new THREE.Clock()
        this.cameraControls = new CameraControls(this.camera, this.renderer.domElement, true)

        this.initCameraControls()


        /**
         * Events & Animation
         */
        this.counter = 1
        this.distance = 600

        window.addEventListener('resize', () => this.resize())
        document.addEventListener('click', () => {
            this.counter ++
            if(this.counter == 2) {
                this.distance = 100
            }
            this.cameraMoveTo(this.cameraControls, this.scene, this.counter, this.distance)
        })


        /**
         * Camera Controls
         */
        this.clock = new THREE.Clock()
        this.cameraControls = new CameraControls(this.camera, this.renderer.domElement, false)
        this.cameraControls.rotate(-180, -0.5, true)

        this.initCameraControls()

        /**
         * Loop
         */
        window.onload = () => {
            this.render()
            this.loop = this.loop.bind(this)
            this.loop()
        }

    }


    /**
     * Responsive
     */
    resize() {

        this.containerSize.width = window.innerWidth
        this.containerSize.height = window.innerHeight

        // keep aspect ratio of camera
        this.camera.aspect = this.containerSize.width / this.containerSize.height
        this.camera.updateProjectionMatrix()

        this.renderer.setSize(this.containerSize.width / this.containerSize.height)

    }


    /**
     * Init configurations
     */
    initCamera() {

        this.camera.lookAt(this.cameraProps.target)
        this.camera.position.set(0, 0, this.cameraProps.far)
        this.camera.updateProjectionMatrix()

    }

    
    initCameraControls() {

        this.cameraControls.enabled = false
        this.cameraControls.minDistance = this.controlerProps.zoom.min
        this.cameraControls.maxDistance = this.controlerProps.zoom.max
        this.cameraControls.minPolarAngle = 0.6
        this.cameraControls.maxPolarAngle = 1.2
        this.cameraControls.minAzimuthAngle = 1.8
        this.cameraControls.maxAzimuthAngle = 2.4
        this.cameraControls.boundaryFriction = 1.2
        this.cameraControls.boundaryEnclosesCamera = true


    }

    cameraMoveTo(_camera, _scene, _index, _zoom){
        if(_index < this.scene.children.length){
            _camera.moveTo(
                _scene.children[_index].position.x,
                _scene.children[_index].position.y,
                _scene.children[_index].position.z,
                true)
            if(_zoom) {
                _camera.dollyTo(_zoom, true)
            }
        }
    }


    /**
     * Animate
     */
    easeInOutCubic(t, v) { return t<.5 ? (v*2)*t*t*t : (t-(v/2))*(v*t-v)*(v*t-v)+(v/2) }

    rotateObject(_object, _xSpeed, _ySpeed) {
        _object.rotation.x += _xSpeed
        _object.rotation.y += _ySpeed
    }

    update() {

        this.cameraControls.update()
        this.renderer.setSize(this.containerSize.width, this.containerSize.height)

    }


    render() {

        this.renderer.render(this.scene, this.camera)

    }


    loop() {

        window.requestAnimationFrame(this.loop)

        const delta = this.clock.getDelta()
        // Check if we need update
        // const hasControlsUpdated = this.cameraControls.update( delta )
        this.cameraControls.update()
        this.rotateObject(this.scene.children[1], 0, 0.01)
        this.rotateObject(this.scene.children[2], 0, 0.01)

        if(this.movement < 3) {
            this.movement *= 1.040
            this.cameraPosition(
                this.camera,
                this.easeInOutCubic(this.movement, 1.2),
                this.easeInOutCubic(this.movement, 2.2),
                this.easeInOutCubic(this.movement, 2.2),
                this.cameraProps.sideTarget
            )
        }

        // Renderer & Update
        // if(hasControlsUpdated) {
            this.update()
            this.render()
        // }

        
    }
}