import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { Proposal, Process, Publication, Infrastructure, Organization, Person } from './storage';
import { storage } from './storage';

export const exportProposalToDocx = async (proposal: Proposal) => {
  // Load reusable data
  const processes = storage.get<Process>('processes');
  const publications = storage.get<Publication>('publications');
  const infrastructures = storage.get<Infrastructure>('infrastructure');
  const organizations = storage.get<Organization>('organizations');
  const people = storage.get<Person>('people');

  // Filter selected reusable data
  const selectedProcesses = processes.filter(p => proposal.phixProcesses?.includes(p.id));
  const selectedPublications = publications.filter(p => proposal.publications?.includes(p.id));
  const selectedInfrastructures = infrastructures.filter(i => proposal.infrastructure?.includes(i.id));
  const selectedPeopleData = proposal.selectedPeople?.map(sp => {
    const person = people.find(p => p.id === sp.personId);
    return person ? { ...person, projectRole: sp.role } : null;
  }).filter(Boolean) || [];

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Title
        new Paragraph({
          text: `${proposal.acronym} - Proposal Report`,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),

        // General Information
        new Paragraph({
          text: 'General Information',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Acronym: ', bold: true }),
            new TextRun(proposal.acronym)
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Programme: ', bold: true }),
            new TextRun(proposal.programme)
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Call: ', bold: true }),
            new TextRun(proposal.call)
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Type: ', bold: true }),
            new TextRun(proposal.type)
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Deadline: ', bold: true }),
            new TextRun(new Date(proposal.deadline).toLocaleDateString())
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Status: ', bold: true }),
            new TextRun(proposal.isGranted ? 'Granted' : 'Pending')
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Funded Percentage: ', bold: true }),
            new TextRun(`${proposal.fundedPercent}%`)
          ],
          spacing: { after: 100 }
        }),

        // Grant Information (if granted)
        ...(proposal.isGranted && proposal.durationMonths && proposal.startDate ? [
          new Paragraph({
            text: 'Grant Details',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Duration: ', bold: true }),
              new TextRun(`${proposal.durationMonths} months`)
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Start Date: ', bold: true }),
              new TextRun(new Date(proposal.startDate).toLocaleDateString())
            ],
            spacing: { after: 100 }
          })
        ] : []),

        // Budget Section
        new Paragraph({
          text: 'Budget Information',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Total Project Budget: ', bold: true }),
            new TextRun(`€${proposal.totalBudget.toLocaleString()}`)
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Total PHIX Budget: ', bold: true }),
            new TextRun(`€${(proposal.phixBudget || 0).toLocaleString()}`)
          ],
          spacing: { after: 200 }
        }),

        // Work Packages and Budget Breakdown
        ...(proposal.workPackages && proposal.workPackages.length > 0 ? [
          new Paragraph({
            text: 'Work Packages & PHIX Budget Breakdown',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 }
          }),
          ...proposal.workPackages.flatMap(wp => {
            const pmCost = wp.phixPersonMonths * wp.personMonthRate;
            const otherCostsTotal = wp.otherCosts?.reduce((sum, c) => sum + c.value, 0) || 0;
            const travelCostsTotal = wp.travelCosts?.reduce((sum, c) => sum + c.value, 0) || 0;
            const wpTotal = pmCost + otherCostsTotal + travelCostsTotal;

            return [
              new Paragraph({
                text: `Work Package ${wp.number}`,
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 200, after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Lead Partner: ', bold: true }),
                  new TextRun(wp.leadPartner || 'N/A')
                ],
                spacing: { after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Description: ', bold: true }),
                  new TextRun(wp.description || 'N/A')
                ],
                spacing: { after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'PHIX Budget for this WP:', bold: true })
                ],
                spacing: { before: 100, after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: '  • Person-Months: ', bold: true }),
                  new TextRun(`${wp.phixPersonMonths} PM × €${wp.personMonthRate.toLocaleString()} = €${pmCost.toLocaleString()}`)
                ],
                spacing: { after: 50 }
              }),
              ...(wp.otherCosts && wp.otherCosts.length > 0 ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: '  • Other Goods & Services:', bold: true })
                  ],
                  spacing: { before: 50, after: 50 }
                }),
                ...wp.otherCosts.map(cost => 
                  new Paragraph({
                    children: [
                      new TextRun({ text: `    - ${cost.description}: ` }),
                      new TextRun(`€${cost.value.toLocaleString()}`)
                    ],
                    spacing: { after: 50 }
                  })
                )
              ] : []),
              ...(wp.travelCosts && wp.travelCosts.length > 0 ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: '  • Travel & Project Management:', bold: true })
                  ],
                  spacing: { before: 50, after: 50 }
                }),
                ...wp.travelCosts.map(cost => 
                  new Paragraph({
                    children: [
                      new TextRun({ text: `    - ${cost.description}: ` }),
                      new TextRun(`€${cost.value.toLocaleString()}`)
                    ],
                    spacing: { after: 50 }
                  })
                )
              ] : []),
              new Paragraph({
                children: [
                  new TextRun({ text: '  Subtotal WP: ', bold: true }),
                  new TextRun(`€${wpTotal.toLocaleString()}`)
                ],
                spacing: { before: 100, after: 100 }
              })
            ];
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Total Direct Costs: ', bold: true }),
              new TextRun(`€${proposal.workPackages.reduce((total, wp) => {
                const pmCost = wp.phixPersonMonths * wp.personMonthRate;
                const otherTotal = wp.otherCosts?.reduce((sum, c) => sum + c.value, 0) || 0;
                const travelTotal = wp.travelCosts?.reduce((sum, c) => sum + c.value, 0) || 0;
                return total + pmCost + otherTotal + travelTotal;
              }, 0).toLocaleString()}`)
            ],
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Overhead (25%): ', bold: true }),
              new TextRun(`€${(proposal.workPackages.reduce((total, wp) => {
                const pmCost = wp.phixPersonMonths * wp.personMonthRate;
                const otherTotal = wp.otherCosts?.reduce((sum, c) => sum + c.value, 0) || 0;
                const travelTotal = wp.travelCosts?.reduce((sum, c) => sum + c.value, 0) || 0;
                return total + pmCost + otherTotal + travelTotal;
              }, 0) * 0.25).toLocaleString()}`)
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'TOTAL PHIX BUDGET: ', bold: true, size: 28 }),
              new TextRun({ text: `€${(proposal.phixBudget || 0).toLocaleString()}`, size: 28, bold: true })
            ],
            spacing: { after: 200 }
          })
        ] : []),

        // Technical Details
        new Paragraph({
          text: 'Technical Details',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'PIC Platform: ', bold: true }),
            new TextRun(proposal.picPlatform || 'N/A')
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Wavelengths: ', bold: true }),
            new TextRun(proposal.wavelengths?.join(', ') || 'N/A')
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'PHIX Role: ', bold: true }),
            new TextRun(proposal.phixRole || 'N/A')
          ],
          spacing: { after: 100 }
        }),

        // Partners
        ...(proposal.partners && proposal.partners.length > 0 ? [
          new Paragraph({
            text: 'Partners',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 }
          }),
          ...proposal.partners.map((partner, idx) => 
            new Paragraph({
              children: [
                new TextRun({ text: `${idx + 1}. `, bold: true }),
                new TextRun(`${partner.name} - ${partner.country}`)
              ],
              spacing: { after: 100 }
            })
          )
        ] : []),

        // Team Members
        ...(selectedPeopleData.length > 0 ? [
          new Paragraph({
            text: 'Team Members',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 }
          }),
          ...selectedPeopleData.map((person: any) => 
            new Paragraph({
              children: [
                new TextRun({ text: `${person.title} ${person.firstName} ${person.lastName}`, bold: true }),
                new TextRun({ text: ` - ${person.projectRole}` }),
                ...(person.position ? [new TextRun({ text: ` (${person.position})` })] : []),
                ...(person.email ? [new TextRun({ text: ` - ${person.email}` })] : []),
                ...(person.careerStage ? [new TextRun({ text: ` - ${person.careerStage}` })] : [])
              ],
              spacing: { after: 100 }
            })
          )
        ] : []),

        // PHIX Organization Roles
        ...(proposal.phixOrgRoles && proposal.phixOrgRoles.length > 0 ? [
          new Paragraph({
            text: 'PHIX Role in Project (as participating organization)',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 }
          }),
          ...proposal.phixOrgRoles.map(role => 
            new Paragraph({
              children: [
                new TextRun({ text: '• ' }),
                new TextRun(role)
              ],
              spacing: { after: 100 }
            })
          )
        ] : []),

        // PHIX Processes
        ...(selectedProcesses.length > 0 ? [
          new Paragraph({
            text: 'PHIX Processes',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 }
          }),
          ...selectedProcesses.flatMap(process => [
            new Paragraph({
              text: process.name,
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 100, after: 50 }
            }),
            new Paragraph({
              text: process.description,
              spacing: { after: 100 }
            })
          ])
        ] : []),

        // Publications
        ...(selectedPublications.length > 0 ? [
          new Paragraph({
            text: 'Publications',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 }
          }),
          ...selectedPublications.flatMap(pub => [
            new Paragraph({
              text: pub.title,
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 100, after: 50 }
            }),
            new Paragraph({
              text: pub.metadata,
              spacing: { after: 100 }
            })
          ])
        ] : []),

        // Infrastructure
        ...(selectedInfrastructures.length > 0 ? [
          new Paragraph({
            text: 'Infrastructure',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 }
          }),
          ...selectedInfrastructures.flatMap(infra => [
            new Paragraph({
              text: infra.name,
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 100, after: 50 }
            }),
            new Paragraph({
              text: infra.description,
              spacing: { after: 100 }
            })
          ])
        ] : [])
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${proposal.acronym}_Proposal_Report.docx`);
};
