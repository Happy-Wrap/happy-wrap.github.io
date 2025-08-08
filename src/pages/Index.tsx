import { SlideEditor } from "@/components/SlideEditor";
import { SlidePreview } from "@/components/SlidePreview";
import { usePresentation } from "@/hooks/usePresentation";

const Index = () => {
  const { 
    presentation, 
    addSlide, 
    selectSlide, 
    updateSlide, 
    deleteSlide 
  } = usePresentation();

  return (
    <div className="min-h-screen bg-presentation-bg">
      {/* Header */}
      <header className="bg-gradient-primary text-white p-6 shadow-soft">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">PresentPro</h1>
          <p className="text-blue-100 mt-1">Create beautiful product presentations</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Panel - Slide Editor */}
        <div className="w-1/3 min-w-[400px]">
          <SlideEditor
            slides={presentation.slides}
            activeSlideId={presentation.activeSlideId}
            onAddSlide={addSlide}
            onSelectSlide={selectSlide}
            onUpdateSlide={updateSlide}
          />
        </div>

        {/* Right Panel - Slide Preview */}
        <div className="flex-1">
          <SlidePreview
            slides={presentation.slides}
            activeSlideId={presentation.activeSlideId}
            onSelectSlide={selectSlide}
            onDeleteSlide={deleteSlide}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
