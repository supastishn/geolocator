<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';

  let container;
  let renderer, scene, camera, animationId;
  let particles = [];

  onMount(() => {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 80;

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Particle parameters
    const particleCount = 300; // Increased to 300
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const particleColor = 0xffffff;
    const scale = 2; // base scale, will be doubled

    for (let i = 0; i < particleCount; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: particleColor,
        transparent: true,
        opacity: 0.7, // Set card opacity to 0.7
        side: THREE.DoubleSide
      });

      // Double the scale
      const scaleFactor = Math.random() * (scale * 2) + scale;
      const particle = new THREE.Mesh(geometry.clone(), material);
      particle.position.set(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      );
      particle.scale.set(scaleFactor, scaleFactor, scaleFactor);
      scene.add(particle);
      particles.push(particle);
    }

    function animate() {
      animationId = requestAnimationFrame(animate);
      particles.forEach((p, i) => {
        p.rotation.x += 0.002 + i * 0.00001;
        p.rotation.y += 0.003 + i * 0.00001;
      });
      renderer.render(scene, camera);
    }
    animate();

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', handleResize);

    onDestroy(() => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      particles = [];
    });
  });
</script>

<div bind:this={container} class="three-bg"></div>

<style>
  .three-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    width: 100%;
    height: 100%;
  }
</style>
