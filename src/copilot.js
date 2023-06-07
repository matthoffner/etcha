import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers';

async function fetchCompletionFromEdge(code, config, controller, handleInsertion) {
    const handleMessage = (message) => {
        handleInsertion(message);
    };  
    const pipe = await pipeline('text-generation', 'Xenova/codegen-350M-mono');
    const text = await pipe(code)
    handleMessage(text);
}

const handleCompletion = async (
  editor,
  config,
  controller,
  cursorStyleLoading,
  cursorStyleNormal
) => {
  const currentPosition = editor.getPosition();
  if (!currentPosition) {
    return;
  }
  const currentLineNumber = currentPosition.lineNumber;
  const startLineNumber = !config.maxCodeLinesToOpenai
    ? 1
    : Math.max(1, currentLineNumber - config.maxCodeLinesToOpenai);
  const endLineNumber = currentLineNumber;
  const code = editor
    .getModel()
    .getLinesContent()
    .slice(startLineNumber - 1, endLineNumber)
    .join('\n');

  cursorStyleLoading();


  let lastText = ''
  const handleInsertion = (text) => {
    const position = editor.getPosition();
    if (!position) {
      return;
    }
    const offset = editor.getModel()?.getOffsetAt(position);
    if (!offset) {
      return;
    }

    const edits = [
      {
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        },
        text: text.slice(lastText.length),
      },
    ];

    lastText = text
    editor.executeEdits('', edits);
  };


  try {
    let newCode = '';
    if (config.customCompletionFunction) {
      newCode = await config.customCompletionFunction(code);
      handleInsertion(newCode);
    } else {
      await fetchCompletionFromEdge(code, config, controller, handleInsertion);
    }
    cursorStyleNormal();
  } catch (error) {
    cursorStyleNormal();
    console.error('MonacoEditorCopilot error:', error);
  }
};

export const MonacoEditorCopilot = (
  editor,
  config
) => {
  const mergedConfig = {
    ...defaultConfig,
    ...config
  };

  const cursorStyleLoading = () => {
    editor.updateOptions({ cursorStyle: mergedConfig.cursorStyleLoading });
  };

  const cursorStyleNormal = () => {
    editor.updateOptions({ cursorStyle: mergedConfig.cursorStyleNormal });
  };

  cursorStyleNormal();

  let controller = null;

  const cancel  = () => {
    if (controller) {
      controller.abort();
    }
    cursorStyleNormal();
  }

  const keyDownHandler =  editor.onKeyDown(cancel);
  const mouseDownHandler = editor.onMouseDown(cancel);

  let copilotAction = {
    id: 'copilot-completion',
    label: 'Trigger Copilot Completion',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB],
    contextMenuGroupId: 'navigation',
    contextMenuOrder: 1.5,
    run: async () => {
      controller = new AbortController();
      await handleCompletion(
        editor,
        mergedConfig,
        controller,
        cursorStyleLoading,
        cursorStyleNormal
      );
    },
  };

  editor.addAction(copilotAction);

  const dispose = () => {
    keyDownHandler.dispose();
    mouseDownHandler.dispose();
    if (copilotAction) {
      copilotAction.run = async () => {
        console.warn('Copilot functionality has been disabled');
      };
      copilotAction = null;
    }
  };

  return dispose;
};

export default MonacoEditorCopilot;