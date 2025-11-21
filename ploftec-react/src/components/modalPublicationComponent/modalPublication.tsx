import { useEffect, useRef, useState } from 'react';
import Button from '@/components/buttonComponent/button';
import styles from './modalPublicationForm.module.css';
import { initializeQuill, enableEditor, getQuillContent } from '@/lib/utils/quill';
import clsx from 'clsx';

interface ModalPublicationFormProps {
  show: boolean;
  onClose: () => Promise<void>;
  onSave: (html: string) => void;
  isEditable?: boolean;
}

export default function ModalPublication({
  show,
  onClose,
  onSave,
  isEditable = true,
}: ModalPublicationFormProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorLoaded, setEditorLoaded] = useState(false);

  useEffect(() => {
    if (show && !editorLoaded) {
      const script = document.createElement('script');
      script.src = 'https://cdn.quilljs.com/1.3.6/quill.min.js';
      script.onload = () => {
        initializeQuill('quill-editor');
        enableEditor(isEditable);
        setEditorLoaded(true);
      };
      document.body.appendChild(script);
    }
  }, [show, editorLoaded, isEditable]);

  const handleSave = async () => {
    const content = getQuillContent();
    onSave(content);
  };

  return (
    <div className={clsx(styles.modalOverlay, show && styles.show)}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Crear publicación</h3>
          <button className={styles.closeButton} onClick={onClose}>
            &#10006;
          </button>
        </div>

        <div className={`${styles.modalBody} ${styles.preview}`}>
          <div id="quill-editor" ref={editorRef} className="ql-editor" style={{ height: '100%' }} />
        </div>

        <div className={styles.modalActions}>
          <Button onClick={handleSave} text="Guardar" />
          <Button onClick={onClose} text="Cancelar" />
        </div>
      </div>
    </div>
  );
}
