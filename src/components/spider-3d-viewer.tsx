"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, ContactShadows, DragControls, useAnimations } from "@react-three/drei";
import * as THREE from "three";

const largeGrabCursor = `url("data:image/svg+xml;utf8,<svg width='48' height='48' viewBox='0 0 24 24' fill='white' stroke='black' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'><path d='M18 11V6a2 2 0 0 0-4 0V4a2 2 0 0 0-4 0V5a2 2 0 0 0-4 0v6H5a2 2 0 0 0-2 2v2a6 6 0 0 0 6 6h6a6 6 0 0 0 6-6v-9z'/></svg>") 24 24, grab`;
const largeGrabbingCursor = `url("data:image/svg+xml;utf8,<svg width='48' height='48' viewBox='0 0 24 24' fill='white' stroke='black' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'><path d='M18 11V6a2 2 0 0 0-4 0V4a2 2 0 0 0-4 0V5a2 2 0 0 0-4 0v6H5a2 2 0 0 0-2 2v2a6 6 0 0 0 6 6h6a6 6 0 0 0 6-6v-9z'/></svg>") 24 24, grabbing`;

function SpiderModel(props: unknown) {
  const { scene, animations } = useGLTF("/3d/low-poly+spider+3d+model.glb");
  const ref = useRef<THREE.Group>(null);
  useAnimations(animations, ref);

  // Clone and traverse the scene to apply the custom brand blue color and vertex shader
  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        // We use onBeforeCompile to inject a wiggle effect into the standard material
        // This makes the static mesh's outer vertices (the legs) wiggle procedurally!
        const material = new THREE.MeshStandardMaterial({
          color: "#1B5FED", // Brand blue color
          roughness: 0.2,
          metalness: 0.5,
        });

        material.onBeforeCompile = (shader) => {
          shader.uniforms.uTime = { value: 0 };
          // Attach uniform reference so we can update it in useFrame
          material.userData.shader = shader;

          shader.vertexShader = `
            uniform float uTime;
            ${shader.vertexShader}
          `.replace(
            `#include <begin_vertex>`,
            `
            #include <begin_vertex>
            
            // Calculate distance from center in the XZ plane
            float dist = length(position.xz);
            
            // The model's max radius is about 0.7. Body is around 0.15.
            float legIntensity = smoothstep(0.15, 0.7, dist);
            
            // Calculate angle to create alternating phase shifts for the 8 legs
            float angle = atan(position.z, position.x);
            
            // 4.0 creates 8 alternating regions around the spider (4 pairs)
            float phase = uTime * 15.0 + angle * 4.0;
            
            // Circular motion for stepping: lift (y) and stride (z)
            float lift = sin(phase) * 0.08 * legIntensity;
            float stride = cos(phase) * 0.08 * legIntensity;
            
            // SUBTRACT lift so the legs pull OUT of the screen (towards the camera).
            // Adding lift was pushing them into the wall, breaking the illusion!
            transformed.y -= lift;
            transformed.z += stride;
            `
          );
        };

        mesh.material = material;
      }
    });
  }, [scene]);

  const [isDragging, setIsDragging] = useState(false);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Spiders move in sudden darts/bursts. 
    // Math.pow with Math.sin creates short, sharp spikes of speed followed by complete stops.
    const burst = Math.pow(Math.max(0, Math.sin(t * 1.5)), 6.0);
    const speed = isDragging ? 0 : burst * 1.2; // Slower, more realistic speed

    // The legs ONLY animate when the spider is actually moving!
    timeRef.current += isDragging ? delta * 5.0 : delta * speed * 4.0;

    // Update the custom shader uniform to wiggle the legs
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (mat.userData?.shader) {
          mat.userData.shader.uniforms.uTime.value = timeRef.current;
        }
      }
    });

    if (!isDragging && ref.current) {
      // The spider's head points towards Local -Y.
      // Translating along -Y moves it straight forward in the direction it's facing!
      ref.current.translateY(-speed * delta);

      // When the spider is paused (not darting), it slowly turns to pick a new direction
      if (burst < 0.1) {
        ref.current.rotation.z += Math.sin(t * 0.5) * 1.0 * delta;
      }

      // Keep the spider inside the screen bounds!
      const boundX = 6.5; // Safe horizontal bound for most screens
      const boundY = 3.5; // Safe vertical bound for most screens

      let hitWall = false;

      if (ref.current.position.x > boundX) {
        ref.current.position.x = boundX;
        hitWall = true;
      } else if (ref.current.position.x < -boundX) {
        ref.current.position.x = -boundX;
        hitWall = true;
      }

      if (ref.current.position.y > boundY) {
        ref.current.position.y = boundY;
        hitWall = true;
      } else if (ref.current.position.y < -boundY) {
        ref.current.position.y = -boundY;
        hitWall = true;
      }

      // If it hits a wall, instantly turn it to face the exact center of the screen!
      if (hitWall) {
        // The head is Local -Y. Math.atan2(dx, -dy) calculates the rotation needed to point -Y at (dx, dy).
        ref.current.rotation.z = Math.atan2(-ref.current.position.x, -ref.current.position.y);
      }
    }
  });

  return (
    <DragControls
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
    >
      <group
        onPointerOver={() => (document.body.style.cursor = largeGrabCursor)}
        onPointerOut={() => (document.body.style.cursor = "auto")}
        onPointerDown={() => (document.body.style.cursor = largeGrabbingCursor)}
        onPointerUp={() => (document.body.style.cursor = largeGrabCursor)}
      >
        <group ref={ref} {...props}>
          {/* Rotate the model 90 degrees on X so its back faces the camera and legs face the screen */}
          <primitive object={scene} scale={2.5} rotation={[Math.PI / 2, Math.PI, 0]} />
        </group>
      </group>
    </DragControls>
  );
}

// Preload the model aggressively
useGLTF.preload("/3d/low-poly+spider+3d+model.glb");

export default function Spider3DViewer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-10 h-full w-full pointer-events-none">
      <Canvas
        className="pointer-events-auto"
        camera={{ position: [0, 0, 10], fov: 45 }}
        dpr={[1, 2]} // Optimal performance scaling for retina vs standard screens
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} />

        <SpiderModel />

        {/* Shadow cast onto the "wall" (XY plane) to eliminate the floating feeling! */}
        <ContactShadows
          position={[0, 0, -1]}
          rotation={[Math.PI / 2, 0, 0]}
          opacity={0.6}
          scale={30}
          blur={2.5}
          far={5}
          color="#000000"
        />
      </Canvas>
    </div>
  );
}
