import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlideData, SlideType, Item, Hamper } from "@/types/presentation";
import { defaultDataSource } from "@/data/defaultItems";
import { Search, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SlideFormProps {
  slide: SlideData;
  onUpdate: (updates: Partial<SlideData>) => void;
}

export const SlideForm = ({ slide, onUpdate }: SlideFormProps) => {
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const dataSource = defaultDataSource;

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const items = await dataSource.getItems();
    setAvailableItems(items);
  };

  const handleTypeChange = (newType: SlideType) => {
    if (newType === slide.type) return;

    const newContent = newType === 'item' 
      ? availableItems[0] || { id: '', name: '', price: 0, imageUrl: '' }
      : { id: Date.now().toString(), items: [] };

    onUpdate({
      type: newType,
      content: newContent,
      priceDisplayMode: slide.priceDisplayMode ?? 'show',
    });
  };

  const handleItemSelect = (itemId: string) => {
    const selectedItem = availableItems.find(item => item.id === itemId);
    if (!selectedItem) return;

    if (slide.type === 'item') {
      onUpdate({ content: selectedItem });
    } else if (slide.type === 'hamper') {
      const hamper = slide.content as Hamper;
      if (!hamper.items.some(item => item.id === selectedItem.id)) {
        onUpdate({
          content: {
            ...hamper,
            items: [...hamper.items, selectedItem]
          }
        });
      }
    }
    setOpen(false);
  };

  const handleRemoveHamperItem = (itemId: string) => {
    if (slide.type !== 'hamper') return;
    
    const hamper = slide.content as Hamper;
    onUpdate({
      content: {
        ...hamper,
        items: hamper.items.filter(item => item.id !== itemId)
      }
    });
  };

  const selectedItem = slide.type === 'item' ? slide.content as Item : null;
  const hamperItems = slide.type === 'hamper' ? (slide.content as Hamper).items : [];

  return (
    <Card className="p-6 space-y-6">
      {/* Slide Type Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Slide Type</Label>
        <Select value={slide.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="item">Single Item</SelectItem>
            <SelectItem value="hamper">Item Hamper</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Prices Display Mode */}
      {(slide.type === 'item' || slide.type === 'hamper') && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Prices</Label>
          <RadioGroup
            value={slide.priceDisplayMode ?? 'show'}
            onValueChange={(value) => onUpdate({ priceDisplayMode: value as SlideData['priceDisplayMode'] })}
            className="grid grid-cols-1 gap-3"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem id={`price-show-${slide.id}`} value="show" />
              <Label htmlFor={`price-show-${slide.id}`}>Show</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem id={`price-upon-request-${slide.id}`} value="upon_request" />
              <Label htmlFor={`price-upon-request-${slide.id}`}>Upon request</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem id={`price-hide-${slide.id}`} value="hide" />
              <Label htmlFor={`price-hide-${slide.id}`}>Do not show</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Item Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {slide.type === 'item' ? 'Select Item' : 'Add Item'}
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {slide.type === 'item' && selectedItem ? (
                <div className="flex items-center space-x-2">
                  <img 
                    src={selectedItem.imageUrl} 
                    alt={selectedItem.name}
                    className="w-6 h-6 rounded object-cover"
                  />
                  <span>{selectedItem.name}</span>
                </div>
              ) : (
                slide.type === 'item' ? "Select an item..." : "Select an item to add..."
              )}
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[350px] p-0">
            <Command>
              <CommandInput
                placeholder="Search items..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>No items found.</CommandEmpty>
                <CommandGroup>
                  {availableItems.map((item) => {
                    console.log('Item:', item, "");
                    return (
                    <CommandItem
                      key={item.id}
                      value={`${item.name} ${item.brand} ${item.category} ${item.subCategory}`.trim()}
                      onSelect={() => handleItemSelect(item.id)}
                      className="flex items-center space-x-2 py-2"
                    >
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-8 h-8 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{item.name}</div>
                        <div className="text-sm text-muted-foreground flex flex-col">
                          <span className="text-xs">{item.brand} • {item.category}</span>
                          <span>₹{item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </CommandItem>
                  )})}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Hamper Items List */}
      {slide.type === 'hamper' && hamperItems.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Items</Label>
          <div className="space-y-2">
            {hamperItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 bg-muted rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground">
                    ₹{item.price.toFixed(2)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveHamperItem(item.id)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};