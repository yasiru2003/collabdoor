
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Announcement {
  id: string;
  title: string;
  message: string;
  color: string;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  created_by: string;
}

export function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      // Use raw SQL query to avoid TypeScript issues with the newly created table
      const { data, error } = await supabase
        .from('announcement_banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setAnnouncements(data as unknown as Announcement[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      });
      console.error("Error fetching announcements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('announcement_banners')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, is_active: !currentState } : a
        )
      );
      
      toast({
        title: `Announcement ${!currentState ? "activated" : "deactivated"}`,
        description: `The announcement has been ${!currentState ? "activated" : "deactivated"} successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update announcement status",
        variant: "destructive",
      });
      console.error("Error updating announcement:", error);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcement_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Remove from local state
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      
      toast({
        title: "Announcement deleted",
        description: "The announcement has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
      console.error("Error deleting announcement:", error);
    }
  };

  const getColorDisplay = (color: string) => {
    const bgClass = (() => {
      switch (color.toLowerCase()) {
        case 'red': return 'bg-red-500';
        case 'green': return 'bg-green-500';
        case 'yellow': return 'bg-yellow-500';
        case 'blue':
        default: return 'bg-blue-500';
      }
    })();
    
    return (
      <div className="flex items-center">
        <div className={`w-4 h-4 rounded-full mr-2 ${bgClass}`}></div>
        {color}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Announcement Banners</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : announcements.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell className="font-medium">{announcement.title}</TableCell>
                  <TableCell>{getColorDisplay(announcement.color)}</TableCell>
                  <TableCell>{new Date(announcement.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {announcement.end_date
                      ? new Date(announcement.end_date).toLocaleDateString()
                      : "No end date"}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={announcement.is_active}
                      onCheckedChange={() =>
                        toggleActive(announcement.id, announcement.is_active)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteAnnouncement(announcement.id)}
                      title="Delete announcement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <p>No announcements found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
