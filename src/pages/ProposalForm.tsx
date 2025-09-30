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
import { storage, Proposal, Process, Publication, Infrastructure, Project } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

const proposalSchema = z.object({
  acronym: z.string().min(1, 'Acronym is required'),
  programme: z.string().min(1, 'Programme is required'),
  call: z.string().min(1, 'Call is required'),
  type: z.string().min(1, 'Type is required'),
  fundedPercent: z.number().min(0).max(100),
  deadline: z.string().min(1, 'Deadline is required'),
  totalBudget: z.number().min(0),
  durationMonths: z.number().min(1).optional(),
  startMonth: z.number().min(1).max(12).optional(),
  startYear: z.number().min(2000).optional(),
  projectApplication: z.string().optional(),
  picPlatform: z.string().optional(),
  phixRole: z.string().optional(),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

const ProposalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGranted, setIsGranted] = useState(false);
  const [wavelengths, setWavelengths] = useState<string[]>(['']);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [selectedPublications, setSelectedPublications] = useState<string[]>([]);
  const [selectedInfrastructure, setSelectedInfrastructure] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [partners, setPartners] = useState<Array<{ name: string; country: string }>>([{ name: '', country: '' }]);
  const [workPackages, setWorkPackages] = useState<Array<{ number: string; description: string; leadPartner: string; involvedPartners: string[]; phixPersonMonths: number }>>([
    { number: '', description: '', leadPartner: '', involvedPartners: [], phixPersonMonths: 0 }
  ]);
  
  const [processes, setProcesses] = useState<Process[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [infrastructures, setInfrastructures] = useState<Infrastructure[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      acronym: '',
      programme: '',
      call: '',
      type: '',
      fundedPercent: 100,
      deadline: '',
      totalBudget: 0,
      projectApplication: '',
      picPlatform: '',
      phixRole: '',
    },
  });

  useEffect(() => {
    setProcesses(storage.get<Process>('processes'));
    setPublications(storage.get<Publication>('publications'));
    setInfrastructures(storage.get<Infrastructure>('infrastructure'));
    setProjects(storage.get<Project>('projects'));
  }, []);

  useEffect(() => {
    if (id) {
      const proposals = storage.get<Proposal>('proposals');
      const proposal = proposals.find((p) => p.id === id);
      if (proposal) {
        form.reset({
          acronym: proposal.acronym || '',
          programme: proposal.programme,
          call: proposal.call,
          type: proposal.type,
          fundedPercent: proposal.fundedPercent,
          deadline: proposal.deadline,
          totalBudget: proposal.totalBudget,
          durationMonths: proposal.durationMonths,
          startMonth: proposal.startMonth,
          startYear: proposal.startYear,
          projectApplication: proposal.projectApplication || '',
          picPlatform: proposal.picPlatform || '',
          phixRole: proposal.phixRole || '',
        });
        setIsGranted(proposal.isGranted);
        setWavelengths(proposal.wavelengths?.length ? proposal.wavelengths : ['']);
        setSelectedProcesses(proposal.phixProcesses || []);
        setSelectedPublications(proposal.publications || []);
        setSelectedInfrastructure(proposal.infrastructure || []);
        setSelectedProjects(proposal.relatedProjects || []);
        if (proposal.partners?.length) setPartners(proposal.partners);
        if (proposal.workPackages?.length) setWorkPackages(proposal.workPackages);
      }
    }
  }, [id, form]);

  const onSubmit = (data: ProposalFormData) => {
    const proposals = storage.get<Proposal>('proposals');
    
    const proposal: Proposal = {
      id: id || crypto.randomUUID(),
      acronym: data.acronym,
      programme: data.programme,
      call: data.call,
      type: data.type,
      fundedPercent: data.fundedPercent,
      deadline: data.deadline,
      isGranted: isGranted,
      durationMonths: data.durationMonths,
      startMonth: data.startMonth,
      startYear: data.startYear,
      totalBudget: data.totalBudget,
      projectApplication: data.projectApplication || '',
      wavelengths: wavelengths.filter(w => w.trim()),
      picPlatform: data.picPlatform || '',
      phixRole: data.phixRole || '',
      partners: partners.filter(p => p.name),
      workPackages: workPackages.filter(wp => wp.number),
      phixProcesses: selectedProcesses,
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
      publications: selectedPublications,
      relatedProjects: selectedProjects,
      infrastructure: selectedInfrastructure,
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

  const addWavelength = () => setWavelengths([...wavelengths, '']);
  const removeWavelength = (index: number) => setWavelengths(wavelengths.filter((_, i) => i !== index));
  const updateWavelength = (index: number, value: string) => {
    const updated = [...wavelengths];
    updated[index] = value;
    setWavelengths(updated);
  };

  const toggleProcess = (processId: string) => {
    setSelectedProcesses(prev =>
      prev.includes(processId) ? prev.filter(id => id !== processId) : [...prev, processId]
    );
  };

  const togglePublication = (pubId: string) => {
    setSelectedPublications(prev =>
      prev.includes(pubId) ? prev.filter(id => id !== pubId) : [...prev, pubId]
    );
  };

  const toggleInfrastructure = (infraId: string) => {
    setSelectedInfrastructure(prev =>
      prev.includes(infraId) ? prev.filter(id => id !== infraId) : [...prev, infraId]
    );
  };

  const toggleProject = (projectId: string) => {
    setSelectedProjects(prev =>
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
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
              <FormField
                control={form.control}
                name="acronym"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acronym</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Project acronym" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {id && (
                <>
                  <div className="flex items-center gap-2 p-4 bg-muted rounded-md">
                    <Checkbox checked={isGranted} onCheckedChange={(checked) => setIsGranted(checked as boolean)} id="isGranted" />
                    <label htmlFor="isGranted" className="text-sm font-medium cursor-pointer">
                      Mark as Granted (after submission)
                    </label>
                  </div>

                  {isGranted && (
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="durationMonths"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (months)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="startMonth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Month</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="12"
                                placeholder="1-12"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="startYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Year</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="2024"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </>
              )}
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
              <CardTitle>Wavelengths</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addWavelength}>
                <Plus className="h-4 w-4" />
                Add Wavelength
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {wavelengths.map((wavelength, index) => (
                <div key={index} className="flex gap-4">
                  <Input
                    placeholder="Wavelength"
                    value={wavelength}
                    onChange={(e) => updateWavelength(index, e.target.value)}
                    className="flex-1"
                  />
                  {wavelengths.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeWavelength(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
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
            <CardHeader>
              <CardTitle>Reusable Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {processes.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">PHIX Processes</Label>
                  <div className="space-y-2">
                    {processes.map((process) => (
                      <div key={process.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`process-${process.id}`}
                          checked={selectedProcesses.includes(process.id)}
                          onCheckedChange={() => toggleProcess(process.id)}
                        />
                        <label htmlFor={`process-${process.id}`} className="text-sm cursor-pointer flex-1">
                          {process.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {publications.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Publications</Label>
                  <div className="space-y-2">
                    {publications.map((pub) => (
                      <div key={pub.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`pub-${pub.id}`}
                          checked={selectedPublications.includes(pub.id)}
                          onCheckedChange={() => togglePublication(pub.id)}
                        />
                        <label htmlFor={`pub-${pub.id}`} className="text-sm cursor-pointer flex-1">
                          {pub.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {infrastructures.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Infrastructure</Label>
                  <div className="space-y-2">
                    {infrastructures.map((infra) => (
                      <div key={infra.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`infra-${infra.id}`}
                          checked={selectedInfrastructure.includes(infra.id)}
                          onCheckedChange={() => toggleInfrastructure(infra.id)}
                        />
                        <label htmlFor={`infra-${infra.id}`} className="text-sm cursor-pointer flex-1">
                          {infra.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {projects.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Related Projects</Label>
                  <div className="space-y-2">
                    {projects.map((project) => (
                      <div key={project.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`project-${project.id}`}
                          checked={selectedProjects.includes(project.id)}
                          onCheckedChange={() => toggleProject(project.id)}
                        />
                        <label htmlFor={`project-${project.id}`} className="text-sm cursor-pointer flex-1">
                          {project.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {processes.length === 0 && publications.length === 0 && infrastructures.length === 0 && projects.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No reusable data available. Add data in the Reusable Data section first.
                </p>
              )}
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
