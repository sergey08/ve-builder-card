import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
import {styles,compactStyles,powerLayoutStyles,vehicleMapStyles,valueColorStyles,recommendationStyles,freshnessStyles,alertSummaryStyles} from '../src/styles.js';
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
 for(const [name,css]of Object.entries({styles,compactStyles,powerLayoutStyles,vehicleMapStyles,valueColorStyles,recommendationStyles,freshnessStyles,alertSummaryStyles}))assert.ok(card.shadowRoot.innerHTML.includes(css),name+' must reach the browser');
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

test('alert summary escapes labels, opens entity details only and keeps expanded state on age refresh',()=>{
 const registry=new Map();class Element{attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[]};}}
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window:{},console:{info(){}},structuredClone});
 const card=new (registry.get('ve-builder-card'))();card.setConfig({alerts:{enabled:true},blocks:[{type:'fields',fields:[{entity:'sensor.battery',name:'<img onerror=bad>',colors:{enabled:true,direction:'low',warning:30,critical:15}}]}]});
 card.hass={language:'es',states:{'sensor.battery':{state:'10',attributes:{unit_of_measurement:'%'}}}};
 assert.match(card.alertSummary(),/has-critical/);assert.match(card.alertSummary(),/1 crítico/);assert.match(card.alertSummary(),/&lt;img onerror=bad&gt;/);assert.doesNotMatch(card.alertSummary(),/<img|data-field=/);
 let details={open:true},writes=0,opened;const host={_alertMarkup:'old',contains:()=>true,querySelector:()=>details,set innerHTML(v){writes++;details={open:false};},get innerHTML(){return '';}};
 card.shadowRoot.querySelector=()=>host;card.moreInfo=id=>opened=id;card.bindAlertSummary();
 host.onclick({target:{closest:()=>({dataset:{alertEntity:'sensor.battery'}})}});assert.equal(opened,'sensor.battery');
 card.refreshAlertSummary();assert.equal(writes,0);
 card._hass.states['sensor.battery']={state:'20'};card.refreshAlertSummary();assert.equal(writes,1);assert.equal(details.open,true);
 card._hass.states['sensor.battery']={state:'50'};assert.equal(card.alertSummary(),'');
});

test('pressure advice renders translated context and selected references without changing pressure colours',()=>{
 const registry=new Map();class Element{attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[]};}}
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window:{},console:{info(){}},structuredClone});
 const card=new (registry.get('ve-builder-card'))();const block={type:'tyres',recommended_front_bar:2.5,recommended_rear_bar:2.7,positions:{front_left:'sensor.pressure'},pressure_colors:{enabled:true,direction:'low',warning:2.4,critical:2.2},pressure_advice:{enabled:true,profile:'full',full_front_bar:2.9,full_rear_bar:3}};
 card.setConfig({blocks:[block]});card.hass={language:'en',states:{'sensor.pressure':{state:'231',attributes:{unit_of_measurement:'kPa'}}}};
 assert.match(card.shadowRoot.innerHTML,/Full load · cold reference/);assert.match(card.shadowRoot.innerHTML,/2.9 bar/);assert.match(card.shadowRoot.innerHTML,/Cannot determine whether the tyres are cold or hot/);assert.match(card.shadowRoot.innerHTML,/tyre value-warning/);
 card.setConfig({blocks:[{...block,pressure_advice:{enabled:false}}]});assert.doesNotMatch(card.shadowRoot.innerHTML,/<aside class="pressure-advice"/);assert.match(card.shadowRoot.innerHTML,/2.5 bar/);
});

test('pressure advice identifies temperature source, converts Fahrenheit and hides invalid old values',()=>{
 const registry=new Map();class Element{attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[]};}}
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window:{},console:{info(){}},structuredClone});
 const card=new (registry.get('ve-builder-card'))();const block={type:'tyres',pressure_advice:{enabled:true,temperature_entity:'sensor.outside'}};card.setConfig({blocks:[block]});
 card.hass={language:'en',states:{'sensor.outside':{state:'68',last_updated:new Date().toISOString(),attributes:{unit_of_measurement:'°F',friendly_name:'Heat pump <outside>'}}}};
 assert.match(card.pressureAdvice(block),/Outside temperature: 20.0 °C/);assert.match(card.pressureAdvice(block),/Heat pump &lt;outside&gt;/);assert.match(card.pressureAdvice(block),/Cannot determine/);
 card._hass.states['sensor.outside'].last_updated='2020-01-01T00:00:00Z';assert.match(card.pressureAdvice(block),/No valid recent reading/);assert.doesNotMatch(card.pressureAdvice(block),/20.0 °C/);
 card._hass.language='es';assert.match(card.pressureAdvice(block),/No se puede determinar si los neumáticos están fríos o calientes/);
});

