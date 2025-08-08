import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SlideData, SlideType, Item, Hamper } from "@/types/presentation";
import { DefaultItemDataSource } from "@/data/defaultItems";
import { Search } from "lucide-react";

interface SlideFormProps {
  slide: SlideData;
  onUpdate: (updates: Partial<SlideData>) => void;
}

export const SlideForm = ({ slide, onUpdate }: SlideFormProps) => {
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const dataSource = new DefaultItemDataSource();

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

      {/* Search Bar */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Search Items</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Item Selection */}
      {slide.type === 'item' ? (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Select Item</Label>
          <Select 
            value={(slide.content as Item).id} 
            onValueChange={handleItemSelect}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose an item..." />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {filteredItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  <div className="flex items-center space-x-2">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-6 h-6 rounded object-cover"
                    />
                    <span>{item.name}</span>
                    <span className="text-muted-foreground">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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