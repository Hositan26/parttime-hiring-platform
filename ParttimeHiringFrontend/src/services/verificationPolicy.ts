export const rejectionMessage = (status: string | null, reason: unknown): string | null => {
  if (status !== 'REJECTED') return null;
  const explanation = typeof reason === 'string' ? reason.trim() : '';
  return explanation || 'Hồ sơ chưa được chấp thuận. Vui lòng kiểm tra thông tin và giấy tờ trước khi gửi lại.';
};
