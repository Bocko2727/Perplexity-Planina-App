export interface Hut {
  name: string;
  elevation?: number | null;
  beds?: number | null;
  officialSource?: string;
  officialPhone?: string;
  altPhone?: string;
  email?: string;
  contactName?: string;
  gps?: string;
  verified?: boolean;
  conflict?: string | null;
  staleNumbers?: string;
  phone?: string;
}
