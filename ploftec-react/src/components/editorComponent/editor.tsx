'use client'

import React, { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'

import { common, createLowlight } from 'lowlight'
import javascript from 'highlight.js/lib/languages/javascript'
import bash from 'highlight.js/lib/languages/bash'
import xml from 'highlight.js/lib/languages/xml'
import python from 'highlight.js/lib/languages/python'
import csharp from 'highlight.js/lib/languages/csharp'
import 'highlight.js/styles/atom-one-dark.css'

import './editor.css'
import InsertCodeBlock from './customCodeBlock/customCodeBlockComponent'
import CustomCodeBlock from './customCodeBlock/customCodeBlock'

type Props = {
  onContentChange?: (content: string) => void;
}

export default function Editor({ onContentChange }: Props) {
  const [showInsertCode, setShowInsertCode] = useState(false)

  const lowlight = createLowlight(common)
  lowlight.register('javascript', javascript)
  lowlight.register('bash', bash)
  lowlight.register('html', xml)
  lowlight.register('python', python)
  lowlight.register('csharp', csharp)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CustomCodeBlock,
      Underline,
      Highlight,
      Link.configure({ openOnClick: false }),
      Image,
      CodeBlockLowlight.configure({ lowlight }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '<p>Inserte aquí su respuesta...</p>',
    onCreate({ editor }) {
      setTimeout(() => {
        editor.view.dom.querySelectorAll('div, pre, code').forEach((el) => {
          el.setAttribute('spellcheck', 'false');
        });
      }, 0);
    },
    onUpdate({ editor }) {
      requestAnimationFrame(() => {
        const codeBlocks = editor.view.dom.querySelectorAll('code, code *');
        codeBlocks.forEach((el) => {
          el.setAttribute('spellcheck', 'false');
        });
      });
    },
  })

  if (!editor) return null

  return (
    <div className="tiptap-wrapper">
      <div className="toolbar">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''}>Bold</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''}>Italic</button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'active' : ''}>Underline</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'active' : ''}>• List</button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'active' : ''}>1. List</button>
        <button
          onClick={() => {
            editor.chain().focus().insertContent({
              type: 'customCodeBlock',
              attrs: { language: 'plaintext' },
              content: [{ type: 'text', text: ' ' }], // <-- espacio mínimo válido
            }).run()
          }}
          className={editor.isActive('customCodeBlock') ? 'active' : ''}
        >
          Code
        </button>
        {/* <button onClick={() => setShowInsertCode(true)}>Insert Code</button> */}
        <button onClick={() => {
          const url = prompt('Enter URL')
          if (url) editor.chain().focus().setLink({ href: url }).run()
        }}>Link</button>
        <button onClick={() => {
          const url = prompt('Enter image URL')
          if (url) editor.chain().focus().setImage({ src: url }).run()
        }}>Image</button>
      </div>

      <EditorContent editor={editor} className='editor-container'/>
    </div>
  )
}
