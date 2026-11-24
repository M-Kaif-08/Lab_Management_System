import { db } from '../client.js';
import { specimenTypes, tests, testParameters, referenceRanges, panels, panelItems } from '../schema/index.js';
import { eq } from 'drizzle-orm';

export async function seedDemoCatalog() {
  console.log('Seeding demo specimen types and test catalog...');

  // 1. Specimen Types
  const specimens = [
    { code: 'EDTA', name: 'EDTA Whole Blood' },
    { code: 'SERUM', name: 'Serum (SST/Yellow Top)' },
    { code: 'PLASMA', name: 'Sodium Citrate Plasma (Blue Top)' },
    { code: 'URINE', name: 'Random Midstream Urine' }
  ];

  for (const s of specimens) {
    await db.insert(specimenTypes).values(s).onConflictDoNothing();
  }

  // 2. Complete Blood Count (CBC)
  const existingCbc = await db.select().from(tests).where(eq(tests.code, 'CBC')).limit(1);
  let cbc = existingCbc[0];
  if (!cbc) {
    const [newCbc] = await db.insert(tests).values({
      code: 'CBC',
      name: 'Complete Blood Count (CBC)',
      department: 'Hematology',
      sampleType: 'EDTA Whole Blood',
      price: '1200.00',
      turnaroundHours: 12
    }).returning();
    cbc = newCbc;

    if (cbc) {
      const [hb] = await db.insert(testParameters).values({
        testId: cbc.id,
        name: 'Hemoglobin (Hb)',
        unit: 'g/dL',
        resultType: 'numeric',
        sortOrder: 1
      }).returning();

      if (hb) {
        await db.insert(referenceRanges).values([
          { parameterId: hb.id, gender: 'male', normalLow: '13.5', normalHigh: '17.5', criticalLow: '7.0', criticalHigh: '20.0' },
          { parameterId: hb.id, gender: 'female', normalLow: '12.0', normalHigh: '15.5', criticalLow: '7.0', criticalHigh: '20.0' }
        ]);
      }

      const [wbc] = await db.insert(testParameters).values({
        testId: cbc.id,
        name: 'Total Leukocyte Count (WBC)',
        unit: 'x10^9/L',
        resultType: 'numeric',
        sortOrder: 2
      }).returning();

      if (wbc) {
        await db.insert(referenceRanges).values([
          { parameterId: wbc.id, gender: 'all', normalLow: '4.0', normalHigh: '11.0', criticalLow: '2.0', criticalHigh: '30.0' }
        ]);
      }

      const [plt] = await db.insert(testParameters).values({
        testId: cbc.id,
        name: 'Platelet Count',
        unit: 'x10^9/L',
        resultType: 'numeric',
        sortOrder: 3
      }).returning();

      if (plt) {
        await db.insert(referenceRanges).values([
          { parameterId: plt.id, gender: 'all', normalLow: '150.0', normalHigh: '450.0', criticalLow: '50.0', criticalHigh: '1000.0' }
        ]);
      }
    }
  }

  // 3. Fasting Blood Glucose (FBS)
  const existingFbs = await db.select().from(tests).where(eq(tests.code, 'FBS')).limit(1);
  let fbs = existingFbs[0];
  if (!fbs) {
    const [newFbs] = await db.insert(tests).values({
      code: 'FBS',
      name: 'Fasting Blood Glucose',
      department: 'Chemical Pathology',
      sampleType: 'Fluoride Plasma',
      price: '400.00',
      turnaroundHours: 6
    }).returning();
    fbs = newFbs;

    if (fbs) {
      const [glucose] = await db.insert(testParameters).values({
        testId: fbs.id,
        name: 'Fasting Glucose',
        unit: 'mg/dL',
        resultType: 'numeric',
        sortOrder: 1
      }).returning();

      if (glucose) {
        await db.insert(referenceRanges).values([
          { parameterId: glucose.id, gender: 'all', normalLow: '70.0', normalHigh: '99.0', criticalLow: '45.0', criticalHigh: '400.0' }
        ]);
      }
    }
  }

  // 4. Lipid Profile Tests & Panel
  const existingChol = await db.select().from(tests).where(eq(tests.code, 'CHOL')).limit(1);
  let chol = existingChol[0];
  if (!chol) {
    const [newChol] = await db.insert(tests).values({
      code: 'CHOL',
      name: 'Total Cholesterol',
      department: 'Chemical Pathology',
      sampleType: 'Serum (SST/Yellow Top)',
      price: '600.00',
      turnaroundHours: 8
    }).returning();
    chol = newChol;

    if (chol) {
      const [param] = await db.insert(testParameters).values({
        testId: chol.id,
        name: 'Total Cholesterol',
        unit: 'mg/dL',
        resultType: 'numeric',
        sortOrder: 1
      }).returning();

      if (param) {
        await db.insert(referenceRanges).values([
          { parameterId: param.id, gender: 'all', normalLow: '0.0', normalHigh: '200.0' }
        ]);
      }
    }
  }

  const existingTrig = await db.select().from(tests).where(eq(tests.code, 'TRIG')).limit(1);
  let trig = existingTrig[0];
  if (!trig) {
    const [newTrig] = await db.insert(tests).values({
      code: 'TRIG',
      name: 'Triglycerides',
      department: 'Chemical Pathology',
      sampleType: 'Serum (SST/Yellow Top)',
      price: '600.00',
      turnaroundHours: 8
    }).returning();
    trig = newTrig;

    if (trig) {
      const [param] = await db.insert(testParameters).values({
        testId: trig.id,
        name: 'Triglycerides',
        unit: 'mg/dL',
        resultType: 'numeric',
        sortOrder: 1
      }).returning();

      if (param) {
        await db.insert(referenceRanges).values([
          { parameterId: param.id, gender: 'all', normalLow: '0.0', normalHigh: '150.0' }
        ]);
      }
    }
  }

  // Panel: LIPID
  const existingLipid = await db.select().from(panels).where(eq(panels.code, 'LIPID')).limit(1);
  if (!existingLipid[0] && chol && trig) {
    const [lipidPanel] = await db.insert(panels).values({
      code: 'LIPID',
      name: 'Lipid Profile Panel',
      description: 'Comprehensive screening for cardiovascular risk including Total Cholesterol and Triglycerides.',
      price: '1100.00'
    }).returning();

    if (lipidPanel) {
      await db.insert(panelItems).values([
        { panelId: lipidPanel.id, testId: chol.id, sortOrder: 1 },
        { panelId: lipidPanel.id, testId: trig.id, sortOrder: 2 }
      ]).onConflictDoNothing();
    }
  }

  console.log('Demo catalog seeding complete.');
}
