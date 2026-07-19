import { onBoard } from '@/features/auth/action/onboard'
import { auth } from '@clerk/nextjs/server'
// import { auth } from '@clerk/nextjs'
import React from 'react'

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
    await auth.protect()
    await onBoard()
    return (
        <section className='flex flex-col h-screen items-center justify-center '>
            <div className='w-full max-w-md'>
                {children}
            </div>
        </section>
    )
}


export default RootLayout
