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
    chargerLimit:options.charger_limit_entity||byUnit(limitsBlock?.fields,'%'),
    energyLimit:options.energy_limit_entity||byUnit(limitsBlock?.fields,'kWh'),
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

export function batteryVehicleLimitField(block){
  const entity=block.battery?.vehicle_limit_entity;
  if(typeof entity!=='string'||!entity)return;
  return {id:block.id+':vehicle-limit',name:'Máximo en el coche',entity,unit:'%',decimals:0,
    read_only:!['number','input_number'].includes(entity.split('.')[0])};
}

export function batteryChargeSummary(sources,vehicleEntity,states){
  const activeLimits=[
    [vehicleEntity,'Límite del coche'],
    [sources.chargerLimit,'Límite del cargador']
  ].filter(([entity])=>entity).map(([entity,label])=>[number(states[entity]?.state),label]);
  let target,source;
  if(activeLimits.length&&activeLimits.every(([value])=>value!==null&&value>=0&&value<=100)){
    target=Math.min(...activeLimits.map(([value])=>value));
    const matching=activeLimits.filter(([value])=>value===target);
    source=matching.length>1?'Límite del coche y del cargador':matching[0][1];
  }
  const amount=number(states[sources.energyLimit]?.state);
  return {target,source,energy:amount!==null&&amount>=0?amount:undefined};
}

export function renderBattery(card,block,sources,renderSection){
  const t=label=>escape(card.t(label)),state=card.state;
  const reading=(id,decimals)=>escape(stateText(state[id],{decimals},card.lang));
  const infoTarget=id=>state[id]?` data-entity="${escape(id)}"`:' disabled';
  const metric=(id,icon,label)=>`<button type="button" class="battery-metric"${infoTarget(id)}><ha-icon icon="mdi:${icon}"></ha-icon><span><strong>${reading(id,0)}</strong><small>${t(label)}</small></span></button>`;
  const options=block.battery??{};
  const powerBlock=sources.powerBlock;
  const powerFields=(powerBlock?.fields??[]).filter(field=>field.entity!==sources.power&&field.entity!==sources.intensity);
  const vehicleLimit=batteryVehicleLimitField(block);
  const limits=sources.limitsBlock;
  const limitControls=vehicleLimit
    ? {...(limits??{id:block.id+':limits',title:t('Límites de carga'),type:'limits'}),fields:[...(limits?.fields??[]),vehicleLimit]}
    : limits;
  const level=percentage(state[sources.level]?.state);
  const power=number(state[sources.power]?.state);
  const connector=state[sources.connector]?.state;
  const connected=connector==='on';
  const charging=power!==null?power>0:state[sources.charging]?.state===sources.chargingValue;
  const status=options.show_preheating===true?state[options.preheat_state_entity]?.state:undefined;
  const heatLabel=({on:'Activo',off:'Apagado',unknown:'Desconocido',unavailable:'No disponible'})[status]??'Sin datos';
  const summary=batteryChargeSummary(sources,vehicleLimit?.entity,state);
  const reason=connected&&power===0&&!charging?state[options.wait_reason_entity]?.state?.trim():undefined;
  const wait=connected&&power===0&&!charging
    ? reason&&!['unknown','unavailable'].includes(reason)?reason:card.t('En espera')
    : undefined;
  const liveLabel=charging?'Cargando':connected?'Conectado':connector==='off'?'Desconectado':'Sin datos';
  const pct=level===null?'—':format(level,0,card.lang)+' %';
  const heatButton=(op,icon,label)=>`<button type="button" data-battery-heat="${op}" ${batteryPreheatAction(block,card._hass,op)?'':'disabled'}><ha-icon icon="mdi:${icon}"></ha-icon>${t(label)}</button>`;
  return `<div class="battery-panel">
    <div class="battery-metrics">
      ${metric(sources.range,'road-variant','Autonomía')}
      ${metric(sources.power,'lightning-bolt-outline','Potencia de carga')}
      <span class="battery-connector ${connected||charging?'battery-connected':''}"><ha-icon icon="mdi:power-plug-outline"></ha-icon>${t(liveLabel)}</span>
    </div>
    ${sources.intensity||powerFields.length?`<div class="battery-power">
      ${sources.intensity?`<span><small>${t('Intensidad configurada')}</small><strong>${reading(sources.intensity,0)}</strong></span>`:''}
      ${powerFields.map(field=>`<button type="button" class="battery-power-reading" data-field="${escape(field.id)}"><small>${escape(card.label(field.name)||state[field.entity]?.attributes?.friendly_name||field.entity)}</small><strong>${escape(stateText(state[field.entity],field,card.lang))}</strong></button>`).join('')}
    </div>`:''}
    <div class="battery-top">
      <button type="button" class="battery-illustration ${charging?'battery-charging':''} ${status==='on'?'battery-heating':''}" aria-label="${t('Batería')} · ${level===null?t('Sin datos'):escape(pct)}"${infoTarget(sources.level)}>
        <img src="${batteryChassis}" alt="" width="960" height="436">
        <span class="battery-pack"><span class="battery-glow" style="width:${level??0}%"></span>${charging?`<span class="battery-flow" style="animation-delay:-${Date.now()%1800}ms"></span>`:''}</span>
        <strong class="battery-soc" aria-hidden="true">${escape(pct)}</strong>
      </button>
      ${options.show_preheating===true?`<div class="battery-preheat ${status==='on'?'battery-heat-active':''}"><div><ha-icon icon="mdi:thermometer"></ha-icon><strong>${t('Precalentamiento')}</strong><span role="status">${t(heatLabel)}</span></div><div class="battery-preheat-buttons">${heatButton('start','heat-wave','Iniciar')}${heatButton('stop','stop-circle-outline','Detener')}</div></div>`:''}
    </div>
    ${summary.target!==undefined||summary.energy!==undefined||wait?`<div class="battery-summary">
      ${summary.target!==undefined?`<span>${t('Objetivo de carga')} <strong>${format(summary.target,Number.isInteger(summary.target)?0:1,card.lang)} %</strong> · ${t(summary.source)}</span>`:''}
      ${summary.energy!==undefined?`<span>${t('Tope de energía')} <strong>${format(summary.energy,Number.isInteger(summary.energy)?0:2,card.lang)} kWh</strong></span>`:''}
      ${wait?`<span><ha-icon icon="mdi:timer-outline"></ha-icon>${escape(wait)}</span>`:''}
    </div>`:''}
    ${block.fields?.length?card.controls(block,true):''}
    ${limitControls?`<div class="battery-adjustments">
      ${limitControls?`<div class="battery-limits">${renderSection(limitControls)}</div>`:''}
    </div>`:''}
  </div>`;
}

