
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockUsers, mockOrganizations } from "@/data/mockData";
import { Search } from "lucide-react";
import { useState } from "react";

type Message = {
  id: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  content: string;
  timestamp: string;
  read: boolean;
};

type Conversation = {
  id: string;
  participantId: string;
  participantName: string;
  participantImage?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
};

// Mock conversations data
const mockConversations: Conversation[] = [
  {
    id: "1",
    participantId: "2",
    participantName: "Sarah Johnson",
    lastMessage: "I'd like to discuss your application to our Clean Water Initiative project.",
    lastMessageTime: "2025-04-15T14:30:00Z",
    unreadCount: 2,
  },
  {
    id: "2",
    participantId: "3",
    participantName: "Tech Innovators",
    participantImage: "",
    lastMessage: "Thanks for your interest in our organization. Would you be available for a call next week?",
    lastMessageTime: "2025-04-14T10:15:00Z",
    unreadCount: 0,
  },
  {
    id: "3",
    participantId: "4",
    participantName: "Global Health Initiative",
    lastMessage: "We've reviewed your proposal and would like to move forward with the partnership.",
    lastMessageTime: "2025-04-13T16:45:00Z",
    unreadCount: 0,
  },
  {
    id: "4",
    participantId: "5",
    participantName: "Creative Solutions Agency",
    lastMessage: "Could you provide more details about the technical requirements for the project?",
    lastMessageTime: "2025-04-12T09:20:00Z",
    unreadCount: 0,
  },
];

// Mock messages for the first conversation
const mockMessages: Message[] = [
  {
    id: "1",
    senderId: "2",
    senderName: "Sarah Johnson",
    content: "Hello! I saw your application to our Clean Water Initiative project and I'm impressed with your organization's background.",
    timestamp: "2025-04-15T14:30:00Z",
    read: true,
  },
  {
    id: "2",
    senderId: "1", // Current user
    senderName: "John Doe",
    content: "Thank you, Sarah! We're very interested in contributing to the project. Our team has experience in similar water purification systems.",
    timestamp: "2025-04-15T14:35:00Z",
    read: true,
  },
  {
    id: "3",
    senderId: "2",
    senderName: "Sarah Johnson",
    content: "That's great to hear. Could you tell me more about your previous experience with water filtration systems?",
    timestamp: "2025-04-15T14:40:00Z",
    read: true,
  },
  {
    id: "4",
    senderId: "1", // Current user
    senderName: "John Doe",
    content: "Absolutely. We've worked on three similar projects in Southeast Asia over the past five years. Our technology has helped provide clean water to over 10,000 people.",
    timestamp: "2025-04-15T14:45:00Z",
    read: true,
  },
  {
    id: "5",
    senderId: "2",
    senderName: "Sarah Johnson",
    content: "I'd like to discuss this further. Would you be available for a video call next Tuesday at 2 PM?",
    timestamp: "2025-04-15T14:50:00Z",
    read: false,
  },
  {
    id: "6",
    senderId: "2",
    senderName: "Sarah Johnson",
    content: "I can also share more details about the specific requirements and challenges we're facing in our target communities.",
    timestamp: "2025-04-15T14:51:00Z",
    read: false,
  },
];

export default function MessagesPage() {
  const [activeConversation, setActiveConversation] = useState<string>(mockConversations[0].id);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // In a real app, this would send the message to the API
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

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
              />
            </div>
          </div>
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {mockConversations.map((conversation) => (
              <div 
                key={conversation.id}
                onClick={() => setActiveConversation(conversation.id)}
                className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${activeConversation === conversation.id ? 'bg-muted' : ''}`}
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
            ))}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 flex flex-col">
          {/* Conversation header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">
                  {mockConversations[0].participantName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{mockConversations[0].participantName}</h3>
                <p className="text-xs text-muted-foreground">Active now</p>
              </div>
            </div>
            <div>
              <Button variant="ghost" size="sm">View Profile</Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {mockMessages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.senderId === "1" ? "justify-end" : ""}`}
              >
                <div className={`flex items-start gap-2 max-w-[70%] ${message.senderId === "1" ? "flex-row-reverse" : ""}`}>
                  {message.senderId !== "1" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {message.senderName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div 
                      className={`p-3 rounded-lg ${
                        message.senderId === "1" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className={`mt-1 text-xs text-muted-foreground ${message.senderId === "1" ? "text-right" : ""}`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
              <Button type="submit">Send</Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
