"use client";

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

export default function AppProgressBar() {
  return (
    <ProgressBar
      height="4px"
      color="#0d9488" /* Tailwind teal-600 */
      options={{ showSpinner: false }}
      shallowRouting
      delay={0}
    />
  );
}
