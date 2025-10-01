import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    description: '',
  });

  useEffect(() => {
    loadDescriptions();
  }, []);

  const loadDescriptions = () => {
    const stored = storage.get<CompanyDescription>('companyDescription');
    setDescriptions(stored);
  };

  const handleSave = () => {
    if (!formData.description.trim()) {
      toast({
        title: "Error",
        description: "Description is required",
        variant: "destructive",
      });
      return;
    }

    const newDescription: CompanyDescription = {
      id: editingId || Date.now().toString(),
      description: formData.description,
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
      description: description.description,
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
      description: '',
    });
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {descriptions.map((description) => (
          <Card key={description.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>Company Experience Description</CardTitle>
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
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {description.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Edit Company Description' : 'Add Company Description'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Company Experience Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the company's experience, expertise, and background..."
              rows={10}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave}>
              {isEditing ? 'Update' : 'Add'} Description
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
