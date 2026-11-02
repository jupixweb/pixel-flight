(() => {
  'use strict';
  const frame=document.getElementById('frame');
  if(!frame)return;
  const element=node=>node?.nodeType===1?node:node?.parentElement;
  const editable=node=>Boolean(element(node)?.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])'));
  const protectedNode=node=>Boolean(node&&frame.contains(node)&&!editable(node));
  function preventSelection(event){if(protectedNode(event.target))event.preventDefault();}
  function clearGameSelection(){
    const selection=window.getSelection?.();
    if(!selection||selection.isCollapsed||!selection.rangeCount)return;
    if(protectedNode(selection.anchorNode)||protectedNode(selection.focusNode))selection.removeAllRanges();
  }
  // Native selection can still be started by some mobile browsers despite user-select:none.
  for(const type of ['selectstart','contextmenu','dragstart'])frame.addEventListener(type,preventSelection,{capture:true});
  // Observe contact without cancelling it: simultaneous flap/bomb pointers must remain independent.
  frame.addEventListener('pointerdown',clearGameSelection,{capture:true,passive:true});
  document.addEventListener('selectionchange',clearGameSelection);
  clearGameSelection();
})();