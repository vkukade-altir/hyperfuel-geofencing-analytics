import type { Entity } from "../api/types";

export function buildEntityMap(entities: Entity[]): Map<string, Entity> {
  const map = new Map<string, Entity>();
  for (const entity of entities) {
    map.set(entity.id, entity);
  }
  return map;
}

export function entityLabel(
  entityId: string,
  entityMap: Map<string, Entity>,
): string {
  const entity = entityMap.get(entityId);
  if (!entity) return entityId;
  const type = entity.entity_type === "amenity" ? entity.amenity_type ?? "amenity" : "station";
  return `${entity.name} (${type})`;
}
