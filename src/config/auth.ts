import type { UserDto } from '../api/authApi';

// Auth bypass is disabled by default.
// Enable only when VITE_BYPASS_AUTH=true is explicitly set.
export const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === 'true';

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
