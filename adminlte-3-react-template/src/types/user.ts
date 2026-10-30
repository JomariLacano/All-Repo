export interface IUser {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  /** ISO 8601 date string */
  createdAt: string;
}
