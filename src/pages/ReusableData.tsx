import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProcessesTab } from '@/components/reusable-data/ProcessesTab';
import { PublicationsTab } from '@/components/reusable-data/PublicationsTab';
import { InfrastructureTab } from '@/components/reusable-data/InfrastructureTab';
import { PeopleTab } from '@/components/reusable-data/PeopleTab';
import { OrganizationsTab } from '@/components/reusable-data/OrganizationsTab';
import { PersonnelInvolvementTab } from '@/components/reusable-data/PersonnelInvolvementTab';
import { ExploitationTab } from '@/components/reusable-data/ExploitationTab';
import { CompanyDescriptionTab } from '@/components/reusable-data/CompanyDescriptionTab';

const ReusableData = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Reusable Data</h1>

      <Tabs defaultValue="processes" className="w-full">
        <TabsList className="w-full flex-wrap h-auto gap-1 p-2">
          <TabsTrigger value="processes" className="flex-1 min-w-[140px]">Processes</TabsTrigger>
          <TabsTrigger value="publications" className="flex-1 min-w-[140px]">Publications</TabsTrigger>
          <TabsTrigger value="infrastructure" className="flex-1 min-w-[140px]">Infrastructure</TabsTrigger>
          <TabsTrigger value="people" className="flex-1 min-w-[140px]">People</TabsTrigger>
          <TabsTrigger value="organizations" className="flex-1 min-w-[140px]">Organizations</TabsTrigger>
          <TabsTrigger value="personnel" className="flex-1 min-w-[140px]">Personnel Involvement</TabsTrigger>
          <TabsTrigger value="exploitation" className="flex-1 min-w-[140px]">Exploitation</TabsTrigger>
          <TabsTrigger value="company" className="flex-1 min-w-[140px]">Company Description</TabsTrigger>
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

        <TabsContent value="company">
          <CompanyDescriptionTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReusableData;
