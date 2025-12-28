
export interface GroundingChunk {
  maps?: {
    uri: string;
    title: string;
  };
}

export interface SearchResult {
  text: string;
  groundingLinks: GroundingChunk[];
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  links?: GroundingChunk[];
  timestamp: number;
}
