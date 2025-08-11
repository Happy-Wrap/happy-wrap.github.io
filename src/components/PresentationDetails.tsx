import { PresentationDetails as PresentationDetailsType } from "@/types/presentation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PresentationDetailsProps {
  details: PresentationDetailsType;
  onUpdate: (updates: Partial<PresentationDetailsType>) => void;
}

const defaultDetails: PresentationDetailsType = {
  clientName: '',
  purpose: '',
  quantity: 0,
  budgetExclGst: 0,
  budgetInclGst: 0,
  deadline: new Date(),
  brandingRequired: false,
  customPackaging: false,
  deliveryLocation: '',
  remarks: ''
};

export const PresentationDetails = ({
  details = defaultDetails,
  onUpdate,
}: PresentationDetailsProps) => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
        Presentation Details
      </h2>
      <Card className="p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name *</Label>
            <Input
              id="clientName"
              value={details.clientName || ''}
              onChange={(e) => onUpdate({ clientName: e.target.value })}
              placeholder="Enter client name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose/Occasion</Label>
            <Input
              id="purpose"
              value={details.purpose || ''}
              onChange={(e) => onUpdate({ purpose: e.target.value })}
              placeholder="Enter purpose or occasion"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Expected Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              value={details.quantity || ''}
              onChange={(e) => {
                const value = e.target.value ? Math.floor(Number(e.target.value)) : 0;
                onUpdate({ quantity: value });
              }}
              placeholder="Enter expected quantity"
              required
              min={0}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budgetExclGst">Budget (excl. GST) *</Label>
            <Input
              id="budgetExclGst"
              type="number"
              value={details.budgetExclGst || ''}
              onChange={(e) => {
                const value = e.target.value ? Math.floor(Number(e.target.value)) : 0;
                onUpdate({ budgetExclGst: value });
              }}
              placeholder="Enter budget excluding GST"
              required
              min={0}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budgetInclGst">Budget (incl. GST) *</Label>
            <Input
              id="budgetInclGst"
              type="number"
              value={details.budgetInclGst || ''}
              onChange={(e) => {
                const value = e.target.value ? Math.floor(Number(e.target.value)) : 0;
                onUpdate({ budgetInclGst: value });
              }}
              placeholder="Enter budget including GST"
              required
              min={0}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Deadline / Event Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !details.deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {details.deadline ? format(details.deadline, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={details.deadline}
                  onSelect={(date) => onUpdate({ deadline: date || new Date() })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center justify-between space-y-2">
            <Label htmlFor="brandingRequired">Branding Required</Label>
            <Switch
              id="brandingRequired"
              checked={details.brandingRequired}
              onCheckedChange={(checked) => onUpdate({ brandingRequired: checked })}
            />
          </div>

          <div className="flex items-center justify-between space-y-2">
            <Label htmlFor="customPackaging">Custom Packaging</Label>
            <Switch
              id="customPackaging"
              checked={details.customPackaging}
              onCheckedChange={(checked) => onUpdate({ customPackaging: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryLocation">Delivery Location</Label>
            <Input
              id="deliveryLocation"
              value={details.deliveryLocation || ''}
              onChange={(e) => onUpdate({ deliveryLocation: e.target.value })}
              placeholder="Enter delivery location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={details.remarks || ''}
              onChange={(e) => onUpdate({ remarks: e.target.value })}
              placeholder="Add any additional remarks"
              className="min-h-[100px]"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}; 