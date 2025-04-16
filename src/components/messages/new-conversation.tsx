
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { notifyNewMessage } from "@/services/notification-service";

interface NewConversationProps {
  participantId: string;
  participantName: string;
  onMessageSent: () => void;
}

export function NewConversation({ participantId, participantName, onMessageSent }: NewConversationProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSendFirstMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !participantId || !user) return;

    // Check if user is trying to message themselves or their own organization
    if (participantId === user.id) {
      toast({
        title: "Cannot message yourself",
        description: "You cannot send messages to yourself.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);
      
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        recipient_id: participantId,
        content: message
      });

      if (error) throw error;
      
      // Send notification to recipient
      await notifyNewMessage(participantId, user.id, message);
      
      setMessage("");
      onMessageSent();
      
      toast({
        title: "Message sent",
        description: `Your first message to ${participantName} was sent successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium">Start a conversation with {participantName}</h3>
        <p className="text-muted-foreground mt-1">
          Send your first message to begin the conversation
        </p>
      </div>
      
      <form onSubmit={handleSendFirstMessage} className="w-full max-w-md space-y-4">
        <Input
          placeholder="Type your first message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full"
        />
        <Button 
          type="submit" 
          className="w-full" 
          disabled={!message.trim() || sending}
        >
          {sending ? "Sending..." : "Start Conversation"}
        </Button>
      </form>
    </div>
  );
}
