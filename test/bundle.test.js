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
  if(block.type==='tyres'){assert.match(card.shadowRoot.innerHTML,/state-open/);assert.match(card.shadowRoot.innerHTML,/rotate\(55/);assert.match(card.shadowRoot.innerHTML,/>P<\/text>/);}
  if(block.type==='start')assert.match(card.shadowRoot.innerHTML,/compact-value/);
 }
});
