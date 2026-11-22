import { db } from '../client.js';
import { tests, testParameters, referenceRanges } from '../schema/index.js';

export async function seedDemoCatalog() {
  console.log('Seeding demo test catalog...');

  // 1. Complete Blood Count (CBC)
  const [cbc] = await db.insert(tests).values({
    code: 'CBC',
    name: 'Complete Blood Count (CBC)',
    department: 'Hematology',
    sampleType: 'EDTA Whole Blood',
    price: '1200.00',
    turnaroundHours: 12
  }).onConflictDoNothing().returning();

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
  }

  console.log('Demo test catalog seeded.');
}
