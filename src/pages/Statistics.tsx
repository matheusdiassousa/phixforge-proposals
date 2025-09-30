import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storage, Proposal, Project } from '@/lib/storage';
import { FileText, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';

const Statistics = () => {
  const [stats, setStats] = useState({
    totalProposals: 0,
    grantedProposals: 0,
    ongoingProjects: 0,
    completedProjects: 0,
    totalBudget: 0,
    coFunding: 0,
    successRate: 0,
  });

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    const proposals = storage.get<Proposal>('proposals');
    const projects = storage.get<Project>('projects');

    const granted = proposals.filter((p) => p.isGranted);
    const totalBudget = granted.reduce((sum, p) => sum + (p.phixBudget || 0), 0);
    
    const coFunding = granted.reduce((sum, p) => {
      if (p.fundedPercent < 100) {
        const directCosts = p.totalBudget / 1.25;
        const coFund = directCosts * ((100 - p.fundedPercent) / 100);
        return sum + coFund;
      }
      return sum;
    }, 0);

    setStats({
      totalProposals: proposals.length,
      grantedProposals: granted.length,
      ongoingProjects: projects.filter((p) => p.status === 'Ongoing').length,
      completedProjects: projects.filter((p) => p.status === 'Completed').length,
      totalBudget,
      coFunding,
      successRate: proposals.length > 0 ? (granted.length / proposals.length) * 100 : 0,
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Statistics Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
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
                  €
                  {stats.grantedProposals > 0
                    ? (stats.totalBudget / stats.grantedProposals / 1000).toFixed(0)
                    : 0}
                  K
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
