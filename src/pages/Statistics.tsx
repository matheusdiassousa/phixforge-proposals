import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { storage, Proposal } from '@/lib/storage';
import { FileText, CheckCircle, TrendingUp, DollarSign, Globe, Users, Zap, Target } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const Statistics = () => {
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [programmeFilter, setProgrammeFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    totalProposals: 0,
    grantedProposals: 0,
    ongoingProjects: 0,
    completedProjects: 0,
    totalBudget: 0,
    coFunding: 0,
    successRate: 0,
    topProcesses: [] as { name: string; count: number }[],
    wavelengths: [] as { name: string; count: number }[],
    applications: [] as { name: string; count: number }[],
    topPartners: [] as { name: string; count: number }[],
    partnerCountries: [] as { name: string; count: number }[],
    programmes: [] as { name: string; total: number; granted: number; rate: number }[],
    temporal: [] as { year: number; submitted: number; granted: number }[],
  });

  useEffect(() => {
    calculateStats();
  }, [yearFilter, programmeFilter]);

  const calculateStats = () => {
    let proposals = storage.get<Proposal>('proposals');

    // Apply filters
    if (yearFilter !== 'all') {
      proposals = proposals.filter(p => {
        if (p.deadline) {
          const year = new Date(p.deadline).getFullYear();
          return year.toString() === yearFilter;
        }
        return false;
      });
    }

    if (programmeFilter !== 'all') {
      proposals = proposals.filter(p => p.programme === programmeFilter);
    }

    const granted = proposals.filter((p) => p.isGranted);
    const totalBudget = granted.reduce((sum, p) => sum + (p.phixBudget || 0), 0);
    
    const coFunding = granted.reduce((sum, p) => {
      if (p.fundedPercent < 100) {
        const phixCoFund = (p.phixBudget || 0) * ((100 - p.fundedPercent) / 100);
        return sum + phixCoFund;
      }
      return sum;
    }, 0);
    
    const today = new Date();
    let ongoingCount = 0;
    let completedCount = 0;

    granted.forEach((p) => {
      if (p.isCompleted) {
        completedCount++;
      } 
      else if (p.startDate && p.durationMonths) {
        const startDate = new Date(p.startDate);
        const totalMonths = p.durationMonths + (p.extensionMonths || 0);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + totalMonths);

        if (today > startDate && today <= endDate) {
          ongoingCount++;
        }
      }
    });

    // Calculate top processes
    const processCount: { [key: string]: number } = {};
    granted.forEach(p => {
      p.phixProcesses?.forEach(proc => {
        processCount[proc] = (processCount[proc] || 0) + 1;
      });
    });
    const topProcesses = Object.entries(processCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate wavelengths
    const wavelengthCount: { [key: string]: number } = {};
    granted.forEach(p => {
      p.wavelengths?.forEach(wl => {
        wavelengthCount[wl] = (wavelengthCount[wl] || 0) + 1;
      });
    });
    const wavelengths = Object.entries(wavelengthCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate applications
    const appCount: { [key: string]: number } = {};
    granted.forEach(p => {
      if (p.projectApplication) {
        appCount[p.projectApplication] = (appCount[p.projectApplication] || 0) + 1;
      }
    });
    const applications = Object.entries(appCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate top partners
    const partnerCount: { [key: string]: number } = {};
    granted.forEach(p => {
      p.partners?.forEach(partner => {
        if (partner.name) {
          partnerCount[partner.name] = (partnerCount[partner.name] || 0) + 1;
        }
      });
    });
    const topPartners = Object.entries(partnerCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate partner countries
    const countryCount: { [key: string]: number } = {};
    granted.forEach(p => {
      p.partners?.forEach(partner => {
        if (partner.country) {
          countryCount[partner.country] = (countryCount[partner.country] || 0) + 1;
        }
      });
    });
    const partnerCountries = Object.entries(countryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate programmes success rate
    const progCount: { [key: string]: { total: number; granted: number } } = {};
    const allProposals = storage.get<Proposal>('proposals');
    allProposals.forEach(p => {
      if (p.programme) {
        if (!progCount[p.programme]) {
          progCount[p.programme] = { total: 0, granted: 0 };
        }
        progCount[p.programme].total++;
        if (p.isGranted) {
          progCount[p.programme].granted++;
        }
      }
    });
    const programmes = Object.entries(progCount)
      .map(([name, data]) => ({
        name,
        total: data.total,
        granted: data.granted,
        rate: (data.granted / data.total) * 100,
      }))
      .sort((a, b) => b.granted - a.granted);

    // Calculate temporal distribution
    const yearCount: { [key: number]: { submitted: number; granted: number } } = {};
    allProposals.forEach(p => {
      if (p.deadline) {
        const year = new Date(p.deadline).getFullYear();
        if (!yearCount[year]) {
          yearCount[year] = { submitted: 0, granted: 0 };
        }
        yearCount[year].submitted++;
        if (p.isGranted) {
          yearCount[year].granted++;
        }
      }
    });
    const temporal = Object.entries(yearCount)
      .map(([year, data]) => ({
        year: parseInt(year),
        submitted: data.submitted,
        granted: data.granted,
      }))
      .sort((a, b) => a.year - b.year);

    setStats({
      totalProposals: proposals.length,
      grantedProposals: granted.length,
      ongoingProjects: ongoingCount,
      completedProjects: completedCount,
      totalBudget,
      coFunding,
      successRate: proposals.length > 0 ? (granted.length / proposals.length) * 100 : 0,
      topProcesses,
      wavelengths,
      applications,
      topPartners,
      partnerCountries,
      programmes,
      temporal,
    });
  };

  // Get available years and programmes for filters
  const allProposals = storage.get<Proposal>('proposals');
  const availableYears = Array.from(
    new Set(
      allProposals
        .map(p => p.deadline ? new Date(p.deadline).getFullYear() : null)
        .filter(y => y !== null)
    )
  ).sort((a, b) => b! - a!);

  const availableProgrammes = Array.from(
    new Set(allProposals.map(p => p.programme).filter(p => p))
  ).sort();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Statistics Dashboard</h1>
        <div className="flex gap-3">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {availableYears.map(year => (
                <SelectItem key={year} value={year!.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={programmeFilter} onValueChange={setProgrammeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Programme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programmes</SelectItem>
              {availableProgrammes.map(prog => (
                <SelectItem key={prog} value={prog!}>{prog}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProposals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Granted Proposals</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.grantedProposals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.successRate.toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total PHIX Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{(stats.totalBudget / 1000000).toFixed(2)}M
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PHIX Co-Funding</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{(stats.coFunding / 1000).toFixed(0)}K
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tech">Processes & Technologies</TabsTrigger>
          <TabsTrigger value="partners">Partners & Geography</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Ongoing Projects</span>
                    <span className="font-bold">{stats.ongoingProjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed Projects</span>
                    <span className="font-bold">{stats.completedProjects}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <span className="font-bold">{stats.successRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average PHIX Budget</span>
                    <span className="font-bold">
                      €{stats.grantedProposals > 0 ? (stats.totalBudget / stats.grantedProposals / 1000).toFixed(0) : 0}K
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Programme Success Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.programmes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="granted" fill="hsl(var(--primary))" name="Granted" />
                  <Bar dataKey="total" fill="hsl(var(--muted))" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tech" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top 5 PHIX Processes</CardTitle>
                <Zap className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.topProcesses} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Wavelengths Distribution</CardTitle>
                <Target className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.wavelengths}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="count"
                    >
                      {stats.wavelengths.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Applications by Area</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.applications}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top 10 Partners</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={stats.topPartners} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--chart-1))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Partner Countries</CardTitle>
                <Globe className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={stats.partnerCountries} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proposals Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats.temporal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="submitted" fill="hsl(var(--muted))" name="Submitted" />
                  <Bar dataKey="granted" fill="hsl(var(--primary))" name="Granted" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Statistics;
