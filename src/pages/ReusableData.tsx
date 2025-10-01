import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProcessesTab } from '@/components/reusable-data/ProcessesTab';
import { PublicationsTab } from '@/components/reusable-data/PublicationsTab';
import { InfrastructureTab } from '@/components/reusable-data/InfrastructureTab';
import { PeopleTab } from '@/components/reusable-data/PeopleTab';
import { OrganizationsTab } from '@/components/reusable-data/OrganizationsTab';
import { PersonnelInvolvementTab } from '@/components/reusable-data/PersonnelInvolvementTab';
import { ExploitationTab } from '@/components/reusable-data/ExploitationTab';

const ReusableData = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Reusable Data</h1>

      <Tabs defaultValue="processes" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="processes">Processes</TabsTrigger>
          <TabsTrigger value="publications">Publications</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="personnel">Personnel Involvement</TabsTrigger>
          <TabsTrigger value="exploitation">Exploitation</TabsTrigger>
        </TabsList>

        <TabsContent value="processes">
          <ProcessesTab />
        </TabsContent>

        <TabsContent value="publications">
          <PublicationsTab />
        </TabsContent>

        <TabsContent value="infrastructure">
          <InfrastructureTab />
        </TabsContent>

        <TabsContent value="people">
          <PeopleTab />
        </TabsContent>

        <TabsContent value="organizations">
          <OrganizationsTab />
        </TabsContent>

        <TabsContent value="personnel">
          <PersonnelInvolvementTab />
        </TabsContent>

        <TabsContent value="exploitation">
          <ExploitationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReusableData;
