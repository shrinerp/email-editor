export type BlockType = 'hero' | 'text' | 'button' | 'image' | 'divider' | 'twoColumn' | 'header';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface HeroBlock extends BaseBlock {
  type: 'hero';
  imageUrl: string;
  headline: string;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  htmlContent: string;
}

export interface ButtonBlock extends BaseBlock {
  type: 'button';
  label: string;
  url: string;
  backgroundColor: string;
  textColor: string;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  imageUrl: string;
  altText: string;
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
}

export interface TwoColumnBlock extends BaseBlock {
  type: 'twoColumn';
  leftBlocks: EmailBlock[];
  rightBlocks: EmailBlock[];
}

export interface HeaderBlock extends BaseBlock {
  type: 'header';
  text: string;
  level: 1 | 2 | 3;
  alignment: 'left' | 'center' | 'right';
}

export type EmailBlock =
  | HeroBlock
  | TextBlock
  | ButtonBlock
  | ImageBlock
  | DividerBlock
  | TwoColumnBlock
  | HeaderBlock;

export interface EmailDocument {
  blocks: EmailBlock[];
}

export function createBlock(type: BlockType): EmailBlock {
  const id = crypto.randomUUID();
  switch (type) {
    case 'hero':       return { id, type, imageUrl: '', headline: '' };
    case 'text':       return { id, type, htmlContent: '' };
    case 'button':     return { id, type, label: 'Click here', url: '', backgroundColor: '#1a1a1a', textColor: '#ffffff' };
    case 'image':      return { id, type, imageUrl: '', altText: '' };
    case 'divider':    return { id, type };
    case 'twoColumn':  return { id, type, leftBlocks: [], rightBlocks: [] };
    case 'header':     return { id, type, text: '', level: 1, alignment: 'left' };
  }
}
