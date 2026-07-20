"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "../utils/query-keys"
import { createConversation, deleteConversation, listConversations, updateConversation } from "../actions/conversation-action"
import { useRouter } from "next/navigation";
import { toast } from "sonner";



/**
 * Fetches all conversations for the sidebar via React Query.
 */
export function useConversations() {
    return useQuery({
        queryKey: queryKeys.conversations.all,
        queryFn: () => listConversations(),
    });
}


/**
 * Mutation hook to create a new conversation and navigate to it.
 */
export function useCreateConversation() {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation({
        mutationFn: (title?: string) => createConversation(title),
        onSuccess: (conversation) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all
            });
            router.push(`/conversation/${conversation.id}`);
        },
        onError: (error: Error) => {
            console.error("Error creating conversation:", error);
        }
    })
}

/** Rename / pin / archive a conversation. */
export function useUpdateConversation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            ...data
        }: {
            id: string;
            titlte?: string;
            isPinned?: boolean;
            isArchived?: boolean;
        }) => updateConversation(id, data),
        onSuccess: (conversation) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all
            });
            void queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.details(conversation.id)
            });  
        },
        onError: (error: Error) => {
            console.error("Error updating conversation:", error);
        }
    })
}

/** Delete a conversation and leave the page if you were viewing it. */
export function useDeleteConversation(activeId?: string) {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation({
        mutationFn:(id:string)=>deleteConversation(id),
        onSuccess: ({id}) => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all
            });
            queryClient.removeQueries({
                queryKey: queryKeys.messages.byConversation(id),
            });
            if (activeId === id) {
                router.push("/");
            }
            toast.success("Conversation deleted successfully.");
        },
        onError: (error: Error) => {
            console.error("Error deleting conversation:", error);
        }
    })
}