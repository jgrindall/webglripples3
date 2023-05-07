//@ts-ignore
import * as THREE from 'three'
//@ts-ignore
import vertexShader from "./vShader"
//@ts-ignore
import fragmentShader from "./fShader"

console.log("V", THREE.REVISION)

let divisor = 0.1;
const w = 800
const h = 400

export class Ripples{
    noise_texture:any
    rtTexture1: any
    rtTexture2: any
    environment: any
    pooltex:any
    container:any;
    camera:any
    scene:any
    renderer:any;
    uniforms:any;
    newmouse = {
        x: 0,
        y: 0
    };
    constructor(){
        this.animate = this.animate.bind(this)
        this.load()
    }
    makeTextures(){
        this.rtTexture1 = new THREE.WebGLRenderTarget(w, h, {
            type: THREE.FloatType,
            minFilter: THREE.NearestMipMapNearestFilter
        });
        this.rtTexture2 = new THREE.WebGLRenderTarget(w, h, {
            type: THREE.FloatType,
            minFilter: THREE.NearestMipMapNearestFilter
        });
    }
    load(){
        let loader = new THREE.TextureLoader();
        loader.load(
            './noise.png',
            (tex:any) => {
                this.noise_texture = tex;
                this.noise_texture.wrapS = THREE.RepeatWrapping;
                this.noise_texture.wrapT = THREE.RepeatWrapping;
                this.noise_texture.minFilter = THREE.LinearFilter;

                loader.load(
                    './env_lat-lon.png',
                    (tex:any) => {
                        this.environment = tex;
                        this.environment.wrapS = THREE.RepeatWrapping;
                        this.environment.wrapT = THREE.RepeatWrapping;
                        this.environment.minFilter = THREE.NearestMipMapNearestFilter;

                        loader.load(
                            './tiling-mosaic.png',
                            (tex:any) => {
                                this.pooltex = tex;
                                this.pooltex.wrapS = THREE.RepeatWrapping;
                                this.pooltex.wrapT = THREE.RepeatWrapping;
                                this.pooltex.minFilter = THREE.NearestMipMapNearestFilter;

                                this.init();
                                this.animate(0);
                            }
                        )
                    }
                );
            }
        );
    }
    init(){
        this.container = document.getElementById('container');
        this.camera = new THREE.PerspectiveCamera();
        this.camera.position.z = 1;
        this.scene = new THREE.Scene();
        var geometry = new THREE.PlaneGeometry(2, 2, 16, 16);
    
        this.makeTextures()
    
        this.uniforms = {
            u_time: { type: "f", value: 1.0 },
            u_resolution: { type: "v2", value: new THREE.Vector2() },
            u_noise: { type: "t", value: this.noise_texture },
            u_buffer: { type: "t", value: this.rtTexture1.texture },
            u_texture: { type: "t", value: this.pooltex },
            u_environment: { type: "t", value: this.environment },
            u_mouse: { type: "v3", value: new THREE.Vector3() },
            u_frame: { type: "i", value: -1.0 },
            u_renderpass: { type: 'b', value: false }
        };
    
        var material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader,
            fragmentShader,
            bumpMap: this.rtTexture1.texture,
            displacementMap: this.rtTexture1.texture,
        });
        material.extensions.derivatives = true;
    
        var mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        this.renderer = new THREE.WebGLRenderer();
        this.container.appendChild(this.renderer.domElement);
    
        this.onWindowResize();
        this.addListeners()
    }
    addListeners(){
        document.addEventListener('pointermove', (e) => {
            e.preventDefault()
            //console.log(e.pageX, e.pageY)
            this.newmouse.x = (e.pageX - w / 2) / h;
            this.newmouse.y = (e.pageY - h / 2) / h * -1;
        });
        document.addEventListener('pointerdown', () => {
            this.uniforms.u_mouse.value.z = 1;
        });
        document.addEventListener('pointerup', () => {
            this.uniforms.u_mouse.value.z = 0;
        });
    }
    animate(delta: number){
        requestAnimationFrame(this.animate);
        this.render(delta);
    }
    render(delta: number){
        this.uniforms.u_frame.value++;
        this.uniforms.u_mouse.value.x += (this.newmouse.x - this.uniforms.u_mouse.value.x) * divisor;
        this.uniforms.u_mouse.value.y += (this.newmouse.y - this.uniforms.u_mouse.value.y) * divisor;
        this.uniforms.u_time.value = delta * 0.0005;
        this.renderer.render(this.scene, this.camera);
        this.renderTexture();
    }
    renderTexture(){

        this.uniforms.u_resolution.value.x = w;
        this.uniforms.u_resolution.value.y = h;

        this.uniforms.u_buffer.value = this.rtTexture2.texture;
        this.uniforms.u_renderpass.value = true;

        this.renderer.setRenderTarget(this.rtTexture1);
        this.renderer.render(this.scene, this.camera, this.rtTexture1, true);

        //swap
        let rtTexture1_ = this.rtTexture1
        this.rtTexture1 = this.rtTexture2;
        this.rtTexture2 = rtTexture1_;

        this.uniforms.u_buffer.value = this.rtTexture1.texture;

        this.uniforms.u_renderpass.value = false;
    }
    onWindowResize() {
        this.renderer.setSize(w, h);
        this.uniforms.u_resolution.value.x = w;
        this.uniforms.u_resolution.value.y = h;
        this.makeTextures()
        this.uniforms.u_frame.value = -1;
    }

}

