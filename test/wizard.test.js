import {test} from 'node:test';
import assert from 'node:assert/strict';
import {suggestVehicleEntities,vehicleWizardBlocks} from '../src/core.js';
test('wizard restricts suggestions to selected device and rejects ambiguous or incompatible readings',()=>{
 const registry=[['battery','car'],['battery_health','car'],['battery_temperature','car'],['range','other'],['odometer','car'],['total_mileage','car'],['charging_power','car'],['disabled_range','car']].map(([name,device_id])=>({entity_id:'sensor.'+name,device_id,disabled_by:name.startsWith('disabled')?'user':null}));
 const states=Object.fromEntries(registry.map(e=>[e.entity_id,{state:'10',attributes:{unit_of_measurement:e.entity_id==='sensor.charging_power'?'kW':e.entity_id==='sensor.battery_temperature'?'°C':e.entity_id.includes('battery')?'%':'km'}}]));
 const result=suggestVehicleEntities('car',registry,states);assert.equal(result.battery,'sensor.battery');assert.equal(result.power,'sensor.charging_power');assert.equal(result.range,undefined);assert.equal(result.odometer,undefined);assert.deepEqual(suggestVehicleEntities('',registry,states),{});
});
test('reviewed configuration preserves sensor units, section choices and informational actions',()=>{
 const chosen={battery:'sensor.battery',power:'sensor.charging_power',charging:'binary_sensor.charging',door_front_left:'binary_sensor.front_left',gear:'sensor.gear',location:'person.car'};
 const before=structuredClone(chosen);const blocks=vehicleWizardBlocks('electric',{charging:true,vehicle:true,location:false},chosen,{'sensor.charging_power':{attributes:{unit_of_measurement:'kW'}}},'en');
 assert.deepEqual(blocks.map(b=>b.type),['start','power','tyres']);assert.equal(blocks[1].fields[0].max,7.4);assert.equal(blocks[1].fields[0].unit,undefined);assert.equal(blocks[0].charging_value,'on');assert.equal(blocks[2].body_parts.front_left.open_value,'on');assert.equal(blocks[0].fields[0].tap,'more-info');assert.deepEqual(chosen,before);
 const combustion=vehicleWizardBlocks('combustion',{charging:true,vehicle:false},{fuel:'sensor.fuel',power:'sensor.power'});assert.equal(combustion.length,1);assert.equal(combustion[0].fields[0].name,'Combustible');assert.equal(combustion[0].show_cable,false);
});
