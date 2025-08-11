import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { SlideData, SlideType, PresentationDetails } from "@/types/presentation";
import { SlideForm } from "./SlideForm";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PresentationDetails as PresentationDetailsForm } from "./PresentationDetails";

interface SlideEditorProps {
  slides: SlideData[];
  details: PresentationDetails;
  activeSlideId: string | null;
  onAddSlide: () => void;
  onSelectSlide: (slideId: string) => void;
  onUpdateSlide: (slideId: string, updates: Partial<SlideData>) => void;
  onUpdateDetails: (updates: Partial<PresentationDetails>) => void;
}

export const SlideEditor = ({
  slides,
  details,
  activeSlideId,
  onAddSlide,
  onSelectSlide,
  onUpdateSlide,
  onUpdateDetails,
}: SlideEditorProps) => {
  const activeSlide = slides.find(slide => slide.id === activeSlideId);
  const [activeTab, setActiveTab] = useState<string>("details");

  return (
    <div className="h-full bg-presentation-bg border-r border-border overflow-y-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="p-6 pb-2">
          <TabsList className="grid w-full grid-cols-2 bg-muted/20">
            <TabsTrigger 
              value="details" 
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
            >
              Details
            </TabsTrigger>
            <TabsTrigger 
              value="slides"
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
            >
              Slides
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="slides" className="mt-0">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Slide Editor
              </h2>
              <Button 
                onClick={onAddSlide}
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Slide
              </Button>
            </div>

            {/* Slides List */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Slides ({slides.length})
              </h3>
              {slides.map((slide, index) => (
                <Card
                  key={slide.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all duration-200 hover:shadow-soft",
                    activeSlideId === slide.id 
                      ? "ring-2 ring-presentation-primary bg-gradient-subtle" 
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => onSelectSlide(slide.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Slide {index + 1}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {slide.type}
                      </p>
                    </div>
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      slide.type === 'item' ? "bg-presentation-primary" : "bg-presentation-accent"
                    )} />
                  </div>
                </Card>
              ))}
              
              {slides.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No slides yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click "Add New Slide" to get started
                  </p>
                </Card>
              )}
            </div>

            {/* Slide Form */}
            {activeSlide && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Edit Slide
                </h3>
                <SlideForm
                  slide={activeSlide}
                  onUpdate={(updates) => onUpdateSlide(activeSlide.id, updates)}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="details" className="mt-0">
          <PresentationDetailsForm
            details={details}
            onUpdate={onUpdateDetails}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};