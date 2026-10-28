import {test} from 'node:test';
import assert from 'node:assert/strict';
import {vehicleStatus,newVehicleStatus} from '../src/vehicle-status.js';
import {normalize} from '../src/core.js';
import {exportCard,inspectCardImport} from '../src/transfer.js';

test('lock, binary doors and cover windows use independent default mappings',()=>{
 for(const [kind,entity,normal,attention]of [['lock','lock.car','locked','unlocked'],['lock','binary_sensor.lock','off','on'],['doors','binary_sensor.doors','off','on'],['windows','cover.windows','closed','open']]){
  const item={...newVehicleStatus(kind),entity};
  assert.equal(vehicleStatus(item,{[entity]:{state:normal}},'en').level,'normal');
  assert.equal(vehicleStatus(item,{[entity]:{state:attention}},'en').level,'attention');
 }
 assert.equal(vehicleStatus({kind:'windows',entity:'cover.windows'},{'cover.windows':{state:'closed'}},'en').label,'Windows closed');
});
test('unknown, unavailable, missing and unrecognised readings never imply closed',()=>{
 const item={kind:'doors',entity:'sensor.doors'};
 for(const state of [undefined,null,'unknown','unavailable','none','','partially_open','closing']){
  const result=vehicleStatus(item,{'sensor.doors':{state}},'en');assert.equal(result.level,'unknown');assert.equal(result.label,'No data');
 }
 assert.equal(vehicleStatus(item,{},'en').level,'unknown');
});
test('custom labels, states and icons remain user-defined and equal states stay unknown',()=>{
 const item={kind:'windows',entity:'sensor.windows',name:'Rear',normal_value:'sealed',attention_value:'ajar',normal_text:'All shut',attention_text:'Check windows',icon:'mdi:window-open'};
 const result=vehicleStatus(item,{'sensor.windows':{state:'ajar'}},'fr');assert.equal(result.label,'Check windows');assert.equal(result.name,'Rear');assert.equal(result.icon,'mdi:window-open');
 assert.equal(vehicleStatus({...item,normal_value:'ajar'}, {'sensor.windows':{state:'ajar'}}).level,'unknown');
});
test('indicator IDs are repaired on normalisation and regenerated on import',()=>{
 const card={blocks:[{id:'same',type:'start',vehicle_status:[{id:'same',kind:'lock',entity:'lock.car'},{id:'same',kind:'windows',entity:'cover.windows'}]}]};
 const fixed=normalize(card);assert.equal(new Set([fixed.blocks[0].id,...fixed.blocks[0].vehicle_status.map(x=>x.id)]).size,3);
 const first=inspectCardImport(exportCard(card)),second=inspectCardImport(exportCard(card));assert.equal(first.fields,2);assert.notEqual(first.config.blocks[0].vehicle_status[0].id,second.config.blocks[0].vehicle_status[0].id);
 assert.deepEqual(inspectCardImport(exportCard(card,{includeEntities:false})).entities,[]);
 assert.throws(()=>inspectCardImport(JSON.stringify({blocks:[{type:'start',vehicle_status:{}}]})));
});
