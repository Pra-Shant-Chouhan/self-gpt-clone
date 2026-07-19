"use server";

import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
// import { title } from "process";

/** Shape of a conversation row returned in the sidebar list. */
export type ConversationListItem = {
    id: string;
    title: string;
    isPinned: boolean;
    isArchived: boolean;
    lastMessageAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Verifies that a conversation exists and belongs to the given user.
 *
 * @throws {Error} When the conversation is not found or not owned by the user.
 */

async function assertOwnsConversation(conversationId: string, userId: string) {
    const user = await requireUser();
    const conversation = await prisma.conversation.findFirst
        ({
            where: { id: conversationId, userId },
            select: { userId: true }
        });
    if (!conversation || conversation.userId !== user.id) {
        throw new Error("Conversation not found or you do not have permission to access it.");
    }
    return conversation;
}

export async function listConversations(): Promise<ConversationListItem[]> {
    const user = await requireUser();
    return prisma.conversation.findMany({
        where: { userId: user.id },
        orderBy: [{
            isPinned: 'desc',
        }, {
            lastMessageAt: 'desc',
        }],
        select: {
            id: true,
            title: true,
            isPinned: true,
            isArchived: true,
            lastMessageAt: true,
            createdAt: true,
            updatedAt: true,
        }
    })
}


export async function createConversation(title: string): Promise<ConversationListItem> {
    const user = await requireUser();
    return prisma.conversation.create({
        data: {
            title: title.trim() || "New Conversation",
            userId: user.id
        },
        select: {
            id: true,
            title: true,
            isPinned: true,
            isArchived: true,
            lastMessageAt: true,
            createdAt: true,
            updatedAt: true,
        }
    })
}

/**
 * Permanently deletes a conversation owned by the current user.
 *
 * @param conversationId - The conversation to delete.
 * @returns The deleted conversation ID.
 */
export async function deleteConversation(conversationId: string) {
    const user = await requireUser();
    await assertOwnsConversation(conversationId, user.id);

    await prisma.conversation.delete({
        where: { id: conversationId },
    });

    revalidatePath("/");
    return { id: conversationId };
}

/**
 * Updates conversation metadata (title, pin, or archive status).
 *
 * @param conversationId - The conversation to update.
 * @param data - Fields to change; omitted fields are left unchanged.
 */
export async function updateConversation(
    conversationId: string,
    data: { title?: string; isPinned?: boolean; isArchived?: boolean }
) {
    const user = await requireUser()
    await assertOwnsConversation(conversationId, user.id)
    const conversation = await prisma.conversation.update({
        where: { id: conversationId },
        data: {
            ...(data.title !== undefined ? { title: data.title.trim() || "New Chat" } : {}),
            ...(data.isPinned !== undefined ? { isPinned: data.isPinned } : {}),
            ...(data.isArchived !== undefined ? { isArchived: data.isArchived } : {}),
        },
    });
    revalidatePath("/");
    revalidatePath(`/c/${conversationId}`);
    return conversation;
}