import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { SlideData, Item, Hamper, TemplateSlide, PresentationDetails } from "@/types/presentation";
import { format } from "date-fns";

interface SlideCardProps {
  slide: SlideData;
  isActive: boolean;
  isPreview: boolean;
  details?: PresentationDetails;
  onClick: () => void;
  onDelete: (slideId: string) => void;
  slideIndex?: number;
}

export const SlideCard = ({ 
  slide, 
  isActive, 
  isPreview,
  details,
  onClick, 
  onDelete,
  slideIndex 
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
    if (slide.type === 'template') {
      const template = slide.content as TemplateSlide;
      if (template.isRequirementsSlide) {
        return (
          <div className="relative z-10 p-6 space-y-4 text-left">
            <h2 className="text-3xl font-bold text-primary pl-24">{details?.clientName}</h2>
            <div className="space-y-3 text-foreground text-xl font-bold pl-24">
              <p>Purpose : {details?.purpose || 'N/A'}</p>
              <p>Expected Quantity : {details?.quantity}</p>
              <p>Budget (Excl. GST) : ₹{details?.budgetExclGst}</p>
              <p>Budget (Incl. GST) : ₹{details?.budgetInclGst}</p>
              <p>Deadline : {format(details?.deadline || new Date(), 'dd MMM yyyy')}</p>
              <p>Branding Required : {details?.brandingRequired ? 'Yes' : 'No'}</p>
              <p>Custom Packaging : {details?.customPackaging ? 'Yes' : 'No'}</p>
              <p>Delivery Location : {details?.deliveryLocation || 'N/A'}</p>
              <p>Remarks : <span className="font-normal text-lg">{details?.remarks || 'N/A'}</span></p>
            </div>
          </div>
        );
      }
      return (
        <div className="absolute inset-0">
          <img 
            src={template.imageUrl} 
            alt="Template Slide"
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else if (slide.type === 'item') {
      const item = slide.content as Item;
      return (
        <div className="w-full h-full flex flex-col">
          {/* Option Number */}
          <h2 className="text-4xl font-bold text-primary px-4 pt-6">Option {slideIndex}</h2>
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 px-6">
            {/* Item Name */}
            <h3 className="text-xl font-bold text-foreground">{item.name}</h3>
            
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
              ₹{item.price.toFixed(2)}
            </div>
          </div>
        </div>
      );
    } else {
      const hamper = slide.content as Hamper;
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-foreground">
            Gift Hamper
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {hamper.items.map((item, index) => (
              <div key={index} className="text-center space-y-2">
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-32 h-32 mx-auto object-contain rounded-lg shadow-soft"
                />
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  ₹{item.price.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="text-3xl font-bold text-center bg-gradient-primary bg-clip-text text-transparent">
            ₹{hamper.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <div 
        className={`
          relative rounded-lg overflow-hidden transition-all duration-200 h-full
          ${isActive ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-primary/50'}
          ${isPreview ? 'aspect-[16/9] bg-white' : 'aspect-[4/3] bg-card'}
        `}
        onClick={onClick}
      >
        {slide.type === 'template' && !(slide.content as TemplateSlide).isRequirementsSlide ? (
          <img 
            src={(slide.content as TemplateSlide).imageUrl} 
            alt="Template Slide"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="h-full">
            {/* Add background image for non-template slides and requirements slide */}
            <img 
              src="/assets/slides/option-template.png" 
              alt="Slide Background"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="relative z-10 h-full">
              {renderSlideContent()}
            </div>
          </div>
        )}

        {/* Delete Button - Only show for non-template slides */}
        {!isPreview && slide.type !== 'template' && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the slide.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};