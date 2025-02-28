import { Injectable } from '@nestjs/common';
import { groupRequirements, eloRequirement, category } from '../../db/schema';
import { db } from '../../db/db';
import { eq } from 'drizzle-orm';
import { IEloRequirement } from '@tournament-app/types';

@Injectable()
export class GroupRequirementsRepository {
  // This is a special repository which does not need crud operations, so it does not make sense to extend primary repository
  async createRequirements(
    groupId: number,
    data: {
      minimumAge?: number;
      maximumAge?: number;
      isSameCountry?: boolean;
      eloRequirements?: IEloRequirement[];
    },
  ) {
    return db.transaction(async (tx) => {
      const [requirements] = await tx
        .insert(groupRequirements)
        .values({
          groupId,
          minimumAge: data.minimumAge,
          maximumAge: data.maximumAge,
          isSameCountry: data.isSameCountry,
        })
        .returning();

      if (data.eloRequirements?.length) {
        await tx.insert(eloRequirement).values(
          data.eloRequirements.map((req) => ({
            groupRequirementId: requirements.id,
            categoryId: req.categoryId,
            minimumElo: req.minimumElo,
            maximumElo: req.maximumElo,
          })),
        );
      }

      return requirements;
    });
  }

  async updateRequirements(
    groupId: number,
    data: {
      minimumAge?: number;
      maximumAge?: number;
      isSameCountry?: boolean;
      eloRequirements?: IEloRequirement[];
    },
  ) {
    return db.transaction(async (tx) => {
      const [requirements] = await tx
        .update(groupRequirements)
        .set({
          minimumAge: data.minimumAge,
          maximumAge: data.maximumAge,
          isSameCountry: data.isSameCountry,
        })
        .where(eq(groupRequirements.groupId, groupId))
        .returning();

      if (data.eloRequirements) {
        await tx
          .delete(eloRequirement)
          .where(eq(eloRequirement.groupRequirementId, requirements.id));

        if (data.eloRequirements.length) {
          await tx.insert(eloRequirement).values(
            data.eloRequirements.map((req) => ({
              groupRequirementId: requirements.id,
              categoryId: req.categoryId,
              minimumElo: req.minimumElo,
              maximumElo: req.maximumElo,
            })),
          );
        }
      }

      return requirements;
    });
  }

  async getRequirementsWithElo(groupId: number) {
    const requirements = await db
      .select()
      .from(groupRequirements)
      .where(eq(groupRequirements.groupId, groupId))
      .limit(1);

    if (!requirements.length) {
      return null;
    }

    const eloRequirements = await db
      .select({
        id: eloRequirement.id,
        categoryId: eloRequirement.categoryId,
        minimumElo: eloRequirement.minimumElo,
        maximumElo: eloRequirement.maximumElo,
        category: {
          id: category.id,
          name: category.name,
          logo: category.image,
        },
      })
      .from(eloRequirement)
      .leftJoin(category, eq(category.id, eloRequirement.categoryId))
      .where(eq(eloRequirement.groupRequirementId, requirements[0].id));

    return {
      ...requirements[0],
      eloRequirements,
    };
  }

  async deleteRequirements(groupId: number) {
    const requirements = await db
      .select()
      .from(groupRequirements)
      .where(eq(groupRequirements.groupId, groupId))
      .limit(1);

    if (!requirements.length) {
      return null;
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(eloRequirement)
        .where(eq(eloRequirement.groupRequirementId, requirements[0].id));

      await tx
        .delete(groupRequirements)
        .where(eq(groupRequirements.id, requirements[0].id));
    });

    return requirements[0];
  }
}
