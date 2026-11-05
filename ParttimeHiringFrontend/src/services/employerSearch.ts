const normalize = (value: string) => value.normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .toLowerCase()
  .replaceAll('đ', 'd')
  .trim();

export const matchesEmployerSearch = (query: string, ...fields: (string | null | undefined)[]) => {
  const term = normalize(query);
  return term === '' || fields.some(field => field != null && normalize(field).includes(term));
};
