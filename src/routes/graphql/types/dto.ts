export type postDto = {
  title: string;
  content: string;
  authorId: string;
};

export type userDto = {
  name: string;
  balance: number;
};

export type profileDto = {
  isMale: boolean;
  yearOfBirth: number;
  memberTypeId: string;
  userId: string;
};
