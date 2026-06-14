import { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, Sphere } from '@react-three/drei'
import * as THREE from 'three'

// ─── Robot Head ──────────────────────────────────────────────────────────────
function RobotHead({ mousePos, isPasswordFocused, isSignup }) {
  const headRef = useRef()
  const leftEyeRef = useRef()
  const rightEyeRef = useRef()
  const leftHandRef = useRef()
  const rightHandRef = useRef()
  const leftPupilRef = useRef()
  const rightPupilRef = useRef()
  const leftLidRef = useRef()
  const rightLidRef = useRef()

  const [blinkTimer, setBlinkTimer] = useState(0)
  const [isBlinking, setIsBlinking] = useState(false)
  const breatheRef = useRef(0)
  const clockRef = useRef(0)

  // schedule random blinks
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 2000
      const timer = setTimeout(() => {
        setIsBlinking(true)
        setTimeout(() => setIsBlinking(false), 180)
        scheduleBlink()
      }, delay)
      return timer
    }
    const t = scheduleBlink()
    return () => clearTimeout(t)
  }, [])

  useFrame((state, delta) => {
    clockRef.current += delta
    breatheRef.current += delta

    // breathing
    if (headRef.current) {
      headRef.current.position.y = Math.sin(breatheRef.current * 1.2) * 0.04
      headRef.current.scale.y = 1 + Math.sin(breatheRef.current * 1.2) * 0.012
    }

    // eye / pupil tracking
    const targetX = THREE.MathUtils.clamp(mousePos.x * 0.12, -0.12, 0.12)
    const targetY = THREE.MathUtils.clamp(mousePos.y * 0.08, -0.08, 0.08)

    if (!isPasswordFocused) {
      ;[leftPupilRef, rightPupilRef].forEach((ref) => {
        if (ref.current) {
          ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, ref.current.userData.baseX + targetX, 0.12)
          ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, ref.current.userData.baseY + targetY, 0.12)
        }
      })
    }

    // blink lids
    ;[leftLidRef, rightLidRef].forEach((ref) => {
      if (ref.current) {
        const targetScale = isBlinking ? 0.05 : 1
        ref.current.scale.y = THREE.MathUtils.lerp(ref.current.scale.y, targetScale, 0.25)
      }
    })

    // hands cover/uncover eyes for password
    if (leftHandRef.current && rightHandRef.current) {
      const targetLeftX = isPasswordFocused ? -0.18 : -0.55
      const targetRightX = isPasswordFocused ? 0.18 : 0.55
      const targetY = isPasswordFocused ? 0.18 : -0.55
      const targetZ = isPasswordFocused ? 0.42 : 0.1

      leftHandRef.current.position.x = THREE.MathUtils.lerp(leftHandRef.current.position.x, targetLeftX, 0.1)
      leftHandRef.current.position.y = THREE.MathUtils.lerp(leftHandRef.current.position.y, targetY, 0.1)
      leftHandRef.current.position.z = THREE.MathUtils.lerp(leftHandRef.current.position.z, targetZ, 0.1)

      rightHandRef.current.position.x = THREE.MathUtils.lerp(rightHandRef.current.position.x, targetRightX, 0.1)
      rightHandRef.current.position.y = THREE.MathUtils.lerp(rightHandRef.current.position.y, targetY, 0.1)
      rightHandRef.current.position.z = THREE.MathUtils.lerp(rightHandRef.current.position.z, targetZ, 0.1)
    }

    // LED eyes off when password focused
    if (leftEyeRef.current && rightEyeRef.current) {
      const targetEmissive = isPasswordFocused ? 0 : 1.5
      leftEyeRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(leftEyeRef.current.material.emissiveIntensity, targetEmissive, 0.1)
      rightEyeRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(rightEyeRef.current.material.emissiveIntensity, targetEmissive, 0.1)
    }

    // subtle idle head rotation
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(clockRef.current * 0.4) * 0.06
    }
  })

  // orange/yellow palette
  const orange = '#f97316'
  const amber = '#fbbf24'
  const dark = '#1c1917'
  const metal = '#78716c'
  const lightMetal = '#d6d3d1'
  const eyeGlow = isSignup ? '#34d399' : '#f97316'

  return (
    <group ref={headRef} position={[0, 0, 0]}>
      {/* HEAD */}
      <RoundedBox args={[1.1, 1.0, 0.9]} radius={0.18} smoothness={6}>
        <meshStandardMaterial color={orange} metalness={0.3} roughness={0.4} />
      </RoundedBox>

      {/* FOREHEAD PANEL */}
      <RoundedBox args={[0.7, 0.22, 0.05]} radius={0.04} position={[0, 0.28, 0.46]}>
        <meshStandardMaterial color={dark} metalness={0.6} roughness={0.3} />
      </RoundedBox>

      {/* ANTENNA */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
        <meshStandardMaterial color={metal} metalness={0.8} roughness={0.2} />
      </mesh>
      <Sphere args={[0.07, 12, 12]} position={[0, 0.82, 0]}>
        <meshStandardMaterial color={amber} emissive={amber} emissiveIntensity={1.2} />
      </Sphere>

      {/* EAR BOLTS */}
      {[-0.58, 0.58].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.1, 8]} />
          <meshStandardMaterial color={metal} metalness={0.9} roughness={0.2} rotation={[0, 0, Math.PI / 2]} />
        </mesh>
      ))}

      {/* LEFT EYE SOCKET */}
      <RoundedBox args={[0.28, 0.22, 0.06]} radius={0.06} position={[-0.22, 0.08, 0.46]}>
        <meshStandardMaterial color={dark} />
      </RoundedBox>
      {/* RIGHT EYE SOCKET */}
      <RoundedBox args={[0.28, 0.22, 0.06]} radius={0.06} position={[0.22, 0.08, 0.46]}>
        <meshStandardMaterial color={dark} />
      </RoundedBox>

      {/* LEFT EYE GLOW */}
      <Sphere ref={leftEyeRef} args={[0.09, 16, 16]} position={[-0.22, 0.08, 0.5]}>
        <meshStandardMaterial color={eyeGlow} emissive={eyeGlow} emissiveIntensity={1.5} />
      </Sphere>
      {/* RIGHT EYE GLOW */}
      <Sphere ref={rightEyeRef} args={[0.09, 16, 16]} position={[0.22, 0.08, 0.5]}>
        <meshStandardMaterial color={eyeGlow} emissive={eyeGlow} emissiveIntensity={1.5} />
      </Sphere>

      {/* LEFT PUPIL */}
      <Sphere
        ref={leftPupilRef}
        args={[0.04, 10, 10]}
        position={[-0.22, 0.08, 0.56]}
        userData={{ baseX: -0.22, baseY: 0.08 }}
      >
        <meshStandardMaterial color={dark} />
      </Sphere>
      {/* RIGHT PUPIL */}
      <Sphere
        ref={rightPupilRef}
        args={[0.04, 10, 10]}
        position={[0.22, 0.08, 0.56]}
        userData={{ baseX: 0.22, baseY: 0.08 }}
      >
        <meshStandardMaterial color={dark} />
      </Sphere>

      {/* LEFT EYELID (for blinking) */}
      <RoundedBox ref={leftLidRef} args={[0.28, 0.22, 0.07]} radius={0.06} position={[-0.22, 0.08, 0.51]}>
        <meshStandardMaterial color={orange} />
      </RoundedBox>
      {/* RIGHT EYELID */}
      <RoundedBox ref={rightLidRef} args={[0.28, 0.22, 0.07]} radius={0.06} position={[0.22, 0.08, 0.51]}>
        <meshStandardMaterial color={orange} />
      </RoundedBox>

      {/* MOUTH */}
      <RoundedBox args={[0.38, 0.07, 0.05]} radius={0.03} position={[0, -0.22, 0.46]}>
        <meshStandardMaterial color={dark} />
      </RoundedBox>
      {/* MOUTH SMILE DOTS */}
      {[-0.12, 0, 0.12].map((x, i) => (
        <Sphere key={i} args={[0.025, 8, 8]} position={[x, -0.22, 0.5]}>
          <meshStandardMaterial color={amber} emissive={amber} emissiveIntensity={0.8} />
        </Sphere>
      ))}

      {/* NECK */}
      <mesh position={[0, -0.62, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.22, 10]} />
        <meshStandardMaterial color={metal} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* SHOULDERS */}
      <RoundedBox args={[1.4, 0.26, 0.7]} radius={0.1} position={[0, -0.84, 0]}>
        <meshStandardMaterial color={orange} metalness={0.3} roughness={0.4} />
      </RoundedBox>

      {/* CHEST PANEL */}
      <RoundedBox args={[0.5, 0.22, 0.06]} radius={0.04} position={[0, -0.84, 0.37]}>
        <meshStandardMaterial color={dark} metalness={0.5} roughness={0.3} />
      </RoundedBox>
      {/* CHEST LED */}
      <Sphere args={[0.055, 10, 10]} position={[0, -0.84, 0.42]}>
        <meshStandardMaterial color={amber} emissive={amber} emissiveIntensity={isSignup ? 2 : 1} />
      </Sphere>

      {/* LEFT ARM */}
      <mesh position={[-0.82, -0.84, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.1, 0.09, 0.55, 10]} />
        <meshStandardMaterial color={orange} metalness={0.3} roughness={0.4} />
      </mesh>
      {/* RIGHT ARM */}
      <mesh position={[0.82, -0.84, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.1, 0.09, 0.55, 10]} />
        <meshStandardMaterial color={orange} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* LEFT HAND */}
      <RoundedBox
        ref={leftHandRef}
        args={[0.22, 0.22, 0.12]}
        radius={0.06}
        position={[-0.55, -0.55, 0.1]}
      >
        <meshStandardMaterial color={amber} metalness={0.4} roughness={0.3} />
      </RoundedBox>
      {/* RIGHT HAND */}
      <RoundedBox
        ref={rightHandRef}
        args={[0.22, 0.22, 0.12]}
        radius={0.06}
        position={[0.55, -0.55, 0.1]}
      >
        <meshStandardMaterial color={amber} metalness={0.4} roughness={0.3} />
      </RoundedBox>
    </group>
  )
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function Scene({ mousePos, isPasswordFocused, isSignup }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 5]} intensity={1.4} castShadow />
      <directionalLight position={[-3, 2, 2]} intensity={0.5} color="#fbbf24" />
      <pointLight position={[0, 2, 3]} intensity={0.8} color="#f97316" />
      <RobotHead mousePos={mousePos} isPasswordFocused={isPasswordFocused} isSignup={isSignup} />
    </>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function Robot3D({ isPasswordFocused, isSignup }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      })
    }

    const handleKey = (e) => {
      const step = 0.5
      setMousePos((prev) => {
        switch (e.key) {
          case 'ArrowLeft':  return { ...prev, x: Math.max(prev.x - step, -1) }
          case 'ArrowRight': return { ...prev, x: Math.min(prev.x + step, 1) }
          case 'ArrowUp':    return { ...prev, y: Math.min(prev.y + step, 1) }
          case 'ArrowDown':  return { ...prev, y: Math.max(prev.y - step, -1) }
          default: return prev
        }
      })
    }

    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('keydown', handleKey)
    }
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 0, 3.2], fov: 42 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene mousePos={mousePos} isPasswordFocused={isPasswordFocused} isSignup={isSignup} />
    </Canvas>
  )
}
