'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'

import {common, createLowlight} from 'lowlight'
import javascript from 'highlight.js/lib/languages/javascript'
import bash from 'highlight.js/lib/languages/bash'
import xml from 'highlight.js/lib/languages/xml'
import python from 'highlight.js/lib/languages/python'
import './editor.css'

type Props = {
  onContentChange?: (content: string) => void;
}

export default function Editor({ onContentChange }: Props) {

  const lowlight = createLowlight(common)
  // Registramos los lenguajes
  lowlight.register('javascript', javascript)
  lowlight.register('bash', bash)
  lowlight.register('html', xml)
  lowlight.register('python', python)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Highlight,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '<p>Inserte aquí su respuesta...</p>',
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getHTML())
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
        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'active' : ''}>Code</button>
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
