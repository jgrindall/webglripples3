//@ts-ignore
import * as THREE from 'three'

var width = 512
var height = 512

export class Ripples2{
    container: HTMLDivElement
    renderer: THREE.WebGLRenderer
    camera: any
    textureCamera:any
    textureScene: any
    scene:any
    renderer2:any
    texture:any
    textureRenderTarget:any
    uniforms: any
    constructor(){
        this.animate = this.animate.bind(this)
        setTimeout(()=>{
            this.init()
        }, 500)
        //this.init()
    }
    init(){

        // make the scene we will render to the RenderTarget
        // make the scene we will render to the real canvas
    
        this.container = document.getElementById('container') as HTMLDivElement
    
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);
    
        this.renderer2 = new THREE.WebGLRenderer();
        this.renderer2.setSize(width, height);
    
        this.container.appendChild(this.renderer.domElement);
        this.container.appendChild(this.renderer2.domElement);
    
        
        // make the render target scene
        this.textureScene = new THREE.Scene();
        this.textureCamera = new THREE.PerspectiveCamera(
            75,
            1,
            0.1,
            1000);
    
            this.textureCamera.position.z = 5
    
    
            this.textureRenderTarget = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat
        });
    
        this.textureCamera.position.z = 2;
        this.textureCamera.lookAt(new THREE.Vector3(0, 0, 0))
        this.textureScene.add(this.textureCamera)
    
        this.uniforms = {
            u_time: {
                type: "f",
                value: 0.0
            }
        };
    
        //the one we render off-screen
        const textureMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: `
        varying vec2 vUV;
    
        void main() {
        vUV = uv;
    
        // Convert UV to absolute XY.
        vec2 xy = uv * 2.0 - 1.0;
    
        // Draw at end of clip space to allow occlusion.
        gl_Position = vec4(xy, 1.0, 1.0);
        }`,
            
            fragmentShader: `
        varying vec2 vUV;
        uniform float u_time;
        void main() {
            float t = length(vUV) * 10.0;
            float x = sin(t + u_time) / 3.0;
            gl_FragColor.rgb = vec3(x, x, x);
        }
        `
        });
    
        var box = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 16, 16), textureMaterial);
        this.textureScene.add(box);
    
        // make the real scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            1,
            0.1,
            1000);
        this.camera.position.z = 2;
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.scene.add(this.camera);
    
        var map = new THREE.TextureLoader().load('tiling-mosaic.png' );
    
        var material = new THREE.MeshPhongMaterial({
            shininess: 0.1,
            map,
            specular: 0.7,
            bumpMap: this.textureRenderTarget.texture,
            displacementMap: this.textureRenderTarget.texture,
            //normalMap: textureRenderTarget.texture,
            displacementScale: 0.2,
            bumpScale: 0.2
        });
        
        material.side = THREE.DoubleSide;
        // the real scene has a mesh and a light
        var mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 16, 16), material);
        mesh.position.set(0, 0, 0);
        
        var light = new THREE.PointLight(0xffffff, 0.9);
        light.position.set(0, 0, 10);
    
        this.scene.add(mesh);
        this.scene.add(light);
    
        //mesh.rotation.x += 0.005
        //mesh.rotation.y += 0.01
        //mesh.rotation.z -= 0.022
    
        this.animate();
    }
    animate(){
        //@ts-ignore
        this.renderer.render(this.textureScene, this.textureCamera, this.textureRenderTarget, true);
        this.renderer2.render(this.textureScene, this.textureCamera)
        this.renderer.render(this.scene, this.camera);
        this.uniforms.u_time.value += 0.05;
        requestAnimationFrame(this.animate);
    }
}

