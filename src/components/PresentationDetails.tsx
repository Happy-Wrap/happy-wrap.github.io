import { PresentationDetails as PresentationDetailsType } from "@/types/presentation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PresentationDetailsProps {
  details: PresentationDetailsType;
  onUpdate: (updates: Partial<PresentationDetailsType>) => void;
}

const defaultDetails: PresentationDetailsType = {
  clientName: '',
  clientEmail: '',
  projectName: '',
  notes: ''
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Client Email</Label>
            <Input
              id="clientEmail"
              type="email"
              value={details.clientEmail || ''}
              onChange={(e) => onUpdate({ clientEmail: e.target.value })}
              placeholder="Enter client email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={details.projectName || ''}
              onChange={(e) => onUpdate({ projectName: e.target.value })}
              placeholder="Enter project name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={details.notes || ''}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Add any additional notes"
              className="min-h-[100px]"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}; 