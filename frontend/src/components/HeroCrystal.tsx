import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";

export function HeroCrystal() {
    return (
        <div className="w-full h-[500px] absolute top-[-100px] left-0 z-0 pointer-events-none opacity-80 mix-blend-screen">
            <Canvas>
                <ambientLight intensity={0.5} />
                <directionalLight position={[2, 5, 2]} intensity={1} />
                <Crystal />
            </Canvas>
        </div>
    );
}

function Crystal() {
    const mesh = useRef(null);
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        if (mesh.current) {
            const time = state.clock.getElapsedTime();
            mesh.current.rotation.x = time * 0.2;
            mesh.current.rotation.y = time * 0.3;
            mesh.current.position.y = Math.sin(time / 1.5) / 5;
        }
    });

    return (
        <Sphere
            args={[1, 100, 200]}
            scale={2.5}
            ref={mesh}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            <MeshDistortMaterial
                color={hovered ? "#00f3ff" : "#bc13fe"}
                attach="material"
                distort={hovered ? 0.6 : 0.4}
                speed={hovered ? 4 : 2}
                roughness={0.2}
                metalness={0.8}
            />
        </Sphere>
    );
}
