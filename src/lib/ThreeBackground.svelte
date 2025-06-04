<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { theme } from '$lib/stores';
  import { browser } from '$app/environment'; // Add this import

  let container;
  let renderer, scene, camera, animationId;
  let particles = [];
  let themeUnsubscribe;
  let currentTheme = 'light';

  onMount(() => {
    if (!browser) return; // Skip in SSR

    // Set initial theme
    currentTheme = $theme || 'light';

    // Subscribe to theme changes
    themeUnsubscribe = theme.subscribe(value => {
      currentTheme = value;
      updateParticleMaterials();
    });

    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 80;

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Particle parameters
    const particleCount = 300;
    const geometry = new THREE.SphereGeometry(1, 16, 16);
    const particleColor = currentTheme === 'dark' ? 0xffffff : 0x000000;

    for (let i = 0; i < particleCount; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: particleColor,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });

      // Halve the scale
      const scaleFactor = Math.random() * 1 + 0.5;

      const particle = new THREE.Mesh(geometry.clone(), material);
      particle.position.set(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      );
      particle.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // Add velocity for random movement
      particle.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      );

      scene.add(particle);
      particles.push(particle);
    }

    function animate() {
      animationId = requestAnimationFrame(animate);
      particles.forEach((p) => {
        // Random movement
        p.position.add(p.userData.velocity);

        // Boundary check - wrap around
        if (p.position.x > 100) p.position.x = -100;
        if (p.position.x < -100) p.position.x = 100;
        if (p.position.y > 100) p.position.y = -100;
        if (p.position.y < -100) p.position.y = 100;
        if (p.position.z > 100) p.position.z = -100;
        if (p.position.z < -100) p.position.z = 100;
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
  });

  function updateParticleMaterials() {
    const newColor = currentTheme === 'dark' ? 0xffffff : 0x000000;
    particles.forEach(p => {
      p.material.color.setHex(newColor);
    });
  }

  onDestroy(() => {
    if (!browser) return; // Skip in SSR
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', handleResize);
    renderer.dispose();
    particles = [];
    if (themeUnsubscribe) themeUnsubscribe();
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
