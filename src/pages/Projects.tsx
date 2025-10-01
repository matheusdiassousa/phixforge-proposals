import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { storage, Proposal } from '@/lib/storage';
import { Search, Calendar, Euro, Waves, Server, TrendingUp, Clock, FileText, CheckCircle } from 'lucide-react';

const Projects = () => {
  const [grantedProjects, setGrantedProjects] = useState<Proposal[]>([]);
  const [totalProposals, setTotalProposals] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadGrantedProjects();
  }, []);

  const loadGrantedProjects = () => {
    const proposals = storage.get<Proposal>('proposals');
    setTotalProposals(proposals.length);
    const granted = proposals.filter(p => p.isGranted);
    // Sort by PHIX budget descending
    granted.sort((a, b) => (b.phixBudget || 0) - (a.phixBudget || 0));
    setGrantedProjects(granted);
  };

  const calculateTimeRemaining = (startDate: string, durationMonths: number) => {
    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + durationMonths);
    
    const now = new Date();
    const totalMs = endDate.getTime() - start.getTime();
    const elapsedMs = now.getTime() - start.getTime();
    const remainingMs = endDate.getTime() - now.getTime();
    
    const progress = Math.min(Math.max((elapsedMs / totalMs) * 100, 0), 100);
    const monthsRemaining = Math.ceil(remainingMs / (1000 * 60 * 60 * 24 * 30));
    
    return { progress, monthsRemaining, endDate, startDate: start };
  };

  const filteredProjects = grantedProjects.filter(
    (p) =>
      p.acronym?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.call.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.programme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Granted Projects Dashboard</h1>
          <p className="text-muted-foreground">Track running projects, budgets, and timelines</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Proposals</p>
                <p className="text-2xl font-bold">{totalProposals}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Granted Projects</p>
                <p className="text-2xl font-bold">{grantedProjects.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalProposals > 0 ? Math.round((grantedProjects.length / totalProposals) * 100) : 0}% success rate
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total PHIX Budget</p>
                <p className="text-2xl font-bold">€{grantedProjects.reduce((acc, p) => acc + (p.phixBudget || 0), 0).toLocaleString()}</p>
              </div>
              <Euro className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">
                  {grantedProjects.filter(p => {
                    if (!p.startDate || !p.durationMonths) return false;
                    const { monthsRemaining } = calculateTimeRemaining(p.startDate, p.durationMonths);
                    return monthsRemaining > 0;
                  }).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Duration</p>
                <p className="text-2xl font-bold">
                  {Math.round(grantedProjects.reduce((acc, p) => acc + (p.durationMonths || 0), 0) / grantedProjects.length || 0)}m
                </p>
              </div>
              <Calendar className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.map((project) => {
          const timeline = project.startDate && project.durationMonths
            ? calculateTimeRemaining(project.startDate, project.durationMonths)
            : null;

          return (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-2xl">{project.acronym}</CardTitle>
                      <Badge variant="default" className="bg-primary">Granted</Badge>
                      {timeline && timeline.monthsRemaining > 0 && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
                          Active
                        </Badge>
                      )}
                      {timeline && timeline.monthsRemaining <= 0 && (
                        <Badge variant="outline" className="bg-gray-500/10 text-gray-700 border-gray-300">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {project.programme} • {project.call}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <div>
                      <p className="text-3xl font-bold text-primary">
                        €{(project.phixBudget || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">PHIX Budget</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total: €{project.totalBudget.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Timeline Progress */}
                  {timeline && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Project Timeline</span>
                        <span className="font-medium">
                          {timeline.monthsRemaining > 0 
                            ? `${timeline.monthsRemaining} months remaining`
                            : 'Completed'
                          }
                        </span>
                      </div>
                      <Progress value={timeline.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{timeline.startDate.toLocaleDateString()}</span>
                        <span>{timeline.endDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Project Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="text-sm font-medium">{project.durationMonths || 'N/A'} months</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Waves className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Wavelengths</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {project.wavelengths && project.wavelengths.length > 0 ? (
                            project.wavelengths.slice(0, 2).map((wl, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs px-1.5 py-0">
                                {wl}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm">N/A</span>
                          )}
                          {project.wavelengths && project.wavelengths.length > 2 && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              +{project.wavelengths.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Server className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Platform</p>
                        <p className="text-sm font-medium">{project.picPlatform || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Funding</p>
                        <p className="text-sm font-medium">{project.fundedPercent}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Key Value */}
                  {project.phixRole && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">PHIX Key Value</p>
                      <p className="text-sm">{project.phixRole}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredProjects.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-2">No granted projects yet</p>
              <p className="text-sm text-muted-foreground">Mark proposals as granted to see them here</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Projects;
