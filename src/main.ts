//@ts-ignore
import * as THREE from 'three'

import { Ripples } from './ripples/ripples';
import { Ripples2 } from './ripples/ripples2';
import { Ripples3 } from './ripples/ripples3';
import { Ripples4 } from './ripples/ripples4';
import "./styles.css"

console.log("V", THREE.REVISION)

new Ripples4();
new Ripples2();
new Ripples3();
new Ripples();
new Ripples2();