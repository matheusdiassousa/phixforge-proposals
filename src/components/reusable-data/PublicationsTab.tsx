import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storage, Publication } from '@/lib/storage';
import { Trash2, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PublicationsTab = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', metadata: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = () => {
    setPublications(storage.get<Publication>('publications'));
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }

    const updated = editing
      ? publications.map((p) => (p.id === editing ? { ...p, ...formData } : p))
      : [...publications, { id: crypto.randomUUID(), ...formData }];

    storage.set('publications', updated);
    setPublications(updated);
    setEditing(null);
    setFormData({ title: '', metadata: '' });
    toast({ title: editing ? 'Publication updated' : 'Publication added' });
  };

  const handleDelete = (id: string) => {
    const updated = publications.filter((p) => p.id !== id);
    storage.set('publications', updated);
    setPublications(updated);
    toast({ title: 'Publication deleted' });
  };

  const handleEdit = (publication: Publication) => {
    setEditing(publication.id);
    setFormData({ title: publication.title, metadata: publication.metadata });
  };

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Edit Publication' : 'Add New Publication'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Publication title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Textarea
            placeholder="Metadata (authors, year, journal, etc.)"
            value={formData.metadata}
            onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
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
                  setFormData({ title: '', metadata: '' });
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {publications.map((publication) => (
          <Card key={publication.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{publication.title}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(publication)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(publication.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {publication.metadata && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{publication.metadata}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