test('vehicle update and individual tyre changes have distinct timestamp labels in both languages',()=>{
 const registry=new Map();class Element{attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[]};}}
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window:{},console:{info(){}},structuredClone});
 const card=new (registry.get('ve-builder-card'))();const block={type:'tyres',positions:{front_left:'sensor.pressure'},freshness:{enabled:true,timestamp_entity:'sensor.timestamp'}};card.setConfig({blocks:[block]});
 card.hass={language:'es',states:{'sensor.pressure':{state:'231',last_updated:'2026-10-27T09:39:00Z',attributes:{unit_of_measurement:'kPa'}},'sensor.timestamp':{state:new Date().toISOString()}}};
 assert.match(card.shadowRoot.innerHTML,/Última actualización del vehículo/);assert.match(card.shadowRoot.innerHTML,/Último cambio/);
 card.hass={...card._hass,language:'en'};assert.match(card.shadowRoot.innerHTML,/Last vehicle update/);assert.match(card.shadowRoot.innerHTML,/Last change/);
 assert.match(card.freshnessLabel({type:'tyres'},{status:'fresh',source:'changes',ageMinutes:2}),/Oldest state change/);
});

test('compact advice starts collapsed and summary separates warning and critical counts',()=>{
 const registry=new Map();class Element{attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[]};}}
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window:{},console:{info(){}},structuredClone});
 const card=new (registry.get('ve-builder-card'))();const colors={enabled:true,direction:'low',warning:30,critical:15};
 card.setConfig({alerts:{enabled:true},blocks:[{type:'fields',fields:[{entity:'sensor.a',colors},{entity:'sensor.b',colors},{entity:'sensor.c',colors}]},{type:'tyres',pressure_advice:{enabled:true}}]});
 card.hass={language:'es',states:{'sensor.a':{state:'10'},'sensor.b':{state:'5'},'sensor.c':{state:'20'}}};assert.match(card.alertSummary(),/2 críticos · 1 en aviso/);
 const advice=card.pressureAdvice(card.config.blocks[1]);assert.match(advice,/<details><summary>Más información<\/summary>/);assert.doesNotMatch(advice,/<details open/);assert.match(advice,/No desinfles neumáticos calientes/);
 card.hass={...card._hass,language:'en'};assert.match(card.alertSummary(),/2 critical · 1 warning/);assert.match(card.pressureAdvice(card.config.blocks[1]),/More information/);
 card._hass.states['sensor.a']={state:'50'};card._hass.states['sensor.b']={state:'50'};assert.match(card.alertSummary(),/1 warning/);assert.doesNotMatch(card.alertSummary(),/has-critical/);
});

test('location-based temperature rendering identifies selected source and unknown location',()=>{
 const registry=new Map();class Element{attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[]};}}
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window:{},console:{info(){}},structuredClone});
 const card=new (registry.get('ve-builder-card'))(),block={type:'tyres',pressure_advice:{enabled:true,temperature_mode:'location',location_entity:'person.car',temperature_entity:'sensor.home',away_temperature_entity:'sensor.car'}};
 card.setConfig({blocks:[block]});card.hass={language:'es',states:{'person.car':{state:'home'},'sensor.home':{state:'22',last_updated:new Date().toISOString(),attributes:{unit_of_measurement:'°C',friendly_name:'Aerotermia'}}}};
 assert.match(card.pressureAdvice(block),/22,0 °C · En casa/);assert.match(card.pressureAdvice(block),/Aerotermia/);
 card._hass.states['person.car']={state:'not_home'};assert.match(card.pressureAdvice(block),/Sin lectura reciente válida · Fuera de casa/);assert.doesNotMatch(card.pressureAdvice(block),/22,0 °C|Aerotermia/);
 card._hass.states['person.car']={state:'unknown'};assert.match(card.pressureAdvice(block),/Ubicación desconocida/);
 card._hass.language='en';assert.match(card.pressureAdvice(block),/Unknown location/);
});

