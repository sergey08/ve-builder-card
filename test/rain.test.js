import {test} from 'node:test';
import assert from 'node:assert/strict';
import {vehicleRain,rainStyles} from '../src/rain.js';
import {exportCard,inspectCardImport} from '../src/transfer.js';
const now=Date.parse('2026-10-28T12:00:00Z');
const reading=(state,age=0)=>({state,last_updated:new Date(now-age*60000).toISOString()});
const options={enabled:true,entity:'weather.home'};
test('rain is opt-in and follows current weather conditions, never a forecast',()=>{
 assert.equal(vehicleRain({}, {'weather.home':reading('rainy')},now).active,false);
 for(const state of ['rainy','pouring','lightning-rainy','snowy-rainy'])assert.equal(vehicleRain(options,{'weather.home':reading(state)},now).active,true);
 for(const state of ['sunny','cloudy','lightning','snowy','hail','unknown','unavailable'])assert.equal(vehicleRain(options,{'weather.home':reading(state)},now).active,false);
 assert.equal(vehicleRain(options,{'weather.home':{...reading('sunny'),attributes:{forecast:[{condition:'rainy'}]}}},now).active,false);
});
test('binary and numeric rain sources require matching domains, values and thresholds',()=>{
 const binary={...options,source:'binary',entity:'binary_sensor.rain'};
 assert.equal(vehicleRain(binary,{'binary_sensor.rain':reading('on')},now).active,true);assert.equal(vehicleRain(binary,{'binary_sensor.rain':reading('off')},now).active,false);
 assert.equal(vehicleRain({...binary,rain_value:'wet'},{'binary_sensor.rain':reading('wet')},now).active,true);
 const numeric={...options,source:'numeric',entity:'sensor.rain_rate',threshold:0.2};
 for(const [value,active]of [['0',false],['0.2',false],['0.3',true],['unavailable',false],['bad',false],['-1',false]])assert.equal(vehicleRain(numeric,{'sensor.rain_rate':reading(value)},now).active,active);
 assert.equal(vehicleRain({...numeric,source:'weather'},{'sensor.rain_rate':reading('rainy')},now).active,false);
});
test('location and covered vehicle gates suppress rain when context is unknown',()=>{
 const states={'weather.home':reading('rainy'),'person.car':reading('home'),'binary_sensor.covered':reading('off')};
 const config={...options,home_only:true,location_entity:'person.car',covered_entity:'binary_sensor.covered'};
 assert.equal(vehicleRain(config,states,now).active,true);
 for(const location of ['not_home','unknown','unavailable','work'])assert.equal(vehicleRain(config,{...states,'person.car':reading(location)},now).active,false);
 for(const cover of ['on','unknown','unavailable','unexpected'])assert.equal(vehicleRain(config,{...states,'binary_sensor.covered':reading(cover)},now).active,false);
 assert.equal(vehicleRain({...config,covered:true},states,now).active,false);
});
test('missing, stale and future rain readings stay dry, with report-time support',()=>{
 for(const state of [undefined,{state:'rainy'},reading('rainy',181),reading('rainy',-3)])assert.equal(vehicleRain(options,{'weather.home':state},now).active,false);
 assert.equal(vehicleRain(options,{'weather.home':reading('rainy',180)},now).active,true);
 assert.equal(vehicleRain(options,{'weather.home':{...reading('rainy',999),last_reported:new Date(now).toISOString()}},now).active,true);
});
test('preview is explicit, bounded in intensity, and supports static or reduced-motion rain',()=>{
 const result=vehicleRain({...options,preview:true,covered:true,animate:false,intensity:'heavy'}, {},now);assert.equal(result.active,true);assert.equal(result.preview,true);assert.equal(result.animated,false);assert.equal(result.intensity,'heavy');
 assert.equal(vehicleRain({...options,preview:true,intensity:'bad'}, {},now).intensity,'normal');assert.match(rainStyles,/prefers-reduced-motion:reduce/);assert.match(rainStyles,/pointer-events:none/);
});
test('rain configuration survives sharing and clears every optional entity assignment',()=>{
 const card={blocks:[{type:'start',rain:{...options,source:'binary',location_entity:'person.car',covered_entity:'binary_sensor.covered'}}]};
 const full=inspectCardImport(exportCard(card));assert.equal(full.config.blocks[0].rain.covered_entity,'binary_sensor.covered');
 assert.deepEqual(inspectCardImport(exportCard(card,{includeEntities:false})).entities,[]);
});
