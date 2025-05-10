// src/extensions/CustomCodeBlock.ts
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import CustomCodeBlockComponent from './customCodeBlockComponent';

const CustomCodeBlock = Node.create({
  name: 'customCodeBlock',
  group: 'block',
  content: 'text*',
  code: true,
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      language: {
        default: 'typescript',
      },
    }
  },

  parseHTML() {
    return [{ tag: 'pre[data-type="custom-code-block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'pre',
      mergeAttributes(HTMLAttributes, { 'data-type': 'custom-code-block' }),
      ['code', 0],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CustomCodeBlockComponent)
  },
})

export default CustomCodeBlock
