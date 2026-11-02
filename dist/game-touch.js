(() => {
  'use strict';
  const frame=document.getElementById('frame');
  if(!frame)return;
  const element=node=>node?.nodeType===1?node:node?.parentElement;
  const editable=node=>Boolean(element(node)?.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])'));
  const protectedNode=node=>Boolean(node&&frame.contains(node)&&!editable(node));
  function gameplayTarget(node){
    if(!protectedNode(node))return false;
    const control=element(node)?.closest('button,a,input,textarea,select,[contenteditable]:not([contenteditable="false"])');
    // Bombs, like flaps, activate on pointerdown; other buttons still need their native click.
    return !control||control.id==='bomb';
  }
  function clearGameSelection(force=false){
    const selection=window.getSelection?.();
    if(!selection||!selection.rangeCount)return;
    const safeToClear=!editable(selection.anchorNode)&&!editable(selection.focusNode);
    // A collapsed caret can also display a native handle; clear it in the playfield.
    if(protectedNode(selection.anchorNode)||protectedNode(selection.focusNode)||force===true&&safeToClear)selection.removeAllRanges();
  }
  let gameplayTouchActive=false;
  function preventSelection(event){
    if(protectedNode(event.target)){event.preventDefault();clearGameSelection(true);}
  }
  function preventNativeGesture(event){
    const changed=Array.from(event.changedTouches||[]);
    const targets=changed.length?changed.map(touch=>touch.target):[event.target];
    const gameplay=targets.every(gameplayTarget);
    if(targets.some(gameplayTarget))gameplayTouchActive=true;
    clearGameSelection(gameplay||gameplayTouchActive);
    if(gameplay&&event.cancelable!==false)event.preventDefault();
  }
  for(const type of ['selectstart','contextmenu','dragstart'])frame.addEventListener(type,preventSelection,{capture:true});
  // Cancelling pointerdown alone does not cancel Android Chrome's native touch gesture.
  // Keep the existing per-pointer game actions and cancel only the browser's touch defaults.
  for(const type of ['touchstart','touchmove'])frame.addEventListener(type,preventNativeGesture,{capture:true,passive:false});
  frame.addEventListener('pointerdown',event=>clearGameSelection(gameplayTarget(event.target)),{capture:true,passive:true});
  function finishTouch(event){if(!gameplayTouchActive)return;clearGameSelection(true);if(!event.touches?.length)gameplayTouchActive=false;}
  for(const type of ['touchend','touchcancel'])document.addEventListener(type,finishTouch,{capture:true,passive:true});
  document.addEventListener('selectionchange',()=>clearGameSelection(gameplayTouchActive));
  clearGameSelection();
})();