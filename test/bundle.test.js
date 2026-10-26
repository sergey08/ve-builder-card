import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
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
 for(const [plug,charging,power,visible,animated]of [['off','Idle','0',false,false],['on','Idle','0',true,false],['on','Charging','0',true,false],['on','Charging','7400',true,true],['on','Charging','unavailable',true,false]]){
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
 const window={customCards:[{type:'vehicle-builder-card-v1'},{type:'unrelated-card'}]};
 vm.runInNewContext(readFileSync('dist/ve-builder-card.js','utf8'),{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window,console:{info(){}},structuredClone});
 assert.match(window.customCards.find(c=>c.type==='ve-builder-card').name,/EV/);
 const Card=registry.get('ve-builder-card');const card=new Card();card.setConfig(Card.getStubConfig());card.hass={language:'en',states:{}};
 assert.match(card.shadowRoot.innerHTML,/Sample data/);assert.match(card.shadowRoot.innerHTML,/<svg/);assert.doesNotMatch(card.shadowRoot.innerHTML,/data-field=/);
 assert.equal(window.customCards.filter(c=>c.type==='ve-builder-card').length,1);assert.ok(!window.customCards.some(c=>c.type==='vehicle-builder-card-v1'));assert.ok(window.customCards.some(c=>c.type==='unrelated-card'));
});
