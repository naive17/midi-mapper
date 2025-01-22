import { WebMidi } from "webmidi";
import {damp} from './nodepdamp'

window.$midiInput = undefined;
window.$midi = undefined;

class MidiCallback {
  values = {};
  noteValues = {};

  targetValues = {};
  smoothTime = 0.05;
  setSmoothTime(t){
    this.smoothTime = t;
  }
  get(id){
    return this.values[id] || 0;
  }

  getNote(id){
    return this.noteValues[id] || 0;
  }
  constructor(){
    let prev = performance.now();
    let anim = ()=>{
      let delta = ( (performance.now() - prev) / 1000);
      prev = performance.now();
      Object.keys(this.targetValues).forEach((key)=>{
        damp(this.noteValues,key,this.targetValues[key],this.smoothTime,delta)
      })
      requestAnimationFrame(anim);  
    }
    requestAnimationFrame(anim);
  }
}
async function midi (){
  if (window.midi){
    return;
  }
  window.$midi = new MidiCallback();
  let style = document.createElement('style');
  style.innerHTML = `
  #midi_root {
    background :rgba(57, 57, 57, 0.84);
    position : fixed;
    top : 100px;
    right : 0px;
    display : flex;
    flex-flow : column;
    align-items : flex-end;
    width : 200px;
    font-family : monospace !important;
    padding : 8px;
    color : white !important;
  }
  #midi_root label{
    display : block;
    margin-bottom : 2px;
  }
  #midi_root select {
    margin : 5px 0px;
    background: transparent;
    width: 100%;
    margin-bottom: 8px;
    margin-top: 8px;
    font-family: monospace;
    color : white !important;
  }
  #midi_root .control{
    margin : 0px;
    border : 1px solid #00000007;
    width : 200px;
    display : flex;
    flex-flow : row;
    align-items : flex-start;
  }
  #midi_root .control p{
    margin : 0px;
    width : 100px;
  }
  #midi_root .control span{
    margin : 0px;
    width : 100px;
    font-family : monospace;
    opacity : 0.9;
    margin-left : 8px;
  }
  `
    await WebMidi.enable()
    let root = document.createElement('div');
    root.setAttribute('id','midi_root');
    let label = document.createElement('label');
    label.innerText = 'midi input'
    root.appendChild(label);
    let controlsRoot = document.createElement('div');
    controlsRoot.setAttribute('id','controls_root')
    setTimeout(()=>{
      document.body.appendChild(root);
    },100)
    root.appendChild(style)

    let inputs =   WebMidi.inputs;
    
    let select = document.createElement('select');
    root.appendChild(select);
    root.appendChild(controlsRoot)
    select.onchange = ()=>{
      let id = select.value;
      let input = WebMidi.getInputById(id);
      if (window.$midiInput){
        input.removeListener('controlchange');
        input.removeListener('noteon');
        input.removeListener('noteoff');

        controlsRoot.innerHTML = '';
      }
      window.$midiInput = input;
      
      let controllers = {};

      let controlFn = (e)=> {        
        if (e.subtype == undefined){
          e.isNote = true;
          e.subtype = 'note'+e.note.number;
        }
        if (controllers[e.subtype] == undefined){
          controllers[e.subtype] = document.createElement('div');
          controllers[e.subtype].classList.add('control')
          controllers[e.subtype].innerHTML = `
          <p>${e.subtype}:</p>
          <span>${e.value}</div>
          `
          controlsRoot.appendChild(controllers[e.subtype]);
          controllers[e.subtype]._span = controllers[e.subtype].querySelector('span');
        }
        controllers[e.subtype]._span.innerText = e.value;
        if (!e.isNote){
          window.$midi.values[e.subtype] = e.value;
        }else{
          if (window.$midi.noteValues[e.subtype] == undefined){
            window.$midi.noteValues[e.subtype] = 0;
          }
          window.$midi.targetValues[e.subtype] = e.value;
        }
      }
      input.addListener("controlchange", controlFn )
      input.addListener("noteon",controlFn)
      input.addListener("noteoff",controlFn)

    }
    inputs.map((v)=>{
      let dom = document.createElement('option');
      dom.innerText  = v.name;
      dom.setAttribute('value',v.id)
      select.appendChild(dom);
    })
    

    select.onchange();
}

midi();

