import {test} from 'node:test';
import assert from 'node:assert/strict';
globalThis.HTMLElement=class {};
globalThis.customElements={get:()=>true,define:()=>{}};
const {VEBuilderEditor}=await import('../src/editor.js');
test('editor does not rebuild when Home Assistant echoes the emitted config',()=>{const editor=new VEBuilderEditor();let renders=0;editor.render=()=>renders++;editor.setConfig({blocks:[{id:'start',type:'start',fields:[]}]});assert.equal(renders,1);editor.setConfig(structuredClone(editor.config));assert.equal(renders,1);});
test('a genuine external config change is rendered',()=>{const editor=new VEBuilderEditor();let renders=0;editor.render=()=>renders++;editor.setConfig({blocks:[],title:'A'});editor.setConfig({...structuredClone(editor.config),title:'B'});assert.equal(renders,2);assert.equal(editor.config.title,'B');});

test('templates preserve configured blocks and replace only the empty starter',()=>{
 const editor=new VEBuilderEditor();editor.render=()=>{};editor.emit=()=>{};
 editor.setConfig({title:'My car',blocks:[{id:'existing',type:'fields',fields:[{id:'sensor',entity:'sensor.existing'}]}]});
 editor.addTemplate('electric');assert.equal(editor.config.title,'My car');assert.equal(editor.config.blocks[0].fields[0].entity,'sensor.existing');assert.equal(editor.config.blocks.length,6);
 editor.setConfig({blocks:[{id:'empty',type:'start',fields:[]}]});editor.addTemplate('combustion');assert.equal(editor.config.blocks.length,1);assert.equal(editor.config.blocks[0].fields.length,4);
});
