import Quill from 'quill';  

export const initializeQuill = (editorId: string) => {
    if (typeof window !== 'undefined') {
      const quill = new Quill(`#${editorId}`, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            [{ font: [] }],
            [{ size: ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            [{ script: 'super' }, { script: 'sub' }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ direction: 'rtl' }],
            [{ align: [] }],
            ['link', 'image', 'video'],
            ['blockquote', 'code-block'],
            ['clean'],
          ],
        },
      });
      (window as any).quillEditor = quill;
    }
  };
  
  export const getQuillContent = () => {
    const content = (window as any).quillEditor?.root?.innerHTML ?? '';
    return content.replace(/[\u2028\u2029]/g, '');
  };
  
  export const setQuillContent = (editorId: string, content: string) => {
    const editor = (window as any).quillEditor;
    if (editor) {
      editor.root.innerHTML = content;
    }
  };
  
  export const clearQuillContent = () => {
    const editor = (window as any).quillEditor;
    if (editor) {
      editor.setContents([]);
    }
  };
  
  export const enableEditor = (enabled: boolean) => {
    const editor = (window as any).quillEditor;
    const toolbar = document.querySelector('.ql-toolbar') as HTMLElement;
    if (editor) {
      editor.enable(enabled);
      if (toolbar) toolbar.style.display = enabled ? 'block' : 'none';
    }
  };
  