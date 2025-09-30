import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { storage, Proposal } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const proposalSchema = z.object({
  programme: z.string().min(1, 'Programme is required'),
  call: z.string().min(1, 'Call is required'),
  type: z.string().min(1, 'Type is required'),
  fundedPercent: z.number().min(0).max(100),
  deadline: z.string().min(1, 'Deadline is required'),
  isGranted: z.boolean(),
  totalBudget: z.number().min(0),
  projectApplication: z.string().optional(),
  wavelength: z.string().optional(),
  picPlatform: z.string().optional(),
  phixRole: z.string().optional(),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

const ProposalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [partners, setPartners] = useState<Array<{ name: string; country: string }>>([{ name: '', country: '' }]);
  const [workPackages, setWorkPackages] = useState<Array<{ number: string; description: string; leadPartner: string; involvedPartners: string[]; phixPersonMonths: number }>>([
    { number: '', description: '', leadPartner: '', involvedPartners: [], phixPersonMonths: 0 }
  ]);
  
  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      programme: '',
      call: '',
      type: '',
      fundedPercent: 100,
      deadline: '',
      isGranted: false,
      totalBudget: 0,
      projectApplication: '',
      wavelength: '',
      picPlatform: '',
      phixRole: '',
    },
  });

  useEffect(() => {
    if (id) {
      const proposals = storage.get<Proposal>('proposals');
      const proposal = proposals.find((p) => p.id === id);
      if (proposal) {
        form.reset({
          programme: proposal.programme,
          call: proposal.call,
          type: proposal.type,
          fundedPercent: proposal.fundedPercent,
          deadline: proposal.deadline,
          isGranted: proposal.isGranted,
          totalBudget: proposal.totalBudget,
          projectApplication: proposal.projectApplication || '',
          wavelength: proposal.wavelength || '',
          picPlatform: proposal.picPlatform || '',
          phixRole: proposal.phixRole || '',
        });
        if (proposal.partners?.length) setPartners(proposal.partners);
        if (proposal.workPackages?.length) setWorkPackages(proposal.workPackages);
      }
    }
  }, [id, form]);

  const onSubmit = (data: ProposalFormData) => {
    const proposals = storage.get<Proposal>('proposals');
    
    const proposal: Proposal = {
      id: id || crypto.randomUUID(),
      programme: data.programme,
      call: data.call,
      type: data.type,
      fundedPercent: data.fundedPercent,
      deadline: data.deadline,
      isGranted: data.isGranted,
      totalBudget: data.totalBudget,
      projectApplication: data.projectApplication || '',
      wavelength: data.wavelength || '',
      picPlatform: data.picPlatform || '',
      phixRole: data.phixRole || '',
      partners: partners.filter(p => p.name),
      workPackages: workPackages.filter(wp => wp.number),
      phixProcesses: [],
      participants: [],
      mainContact: {
        title: '',
        gender: '',
        firstName: '',
        lastName: '',
        email: '',
        position: '',
        department: '',
        address: '',
        phone: '',
      },
      otherContacts: [],
      researchers: [],
      rolesInProject: [],
      publications: [],
      relatedProjects: [],
      infrastructure: [],
      pmCost: 0,
      travelCosts: [],
      otherCosts: [],
    };

    if (id) {
      const index = proposals.findIndex(p => p.id === id);
      if (index !== -1) {
        proposals[index] = proposal;
        storage.set('proposals', proposals);
        toast({ title: 'Proposal updated successfully' });
      }
    } else {
      proposals.push(proposal);
      storage.set('proposals', proposals);
      toast({ title: 'Proposal created successfully' });
    }
    navigate('/proposals');
  };

  const addPartner = () => setPartners([...partners, { name: '', country: '' }]);
  const removePartner = (index: number) => setPartners(partners.filter((_, i) => i !== index));
  const updatePartner = (index: number, field: 'name' | 'country', value: string) => {
    const updated = [...partners];
    updated[index][field] = value;
    setPartners(updated);
  };

  const addWorkPackage = () => setWorkPackages([...workPackages, { number: '', description: '', leadPartner: '', involvedPartners: [], phixPersonMonths: 0 }]);
  const removeWorkPackage = (index: number) => setWorkPackages(workPackages.filter((_, i) => i !== index));
  const updateWorkPackage = (index: number, field: 'number' | 'description' | 'leadPartner' | 'phixPersonMonths', value: string | number) => {
    const updated = [...workPackages];
    updated[index] = { ...updated[index], [field]: value };
    setWorkPackages(updated);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/proposals')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">{id ? 'Edit Proposal' : 'New Proposal'}</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="programme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Programme</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select programme" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Horizon">Horizon</SelectItem>
                          <SelectItem value="Eurostars">Eurostars</SelectItem>
                          <SelectItem value="Eureka">Eureka</SelectItem>
                          <SelectItem value="National Call">National Call</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="call"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Call</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Call name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="RIA, LUMP-SUM, CSA, etc." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fundedPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Funded %</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          min="0"
                          max="100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Submission Deadline</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Budget (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          min="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isGranted"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Is Granted?</FormLabel>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="projectApplication"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Application</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} placeholder="Describe the project application..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="wavelength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wavelength</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Wavelength" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="picPlatform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PIC Platform</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="PIC Platform" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phixRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PHIX Role</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} placeholder="Describe PHIX role..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Partners</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addPartner}>
                <Plus className="h-4 w-4" />
                Add Partner
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {partners.map((partner, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <Input
                    placeholder="Partner name"
                    value={partner.name}
                    onChange={(e) => updatePartner(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Country"
                    value={partner.country}
                    onChange={(e) => updatePartner(index, 'country', e.target.value)}
                    className="flex-1"
                  />
                  {partners.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removePartner(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Work Packages</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addWorkPackage}>
                <Plus className="h-4 w-4" />
                Add Work Package
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {workPackages.map((wp, index) => (
                <div key={index} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex gap-4 items-start">
                    <Input
                      placeholder="WP Number"
                      value={wp.number}
                      onChange={(e) => updateWorkPackage(index, 'number', e.target.value)}
                      className="w-32"
                    />
                    <Input
                      placeholder="Lead Partner"
                      value={wp.leadPartner}
                      onChange={(e) => updateWorkPackage(index, 'leadPartner', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Person-Months"
                      value={wp.phixPersonMonths}
                      onChange={(e) => updateWorkPackage(index, 'phixPersonMonths', Number(e.target.value))}
                      className="w-32"
                      min="0"
                    />
                    {workPackages.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeWorkPackage(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Textarea
                    placeholder="Work package description..."
                    value={wp.description}
                    onChange={(e) => updateWorkPackage(index, 'description', e.target.value)}
                    rows={2}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/proposals')}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4" />
              {id ? 'Update' : 'Create'} Proposal
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProposalForm;
