import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { SlideData, Item, Hamper } from "@/types/presentation";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo.png";

interface SlideCardProps {
  slide: SlideData;
  isActive: boolean;
  isPreview: boolean;
  onClick: () => void;
  onDelete: (slideId: string) => void;
}

export const SlideCard = ({ 
  slide, 
  isActive, 
  isPreview, 
  onClick, 
  onDelete 
}: SlideCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDelete(slide.id);
    setShowDeleteDialog(false);
  };

  const renderSlideContent = () => {
    if (slide.type === 'item') {
      const item = slide.content as Item;
      return (
        <div className="space-y-6 text-center">
          {/* Item Name */}
          <h2 className="text-2xl font-bold text-foreground">{item.name}</h2>
          
          {/* Item Image */}
          <div className="flex justify-center">
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className="max-w-64 max-h-64 object-contain rounded-lg shadow-soft"
            />
          </div>
          
          {/* Item Price */}
          <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            ${item.price.toFixed(2)}
          </div>
        </div>
      );
    } else {
      const hamper = slide.content as Hamper;
      const totalPrice = hamper.items.reduce((sum, item) => sum + item.price, 0);
      
      return (
        <div className="space-y-6">
          {/* Hamper Title */}
          <h2 className="text-2xl font-bold text-center text-foreground">
            Product Hamper
          </h2>
          
          {/* Item Names */}
          <div className="text-center space-y-1">
            {hamper.items.map((item, index) => (
              <p key={item.id} className="text-lg">
                {item.name}
                {index < hamper.items.length - 1 && <span className="text-muted-foreground"> • </span>}
              </p>
            ))}
          </div>
          
          {/* Item Images */}
          {hamper.items.length > 0 && (
            <div className="flex justify-center space-x-4 overflow-x-auto pb-2">
              {hamper.items.map((item) => (
                <img 
                  key={item.id}
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg shadow-soft flex-shrink-0"
                />
              ))}
            </div>
          )}
          
          {/* Total Price */}
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Total Value</p>
            <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ${totalPrice.toFixed(2)}
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div 
      className={cn(
        "relative group transition-all duration-200",
        isPreview ? "min-h-[500px]" : "min-h-[300px]",
        !isPreview && "cursor-pointer hover:scale-105"
      )}
      onClick={!isPreview ? onClick : undefined}
    >
      {/* Slide Content */}
      <Card className={cn(
        "p-8 h-full bg-white border-2 transition-all",
        isActive ? "border-presentation-primary shadow-slide" : "border-border shadow-soft",
        "relative overflow-hidden"
      )}>
        {/* Company Logo */}
        <div className="absolute top-4 left-4">
          <img 
            src={logoImage} 
            alt="Company Logo" 
            className="h-8 object-contain"
          />
        </div>
        
        {/* Delete Button (only in preview mode and when hovering) */}
        {isPreview && (
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Slide</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this slide? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        
        {/* Main Content */}
        <div className="flex flex-col justify-center h-full pt-8 pb-12">
          {renderSlideContent()}
        </div>
        
        {/* Company Footer */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="text-sm text-muted-foreground">
            PresentPro Solutions • www.presentpro.com
          </p>
        </div>
      </Card>
    </div>
  );
};