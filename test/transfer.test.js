import {test} from 'node:test';
import assert from 'node:assert/strict';
import {exportCard,inspectCardImport,TRANSFER_LIMIT} from '../src/transfer.js';
const sample={type:'custom:ve-builder-card',title:'My <car>',language:'de',alerts:{enabled:true},blocks:[{id:'start',type:'start',title:'Overview',image:'/local/car.png',power_entity:'sensor.charge',fields:[{id:'battery',entity:'sensor.battery',colors:{enabled:true,warning:30}}]},{id:'tyres',type:'tyres',positions:{front_left:'sensor.tyre'},gear_entity:'sensor.gear',body_parts:{trunk:{entity:'cover.boot',open_value:'open'}},freshness:{timestamp_entity:'sensor.updated'},pressure_advice:{temperature_entity:'sensor.outside'}},{id:'costs',type:'expenses',prices:[{id:'price',entity:'sensor.price'}],groups:[{id:'group',name:'Savings',fields:[{id:'saving',entity:'sensor.saving'}]}]}]};
test('complete export/import retains settings and reports missing references without live values',()=>{
 const source=structuredClone(sample),output=exportCard(source),parsed=inspectCardImport(output,{'sensor.battery':{state:'48'}});
 assert.deepEqual(source,sample);assert.equal(parsed.config.title,'My <car>');assert.equal(parsed.config.language,'de');assert.equal(parsed.blocks,3);assert.equal(parsed.fields,3);assert.equal(parsed.entities.length,9);assert.equal(parsed.missing.length,8);assert.ok(!parsed.missing.includes('sensor.battery'));
 assert.equal(parsed.config.blocks[0].image,'/local/car.png');assert.deepEqual(parsed.config.blocks[0].fields[0].colors,sample.blocks[0].fields[0].colors);assert.doesNotMatch(output,/"state"/);
 const second=inspectCardImport(output);assert.notEqual(parsed.config.blocks[0].id,sample.blocks[0].id);assert.notEqual(parsed.config.blocks[0].id,second.config.blocks[0].id);assert.notEqual(parsed.config.blocks[2].groups[0].fields[0].id,sample.blocks[2].groups[0].fields[0].id);
});
test('shareable layout clears references in every supported location without mutating original',()=>{
 const result=inspectCardImport(exportCard(sample,{includeEntities:false}));assert.deepEqual(result.entities,[]);assert.equal(sample.blocks[0].power_entity,'sensor.charge');assert.equal(result.config.blocks[1].positions.front_left,'');assert.equal(result.config.blocks[1].pressure_advice.temperature_entity,'');assert.equal(result.config.blocks[1].body_parts.trunk.entity,'');assert.equal(result.config.blocks[0].image,'/local/car.png');
});
test('invalid imports fail before applying anything, including future formats and malformed nested data',()=>{
 for(const data of [null,[],{}, {type:'custom:other',blocks:[]},{format:'other',schema_version:1,card:sample},{format:'ve-builder-card',schema_version:2,card:sample},{...sample,version:99},{blocks:[null]},{blocks:[{type:'fields',fields:{}}]},{blocks:[{type:'fields',fields:[{entity:42}]}]},{blocks:[{type:'tyres',positions:{front_left:42}}]},{blocks:[{type:'tyres',body_parts:{trunk:'cover.a'}}]},{blocks:[{type:'unknown'}]}])assert.throws(()=>inspectCardImport(JSON.stringify(data)));
 assert.throws(()=>inspectCardImport('not JSON'));assert.throws(()=>inspectCardImport(' '.repeat(TRANSFER_LIMIT+1)));assert.throws(()=>inspectCardImport('{"blocks":[],"__proto__":{"polluted":true}}'));assert.equal({}.polluted,undefined);
});
test('raw card JSON and empty cards import, unknown entity IDs remain assignable',()=>{
 assert.equal(inspectCardImport(JSON.stringify(sample)).config.blocks[0].fields[0].entity,'sensor.battery');assert.equal(inspectCardImport('{"type":"custom:ve-builder-card","blocks":[]}').blocks,0);
});

test('import limits count UTF-8 bytes and bound nesting and section count',()=>{
 assert.throws(()=>inspectCardImport(JSON.stringify({title:'🚗'.repeat(TRANSFER_LIMIT/3),blocks:[]})),/512 KB/);
 assert.throws(()=>inspectCardImport(JSON.stringify({blocks:Array.from({length:101},()=>({type:'fields'}))})),/100/);
 const data={blocks:[]};let cursor=data;for(let i=0;i<33;i++){cursor.child={};cursor=cursor.child;}assert.throws(()=>inspectCardImport(JSON.stringify(data)),/niveles/);
});
