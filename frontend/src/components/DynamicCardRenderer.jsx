import React, { useState, useEffect, useRef } from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';

// Helper to strip import statements from code
function stripImports(code) {
  return code.replace(/import[^;]+;/g, '').trim();
}

export default function DynamicCardRenderer({ code }) {
  // Provide React and hooks in scope for LiveProvider
  const scope = { React, useState, useEffect, useRef };
  const sanitizedCode = stripImports(code);
  return (
    <LiveProvider code={sanitizedCode} scope={scope} noInline>
      <LivePreview />
      <LiveError />
      {/* Optionally, show the code for transparency */}
      {/* <LiveEditor /> */}
    </LiveProvider>
  );
}
