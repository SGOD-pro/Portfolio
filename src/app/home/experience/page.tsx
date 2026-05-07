import CommandBox from '@/components/CommandBox'
import React from 'react'

function Experience() {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center gap-6">
            <h3 className="text-6xl">Fresher open for <span className="text-success">opportunities</span></h3>
            <p className="text-muted text-lg">I am actively seeking entry-level positions in software development, where I can apply my skills and contribute to innovative projects. I am eager to learn and grow in a dynamic work environment.</p>
            <div className="w-full">

                <CommandBox />
            </div>
        </div>
    )
}

export default Experience