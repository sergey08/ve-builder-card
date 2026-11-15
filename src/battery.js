import {escape,format,number,percentage,stateText} from './core.js';
import {standardLabel} from './i18n.js';
import {batteryChassis} from './battery-image.js';

export function isBatteryBlock(block){
  if(block.type==='battery')return true;
  if(block.type!=='modes'||block.battery?.enabled===false)return false;
  return block.battery?.enabled===true||standardLabel(block.title,'es')==='Modos de carga';
}

export function batterySources(block,blocks,states){
  const options=block.battery??{};
  const start=blocks.find(item=>item.type==='start');
  const automatic=blocks.find(isBatteryBlock)===block;
  const linked=(kind)=>{
    const candidates=blocks.filter(item=>item.type===kind);
    if(options[kind+'_block']==='none')return undefined;
    if(options[kind+'_block'])return candidates.find(item=>item.id===options[kind+'_block']);
    return automatic&&candidates.length===1?candidates[0]:undefined;
  };
  const powerBlock=linked('power'),limitsBlock=linked('limits');
  const fields=start?.fields??[];
  const byUnit=(list,unit)=>list?.find(field=>(field.unit||states[field.entity]?.attributes?.unit_of_measurement)===unit)?.entity;
  const byLabel=label=>fields.find(field=>standardLabel(field.name,'es')===label)?.entity;
  const primary=powerBlock?.fields?.find(field=>field.display==='bar')??powerBlock?.fields?.[0];
  return {
    powerBlock,limitsBlock,
    level:options.level_entity||byLabel('Batería')||byUnit(fields,'%'),
    range:options.range_entity||byLabel('Autonomía')||byUnit(fields,'km')||byUnit(fields,'mi'),
    connector:options.connector_entity||start?.connector_entity,
    charging:options.charging_entity||start?.charging_entity,
    chargingValue:options.charging_value||(options.charging_entity?'on':start?.charging_value??'Charging'),
    power:options.power_entity||start?.power_entity||primary?.entity,
    intensity:options.intensity_entity||byUnit(powerBlock?.fields,'A')||powerBlock?.fields?.find(field=>standardLabel(field.name,'es')==='Intensidad configurada')?.entity
  };
}

export function batteryPreheatAction(block,hass,operation){
  if(!['start','stop'].includes(operation))return;
  const options=block.battery??{};
  if(options.show_preheating!==true||!options.preheat_target_entity)return;
  const status=hass.states?.[options.preheat_state_entity]?.state;
  if(status!==(operation==='start'?'off':'on'))return;
  const serviceId=options[operation+'_service']??('xpeng.'+operation+'_battery_preheating');
  const match=typeof serviceId==='string'&&serviceId.match(/^([a-z0-9_]+)\.([a-z0-9_]+)$/);
  if(!match||!hass.services?.[match[1]]?.[match[2]])return;
  const [ ,domain,service]=match;
  if(domain==='xpeng')return {domain,service,data:{vehicle_entity_id:options.preheat_target_entity}};
  return {domain,service,target:{entity_id:options.preheat_target_entity}};
}

export function batteryIntensityAction(entity,state,direction){
  if(![-1,1].includes(direction)||!entity||!['number','input_number'].includes(entity.split('.')[0]))return;
  const value=number(state?.state);
  const {min,max,step=1}=state?.attributes??{};
  if(value===null||number(min)===null||number(max)===null||number(step)===null||Number(step)<=0||Number(max)<=Number(min))return;
  const next=Math.max(Number(min),Math.min(Number(max),Number((value+step*direction).toFixed(8))));
  if(next===value)return;
  return {domain:entity.split('.')[0],service:'set_value',data:{entity_id:entity,value:next}};
}

