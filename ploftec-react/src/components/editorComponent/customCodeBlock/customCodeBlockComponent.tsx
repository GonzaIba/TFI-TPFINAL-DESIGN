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

  return (
    <NodeViewWrapper
      as="div"
      className="custom-code-block"
      style={{ position: 'relative', margin: '1rem 0' }}
    >
      <Paper
        elevation={2}
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          backgroundColor: '#2c2c2c',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: '4px 8px',
          borderRadius: '6px',
          zIndex: 1,
        }}
      >
        <Select
          size="small"
          variant="standard"
          value={language}
          onChange={handleLanguageChange}
          sx={{
            color: 'white',
            minWidth: 120,
            '& .MuiSelect-icon': { color: 'white' },
            '& .MuiInputBase-input': { padding: '4px' },
          }}
        >
          {LANGUAGES.map((lang) => (
            <MenuItem key={lang.value} value={lang.value}>
              {lang.label}
            </MenuItem>
          ))}
        </Select>
        <IconButton onClick={handleCopy} size="small" sx={{ color: 'white' }}>
          <ContentCopyIcon fontSize="small" />
        </IconButton>
        <IconButton onClick={deleteNode} size="small" sx={{ color: 'white' }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          position: 'relative',
        }}
      >
        {/* Números de línea */}
        <Box
          className="line-numbers"
          sx={{
            backgroundColor: '#1e1e1e',
            padding: '1rem 0.5rem',
            borderRight: '1px solid #333',
            color: '#999',
            fontFamily: 'Fira Code, monospace',
            fontSize: '0.9rem',
            textAlign: 'right',
            userSelect: 'none',
          }}
        >
          {node.textContent.split('\n').map((_: string, index: number) => (
            <div key={index}>{index + 1}</div>
          ))}

        </Box>

        {/* Código editable */}
        <pre
          style={{
            backgroundColor: '#1e1e1e',
            margin: 0,
            padding: '1rem',
            overflowX: 'auto',
          }}
        >
          <code>
            <NodeViewContent as="div" />
          </code>
        </pre>
      </Box>
    </NodeViewWrapper>
  )
}
