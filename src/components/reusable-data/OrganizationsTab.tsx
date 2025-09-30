import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { storage, Organization } from '@/lib/storage';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const OrganizationsTab = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    legalName: '',
    shortName: '',
    picNumber: '',
    departments: [{ name: '', street: '', town: '', postcode: '', country: '' }],
  });
  const { toast } = useToast();

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = () => {
    setOrganizations(storage.get<Organization>('organizations'));
  };

  const handleSave = () => {
    if (!formData.legalName.trim()) {
      toast({ title: 'Legal name is required', variant: 'destructive' });
      return;
    }

    const updated = editing
      ? organizations.map((o) => (o.id === editing ? { ...o, ...formData } : o))
      : [...organizations, { id: crypto.randomUUID(), ...formData }];

    storage.set('organizations', updated);
    setOrganizations(updated);
    setEditing(null);
    setFormData({
      legalName: '',
      shortName: '',
      picNumber: '',
      departments: [{ name: '', street: '', town: '', postcode: '', country: '' }],
    });
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
      legalName: organization.legalName || '',
      shortName: organization.shortName || '',
      picNumber: organization.picNumber || '',
      departments: organization.departments?.length
        ? organization.departments
        : [{ name: '', street: '', town: '', postcode: '', country: '' }],
    });
  };

  const addDepartment = () => {
    setFormData({
      ...formData,
      departments: [...formData.departments, { name: '', street: '', town: '', postcode: '', country: '' }],
    });
  };

  const removeDepartment = (index: number) => {
    setFormData({
      ...formData,
      departments: formData.departments.filter((_, i) => i !== index),
    });
  };

  const updateDepartment = (index: number, field: string, value: string) => {
    const updated = [...formData.departments];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, departments: updated });
  };

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Edit Organization' : 'Add New Organization'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Legal Name</Label>
              <Input
                placeholder="Full legal name"
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
              />
            </div>
            <div>
              <Label>Short Name (Acronym)</Label>
              <Input
                placeholder="Acronym"
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>PIC Number</Label>
            <Input
              placeholder="PIC number"
              value={formData.picNumber}
              onChange={(e) => setFormData({ ...formData, picNumber: e.target.value })}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Departments Carrying Out the Proposed Work</Label>
              <Button type="button" variant="outline" size="sm" onClick={addDepartment}>
                <Plus className="h-4 w-4 mr-1" />
                Add Department
              </Button>
            </div>

            {formData.departments.map((dept, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                <div className="flex justify-between items-center">
                  <Label className="font-semibold">Department {index + 1}</Label>
                  {formData.departments.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDepartment(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Input
                  placeholder="Department name"
                  value={dept.name}
                  onChange={(e) => updateDepartment(index, 'name', e.target.value)}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Street"
                    value={dept.street}
                    onChange={(e) => updateDepartment(index, 'street', e.target.value)}
                  />
                  <Input
                    placeholder="Town"
                    value={dept.town}
                    onChange={(e) => updateDepartment(index, 'town', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Postcode"
                    value={dept.postcode}
                    onChange={(e) => updateDepartment(index, 'postcode', e.target.value)}
                  />
                  <Input
                    placeholder="Country"
                    value={dept.country}
                    onChange={(e) => updateDepartment(index, 'country', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave}>
              {editing ? 'Update' : 'Add'}
            </Button>
            {editing && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(null);
                  setFormData({
                    legalName: '',
                    shortName: '',
                    picNumber: '',
                    departments: [{ name: '', street: '', town: '', postcode: '', country: '' }],
                  });
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
                <div>
                  <CardTitle className="text-lg">{organization.legalName || organization.shortName}</CardTitle>
                  {organization.shortName && organization.legalName !== organization.shortName && (
                    <p className="text-sm text-muted-foreground mt-1">({organization.shortName})</p>
                  )}
                  {organization.picNumber && (
                    <p className="text-sm text-muted-foreground">PIC: {organization.picNumber}</p>
                  )}
                </div>
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
            {organization.departments && organization.departments.length > 0 && (
              <CardContent className="space-y-3">
                <Label className="text-sm font-semibold">Departments:</Label>
                {organization.departments.map((dept, idx) => (
                  <div key={idx} className="text-sm text-muted-foreground border-l-2 pl-3">
                    <p className="font-medium text-foreground">{dept.name}</p>
                    {dept.street && <p>{dept.street}</p>}
                    {(dept.town || dept.postcode) && (
                      <p>
                        {dept.postcode && `${dept.postcode} `}
                        {dept.town}
                      </p>
                    )}
                    {dept.country && <p>{dept.country}</p>}
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
