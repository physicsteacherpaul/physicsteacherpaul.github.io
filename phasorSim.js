/* global requestAnimationFrame */
import { Vec } from './Vec.js'
// import { drawLine } from './drawFunctions.js'
// import { drawForground, drawBackground } from './View/drawView.js'

console.log('st  art')
const phasors = [Vec.unitY.scale(100), Vec.unitX.scale(100)]
const hist = []
let trace = false
let wavelength = 20
const canvas = document.querySelector('#screen')
const cx = canvas.getContext('2d')
// let dropdown = document.getElementById('wavelengthSlide')

const settings = {
  animate: { run: true, notPaused: true },
  smallscreen: false
}
const pos = {
  p1: new Vec(150, 200),
  g1: new Vec(300, 200),
  p2: new Vec(150, 400),
  g2: new Vec(300, 400),
  p3: new Vec(150, 600),
  g3: new Vec(300, 600)
  // componentXY: new Vec(200, 200),
  // resultXY: { x: 300, dx: 5 }
}
console.log(0, 200, phasors[1].mag, phasors[0].phase, 400, 20, 'lightgrey')

// const phasorBase = (n = 2) => { return pos.componentXY.scaleXY(1, n) }

// console.log(pos.componentXY)
// console.log(...pos.componentXY)

addEventListeners()
requestAnimationFrame(animateIt)
update()

function drawForground (c, phasors, pos) {
  c.fillStyle = 'lightgrey'
  c.strokeStyle = 'black'
  drawLine(c, ...pos.p1, ...phasors[0])
  drawLine(c, ...pos.p2, ...phasors[1])
  c.strokeStyle = 'green'
  drawLine(c, ...pos.p3, ...phasors[1])
  c.strokeStyle = 'red'
  drawLine(c, ...pos.p3.add(phasors[1]), ...phasors[0])
  c.strokeStyle = 'black'
  const finalPhasor = phasors[0].add(phasors[1])
  drawLine(c, ...pos.p3.add(finalPhasor), ...finalPhasor.invert())

  const func1 = transformFunc(Math.sin, phasors[0].mag, 1 / wavelength, phasors[0].phase)
  const func2 = transformFunc(Math.sin, phasors[1].mag, 1 / 20, phasors[1].phase)

  iteratePath(...pos.g1, 800, 'red', func1)
  iteratePath(...pos.g2, 800, 'green', func2)
  iteratePath(...pos.g3, 800, 'black', (x) => func1(x) + func2(x))

  if (trace) {
    drawHistory(c)
    if (hist.length < 2000) hist.push(finalPhasor)
  }
  // console.log(hist)
}

function drawHistory (c) {
  cx.strokeStyle = 'grey'
  hist.forEach(
    (v, i, a) => drawLine(c, ...a[i].add(pos.p3), ...a[i].subtract(a[Math.max(i - 1, 0)]))
  )
}

function drawBackground (c, pos) {
  c.fillStyle = 'lightgrey'
  c.strokeStyle = 'black'
  c.strokeRect(0, 0, c.canvas.width, c.canvas.height)
}

function dragEvent (mouseCoords, b) {
  phasors[0] = b.subtract(pos.p1)
  update()
}

function transformFunc (func, A = 1, B = 1, C = 0, D = 0) {
  return (x) => A * func(B * x + C) + D
}

function iteratePath (x1, y1, length, color = 'black', func = Math.sin) {
  if (color) { cx.strokeStyle = color }
  cx.beginPath()
  cx.moveTo(x1, y1 + func(0))
  for (var xx = x1; xx <= x1 + length; xx += 1) {
    cx.lineTo(xx, y1 + func(xx - x1))
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
    if (e.key === '=') { wavelength++ }
    if (e.key === '-') { wavelength-- }
    if (e.key === 'h') { trace = !trace; hist.length = 0 }
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
    // phasors.forEach((v, i, a) => { phasors[i] = phasors[i].rotate(-0.01) })
    phasors[0] = phasors[0].rotate(0.02 * 20 / wavelength)
    phasors[1] = phasors[1].rotate(0.02)

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
