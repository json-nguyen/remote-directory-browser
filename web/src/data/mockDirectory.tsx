import { DirectoryEntry } from '@/types/directory';

export const mockDirectory: DirectoryEntry[] = [
  {
    name: 'b_example',
    type: 'dir',
    size: 0,
    contents: [
      {
        name: 'README.md',
        type: 'file',
        size: 12345,
      },
      {
        name: 'images',
        type: 'dir',
        size: 0,
      },
    ],
  },
  {
    name: 'a_example2.pdf',
    type: 'file',
    size: 5555555555555,
  },
  {
    name: 'c_example3.txt',
    type: 'file',
    size: 1313,
  },
  {
    name: 'ac_example3.txt',
    type: 'file',
    size: 1261261461,
  },
  {
    name: 'z_really really really really really really long file name.txt',
    type: 'file',
    size: 1261261461,
  },
];
