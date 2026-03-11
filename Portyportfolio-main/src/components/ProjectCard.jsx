import React from 'react';
import { MoveRight } from 'lucide-react';

export const ProjectCard = ({ project, index }) => {
  const Icon = project.icon;

  return (
    <div className="group card relative overflow-hidden h-full flex flex-col">
      {/* Background Image - Subtle Reveal */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-500 ease-out opacity-10 lg:opacity-0 lg:group-hover:opacity-10"
        style={{
          backgroundImage: `url(${project.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(100%)'
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header: Icon & Number */}
        <div className="flex justify-between items-start mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 text-zinc-900 group-hover:bg-orange-600 group-hover:text-white transition-colors">
            <Icon size={24} />
          </div>
          <span className="font-mono text-xs font-bold text-zinc-300 group-hover:text-orange-600 transition-colors">
            {index + 1 < 10 ? `0${index + 1}` : index + 1}
          </span>
        </div>

        {/* Content */}
        <h3 className="heading-3 mb-3">
          {project.title}
        </h3>

        <p className="body-base mb-6 flex-grow">
          {project.description}
        </p>

        {/* Footer: Tech & Link */}
        <div className="flex flex-col gap-4 mt-auto">
          <div className="flex flex-wrap gap-2">
            {project.tech.slice(0, 3).map((t, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-zinc-50 border border-zinc-100 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
            <span className="label-mono text-zinc-400">
              {project.stat}
            </span>
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 label-mono text-zinc-900 hover:text-orange-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
              aria-label={`View ${project.title} repository on GitHub`}
            >
              View Repo
              <MoveRight size={12} className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
