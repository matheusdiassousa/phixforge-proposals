import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { storage, Person } from '@/lib/storage';
import { Trash2, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PeopleTab = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    position: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = () => {
    setPeople(storage.get<Person>('people'));
  };

  const handleSave = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }

    const updated = editing
      ? people.map((p) => (p.id === editing ? { ...p, ...formData } : p))
      : [...people, { id: crypto.randomUUID(), ...formData }];

    storage.set('people', updated);
    setPeople(updated);
    setEditing(null);
    setFormData({ title: '', firstName: '', lastName: '', email: '', position: '' });
    toast({ title: editing ? 'Person updated' : 'Person added' });
  };

  const handleDelete = (id: string) => {
    const updated = people.filter((p) => p.id !== id);
    storage.set('people', updated);
    setPeople(updated);
    toast({ title: 'Person deleted' });
  };

  const handleEdit = (person: Person) => {
    setEditing(person.id);
    setFormData({
      title: person.title,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      position: person.position,
    });
  };

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Edit Person' : 'Add New Person'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Select
              value={formData.title}
              onValueChange={(value) => setFormData({ ...formData, title: value })}
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
            <Input
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <Input
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              placeholder="Position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
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
                  setFormData({ title: '', firstName: '', lastName: '', email: '', position: '' });
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {people.map((person) => (
          <Card key={person.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {person.title} {person.firstName} {person.lastName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{person.position}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(person)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(person.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {person.email && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{person.email}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
