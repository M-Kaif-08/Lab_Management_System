import { db, tests, testParameters, referenceRanges, panels, panelItems, specimenTypes } from '@lab/db';
import { eq, or, ilike, desc, count, inArray } from 'drizzle-orm';
import {
  CreateTestCatalogItem,
  UpdateTestCatalogItem,
  CatalogSearchQuery,
  CreatePanel,
  UpdatePanel,
  CreateSpecimenType
} from '@lab/contracts';

export class CatalogService {
  // Specimen Types
  static async listSpecimenTypes() {
    return db.select().from(specimenTypes).where(eq(specimenTypes.isActive, true));
  }

  static async createSpecimenType(data: CreateSpecimenType) {
    const [created] = await db.insert(specimenTypes).values(data).returning();
    return created;
  }

  // Tests
  static async searchTests(query: CatalogSearchQuery) {
    const offset = (query.page - 1) * query.limit;
    let whereCondition: any;

    const conditions = [];
    if (query.query) {
      conditions.push(
        or(
          ilike(tests.name, `%${query.query}%`),
          ilike(tests.code, `%${query.query}%`),
          ilike(tests.department, `%${query.query}%`)
        )
      );
    }
    if (query.department) {
      conditions.push(eq(tests.department, query.department));
    }
    if (query.sampleType) {
      conditions.push(eq(tests.sampleType, query.sampleType));
    }
    if (query.isActive !== undefined) {
      conditions.push(eq(tests.isActive, query.isActive === 'true'));
    }

    if (conditions.length === 1) {
      whereCondition = conditions[0];
    } else if (conditions.length > 1) {
      whereCondition = or(...conditions);
    }

    const testList = await db
      .select()
      .from(tests)
      .where(whereCondition)
      .orderBy(desc(tests.createdAt))
      .limit(query.limit)
      .offset(offset);

    const [totalResult] = await db
      .select({ total: count() })
      .from(tests)
      .where(whereCondition);

    // Fetch parameters & ranges for these tests
    const testIds = testList.map((t) => t.id);
    let allParams: any[] = [];
    let allRanges: any[] = [];

    if (testIds.length > 0) {
      allParams = await db
        .select()
        .from(testParameters)
        .where(inArray(testParameters.testId, testIds))
        .orderBy(testParameters.sortOrder);

      const paramIds = allParams.map((p) => p.id);
      if (paramIds.length > 0) {
        allRanges = await db
          .select()
          .from(referenceRanges)
          .where(inArray(referenceRanges.parameterId, paramIds));
      }
    }

    const items = testList.map((t) => {
      const params = allParams
        .filter((p) => p.testId === t.id)
        .map((p) => ({
          ...p,
          ranges: allRanges.filter((r) => r.parameterId === p.id)
        }));
      return {
        ...t,
        price: Number(t.price),
        parameters: params
      };
    });

    return {
      items,
      total: Number(totalResult?.total || 0),
      page: query.page,
      limit: query.limit
    };
  }

  static async getTestById(id: string) {
    const [test] = await db.select().from(tests).where(eq(tests.id, id)).limit(1);
    if (!test) throw new Error('Test not found');

    const params = await db
      .select()
      .from(testParameters)
      .where(eq(testParameters.testId, test.id))
      .orderBy(testParameters.sortOrder);

    const paramIds = params.map((p) => p.id);
    let ranges: any[] = [];
    if (paramIds.length > 0) {
      ranges = await db
        .select()
        .from(referenceRanges)
        .where(inArray(referenceRanges.parameterId, paramIds));
    }

    const enrichedParams = params.map((p) => ({
      ...p,
      ranges: ranges.filter((r) => r.parameterId === p.id)
    }));

    return {
      ...test,
      price: Number(test.price),
      parameters: enrichedParams
    };
  }

  static async createTest(data: CreateTestCatalogItem) {
    const { parameters, price, ...testFields } = data;

    const [createdTest] = await db
      .insert(tests)
      .values({
        ...testFields,
        price: price.toFixed(2)
      })
      .returning();

    if (parameters && parameters.length > 0) {
      for (let i = 0; i < parameters.length; i++) {
        const param = parameters[i];
        const [createdParam] = await db
          .insert(testParameters)
          .values({
            testId: createdTest.id,
            name: param.name,
            unit: param.unit,
            resultType: param.resultType || 'numeric',
            sortOrder: param.sortOrder ?? i + 1
          })
          .returning();

        if (param.ranges && param.ranges.length > 0) {
          for (const range of param.ranges) {
            await db.insert(referenceRanges).values({
              parameterId: createdParam.id,
              gender: range.gender || 'all',
              minAgeYears: range.minAgeYears,
              maxAgeYears: range.maxAgeYears,
              normalLow: range.normalLow?.toString(),
              normalHigh: range.normalHigh?.toString(),
              criticalLow: range.criticalLow?.toString(),
              criticalHigh: range.criticalHigh?.toString(),
              normalText: range.normalText
            });
          }
        }
      }
    }

    return this.getTestById(createdTest.id);
  }

  static async updateTest(id: string, data: UpdateTestCatalogItem) {
    const updatePayload: any = { updatedAt: new Date() };
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.department !== undefined) updatePayload.department = data.department;
    if (data.sampleType !== undefined) updatePayload.sampleType = data.sampleType;
    if (data.price !== undefined) updatePayload.price = data.price.toFixed(2);
    if (data.turnaroundHours !== undefined) updatePayload.turnaroundHours = data.turnaroundHours;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

    const [updated] = await db
      .update(tests)
      .set(updatePayload)
      .where(eq(tests.id, id))
      .returning();

    if (!updated) throw new Error('Test not found');
    return this.getTestById(updated.id);
  }

  // Panels
  static async listPanels() {
    const panelList = await db.select().from(panels).orderBy(panels.name);
    const items = await Promise.all(
      panelList.map(async (panel) => {
        const pItems = await db
          .select({
            id: panelItems.id,
            panelId: panelItems.panelId,
            testId: panelItems.testId,
            sortOrder: panelItems.sortOrder,
            testName: tests.name,
            testCode: tests.code,
            testPrice: tests.price
          })
          .from(panelItems)
          .innerJoin(tests, eq(panelItems.testId, tests.id))
          .where(eq(panelItems.panelId, panel.id))
          .orderBy(panelItems.sortOrder);

        return {
          ...panel,
          price: panel.price ? Number(panel.price) : pItems.reduce((acc, curr) => acc + Number(curr.testPrice), 0),
          items: pItems
        };
      })
    );
    return items;
  }

  static async createPanel(data: CreatePanel) {
    let panelPrice = data.price;
    if (panelPrice === undefined) {
      const selectedTests = await db.select().from(tests).where(inArray(tests.id, data.testIds));
      panelPrice = selectedTests.reduce((acc, curr) => acc + Number(curr.price), 0);
    }

    const [created] = await db
      .insert(panels)
      .values({
        code: data.code,
        name: data.name,
        description: data.description,
        price: panelPrice.toFixed(2),
        isActive: data.isActive
      })
      .returning();

    for (let i = 0; i < data.testIds.length; i++) {
      await db.insert(panelItems).values({
        panelId: created.id,
        testId: data.testIds[i],
        sortOrder: i + 1
      });
    }

    return created;
  }
}
