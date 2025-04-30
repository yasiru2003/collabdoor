
import React, { useState } from "react";
import { useToggleLike, useAddComment, FeedPost as FeedPostType } from "@/hooks/use-feed";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, MessageSquare, AtSign, Building, Send, Share } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FeedPostProps {
  post: FeedPostType;
  currentUser: any;
}

export function FeedPost({ post, currentUser }: FeedPostProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  
  // Use our custom hooks
  const toggleLikeMutation = useToggleLike();
  const addCommentMutation = useAddComment();
  
  // Check if the current user has liked this post
  const userLike = post.feed_likes?.find(
    (like) => like.user_id === currentUser?.id
  );
  
  // Get comments count
  const commentsCount = post.feed_comments?.length || 0;
  
  // Like/unlike handler
  const handleToggleLike = () => {
    toggleLikeMutation.mutate({
      postId: post.id,
      likeId: userLike?.id
    });
  };
  
  // Add comment handler
  const handleAddComment = () => {
    if (!commentText.trim()) return;
    
    addCommentMutation.mutate({
      postId: post.id,
      content: commentText
    }, {
      onSuccess: () => setCommentText("")
    });
  };
  
  // Format date
  const formattedDate = post.created_at 
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) 
    : "";
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={post.profiles?.profile_image || ""} />
              <AvatarFallback>
                {post.profiles?.name?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.profiles?.name || "Unknown User"}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>{formattedDate}</span>
                {post.organizations && (
                  <>
                    <span className="mx-1">•</span>
                    <Building className="h-3 w-3 mr-1" />
                    <span>{post.organizations.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {post.organizations && (
            <Avatar className="h-7 w-7">
              <AvatarImage src={post.organizations.logo || ""} />
              <AvatarFallback>
                {post.organizations.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
        
        {post.location && (
          <Badge variant="outline" className="mt-2">
            <AtSign className="h-3 w-3 mr-1" />
            {post.location}
          </Badge>
        )}
      </CardContent>
      
      <CardFooter className="flex-col space-y-2 pt-0">
        <div className="flex justify-between w-full">
          <div className="flex space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex items-center gap-1 ${userLike ? 'text-red-500' : ''}`}
              onClick={handleToggleLike}
            >
              <Heart className={`h-4 w-4 ${userLike ? 'fill-current' : ''}`} />
              <span>{post.feed_likes?.length || 0}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="h-4 w-4" />
              <span>{commentsCount}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {showComments && (
          <div className="w-full pt-2">
            <Separator className="my-2" />
            
            {/* Comments list */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {post.feed_comments && post.feed_comments.length > 0 ? (
                post.feed_comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={comment.profiles?.profile_image || ""} />
                      <AvatarFallback>
                        {comment.profiles?.name?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-md p-2 flex-1">
                      <div className="flex justify-between">
                        <p className="text-xs font-medium">
                          {comment.profiles?.name || "Unknown User"}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
            
            {/* Add comment form */}
            <div className="flex items-center gap-2 mt-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={currentUser?.user_metadata?.profile_image || ""} />
                <AvatarFallback>
                  {currentUser?.email?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Textarea
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-10 p-2 text-sm"
              />
              <Button 
                size="sm" 
                onClick={handleAddComment} 
                disabled={addCommentMutation.isPending || !commentText.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
