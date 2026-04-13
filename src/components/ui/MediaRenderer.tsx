import React from 'react';
import { Note } from '@/services/noteService';

interface MediaRendererProps {
  note?: Note;
}

export default function MediaRenderer({ note }: MediaRendererProps) {
  if (!note || !note.media || !note.mediaReferences || note.mediaReferences.length === 0) {
    return null;
  }

  // Create a map of media by ID
  const mediaMap = new Map(note.media.map(m => [m.id, m]));
  
  // Sort references by position
  const sortedReferences = [...note.mediaReferences].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-6">
      {sortedReferences.map((ref, idx) => {
        const media = mediaMap.get(ref.mediaId);
        if (!media) return null;

        if (media.type === 'image') {
          return (
            <div key={idx} className="my-6">
              <img
                src={media.url}
                alt={media.name}
                className="rounded-2xl shadow-lg max-w-full h-auto"
              />
            </div>
          );
        } else if (media.type === 'video') {
          return (
            <div key={idx} className="my-6">
              <video
                src={media.url}
                controls
                className="rounded-2xl shadow-lg max-w-full h-auto"
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
