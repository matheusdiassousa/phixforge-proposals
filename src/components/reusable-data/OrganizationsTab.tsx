import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storage, Organization } from '@/lib/storage';
import { Trash2, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const OrganizationsTab = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', country: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = () => {
    setOrganizations(storage.get<Organization>('organizations'));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }

    const updated = editing
      ? organizations.map((o) => (o.id === editing ? { ...o, ...formData } : o))
      : [...organizations, { id: crypto.randomUUID(), ...formData }];

    storage.set('organizations', updated);
    setOrganizations(updated);
    setEditing(null);
    setFormData({ name: '', address: '', country: '' });
    toast({ title: editing ? 'Organization updated' : 'Organization added' });
  };

  const handleDelete = (id: string) => {
    const updated = organizations.filter((o) => o.id !== id);
    storage.set('organizations', updated);
    setOrganizations(updated);
    toast({ title: 'Organization deleted' });
  };

  const handleEdit = (organization: Organization) => {
    setEditing(organization.id);
    setFormData({
      name: organization.name,
      address: organization.address,
      country: organization.country,
    });
  };

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Edit Organization' : 'Add New Organization'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Organization name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            placeholder="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <Input
            placeholder="Country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
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
                  setFormData({ name: '', address: '', country: '' });
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {organizations.map((organization) => (
          <Card key={organization.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{organization.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(organization)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(organization.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {organization.address}
                {organization.address && organization.country && ', '}
                {organization.country}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
