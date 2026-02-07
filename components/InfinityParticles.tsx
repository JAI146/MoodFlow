'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function InfinityPath() {
    const particlesRef = useRef<THREE.Points>(null)
    const particleCount = 300

    // Create infinity path points
    const positions = useMemo(() => {
        const pos = new Float32Array(particleCount * 3)
        for (let i = 0; i < particleCount; i++) {
            const t = (i / particleCount) * Math.PI * 2
            const scale = 2
            pos[i * 3] = scale * Math.sin(t) / (1 + Math.cos(t) ** 2)
            pos[i * 3 + 1] = scale * Math.sin(t) * Math.cos(t) / (1 + Math.cos(t) ** 2)
            pos[i * 3 + 2] = 0
        }
        return pos
    }, [])

    useFrame((state) => {
        if (!particlesRef.current) return
        particlesRef.current.rotation.z = state.clock.elapsedTime * 0.1
    })

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particleCount}
                    array={positions}
                    itemSize={3}
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial size={0.05} color="#FFD700" />
        </points>
    )
}

export default function InfinityParticles() {
    return (
        <Canvas camera={{ position: [0, 0, 8] }} className="h-full">
            <ambientLight intensity={0.5} />
            <InfinityPath />
        </Canvas>
    )
}
