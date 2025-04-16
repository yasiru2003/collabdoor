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
import { useLocation, useNavigate } from "react-router-dom";
import { NewConversation } from "@/components/messages/new-conversation";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newContactInfo, setNewContactInfo] = useState<{
    participantId: string;
    participantName: string;
  } | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const isMobile = useIsMobile();
  
  const { data: conversations, isLoading: conversationsLoading, refetch: refetchConversations } = useMessages(user?.id);
  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = useConversation(user?.id, activeConversation || undefined);
  
  // Check if we navigated here with a contact request
  useEffect(() => {
    const contactState = location.state as { participantId?: string, participantName?: string } | null;
    
    if (contactState?.participantId && contactState?.participantName && user) {
      setActiveConversation(contactState.participantId);
      setNewContactInfo({
        participantId: contactState.participantId,
        participantName: contactState.participantName
      });
      
      // Clear the location state to prevent re-triggering on navigation
      navigate(location.pathname, { replace: true });
    }
  }, [location, user, navigate]);

  // Set first conversation as active by default if no active one is set
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

  const handleNewMessageSent = () => {
    refetchMessages();
    refetchConversations();
    setNewContactInfo(null);
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

  // Toggle sidebar on mobile when conversation is selected
  useEffect(() => {
    if (isMobile && activeConversation) {
      setShowSidebar(false);
    }
  }, [activeConversation, isMobile]);

  // ... keep existing code (other utility functions)

  return (
    <Layout>
      <div className="mb-4 md:mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Messages</h1>
            <p className="text-muted-foreground text-sm">Communicate with partners and organizers</p>
          </div>
          {isMobile && activeConversation && !showSidebar && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSidebar(true)}
            >
              Back
            </Button>
          )}
        </div>
      </div>

      <div className="flex h-[calc(100vh-13rem)] md:h-[calc(100vh-16rem)] overflow-hidden bg-white border rounded-lg">
        {/* Conversations sidebar */}
        {(!isMobile || showSidebar) && (
          <div className={`${isMobile ? 'w-full' : 'w-full max-w-xs'} border-r`}>
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
            <ScrollArea className="h-[calc(100%-4rem)]">
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
                    onClick={() => {
                      setActiveConversation(conversation.participantId);
                      setNewContactInfo(null);
                    }}
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
            </ScrollArea>
          </div>
        )}

        {/* Messages area */}
        {(!isMobile || !showSidebar) && (
          <div className="flex-1 flex flex-col">
            {activeConversation && conversations?.length > 0 ? (
              <>
                {/* Conversation header */}
                <div className="p-3 md:p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Avatar className="h-8 w-8 md:h-10 md:w-10">
                      <AvatarImage 
                        src={conversations.find(c => c.participantId === activeConversation)?.participantImage} 
                        alt={conversations.find(c => c.participantId === activeConversation)?.participantName || "User"} 
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs md:text-sm">
                        {(conversations.find(c => c.participantId === activeConversation)?.participantName || "User").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-sm md:text-base">
                        {conversations.find(c => c.participantId === activeConversation)?.participantName || "User"}
                      </h3>
                      <p className="text-xs text-muted-foreground">Active now</p>
                    </div>
                  </div>
                  {!isMobile && (
                    <div>
                      <Button variant="ghost" size="sm">View Profile</Button>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-3 md:p-4 space-y-3 md:space-y-4">
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
                  ) : newContactInfo ? (
                    <NewConversation 
                      participantId={newContactInfo.participantId}
                      participantName={newContactInfo.participantName}
                      onMessageSent={handleNewMessageSent}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <p className="text-muted-foreground">No messages yet.</p>
                        <p className="text-sm text-muted-foreground">Send a message to start the conversation.</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>

                {/* Message input */}
                {(!newContactInfo || messages?.length > 0) && (
                  <div className="p-3 md:p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input 
                        placeholder="Type your message..." 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={!newMessage.trim()} size={isMobile ? "sm" : "default"}>Send</Button>
                    </form>
                  </div>
                )}
              </>
            ) : activeConversation && newContactInfo ? (
              <NewConversation 
                participantId={newContactInfo.participantId}
                participantName={newContactInfo.participantName}
                onMessageSent={handleNewMessageSent}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-4 md:p-6">
                  <h3 className="font-medium text-base md:text-lg mb-2">No conversation selected</h3>
                  <p className="text-muted-foreground text-sm mb-4">Select a conversation from the sidebar or start a new one.</p>
                  <Button variant="outline" onClick={() => navigate("/partners")} size={isMobile ? "sm" : "default"}>
                    Find Partners
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
