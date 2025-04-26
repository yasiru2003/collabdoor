
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/utils/upload-utils";

interface ProjectImagesUploadProps {
  projectId?: string;
  userId: string;
  onImagesChange: (urls: string[]) => void;
  defaultImages?: string[];
}

export function ProjectImagesUpload({
  projectId,
  userId,
  onImagesChange,
  defaultImages = []
}: ProjectImagesUploadProps) {
  const [images, setImages] = useState<string[]>(defaultImages);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (defaultImages.length > 0) {
      setImages(defaultImages);
    }
  }, [defaultImages]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const file = e.target.files[0];
    
    try {
      const imageUrl = await uploadImage(file, 'projects', userId);
      if (imageUrl) {
        setImages(prev => [...prev, imageUrl]);
        onImagesChange([...images, imageUrl]);
        toast({
          title: "Image uploaded",
          description: "Your image has been successfully uploaded.",
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Project Images</h3>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="max-w-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <Card key={index} className="relative group">
            <CardContent className="p-0">
              <AspectRatio ratio={16 / 9}>
                <img 
                  src={url} 
                  alt={`Project image ${index + 1}`}
                  className="object-cover w-full h-full rounded-lg"
                />
              </AspectRatio>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
