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
import { storage, Proposal, Process, Publication, Infrastructure, Project, Person, Organization, PersonnelInvolvement, Exploitation, CompanyDescription } from '@/lib/storage';
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
  startDate: z.string().optional(),
  extensionMonths: z.number().min(0).optional(),
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
  const [isCompleted, setIsCompleted] = useState(false);
  const [wavelengths, setWavelengths] = useState<string[]>(['']);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [selectedPublications, setSelectedPublications] = useState<string[]>([]);
  const [selectedInfrastructure, setSelectedInfrastructure] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<Array<{ personId: string; role: string }>>([]);
  const [phixOrgRoles, setPhixOrgRoles] = useState<string[]>([]);
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);
  const [selectedPersonnelInvolvement, setSelectedPersonnelInvolvement] = useState<string[]>([]);
  const [selectedExploitation, setSelectedExploitation] = useState<string[]>([]);
  const [selectedCompanyDescription, setSelectedCompanyDescription] = useState<string[]>([]);
  const [partners, setPartners] = useState<Array<{ name: string; country: string }>>([{ name: '', country: '' }]);
  const [workPackages, setWorkPackages] = useState<Array<{ 
    number: string; 
    description: string; 
    leadPartner: string; 
    involvedPartners: string[]; 
    phixPersonMonths: number;
    personMonthRate: number;
    otherCosts: Array<{ description: string; value: number }>;
    travelCosts: Array<{ description: string; value: number }>;
  }>>([
    { number: '', description: '', leadPartner: '', involvedPartners: [], phixPersonMonths: 0, personMonthRate: 0, otherCosts: [], travelCosts: [] }
  ]);
  const [customProgramme, setCustomProgramme] = useState('');
  const [customProgrammes, setCustomProgrammes] = useState<string[]>([]);
  const [showCustomProgramme, setShowCustomProgramme] = useState(false);
  
  // Date picker state
  const [tempDay, setTempDay] = useState('');
  const [tempMonth, setTempMonth] = useState('');
  const [tempYear, setTempYear] = useState('');
  
  // Budget display state
  const [budgetDisplay, setBudgetDisplay] = useState('');
  
  const [processes, setProcesses] = useState<Process[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [infrastructures, setInfrastructures] = useState<Infrastructure[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [personnelInvolvement, setPersonnelInvolvement] = useState<PersonnelInvolvement[]>([]);
  const [exploitations, setExploitations] = useState<Exploitation[]>([]);
  const [companyDescriptions, setCompanyDescriptions] = useState<CompanyDescription[]>([]);
  
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
      durationMonths: undefined,
      startDate: undefined,
      extensionMonths: 0,
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
    setPeople(storage.get<Person>('people'));
    setOrganizations(storage.get<Organization>('organizations'));
    setPersonnelInvolvement(storage.get<PersonnelInvolvement>('personnelInvolvement'));
    setExploitations(storage.get<Exploitation>('exploitation'));
    setCompanyDescriptions(storage.get<CompanyDescription>('companyDescription'));
    setCustomProgrammes(storage.get<string>('customProgrammes'));
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
          startDate: proposal.startDate,
          extensionMonths: proposal.extensionMonths || 0,
          projectApplication: proposal.projectApplication || '',
          picPlatform: proposal.picPlatform || '',
          phixRole: proposal.phixRole || '',
        });
        setIsGranted(proposal.isGranted);
        setIsCompleted(proposal.isCompleted || false);
        setWavelengths(proposal.wavelengths?.length ? proposal.wavelengths : ['']);
        setSelectedProcesses(proposal.phixProcesses || []);
        setSelectedPublications(proposal.publications || []);
        setSelectedInfrastructure(proposal.infrastructure || []);
        setSelectedProjects(proposal.relatedProjects || []);
        setSelectedPeople(proposal.selectedPeople || []);
        setPhixOrgRoles(proposal.phixOrgRoles || []);
        setSelectedOrganizations(proposal.organizations || []);
        setSelectedPersonnelInvolvement(proposal.personnelInvolvement || []);
        setSelectedExploitation(proposal.exploitation || []);
        setSelectedCompanyDescription(proposal.companyDescription || []);
        if (proposal.partners?.length) setPartners(proposal.partners);
        if (proposal.workPackages?.length) setWorkPackages(proposal.workPackages);
        
        // Initialize date picker fields
        if (proposal.startDate) {
          const date = new Date(proposal.startDate);
          setTempDay(date.getDate().toString());
          setTempMonth((date.getMonth() + 1).toString());
          setTempYear(date.getFullYear().toString());
        }
        
        // Initialize budget display
        if (proposal.totalBudget) {
          setBudgetDisplay(proposal.totalBudget.toLocaleString('pt-PT'));
        }
      }
    }
  }, [id, form]);

  const calculatePhixBudget = () => {
    const sum = workPackages.reduce((total, wp) => {
      const personMonthCost = wp.phixPersonMonths * wp.personMonthRate;
      const otherCostsTotal = wp.otherCosts.reduce((sum, cost) => sum + cost.value, 0);
      const travelCostsTotal = wp.travelCosts.reduce((sum, cost) => sum + cost.value, 0);
      return total + personMonthCost + otherCostsTotal + travelCostsTotal;
    }, 0);
    return sum + (sum * 0.25); // Add 25%
  };

  const onSubmit = (data: ProposalFormData) => {
    const proposals = storage.get<Proposal>('proposals');
    
    // Handle custom programme
    let finalProgramme = data.programme;
    if (data.programme === 'Other' && customProgramme.trim()) {
      finalProgramme = customProgramme.trim();
      const existingCustomProgrammes = storage.get<string>('customProgrammes');
      if (!existingCustomProgrammes.includes(finalProgramme)) {
        storage.set('customProgrammes', [...existingCustomProgrammes, finalProgramme]);
      }
    }
    
    const proposal: Proposal = {
      id: id || crypto.randomUUID(),
      acronym: data.acronym,
      programme: finalProgramme,
      call: data.call,
      type: data.type,
      fundedPercent: data.fundedPercent,
      deadline: data.deadline,
      isGranted: isGranted,
      isCompleted: isCompleted,
      durationMonths: data.durationMonths,
      startDate: data.startDate,
      extensionMonths: data.extensionMonths,
      totalBudget: data.totalBudget,
      phixBudget: calculatePhixBudget(),
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
      phixOrgRoles: phixOrgRoles,
      selectedPeople: selectedPeople,
      publications: selectedPublications,
      relatedProjects: selectedProjects,
      infrastructure: selectedInfrastructure,
      organizations: selectedOrganizations,
      personnelInvolvement: selectedPersonnelInvolvement,
      exploitation: selectedExploitation,
      companyDescription: selectedCompanyDescription,
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

  const toggleOrganization = (orgId: string) => {
    setSelectedOrganizations(prev =>
      prev.includes(orgId) ? prev.filter(id => id !== orgId) : [...prev, orgId]
    );
  };

  const togglePersonnelInvolvement = (piId: string) => {
    setSelectedPersonnelInvolvement(prev =>
      prev.includes(piId) ? prev.filter(id => id !== piId) : [...prev, piId]
    );
  };

  const toggleExploitation = (expId: string) => {
    setSelectedExploitation(prev =>
      prev.includes(expId) ? prev.filter(id => id !== expId) : [...prev, expId]
    );
  };

  const toggleCompanyDescription = (cdId: string) => {
    setSelectedCompanyDescription(prev =>
      prev.includes(cdId) ? prev.filter(id => id !== cdId) : [...prev, cdId]
    );
  };

  const addPartner = () => setPartners([...partners, { name: '', country: '' }]);
  const removePartner = (index: number) => setPartners(partners.filter((_, i) => i !== index));
  const updatePartner = (index: number, field: 'name' | 'country', value: string) => {
    const updated = [...partners];
    updated[index][field] = value;
    setPartners(updated);
  };

  const addWorkPackage = () => setWorkPackages([...workPackages, { 
    number: '', 
    description: '', 
    leadPartner: '', 
    involvedPartners: [], 
    phixPersonMonths: 0, 
    personMonthRate: 0,
    otherCosts: [],
    travelCosts: []
  }]);
  
  const removeWorkPackage = (index: number) => setWorkPackages(workPackages.filter((_, i) => i !== index));
  
  const updateWorkPackage = (index: number, field: 'number' | 'description' | 'leadPartner' | 'phixPersonMonths' | 'personMonthRate', value: string | number) => {
    const updated = [...workPackages];
    updated[index] = { ...updated[index], [field]: value };
    setWorkPackages(updated);
  };

  const addWPOtherCost = (wpIndex: number) => {
    const updated = [...workPackages];
    updated[wpIndex].otherCosts.push({ description: '', value: 0 });
    setWorkPackages(updated);
  };

  const removeWPOtherCost = (wpIndex: number, costIndex: number) => {
    const updated = [...workPackages];
    updated[wpIndex].otherCosts = updated[wpIndex].otherCosts.filter((_, i) => i !== costIndex);
    setWorkPackages(updated);
  };

  const updateWPOtherCost = (wpIndex: number, costIndex: number, field: 'description' | 'value', value: string | number) => {
    const updated = [...workPackages];
    updated[wpIndex].otherCosts[costIndex] = { ...updated[wpIndex].otherCosts[costIndex], [field]: value };
    setWorkPackages(updated);
  };

  const addWPTravelCost = (wpIndex: number) => {
    const updated = [...workPackages];
    updated[wpIndex].travelCosts.push({ description: '', value: 0 });
    setWorkPackages(updated);
  };

  const removeWPTravelCost = (wpIndex: number, costIndex: number) => {
    const updated = [...workPackages];
    updated[wpIndex].travelCosts = updated[wpIndex].travelCosts.filter((_, i) => i !== costIndex);
    setWorkPackages(updated);
  };

  const updateWPTravelCost = (wpIndex: number, costIndex: number, field: 'description' | 'value', value: string | number) => {
    const updated = [...workPackages];
    updated[wpIndex].travelCosts[costIndex] = { ...updated[wpIndex].travelCosts[costIndex], [field]: value };
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
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setShowCustomProgramme(value === 'Other');
                        }} 
                        value={field.value}
                      >
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
                          {customProgrammes.map((prog) => (
                            <SelectItem key={prog} value={prog}>{prog}</SelectItem>
                          ))}
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showCustomProgramme && (
                  <div className="col-span-2">
                    <Label>Custom Programme Name</Label>
                    <Input
                      placeholder="Enter programme name"
                      value={customProgramme}
                      onChange={(e) => setCustomProgramme(e.target.value)}
                    />
                  </div>
                )}

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
                  render={({ field }) => {
                    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                      const rawValue = e.target.value.replace(/[^\d]/g, '');
                      const numValue = rawValue ? Number(rawValue) : 0;
                      field.onChange(numValue);
                      setBudgetDisplay(numValue.toLocaleString('pt-PT'));
                    };

                    const fundedPercent = form.watch('fundedPercent');
                    const totalBudget = field.value || 0;
                    const phixCoFunding = fundedPercent < 100 
                      ? (totalBudget / 1.25) * ((100 - fundedPercent) / 100)
                      : 0;

                    return (
                      <FormItem>
                        <FormLabel>Total Budget (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            value={budgetDisplay}
                            onChange={handleChange}
                            placeholder="0"
                          />
                        </FormControl>
                        {phixCoFunding > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            PHIX Co-Funding Required: €{phixCoFunding.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

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
                  name="extensionMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extension (months)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => {
                    const updateDate = (day: string, month: string, year: string) => {
                      const d = Number(day);
                      const m = Number(month);
                      const y = Number(year);
                      
                      if (d && m && y) {
                        const date = new Date(y, m - 1, d);
                        field.onChange(date.toISOString());
                      }
                    };

                    const months = [
                      'January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'
                    ];

                    return (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Day</Label>
                            <Select
                              value={tempDay}
                              onValueChange={(value) => {
                                setTempDay(value);
                                updateDate(value, tempMonth, tempYear);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Day" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[200px]">
                                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                  <SelectItem key={day} value={day.toString()}>
                                    {day}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Month</Label>
                            <Select
                              value={tempMonth}
                              onValueChange={(value) => {
                                setTempMonth(value);
                                updateDate(tempDay, value, tempYear);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Month" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[200px]">
                                {months.map((month, index) => (
                                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                                    {month}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Year</Label>
                            <Select
                              value={tempYear}
                              onValueChange={(value) => {
                                setTempYear(value);
                                updateDate(tempDay, tempMonth, value);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Year" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[200px]">
                                {Array.from({ length: 51 }, (_, i) => 2000 + i).map((year) => (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              {id && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-4 bg-muted rounded-md">
                    <Checkbox checked={isGranted} onCheckedChange={(checked) => setIsGranted(checked as boolean)} id="isGranted" />
                    <label htmlFor="isGranted" className="text-sm font-medium cursor-pointer">
                      Mark as Granted (after submission)
                    </label>
                  </div>
                  {isGranted && (
                    <div className="flex items-center gap-2 p-4 bg-muted rounded-md">
                      <Checkbox checked={isCompleted} onCheckedChange={(checked) => setIsCompleted(checked as boolean)} id="isCompleted" />
                      <label htmlFor="isCompleted" className="text-sm font-medium cursor-pointer">
                        Project Complete
                      </label>
                    </div>
                  )}
                </div>
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

              {organizations.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Organizations</Label>
                  <div className="space-y-2">
                    {organizations.map((org) => (
                      <div key={org.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`org-${org.id}`}
                          checked={selectedOrganizations.includes(org.id)}
                          onCheckedChange={() => toggleOrganization(org.id)}
                        />
                        <label htmlFor={`org-${org.id}`} className="text-sm cursor-pointer flex-1">
                          {org.legalName || org.shortName}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {personnelInvolvement.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Personnel Involvement</Label>
                  <div className="space-y-2">
                    {personnelInvolvement.map((pi) => (
                      <div key={pi.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`pi-${pi.id}`}
                          checked={selectedPersonnelInvolvement.includes(pi.id)}
                          onCheckedChange={() => togglePersonnelInvolvement(pi.id)}
                        />
                        <label htmlFor={`pi-${pi.id}`} className="text-sm cursor-pointer flex-1">
                          {pi.mainContact.firstName} {pi.mainContact.lastName} - {pi.mainContact.position}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {exploitations.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Exploitation</Label>
                  <div className="space-y-2">
                    {exploitations.map((exp) => (
                      <div key={exp.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`exp-${exp.id}`}
                          checked={selectedExploitation.includes(exp.id)}
                          onCheckedChange={() => toggleExploitation(exp.id)}
                        />
                        <label htmlFor={`exp-${exp.id}`} className="text-sm cursor-pointer flex-1">
                          {exp.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {companyDescriptions.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Company Description</Label>
                  <div className="space-y-2">
                    {companyDescriptions.map((cd) => (
                      <div key={cd.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cd-${cd.id}`}
                          checked={selectedCompanyDescription.includes(cd.id)}
                          onCheckedChange={() => toggleCompanyDescription(cd.id)}
                        />
                        <label htmlFor={`cd-${cd.id}`} className="text-sm cursor-pointer flex-1">
                          Company Experience Description
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {processes.length === 0 && publications.length === 0 && infrastructures.length === 0 && 
               projects.length === 0 && organizations.length === 0 && personnelInvolvement.length === 0 && 
               exploitations.length === 0 && companyDescriptions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No reusable data available. Add data in the Reusable Data section first.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Work Packages & PHIX Budget</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addWorkPackage}>
                <Plus className="h-4 w-4" />
                Add Work Package
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {workPackages.map((wp, wpIndex) => (
                <div key={wpIndex} className="space-y-4 p-4 border rounded-lg bg-card">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">Work Package {wp.number || wpIndex + 1}</h3>
                    {workPackages.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeWorkPackage(wpIndex)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="WP Number"
                      value={wp.number}
                      onChange={(e) => updateWorkPackage(wpIndex, 'number', e.target.value)}
                    />
                    <Input
                      placeholder="Lead Partner"
                      value={wp.leadPartner}
                      onChange={(e) => updateWorkPackage(wpIndex, 'leadPartner', e.target.value)}
                    />
                  </div>
                  
                  <Textarea
                    placeholder="Work package description..."
                    value={wp.description}
                    onChange={(e) => updateWorkPackage(wpIndex, 'description', e.target.value)}
                    rows={2}
                  />

                  <Separator />
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Person Months</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Total Person-Months</Label>
                        <Input
                          type="number"
                          placeholder="Person-Months"
                          value={wp.phixPersonMonths}
                          onChange={(e) => updateWorkPackage(wpIndex, 'phixPersonMonths', Number(e.target.value))}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Rate per Person-Month (€)</Label>
                        <Input
                          type="number"
                          placeholder="Rate"
                          value={wp.personMonthRate}
                          onChange={(e) => updateWorkPackage(wpIndex, 'personMonthRate', Number(e.target.value))}
                          min="0"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Subtotal: €{(wp.phixPersonMonths * wp.personMonthRate).toLocaleString()}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-semibold">Other Goods & Services</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addWPOtherCost(wpIndex)}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Item
                      </Button>
                    </div>
                    {wp.otherCosts.map((cost, costIndex) => (
                      <div key={costIndex} className="flex gap-2">
                        <Input
                          placeholder="Description"
                          value={cost.description}
                          onChange={(e) => updateWPOtherCost(wpIndex, costIndex, 'description', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Value (€)"
                          value={cost.value}
                          onChange={(e) => updateWPOtherCost(wpIndex, costIndex, 'value', Number(e.target.value))}
                          className="w-32"
                          min="0"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeWPOtherCost(wpIndex, costIndex)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-semibold">Travel & Project Management</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addWPTravelCost(wpIndex)}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Item
                      </Button>
                    </div>
                    {wp.travelCosts.map((cost, costIndex) => (
                      <div key={costIndex} className="flex gap-2">
                        <Input
                          placeholder="Description"
                          value={cost.description}
                          onChange={(e) => updateWPTravelCost(wpIndex, costIndex, 'description', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Value (€)"
                          value={cost.value}
                          onChange={(e) => updateWPTravelCost(wpIndex, costIndex, 'value', Number(e.target.value))}
                          className="w-32"
                          min="0"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeWPTravelCost(wpIndex, costIndex)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <div className="text-right space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Direct Costs: €{workPackages.reduce((total, wp) => {
                      const pmCost = wp.phixPersonMonths * wp.personMonthRate;
                      const otherTotal = wp.otherCosts.reduce((sum, c) => sum + c.value, 0);
                      const travelTotal = wp.travelCosts.reduce((sum, c) => sum + c.value, 0);
                      return total + pmCost + otherTotal + travelTotal;
                    }, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Overhead (25%): €{(workPackages.reduce((total, wp) => {
                      const pmCost = wp.phixPersonMonths * wp.personMonthRate;
                      const otherTotal = wp.otherCosts.reduce((sum, c) => sum + c.value, 0);
                      const travelTotal = wp.travelCosts.reduce((sum, c) => sum + c.value, 0);
                      return total + pmCost + otherTotal + travelTotal;
                    }, 0) * 0.25).toLocaleString()}
                  </p>
                  <p className="text-lg font-bold">
                    Total PHIX Budget: €{calculatePhixBudget().toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {people.length > 0 ? (
                <div className="space-y-3">
                  {people.map((person) => {
                    const isSelected = selectedPeople.find(sp => sp.personId === person.id);
                    return (
                      <div key={person.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3 flex-1">
                          <Checkbox
                            id={`person-${person.id}`}
                            checked={!!isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPeople([...selectedPeople, { personId: person.id, role: 'Team Member' }]);
                              } else {
                                setSelectedPeople(selectedPeople.filter(sp => sp.personId !== person.id));
                              }
                            }}
                          />
                          <label htmlFor={`person-${person.id}`} className="text-sm cursor-pointer flex-1">
                            {person.title} {person.firstName} {person.lastName}
                            {person.position && <span className="text-muted-foreground"> - {person.position}</span>}
                          </label>
                        </div>
                        {isSelected && (
                          <Select
                            value={isSelected.role}
                            onValueChange={(value) => {
                              setSelectedPeople(selectedPeople.map(sp =>
                                sp.personId === person.id ? { ...sp, role: value } : sp
                              ));
                            }}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Team Member">Team Member</SelectItem>
                              <SelectItem value="Leading">Leading</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No people available. Add people in the Reusable Data section first.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>PHIX Role in Project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label className="text-sm">Select all roles that apply to PHIX as participating organization:</Label>
              <div className="space-y-2">
                {['Project management', 'Communication, dissemination and engagement', 'Provision of research and technology infrastructure'].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`phix-role-${role}`}
                      checked={phixOrgRoles.includes(role)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPhixOrgRoles([...phixOrgRoles, role]);
                        } else {
                          setPhixOrgRoles(phixOrgRoles.filter(r => r !== role));
                        }
                      }}
                    />
                    <label htmlFor={`phix-role-${role}`} className="text-sm cursor-pointer">
                      {role}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </form>
      </Form>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="shadow-lg bg-background"
          onClick={() => navigate('/proposals')}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="lg"
          className="shadow-lg"
          onClick={() => {
            const formElement = document.querySelector('form');
            if (formElement) {
              formElement.requestSubmit();
            }
          }}
        >
          <Save className="h-5 w-5 mr-2" />
          {id ? 'Update' : 'Create'} Proposal
        </Button>
      </div>
    </div>
  );
};

export default ProposalForm;
