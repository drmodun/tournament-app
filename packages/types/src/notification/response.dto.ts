export interface NotificationResponseDto {
  id: number;
  userId: number;
  message: string;
  link: string | null;
  image: string | null;
  type: string;
  createdAt: Date;
  read: boolean;
}
