'use client';

import React, { useState } from 'react';
import { startTransition, useDeferredValue } from 'react';
// Kit base
import RichTextEditor, { BaseKit, useEditorState } from 'reactjs-tiptap-editor';
// Formato de texto
import { Document } from 'reactjs-tiptap-editor/document'; 
import { Bold } from 'reactjs-tiptap-editor/bold';
import { Italic } from 'reactjs-tiptap-editor/italic';
import { Strike } from 'reactjs-tiptap-editor/strike';
import { Highlight } from 'reactjs-tiptap-editor/highlight';
import { Code } from 'reactjs-tiptap-editor/code';
import { SubAndSuperScript } from 'reactjs-tiptap-editor/subandsuperscript';
// Estructura y bloques
import { Heading } from 'reactjs-tiptap-editor/heading';
import { Blockquote } from 'reactjs-tiptap-editor/blockquote';
import { HorizontalRule } from 'reactjs-tiptap-editor/horizontalrule';
import { CodeBlock } from 'reactjs-tiptap-editor/codeblock';
import { Table } from 'reactjs-tiptap-editor/table';
import { TaskList } from 'reactjs-tiptap-editor/tasklist';
import { MultiColumn } from 'reactjs-tiptap-editor/multicolumn';
import { Iframe } from 'reactjs-tiptap-editor/iframe';
// Listas
import { BulletList } from 'reactjs-tiptap-editor/bulletlist';
import { OrderedList } from 'reactjs-tiptap-editor/orderedlist';
import { ListItem } from 'reactjs-tiptap-editor/listitem';
import { Indent } from 'reactjs-tiptap-editor/indent';
// Medios e incrustaciones
import { Image } from 'reactjs-tiptap-editor/image';
import { ImageGif } from 'reactjs-tiptap-editor/imagegif';
import { Video } from 'reactjs-tiptap-editor/video';
import { Mermaid } from 'reactjs-tiptap-editor/mermaid';
import { Excalidraw } from 'reactjs-tiptap-editor/excalidraw';
import { Attachment } from 'reactjs-tiptap-editor/attachment';
// Funcionalidades avanzadas
import { Link } from 'reactjs-tiptap-editor/link';
import { FontFamily } from 'reactjs-tiptap-editor/fontfamily';
import { FontSize } from 'reactjs-tiptap-editor/fontsize';
import { LineHeight } from 'reactjs-tiptap-editor/lineheight';
import { Color } from 'reactjs-tiptap-editor/color';
import { TextAlign } from 'reactjs-tiptap-editor/textalign';
import { TextDirection } from 'reactjs-tiptap-editor/textdirection';
import { FormatPainter } from 'reactjs-tiptap-editor/formatpainter';
import { TextBubble } from 'reactjs-tiptap-editor/textbubble';
import { MoreMark } from 'reactjs-tiptap-editor/moremark';
import { TrailingNode } from 'reactjs-tiptap-editor/trailingnode';
import { SlashCommand } from 'reactjs-tiptap-editor/slashcommand';
import { Selection } from 'reactjs-tiptap-editor/selection';
import { Clear } from 'reactjs-tiptap-editor/clear';
import { History } from 'reactjs-tiptap-editor/history';
// Importación y exportación
// import { ImportWord } from 'reactjs-tiptap-editor/importword';
// import { ExportWord } from 'reactjs-tiptap-editor/exportword';
import { ExportPdf } from 'reactjs-tiptap-editor/exportpdf';
// Otros
import { Emoji } from 'reactjs-tiptap-editor/emoji';
import { Mention } from 'reactjs-tiptap-editor/mention';
import { BubbleMenuMermaid } from 'reactjs-tiptap-editor/bubble-extra'; 
import 'react-image-crop/dist/ReactCrop.css';
import 'reactjs-tiptap-editor/style.css';

import 'prism-code-editor-lightweight/layout.css'; 
import 'prism-code-editor-lightweight/themes/github-dark.css'; 

import { SkeletonEditorComment } from '@/components'
import Button from '@/components/buttonComponent/button'

type Props = {
  onComment: (content: string) => void;
};

const EditorInput = ({ onComment } : Props) => {
  const { isReady, editor, editorRef } = useEditorState();
  console.log('EditorInput isReady:', isReady);
  const [content, setContent] = useState<string | null>('<p>Inserte aquí su respuesta...</p>');

  console.log('EditorInput content:');

  const extensions = React.useMemo(() => [
    BaseKit.configure({
      placeholder: { showOnlyCurrent: true },
      characterCount: { limit: 15000 },
    }),
    Blockquote,
    Bold,
    BulletList,
    Clear,
    Code,
    CodeBlock,
    Color,
    //Document,
    FontFamily,
    FontSize,
    FormatPainter,
    Heading,
    Highlight,
    History,
    HorizontalRule,
    Iframe,
    Indent,
    Italic,
    LineHeight,
    Link,
    //ListItem,
    MoreMark,
    //MultiColumn,
    OrderedList,
    //Selection,
    SlashCommand,
    Strike,
    //SubAndSuperScript,
    Table,
    TaskList,
    TextAlign,
    //TextBubble,
    //TrailingNode,
    Emoji,
    ExportPdf,
    //ImportWord,
    //ExportWord,
    Excalidraw,
    TextDirection,
    Mention,
    Attachment,
    Mermaid,
    Image.configure({
    upload: (files: File) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(URL.createObjectURL(files))
        }, 500)
      })
    },
    }),
    Video.configure({
      upload: (files: File) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(URL.createObjectURL(files))
          }, 500)
        })
      },
    }),
    ImageGif.configure({
      GIPHY_API_KEY: 'IJFC58HZ81gUGKjF8So27uXSkTw8VRpE', 
    }),
  ], []);

  /** ① Diferimos el HTML que llega al editor */
  const deferredContent = useDeferredValue(content);

  return (
    <>
      <div className="tiptap-wrapper">
        <RichTextEditor
          output="html"
          ref={editorRef}
          content={deferredContent ?? ''}
          /** ② Actualizamos el estado en baja prioridad */
          onChangeContent={(html) =>
            startTransition(() => {
              setContent(html);
            })
          }
          extensions={extensions}
          useEditorOptions={{immediatelyRender: false}}
          minHeight={900}
          dark
          // Puedes personalizar otras propiedades según tus necesidades
          // bubbleMenu={{
          //   render({ extensionsNames, editor, disabled }, bubbleDefaultDom) {
          //     return <>
          //     {bubbleDefaultDom}

          //     {extensionsNames.includes('mermaid')  ? <BubbleMenuMermaid disabled={disabled}
          //       editor={editor}
          //       key="mermaid"
          //     /> : null}
          //     </>
          //   },
          // }}
        />
        {!isReady && <SkeletonEditorComment isInEditorComponent={true} />}
      </div>
      {isReady && <Button text='Comentar' onClick={() => onComment(content ?? '')} width='100%' />}
    </>
  );
}

export default React.memo(EditorInput);