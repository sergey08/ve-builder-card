import test from 'node:test';
import assert from 'node:assert/strict';
import {exportCard,inspectCardImport} from '../src/transfer.js';
import {normalize,chargingModeTap,isStandaloneBattery} from '../src/core.js';
import {isBatteryBlock,batterySources,batteryPreheatAction,batteryVehicleLimitField,batteryChargeSummary,renderBattery} from '../src/battery.js';

test('legacy mode IDs and YAML survive while a single power and limits block can be reused',()=>{
  const config=normalize({blocks:[
    {id:'start',type:'start',connector_entity:'binary_sensor.plug',fields:[{id:'soc',name:'Battery',entity:'sensor.soc'}]},
    {id:'modes',type:'modes',title:'Charging modes',fields:[{id:'solar',entity:'input_boolean.solar'}]},
    {id:'power',type:'power',fields:[{id:'watts',entity:'sensor.watts',unit:'W'},{id:'amps',entity:'number.amps',unit:'A'}]},
    {id:'limits',type:'limits'}
  ]});
  const block=config.blocks[1];
  assert.equal(isBatteryBlock(block),true);
  assert.equal(isBatteryBlock({type:'modes',title:'Lights'}),false);
  assert.equal(isBatteryBlock({...block,battery:{enabled:false}}),false);
  assert.deepEqual(block.fields,[{id:'solar',entity:'input_boolean.solar'}]);
  const sources=batterySources(block,config.blocks,{});
  assert.deepEqual([sources.level,sources.power,sources.connector,sources.intensity,sources.limitsBlock.id],
    ['sensor.soc','sensor.watts','binary_sensor.plug','number.amps','limits']);
  block.battery={limits_block:'none'};
  assert.equal(batterySources(block,config.blocks,{}).limitsBlock,undefined);
});

test('XPengTK only enables the appropriate available command and sends vehicle_entity_id',()=>{
  const block={battery:{show_preheating:true,preheat_state_entity:'binary_sensor.heat',preheat_target_entity:'sensor.range'}};
  const hass={states:{'binary_sensor.heat':{state:'off'}},services:{xpeng:{start_battery_preheating:{},stop_battery_preheating:{}}}};
  assert.deepEqual(batteryPreheatAction(block,hass,'start'),
    {domain:'xpeng',service:'start_battery_preheating',data:{vehicle_entity_id:'sensor.range'}});
  assert.equal(batteryPreheatAction(block,hass,'stop'),undefined);
  hass.states['binary_sensor.heat'].state='on';
  assert.equal(batteryPreheatAction(block,hass,'stop').service,'stop_battery_preheating');
  for(const state of ['unknown','unavailable']){
    hass.states['binary_sensor.heat'].state=state;
    assert.equal(batteryPreheatAction(block,hass,'start'),undefined);
    assert.equal(batteryPreheatAction(block,hass,'stop'),undefined);
  }
  block.battery.show_preheating=false;
  assert.equal(batteryPreheatAction(block,hass,'start'),undefined);
});


