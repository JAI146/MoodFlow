'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import { useRef, useState } from 'react'
import * as THREE from 'three'

interface MoodSphereProps {
    color: string
    position: [number, number, number]
    onClick: () => void
}

function MoodSphere({ color, position, onClick }: MoodSphereProps) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [hovered, setHovered] = useState(false)

    useFrame((state) => {
        if (!meshRef.current) return
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[1]) * 0.3
        meshRef.current.rotation.y += 0.01
        if (hovered) {
            meshRef.current.scale.setScalar(1.15)
        } else {
            meshRef.current.scale.setScalar(1)
        }
    })

    return (
        <Sphere
            ref={meshRef}
            args={[0.5, 32, 32]}
            position={position}
            onClick={onClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={hovered ? 0.5 : 0.2}
            />
        </Sphere>
    )
}

interface MoodSpheres3DProps {
    onMoodSelect: (mood: 'low' | 'moderate' | 'high') => void
}

export default function MoodSpheres3D({ onMoodSelect }: MoodSpheres3DProps) {
    return (
        <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <MoodSphere color="#3B82F6" position={[-1, 1, 0]} onClick={() => onMoodSelect('low')} />
            <MoodSphere color="#F59E0B" position={[-1, 0, 0]} onClick={() => onMoodSelect('moderate')} />
            <MoodSphere color="#EF4444" position={[-1, -1, 0]} onClick={() => onMoodSelect('high')} />
        </Canvas>
    )
}
