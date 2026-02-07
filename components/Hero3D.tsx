'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Sphere } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function MoodBrain() {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (!meshRef.current) return
        meshRef.current.rotation.y += 0.002
        const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.02
        meshRef.current.scale.setScalar(scale)
        meshRef.current.rotation.x = state.mouse.y * 0.1
        meshRef.current.rotation.z = state.mouse.x * 0.1
    })

    return (
        <Sphere ref={meshRef} args={[1, 100, 100]}>
            <MeshDistortMaterial
                color="#6366F1"
                distort={0.4}
                speed={1.5}
                roughness={0.2}
                metalness={0.8}
            />
        </Sphere>
    )
}

export default function Hero3D() {
    return (
        <Canvas camera={{ position: [0, 0, 5] }} className="h-full">
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <MoodBrain />
        </Canvas>
    )
}
