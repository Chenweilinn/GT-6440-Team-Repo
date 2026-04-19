import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/portal/dashboard', label: 'Dashboard' },
  { to: '/portal/medications', label: 'Medications' },
  { to: '/portal/conditions', label: 'Conditions' },
  { to: '/portal/labs', label: 'Lab Results' },
  { to: '/portal/appointments', label: 'Appointments' },
];

export default function Sidebar() {
  return (
    <nav className="w-52 bg-sidebar border-r border-sidebar-border flex flex-col py-5 shrink-0">
      <div className="px-5 mb-6">
        <span className="text-base font-bold text-sidebar-heading tracking-tight">Patient Portal</span>
      </div>
      <ul className="space-y-0.5 px-2">
        {NAV_ITEMS.map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-sidebar-active text-sidebar-heading font-medium'
                    : 'text-sidebar-text hover:bg-sidebar-hover'
                }`
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
