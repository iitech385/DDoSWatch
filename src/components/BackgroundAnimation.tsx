import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface BackgroundAnimationProps {
  colors?: string[];
  particleSize?: number;
  rotationSpeed?: number;
  logoPosition?: { x: number; y: number }; // Allows customization of the logo position
}

const BackgroundAnimation = React.memo(({
  colors = ["#800080", "#9932CC", "#BA55D3", "#E6E6FA"],
  particleSize = 3,
  rotationSpeed = 0.002,
  logoPosition = { x: 0, y: 0 },
}: BackgroundAnimationProps) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const mountElement = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 300;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Function to create particle circles
    const createConcentricCircles = (
      radius: number,
      layers: number,
      particleCountBase: number,
      colors: string[]
    ) => {
      const group = new THREE.Group();

      for (let i = 0; i < layers; i++) {
        const layerRadius = radius + i * 40;
        const particleCount = particleCountBase + i * 300;
        const geometry = new THREE.BufferGeometry();
        const positions: number[] = [];
        const colorsArray: number[] = [];
        const opacities: number[] = []; // Opacities for particles

        for (let j = 0; j < particleCount; j++) {
          const angle = (j / particleCount) * Math.PI * 2;
          const x = Math.cos(angle) * layerRadius + 80; // Shift circle to the right
          const z = Math.sin(angle) * layerRadius;
          const y = (Math.random() - 0.5) * 10;

          positions.push(x, y, z);

          // Initial opacity (will be modified later)
          opacities.push(1);

          const color = new THREE.Color(colors[i % colors.length]);
          colorsArray.push(color.r, color.g, color.b);
        }

        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(positions, 3)
        );
        geometry.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(colorsArray, 3)
        );

        // Use dynamic opacity per particle
        geometry.setAttribute("opacity", new THREE.Float32BufferAttribute(opacities, 1));

        const material = new THREE.PointsMaterial({
          size: particleSize,
          vertexColors: true,
          transparent: true,
          opacity: 1, // Default opacity for the whole particle system
          blending: THREE.AdditiveBlending,
        });

        const particles = new THREE.Points(geometry, material);
        group.add(particles);
      }

      return group;
    };

    // Dynamic particle count based on window width
    const particleCountBase = Math.min(1000, window.innerWidth / 2);

    // Create only the top particle circle
    const topCircle = createConcentricCircles(150, 7, particleCountBase, colors);
    topCircle.position.y = 15;
    scene.add(topCircle);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate the circle
      topCircle.rotation.y += rotationSpeed;

      // Apply fading effect only to particles near the logo
      const particles = [...topCircle.children];
      particles.forEach((particle: THREE.Object3D) => {
        if (particle instanceof THREE.Points) {
          const positions = particle.geometry.attributes.position.array;
          const opacities = particle.geometry.attributes.opacity.array;

          for (let i = 0; i < positions.length / 3; i++) {
            const x = positions[i * 3];
            const y = positions[i * 3 + 1];

            // Calculate distance to the logo
            const distanceToLogo = Math.sqrt(
              Math.pow(x - logoPosition.x, 2) + Math.pow(y - logoPosition.y, 2)
            );

            // Apply fading effect as particles approach the logo
            const fadeFactor =
              distanceToLogo < 150
                ? Math.max(0.2, 1 - distanceToLogo / 150)
                : 1;

            // Update opacity for the current particle
            opacities[i] = fadeFactor;
          }

          // Update opacity attribute after changes
          particle.geometry.attributes.opacity.needsUpdate = true;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      mountElement?.removeChild(renderer.domElement);
    };
  }, [colors, particleSize, rotationSpeed, logoPosition]);

  return (
    <div
      ref={mountRef}
      style={{ position: "absolute", width: "100%", height: "100%" }}
    />
  );
});

export default BackgroundAnimation;