test('rain overlays retain image and cable, escape preview labels and disappear without repainting the car',()=>{
 const registry=new Map();class Element{attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[]};}}
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window:{},console:{info(){}},structuredClone});
 const Card=registry.get('ve-builder-card'),card=new Card();
 card.setConfig({language:'en',blocks:[{id:'start',type:'start',image:'/local/car.png',connector_entity:'binary_sensor.plug',rain:{enabled:true,preview:true,intensity:'heavy'}}]});
 card.hass={states:{'binary_sensor.plug':{state:'on'}}};
 assert.match(card.shadowRoot.innerHTML,/rain-overlay rain-heavy rain-animated/);assert.match(card.shadowRoot.innerHTML,/Sample rain/);assert.match(card.shadowRoot.innerHTML,/src="\/local\/car.png"/);assert.match(card.shadowRoot.innerHTML,/cable-static/);
 const host={dataset:{rain:'start'},innerHTML:'old rain'};card.shadowRoot.querySelectorAll=selector=>selector==='[data-rain]'?[host]:[];
 card.config.blocks[0].rain.preview=false;card.refreshRain();assert.equal(host.innerHTML,'');
 card.config.blocks[0].show_image=false;card._dirty=true;card.render();assert.doesNotMatch(card.shadowRoot.innerHTML,/<svg class="rain-overlay/);
});

test('rain uses bounded layered depth, varied drop lengths and stable placement across refreshes',()=>{
 const registry=new Map();class Element{attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[]};}}
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window:{},console:{info(){}},structuredClone});
 const card=new (registry.get('ve-builder-card'))();card.setConfig({blocks:[]});card.hass={language:'en',states:{}};
 for(const intensity of ['light','normal','heavy']){
  const block={rain:{enabled:true,preview:true,intensity}},markup=card.rainOverlay(block);
  assert.equal((markup.match(/class="rain-drops rain-depth-/g)||[]).length,3);
  assert.equal(markup,card.rainOverlay(block));assert.ok((markup.match(/M-?\d+ /g)||[]).length<=80);
  const lengths=[...markup.matchAll(/l-\d+ (\d+)/g)].map(m=>m[1]);assert.ok(new Set(lengths).size>3);
 }
 const staticRain=card.rainOverlay({rain:{enabled:true,preview:true,animate:false}});assert.doesNotMatch(staticRain,/rain-animated/);assert.match(staticRain,/rain-depth-near/);
});

test('vehicle indicators render below the image with escaped text and separate detail-only buttons',()=>{
 const registry=new Map();class Element{attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[]};}}
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window:{},console:{info(){}},structuredClone});
 const Card=registry.get('ve-builder-card'),card=new Card();
 const items=[{id:'lock',kind:'lock',entity:'lock.car',tap:'toggle'},{id:'doors',kind:'doors',entity:'binary_sensor.doors',name:'<Rear>'},{id:'windows',kind:'windows',entity:'cover.windows'}];
 card.setConfig({language:'en',blocks:[{type:'start',image:'/local/car.png',vehicle_status:items}]});card.hass={states:{'lock.car':{state:'locked'},'binary_sensor.doors':{state:'on'}}};
 const html=card.shadowRoot.innerHTML;assert.ok(html.indexOf('class="vehicle-statuses"')>html.indexOf('src="/local/car.png"'));assert.match(html,/status-normal/);assert.match(html,/status-attention/);assert.match(html,/&lt;Rear&gt;/);assert.match(html,/data-vehicle-status="windows"[^>]*disabled/);assert.doesNotMatch(card.vehicleStatuses(card.config.blocks[0]),/data-field=/);
 let opened='',services=0;card.moreInfo=id=>opened=id;card._hass.callService=()=>services++;const buttons=items.map(item=>({dataset:{vehicleStatus:item.id},addEventListener(type,fn){this.click=fn;}}));
 card.shadowRoot.querySelectorAll=selector=>selector==='[data-vehicle-status]'?buttons:[];card._dirty=true;card.render();buttons[0].click();assert.equal(opened,'lock.car');assert.equal(services,0);
});
