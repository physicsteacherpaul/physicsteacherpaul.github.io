/* global requestAnimationFrame */
import { Vec } from './Vec.js'
// import { drawLine } from './drawFunctions.js'
// import { drawForground, drawBackground } from './View/drawView.js'

console.log('start')
const phasors = [Vec.unitY.scale(100), Vec.unitX.scale(100)]
let wavelength = 20;
const canvas = document.querySelector('#screen')
const cx = canvas.getContext('2d')
// let dropdown = document.getElementById('wavelengthSlide')

const settings = {
  animate: { run: true, notPaused: true },
  smallscreen: false
}
const pos = {
  componentXY: new Vec(200, 200),
  resultXY: { x: 300, dx: 5 }
}

const phasorBase = (n = 2) => { return pos.componentXY.scaleXY(1, n) }

console.log(pos.componentXY)
console.log(...pos.componentXY)

addEventListeners()
requestAnimationFrame(animateIt)
update()

function drawForground (c, phasors, pos) {
  c.fillStyle = 'lightgrey'
  c.strokeStyle = 'black'
  drawLine(c, ...phasorBase(1), ...phasors[0])
  drawLine(c, ...phasorBase(2), ...phasors[1])
  c.strokeStyle = 'red'
  drawLine(c, ...phasorBase(3), ...phasors[0])
  c.strokeStyle = 'green'
  drawLine(c, ...phasorBase(3).add(phasors[0]), ...phasors[1])
  c.strokeStyle = 'black'
  drawLine(c, ...phasorBase(3).add(phasors[0]).add(phasors[1]), ...phasors[1].add(phasors[0]).invert())
  // console.log(0, 200, phasors[1].mag, phasors[1].theta, 400, 20, 'lightgrey');
  drawSine(...phasorBase(1), phasors[0].mag, phasors[0].phase, 800, wavelength, 'red')
  drawSine(...phasorBase(2), phasors[1].mag, phasors[1].phase, 800, 20, 'green')
  drawResult (...phasorBase(3), phasors[1].mag, 20, phasors[1].phase, phasors[0].mag, wavelength, phasors[0].phase, 800,  'black')
}

function drawBackground (c, pos) {
  c.fillStyle = 'lightgrey'
  c.strokeStyle = 'black'
  c.strokeRect(0, 0, c.canvas.width, c.canvas.height)
}

function dragEvent (mouseCoords, b) {
  phasors[0] = b.subtract(pos.componentXY)
  update()
}

function drawSine (x1, y1, A, theta, length, wl, color = 'black') {
  let fun = (xxx) => A * Math.sin(xPosToTheta(xxx))
  function xPosToTheta (x) {
    return (x - 0) / (wl) - theta
  }
  iteratePath(x1, y1, length, color, fun)
}

function drawResult (x1, y1, A, wl, theta, A2, wl2, theta2, length, color = 'black') {
  let fun = (xxx) => (A * Math.sin(xPosToTheta1(xxx))) + (A2 * Math.sin(xPosToTheta2(xxx)))
  function xPosToTheta1 (x) {
    return (x - 0) / (wl) - theta
  }
  function xPosToTheta2 (x) {
    return (x - 0) / (wl2) - theta2
  }
  iteratePath(x1, y1, length, color, fun)
}

function iteratePath (x1, y1, length, color = 'black', func = Math.sin) {
  if (color) { cx.strokeStyle = color }
  cx.beginPath()
  cx.moveTo(x1, y1)
  for (var xx = x1; xx <= x1 + length; xx += 1) {
    cx.lineTo(xx, y1 + func(xx))
  }
  cx.stroke()
}

function drawLine (c, x1, y1, dx, dy, color) {
  if (color) { c.strokeStyle = color }
  c.beginPath()
  c.moveTo(x1, y1)
  c.lineTo(x1 + dx, y1 + dy)
  c.stroke()
  c.fill()
  c.beginPath()
}

function addEventListeners () {
  let mouseCoords

  document.addEventListener('keypress', (e) => {
     if (e.key === '=') {wavelength++}
     if (e.key === '-') {wavelength--}
    update(true)
  })

  window.addEventListener('touchstart', ({ touches: [e] }) => { mouseCoords = new Vec(e.pageX, e.pageY); settings.animate.notPaused = false })
  window.addEventListener('touchend', ({ touches: [e] }) => { mouseCoords = undefined; settings.animate.notPaused = true })
  window.addEventListener('touchmove', (event) => {
    const { touches: [e] } = event
    if (mouseCoords) {
      const b = new Vec(e.pageX, e.pageY)
      dragEvent(mouseCoords, b)
      mouseCoords = b
      if (settings.smallscreen) event.preventDefault()
    }
  }, { passive: false })

  window.addEventListener('mousedown', e => { mouseCoords = new Vec(e.offsetX, e.offsetY); settings.animate.notPaused = false })
  window.addEventListener('mouseup', e => { mouseCoords = undefined; settings.animate.notPaused = true })
  window.addEventListener('dblclick', e => { settings.animate.run = !settings.animate.run })
  window.addEventListener('click', e => {
    if (e.detail === 3) { settings.animate.run = false }
  })
  window.addEventListener('mousemove', (e) => {
    if (mouseCoords) {
      const b = new Vec(e.offsetX, e.offsetY)
      dragEvent(mouseCoords, b)
      mouseCoords = b
    }
  })
}

function update () {
  cx.clearRect(0, 0, cx.canvas.width, cx.canvas.height)
  drawBackground(cx, phasors, pos)
  drawForground(cx, phasors, pos)
}

function animateIt (time, lastTime) {
  if (lastTime != null & settings.animate.run & settings.animate.notPaused) {
    // wave.phase += (time - lastTime) * 0.002
    // const newRay = ray.updatePhase(wave.phase)
    // if (ray.normalisedResultant.phase > newRay.normalisedResultant.phase) {
    //   intensity.addIntensity(ray, undefined, settings.mirror)
    // }
    phasors.forEach((v, i, a) => { phasors[i] = phasors[i].rotate(-0.01) })

    update()
  }

  requestAnimationFrame(newTime => animateIt(newTime, time))
}

// function compactify (small) {
//   if (small) {
//     /* console.log(canvas.style.position); */
//     canvas.height = 600
//     pos.phaseDiagram.y = 500
//     canvas.style.position = 'absolute'
//   } else {
//     pos.phaseDiagram.y = 700
//     canvas.style.position = 'relative'
//     canvas.height = 800
//   }
// }
