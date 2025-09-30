import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storage, Infrastructure } from '@/lib/storage';
import { Trash2, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const InfrastructureTab = () => {
  const [infrastructure, setInfrastructure] = useState<Infrastructure[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadInfrastructure();
  }, []);

  const loadInfrastructure = () => {
    setInfrastructure(storage.get<Infrastructure>('infrastructure'));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }

    const updated = editing
      ? infrastructure.map((i) => (i.id === editing ? { ...i, ...formData } : i))
      : [...infrastructure, { id: crypto.randomUUID(), ...formData }];

    storage.set('infrastructure', updated);
    setInfrastructure(updated);
    setEditing(null);
    setFormData({ name: '', description: '' });
    toast({ title: editing ? 'Infrastructure updated' : 'Infrastructure added' });
  };

  const handleDelete = (id: string) => {
    const updated = infrastructure.filter((i) => i.id !== id);
    storage.set('infrastructure', updated);
    setInfrastructure(updated);
    toast({ title: 'Infrastructure deleted' });
  };

  const handleEdit = (item: Infrastructure) => {
    setEditing(item.id);
    setFormData({ name: item.name, description: item.description });
  };

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Edit Infrastructure' : 'Add New Infrastructure'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Infrastructure name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="flex gap-2">
            <Button onClick={handleSave}>
              {editing ? 'Update' : 'Add'}
            </Button>
            {editing && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(null);
                  setFormData({ name: '', description: '' });
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {infrastructure.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {item.description && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
