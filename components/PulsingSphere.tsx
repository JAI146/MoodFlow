'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Sphere } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function PulsingSphereInner() {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (!meshRef.current) return
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
        meshRef.current.scale.setScalar(pulse)
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
    })

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#EC4899" />
            <Sphere ref={meshRef} args={[1.5, 100, 100]}>
                <MeshDistortMaterial
                    color="#6366F1"
                    distort={0.3}
                    speed={2}
                    roughness={0.1}
                    metalness={0.9}
                />
            </Sphere>
        </>
    )
}

export default function PulsingSphere() {
    return (
        <Canvas camera={{ position: [0, 0, 5] }} className="h-full">
            <PulsingSphereInner />
        </Canvas>
    )
}
