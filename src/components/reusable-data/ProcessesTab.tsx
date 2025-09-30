import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storage, Process } from '@/lib/storage';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ProcessesTab = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadProcesses();
  }, []);

  const loadProcesses = () => {
    setProcesses(storage.get<Process>('processes'));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }

    const updated = editing
      ? processes.map((p) => (p.id === editing ? { ...p, ...formData } : p))
      : [...processes, { id: crypto.randomUUID(), ...formData }];

    storage.set('processes', updated);
    setProcesses(updated);
    setEditing(null);
    setFormData({ name: '', description: '' });
    toast({ title: editing ? 'Process updated' : 'Process added' });
  };

  const handleDelete = (id: string) => {
    const updated = processes.filter((p) => p.id !== id);
    storage.set('processes', updated);
    setProcesses(updated);
    toast({ title: 'Process deleted' });
  };

  const handleEdit = (process: Process) => {
    setEditing(process.id);
    setFormData({ name: process.name, description: process.description });
  };

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Edit Process' : 'Add New Process'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Process name"
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
        {processes.map((process) => (
          <Card key={process.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{process.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(process)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(process.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {process.description && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{process.description}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
