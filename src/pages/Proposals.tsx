import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { storage, Proposal } from '@/lib/storage';
import { Plus, Search, FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Proposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = () => {
    const data = storage.get<Proposal>('proposals');
    setProposals(data);
  };

  const filteredProposals = proposals.filter(
    (p) =>
      p.call.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.programme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Proposals</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search proposals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button onClick={() => navigate('/proposals/new')}>
            <Plus className="h-4 w-4" />
            New Proposal
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredProposals.map((proposal) => (
          <Card
            key={proposal.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/proposals/${proposal.id}`)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{proposal.call}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {proposal.programme} - {proposal.type}
                  </p>
                </div>
                <div className="flex gap-2">
                  {proposal.isGranted && <Badge variant="default">Granted</Badge>}
                  <Badge variant="outline">
                    {proposal.fundedPercent}% Funded
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Deadline: {new Date(proposal.deadline).toLocaleDateString()}
                </span>
                <span className="font-semibold">
                  €{proposal.totalBudget.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredProposals.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No proposals found</p>
              <Button onClick={() => navigate('/proposals/new')}>
                <Plus className="h-4 w-4" />
                Create First Proposal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Proposals;
