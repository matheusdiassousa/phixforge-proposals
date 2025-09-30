import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { storage, PersonnelInvolvement } from '@/lib/storage';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PersonnelInvolvementTab = () => {
  const [personnelRecords, setPersonnelRecords] = useState<PersonnelInvolvement[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    mainContact: {
      title: '',
      gender: '',
      firstName: '',
      lastName: '',
      email: '',
      position: '',
      department: '',
      street: '',
      town: '',
      postcode: '',
      country: '',
      phone: '',
    },
    otherContacts: [] as Array<{
      title: string;
      gender: string;
      firstName: string;
      lastName: string;
      email: string;
      position: string;
      department: string;
      street: string;
      town: string;
      postcode: string;
      country: string;
      phone: string;
    }>,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPersonnel();
  }, []);

  const loadPersonnel = () => {
    setPersonnelRecords(storage.get<PersonnelInvolvement>('personnelInvolvement'));
  };

  const handleSave = () => {
    if (!formData.mainContact.firstName.trim() || !formData.mainContact.lastName.trim()) {
      toast({ title: 'Main contact first and last name are required', variant: 'destructive' });
      return;
    }

    const updated = editing
      ? personnelRecords.map((p) => (p.id === editing ? { ...p, ...formData } : p))
      : [...personnelRecords, { id: crypto.randomUUID(), ...formData }];

    storage.set('personnelInvolvement', updated);
    setPersonnelRecords(updated);
    setEditing(null);
    resetForm();
    toast({ title: editing ? 'Personnel updated' : 'Personnel added' });
  };

  const handleDelete = (id: string) => {
    const updated = personnelRecords.filter((p) => p.id !== id);
    storage.set('personnelInvolvement', updated);
    setPersonnelRecords(updated);
    toast({ title: 'Personnel deleted' });
  };

  const handleEdit = (personnel: PersonnelInvolvement) => {
    setEditing(personnel.id);
    setFormData({
      mainContact: { ...personnel.mainContact },
      otherContacts: [...personnel.otherContacts],
    });
  };

  const resetForm = () => {
    setFormData({
      mainContact: {
        title: '',
        gender: '',
        firstName: '',
        lastName: '',
        email: '',
        position: '',
        department: '',
        street: '',
        town: '',
        postcode: '',
        country: '',
        phone: '',
      },
      otherContacts: [],
    });
  };

  const addOtherContact = () => {
    setFormData({
      ...formData,
      otherContacts: [
        ...formData.otherContacts,
        {
          title: '',
          gender: '',
          firstName: '',
          lastName: '',
          email: '',
          position: '',
          department: '',
          street: '',
          town: '',
          postcode: '',
          country: '',
          phone: '',
        },
      ],
    });
  };

  const removeOtherContact = (index: number) => {
    setFormData({
      ...formData,
      otherContacts: formData.otherContacts.filter((_, i) => i !== index),
    });
  };

  const updateOtherContact = (index: number, field: string, value: string) => {
    const updated = [...formData.otherContacts];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, otherContacts: updated });
  };

  const updateMainContact = (field: string, value: string) => {
    setFormData({
      ...formData,
      mainContact: { ...formData.mainContact, [field]: value },
    });
  };

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Edit Personnel Involvement' : 'Add Personnel Involvement'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Contact Person */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Main Contact Person</Label>
            
            <div className="grid grid-cols-3 gap-4">
              <Select
                value={formData.mainContact.title}
                onValueChange={(value) => updateMainContact('title', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Title" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dr.">Dr.</SelectItem>
                  <SelectItem value="Prof.">Prof.</SelectItem>
                  <SelectItem value="Mr.">Mr.</SelectItem>
                  <SelectItem value="Mrs.">Mrs.</SelectItem>
                  <SelectItem value="Ms.">Ms.</SelectItem>
                  <SelectItem value="Eng.">Eng.</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={formData.mainContact.gender}
                onValueChange={(value) => updateMainContact('gender', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="First Name"
                value={formData.mainContact.firstName}
                onChange={(e) => updateMainContact('firstName', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Last Name"
                value={formData.mainContact.lastName}
                onChange={(e) => updateMainContact('lastName', e.target.value)}
              />
              <Input
                type="email"
                placeholder="Email"
                value={formData.mainContact.email}
                onChange={(e) => updateMainContact('email', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Position in org."
                value={formData.mainContact.position}
                onChange={(e) => updateMainContact('position', e.target.value)}
              />
              <Input
                placeholder="Department"
                value={formData.mainContact.department}
                onChange={(e) => updateMainContact('department', e.target.value)}
              />
            </div>

            <Input
              placeholder="Street"
              value={formData.mainContact.street}
              onChange={(e) => updateMainContact('street', e.target.value)}
            />

            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="Town"
                value={formData.mainContact.town}
                onChange={(e) => updateMainContact('town', e.target.value)}
              />
              <Input
                placeholder="Postcode"
                value={formData.mainContact.postcode}
                onChange={(e) => updateMainContact('postcode', e.target.value)}
              />
              <Input
                placeholder="Country"
                value={formData.mainContact.country}
                onChange={(e) => updateMainContact('country', e.target.value)}
              />
            </div>

            <Input
              placeholder="Phone"
              value={formData.mainContact.phone}
              onChange={(e) => updateMainContact('phone', e.target.value)}
            />
          </div>

          <Separator />

          {/* Other Contact Persons */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Other Contact Persons</Label>
              <Button type="button" variant="outline" size="sm" onClick={addOtherContact}>
                <Plus className="h-4 w-4 mr-1" />
                Add Contact
              </Button>
            </div>

            {formData.otherContacts.map((contact, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                <div className="flex justify-between items-center">
                  <Label className="font-semibold">Person {index + 1}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOtherContact(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Select
                    value={contact.title}
                    onValueChange={(value) => updateOtherContact(index, 'title', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dr.">Dr.</SelectItem>
                      <SelectItem value="Prof.">Prof.</SelectItem>
                      <SelectItem value="Mr.">Mr.</SelectItem>
                      <SelectItem value="Mrs.">Mrs.</SelectItem>
                      <SelectItem value="Ms.">Ms.</SelectItem>
                      <SelectItem value="Eng.">Eng.</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={contact.gender}
                    onValueChange={(value) => updateOtherContact(index, 'gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="First Name"
                    value={contact.firstName}
                    onChange={(e) => updateOtherContact(index, 'firstName', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Last Name"
                    value={contact.lastName}
                    onChange={(e) => updateOtherContact(index, 'lastName', e.target.value)}
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={contact.email}
                    onChange={(e) => updateOtherContact(index, 'email', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Position in org."
                    value={contact.position}
                    onChange={(e) => updateOtherContact(index, 'position', e.target.value)}
                  />
                  <Input
                    placeholder="Department"
                    value={contact.department}
                    onChange={(e) => updateOtherContact(index, 'department', e.target.value)}
                  />
                </div>

                <Input
                  placeholder="Street"
                  value={contact.street}
                  onChange={(e) => updateOtherContact(index, 'street', e.target.value)}
                />

                <div className="grid grid-cols-3 gap-3">
                  <Input
                    placeholder="Town"
                    value={contact.town}
                    onChange={(e) => updateOtherContact(index, 'town', e.target.value)}
                  />
                  <Input
                    placeholder="Postcode"
                    value={contact.postcode}
                    onChange={(e) => updateOtherContact(index, 'postcode', e.target.value)}
                  />
                  <Input
                    placeholder="Country"
                    value={contact.country}
                    onChange={(e) => updateOtherContact(index, 'country', e.target.value)}
                  />
                </div>

                <Input
                  placeholder="Phone"
                  value={contact.phone}
                  onChange={(e) => updateOtherContact(index, 'phone', e.target.value)}
                />
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
                  resetForm();
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {personnelRecords.map((personnel) => (
          <Card key={personnel.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {personnel.mainContact.title} {personnel.mainContact.firstName}{' '}
                    {personnel.mainContact.lastName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Main Contact - {personnel.mainContact.position}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(personnel)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(personnel.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                {personnel.mainContact.email && (
                  <p className="text-muted-foreground">{personnel.mainContact.email}</p>
                )}
                {personnel.mainContact.phone && (
                  <p className="text-muted-foreground">{personnel.mainContact.phone}</p>
                )}
                {personnel.mainContact.department && (
                  <p className="text-muted-foreground">Department: {personnel.mainContact.department}</p>
                )}
              </div>

              {personnel.otherContacts.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-semibold">Other Contacts:</Label>
                    <div className="mt-2 space-y-2">
                      {personnel.otherContacts.map((contact, idx) => (
                        <div key={idx} className="text-sm border-l-2 pl-3">
                          <p className="font-medium">
                            {contact.title} {contact.firstName} {contact.lastName}
                          </p>
                          {contact.position && (
                            <p className="text-muted-foreground">{contact.position}</p>
                          )}
                          {contact.email && (
                            <p className="text-muted-foreground">{contact.email}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
