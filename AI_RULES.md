# AI Development Rules - TradConect

## Tech Stack
- **Framework**: React with TypeScript for robust, type-safe frontend development.
- **Styling**: Tailwind CSS for utility-first styling and responsive design.
- **UI Components**: shadcn/ui for high-quality, accessible, and customizable components.
- **Icons**: Lucide React for a consistent and modern icon set.
- **Routing**: React Router for client-side navigation and page management.
- **Data Visualization**: Chart.js for interactive dashboards and analytical charts.
- **State Management**: React Hooks (useState, useMemo, useEffect) for local and shared state.
- **Backend/Auth**: Supabase for database, authentication, and real-time features.

## Library Usage Rules
- **UI/UX**: Always prioritize **shadcn/ui** components. Do not reinvent buttons, inputs, or modals.
- **Styling**: Use **Tailwind CSS** classes exclusively. Avoid writing custom CSS files unless absolutely necessary for complex animations.
- **Icons**: Use **Lucide React** icons. Only use Font Awesome if a specific icon is missing from Lucide.
- **Charts**: Use **Chart.js** for all data visualizations, ensuring they are responsive and follow the app's color palette.
- **Navigation**: All routes must be defined in `src/App.tsx`. Use `Link` from `react-router-dom` for internal navigation.
- **Components**: Keep components small (under 100 lines). Create new files in `src/components/` for every new UI element.
- **Pages**: Place top-level views in `src/pages/`. The entry point is `src/pages/Index.tsx`.
- **Logic**: Keep business logic separated from UI components using custom hooks when complexity grows.

## General Principles
- **Simplicity**: Keep code elegant and avoid over-engineering.
- **Responsiveness**: Every component and page must be fully responsive (mobile-first).
- **Type Safety**: Define interfaces for all data structures and component props.