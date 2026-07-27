import React from 'react';

interface ResizableSplitterProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export function ResizableSplitter({ onMouseDown }: ResizableSplitterProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="hidden lg:flex w-2 hover:w-2 hover:bg-indigo-500/50 active:bg-indigo-500 cursor-col-resize items-center justify-center group transition-colors rounded-full self-stretch select-none"
      title="Drag to resize panel width"
    >
      <div className="w-0.5 h-8 bg-[#30363d] group-hover:bg-indigo-400 group-active:bg-white rounded-full transition-colors" />
    </div>
  );
}
