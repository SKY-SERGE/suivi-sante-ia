---
applyTo: "**"
---

- The project folder is that of Nuxt 4 with compatibilityVersion set to 4.

# Styling & UI Components:

- _Primary_: Use Tailwind CSS v4 for all styling needs
- _Component Library_:
  - Use _Shadcn Vue_ for all UI elements. (e.g. <Button>...</Button>, <Card>...</Card>)
  - Always use _NuxtImg_ for images to ensure optimization and responsive handling. (e.g <NuxtImg src="/path/to/image.jpg" alt="Description" />)
- _Icons: Use \*\*Nuxt Icon_ for all icon requirements. (e.g.: <Icon name="lucide:a-arrow-down" />).
- _Responsiveness:_ Ensure all UI components are fully responsive using Tailwind CSS 4.
- _Loading States:_ Show loading indicators for asynchronous operations.
- _Notifications display:_ Always use the toast store to show notifications and status messages.

# Component Strategy:

- Prioritize using components provided by _Shadcn Vue_.
- If a required UI component is not available in Shadcn Vue, create it as a reusable component in `nuxt-app/app/components/common` directory.
- Always ensure that a component file is not too long and complex.
  If the component exceeds 550 lines of code, consider breaking it down into smaller components.

# Documentation Context:

- Always use the `context7` tool to get recent documentation about _Shadcn Vue_, to ensure best practices and up-to-date syntax are followed.
