
import React from 'react';
import { ChatMessage as ChatMessageType, GroundingChunk } from '../types';
import { MapPin, Navigation, ExternalLink, User, Bot } from 'lucide-react';

interface Props {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<Props> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex w-full mb-6 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full shadow-sm ${
          isAssistant ? 'bg-indigo-600 text-white mr-3' : 'bg-slate-200 text-slate-600 ml-3'
        }`}>
          {isAssistant ? <Bot size={20} /> : <User size={20} />}
        </div>
        
        <div className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}>
          <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
            isAssistant 
              ? 'bg-white border border-slate-100 text-slate-800' 
              : 'bg-indigo-600 text-white'
          }`}>
            <div className="whitespace-pre-wrap">{message.content}</div>
            
            {isAssistant && message.links && message.links.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                {message.links.map((link, idx) => (
                  link.maps && (
                    <a
                      key={idx}
                      href={link.maps.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors text-xs font-medium"
                    >
                      <MapPin size={14} />
                      <span>{link.maps.title || 'View on Maps'}</span>
                      <ExternalLink size={12} className="opacity-60" />
                    </a>
                  )
                ))}
              </div>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
