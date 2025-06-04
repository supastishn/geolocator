<script>
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	
	let canvas;
	
	onMount(() => {
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.z = 5;
		
		const renderer = new THREE.WebGLRenderer({
			canvas,
			alpha: true,
			antialias: true
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		
		// Glowing particles
		const particlesCount = 100;
		const positions = new Float32Array(particlesCount * 3);
		const colors = new Float32Array(particlesCount * 3);
		
		// Initialize positions and colors
		for (let i = 0; i < particlesCount * 3; i += 3) {
			positions[i] = (Math.random() - 0.5) * 20;
			positions[i + 1] = (Math.random() - 0.5) * 20;
			positions[i + 2] = (Math.random() - 0.5) * 20;
			
			colors[i] = 0.6 + Math.random() * 0.4;
			colors[i + 1] = 0.5 + Math.random() * 0.5;
			colors[i + 2] = 1.0;
		}
		
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
		
		const material = new THREE.PointsMaterial({
			size: 0.15,
			blending: THREE.AdditiveBlending,
			vertexColors: true,
			transparent: true,
			opacity: 0.8
		});
		
		const particles = new THREE.Points(geometry, material);
		scene.add(particles);
		
		const animate = () => {
			requestAnimationFrame(animate);
			
			// Update particle positions with smooth movement
			const positionAttribute = particles.geometry.attributes.position;
			const positions = positionAttribute.array;
			
			for (let i = 0; i < positions.length; i += 3) {
				positions[i] += (Math.random() - 0.5) * 0.01;
				positions[i + 1] += (Math.random() - 0.5) * 0.01;
				positions[i + 2] += (Math.random() - 0.5) * 0.01;
			}
			
			positionAttribute.needsUpdate = true;
			particles.rotation.x += 0.001;
			particles.rotation.y += 0.001;
			renderer.render(scene, camera);
		};
		
		animate();
		
		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};
		
		window.addEventListener('resize', handleResize);
		
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});
</script>

<canvas bind:this={canvas} class="background" />

<style>
	.background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
	}
</style>