test('illustration embeds its asset, clips the level and signals live charging and heat',()=>{
  const state={'sensor.soc':{state:'46'},'sensor.power':{state:'1000'},'binary_sensor.heat':{state:'on'}};
  const card={state,_hass:{states:state},lang:'es',t:value=>value};
  const block={battery:{show_preheating:true,preheat_state_entity:'binary_sensor.heat'}};
  const markup=renderBattery(card,block,{level:'sensor.soc',power:'sensor.power'});
  assert.match(markup,/src="data:image\/jpeg;base64,/);
  assert.match(markup,/width:46%/);
  assert.match(markup,/battery-charging battery-heating/);
  assert.match(markup,/46 %/);
  state['sensor.soc'].state='unknown';
  const unknown=renderBattery(card,block,{level:'sensor.soc',power:'sensor.power'});
  assert.match(unknown,/width:0%/);
  assert.doesNotMatch(unknown,/46 %/);
});

test('whole-card import preserves explicitly linked charging controls with fresh IDs',()=>{
  const original=normalize({blocks:[
    {id:'battery',type:'battery',battery:{power_block:'selected',limits_block:'none'}},
    {id:'other',type:'power'},
    {id:'selected',type:'power'}
  ]});
  const {config}=inspectCardImport(exportCard(original));
  assert.notEqual(config.blocks[2].id,'selected');
  assert.equal(config.blocks[0].battery.power_block,config.blocks[2].id);
  assert.equal(config.blocks[0].battery.limits_block,'none');
  assert.equal(batterySources(config.blocks[0],config.blocks,{}).powerBlock,config.blocks[2]);
});

test('vehicle charge limit shares the slider group with the charger limits',()=>{
  const block={id:'battery',type:'battery',battery:{vehicle_limit_entity:'number.vehicle_limit'}};
  const vehicleLimit=batteryVehicleLimitField(block);
  const chargerLimit={id:'charger-limit',entity:'input_number.charger_limit'};
  const limits={id:'limits',type:'limits',fields:[chargerLimit]};
  const card={state:{},_hass:{states:{}},lang:'es',t:value=>value};
  let displayed;
  renderBattery(card,block,{limitsBlock:limits},section=>{displayed=section;return '';});
  assert.deepEqual(displayed.fields,[chargerLimit,vehicleLimit]);
  assert.equal(vehicleLimit.read_only,false);
  assert.equal(vehicleLimit.unit,'%');
  assert.deepEqual(limits.fields,[chargerLimit]);
  assert.equal(batteryVehicleLimitField({...block,battery:{vehicle_limit_entity:'sensor.limit'}}).read_only,true);
});

test('battery figures link to their entities, round to integers and keep power expanded',()=>{
  const state={
    'sensor.level':{state:'46'},
    'sensor.range':{state:'229.6',attributes:{unit_of_measurement:'km'}},
    'sensor.power':{state:'1234.4',attributes:{unit_of_measurement:'W'}}
  };
  const field={id:'power',entity:'sensor.power',display:'bar',decimals:2};
  const extra={id:'energy',entity:'sensor.energy',name:'Energy today'};
  const powerBlock={id:'power-details',type:'power',fields:[field,extra]};
  const card={state,_hass:{states:state},lang:'en',t:value=>value,label:value=>value};
  const markup=renderBattery(card,{id:'battery'},
    {level:'sensor.level',range:'sensor.range',power:'sensor.power',intensity:'number.amps',powerBlock});
  for(const id of Object.keys(state))assert.ok(markup.includes('data-entity="'+id+'"'));
  assert.match(markup,/>230 km</);
  assert.match(markup,/>1,234 W</);
  assert.match(markup,/class="battery-flow"/);
  assert.match(markup,/data-field="energy"/);
  assert.doesNotMatch(markup,/data-field="power"|data-battery-intensity|<details/);
  state['sensor.power'].state='0';
  assert.doesNotMatch(renderBattery(card,{id:'battery'},{power:'sensor.power'}),/class="battery-flow"/);
});

test('charge target uses valid percentage limits and keeps the energy cap separate',()=>{
  const sources={chargerLimit:'number.charger',energyLimit:'number.energy'};
  const states={'number.charger':{state:'80'},'number.vehicle':{state:'100'},'number.energy':{state:'12.5'}};
  assert.deepEqual(batteryChargeSummary(sources,'number.vehicle',states),{target:80,source:'Límite del cargador',energy:12.5});
  states['number.vehicle'].state='70';
  assert.equal(batteryChargeSummary(sources,'number.vehicle',states).source,'Límite del coche');
  states['number.vehicle'].state='unknown';
  assert.equal(batteryChargeSummary(sources,'number.vehicle',states).target,undefined);
});
test('configurable mode entities and standalone Battery layouts',()=>{
  assert.equal(chargingModeTap('input_boolean.solar'),'toggle');
  assert.equal(chargingModeTap('button.custom'),'press');
  assert.equal(chargingModeTap('sensor.status'),'more-info');
  assert.equal(isStandaloneBattery([{type:'battery'},{type:'power'},{type:'limits'}]),true);
  assert.equal(isStandaloneBattery([{type:'start'},{type:'battery'}]),false);
});
