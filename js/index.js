import State from 'controls-state'
import chroma from 'chroma-js'
import WebGLApp from './lib/WebGLApp'
import assets from './lib/AssetManager'
import { addLights } from './scene/lights'
import { Slides } from './scene/Slides'
import { Background } from './scene/Background'
import { ForegroundCylinder } from './scene/ForegroundCylinder'
import { SlideNoise } from './scene/SlideNoise'

window.DEBUG = window.location.search.includes('debug')

const BACKGROUND = '#5fb8d5'
const FOREGROUND = '#CDAD53'
const OBJECT_COLOR = '#3698D5'

const IS_MOBILE = window.matchMedia('(max-width: 53em)').matches

// grab our canvas
const canvas = document.querySelector('#app')

// setup the WebGLRenderer
const webgl = new WebGLApp({
  canvas,
  // set the scene background color
  background: chroma(BACKGROUND)
    .brighten(0.5)
    .hex(),
  // show the fps counter from stats.js
  showFps: window.DEBUG,
  orbitControls: window.DEBUG && { distance: 5 },
  controls: {
    color: OBJECT_COLOR,
    background: BACKGROUND,
    foreground: FOREGROUND,
    // the interaction displacement
    displacement: new State.Slider(0.5, { min: 0, max: 2, step: 0.01 }),
    // how much there is between the first and the last to arrive
    delayFactor: new State.Slider(2.2, { min: 0, max: 10, step: 0.01 }),
    // the waving effect
    turbulence: {
      speed: new State.Slider(0.2, { min: 0, max: 3, step: 0.01 }),
      frequency: new State.Slider(0.5, { min: 0, max: 2, step: 0.01 }),
      amplitude: new State.Slider(0.2, { min: 0, max: 2, step: 0.01 }),
    },
  },
  // fix the height on mobile
  height: IS_MOBILE ? 500 : undefined,
})

// attach it to the window to inspect in the console
if (window.DEBUG) {
  window.webgl = webgl
}

// hide canvas
webgl.canvas.style.visibility = 'hidden'

const IMAGES = [
  'images/swimsuits/adult-beautiful-bikini-blue-pexels.jpg',
  'images/swimsuits/christopher-campbell2-unsplash.jpg',
  'images/swimsuits/tyler-nix-unsplash.jpg',
]

// preload the first texture
const firstImage = assets.queue({
  url: IMAGES.shift(),
  type: 'texture',
})

// load any queued assets
assets.load({ renderer: webgl.renderer }).then(() => {
  // show canvas
  webgl.canvas.style.visibility = ''

  // move the camera behind
  webgl.camera.position.set(0, 0, 5)

  addLights(webgl)

  // add any "WebGL components" here...
  // append them to the scene so you can
  // use them from other components easily
  webgl.scene.slides = new Slides(webgl, { firstImage, otherImages: IMAGES, Slide: SlideNoise })
  webgl.scene.add(webgl.scene.slides)
  webgl.scene.bg = new Background(webgl)
  webgl.scene.add(webgl.scene.bg)
  webgl.scene.foreground = new ForegroundCylinder(webgl)
  webgl.scene.add(webgl.scene.foreground)

  // start animation loop
  webgl.start()
  webgl.draw()
})
