import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { storage, Project } from '@/lib/storage';
import { Plus, Search } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const data = storage.get<Project>('projects');
    setProjects(data);
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.call.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Granted Projects</h1>
        <div className="flex gap-2">
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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredProjects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{project.name}</CardTitle>
                <Badge variant={project.status === 'Ongoing' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{project.call}</p>
              <p className="text-sm mb-2">{project.shortDescription}</p>
              {project.website && (
                <a
                  href={project.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Visit Website
                </a>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredProjects.length === 0 && (
          <Card className="md:col-span-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No granted projects yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Projects;
