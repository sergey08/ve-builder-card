import {translate} from './i18n.js';
export const VERSION = '1.7.1-beta.1';
export const TYPES = {start:'Inicio con imagen', fields:'Datos y sensores', modes:'Botones de selección', power:'Potencia de carga', limits:'Controles deslizantes', actions:'Botones de acciones', map:'Mapa de ubicación', expenses:'Gastos y ahorro', tyres:'Estado del vehículo'};
export const BLOCK_DESCRIPTIONS = {"start": "Imagen del coche, datos destacados y estado de carga.", "fields": "Valores de sensores, información y barras de progreso.", "modes": "Opciones con estado activo o inactivo, como los modos de carga.", "power": "Potencia real de carga, escala y datos relacionados.", "limits": "Ajustes numéricos mediante input_number, como límites de carga.", "actions": "Interruptores, cerraduras y acciones mediante botones.", "map": "Posición y recorrido del vehículo sobre un mapa.", "expenses": "Precios de referencia, costes y ahorros por periodos.", "tyres": "Diagrama con neumáticos, puertas, capó, maletero y marcha."};
export const POSITIONS = {front_left:'Delantera izquierda', front_right:'Delantera derecha', rear_left:'Trasera izquierda', rear_right:'Trasera derecha'};
export const uid = () => globalThis.crypto?.randomUUID?.() ?? `ve-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const clone = value => structuredClone(value);
export const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export function number(value) { return value !== null && value !== undefined && String(value).trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : null; }
export function decimals(value, fallback=0) { const n=number(value); return n === null ? fallback : Math.max(0,Math.min(6,Math.trunc(n))); }
export function format(value, precision=0,lang='es') { const n=number(value); return n===null?translate('Sin datos',lang):n.toLocaleString(lang,{minimumFractionDigits:decimals(precision),maximumFractionDigits:decimals(precision)}); }
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
  out.blocks.forEach(b=>{identify(b);b.fields?.forEach(identify);b.prices?.forEach(identify);b.vehicle_status?.forEach(identify);b.groups?.forEach(g=>{identify(g);g.fields?.forEach(identify);});});
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

export function templateBlocks(kind,lang='es') {
 const field=(name,options={})=>({...newField(),name:translate(name,lang),...options});
 const block=(type,options={})=>{const b=newBlock(type);b.title=translate(b.title,lang);if(b.note)b.note=translate(b.note,lang);return Object.assign(b,options);};
 if(kind==='electric')return [block('start',{fields:[field('Ubicación',{format:'presence',icon:'mdi:map-marker'}),field('Batería',{icon:'mdi:battery',unit:'%'}),field('Autonomía',{unit:'km',icon:'mdi:map-marker-distance'}),field('Odómetro',{unit:'km',icon:'mdi:counter'})]}),block('modes'),block('power',{fields:[field('Potencia de carga',{display:'bar',min:0,max:7400,unit:'W'}),field('Intensidad configurada',{unit:'A'}),field('Excedentes disponibles',{unit:'W'}),field('Cargado hoy',{unit:'kWh',decimals:2}),field('Tiempo para finalizar')]}),block('limits'),block('actions')];
 if(kind==='combustion')return [block('start',{show_status:false,show_cable:false,animate:false,fields:[field('Ubicación',{format:'presence',icon:'mdi:map-marker'}),field('Combustible',{unit:'%',icon:'mdi:gas-station'}),field('Autonomía',{unit:'km',icon:'mdi:map-marker-distance'}),field('Odómetro',{unit:'km',icon:'mdi:counter'})]})];
 if(kind==='expenses')return [block('expenses',{prices:[field('Electricidad',{unit:'€/kWh',decimals:4}),field('Combustible',{unit:'€/L',decimals:3})],groups:[['Coste de carga','cost','mdi:ev-station'],['Ahorro solar','solar','mdi:solar-power'],['Ahorro frente al combustible','diesel','mdi:gas-station']].map(([name,style,icon])=>({id:uid(),name:translate(name,lang),style,icon,fields:['Hoy','Este mes','Este año'].map(name=>field(name,{unit:'€',decimals:2}))}))})];
 if(kind==='tyres')return [block('tyres')];
 return [];
}

export const BODY_PARTS={front_left:'Puerta delantera izquierda',front_right:'Puerta delantera derecha',rear_left:'Puerta trasera izquierda',rear_right:'Puerta trasera derecha',bonnet:'Capó',trunk:'Maletero'};
export function openingState(state,config={}){
 if(!state||['unknown','unavailable',''].includes(state.state))return 'unknown';
 const value=String(state.state).toLowerCase(),open=String(config.open_value??'on').toLowerCase(),closed=String(config.closed_value??'off').toLowerCase();
 if(value===open)return 'open';if(value===closed)return 'closed';return 'unknown';
}

// Suggestions are restricted to one selected device. Ambiguous matches stay empty.
export function suggestVehicleEntities(device,registry=[],states={}) {
 const result={};if(!device)return result;
 const entries=registry.filter(e=>e.device_id===device&&!e.disabled_by&&states[e.entity_id]);
 const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[_-]/g,' ');
 const specs={fuel:['sensor',/fuel level|nivel.*combustible/],charging:['binary_sensor',/charging|cargando/],battery:['sensor',/battery|bateria|state of charge|\bsoc\b/,/12v|12 v|auxiliary|health|salud|soh/],range:['sensor',/range|autonomia|remaining distance/],odometer:['sensor',/odometer|odometro|total mileage/],power:['sensor',/charg.*power|power.*charg|potencia.*carga/],gear:['sensor',/gear|marcha/],connector:['binary_sensor',/plug|connector|conector/],bonnet:['binary_sensor',/bonnet|hood|capo/],trunk:['binary_sensor',/trunk|boot|maletero/]};
 for(const [role,[domain,yes,no]]of Object.entries(specs)){
  const matches=entries.filter(e=>{const s=states[e.entity_id],name=norm(e.entity_id+' '+(s.attributes?.friendly_name??''));return e.entity_id.startsWith(domain+'.')&&yes.test(name)&&(!no||!no.test(name))&&(!({battery:['%'],power:['W','kW'],range:['km','mi'],odometer:['km','mi']}[role])||({battery:['%'],power:['W','kW'],range:['km','mi'],odometer:['km','mi']}[role]).includes(s.attributes?.unit_of_measurement));});
  if(matches.length===1)result[role]=matches[0].entity_id;
 }
 for(const [pos,label]of Object.entries(POSITIONS)){
  const side=pos.endsWith('left')?/left|izquierd/:/right|derech/;const axle=pos.startsWith('front')?/front|delanter/:/rear|traser/;
  for(const [role,domain,kind]of [['pressure_'+pos,'sensor',/pressure|presion/],['door_'+pos,'binary_sensor',/door|puerta/]]){
   const matches=entries.filter(e=>{const n=norm(e.entity_id+' '+(states[e.entity_id].attributes?.friendly_name??''));return e.entity_id.startsWith(domain+'.')&&kind.test(n)&&side.test(n)&&axle.test(n);});
   if(matches.length===1)result[role]=matches[0].entity_id;
  }
 }
 return result;
}
export function vehicleWizardBlocks(kind,sections,chosen,states={},lang='es') {
 const blocks=[];const field=(role,name,options={})=>{const entity=chosen[role];if(!entity)return null;return {...newField(),entity,name:translate(name,lang),...options};};
 const overview=newBlock('start');overview.title=translate(overview.title,lang);overview.fields=[field(kind==='combustion'?'fuel':'battery',kind==='combustion'?'Combustible':'Batería'),field('range','Autonomía'),field('odometer','Odómetro')].filter(Boolean);
 if(kind==='combustion'){overview.show_cable=false;overview.show_status=false;overview.animate=false;}
 else if(sections.charging){overview.connector_entity=chosen.connector||'';overview.power_entity=chosen.power||'';overview.charging_entity=chosen.charging||'';overview.charging_value='on';}
 blocks.push(overview);
 if(kind==='electric'&&sections.charging&&chosen.power){const b=newBlock('power');b.title=translate(b.title,lang);const unit=states[chosen.power]?.attributes?.unit_of_measurement;b.fields=[field('power','Potencia de carga',{display:'bar',min:0,max:unit==='kW'?7.4:7400})];blocks.push(b);}
 if(sections.vehicle){const b=newBlock('tyres');b.title=translate(b.title,lang);b.positions={};b.body_parts={};
  for(const pos of Object.keys(POSITIONS))if(chosen['pressure_'+pos])b.positions[pos]=chosen['pressure_'+pos];
  for(const part of Object.keys(BODY_PARTS)){const id=chosen[part==='bonnet'||part==='trunk'?part:'door_'+part];if(id)b.body_parts[part]={entity:id,open_value:'on',closed_value:'off'};}
  b.gear_entity=chosen.gear||'';blocks.push(b);
 }
 if(sections.location&&chosen.location){const b=newBlock('map');b.title=translate('Ubicación',lang);b.entity=chosen.location;blocks.push(b);}
 return blocks;
}

export function valueSeverity(value,colors={}) {
 if(!colors.enabled)return '';
 const n=number(value),warning=number(colors.warning),critical=number(colors.critical);
 if(n===null||!['low','high'].includes(colors.direction)||(warning===null&&critical===null))return '';
 if(warning!==null&&critical!==null&&(colors.direction==='low'?critical>warning:critical<warning))return '';
 const hit=threshold=>threshold!==null&&(colors.direction==='low'?n<=threshold:n>=threshold);
 return hit(critical)?'critical':hit(warning)?'warning':'normal';
}

export function readingFreshness(options={},states={},entities=[],now=Date.now()) {
 if(!options.enabled)return {status:'disabled'};
 const parse=value=>{if(value===null||value===undefined||String(value).trim()==='')return NaN;const n=Number(value);return Number.isFinite(n)?n>=1e12?n:n>=1e9?n*1000:NaN:Date.parse(value);};
 const source=options.timestamp_entity?'sensor':'changes';
 let timestamp;
 if(options.timestamp_entity){timestamp=parse(states[options.timestamp_entity]?.state);}
 else {const ids=[...new Set(entities.filter(Boolean))];const times=ids.map(id=>parse(states[id]?.last_updated));if(!ids.length||times.some(t=>!Number.isFinite(t)))return {status:'unknown',source};timestamp=Math.min(...times);}
 if(!Number.isFinite(timestamp)||!Number.isFinite(now)||timestamp>now+120000)return {status:'unknown',source};
 const ageMinutes=Math.max(0,(now-timestamp)/60000),limit=number(options.max_age_minutes);
 return {status:ageMinutes>=(limit!==null&&limit>0?limit:60)?'stale':'fresh',source,timestamp,ageMinutes};
}
export function freshnessText(info,lang='es') {
 if(info.status==='disabled')return '';
 const words={es:['Fecha de lectura no disponible','ahora','hace {n} {u}','Cambio más antiguo'],en:['Reading time unavailable','just now','{n} {u} ago','Oldest state change'],fr:['Horodatage indisponible','à l’instant','il y a {n} {u}','Changement le plus ancien'],pt:['Data de leitura indisponível','agora','há {n} {u}','Alteração mais antiga'],de:['Messzeitpunkt nicht verfügbar','gerade eben','vor {n} {u}','Älteste Zustandsänderung'],it:['Data di lettura non disponibile','adesso','{n} {u} fa','Modifica di stato più vecchia'],nl:['Meettijdstip niet beschikbaar','zojuist','{n} {u} geleden','Oudste statuswijziging']}[lang]??['Reading time unavailable','just now','{n} {u} ago','Oldest state change'];
 if(info.status==='unknown')return words[0];
 const minutes=Math.floor(info.ageMinutes),amount=minutes<60?minutes:minutes<1440?Math.floor(minutes/60):Math.floor(minutes/1440),unit=minutes<60?'min':minutes<1440?'h':lang==='fr'?'j':'d';
 const ago=minutes<1?words[1]:words[2].replace('{n}',amount).replace('{u}',unit);
 const label=info.source==='changes'?words[3]:translate('Última lectura',lang);
 return `${info.status==='stale'?translate('Datos antiguos',lang)+' · ':''}${label} · ${ago}`;
}

export function readingEntities(block){
 if(block.type==='start')return (block.fields??[]).map(f=>f.entity).filter(Boolean);
 const entities=[];const collect=(value,key='')=>{if(value&&typeof value==='object')for(const [k,v]of Object.entries(value))collect(v,k);else if(typeof value==='string'&&(key==='entity'||key.endsWith('_entity')||Object.hasOwn(POSITIONS,key))&&/^[a-z_]+\.[a-z0-9_]+$/.test(value))entities.push(value);};collect(block);return [...new Set(entities)];
}
export function collectCardAlerts(config,states={},lang='es',now=Date.now()){
 const options=config.alerts??{};if(!options.enabled)return [];
 const alerts=new Map();const add=alert=>{const key=alert.kind+':'+(alert.entity||alert.block);const old=alerts.get(key);if(!old||alert.severity==='critical')alerts.set(key,alert);};
 for(const block of config.blocks??[]){
  if(options.include_values!==false){const fields=[...(block.fields??[]),...(block.prices??[]),...(block.groups??[]).flatMap(g=>g.fields??[])];for(const f of fields){const state=states[f.entity],severity=valueSeverity(state?.state,f.colors);if(['warning','critical'].includes(severity))add({kind:'value',entity:f.entity,block:block.id,severity,label:f.name||state?.attributes?.friendly_name||f.entity,value:stateText(state,f,lang)});}}
  if(block.type==='tyres'){
   if(options.include_tyres!==false){const unit=['bar','kPa','psi'].includes(block.unit)?block.unit:'bar';for(const [key,label]of Object.entries(POSITIONS)){const entity=block.positions?.[key],state=states[entity],n=pressure(state?.state,state?.attributes?.unit_of_measurement,unit),severity=valueSeverity(n,block[key.startsWith('front')?'pressure_colors_front':'pressure_colors_rear']??block.pressure_colors);if(['warning','critical'].includes(severity))add({kind:'tyre',entity,block:block.id,severity,label:translate(label,lang),value:format(n,block.decimals??2,lang)+' '+unit});}}
   if(options.include_openings!==false)for(const [key,label]of Object.entries(BODY_PARTS)){const f=block.body_parts?.[key];if(f?.entity&&openingState(states[f.entity],f)==='open')add({kind:'opening',entity:f.entity,block:block.id,severity:'warning',label:f.name||translate(label,lang),value:translate('Abierto',lang)});}
  }
  if(options.include_stale!==false){const info=readingFreshness(block.freshness,states,readingEntities(block),now);if(info.status==='stale')add({kind:'stale',entity:block.freshness?.timestamp_entity||'',block:block.id,severity:'warning',label:block.title||translate(TYPES[block.type]||'Información',lang),value:freshnessText(info,lang)});}
 }
 return [...alerts.values()].sort((a,b)=>(b.severity==='critical')-(a.severity==='critical'));
}

export function recommendedPressure(block,axle){
 const full=block.pressure_advice?.profile==='full';
 const value=number(full?block.pressure_advice?.['full_'+axle+'_bar']:block['recommended_'+axle+'_bar']);
 return value!==null&&value>0?value:null;
}
export function tyreAdvice(block,states={},now=Date.now()){
 const options=block.pressure_advice??{};if(!options.enabled)return null;
 const automatic=options.temperature_mode==='location',locationState=states[options.location_entity]?.state;
 const location=automatic?(!locationState||['unknown','unavailable','none','null',''].includes(String(locationState).toLowerCase())?'unknown':locationState===(options.home_value||'home')?'home':'away'):'fixed';
 const temperatureEntity=location==='unknown'?'':location==='away'?options.away_temperature_entity:options.temperature_entity;
 const tempState=states[temperatureEntity],raw=number(tempState?.state),unit=tempState?.attributes?.unit_of_measurement;
 const maxAge=number(options.max_temperature_age_minutes),ageLimit=maxAge!==null&&maxAge>0?maxAge:30;
 const age=now-Date.parse(tempState?.last_reported??tempState?.last_updated),fresh=Number.isFinite(age)&&age>=-120000&&age<=ageLimit*60000;
 const temperature=fresh&&raw!==null?(unit==='°C'?raw:unit==='°F'?(raw-32)*5/9:null):null;
 const trip=readingFreshness({enabled:true,timestamp_entity:options.trip_end_entity||'sensor.__no_trip',max_age_minutes:120},states,[],now);
 return {temperatureEntity,location,profile:options.profile==='full'?'full':'normal',recentTrip:trip.status==='fresh',heat:temperature!==null&&temperature>=30,temperature};
}
