import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Trash2, Edit2, Check } from "lucide-react";
import { SlideData, Item, Hamper, TemplateSlide, PresentationDetails } from "@/types/presentation";
import { format } from "date-fns";

interface SlideCardProps {
  slide: SlideData;
  isActive: boolean;
  isPreview: boolean;
  details?: PresentationDetails;
  onClick: () => void;
  onDelete: (slideId: string) => void;
  onUpdate?: (slideId: string, updates: Partial<SlideData>) => void;
  slideIndex?: number;
}

export const SlideCard = ({ 
  slide, 
  isActive, 
  isPreview,
  details,
  onClick, 
  onDelete,
  onUpdate,
  slideIndex 
}: SlideCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editedPriceText, setEditedPriceText] = useState(slide.customPriceText || '');

  // Reset price editing state when slide changes
  useEffect(() => {
    setIsEditingPrice(false);
    setEditedPriceText(slide.customPriceText || '');
  }, [slide.id, slide.customPriceText]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDelete(slide.id);
    setShowDeleteDialog(false);
  };

  const handleEditPriceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingPrice(true);
    if (!editedPriceText) {
      // Initialize with current price text if no custom text exists
      const currentPrice = slide.type === 'item' 
        ? (slide.content as Item).clientPrice
        : (slide.content as Hamper).items.reduce((sum, item) => sum + item.clientPrice, 0);
      setEditedPriceText(`₹${currentPrice.toFixed(2)}`);
    }
  };

  const handlePriceInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedPriceText(e.target.value);
  };

  const handlePriceSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdate) {
      onUpdate(slide.id, { customPriceText: editedPriceText });
    }
    setIsEditingPrice(false);
  };

  const renderPriceText = (amount: number) => {
    const mode = slide.priceDisplayMode ?? 'show';
    if (mode === 'hide') return null;
    if (mode === 'upon_request') return 'Price upon request';
    if (slide.customPriceText) return slide.customPriceText;
    return `₹${amount.toFixed(2)}`;
  };

  const renderPriceElement = (priceText: string | null) => {
    if (!priceText) return null;
    
    return (
      <div className="relative group">
        <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
          {isEditingPrice ? (
            <>
              <Input
                value={editedPriceText}
                onChange={handlePriceChange}
                onClick={handlePriceInputClick}
                className="w-40 text-2xl font-bold text-foreground bg-background"
              />
              <Button
                size="icon"
                onClick={handlePriceSave}
                className="h-8 w-8 bg-gradient-primary text-white hover:opacity-90"
              >
                <Check className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              {priceText}
              {onUpdate && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditPriceClick}
                  className="opacity-0 group-hover:opacity-100 h-8 w-8 transition-opacity"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderSlideContent = () => {
    if (slide.type === 'template') {
      const template = slide.content as TemplateSlide;
      if (template.isRequirementsSlide) {
        return (
          <div className="relative z-10 p-6 space-y-4 text-left">
            <p className="text-2xl font-bold text-primary pl-24">{details?.clientName}</p>
            <div className="space-y-3 text-foreground text-l font-bold pl-24">
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
      const priceText = renderPriceText(item.clientPrice);
      return (
        <div className="w-full h-full flex flex-col">
          {/* Option Number */}
          <p className="text-2xl font-bold text-primary px-4 pt-6">Option {slideIndex}</p>
          
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
            {renderPriceElement(priceText)}
          </div>
        </div>
      );
    } else {
      const hamper = slide.content as Hamper;
      const total = hamper.items.reduce((sum, item) => sum + item.clientPrice, 0);
      const priceText = renderPriceText(total);
      return (
        <div className="w-full h-full flex flex-col">
          {/* Option Number */}
          {typeof slideIndex !== 'undefined' && (
            <p className="text-2xl font-bold text-primary px-4 pt-6">Option {slideIndex}</p>
          )}
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 px-6">
            <h2 className="text-xl font-medium text-foreground">
              Product Hamper
            </h2>

            {/* Item Images */}
            <div className="flex items-center justify-center w-full px-12 gap-8">
              {hamper.items.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-24 h-24 object-contain rounded-lg shadow-soft"
                      onError={(e) => {
                        // Fallback for failed image loads
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="w-24 h-24 rounded-lg bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
                            ${item.name.charAt(0)}
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground text-center">{item.name}</span>
                </div>
              ))}
            </div>

            {/* Total Value */}
            {(slide.priceDisplayMode ?? 'show') !== 'hide' && (
              <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">Total Value</p>
                {renderPriceElement(priceText)}
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <div 
        className={`
          relative rounded-lg overflow-hidden transition-all duration-200 h-full group
          ${isActive ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-primary/50'}
          ${isPreview ? 'aspect-[16/9] bg-white' : 'aspect-[4/3] bg-card'}
        `}
        onClick={onClick}
      >
        <div className="relative h-full">
          {slide.type === 'template' && !(slide.content as TemplateSlide).isRequirementsSlide ? (
            <img 
              src={(slide.content as TemplateSlide).imageUrl} 
              alt="Template Slide"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <>
              {/* Background image */}
              <img 
                src="/assets/slides/option-template.png" 
                alt="Slide Background"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="relative z-10 h-full">
                {renderSlideContent()}
              </div>
            </>
          )}

          {/* Delete Button - Only show for non-template slides */}
          {slide.type !== 'template' && (
            <div className="absolute inset-0 z-30 pointer-events-none">
              <Button
                variant="destructive"
                size="icon"
                className={`
                  absolute top-2 right-2 transition-opacity pointer-events-auto
                  ${isPreview ? 'opacity-0 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'}
                  ${isActive ? 'opacity-100' : ''}
                `}
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
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