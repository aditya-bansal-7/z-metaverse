export type User = {
    _id: string;
    username: string;
    email: string;
    role: "Admin" | "User";
    avatarId: string;
}