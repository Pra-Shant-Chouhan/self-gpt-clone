import { getConversation } from '@/features/conversation/actions/conversation-action'
import { notFound } from 'next/navigation'
import React from 'react'
type ConversationPageProps = {
    params: Promise<{
        id: string
    }>
}

const conversationPage = async ({ params }: ConversationPageProps) => {
    const { id } = await params;
    try {
        await getConversation(id);
    } catch (error) {
        notFound();
    }
    // const intialMessages = await loadChatMessages(id)
    return (
        <div>
            {id}
        </div>
    )
}

export default conversationPage
