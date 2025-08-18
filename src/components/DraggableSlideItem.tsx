import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SlideData } from "@/types/presentation";
import { GripVertical } from "lucide-react";

interface DraggableSlideItemProps {
  slide: SlideData;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export const DraggableSlideItem = ({ slide, index, isActive, onClick }: DraggableSlideItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative p-4 transition-all duration-200 hover:shadow-soft group",
        isActive ? "ring-2 ring-presentation-primary bg-gradient-subtle" : "hover:bg-muted/50",
        isDragging ? "opacity-50" : ""
      )}
      onClick={onClick}
    >
      {/* Drag Handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Content - with padding to accommodate drag handle */}
      <div className="flex items-center justify-between pl-4">
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
  );
}; 