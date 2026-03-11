import React from "react"
import { emotionColors } from "./emotionColors"

export default function GameTimeline({ nodes }) {

  return (
    <div className="relative w-full h-full">

      {nodes.map(node => (
        <div
          key={node.id}
          className="absolute flex flex-col items-center"
          style={{
            transform: `translate(${node.x}px, ${node.y}px)`
          }}
        >

          <div
            className="w-12 h-12 rounded-full shadow-lg"
            style={{
              backgroundColor: emotionColors[node.emotion] || "#ccc"
            }}
          />

          <span className="text-xs mt-1 text-gray-500">
            {node.date}
          </span>

        </div>
      ))}

    </div>
  )
}
