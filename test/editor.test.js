import {test} from 'node:test';
import assert from 'node:assert/strict';
globalThis.HTMLElement=class {};
globalThis.customElements={get:()=>true,define:()=>{}};
const {VEBuilderEditor}=await import('../src/editor.js');
test('editor does not rebuild when Home Assistant echoes the emitted config',()=>{const editor=new VEBuilderEditor();let renders=0;editor.render=()=>renders++;editor.setConfig({blocks:[{id:'start',type:'start',fields:[]}]});assert.equal(renders,1);editor.setConfig(structuredClone(editor.config));assert.equal(renders,1);});
test('a genuine external config change is rendered',()=>{const editor=new VEBuilderEditor();let renders=0;editor.render=()=>renders++;editor.setConfig({blocks:[],title:'A'});editor.setConfig({...structuredClone(editor.config),title:'B'});assert.equal(renders,2);assert.equal(editor.config.title,'B');});
