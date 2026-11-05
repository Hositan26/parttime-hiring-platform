const normalize = (value: string) => value.normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .toLowerCase()
  .replaceAll('đ', 'd')
  .trim();

export const matchesEmployerSearch = (query: string, ...fields: (string | null | undefined)[]) => {
  const term = normalize(query);
  return term === '' || fields.some(field => field != null && normalize(field).includes(term));
};

export const employerJobSearchParams = (page: number, size: number, storeId?: number, status?: string, keyword?: string) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (storeId != null) params.set('storeId', String(storeId));
  if (status) params.set('status', status);
  if (keyword?.trim()) params.set('keyword', keyword.trim());
  return params;
};
