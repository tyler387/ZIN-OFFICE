import type { UserDto } from '../api/authApi';

// Temporary default for local testing: auth is bypassed unless explicitly disabled.
export const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH !== 'false';

export const MOCK_USER: UserDto = {
  id: 999999,
  email: 'kimj@company.com',
  name: 'Kim J',
  role: 'USER',
  employee: {
    id: 999999,
    position: 'Tester',
    phone: '010-0000-0000',
    officeLocation: 'Test Lab',
    department: {
      id: 1,
      name: 'QA',
    },
  },
};
