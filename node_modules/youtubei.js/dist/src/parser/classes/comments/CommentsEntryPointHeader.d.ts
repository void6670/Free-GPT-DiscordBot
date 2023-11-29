import Text from '../misc/Text.js';
import Thumbnail from '../misc/Thumbnail.js';
import { YTNode } from '../../helpers.js';
import type { RawNode } from '../../index.js';
import CommentsEntryPointTeaser from './CommentsEntryPointTeaser.js';
export default class CommentsEntryPointHeader extends YTNode {
    static type: string;
    header?: Text;
    comment_count?: Text;
    teaser_avatar?: Thumbnail[];
    teaser_content?: Text;
    content_renderer?: CommentsEntryPointTeaser | null;
    simplebox_placeholder?: Text;
    constructor(data: RawNode);
}
