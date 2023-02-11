import { FC, useEffect, useRef } from "react";
import { JSONEditor, JSONEditorPropsOptional } from "svelte-jsoneditor/dist/jsoneditor.js";

import "../styles/json-editor.css";

const SvelteJSONEditor: FC<JSONEditorPropsOptional> = (props) => {
  const refContainer = useRef<Element | ShadowRoot | any>(null);
  const refEditor = useRef<JSONEditor | null>(null);

  useEffect(() => {
    // create editor
    if (!refContainer.current || refEditor.current) return;
    refEditor.current = new JSONEditor({
      target: refContainer.current,
      props,
    });

    return () => {
      // destroy editor
      if (refEditor.current) {
        refEditor.current.destroy();
        refEditor.current = null;
      }
    };
  }, [refContainer.current]);

  // update props
  useEffect(() => {
    if (refEditor.current) {
      refEditor.current.updateProps(props);
    }
  }, [props]);

  return <div className="svelte-jsoneditor-react" ref={refContainer} />;
};

export default SvelteJSONEditor;
