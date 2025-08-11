import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SlideData, PresentationDetails } from "@/types/presentation";
import { SlideCard } from "./SlideCard";
import { Download, FileDown } from "lucide-react";
import { generatePDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { prefixTemplateSlides, suffixTemplateSlides } from "@/data/templateSlides";

interface SlidePreviewProps {
  slides: SlideData[];
  activeSlideId: string | null;
  details: PresentationDetails;
  onSelectSlide: (slideId: string) => void;
  onDeleteSlide: (slideId: string) => void;
}

export const SlidePreview = ({
  slides,
  activeSlideId,
  details,
  onSelectSlide,
  onDeleteSlide,
}: SlidePreviewProps) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("slide"); // "slide" or "presentation"

  const handleDownloadPDF = async () => {
    const allSlides = [...prefixTemplateSlides, ...slides, ...suffixTemplateSlides];
    
    if (allSlides.length === 0) {
      toast({
        title: "No slides to export",
        description: "Add some slides before downloading as PDF.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPdf(true);
    try {
      await generatePDF(allSlides);
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

  // Get the currently active slide for single slide preview
  const activeSlide = activeSlideId 
    ? [...prefixTemplateSlides, ...slides, ...suffixTemplateSlides].find(s => s.id === activeSlideId)
    : null;

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
              {activeSlide ? (
                // <Card className="p-6 shadow-slide">
                  <SlideCard 
                    slide={activeSlide}
                    isActive={true}
                    isPreview={true}
                    details={details}
                    onClick={() => {}}
                    onDelete={onDeleteSlide}
                  />
                // </Card>
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

              {/* Template Slides (Before) */}
              {prefixTemplateSlides.map((slide) => (
                // <Card key={slide.id} className="p-6 shadow-slide h-[calc(9/16*100%)]">
                  <SlideCard
                    key={slide.id} 
                    slide={slide}
                    isActive={slide.id === activeSlideId}
                    isPreview={true}
                    details={details}
                    onClick={() => onSelectSlide(slide.id)}
                    onDelete={onDeleteSlide}
                  />
                // </Card>
              ))}

              {/* User Created Slides */}
              {slides.map((slide, index) => (
                // <Card key={slide.id} className="p-6 shadow-slide h-[calc(9/16*100%)]">
                  <SlideCard
                   key={slide.id}
                    slide={slide}
                    isActive={slide.id === activeSlideId}
                    isPreview={true}
                    details={details}
                    onClick={() => onSelectSlide(slide.id)}
                    onDelete={onDeleteSlide}
                    slideIndex={index + 1}
                  />
                // </Card>
              ))}

              {/* Template Slides (After) */}
              {suffixTemplateSlides.map((slide) => (
                // <Card key={slide.id} className="p-6 shadow-slide h-[calc(9/16*100%)]">
                  <SlideCard
                    key={slide.id}
                    slide={slide}
                    isActive={slide.id === activeSlideId}
                    isPreview={true}
                    details={details}
                    onClick={() => onSelectSlide(slide.id)}
                    onDelete={onDeleteSlide}
                  />
                // </Card>
              ))}

              {slides.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                  No slides available. Start by adding some slides!
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};