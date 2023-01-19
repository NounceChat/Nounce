import { MeshDistortMaterial, Sphere } from "@react-three/drei";

export default function AnimatedSphere() {
  return (
    <Sphere visible args={[1, 100, 200]} scale={2.5}>
      <MeshDistortMaterial
        color= "#bb01f3"
        attach="material"
        distort={0.4}
        speed={1.5}
        roughness={0}
      />
    </Sphere>
  );
}
