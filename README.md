 rose_flower
A mesmerizing, procedurally generated 3D glowing rose built with Three.js. Features custom shaders, bloom post-processing, and interactive camera controls. Zero external 3D models or textures required!🌹
 Procedural Glowing Rose 🌹

A captivating 3D web experience featuring a procedurally generated glowing rose. Built entirely from scratch using **Three.js**, this project requires zero external assets (no 3D models, images, or textures). Every petal, the stem, and the magical floating particles are calculated mathematically directly within the browser!

  Features

Procedural Geometry:** The rose petals and stem are generated dynamically using mathematical curves (`CatmullRomCurve3`) and modified plane geometries.
    Custom Shaders:** Features floating, glowing pollen particles powered by a custom GLSL `ShaderMaterial`.
    Post-Processing:** Utilizes `UnrealBloomPass` to create a rich, cinematic, and magical glow effect.
    Interactive Controls:** Drag to rotate, scroll to zoom, and explore the rose from any angle using Three.js `OrbitControls`.
    Zero Build Tools:** Runs natively in the browser via ES modules and unpkg CDNs. No npm, Webpack, or Vite required.

 Getting Started

Because this project is fully self-contained, getting it running is incredibly simple:

1. Clone this repository:
   ```bash
   git clone [https://github.com/wake-bikila-dev/rose_flower.git](https://github.com/wake-bikila-dev/rose_flower.git)
