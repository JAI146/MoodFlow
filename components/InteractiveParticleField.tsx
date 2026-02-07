'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface MousePosition {
    x: number
    y: number
}

function ParticleField({ mousePos }: { mousePos: React.MutableRefObject<MousePosition> }) {
    const particlesRef = useRef<THREE.Points>(null)
    const linesRef = useRef<THREE.LineSegments>(null)

    // Create particles
    const particleCount = 100
    const particles = useMemo(() => {
        const positions = new Float32Array(particleCount * 3)
        const velocities = new Float32Array(particleCount * 3)

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 20
            positions[i + 1] = (Math.random() - 0.5) * 20
            positions[i + 2] = (Math.random() - 0.5) * 10

            velocities[i] = (Math.random() - 0.5) * 0.02
            velocities[i + 1] = (Math.random() - 0.5) * 0.02
            velocities[i + 2] = (Math.random() - 0.5) * 0.01
        }

        return { positions, velocities }
    }, [])

    // Animation loop
    useFrame(() => {
        if (!particlesRef.current) return

        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
        const velocities = particles.velocities

        // Update particle positions
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] += velocities[i]
            positions[i + 1] += velocities[i + 1]
            positions[i + 2] += velocities[i + 2]

            // Mouse interaction
            const dx = mousePos.current.x * 10 - positions[i]
            const dy = mousePos.current.y * 10 - positions[i + 1]
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 3) {
                const force = (3 - distance) / 3
                positions[i] -= dx * force * 0.01
                positions[i + 1] -= dy * force * 0.01
            }

            // Boundary check
            if (Math.abs(positions[i]) > 10) velocities[i] *= -1
            if (Math.abs(positions[i + 1]) > 10) velocities[i + 1] *= -1
            if (Math.abs(positions[i + 2]) > 5) velocities[i + 2] *= -1
        }

        particlesRef.current.geometry.attributes.position.needsUpdate = true

        // Update connection lines
        if (linesRef.current) {
            const linePositions: number[] = []
            const maxDistance = 2.5

            for (let i = 0; i < particleCount; i++) {
                for (let j = i + 1; j < particleCount; j++) {
                    const dx = positions[i * 3] - positions[j * 3]
                    const dy = positions[i * 3 + 1] - positions[j * 3 + 1]
                    const dz = positions[i * 3 + 2] - positions[j * 3 + 2]
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

                    if (distance < maxDistance) {
                        linePositions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
                        linePositions.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2])
                    }
                }
            }

            linesRef.current.geometry.setAttribute(
                'position',
                new THREE.BufferAttribute(new Float32Array(linePositions), 3)
            )
        }

        // Gentle rotation
        if (particlesRef.current.parent) {
            particlesRef.current.parent.rotation.y += 0.0005
        }
    })

    return (
        <group>
            <points ref={particlesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[particles.positions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.1}
                    color="#6366F1"
                    transparent
                    opacity={0.8}
                    sizeAttenuation
                />
            </points>

            <lineSegments ref={linesRef}>
                <bufferGeometry />
                <lineBasicMaterial color="#8B5CF6" transparent opacity={0.2} />
            </lineSegments>
        </group>
    )
}

export default function InteractiveParticleField() {
    const mouseRef = useRef<MousePosition>({ x: 0, y: 0 })

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1

        mouseRef.current = { x, y }
    }

    return (
        <div
            className="fixed inset-0 -z-10 opacity-40"
            onMouseMove={handleMouseMove}
        >
            <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
                <ParticleField mousePos={mouseRef} />
            </Canvas>
        </div>
    )
}
