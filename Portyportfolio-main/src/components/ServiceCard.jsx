import React from 'react';
import { MoveRight } from 'lucide-react';

export const ServiceCard = ({ service, onDetailsClick }) => {
  const Icon = service.icon;

  return (
    <div className="group card relative overflow-hidden h-full flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 text-zinc-900 group-hover:bg-orange-600 group-hover:text-white transition-colors">
          <Icon size={24} />
        </div>

        <h3 className="heading-3 mb-3">
          {service.title}
        </h3>

        <p className="body-base flex-grow">
          {service.desc}
        </p>

        <button
          onClick={() => onDetailsClick(service)}
          className="mt-6 flex items-center gap-2 label-mono text-zinc-400 group-hover:text-orange-600 transition-colors cursor-pointer"
          aria-label={`View details for ${service.title}`}
        >
          <span>Details</span>
          <MoveRight size={12} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
