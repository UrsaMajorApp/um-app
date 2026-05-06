export interface RoadmapItem {
  id: string;
  childId: string;
  title: string;
  description: string;
  status: 'locked' | 'available' | 'completed';
  type: 'skill' | 'activity' | 'milestone';
  order: number;
}
