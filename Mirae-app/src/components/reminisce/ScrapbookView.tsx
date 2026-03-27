import { useState } from "react"
import { getEmotionColors } from "./emotionColors"

interface Entry {
  id: string
  text: string
  primaryEmotion: string
  createdAt: string
}

interface Props {
  entries: Entry[]
}

export default function ScrapbookView({ entries }: Props) {

  const [selected, setSelected] = useState<Entry | null>(null)

  return (
    <div className="scrapbook-container">

      {entries.map((entry, index) => (

        <div
          key={entry.id}
          className="scrapbook-card"
          style={{
            transform: `rotate(${(index % 2 === 0 ? -2 : 2)}deg)`
          }}
          onClick={() => setSelected(entry)}
        >

          <div
            className="emotion-tag"
            style={{ background: getEmotionColors(entry.primaryEmotion) }}
          >
            {entry.primaryEmotion}
          </div>

          <p className="scrap-preview">
            {entry.text.slice(0, 90)}...
          </p>

          <span className="scrap-date">
            {new Date(entry.createdAt).toLocaleDateString()}
          </span>

        </div>

      ))}

      {selected && (

        <div className="scrap-popup">

          <div className="scrap-popup-card">

            <button onClick={() => setSelected(null)}>
              Close
            </button>

            <h3>{selected.primaryEmotion}</h3>

            <p>{selected.text}</p>

          </div>

        </div>

      )}

    </div>
  )
}
