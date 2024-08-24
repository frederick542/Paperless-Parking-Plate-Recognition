export interface queryPayload {
  payload: {
    plateNumber?: string;
    timeInLowerLimit?: Date;
    timeInUpperLimit?: Date;
    lastVisibleId?: string;
    operation?: string;
    location?: string;
  };
  type: string; 
}
