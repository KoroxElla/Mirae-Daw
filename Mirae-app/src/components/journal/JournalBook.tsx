
import React, { useState } from "react";
import JournalPage from "./JournalPage";
import JournalEditor from "./JournalEditor";

const JournalBook: React.FC = () => {
  const [isWriting, setIsWriting] = useState(false);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#d8cbb5]">

      <div className="relative w-[900px] h-[600px]">

        {/* Book Background */}
        <img
          src="/journal/openjournal.png"
          alt="Open Journal"
          className="absolute w-full h-full object-contain"
        />

        {!isWriting ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
            <h1 className="text-3xl font-serif text-brown-900">
              My Emotional Journal
            </h1>

            <button
              onClick={() => setIsWriting(true)}
              className="px-6 py-3 bg-amber-700 text-white rounded-lg shadow-md hover:bg-amber-800 transition"
            >
              Start New Entry
            </button>
          </div>
        ) : (
          <JournalPage>
            <JournalEditor />
          </JournalPage>
        )}
      </div>
    </div>
  );
};

export default JournalBook;
