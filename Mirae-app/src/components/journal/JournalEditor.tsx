
import React, { useRef, useState } from "react";
import AnimatedPen from "./AnimatedPen";

const JournalEditor: React.FC = () => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="relative w-full h-full">

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start writing your thoughts..."
        className="w-full h-full bg-transparent outline-none resize-none font-serif text-lg text-[#3e2f1c] leading-8"
      />

      <AnimatedPen textLength={text.length} />
    </div>
  );
};

export default JournalEditor;
