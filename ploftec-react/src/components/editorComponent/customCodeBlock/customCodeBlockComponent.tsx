'use client'

import React, { useState, useEffect, useRef } from 'react'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { Box, Select, MenuItem, IconButton } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'

import { createLowlight, common } from 'lowlight'
import javascript from 'highlight.js/lib/languages/javascript'
import bash from 'highlight.js/lib/languages/bash'
import xml from 'highlight.js/lib/languages/xml'
import python from 'highlight.js/lib/languages/python'
import csharp from 'highlight.js/lib/languages/csharp'
import 'highlight.js/styles/atom-one-dark.css'
import { TextSelection } from 'prosemirror-state'

const LANGUAGES = [
  { label: 'Plaintext', value: 'plaintext' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'HTML', value: 'xml' },
  { label: 'C#', value: 'csharp' },
  { label: 'Python', value: 'python' },
]

const lowlight = createLowlight(common)
lowlight.register('javascript', javascript)
lowlight.register('bash', bash)
lowlight.register('html', xml)
lowlight.register('python', python)
lowlight.register('csharp', csharp)

export default function CustomCodeBlockComponent({ node, updateAttributes, deleteNode, editor }: any) {
  const [language, setLanguage] = useState(node.attrs.language)
  const [indent, setIndent] = useState('4') // valor por defecto
  const wrapperRef = useRef<HTMLDivElement>(null)

  const highlighted = lowlight.highlight(language, node.textContent).children

  const renderLowlightNode = (node: any, key: number): any => {
    if (node.type === 'text') return <span key={key} spellCheck={false}>{node.value}</span>
    if (node.type === 'element') {
      return (
        <span key={key} className={node.properties?.className?.join(' ')} spellCheck={false}>
          {node.children?.map((child: any, i: number) => renderLowlightNode(child, i))}
        </span>
      )
    }
    return <span key={key} />
  }

  const handleLanguageChange = (e: any) => {
    const newLang = e.target.value
    setLanguage(newLang)
    updateAttributes({ language: newLang })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(node.textContent)
  }

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
      const view = editor?.view
      const state = editor?.state

      if (!view || !state) return

      const pos = view.posAtDOM(wrapperRef.current, 0)
      const insertPos = pos + node.nodeSize

      // Validar si ya hay un párrafo después, y si no, lo insertamos
      const nextNode = state.doc.nodeAt(insertPos)
      if (!nextNode || nextNode.type.name !== 'paragraph') {
        editor
          .chain()
          .focus()
          .insertContentAt(insertPos, {
            type: 'paragraph',
            content: [{ type: 'text', text: '' }],
          })
          .run()
      }

      // Forzamos selección dentro del párrafo (posición editable)
      const resolvedPos = view.state.doc.resolve(insertPos + 1)
      const tr = view.state.tr.setSelection(TextSelection.create(view.state.doc, resolvedPos.pos))
      view.dispatch(tr)
      view.focus()
    }
  }

  document.addEventListener('mousedown', handleClickOutside)
  return () => {
    document.removeEventListener('mousedown', handleClickOutside)
  }
}, [editor, node])

  return (
    <NodeViewWrapper
      as="div"
      className="custom-code-block"
      style={{ position: 'relative', margin: '1rem 0', borderRadius: '4px', overflow: 'hidden' }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#292c33',
          padding: '6px 0',
        }}
      >
        <Box sx={{ width: '45px', flexShrink: 0 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Select
            size="small"
            variant="standard"
            value={language}
            onChange={handleLanguageChange}
            sx={{
              color: 'white',
              fontSize: '0.9rem',
              '&::before': { borderBottom: 'none' },
              '& svg': { color: 'white' },
              minWidth: '100px',
            }}
          >
            {LANGUAGES.map((lang) => (
              <MenuItem key={lang.value} value={lang.value}>
                {lang.label}
              </MenuItem>
            ))}
          </Select>

          <Box sx={{ width: '1px', height: '24px', backgroundColor: '#444', marginX: '4px' }} />
          <IconButton onClick={handleCopy} size="small" sx={{ color: 'white' }}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
          
          <Box sx={{ width: '1px', height: '24px', backgroundColor: '#444', marginX: '4px' }} />
          <Select
            size="small"
            variant="standard"
            value={indent}
            onChange={(e) => setIndent((e.target.value))}
            sx={{
              color: 'white',
              fontSize: '0.9rem',
              '&::before': { borderBottom: 'none' },
              '& svg': { color: 'white' },
              minWidth: '60px',
            }}
          >
            {[2, 4, 8].map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>

          <Box sx={{ width: '1px', height: '24px', backgroundColor: '#444', marginX: '4px' }} />
          <IconButton onClick={deleteNode} size="small" sx={{ color: 'white' }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Code block + line numbers */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', background: '#0d1117', position: 'relative' }}>
        {/* Line numbers */}
        <Box
          sx={{
            padding: '12px',
            borderRight: '1px solid #333',
            color: '#999',
            textAlign: 'right',
            userSelect: 'none',
            pointerEvents: 'none',
            fontFamily: "'Fira Code', monospace",
            fontSize: '16px',
            //lineHeight: '1.8',
          }}
        >
          {node.textContent.split('\n').map((_: string, i: number) => (
            <div key={i}>{i + 1}</div>
          ))}
        </Box>

        {/* Code container */}
        <Box sx={{ position: 'relative' }}>
          {/* Highlight layer */}
          <Box
            className="hljs highlight-layer"
            aria-hidden
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              padding: '12px',
              zIndex: 37,
              pointerEvents: 'none',
              userSelect: 'none',
              whiteSpace: 'pre-wrap',
              fontFamily: "'Fira Code', monospace",
              fontSize: '16px',
              //lineHeight: '1.8',
              color: '#fff',
              overflowWrap: 'break-word',
            }}
          >
            {highlighted.map((node, i) => renderLowlightNode(node, i))}
          </Box>

          {/* Editable layer */}
          <pre
            style={{
              margin: 0,
              padding: '12px',
              background: '#161B21',
              whiteSpace: 'pre-wrap',
              fontFamily: "'Fira Code', monospace",
              fontSize: '16px',
              //lineHeight: '1.8',
              color: 'transparent',
              caretColor: 'white',
            }}
          >
            <code
              style={{
                zIndex: 38,
                position: 'relative',
                // '--indent-size': `${parseInt(indent) * 10}px`,
              } as React.CSSProperties}
            >              
              <NodeViewContent as="div" spellCheck={false} ref={wrapperRef} />
            </code>
          </pre>
        </Box>
      </Box>
    </NodeViewWrapper>
  )
}
