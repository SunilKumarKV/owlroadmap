export interface SocialPlatform {
  id: string;
  name: string;
  category: 'Professional' | 'Social' | 'Development' | 'Contact';
  color: string; // hex color without #
  logo: string; // shields.io logo query value
  logoColor: string;
  placeholder: string;
  urlTemplate: string;
}

export const SOCIAL_PLATFORM_REGISTRY: SocialPlatform[] = [
  // 1. Professional
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'Professional',
    color: '0A66C2',
    logo: 'linkedin',
    logoColor: 'white',
    placeholder: 'username',
    urlTemplate: 'https://linkedin.com/in/{value}',
  },
  {
    id: 'portfolio',
    name: 'Portfolio Website',
    category: 'Professional',
    color: '4CAF50',
    logo: 'googlechrome',
    logoColor: 'white',
    placeholder: 'https://yourwebsite.com',
    urlTemplate: '{value}',
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'Professional',
    color: '181717',
    logo: 'github',
    logoColor: 'white',
    placeholder: 'username',
    urlTemplate: 'https://github.com/{value}',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    category: 'Professional',
    color: 'FCA121',
    logo: 'gitlab',
    logoColor: 'white',
    placeholder: 'username',
    urlTemplate: 'https://gitlab.com/{value}',
  },

  // 2. Social
  {
    id: 'x',
    name: 'X (Twitter)',
    category: 'Social',
    color: '000000',
    logo: 'x',
    logoColor: 'white',
    placeholder: 'username',
    urlTemplate: 'https://x.com/{value}',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'Social',
    color: 'E4405F',
    logo: 'instagram',
    logoColor: 'white',
    placeholder: 'username',
    urlTemplate: 'https://instagram.com/{value}',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'Social',
    color: 'FF0000',
    logo: 'youtube',
    logoColor: 'white',
    placeholder: 'channel handle',
    urlTemplate: 'https://youtube.com/@{value}',
  },
  {
    id: 'twitch',
    name: 'Twitch',
    category: 'Social',
    color: '9146FF',
    logo: 'twitch',
    logoColor: 'white',
    placeholder: 'username',
    urlTemplate: 'https://twitch.tv/{value}',
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'Social',
    color: '5865F2',
    logo: 'discord',
    logoColor: 'white',
    placeholder: 'invite-link or username',
    urlTemplate: 'https://discord.gg/{value}',
  },

  // 3. Development
  {
    id: 'stackoverflow',
    name: 'Stack Overflow',
    category: 'Development',
    color: 'F48024',
    logo: 'stackoverflow',
    logoColor: 'white',
    placeholder: 'user-id',
    urlTemplate: 'https://stackoverflow.com/users/{value}',
  },
  {
    id: 'devto',
    name: 'Dev.to',
    category: 'Development',
    color: '0A0A0A',
    logo: 'devdotto',
    logoColor: 'white',
    placeholder: 'username',
    urlTemplate: 'https://dev.to/{value}',
  },
  {
    id: 'hashnode',
    name: 'Hashnode',
    category: 'Development',
    color: '2962FF',
    logo: 'hashnode',
    logoColor: 'white',
    placeholder: 'username',
    urlTemplate: 'https://{value}.hashnode.dev',
  },
  {
    id: 'medium',
    name: 'Medium',
    category: 'Development',
    color: '000000',
    logo: 'medium',
    logoColor: 'white',
    placeholder: '@username',
    urlTemplate: 'https://medium.com/@{value}',
  },

  // 4. Contact
  {
    id: 'email',
    name: 'Email',
    category: 'Contact',
    color: '000000',
    logo: 'minutemailer',
    logoColor: 'white',
    placeholder: 'hello@example.com',
    urlTemplate: 'mailto:{value}',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'Contact',
    color: 'EA4335',
    logo: 'gmail',
    logoColor: 'white',
    placeholder: 'username@gmail.com',
    urlTemplate: 'mailto:{value}',
  },
  {
    id: 'buymeacoffee',
    name: 'Buy Me a Coffee',
    category: 'Contact',
    color: 'FFDD00',
    logo: 'buymeacoffee',
    logoColor: 'black',
    placeholder: 'username',
    urlTemplate: 'https://buymeacoffee.com/{value}',
  },
  {
    id: 'kofi',
    name: 'Ko-fi',
    category: 'Contact',
    color: 'F16061',
    logo: 'kofi',
    logoColor: 'white',
    placeholder: 'username',
    urlTemplate: 'https://ko-fi.com/{value}',
  },
];

export const SOCIAL_CATEGORIES = [
  'Professional',
  'Social',
  'Development',
  'Contact',
] as const;
