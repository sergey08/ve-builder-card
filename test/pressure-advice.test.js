import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recommendedPressure,tyreAdvice} from '../src/core.js';
const now=Date.parse('2026-10-27T12:00:00Z');
const block={recommended_front_bar:2.5,recommended_rear_bar:2.7,pressure_advice:{enabled:true,temperature_entity:'sensor.outside',trip_end_entity:'sensor.trip'}};
test('load profiles preserve normal references and never invent full load values',()=>{
 assert.equal(recommendedPressure(block,'front'),2.5);assert.equal(recommendedPressure(block,'rear'),2.7);
 const full={...block,pressure_advice:{...block.pressure_advice,profile:'full',full_front_bar:2.8}};
 assert.equal(recommendedPressure(full,'front'),2.8);assert.equal(recommendedPressure(full,'rear'),null);
 assert.equal(recommendedPressure(block,'front'),2.5);assert.equal(recommendedPressure({recommended_front_bar:0},'front'),null);
});
test('advice is opt-in and never infers cold tyres from missing or old trip data',()=>{
 assert.equal(tyreAdvice({}, {},now),null);
 for(const value of [undefined,'unknown','2026-10-27T09:00:00Z','2026-10-27T14:00:00Z'])assert.equal(tyreAdvice(block,{'sensor.trip':{state:value}},now).recentTrip,false);
 assert.equal(tyreAdvice(block,{'sensor.trip':{state:'2026-10-27T11:00:00Z'}},now).recentTrip,true);
 assert.equal(tyreAdvice(block,{'sensor.trip':{state:(now-60000)/1000}},now).recentTrip,true);
 assert.equal(tyreAdvice(block,{'sensor.trip':{state:'2026-10-27T10:00:00Z'}},now).recentTrip,false);
});
test('heat advice requires a recent temperature with recognised units and converts Fahrenheit',()=>{
 const temp=(state,unit='°C',last_updated=new Date(now).toISOString())=>({'sensor.outside':{state,attributes:{unit_of_measurement:unit},last_updated}});
 assert.equal(tyreAdvice(block,temp('30'),now).heat,true);assert.equal(tyreAdvice(block,temp('29'),now).heat,false);
 assert.equal(tyreAdvice(block,temp('86','°F'),now).heat,true);
 for(const states of [temp('35','K'),temp('unavailable'),temp('35','°C','2026-10-27T10:00:00Z'),temp('35','°C','2026-10-27T13:00:00Z')]){assert.equal(tyreAdvice(block,states,now).heat,false);assert.equal(tyreAdvice(block,states,now).temperature,null);}
 assert.equal(recommendedPressure(block,'front'),2.5);
});

test('location selects home and vehicle temperatures without cross-location fallback',()=>{
 const b={pressure_advice:{enabled:true,temperature_mode:'location',location_entity:'person.car',temperature_entity:'sensor.home',away_temperature_entity:'sensor.car'}};
 const states={'person.car':{state:'home'},'sensor.home':{state:'35',attributes:{unit_of_measurement:'°C'},last_updated:new Date(now).toISOString()},'sensor.car':{state:'20',attributes:{unit_of_measurement:'°C'},last_updated:new Date(now).toISOString()}};
 assert.equal(tyreAdvice(b,states,now).temperature,35);assert.equal(tyreAdvice(b,states,now).location,'home');
 states['person.car']={state:'not_home'};assert.equal(tyreAdvice(b,states,now).temperature,20);assert.equal(tyreAdvice(b,states,now).temperatureEntity,'sensor.car');
 states['sensor.car']={state:'unavailable'};assert.equal(tyreAdvice(b,states,now).temperature,null);assert.equal(tyreAdvice(b,states,now).heat,false);
});
test('unknown location suppresses temperature and named zones count as away',()=>{
 const b={pressure_advice:{enabled:true,temperature_mode:'location',location_entity:'person.car',temperature_entity:'sensor.home',away_temperature_entity:'sensor.car'}};
 for(const v of [undefined,'unknown','unavailable','none']){const a=tyreAdvice(b,{'person.car':{state:v}},now);assert.equal(a.location,'unknown');assert.equal(a.temperatureEntity,'');assert.equal(a.temperature,null);}
 assert.equal(tyreAdvice(b,{'person.car':{state:'Work'}},now).location,'away');
});
test('location supports custom home states and fixed configurations stay compatible',()=>{
 const b={pressure_advice:{enabled:true,temperature_mode:'location',home_value:'on',location_entity:'input_boolean.car',temperature_entity:'sensor.home'}};
 assert.equal(tyreAdvice(b,{'input_boolean.car':{state:'on'}},now).location,'home');assert.equal(tyreAdvice(b,{'input_boolean.car':{state:'off'}},now).location,'away');
 assert.equal(tyreAdvice(block,{},now).location,'fixed');assert.equal(tyreAdvice(block,{},now).temperatureEntity,'sensor.outside');
});
