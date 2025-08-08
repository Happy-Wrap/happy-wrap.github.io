import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SlideData } from "@/types/presentation";
import { SlideCard } from "./SlideCard";
import { Download, FileDown } from "lucide-react";
import { generatePDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState("slide"); // "slide" or "presentation"

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
        {/* Header with Tabs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Preview
            </h2>
          </div>
          <Tabs defaultValue="slide" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/20">
              <TabsTrigger 
                value="slide" 
                className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
              >
                Slide
              </TabsTrigger>
              <TabsTrigger 
                value="presentation"
                className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
              >
                Presentation
              </TabsTrigger>
            </TabsList>

            {/* Slide Preview Tab */}
            <TabsContent value="slide" className="mt-6">
              {activeSlideId && slides.length > 0 ? (
                <Card className="p-6 shadow-slide">
                  <SlideCard 
                    slide={slides.find(s => s.id === activeSlideId)!}
                    isActive={true}
                    isPreview={true}
                    onClick={() => {}}
                    onDelete={onDeleteSlide}
                  />
                </Card>
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  No slide selected or available
                </div>
              )}
            </TabsContent>

            {/* Presentation Preview Tab */}
            <TabsContent value="presentation" className="mt-6 space-y-6">
              <div className="flex justify-end">
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
              
              <div className="grid grid-cols-1 gap-6">
                {slides.map((slide) => (
                  <Card key={slide.id} className="p-6 shadow-slide">
                    <SlideCard
                      slide={slide}
                      isActive={slide.id === activeSlideId}
                      isPreview={true}
                      onClick={() => onSelectSlide(slide.id)}
                      onDelete={onDeleteSlide}
                    />
                  </Card>
                ))}
                {slides.length === 0 && (
                  <div className="text-center text-muted-foreground p-8">
                    No slides available
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};