export function renderBattery(card,block,sources,renderSection){
  const t=label=>escape(card.t(label)),state=card.state;
  const reading=(id,decimals)=>escape(stateText(state[id],{decimals},card.lang));
  const options=block.battery??{};
  const level=percentage(state[sources.level]?.state);
  const power=number(state[sources.power]?.state);
  const connector=state[sources.connector]?.state;
  const connected=connector==='on';
  const charging=power!==null?power>0:state[sources.charging]?.state===sources.chargingValue;
  const status=options.show_preheating===true?state[options.preheat_state_entity]?.state:undefined;
  const heatLabel=({on:'Activo',off:'Apagado',unknown:'Desconocido',unavailable:'No disponible'})[status]??'Sin datos';
  const liveLabel=charging?'Cargando':connected?'Conectado':connector==='off'?'Desconectado':'Sin datos';
  const pct=level===null?'—':format(level,0,card.lang)+' %';
  const intensityButton=(dir,icon,label)=>`<button type="button" data-battery-intensity="${dir}" aria-label="${t(label)}" ${batteryIntensityAction(sources.intensity,state[sources.intensity],dir)?'':'disabled'}><ha-icon icon="mdi:${icon}"></ha-icon></button>`;
  const heatButton=(op,icon,label)=>`<button type="button" data-battery-heat="${op}" ${batteryPreheatAction(block,card._hass,op)?'':'disabled'}><ha-icon icon="mdi:${icon}"></ha-icon>${t(label)}</button>`;
  return `<div class="battery-panel">
    <div class="battery-metrics">
      <span><ha-icon icon="mdi:road-variant"></ha-icon><span><strong>${reading(sources.range,1)}</strong><small>${t('Autonomía')}</small></span></span>
      <span><ha-icon icon="mdi:lightning-bolt-outline"></ha-icon><span><strong>${reading(sources.power,1)}</strong><small>${t('Potencia de carga')}</small></span></span>
      <span class="battery-connector ${connected||charging?'battery-connected':''}"><ha-icon icon="mdi:power-plug-outline"></ha-icon>${t(liveLabel)}</span>
    </div>
    <div class="battery-top">
      <div class="battery-illustration ${charging?'battery-charging':''} ${status==='on'?'battery-heating':''}" role="img" aria-label="${t('Batería')} · ${level===null?t('Sin datos'):escape(pct)}">
        <img src="${batteryChassis}" alt="" width="1040" height="472">
        <div class="battery-pack"><div class="battery-glow" style="width:${level??0}%"></div></div>
        <strong class="battery-soc" aria-hidden="true">${escape(pct)}</strong>
      </div>
      ${options.show_preheating===true?`<div class="battery-preheat ${status==='on'?'battery-heat-active':''}"><div><ha-icon icon="mdi:thermometer"></ha-icon><strong>${t('Precalentamiento')}</strong><span role="status">${t(heatLabel)}</span></div><div>${heatButton('start','heat-wave','Iniciar')}${heatButton('stop','stop-circle-outline','Detener')}</div></div>`:''}
    </div>
    ${block.fields?.length?card.controls(block,true):''}
    ${sources.intensity||sources.limitsBlock?`<div class="battery-adjustments">
      ${sources.limitsBlock?renderSection(sources.limitsBlock):''}
      ${sources.intensity?`<div class="battery-current"><span>${t('Intensidad configurada')} <strong>${reading(sources.intensity,1)}</strong></span><div>${intensityButton(-1,'minus','Reducir intensidad')}${intensityButton(1,'plus','Aumentar intensidad')}</div></div>`:''}
    </div>`:''}
    ${sources.powerBlock?`<details data-battery-details><summary>${t('Potencia de carga')}</summary>${renderSection(sources.powerBlock)}</details>`:''}
  </div>`;
}

