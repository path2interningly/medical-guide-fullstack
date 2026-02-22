import React from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';

export default function DynamicCardRenderer({ code }) {
  return (
    <LiveProvider code={code} noInline>
      <LivePreview />
      <LiveError />
      {/* Optionally, show the code for transparency */}
      {/* <LiveEditor /> */}
    </LiveProvider>
  );
}
