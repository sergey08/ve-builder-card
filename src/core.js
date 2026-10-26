import {translate} from './i18n.js';
export const VERSION = '0.1.0-beta.4';
export const TYPES = {start:'Inicio', fields:'Información', modes:'Modos de carga', power:'Carga', limits:'Límites', actions:'Acciones', map:'Mapa', expenses:'Gastos y ahorro', tyres:'Neumáticos'};
export const POSITIONS = {front_left:'Delantera izquierda', front_right:'Delantera derecha', rear_left:'Trasera izquierda', rear_right:'Trasera derecha'};
export const uid = () => globalThis.crypto?.randomUUID?.() ?? `ve-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const clone = value => structuredClone(value);
export const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export function number(value) { return value !== null && value !== undefined && String(value).trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : null; }
export function decimals(value, fallback=0) { const n=number(value); return n === null ? fallback : Math.max(0,Math.min(6,Math.trunc(n))); }
export function format(value, precision=0,lang='es') { const n=number(value); return n===null?translate('Sin datos',lang):n.toLocaleString(lang==='es'?'es-ES':'en-US',{minimumFractionDigits:decimals(precision),maximumFractionDigits:decimals(precision)}); }
export function percentage(value, min=0, max=100) { const n=number(value),lo=number(min),hi=number(max); return n===null||lo===null||hi===null||hi<=lo?null:Math.max(0,Math.min(100,(n-lo)/(hi-lo)*100)); }
export function pressure(value, from, to='bar') { const n=number(value); if(n===null)return null; const scale={bar:1,kPa:0.01,psi:0.0689475729}; return scale[from]&&scale[to]?n*scale[from]/scale[to]:null; }
export function imageUrl(value) { const s=String(value??'').trim(); return /^\/(?!\/)/.test(s)||/^https?:\/\//i.test(s)?s:''; }
export function stateText(state, field={},lang='es') {
  if(!state||['unknown','unavailable'].includes(state.state))return translate('Sin datos',lang);
  const value=state.state;
  if(field.format==='connection')return translate(({on:'Conectado',off:'Desconectado'})[value]??value,lang);
  if(field.format==='presence')return translate(({on:'En casa',off:'Fuera de casa',home:'En casa',not_home:'Fuera de casa'})[value]??value,lang);
  const n=number(value),unit=field.unit??state.attributes?.unit_of_measurement??'';
  return n===null?value:`${format(n,field.decimals,lang)}${unit?' '+unit:''}`;
}
export function newField() { return {id:uid(),name:'',entity:'',display:'info',size:'small',style:'subtle',width:'auto',tap:'more-info',decimals:0}; }
export function newBlock(type) {
  const block={id:uid(),type,title:TYPES[type]??type};
  if(['start','fields','modes','limits','actions','power'].includes(type))block.fields=[];
  if(type==='start')Object.assign(block,{image:'',image_height:210,show_image:true,animate:true,connector_entity:'',charging_entity:'',charging_value:'Charging'});
  if(type==='map')Object.assign(block,{entity:'',zoom:14,hours:0});
  if(type==='tyres')Object.assign(block,{positions:{},unit:'bar',decimals:2,show_dates:true,note:'Últimas lecturas recibidas · Pulsa una rueda para ver su historial.'});
  if(type==='expenses')Object.assign(block,{prices:[],groups:[],note:'Ahorros mostrados por separado, sin sumarlos. Importes según los sensores configurados.'});
  return block;
}
export function normalize(config) {
  if(!config||typeof config!=='object')throw Error('La configuración debe ser un objeto.');
  const out=clone(config); out.type='custom:ve-builder-card';out.version=1;out.title??='Mi vehículo';out.blocks??=[newBlock('start')];
  if(!Array.isArray(out.blocks))throw Error('Los bloques deben ser una lista.');
  const ids=new Set();
  const identify=item=>{if(!item.id||ids.has(item.id))item.id=uid();ids.add(item.id);return item;};
  out.blocks.forEach(b=>{identify(b);b.fields?.forEach(identify);b.prices?.forEach(identify);b.groups?.forEach(g=>{identify(g);g.fields?.forEach(identify);});});
  return out;
}
export function validate(config, hass) {
  const errors=[];
  const inspect=(f,label)=>{if(!f.entity)errors.push(`${label}: elige una entidad.`);else if(hass&&!hass.states[f.entity])errors.push(`${label}: entidad no disponible (${f.entity}).`);if(f.display==='bar'&&percentage(0,f.min??0,f.max??100)===null)errors.push(`${label}: el máximo debe ser mayor que el mínimo.`);};
  for(const b of config.blocks??[]){if(!TYPES[b.type])errors.push(`Tipo de bloque desconocido: ${b.type}`);if(b.type==='map')inspect(b,b.title??'Mapa');for(const f of b.fields??[])inspect(f,f.name||b.title);for(const f of b.prices??[])inspect(f,f.name||'Precio');for(const g of b.groups??[])for(const f of g.fields??[])inspect(f,f.name||g.name);if(b.type==='tyres')for(const [key,label]of Object.entries(POSITIONS))inspect({entity:b.positions?.[key]},label);}
  return errors;
}
export function actionFor(entity, state, tap='toggle') {
  const domain=String(entity).split('.')[0];
  if(tap==='more-info'||!state||state.attributes?.control_allowed===false)return null;
  if(['switch','input_boolean'].includes(domain)&&['on','off'].includes(state.state))return {domain,service:state.state==='on'?'turn_off':'turn_on',data:{entity_id:entity}};
  if(domain==='lock'&&['locked','unlocked'].includes(state.state))return {domain,service:state.state==='locked'?'unlock':'lock',data:{entity_id:entity}};
  if(domain==='button'&&tap==='press'&&!['unknown','unavailable'].includes(state.state))return {domain,service:'press',data:{entity_id:entity}};
  return null;
}
