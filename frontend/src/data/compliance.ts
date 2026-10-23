/**
 * PROTOTYPE / DEMONSTRATION MODE ONLY
 *
 * This dataset contains self-assessment demonstration profiles for interface evaluation.
 * - It is not live BIS evaluation data.
 * - It is not fetched from the live backend.
 * - It is for demonstration and self-assessment only.
 */

import { ComplianceGapItem, ComplianceSummary } from '../types';

export interface ProductComplianceProfile {
  id?: string;
  productId: string;
  productName: string;
  standardId: string;
  standardNumber: string;
  summary: ComplianceSummary;
  items: ComplianceGapItem[];
}

export const MOCK_COMPLIANCE_PROFILES: ProductComplianceProfile[] = [
  {
    productId: 'flask-ss',
    productName: 'Stainless Steel Vacuum Flask (1000ml)',
    standardId: 'is-17526',
    standardNumber: 'IS 17526 : 2021',
    summary: {
      overallStatus: 'PARTIAL_COMPLIANCE',
      requirementsMet: 3,
      requirementsPending: 2,
      missingInformation: [
        'Third-party NABL test report for silicone gasket overall migration',
        'Laser marking calibration record for CM/L artwork embossing',
      ],
    },
    items: [
      {
        id: 'cg-101',
        clause: 'IS 17526 Cl 4.1',
        parameter: 'Food Contact Inner Liner Stainless Steel Grade',
        bisRequirement: 'Food contact metal parts shall be manufactured from austenitic SS 304 grade (04Cr18Ni10 per IS 6911) with certified mill ladle analysis.',
        evidenceFound: 'Factory raw material batch test certificate indicates Grade 304 (Cr: 18.2%, Ni: 8.4%). Compliant.',
        gapStatus: 'COMPLIANT',
        remedialAction: 'Maintain batch mill certificate in docket. No corrective action needed.',
        sourceStandard: 'IS 17526 : 2021',
        priority: 'LOW',
      },
      {
        id: 'cg-102',
        clause: 'IS 17526 Cl 5.2',
        parameter: 'Thermal Insulation 6-Hour Heat Retention',
        bisRequirement: 'Water filled at (95 ± 1)°C must retain >= 60°C after 6 hours at (27 ± 2)°C ambient temperature.',
        evidenceFound: 'Internal factory test chamber logged 64.2°C at 6 hours across 5 random production samples.',
        gapStatus: 'COMPLIANT',
        remedialAction: 'Calibrate chamber thermocouple quarterly. Retain temperature datalogger graphs for BIS audit.',
        sourceStandard: 'IS 17526 : 2021',
        priority: 'LOW',
      },
      {
        id: 'cg-103',
        clause: 'IS 17526 Cl 5.5',
        parameter: 'Drop Impact Resistance',
        bisRequirement: 'Filled flask dropped 3 times from 1.2 metres height onto concrete floor without leakage or loss of insulation vacuum.',
        evidenceFound: 'Physical test passed on outer body. Slight cap scuffing observed but seal remained completely hermetic.',
        gapStatus: 'COMPLIANT',
        remedialAction: 'Ensure drop test rig incorporates certified plumb line and release trigger mechanism.',
        sourceStandard: 'IS 17526 : 2021',
        priority: 'LOW',
      },
      {
        id: 'cg-104',
        clause: 'IS 17526 Cl 6.3 / IS 9845',
        parameter: 'Polymeric Stopper Overall Migration',
        bisRequirement: 'Overall migration of plastic cap and silicone seal in aqueous and fatty food simulants must not exceed 10 mg/dm².',
        evidenceFound: 'Pending laboratory test report: Raw material supplier provided generic FDA statement, but specific IS 9845 protocol report is missing.',
        gapStatus: 'GAP_FOUND',
        remedialAction: 'Submit cap and silicone gasket samples immediately to a BIS recognized laboratory for IS 9845 overall migration testing.',
        sourceStandard: 'IS 17526 : 2021',
        priority: 'HIGH',
      },
      {
        id: 'cg-105',
        clause: 'IS 17526 Cl 8.1',
        parameter: 'Indelible Laser Marking & ISI Layout',
        bisRequirement: 'Container base must carry manufacturer brand name, rated capacity, SS grade, and official ISI logo with licensee CM/L code.',
        evidenceFound: 'Artwork mock contains brand and capacity, but CM/L number placeholder is absent in production tooling mould.',
        gapStatus: 'PARTIAL',
        remedialAction: 'Update laser engraving program to include licensee CM/L-XXXXXXXXXX string below the ISI triangle mark.',
        sourceStandard: 'IS 17526 : 2021',
        priority: 'MEDIUM',
      },
    ],
  },
  {
    id: 'water-pet',
    productId: 'water-pet',
    productName: 'Packaged Drinking Water in PET Bottles (1000ml)',
    standardId: 'is-14543',
    standardNumber: 'IS 14543 : 2024',
    summary: {
      overallStatus: 'GAP_FOUND',
      requirementsMet: 2,
      requirementsPending: 3,
      missingInformation: [
        'Central Ground Water Authority (CGWA) renewal NOC',
        'Pesticide multi-residue test report by GC-MS/MS & LC-MS/MS',
        'In-house laminar airflow clean bench validation record',
      ],
    },
    items: [
      {
        id: 'cg-201',
        clause: 'IS 14543 Cl 3.2',
        parameter: 'Water Disinfection & Treatment Protocol',
        bisRequirement: 'Multi-barrier treatment with mandatory ozonation / UV disinfection and reverse osmosis filtration.',
        evidenceFound: 'Treatment train verified with Sand Filter, Carbon Bed, 2-Stage RO, and Ozone generator (0.2–0.4 ppm residual).',
        gapStatus: 'COMPLIANT',
        remedialAction: 'Maintain daily ozone concentration logbook at packaging point.',
        sourceStandard: 'IS 14543 : 2024',
        priority: 'LOW',
      },
      {
        id: 'cg-202',
        clause: 'IS 14543 Cl 4.1',
        parameter: 'Microbiological Absence Criteria',
        bisRequirement: 'E. coli, Coliform bacteria, Faecal Streptococci, and Pseudomonas aeruginosa absent in 250 ml of sample.',
        evidenceFound: 'Internal daily QA tests show zero colony forming units across all tested bottles.',
        gapStatus: 'COMPLIANT',
        remedialAction: 'Ensure positive and negative control media records are logged daily by microbiologist.',
        sourceStandard: 'IS 14543 : 2024',
        priority: 'LOW',
      },
      {
        id: 'cg-203',
        clause: 'IS 14543 Cl 4.3',
        parameter: 'Pesticide Residue Limits (Individual & Total)',
        bisRequirement: 'Individual pesticide residues <= 0.0001 mg/l; total pesticide residues <= 0.0005 mg/l tested per validated methods.',
        evidenceFound: 'Annual independent pesticide test report expired 3 weeks ago. New batch test report pending at recognized laboratory.',
        gapStatus: 'GAP_FOUND',
        remedialAction: 'Expedite drawing of raw water and treated water samples for pesticide screening at recognized NABL lab.',
        sourceStandard: 'IS 14543 : 2024',
        priority: 'HIGH',
      },
      {
        id: 'cg-204',
        clause: 'IS 14543 Cl 5.1 / IS 15410',
        parameter: 'PET Packaging Container Compliance',
        bisRequirement: 'Containers manufactured from virgin food-grade PET conforming to IS 15410 with overall migration under limits.',
        evidenceFound: 'Manufacturer certificate available for preforms, but antimony extraction test report is older than 6 months.',
        gapStatus: 'PARTIAL',
        remedialAction: 'Obtain updated certificate of analysis from bottle preform supplier for antimony and overall migration.',
        sourceStandard: 'IS 14543 : 2024',
        priority: 'MEDIUM',
      },
      {
        id: 'cg-205',
        clause: 'Statutory Requirement',
        parameter: 'Ground Water Abstraction NOC',
        bisRequirement: 'Valid NOC from Central Ground Water Authority (CGWA) or State Ground Water Authority for commercial extraction.',
        evidenceFound: 'Previous NOC expired on 30 June 2026; renewal application receipt available but final NOC not yet issued.',
        gapStatus: 'GAP_FOUND',
        remedialAction: 'Follow up with CGWA regional office for expedited issuance of formal renewal order before BIS factory audit.',
        sourceStandard: 'IS 14543 : 2024',
        priority: 'HIGH',
      },
    ],
  },
  {
    id: 'toy-wooden',
    productId: 'toy-wooden',
    productName: 'Educational Wooden Building Blocks for Toddlers',
    standardId: 'is-9873-1',
    standardNumber: 'IS 9873 (Part 1) : 2019',
    summary: {
      overallStatus: 'AUDIT_READY',
      requirementsMet: 4,
      requirementsPending: 1,
      missingInformation: [
        'Updated packaging artwork incorporating new mandatory DPIIT consumer warning icon',
      ],
    },
    items: [
      {
        id: 'cg-301',
        clause: 'IS 9873 (Part 1) Cl 4.4',
        parameter: 'Small Parts Choking Hazards (Under 3 Years)',
        bisRequirement: 'Blocks for children under 36 months must not fit completely into the small parts cylinder in any orientation.',
        evidenceFound: 'Minimum dimension of smallest block is 45 mm, which does not enter the 31.7 mm truncated test cylinder.',
        gapStatus: 'COMPLIANT',
        remedialAction: 'Keep calibration certificate for small parts gauge in audit folder.',
        sourceStandard: 'IS 9873 (Part 1) : 2019',
        priority: 'LOW',
      },
      {
        id: 'cg-302',
        clause: 'IS 9873 (Part 1) Cl 4.7',
        parameter: 'Sharp Edges and Chamfering',
        bisRequirement: 'Accessible wooden edges must be rounded and sanded smooth to prevent splinter or puncture lacerations.',
        evidenceFound: 'All edges finished with minimum 2.5 mm radius chamfer; sharp edge tester verifies zero sharp points.',
        gapStatus: 'COMPLIANT',
        remedialAction: 'Maintain daily sanding station QC checklist.',
        sourceStandard: 'IS 9873 (Part 1) : 2019',
        priority: 'LOW',
      },
      {
        id: 'cg-303',
        clause: 'IS 9873 (Part 3) Cl 4.1',
        parameter: 'Migration of Heavy Metals (Non-Toxic Paint)',
        bisRequirement: 'Lead migration <= 90 mg/kg, cadmium <= 75 mg/kg, arsenic <= 25 mg/kg in non-toxic water-based toy paint.',
        evidenceFound: 'Independent test report from Intertek confirms lead < 5 mg/kg, cadmium < 2 mg/kg, well below threshold.',
        gapStatus: 'COMPLIANT',
        remedialAction: 'Ensure every new incoming batch of organic paint is matched to the master test certificate.',
        sourceStandard: 'IS 9873 (Part 1) : 2019',
        priority: 'LOW',
      },
      {
        id: 'cg-304',
        clause: 'IS 9873 (Part 1) Cl 5.24',
        parameter: 'Drop & Torque Test Evaluation',
        bisRequirement: 'Toy dropped 5 times from 138 cm onto concrete without splintering or detaching hazardous fragments.',
        evidenceFound: '5 units tested with zero fracture or detachment observed.',
        gapStatus: 'COMPLIANT',
        remedialAction: 'Document drop test photographic logs for auditor.',
        sourceStandard: 'IS 9873 (Part 1) : 2019',
        priority: 'LOW',
      },
      {
        id: 'cg-305',
        clause: 'IS 9873 (Part 1) Cl 7',
        parameter: 'Age Grading and Warning Labels',
        bisRequirement: 'Front box must prominently display "Not suitable for children under 3 years" or specific age grading mark.',
        evidenceFound: 'Artwork indicates "3+ Years" in text, but lacks the graphical symbol with red circle and strike-through.',
        gapStatus: 'PARTIAL',
        remedialAction: 'Add the official graphical age warning symbol per Clause 7.2 to the master packaging print plates.',
        sourceStandard: 'IS 9873 (Part 1) : 2019',
        priority: 'MEDIUM',
      },
    ],
  },
];
