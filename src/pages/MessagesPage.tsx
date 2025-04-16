
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useMessages, useConversation } from "@/hooks/use-supabase-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  
  const { data: conversations, isLoading: conversationsLoading, refetch: refetchConversations } = useMessages(user?.id);
  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = useConversation(user?.id, activeConversation || undefined);
  
  // Set first conversation as active by default
  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeConversation) {
      setActiveConversation(conversations[0].participantId);
    }
  }, [conversations, activeConversation]);

  // Redirect to login page if not authenticated
  if (!loading && !user) {
    navigate("/login");
    return null;
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        recipient_id: activeConversation,
        content: newMessage
      });

      if (error) throw error;
      
      setNewMessage("");
      refetchMessages();
      refetchConversations();
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredConversations = conversations?.filter(conv => 
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">Communicate with your partners and organizers</p>
      </div>

      <div className="flex h-[calc(100vh-13rem)] overflow-hidden bg-white border rounded-lg">
        {/* Conversations sidebar */}
        <div className="w-full max-w-xs border-r">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search messages..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {conversationsLoading ? (
              <div className="space-y-2 p-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div 
                  key={conversation.participantId}
                  onClick={() => setActiveConversation(conversation.participantId)}
                  className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${activeConversation === conversation.participantId ? 'bg-muted' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={conversation.participantImage} alt={conversation.participantName} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {conversation.participantName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium truncate">{conversation.participantName}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(conversation.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="bg-primary text-primary-foreground h-5 w-5 rounded-full flex items-center justify-center text-xs font-medium">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery ? "No matching conversations" : "No conversations yet"}
              </div>
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 flex flex-col">
          {activeConversation && conversations?.length > 0 ? (
            <>
              {/* Conversation header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage 
                      src={conversations.find(c => c.participantId === activeConversation)?.participantImage} 
                      alt={conversations.find(c => c.participantId === activeConversation)?.participantName || "User"} 
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(conversations.find(c => c.participantId === activeConversation)?.participantName || "User").substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {conversations.find(c => c.participantId === activeConversation)?.participantName || "User"}
                    </h3>
                    <p className="text-xs text-muted-foreground">Active now</p>
                  </div>
                </div>
                <div>
                  <Button variant="ghost" size="sm">View Profile</Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : ""}`}>
                        <div className={`flex items-start gap-2 max-w-[70%] ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
                          {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                          <div>
                            <Skeleton className={`h-16 w-64 rounded-lg`} />
                            <div className={`mt-1 ${i % 2 === 0 ? "text-right" : ""}`}>
                              <Skeleton className="h-3 w-16 inline-block" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : messages && messages.length > 0 ? (
                  messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.sender_id === user?.id ? "justify-end" : ""}`}
                    >
                      <div className={`flex items-start gap-2 max-w-[70%] ${message.sender_id === user?.id ? "flex-row-reverse" : ""}`}>
                        {message.sender_id !== user?.id && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {conversations.find(c => c.participantId === message.sender_id)?.participantName.substring(0, 2).toUpperCase() || "UN"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div 
                            className={`p-3 rounded-lg ${
                              message.sender_id === user?.id 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <div className={`mt-1 text-xs text-muted-foreground ${message.sender_id === user?.id ? "text-right" : ""}`}>
                            {formatTime(message.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-muted-foreground">No messages yet.</p>
                      <p className="text-sm text-muted-foreground">Send a message to start the conversation.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input 
                    placeholder="Type your message..." 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>Send</Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6">
                <h3 className="font-medium text-lg mb-2">No conversation selected</h3>
                <p className="text-muted-foreground mb-4">Select a conversation from the sidebar or start a new one.</p>
                <Button variant="outline" onClick={() => navigate("/partners")}>
                  Find Partners
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
