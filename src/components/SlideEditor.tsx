import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SlideData, PresentationDetails } from "@/types/presentation";
import { SlideForm } from "./SlideForm";
import { PresentationDetails as PresentationDetailsComponent } from "./PresentationDetails";
import { DraggableSlideItem } from "./DraggableSlideItem";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface SlideEditorProps {
  slides: SlideData[];
  details: PresentationDetails;
  activeSlideId: string | null;
  onAddSlide: () => void;
  onSelectSlide: (slideId: string) => void;
  onUpdateSlide: (slideId: string, updates: Partial<SlideData>) => void;
  onUpdateDetails: (updates: Partial<PresentationDetails>) => void;
  onReorderSlides: (oldIndex: number, newIndex: number) => void;
}

export const SlideEditor = ({
  slides,
  details,
  activeSlideId,
  onAddSlide,
  onSelectSlide,
  onUpdateSlide,
  onUpdateDetails,
  onReorderSlides,
}: SlideEditorProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex((slide) => slide.id === active.id);
      const newIndex = slides.findIndex((slide) => slide.id === over.id);
      onReorderSlides(oldIndex, newIndex);
    }
  };

  const activeSlide = slides.find(slide => slide.id === activeSlideId);

  return (
    <Tabs defaultValue="slides" className="h-full">
      <div className="px-6 py-3 border-b">
        <TabsList className="w-full">
          <TabsTrigger value="slides" className="flex-1">Slides</TabsTrigger>
          <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={slides.map(slide => slide.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {slides.map((slide, index) => (
                    <DraggableSlideItem
                      key={slide.id}
                      slide={slide}
                      index={index}
                      isActive={slide.id === activeSlideId}
                      onClick={() => onSelectSlide(slide.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Slide Form */}
          {activeSlide && (
            <SlideForm
              slide={activeSlide}
              onUpdate={(updates) => onUpdateSlide(activeSlide.id, updates)}
            />
          )}
        </div>
      </TabsContent>

      <TabsContent value="details">
        <div className="p-6">
          <PresentationDetailsComponent
            details={details}
            onUpdate={onUpdateDetails}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};