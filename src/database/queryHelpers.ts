export const now = () => new Date().toISOString();

export const timestampsOnInsert = () => ({
  created_at: now(),
  updated_at: now(),
});

export const timestampsOnUpdate = () => ({
  updated_at: now(),
});
