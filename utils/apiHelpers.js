// Common API helpers

export const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  // Try common nesting patterns { items: [] } or first array-like field
  if (payload && typeof payload === 'object') {
    for (const key of Object.keys(payload)) {
      const val = payload[key];
      if (Array.isArray(val)) return val;
    }
  }
  return [];
};
