import {test} from 'node:test';
import assert from 'node:assert/strict';
import {collectCardAlerts,readingEntities} from '../src/core.js';
const low={enabled:true,direction:'low',warning:30,critical:15};
const state=(v,unit)=>({state:String(v),attributes:{unit_of_measurement:unit}});
const config={alerts:{enabled:true},blocks:[{id:'overview',type:'start',fields:[{entity:'sensor.battery',name:'Battery',colors:low}]}]};
test('alert summary is opt-in, hides normal or missing readings and prioritises critical',()=>{
 assert.deepEqual(collectCardAlerts({...config,alerts:{}},{'sensor.battery':state(5)}),[]);
 for(const value of [50,'unknown','unavailable',''])assert.deepEqual(collectCardAlerts(config,{'sensor.battery':state(value)}),[]);
 const c=structuredClone(config);c.blocks[0].fields.push({entity:'sensor.range',colors:low},{entity:'sensor.battery',colors:low});
 const alerts=collectCardAlerts(c,{'sensor.battery':state(25),'sensor.range':state(10)});
 assert.equal(alerts.length,2);assert.equal(alerts[0].entity,'sensor.range');assert.equal(alerts[0].severity,'critical');
 assert.deepEqual(collectCardAlerts({...c,alerts:{enabled:true,include_values:false}},{'sensor.range':state(10)}),[]);
});
test('tyre alerts convert source units and use the same axle thresholds as the diagram',()=>{
 const b={id:'car',type:'tyres',unit:'bar',positions:{front_left:'sensor.fl',front_right:'sensor.fr',rear_left:'sensor.rl',rear_right:'sensor.rr'},pressure_colors_front:{...low,warning:2.4,critical:2.2},pressure_colors_rear:{...low,warning:2.6,critical:2.4}};
 const states={'sensor.fl':state(231,'kPa'),'sensor.fr':state(231,'kPa'),'sensor.rl':state(244,'kPa'),'sensor.rr':state(242,'kPa')};
 const c={alerts:{enabled:true},blocks:[b]},alerts=collectCardAlerts(c,states);
 assert.equal(alerts.length,4);assert.ok(alerts.every(a=>a.severity==='warning'));assert.equal(alerts[0].value,'2,31 bar');
 states['sensor.rr']=state(240,'kPa');assert.equal(collectCardAlerts(c,states)[0].severity,'critical');
 assert.deepEqual(collectCardAlerts({...c,alerts:{enabled:true,include_tyres:false}},states),[]);
});
test('only confirmed openings appear and labels are localised',()=>{
 const b={id:'car',type:'tyres',body_parts:{front_left:{entity:'binary_sensor.door'},bonnet:{entity:'binary_sensor.bonnet'},trunk:{entity:'cover.trunk'}}};
 const c={alerts:{enabled:true},blocks:[b]},states={'binary_sensor.door':state('on'),'binary_sensor.bonnet':state('unknown'),'cover.trunk':state('closed')};
 const alerts=collectCardAlerts(c,states,'en');assert.equal(alerts.length,1);assert.equal(alerts[0].kind,'opening');assert.equal(alerts[0].value,'Open');
 assert.deepEqual(collectCardAlerts({...c,alerts:{enabled:true,include_openings:false}},states),[]);
});
test('stale alerts respect enabled age settings and never invent missing dates',()=>{
 const now=Date.parse('2026-10-27T10:00:00Z'),c=structuredClone(config);c.blocks[0].freshness={enabled:true,timestamp_entity:'sensor.date',max_age_minutes:60};
 assert.deepEqual(collectCardAlerts(c,{},'es',now),[]);
 const states={'sensor.date':state('2026-10-27T08:00:00Z')};assert.equal(collectCardAlerts(c,states,'es',now)[0].kind,'stale');
 assert.deepEqual(collectCardAlerts({...c,alerts:{enabled:true,include_stale:false}},states,'es',now),[]);
 assert.deepEqual(readingEntities(c.blocks[0]),['sensor.battery']);
});
