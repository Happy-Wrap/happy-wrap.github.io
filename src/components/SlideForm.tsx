import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SlideData, SlideType, Item, Hamper } from "@/types/presentation";
import { defaultDataSource } from "@/data/defaultItems";
import { Search } from "lucide-react";
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

interface SlideFormProps {
  slide: SlideData;
  onUpdate: (updates: Partial<SlideData>) => void;
}

export const SlideForm = ({ slide, onUpdate }: SlideFormProps) => {
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const dataSource = defaultDataSource;

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = availableItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(availableItems);
    }
  }, [searchQuery, availableItems]);

  const loadItems = async () => {
    const items = await dataSource.getItems();
    setAvailableItems(items);
    setFilteredItems(items);
  };

  const handleTypeChange = (newType: SlideType) => {
    if (newType === slide.type) return;

    const newContent = newType === 'item' 
      ? availableItems[0] || { id: '', name: '', price: 0, imageUrl: '' }
      : { id: Date.now().toString(), items: [] };

    onUpdate({
      type: newType,
      content: newContent,
    });
  };

  const handleItemSelect = (itemId: string) => {
    const selectedItem = availableItems.find(item => item.id === itemId);
    if (selectedItem) {
      onUpdate({ content: selectedItem });
      setOpen(false);
    }
  };

  const handleHamperItemToggle = (item: Item, checked: boolean) => {
    if (slide.type !== 'hamper') return;
    
    const hamper = slide.content as Hamper;
    const newItems = checked 
      ? [...hamper.items, item]
      : hamper.items.filter(i => i.id !== item.id);

    onUpdate({
      content: { ...hamper, items: newItems }
    });
  };

  const isItemInHamper = (itemId: string): boolean => {
    if (slide.type !== 'hamper') return false;
    const hamper = slide.content as Hamper;
    return hamper.items.some(item => item.id === itemId);
  };

  const selectedItem = slide.type === 'item' ? availableItems.find(item => item.id === (slide.content as Item).id) : null;

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

      {/* Item Selection */}
      {slide.type === 'item' ? (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Select Item</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedItem ? (
                  <div className="flex items-center space-x-2">
                    <img 
                      src={selectedItem.imageUrl} 
                      alt={selectedItem.name}
                      className="w-6 h-6 rounded object-cover"
                    />
                    <span>{selectedItem.name}</span>
                  </div>
                ) : (
                  "Select an item..."
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
                    {filteredItems.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.id}
                        onSelect={handleItemSelect}
                        className="flex items-center space-x-2 py-2"
                      >
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-8 h-8 rounded object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ${item.price.toFixed(2)}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      ) : (
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Select Items for Hamper ({(slide.content as Hamper).items.length} selected)
          </Label>
          <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-3">
            {filteredItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded">
                <Checkbox
                  checked={isItemInHamper(item.id)}
                  onCheckedChange={(checked) => 
                    handleHamperItemToggle(item, checked as boolean)
                  }
                />
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-8 h-8 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};