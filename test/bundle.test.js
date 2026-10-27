import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
import {styles,compactStyles,powerLayoutStyles,vehicleMapStyles,valueColorStyles,recommendationStyles,freshnessStyles} from '../src/styles.js';
test('distributed bundle renders configured cards with real state data',()=>{
 execFileSync(process.execPath,['scripts/build.mjs']);
 const registry=new Map();
 class Element {
  attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[]};}
 }
 const context={HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window:{},console:{info(){}},structuredClone};
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),context);
 const Card=registry.get('ve-builder-card');
 for(const block of [
  {type:'start',fields:[{id:'f',entity:'sensor.battery',name:'Battery'}],image:'/local/car.png'},
  {type:'expenses',prices:[{id:'p',entity:'sensor.battery',name:'Price'}],groups:[]},
  {type:'tyres',positions:{front_left:'sensor.battery'},body_parts:{front_left:{entity:'binary_sensor.door'}},gear_entity:'sensor.gear'},
  {type:'power',fields:[{id:'power',entity:'sensor.battery',name:'Power',display:'bar',max:100},{id:'detail',entity:'sensor.battery',name:'Today'}]},
  {type:'modes',fields:[{id:'mode',entity:'input_boolean.solar',name:'Solar',tap:'toggle'}]},
  {type:'fields',fields:[{id:'f',entity:'sensor.battery',name:'Battery'}]}
 ]){
  const card=new Card();card.setConfig({title:'Test car',blocks:[{id:'block',...block}]});
  card.hass={language:'en',states:{'binary_sensor.door':{state:'on',attributes:{}},'sensor.gear':{state:'P',attributes:{}},'input_boolean.solar':{state:'on',attributes:{}},'sensor.battery':{state:'53',attributes:{unit_of_measurement:'%'},last_updated:'2026-10-26T10:00:00Z'}}};
  assert.match(card.shadowRoot.innerHTML,/<ha-card>/);
  assert.match(card.shadowRoot.innerHTML,/Test car/);
  if(block.type==='power'){assert.match(card.shadowRoot.innerHTML,/class="power-panel"/);assert.match(card.shadowRoot.innerHTML,/class="power-detail /);}
  if(block.type==='modes')assert.match(card.shadowRoot.innerHTML,/mode-active/);
  if(block.type==='tyres'){assert.match(card.shadowRoot.innerHTML,/state-open/);assert.match(card.shadowRoot.innerHTML,/rotate\(55/);assert.match(card.shadowRoot.innerHTML,/>P<\/text>/);assert.doesNotMatch(card.shadowRoot.innerHTML,/<div class="body-status">/);card.hass={language:'en',states:{'binary_sensor.door':{state:'off',attributes:{}},'sensor.gear':{state:'P',attributes:{}}}};assert.doesNotMatch(card.shadowRoot.innerHTML,/<g class="body-part /);}
  if(block.type==='start')assert.match(card.shadowRoot.innerHTML,/compact-value/);
 }
});
test('charging cable distinguishes disconnected, idle, active and missing power',()=>{
 const registry=new Map();class Element{attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[]};}}
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window:{},console:{info(){}},structuredClone});
 const Card=registry.get('ve-builder-card');
 for(const [plug,charging,power,visible,animated]of [['off','Idle','0',false,false],['on','Idle','0',true,false],['on','Connected','2664',true,true],['on','Charging','0',true,false],['on','Charging','7400',true,true],['on','Charging','unavailable',true,false]]){
  const card=new Card();card.setConfig({blocks:[{id:'start',type:'start',image:'/local/car.png',connector_entity:'binary_sensor.plug',charging_entity:'sensor.charging',power_entity:'sensor.power',fields:[]}]});
  card.hass={language:'en',states:{'binary_sensor.plug':{state:plug},'sensor.charging':{state:charging},'sensor.power':{state:power}}};
  assert.equal(card.shadowRoot.innerHTML.includes('<svg class="charge-cable'),visible);
  assert.equal(card.shadowRoot.innerHTML.includes('charge-cable cable-animated'),animated);
 }
});
test('all six body openings render only confirmed open states and escape gear text',()=>{
 const registry=new Map();class Element{attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[]};}}
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window:{},console:{info(){}},structuredClone});
 const Card=registry.get('ve-builder-card');
 for(const value of ['on','off','unknown','unavailable']){
  const keys=['front_left','front_right','rear_left','rear_right','bonnet','trunk'];
  const body_parts=Object.fromEntries(keys.map(k=>[k,{entity:'binary_sensor.'+k}]));
  const states=Object.fromEntries(keys.map(k=>['binary_sensor.'+k,{state:value}]));states['sensor.gear']={state:'<P>'};
  const card=new Card();card.setConfig({blocks:[{id:'map',type:'tyres',positions:{},body_parts,gear_entity:'sensor.gear'}]});card.hass={language:'en',states};
  assert.equal((card.shadowRoot.innerHTML.match(/<g class="body-part /g)??[]).length,value==='on'?6:0);
  assert.ok(card.shadowRoot.innerHTML.includes('&lt;P&gt;'));assert.ok(!card.shadowRoot.innerHTML.includes('>NaN<'));
 }
});
test('picker preview is labelled sample data and hides the legacy entry',()=>{
 const registry=new Map();class Element{attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[]};}}
 const sharedRegistry=[{type:'vehicle-builder-card-v1'},{type:'unrelated-card'}];
 const window={customCards:sharedRegistry};
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window,console:{info(){}},structuredClone});
 assert.equal(window.customCards,sharedRegistry,'Home Assistant retains the original array reference');
 assert.ok(sharedRegistry.some(c=>c.type==='ve-builder-card'));
 assert.match(window.customCards.find(c=>c.type==='ve-builder-card').name,/EV/);
 const Card=registry.get('ve-builder-card');const card=new Card();card.setConfig(Card.getStubConfig());card.hass={language:'en',states:{}};
 assert.match(card.shadowRoot.innerHTML,/Sample data/);assert.match(card.shadowRoot.innerHTML,/<svg/);assert.doesNotMatch(card.shadowRoot.innerHTML,/data-field=/);
 assert.equal(window.customCards.filter(c=>c.type==='ve-builder-card').length,1);assert.ok(!window.customCards.some(c=>c.type==='vehicle-builder-card-v1'));assert.ok(window.customCards.some(c=>c.type==='unrelated-card'));
});
test('mobile update path skips unrelated events and preserves sample preview DOM',()=>{
 const registry=new Map();let paints=0;
 class Element{attachShadow(){this.shadowRoot={set innerHTML(value){paints++;},querySelectorAll:()=>[]};}}
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window:{},console:{info(){}},structuredClone});
 const Card=registry.get('ve-builder-card');const card=new Card();card.setConfig({blocks:[]});card.hass={language:'es',states:{}};const initial=paints;
 for(let i=0;i<100;i++)card.hass={language:'es',states:{'sensor.unrelated':{state:String(i)}}};assert.equal(paints,initial);
 card.hass={language:'en',states:{}};assert.equal(paints,initial+1);
 const state={state:'80',attributes:{unit_of_measurement:'%'}};
 card.setConfig({blocks:[{type:'fields',fields:[{entity:'sensor.battery'}]}]});card.hass={language:'en',states:{'sensor.battery':state}};const configured=paints;
 for(let i=0;i<100;i++)card.hass={language:'en',states:{'sensor.battery':state,'sensor.unrelated':{state:String(i)}}};assert.equal(paints,configured);
 card.hass={language:'en',states:{'sensor.battery':{...state,state:'81'}}};assert.equal(paints,configured+1);
});
test('conditional colours render for values, power bars and converted tyre pressures',()=>{
 const registry=new Map();class Element{attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[]};}}
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window:{},console:{info(){}},structuredClone});
 const colors={enabled:true,direction:'low',warning:40,critical:20};
 const card=new (registry.get('ve-builder-card'))();card.setConfig({blocks:[{type:'fields',fields:[{entity:'sensor.battery',colors}]},{type:'power',fields:[{entity:'sensor.power',colors:{enabled:true,direction:'high',warning:4000,critical:7000},display:'bar'}]},{type:'tyres',unit:'bar',positions:{front_left:'sensor.pressure'},pressure_colors:{enabled:true,direction:'low',warning:2.3,critical:2.1}}]});
 card.hass={language:'en',states:{'sensor.battery':{state:'15'},'sensor.power':{state:'5000'},'sensor.pressure':{state:'210',attributes:{unit_of_measurement:'kPa'}}}};
 assert.match(card.shadowRoot.innerHTML,/configurable-field[^\"]*value-critical/);assert.match(card.shadowRoot.innerHTML,/power-panel value-warning/);assert.match(card.shadowRoot.innerHTML,/tyre value-critical/);
});
test('tyre colours use independent axle thresholds with shared fallback',()=>{
 const registry=new Map();class Element{attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[]};}}
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window:{},console:{info(){}},structuredClone});
 const Card=registry.get('ve-builder-card');const card=new Card();const shared={enabled:true,direction:'low',warning:2.4,critical:2.2};
 const block={type:'tyres',unit:'bar',positions:{front_left:'sensor.front',rear_left:'sensor.rear'},pressure_colors:shared,pressure_colors_rear:{...shared,warning:2.6,critical:2.4}};
 card.setConfig({blocks:[block]});card.hass={language:'en',states:{'sensor.front':{state:'250',attributes:{unit_of_measurement:'kPa'}},'sensor.rear':{state:'250',attributes:{unit_of_measurement:'kPa'}}}};
 assert.match(card.shadowRoot.innerHTML,/class="tyre value-normal"[^>]*data-entity="sensor.front"/);
 assert.match(card.shadowRoot.innerHTML,/class="tyre value-warning"[^>]*data-entity="sensor.rear"/);
});
test('recommended cold pressures display per axle and convert units without invented defaults',()=>{
 const registry=new Map();class Element{attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[]};}}
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window:{},console:{info(){}},structuredClone});
 const card=new (registry.get('ve-builder-card'))();
 const block={type:'tyres',unit:'bar',recommended_front_bar:2.5,recommended_rear_bar:2.7,show_dates:true};card.setConfig({blocks:[block]});card.hass={language:'es',states:{}};
 assert.equal((card.shadowRoot.innerHTML.match(/Rec\. en frío: 2,5 bar/g)??[]).length,2);assert.equal((card.shadowRoot.innerHTML.match(/Rec\. en frío: 2,7 bar/g)??[]).length,2);
 card.setConfig({blocks:[{...block,unit:'kPa'}]});assert.match(card.shadowRoot.innerHTML,/250 kPa/);assert.match(card.shadowRoot.innerHTML,/270 kPa/);
 card.setConfig({blocks:[{type:'tyres',unit:'bar'}]});assert.doesNotMatch(card.shadowRoot.innerHTML,/class="recommended"/);
});

