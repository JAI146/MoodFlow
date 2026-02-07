'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

interface CodeSymbolProps {
    symbol: string
    position: [number, number, number]
    speed: number
}

function CodeSymbol({ symbol, position, speed }: CodeSymbolProps) {
    const ref = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (!ref.current) return
        ref.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * speed) * 0.5
        ref.current.position.y = position[1] + Math.cos(state.clock.elapsedTime * speed) * 0.5
        ref.current.rotation.x += 0.01
        ref.current.rotation.y += 0.01
    })

    return (
        <Text
            ref={ref}
            position={position}
            fontSize={0.5}
            color="#8B5CF6"
            anchorX="center"
            anchorY="middle"
        >
            {symbol}
        </Text>
    )
}

export default function FloatingCodeSymbols() {
    const symbols = ['{', '}', '[', ']', '<', '>', '=', ';', '+', '-', '(', ')', '*', '/', '&']

    return (
        <Canvas camera={{ position: [0, 0, 10] }} className="absolute inset-0 -z-10">
            <ambientLight intensity={0.5} />
            {symbols.map((sym, i) => (
                <CodeSymbol
                    key={i}
                    symbol={sym}
                    position={[
                        Math.random() * 10 - 5,
                        Math.random() * 10 - 5,
                        Math.random() * 10 - 5
                    ]}
                    speed={Math.random() * 0.5 + 0.5}
                />
            ))}
        </Canvas>
    )
}
