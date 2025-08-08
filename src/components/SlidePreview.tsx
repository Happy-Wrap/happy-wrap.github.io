import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SlideData } from "@/types/presentation";
import { SlideCard } from "./SlideCard";
import { Download, FileDown } from "lucide-react";
import { generatePDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

interface SlidePreviewProps {
  slides: SlideData[];
  activeSlideId: string | null;
  onSelectSlide: (slideId: string) => void;
  onDeleteSlide: (slideId: string) => void;
}

export const SlidePreview = ({
  slides,
  activeSlideId,
  onSelectSlide,
  onDeleteSlide,
}: SlidePreviewProps) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    if (slides.length === 0) {
      toast({
        title: "No slides to export",
        description: "Add some slides before downloading as PDF.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPdf(true);
    try {
      await generatePDF(slides);
      toast({
        title: "PDF Generated!",
        description: "Your presentation has been downloaded successfully.",
      });
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="h-full bg-presentation-surface overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Live Preview
          </h2>
          <Button 
            onClick={handleDownloadPDF}
            disabled={slides.length === 0 || isGeneratingPdf}
            className="bg-gradient-accent hover:opacity-90 transition-opacity"
          >
            {isGeneratingPdf ? (
              <FileDown className="w-4 h-4 mr-2 animate-pulse" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isGeneratingPdf ? "Generating..." : "Download PDF"}
          </Button>
        </div>

        {/* Active Slide Preview */}
        {activeSlideId && slides.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Current Slide
            </h3>
            <Card className="p-6 shadow-slide">
              <SlideCard 
                slide={slides.find(s => s.id === activeSlideId)!}
                isActive={true}
                isPreview={true}
                onClick={() => {}}
                onDelete={onDeleteSlide}
              />
            </Card>
          </div>
        )}

        {/* All Slides */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            All Slides ({slides.length})
          </h3>
          
          {slides.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-3">
                <FileDown className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">No slides yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first slide to see the preview here
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {slides.map((slide, index) => (
                <Card 
                  key={slide.id} 
                  className="p-4 hover:shadow-soft transition-shadow cursor-pointer"
                  onClick={() => onSelectSlide(slide.id)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Slide {index + 1}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        slide.type === 'item' 
                          ? 'bg-presentation-primary/10 text-presentation-primary' 
                          : 'bg-presentation-accent/10 text-presentation-accent'
                      }`}>
                        {slide.type.charAt(0).toUpperCase() + slide.type.slice(1)}
                      </span>
                    </div>
                    <SlideCard 
                      slide={slide}
                      isActive={activeSlideId === slide.id}
                      isPreview={false}
                      onClick={() => onSelectSlide(slide.id)}
                      onDelete={onDeleteSlide}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};