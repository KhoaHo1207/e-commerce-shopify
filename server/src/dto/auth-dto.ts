export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface LoginResponseDto {
  accessToken: string;
  user: UserResponseDto;
}
