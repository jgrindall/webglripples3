//@ts-ignore
import * as THREE from "three"

const w = 768
const h = 512
let divisor = 0.1

const vertexShader = `
void main() {
    gl_Position = vec4( position, 1.0 );
}
`

const fragmentShaderWave = `
varying vec2 vUV;
uniform float u_time;
void main() {
    float t = length(vUV) * 10.0;
    float x = sin(t + u_time) / 3.0;
    gl_FragColor.rgb = vec3(x, x, x);
}
`

const vertexShaderWave = `
varying vec2 vUV;

void main() {
    vUV = uv;
    vec2 xy = uv * 2.0 - 1.0;
    gl_Position = vec4(xy, 1.0, 1.0);
}`

const fragmentShader = `
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform int u_mouse_down;
uniform float u_time;
uniform sampler2D u_texture;
uniform int u_frame;

vec4 g(){

    float attenuation = 0.75;

    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
    float zoom = 2.0;
    vec3 e = vec3(zoom / u_resolution.x, zoom / u_resolution.y, 0.0);
    vec2 _sample = gl_FragCoord.xy / u_resolution.xy;
    float ratio = u_resolution.x / u_resolution.y;
    vec2 mouse = u_mouse.xy - uv;
    vec4 fragcolour = texture2D(u_texture, _sample);
    vec4 texcol = fragcolour;
    
    float shade = 0.0;
    if(u_mouse_down == 1) {
        float _sin = sin(u_time * 10.0) * 0.006;
        shade = smoothstep(0.05 + _sin, 0.0, length(mouse));
    }
    float d;
    if(u_frame < 5){
        d = 0.5;
    }
    else{
        d = shade * 2.0;
        float t = texture2D(u_texture, _sample - e.zy, 1.0).x;
        float r = texture2D(u_texture, _sample - e.xz, 1.0).x;
        float b = texture2D(u_texture, _sample + e.xz, 1.0).x;
        float l = texture2D(u_texture, _sample + e.zy, 1.0).x;
        d += -(texcol.y - 0.5)*2.0 + (t + r + b + l - 2.0);
        d *= 0.85;
        d = d*0.5 + 0.5;
    }
    fragcolour = vec4(d, texcol.x, 0, 0);
    return fragcolour;
}

void main() {
    //float total = gl_FragCoord.x/2000.0;
    gl_FragColor = g();
}
`

const swap = (a:[any, any])=>{
    return [a[1], a[0]]
}

export class Ripples4{

    numRenders: number = 0
    renderer: any
    renderer2: any
    
    renderTarget1:any
    renderTarget2:any
    renderTarget3:any
    
    scene1: any
    scene3: any

    camera: any
    camera3: any
    geometry1: any
    geometry2: any
    
    material1: any
    material2: any
    
    mesh1: any
    mesh3: any

    uniforms: any

    m: any = {
        x: 0,
        y: 0
    }

    constructor(){
        this.render = this.render.bind(this)
        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(w, h)

        this.renderer2 = new THREE.WebGLRenderer()
        this.renderer2.setSize(w, h)

        const container = document.getElementById('container')

        container.appendChild(this.renderer.domElement)
        container.appendChild(this.renderer2.domElement)
        
        this.scene1 = new THREE.Scene()

        const options = {
            minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat
        }
        this.renderTarget1 = new THREE.WebGLRenderTarget(w, h, options)
        this.renderTarget2 = new THREE.WebGLRenderTarget(w, h, options)
        this.renderTarget3 = new THREE.WebGLRenderTarget(w, h, options)

        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
        this.camera.position.z = 2.5
        this.camera.lookAt(new THREE.Vector3(0, 0, 0))

        this.geometry1 = new THREE.PlaneBufferGeometry()

        this.uniforms = {
            u_time: {
                type: "f",
                value: 0.0
            },
            u_frame:{
                type: "i",
                value: 0
            },
            u_mouse: {
                type: "v2",
                value: new THREE.Vector2(0, 0) 
            },
            u_mouse_down: {
                type: "i",
                value: 0 
            },
            u_resolution: {
                type: "v2",
                value: new THREE.Vector2(w, h) 
            },
            u_texture:{
                type: "t",

                value: null
            }
        }
        
        this.material1 = new THREE.ShaderMaterial({
			uniforms : this.uniforms,
			vertexShader: vertexShader,
            fragmentShader: fragmentShader
		})

        this.material1.extensions.derivatives = true;

        this.mesh1 = new THREE.Mesh(this.geometry1, this.material1)

        this.scene1.add(this.mesh1)

        this.scene3 = new THREE.Scene()
        this.camera3 = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
        this.camera3.position.z = 2
        this.camera3.lookAt(new THREE.Vector3(0, 0, 0))
    
        var material3 = new THREE.MeshPhongMaterial({
            shininess: 0.1,
            map: new THREE.TextureLoader().load('tiling-mosaic.png'),
            specular: 0.7,
            bumpMap: this.renderTarget2.texture,
            displacementMap: this.renderTarget2.texture,
            //normalMap: this.renderTarget2.texture,
            displacementScale: 0.1,
            bumpScale: 0.1
        })

       

        // the real scene has a mesh and a light
        this.mesh3 = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 16, 16), material3)
        
        var light = new THREE.PointLight(0xffffff, 0.9)
        light.position.set(0, 0, 10)
    
        this.scene3.add(this.mesh3)
        this.scene3.add(light)
        this.scene3.add(this.camera3)

        this.addListeners()

        this.render(0)
    }

    addListeners(){
        document.addEventListener('pointermove', (e) => {
            this.m.x = (e.pageX - w / 2) / h
            this.m.y = (e.pageY - h / 2) / h * -1

            //this.m.x = e.pageX
            //this.m.y = e.pageY

        })
        document.addEventListener('pointerdown', () => {
            this.uniforms.u_mouse_down.value = 1;
        })
        document.addEventListener('pointerup', () => {
            this.uniforms.u_mouse_down.value = 0;
        })
    }

    getTextures(){
        const textures:[any, any] = [this.renderTarget1,  this.renderTarget2]
        return (this.numRenders % 2 === 0) ? textures : swap(textures)
    }

    render(delta: number){
        const textures = this.getTextures()

        this.uniforms.u_texture.value = textures[1].texture
        
        //this.renderer.setRenderTarget(textures[0])
        this.renderer.render(this.scene1, this.camera, textures[0], true)
        this.renderer.render(this.scene1, this.camera)
        //this.renderer.setRenderTarget(null)
        // the real one
        this.renderer.render(this.scene3, this.camera3)
        
        this.renderer2.render(this.scene1, this.camera)

                
        this.uniforms.u_frame.value++
        this.uniforms.u_time.value = delta * 0.005

        const mouseDx = this.m.x - this.uniforms.u_mouse.value.x
        const mouseDy = this.m.y - this.uniforms.u_mouse.value.y
        
        this.uniforms.u_mouse.value.x += mouseDx * divisor
        this.uniforms.u_mouse.value.y += mouseDy * divisor

        //this.uniforms.u_mouse.value.x = this.m.x
        //this.uniforms.u_mouse.value.y = this.m.y


        this.numRenders++

        //this.renderTarget2.texture.needsUpdate = true
        //this.renderTarget1.texture.needsUpdate = true

        this.mesh3.rotation.x += 0.000001
        this.mesh3.rotation.y += 0.00002
        this.mesh3.rotation.z -= 0.000035

        requestAnimationFrame(this.render)
    }

}