export const batteryStyles=`
.battery-panel{display:grid;gap:8px;padding:4px 12px 10px;container-type:inline-size}
.battery-metrics{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px}
.battery-metrics>span,.battery-metric,.battery-preheat>div{display:flex;align-items:center;gap:6px}
.battery-panel .battery-metric,.battery-panel .battery-illustration{padding:0;border:0;font:inherit}
.battery-metric{background:transparent;color:inherit;text-align:start}
.battery-panel .battery-metric strong{font-size:20px;line-height:1.15;color:var(--primary-text-color)}
.battery-metric ha-icon{color:var(--primary-color)}
.battery-metrics .battery-connector{font-weight:600}
.battery-panel :is(.battery-metric,.battery-illustration):disabled{opacity:1;cursor:default}
.battery-panel :is(.battery-metric,.battery-illustration):focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
.battery-metrics ha-icon,.battery-preheat ha-icon{--mdc-icon-size:19px}
.battery-metrics small{display:block;color:var(--secondary-text-color)}
.battery-connector,.battery-preheat [role=status]{border:1px solid var(--divider-color);border-radius:20px;padding:3px 8px}
.battery-metrics .battery-connected{border-color:var(--primary-color);color:var(--primary-text-color)}
.battery-connected ha-icon{color:var(--primary-color)}
.battery-summary{display:flex;flex-wrap:wrap;gap:6px 14px;color:var(--secondary-text-color);font-size:12px}
.battery-summary>span{display:inline-flex;align-items:center;flex-wrap:wrap;gap:4px}
.battery-panel .battery-summary strong{color:var(--primary-text-color);font-size:13px;line-height:1.25;font-weight:700}
.battery-summary ha-icon{--mdc-icon-size:16px}
.battery-top{display:grid;align-items:center;gap:8px}
.battery-illustration{display:block;width:100%;position:relative;isolation:isolate;overflow:hidden;border-radius:10px;background:transparent}
.battery-illustration img{display:block;width:100%;height:auto}
.battery-pack{position:absolute;inset:29.5% 22.5% 21.5% 25.1%;clip-path:polygon(7% 0,93% 0,97% 11%,100% 84%,98% 100%,2% 100%,0% 87%,4% 12%);mix-blend-mode:screen}
.battery-glow{display:block;height:100%;background:linear-gradient(90deg,#13de22a6,#09f32ba6 94%,#7dff8d);box-shadow:0 0 12px #56ff60;transition:width .28s}
.battery-glow[style="width:0%"]{box-shadow:none}
.battery-flow{position:absolute;inset:0;pointer-events:none;--flow-color:#6bff7fc9;background:linear-gradient(103deg,transparent 22%,var(--flow-color) 52%,transparent 78%) repeat-x;background-size:33.333% 100%;animation:battery-charge-flow 1800ms linear infinite}
.battery-heating .battery-flow{--flow-color:#ffbd68cb}
.battery-heating .battery-glow{background:linear-gradient(90deg,#ff830066,#ffa126a8 95%,#ffd375);box-shadow:0 0 12px #ffa126}
.battery-heating .battery-soc{color:#ffe1ac}
.battery-soc{position:absolute;inset:0;display:grid;place-items:center;color:white;font-size:clamp(26px,10cqw,52px);text-shadow:0 2px 8px black}
@keyframes battery-charge-flow{from{background-position:0 0}to{background-position:100% 0}}
@media(prefers-reduced-motion:reduce){.battery-glow{transition:none}.battery-flow{display:none}}
.battery-preheat{display:grid;gap:3px;border:1px solid var(--divider-color);border-radius:8px;padding:4px 6px}
.battery-panel .battery-preheat strong{font-size:14px;line-height:1.2}
.battery-preheat ha-icon{--mdc-icon-size:15px}
.battery-preheat>div{flex-wrap:wrap}
.battery-preheat>.battery-preheat-buttons{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch}
.battery-preheat [role=status]{font-size:11px;line-height:1.2;padding:2px 6px}
.battery-heat-active{border-color:var(--warning-color,#f79e21)}
.battery-heat-active [role=status]{background:var(--warning-color,#f79e21);color:#231605;border-color:transparent}
.battery-panel button[data-battery-heat]{display:inline-flex;align-items:center;justify-content:center;gap:4px;min-width:44px;border:1px solid var(--divider-color);border-radius:8px;background:var(--secondary-background-color);color:var(--primary-text-color)}
.battery-panel button[data-battery-heat]{min-height:34px;padding:2px 5px;font-size:12px}
.battery-panel button:disabled{opacity:.48}
.battery-panel .mode-grid{margin:0;padding:0;gap:6px;grid-template-columns:repeat(2,minmax(0,1fr))}
.battery-panel .mode-button{margin:0}
.battery-panel .mode-button small{display:none}
.battery-panel .mode-button:disabled small{display:block}
.battery-adjustments{border-top:1px solid var(--divider-color);padding-top:6px}
.battery-adjustments{display:grid;align-items:center;gap:8px}
.battery-adjustments section>header{padding:2px 0;font-size:14px}
.battery-power{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px 8px}
.battery-power>span,.battery-panel .battery-power-reading{display:flex;align-items:center;justify-content:space-between;gap:4px;padding:2px 5px;text-align:start;overflow-wrap:anywhere;min-width:0}
.battery-panel .battery-power-reading{min-height:30px;border:0;background:transparent;color:inherit}
.battery-panel .battery-power-reading:focus-visible{outline:2px solid var(--primary-color);outline-offset:1px}
.battery-panel .battery-power-reading:hover strong{color:var(--primary-color)}
.battery-power small{color:var(--secondary-text-color);font-size:11px;line-height:1.2}
.battery-panel .battery-power strong{font-size:12px;line-height:1.2;text-align:end;flex-shrink:0;max-width:55%;color:var(--primary-text-color)}
.battery-adjustments .charge-limits{margin:0;padding:4px 6px;display:grid;gap:0}
.battery-adjustments .limit-row{margin:0;min-width:0}
.battery-panel .limit-heading strong{font-size:15px;line-height:1.3}
.battery-adjustments .limit-row input{margin:0;min-height:24px}
.battery-adjustments .limit-row+.limit-row{border-top:1px solid var(--divider-color);padding-top:3px}
@container (min-width:440px){.battery-adjustments .charge-limits{grid-template-columns:repeat(auto-fit,minmax(min(100%,110px),1fr));gap:8px}.battery-adjustments .limit-row+.limit-row{border-top:0;padding-top:0}.battery-power{grid-template-columns:repeat(auto-fit,minmax(155px,1fr))}}
@container (min-width:540px){.battery-top:has(.battery-preheat){grid-template-columns:minmax(0,2.6fr) minmax(0,1fr)}}
`;
