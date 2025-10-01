import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { storage, CompanyDescription } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2 } from 'lucide-react';

export const CompanyDescriptionTab = () => {
  const [descriptions, setDescriptions] = useState<CompanyDescription[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    legalName: '',
    shortName: '',
    description: '',
    mission: '',
    vision: '',
    coreValues: '',
    keyActivities: '',
    yearFounded: '',
  });

  useEffect(() => {
    loadDescriptions();
  }, []);

  const loadDescriptions = () => {
    const stored = storage.get<CompanyDescription>('companyDescription');
    setDescriptions(stored);
  };

  const handleSave = () => {
    if (!formData.legalName.trim()) {
      toast({
        title: "Error",
        description: "Legal name is required",
        variant: "destructive",
      });
      return;
    }

    const newDescription: CompanyDescription = {
      id: editingId || Date.now().toString(),
      ...formData,
    };

    let updatedDescriptions;
    if (editingId) {
      updatedDescriptions = descriptions.map(d => d.id === editingId ? newDescription : d);
    } else {
      updatedDescriptions = [...descriptions, newDescription];
    }

    storage.set('companyDescription', updatedDescriptions);
    setDescriptions(updatedDescriptions);
    resetForm();
    toast({
      title: "Success",
      description: editingId ? "Company description updated" : "Company description added",
    });
  };

  const handleEdit = (description: CompanyDescription) => {
    setFormData({
      legalName: description.legalName,
      shortName: description.shortName,
      description: description.description,
      mission: description.mission,
      vision: description.vision,
      coreValues: description.coreValues,
      keyActivities: description.keyActivities,
      yearFounded: description.yearFounded,
    });
    setEditingId(description.id);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    const updatedDescriptions = descriptions.filter(d => d.id !== id);
    storage.set('companyDescription', updatedDescriptions);
    setDescriptions(updatedDescriptions);
    toast({
      title: "Success",
      description: "Company description deleted",
    });
  };

  const resetForm = () => {
    setFormData({
      legalName: '',
      shortName: '',
      description: '',
      mission: '',
      vision: '',
      coreValues: '',
      keyActivities: '',
      yearFounded: '',
    });
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {descriptions.map((description) => (
          <Card key={description.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{description.legalName}</CardTitle>
                  {description.shortName && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {description.shortName}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(description)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(description.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {description.description && (
                <div>
                  <p className="text-sm font-medium">Description:</p>
                  <p className="text-sm text-muted-foreground">{description.description}</p>
                </div>
              )}
              {description.mission && (
                <div>
                  <p className="text-sm font-medium">Mission:</p>
                  <p className="text-sm text-muted-foreground">{description.mission}</p>
                </div>
              )}
              {description.vision && (
                <div>
                  <p className="text-sm font-medium">Vision:</p>
                  <p className="text-sm text-muted-foreground">{description.vision}</p>
                </div>
              )}
              {description.coreValues && (
                <div>
                  <p className="text-sm font-medium">Core Values:</p>
                  <p className="text-sm text-muted-foreground">{description.coreValues}</p>
                </div>
              )}
              {description.keyActivities && (
                <div>
                  <p className="text-sm font-medium">Key Activities:</p>
                  <p className="text-sm text-muted-foreground">{description.keyActivities}</p>
                </div>
              )}
              {description.yearFounded && (
                <div>
                  <p className="text-sm font-medium">Year Founded:</p>
                  <p className="text-sm text-muted-foreground">{description.yearFounded}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Company Description' : 'Add Company Description'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="legalName">Legal Name *</Label>
              <Input
                id="legalName"
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                placeholder="Enter legal name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortName">Short Name</Label>
              <Input
                id="shortName"
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                placeholder="Enter short name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter company description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mission">Mission</Label>
            <Textarea
              id="mission"
              value={formData.mission}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              placeholder="Enter company mission"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vision">Vision</Label>
            <Textarea
              id="vision"
              value={formData.vision}
              onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
              placeholder="Enter company vision"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coreValues">Core Values</Label>
            <Textarea
              id="coreValues"
              value={formData.coreValues}
              onChange={(e) => setFormData({ ...formData, coreValues: e.target.value })}
              placeholder="Enter core values"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyActivities">Key Activities</Label>
            <Textarea
              id="keyActivities"
              value={formData.keyActivities}
              onChange={(e) => setFormData({ ...formData, keyActivities: e.target.value })}
              placeholder="Enter key activities"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearFounded">Year Founded</Label>
            <Input
              id="yearFounded"
              value={formData.yearFounded}
              onChange={(e) => setFormData({ ...formData, yearFounded: e.target.value })}
              placeholder="e.g., 2020"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave}>
              {isEditing ? 'Update' : 'Add'} Company Description
            </Button>
            {isEditing && (
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