export const batteryStyles=`
.battery-panel{display:grid;gap:8px;padding:4px 12px 10px;container-type:inline-size}
.battery-metrics,.battery-current{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px}
.battery-metrics>span,.battery-current>div,.battery-preheat>div{display:flex;align-items:center;gap:6px}
.battery-metrics ha-icon,.battery-preheat ha-icon{--mdc-icon-size:19px}
.battery-metrics small{display:block;color:var(--secondary-text-color)}
.battery-connector,.battery-preheat [role=status]{border:1px solid var(--divider-color);border-radius:20px;padding:3px 8px}
.battery-connected{color:var(--success-color,#258640)}
.battery-top{display:grid;align-items:center;gap:8px}
.battery-illustration{position:relative;isolation:isolate;overflow:hidden;border-radius:10px;background:#0e1e2a}
.battery-illustration img{display:block;width:100%;height:auto}
.battery-pack{position:absolute;inset:28.5% 22.5% 25% 25.1%;clip-path:polygon(7% 0,93% 0,97% 11%,100% 84%,98% 100%,2% 100%,0% 87%,4% 12%);mix-blend-mode:screen}
.battery-glow{height:100%;background:linear-gradient(90deg,#13de22a6,#09f32ba6 94%,#7dff8d);box-shadow:0 0 12px #56ff60;transition:width .28s}
.battery-glow[style="width:0%"]{box-shadow:none}
.battery-charging .battery-glow{animation:battery-charge 1.8s ease-in-out infinite alternate}
.battery-heating .battery-glow{background:linear-gradient(90deg,#ff830066,#ffa126a8 95%,#ffd375);box-shadow:0 0 12px #ffa126}
.battery-heating .battery-soc{color:#ffe1ac}
.battery-soc{position:absolute;inset:0;display:grid;place-items:center;color:white;font-size:clamp(26px,10cqw,52px);text-shadow:0 2px 8px black}
@keyframes battery-charge{from{opacity:.68}to{opacity:1}}
@media(prefers-reduced-motion:reduce){.battery-glow{transition:none}.battery-charging .battery-glow{animation:none}}
.battery-preheat{display:grid;gap:5px;border:1px solid var(--divider-color);border-radius:10px;padding:7px}
.battery-preheat>div{flex-wrap:wrap}
.battery-preheat [role=status]{font-size:12px}
.battery-heat-active{border-color:var(--warning-color,#f79e21)}
.battery-heat-active [role=status]{background:var(--warning-color,#f79e21);color:#231605;border-color:transparent}
.battery-panel button[data-battery-heat],.battery-panel button[data-battery-intensity]{display:inline-flex;align-items:center;justify-content:center;gap:4px;min-width:44px;border:1px solid var(--divider-color);border-radius:8px;background:var(--secondary-background-color);color:var(--primary-text-color)}
.battery-panel button:disabled{opacity:.48}
.battery-panel .mode-grid{margin:0;padding:0;gap:6px;grid-template-columns:repeat(auto-fit,minmax(min(100%,98px),1fr))}
.battery-panel .mode-button{margin:0}
.battery-panel .mode-button small{display:none}
.battery-panel .mode-button:disabled small{display:block}
.battery-adjustments,.battery-panel details{border-top:1px solid var(--divider-color);padding-top:6px}
.battery-adjustments{display:grid;align-items:center;gap:8px}
.battery-adjustments section>header{padding:3px 0}
.battery-adjustments .charge-limits{margin:0;padding:0;display:grid;gap:6px}
.battery-adjustments .limit-row{margin:0;min-width:0}
@container (min-width:440px){.battery-adjustments .charge-limits{grid-template-columns:repeat(auto-fit,minmax(min(100%,110px),1fr))}}
@container (min-width:580px){.battery-adjustments:has(section):has(.battery-current){grid-template-columns:2fr 1fr}.battery-current{border-left:1px solid var(--divider-color);padding-inline-start:8px}}
.battery-panel summary{cursor:pointer;padding-block:6px;font-weight:600}
@container (min-width:540px){.battery-top:has(.battery-preheat){grid-template-columns:minmax(0,2.6fr) minmax(0,1fr)}}
`;
