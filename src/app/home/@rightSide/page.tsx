"use client"
import CodeIcon3D from '@/components/3DCode'
import { Separator } from '@heroui/react'
function RightSide() {
  return (
    <div className="relative grow h-full p-2">

      <CodeIcon3D
        extrudeDepth={1.2}
        color="#b46004"
        emissiveColor="#b46004"
        size={3}
        rotationSpeed={0.3}
        metalness={0.5}
        roughness={0.8}
        bevelEnabled={true}
        bevelThickness={0.1}
        bevelSize={0.05}
        autoRotate={true}
        background="transparent"
        height={250}
      />
      <Separator className='mb-7' />
      <div className="relative inline-flex border border-segment px-4 py-2 uppercase [--size:calc(var(--spacing)*2.2)]">
        <span>Tools</span>
        <span className="absolute -left-px -right-px -top-px h-[var(--size)] -translate-y-full border-x border-segment" />
        <span className="absolute -left-px -right-px -bottom-px h-[var(--size)] translate-y-full border-x border-segment" />
        <span className="absolute -top-px -bottom-px -left-px w-[var(--size)] -translate-x-full border-y border-segment" />
        <span className="absolute -top-px -bottom-px -right-px w-[var(--size)] translate-x-full border-y border-segment" />
      </div>
    </div>

  )
}

export default RightSide