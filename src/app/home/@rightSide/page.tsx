"use client"
import dynamic from 'next/dynamic'
import { Separator } from '@heroui/react'
import { Suspense } from 'react'
import LineBox from '@/components/LineBox'
import Link from 'next/link'

// Dynamic import prevents SSR for Three.js — avoids "document is not defined" 
// and WebGL context issues on page reload
const CodeIcon3D = dynamic(() => import('@/components/3DCode'), { ssr: false })

function RightSide() {
  return (
    <div className="relative grow h-full p-2">
      <div style={{ height: 250 }}>
        <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-muted">Loading 3D...</div>}>

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
            height="100%"
          />

        </Suspense>
      </div>
      <Separator className='mb-7' />
      <aside>
        <p className='tracking-[1rem] uppercase text-lg'>links</p>
        <section className='mt-6'>

          <LineBox className='w-full'>
            <Link href="https://github.com/SGOD-pro" target='_blank' className="flex w-full min-w-0 flex-col gap-1 group">
              <h5 className="text-muted tracking-[.4em] uppercase group-hover:text-accent font-plex font-semibold ">GITHUB</h5>
              <p className="line-clamp-1 w-full text-command lowercase text-xs">https://github.com/SGOD-pro</p>
            </Link>
          </LineBox>
          <LineBox className='w-full'>
            <Link href="https://www.linkedin.com/in/souvik-karmakar-578097274/o" target='_blank' className="flex w-full min-w-0 flex-col gap-1 group">
              <h5 className="text-muted tracking-[.4em] uppercase group-hover:text-accent font-plex font-semibold">LINKEDIN</h5>
              <p className="line-clamp-1 w-full text-command lowercase text-sm">https://www.linkedin.com/in/souvik-karmakar-578097274/</p>
            </Link>
          </LineBox>
          <LineBox className='w-full'>
            <Link href="mailto:souvik.dev07@gmail.com" target='_blank' className="flex w-full min-w-0 flex-col gap-1 group">
              <h5 className="text-muted tracking-[.4em] uppercase group-hover:text-accent font-plex font-semibold">EMAIL</h5>
              <p className="line-clamp-1 w-full text-command lowercase text-sm">souvik.dev07@gmail.com</p>
            </Link>
          </LineBox>
        </section>

      </aside>
    </div>

  )
}

export default RightSide