// Validates account details before sending registration data to the server.
export const registrationError = (username: string, password: string, name: string, email: string): string => {
  if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) return 'Username cần 3–50 chữ cái, chữ số hoặc dấu gạch dưới.';
  if (!name.trim() || name.length > 100) return 'Tên hiển thị cần từ 1–100 ký tự.';
  if (!passwordAllowed(password)) return 'Mật khẩu cần ít nhất 8 ký tự và tối đa 72 byte UTF-8.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email không hợp lệ.';
  return '';
};

// Matches the server's BCrypt-safe password policy, including Unicode input.
export const passwordAllowed = (value: string): boolean =>
  value.length >= 8 && new TextEncoder().encode(value).length <= 72;
