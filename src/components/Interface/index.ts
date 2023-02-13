import { Timestamp } from '@firebase/firestore-types';

export interface Message {
  id: string;
  body: string;
  createdAt: Timestamp;
  number: string;
}

export interface ChatDateProps {
  chatDate: Date;
}

export interface UserInfo {
  id: string;
  userName: string;
  email: string;
  number: string;
  isOptedIn: boolean;
  isDarkMode: boolean;
  isBanned: boolean;
  createdAt: Date;
  profanityStrike: number;
}
;
  
export interface IconColors {
  homeColor: string;
  composeColor: string;
  settingsColor: string;
}
  
export interface ChatInterface {
  id: string;
  messages: Message[];
  participants: string[];
  isBatch: boolean;
}

export interface Location {
  lat: number;
  lng: number;
  geohash: string;
  number: string;
}
      