import { onBoard } from '@/features/auth/action/onboard'
import { ChatShell } from '@/features/conversation/components/chat-shell'
import { auth } from '@clerk/nextjs/server'
// import { auth } from '@clerk/nextjs'
import React from 'react'

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
    await auth.protect()
    await onBoard()
    return (
        <ChatShell>
            {children}
        </ChatShell>
    )
}


export default RootLayout
