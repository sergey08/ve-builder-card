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

test('reordering works in both directions and preserves field and group data',()=>{
 const editor=new VEBuilderEditor();let emitted=0;editor.emit=()=>emitted++;editor.render=()=>{};
 const items=[{id:'a',entity:'sensor.first'},{id:'b',fields:[{entity:'sensor.second'}]},{id:'c'}];
 assert.equal(editor.moveItem(items,'a',2),true);assert.deepEqual(items.map(x=>x.id),['b','c','a']);assert.equal(items[2].entity,'sensor.first');
 assert.equal(editor.moveItem(items,'a',0),true);assert.deepEqual(items.map(x=>x.id),['a','b','c']);assert.equal(items[1].fields[0].entity,'sensor.second');
 for(const [id,index]of [['missing',1],['a',-1],['a',3],['a',0]])assert.equal(editor.moveItem(items,id,index),false);
 assert.equal(emitted,2);
});
test('undo and redo retain complete configuration and reset redo after a new edit',()=>{
 const editor=new VEBuilderEditor();editor.render=()=>{};editor.updateHistoryButtons=()=>{};editor.emit=()=>editor.recordHistory();
 editor.setConfig({title:'A',blocks:[{id:'one',type:'fields',fields:[]}]});
 editor.config.title='B';editor.emit();editor.config.blocks=[];editor.emit();
 editor.travelHistory('undo');assert.equal(editor.config.blocks.length,1);assert.equal(editor.config.title,'B');
 editor.travelHistory('undo');assert.equal(editor.config.title,'A');
 editor.travelHistory('redo');assert.equal(editor.config.title,'B');
 editor.config.title='C';editor.emit();assert.equal(editor.future.length,0);
 editor.setConfig(structuredClone(editor.config));assert.equal(editor.history.length,2);
});
test('device filter intersects device entities with permitted domains',()=>{
 const editor=new VEBuilderEditor();editor.entityRegistry=[{entity_id:'sensor.a',device_id:'car'},{entity_id:'switch.a',device_id:'car'},{entity_id:'sensor.b',device_id:'house'}];
 assert.deepEqual(editor.entitySchema('entity','sensor','car').selector.entity.include_entities,['sensor.a']);
 assert.deepEqual(editor.entitySchema('entity',undefined,'car').selector.entity.include_entities,['sensor.a','switch.a']);
 assert.equal(editor.entitySchema('entity','sensor','').selector.entity.include_entities,undefined);
});

test('sections copy across editor instances with independent nested objects and unique IDs',()=>{
 const source=new VEBuilderEditor(),target=new VEBuilderEditor();for(const e of [source,target]){e.render=()=>{};e.emit=()=>e.recordHistory();e.updateHistoryButtons=()=>{};e.setConfig({blocks:[]});}
 const original={id:'block',type:'expenses',title:'Costs',prices:[{id:'price',entity:'sensor.price',colors:{enabled:true,warning:30}}],groups:[{id:'group',name:'Savings',fields:[{id:'value',entity:'sensor.savings'}]}]};
 source.copySection(original);assert.equal(target.pasteSection(),true);const copy=target.config.blocks[0];assert.equal(copy.title,'Costs');assert.equal(copy.prices[0].entity,'sensor.price');
 for(const [a,b]of [[copy,original],[copy.prices[0],original.prices[0]],[copy.groups[0],original.groups[0]],[copy.groups[0].fields[0],original.groups[0].fields[0]]])assert.notEqual(a.id,b.id);
 copy.prices[0].colors.warning=999;assert.equal(original.prices[0].colors.warning,30);target.pasteSection();assert.equal(target.config.blocks[1].prices[0].colors.warning,30);assert.notEqual(copy.id,target.config.blocks[1].id);
 target.travelHistory('undo');assert.equal(target.config.blocks.length,1);target.travelHistory('redo');assert.equal(target.config.blocks.length,2);
});

test('whole-card import previews before mutation, supports append/replace and undo, and invalidates changed text',async()=>{
 const {exportCard}=await import('../src/transfer.js');
 const e=new VEBuilderEditor();e.render=()=>{};e.updateHistoryButtons=()=>{};e.emit=()=>e.recordHistory();e.setConfig({title:'Existing',language:'en',blocks:[{id:'old',type:'fields',fields:[]}]});
 const before=structuredClone(e.config);e.importText=exportCard({title:'Imported',language:'fr',blocks:[{id:'new',type:'fields',fields:[{id:'one',entity:'sensor.missing'}]}]});e.previewImport();assert.deepEqual(e.config,before);assert.equal(e.importPreview.missing.length,1);
 assert.equal(e.applyImport('append'),true);assert.equal(e.config.title,'Existing');assert.equal(e.config.blocks.length,2);e.travelHistory('undo');assert.deepEqual(e.config,before);e.travelHistory('redo');assert.equal(e.config.blocks.length,2);
 e.importText=exportCard({title:'Replacement',blocks:[]});e.previewImport();assert.equal(e.applyImport('replace'),true);assert.equal(e.config.title,'Replacement');e.travelHistory('undo');assert.equal(e.config.title,'Existing');assert.equal(e.config.blocks.length,2);
 e.importText=exportCard({title:'Valid',blocks:[]});e.previewImport();e.importText='invalid';const safe=structuredClone(e.config);assert.equal(e.applyImport('replace'),false);assert.deepEqual(e.config,safe);assert.equal(e.importPreview,null);
});