test('distributed card includes every stylesheet, including colours and opening indicators',()=>{
 const registry=new Map();class Element{attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[]};}}
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window:{},console:{info(){}},structuredClone});
 const card=new (registry.get('ve-builder-card'))();card.setConfig({blocks:[{type:'fields',fields:[{entity:'sensor.battery'}]}]});card.hass={language:'en',states:{'sensor.battery':{state:'48'}}};
 for(const [name,css]of Object.entries({styles,compactStyles,powerLayoutStyles,vehicleMapStyles,valueColorStyles,recommendationStyles,freshnessStyles}))assert.ok(card.shadowRoot.innerHTML.includes(css),name+' must reach the browser');
});

test('real charging power overrides delayed vehicle status and unavailable power stays explicit',()=>{
 const registry=new Map();class Element{attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[]};}}
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window:{},console:{info(){}},structuredClone});
 const card=new (registry.get('ve-builder-card'))();card.setConfig({blocks:[{type:'start',image:'/local/car.png',connector_entity:'binary_sensor.plug',charging_entity:'sensor.charging',power_entity:'sensor.power',fields:[]}]});
 const states={'binary_sensor.plug':{state:'on'},'sensor.charging':{state:'Connected'},'sensor.power':{state:'2664'}};card.hass={language:'es',states};assert.match(card.shadowRoot.innerHTML,/>Cargando</);assert.match(card.shadowRoot.innerHTML,/cable-animated/);
 card.hass={language:'es',states:{...states,'sensor.power':{state:'0'},'sensor.charging':{state:'Charging'}}};assert.match(card.shadowRoot.innerHTML,/>Conectado · Sin carga</);assert.doesNotMatch(card.shadowRoot.innerHTML,/cable-animated/);
 card.hass={language:'es',states:{...states,'sensor.power':{state:'unavailable'}}};assert.match(card.shadowRoot.innerHTML,/>Conectado · Sin datos de potencia</);assert.doesNotMatch(card.shadowRoot.innerHTML,/cable-animated/);
 card.setConfig({blocks:[{type:'start',image:'/local/car.png',charging_entity:'sensor.charging',fields:[]}]});card.hass={language:'en',states:{'sensor.charging':{state:'Charging'}}};assert.match(card.shadowRoot.innerHTML,/>Charging</);
});
test('freshness timer updates labels without repainting and cleans up on disconnect',()=>{
 const registry=new Map();let timers=0,cleared=0,callback,listener,updates=0;
 class Element{attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[]};}}
 const window={setInterval(fn,ms){assert.equal(ms,60000);timers++;callback=fn;return timers;},clearInterval(){cleared++;}};
 const document={visibilityState:'visible',addEventListener(name,fn){listener=fn;},removeEventListener(name,fn){assert.equal(listener,fn);listener=null;}};
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window,document,console:{info(){}},structuredClone});
 const card=new (registry.get('ve-builder-card'))();card.render=()=>{};card.updateFreshness=()=>updates++;card.isConnected=true;const config={blocks:[{type:'fields',freshness:{enabled:true},fields:[]}]};
 card.setConfig(config);card.connectedCallback();assert.equal(timers,1);assert.equal(updates,1);callback();assert.equal(updates,2);document.visibilityState='hidden';callback();assert.equal(updates,2);document.visibilityState='visible';listener();assert.equal(updates,3);
 card.disconnectedCallback();assert.equal(cleared,1);assert.equal(listener,null);card.connectedCallback();assert.equal(timers,2);card.setConfig({blocks:[]});assert.equal(cleared,2);
});
test('freshness renders an old-reading badge without changing charging status or controls',()=>{
 const registry=new Map();class Element{attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[]};}}
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window:{},console:{info(){}},structuredClone});
 const card=new (registry.get('ve-builder-card'))();card.setConfig({blocks:[{type:'start',image:'/local/car.png',power_entity:'sensor.power',connector_entity:'binary_sensor.plug',fields:[{entity:'sensor.battery'}],freshness:{enabled:true,max_age_minutes:60,timestamp_entity:'sensor.timestamp'}}]});
 card.hass={language:'es',states:{'sensor.timestamp':{state:'2020-01-01T00:00:00Z'},'sensor.power':{state:'2664'},'binary_sensor.plug':{state:'on'},'sensor.battery':{state:'48'}}};
 assert.match(card.shadowRoot.innerHTML,/class="data-stale"/);assert.match(card.shadowRoot.innerHTML,/Datos antiguos/);assert.match(card.shadowRoot.innerHTML,/>Cargando</);assert.match(card.shadowRoot.innerHTML,/cable-animated/);
 const fakeBlock={type:'fields',image:'/local/car.png',note:'image.png',fields:[{entity:'sensor.battery'}],freshness:{enabled:true}};assert.equal(card.blockFreshness(fakeBlock).status,'unknown');
 card._hass.states['sensor.battery'].last_updated=new Date().toISOString();assert.equal(card.blockFreshness(fakeBlock).status,'fresh');
});
