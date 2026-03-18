import type { UserDto } from '../api/authApi';

// In dev server, always bypass auth for local testing.
// In non-dev builds, only bypass when explicitly enabled.
export const BYPASS_AUTH = import.meta.env.DEV
  ? true
  : import.meta.env.VITE_BYPASS_AUTH === 'true';

export const MOCK_USER: UserDto = {
  id: 4,
  email: 'kimj@company.com',
  name: '김진환',
  role: 'USER',
  employee: {
    id: 4,
    position: '사원',
    phone: '010-0000-0004',
    officeLocation: '본사 9층',
    department: {
      id: 2,
      name: '개발팀',
    },
  },
};
