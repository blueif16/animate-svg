// This repo's install carries no @types/react-dom (only @types/react); the
// runtime export exists (proven by terminalValueLayout.test.tsx's RED/GREEN
// runs), only its type declaration is missing. A bare ambient shorthand
// module — no member augmentation — silences tsc's "implicit any" on the
// import without needing a new dependency, for TEST-ONLY use.
declare module "react-dom/server";
