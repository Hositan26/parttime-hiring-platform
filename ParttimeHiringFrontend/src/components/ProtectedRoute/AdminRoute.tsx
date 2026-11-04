import { RoleRoute } from './RoleRoute';

// Restricts administration pages to authenticated administrators.
export const AdminRoute = () => <RoleRoute roles={['ADMIN']} />;
