export interface NewsEvent {
  _id: string;
  title: string;
  description: string;
  images: string[];
  hotlinks: { label: string; url: string }[];
  category: 'news' | 'event';
  tags: string[];
  published: boolean;
  views: number;
  createdBy: Types.ObjectId;
  eventDate?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}


export interface NewsEventPayload{
    title:string;
    description?: string;
    images?: string[];
    tags?: string[];
}