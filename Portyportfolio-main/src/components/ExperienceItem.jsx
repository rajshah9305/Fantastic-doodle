import React from 'react';

export const ExperienceItem = ({ item, last }) => (
  <div className="relative pl-8 md:pl-12 py-2 group">
    {!last && (
      <div className="absolute left-[11px] md:left-[15px] top-4 h-full w-[1px] bg-zinc-200 group-hover:bg-zinc-300 transition-colors"></div>
    )}
    
    <div className="absolute left-0 top-2 h-6 w-6 md:h-8 md:w-8 rounded-full border border-zinc-200 bg-white flex items-center justify-center z-10 transition-transform duration-300 group-hover:scale-110 group-hover:border-orange-600">
      <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-orange-600"></div>
    </div>

    <div className="mb-10">
      <span className="inline-block mb-2 font-mono text-[10px] font-bold tracking-widest text-orange-600 uppercase bg-orange-50 px-2 py-1 rounded-sm">
        {item.period}
      </span>
      <h4 className="heading-2 mt-1">
        {item.role}
      </h4>
      <div className="label-mono text-zinc-500 mb-4">
        {item.company}
      </div>
      <p className="body-large max-w-2xl">
        {item.desc}
      </p>
    </div>
  </div>
);
