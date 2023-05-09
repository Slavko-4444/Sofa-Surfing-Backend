export class UserInfoDto { 
    userId: number;
    surname: string;
    forename: string;
    address: string;
    birthDate: string;
    occupation: string;
    contact: "email" | "phone-conntact";
    email: string | null;
    phone: string | null;


}