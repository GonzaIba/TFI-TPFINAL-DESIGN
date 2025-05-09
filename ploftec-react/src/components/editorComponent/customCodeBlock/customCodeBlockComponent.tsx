'use client'

import React, { useState } from 'react'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import {
  Box,
  Select,
  MenuItem,
  IconButton,
  Paper,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'

const LANGUAGES = [
  { label: 'Plaintext', value: 'plaintext' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'HTML', value: 'xml' },
  { label: 'C#', value: 'csharp' },
  { label: 'Python', value: 'python' },
]

export default function CustomCodeBlockComponent({ node, updateAttributes, deleteNode }: any) {
  const [language, setLanguage] = useState(node.attrs.language)

  const handleLanguageChange = (e: any) => {
    const newLang = e.target.value
    setLanguage(newLang)
    updateAttributes({ language: newLang })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(node.textContent)
  }

  const sharedLineStyle = {
    fontFamily: "'Fira Code', 'JetBrains Mono', 'Courier New', monospace",
    fontSize: '16px',
    lineHeight: '1.8', // Asegurate que coincida en ambos lados
  };
  

  return (
    <NodeViewWrapper
      as="div"
      className="custom-code-block"
      style={{ position: 'relative', margin: '1rem 0', borderRadius: '4px', overflow: 'hidden' }}
    >
      <Box
        className="code-block-toolbar"
        sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#292c33',
            padding: '6px 0 6px 0', // sin padding lateral, lo controlamos por grid
        }}
      >
        {/* Simulamos el ancho reservado para los números */}
        <Box sx={{ width: '30px' /* mismo ancho que .line-numbers */, flexShrink: 0 }} />

        {/* Toolbar real a la izquierda del código */}
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

            <Box sx={{ width: '1px', height: '24px', backgroundColor: '#444', marginX: '4px'}}/>
            <IconButton onClick={handleCopy} size="small" sx={{ color: 'white' }}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
            <Box sx={{ width: '1px', height: '24px', backgroundColor: '#444', marginX: '4px'}}/>
            <IconButton onClick={deleteNode} size="small" sx={{ color: 'white' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          position: 'relative',
          background: '#0d1117'
        }}
      >
        {/* Números de línea */}
        <Box
          className="line-numbers"
          sx={{
              //backgroundColor: '#1e1e1e',
              padding: '12px',
              borderRight: '1px solid #333',
              color: '#999',
              textAlign: 'right',
              userSelect: 'none',
              pointerEvents: 'none',
          }}
        >
          {node.textContent.split('\n').map((_: string, index: number) => (
            <div 
              key={index}
              style={{
                display: 'block',
              }}
            >
                {index + 1}
            </div>
          ))}

        </Box>

        {/* Código editable */}
        <pre
            style={{
              //backgroundColor: '#1e1e1e',
              background: '#0d1117',
              margin: 0,
              overflowX: 'auto',
            }}
        >
          <code style={{background: '#161B21'}}>
            <NodeViewContent as="div" />
          </code>
        </pre>
      </Box>
    </NodeViewWrapper>
  )
}
