
import React from "react";

interface Props {
  children: React.ReactNode;
}

const JournalPage: React.FC<Props> = ({ children }) => {
  return (
    <div className="absolute inset-0 flex">

      {/* Left Page */}
      <div className="w-1/2 h-full p-12 overflow-hidden font-serif text-lg text-[#3e2f1c]">
        <p className="opacity-50 italic">
          Previous entries will appear here...
        </p>
      </div>

      {/* Right Page */}
      <div className="w-1/2 h-full p-12 relative">
        {children}
      </div>

    </div>
  );
};

export default JournalPage;
