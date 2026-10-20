export enum DirectoriesEnum {
  AVATAR = 'avatar',
  GROUP_AVATAR = 'group-avatar',
  TOURNAMENT_BANNER = 'tournament',
  TOURNAMENT_AVATAR = 'tournament-avatar',
  GROUP = 'group',
  GROUP_BANNER = 'group-banner',
  QUIZ = 'quiz',
  TEST = 'test',
}

// Directories anyone signed in may upload images to
export const UPLOAD_DIRECTORIES: string[] = [
  DirectoriesEnum.AVATAR,
  DirectoriesEnum.GROUP_AVATAR,
  DirectoriesEnum.GROUP_BANNER,
  DirectoriesEnum.TOURNAMENT_BANNER,
  DirectoriesEnum.TOURNAMENT_AVATAR,
  DirectoriesEnum.QUIZ,
];
