import {language,translate} from './i18n.js';
import {VERSION,TYPES,POSITIONS,escape,format,number,percentage,pressure,imageUrl,stateText,normalize,actionFor,newBlock,BODY_PARTS,openingState,valueSeverity,readingFreshness,freshnessText,readingEntities,collectCardAlerts} from './core.js';
import {styles,compactStyles,powerLayoutStyles,vehicleMapStyles,valueColorStyles,recommendationStyles,freshnessStyles,alertSummaryStyles} from './styles.js';
import './editor.js';

export class VEBuilderCard extends HTMLElement {
  get lang(){return language(this.config,this._hass);}
  t(value){return translate(value,this.lang);}
  static getConfigElement(){return document.createElement('ve-builder-card-editor');}
  static getStubConfig(){return {type:'custom:ve-builder-card',title:'Mi vehículo',blocks:[newBlock('start')]};}
  setConfig(config){this.config=normalize(config);this._dirty=true;this._configSignature=JSON.stringify(this.config);this._entities=new Set(this._configSignature.match(/[a-z_]+\.[a-z0-9_]+/g)??[]);if(!this.shadowRoot)this.attachShadow({mode:'open'});this.render();this.syncFreshnessTimer();}
  set hass(hass){this._hass=hass;this.render();}
  connectedCallback(){this.syncFreshnessTimer();this.updateFreshness();}
  disconnectedCallback(){if(this._freshnessTimer){window.clearInterval(this._freshnessTimer);this._freshnessTimer=null;}if(this._visibilityHandler){document.removeEventListener('visibilitychange',this._visibilityHandler);this._visibilityHandler=null;}}
  syncFreshnessTimer(){
    const enabled=this.config?.blocks?.some(b=>b.freshness?.enabled);
    if(!enabled){if(this._freshnessTimer){window.clearInterval(this._freshnessTimer);this._freshnessTimer=null;}if(this._visibilityHandler){document.removeEventListener('visibilitychange',this._visibilityHandler);this._visibilityHandler=null;}return;}
    if(!this.isConnected||typeof window.setInterval!=='function'||this._freshnessTimer)return;
    this._freshnessTimer=window.setInterval(()=>{if(document.visibilityState!=='hidden')this.updateFreshness();},60000);
    this._visibilityHandler=()=>{if(document.visibilityState!=='hidden')this.updateFreshness();};document.addEventListener('visibilitychange',this._visibilityHandler);
  }
  blockFreshness(block){
    return readingFreshness(block.freshness,this.state,readingEntities(block));
  }
  freshnessBadge(block,info){
    if(info.status==='disabled')return '';
    const title=info.source==='changes'?this.t('Basado en el cambio más antiguo de las entidades del apartado. Un valor sin cambios puede seguir siendo válido; configura un sensor de fecha para conocer la lectura real.'):this.t('Basado en la fecha indicada por el sensor seleccionado; que el coche esté dormido no implica una avería.');
    return `<div class="reading-age ${info.status==='stale'?'reading-old':''}" data-freshness="${escape(block.id)}" title="${escape(title)}">${escape(freshnessText(info,this.lang))}</div>`;
  }
  updateFreshness(){
    if(!this.config||!this._hass||!this.shadowRoot)return;
    for(const el of this.shadowRoot.querySelectorAll('[data-freshness]')){const block=this.config.blocks.find(b=>b.id===el.dataset.freshness);if(!block)continue;const info=this.blockFreshness(block);el.textContent=freshnessText(info,this.lang);el.classList.toggle('reading-old',info.status==='stale');el.closest('section')?.classList.toggle('data-stale',info.status==='stale');}
    this.refreshAlertSummary();
  }
  alertSummary(){
    const alerts=collectCardAlerts(this.config,this.state,this.lang);if(!alerts.length)return '';
    const counts={};for(const a of alerts)counts[a.kind]=(counts[a.kind]??0)+1;
    const labels=this.lang==='en'?{tyre:['tyre alert','tyre alerts'],opening:['open part','open parts'],value:['value alert','value alerts'],stale:['old reading','old readings']}:{tyre:['neumático en aviso','neumáticos en aviso'],opening:['apertura','aperturas'],value:['valor en aviso','valores en aviso'],stale:['lectura antigua','lecturas antiguas']};
    const summary=Object.entries(counts).map(([kind,n])=>n+' '+labels[kind][n===1?0:1]).join(' · ');
    return `<details class="alert-summary ${alerts.some(a=>a.severity==='critical')?'has-critical':''}"><summary><ha-icon icon="mdi:alert-outline"></ha-icon><span>${escape(summary)}</span></summary><div class="alert-items">${alerts.map(a=>{const label=a.label+': '+a.value;return a.entity&&this.state[a.entity]?`<button type="button" class="alert-item ${a.severity==='critical'?'alert-critical':''}" data-alert-entity="${escape(a.entity)}"><ha-icon icon="${a.severity==='critical'?'mdi:alert-circle-outline':'mdi:alert-outline'}"></ha-icon><span>${escape(label)}</span><ha-icon icon="mdi:chevron-right"></ha-icon></button>`:`<p class="alert-item">${escape(label)}</p>`;}).join('')}<p class="alert-note">${this.t('Según las últimas lecturas recibidas. Pulsa un aviso para ver la entidad; no se envían órdenes.')}</p></div></details>`;
  }
  bindAlertSummary(){const host=this.shadowRoot.querySelector?.('[data-alert-summary]');if(!host)return;host._alertMarkup=this.alertSummary();host.onclick=event=>{const button=event.target.closest?.('[data-alert-entity]');if(button&&host.contains(button))this.moreInfo(button.dataset.alertEntity);};}
  refreshAlertSummary(){const host=this.shadowRoot.querySelector?.('[data-alert-summary]');if(!host)return;const html=this.alertSummary();if(host._alertMarkup===html)return;const open=host.querySelector('details')?.open;host.innerHTML=html;host._alertMarkup=html;if(open&&host.querySelector('details'))host.querySelector('details').open=true;}
  getCardSize(){return Math.max(2,(this.config?.blocks.length??1)*2);}
  getGridOptions(){return {columns:12,rows:'auto'};}
  get state(){return this._hass?.states??{};}
  moreInfo(entity){if(entity&&this.state[entity])this.dispatchEvent(new CustomEvent('hass-more-info',{detail:{entityId:entity},bubbles:true,composed:true}));}
  date(entity){const date=Date.parse(this.state[entity]?.last_updated);return Number.isFinite(date)?new Date(date).toLocaleString(this.lang==='es'?'es-ES':'en-US'):this.t('Sin fecha');}
  severity(field,value=this.state[field.entity]?.state){const severity=valueSeverity(value,field.colors);return severity?'value-'+severity:'';}
  field(field,forced){
    const state=this.state[field.entity],display=forced??field.display??'info',size=['small','medium','large'].includes(field.size)?field.size:'small',style=['subtle','outline','accent'].includes(field.style)?field.style:'subtle';
    const label=field.name||state?.attributes?.friendly_name||this.t('Elige una entidad'),value=stateText(state,field,this.lang),icon=field.icon||state?.attributes?.icon||'mdi:information-outline';
    const pct=percentage(state?.state,field.min??0,field.max??100),width=field.width==='full'?'field-full':'';
    const controlled=['toggle','press'].includes(field.tap),disabled=controlled&&!actionFor(field.entity,state,field.tap);
    const compact=display==='info'&&size==='small';
    return `<button class="vehicle-badge configurable-field display-${escape(display)} size-${size} style-${style} ${width} ${this.severity(field)}" data-field="${escape(field.id)}" ${disabled?'disabled':''}><ha-icon icon="${escape(icon)}"></ha-icon><div class="field-content">${compact?`<span class="compact-value">${escape(label)} · ${escape(value)}</span>`:`<span class="field-name">${escape(label)}</span><strong class="field-value">${escape(value)}</strong>`}${display==='bar'?`<div class="field-track" role="progressbar" aria-label="${escape(label)}" aria-valuemin="${escape(field.min??0)}" aria-valuemax="${escape(field.max??100)}" ${number(state?.state)!==null?`aria-valuenow="${escape(Math.max(Number(field.min??0),Math.min(Number(field.max??100),Number(state.state))))}"`:''}><div class="field-fill" style="width:${pct??0}%"></div></div><div class="field-scale">${pct===null?this.t('Configura un intervalo válido'):`${escape(field.min??0)} — ${escape(field.max??100)}`}</div>`:''}</div></button>`;
  }
  fields(fields=[]){return `<div class="vehicle-badges">${fields.length?fields.map(f=>this.field(f)).join(''):`<p class="empty">${this.t('Añade campos desde el editor visual.')}</p>`}</div>`;}
  start(block){
    const plugged=this.state[block.connector_entity]?.state==='on',charging=this.state[block.charging_entity]?.state===(block.charging_value??'Charging');
    const power=number(this.state[block.power_entity]?.state),active=block.power_entity?power!==null&&power>0:charging,animated=active&&block.animate!==false;
    const image=imageUrl(block.image),cable=(plugged||active)&&block.show_cable!==false;
    return this.fields(block.fields)+(block.show_image!==false&&image?`<div class="vehicle ${animated?'is-charging':''}" style="--vehicle-height:${Math.max(80,Math.min(600,number(block.image_height)??210))}px"><img src="${escape(image)}" alt="${escape(this.config.title||this.t('Vehículo'))}" style="height:var(--vehicle-height)"/>${cable?`<svg class="charge-cable ${animated?'cable-animated':'cable-static'}" style="height:var(--vehicle-height)" viewBox="0 0 400 230" aria-hidden="true"><path class="cable-base" d="M12 210 L12 164 Q12 149 30 149 L70 149 Q88 149 88 130 L88 112"/><path class="cable-flow" d="M12 210 L12 164 Q12 149 30 149 L70 149 Q88 149 88 130 L88 112"/><rect x="81" y="102" width="14" height="16" rx="3"/></svg>`:''}${animated?'<div class="charge-glow"></div>':''}${block.show_status!==false&&(block.connector_entity||block.charging_entity)?`<div class="charge-status">${this.t(active?'Cargando':plugged?(block.power_entity&&power===null?'Conectado · Sin datos de potencia':'Conectado · Sin carga'):'Desconectado')}</div>`:''}</div>`:'');
  }
  tyres(block){
    const expanded=!!(block.body_parts&&Object.values(block.body_parts).some(f=>f.entity)||block.gear_entity);
    const coords={front_left:[57,85],front_right:[303,85],rear_left:[57,260],rear_right:[303,260]},unit=['bar','kPa','psi'].includes(block.unit)?block.unit:'bar';
    const values=Object.entries(POSITIONS).map(([key,label])=>{const [x,y]=coords[key],entity=block.positions?.[key],state=this.state[entity],value=pressure(state?.state,state?.attributes?.unit_of_measurement,unit),recommended=pressure(block[key.startsWith('front')?'recommended_front_bar':'recommended_rear_bar'],'bar',unit),hasRecommended=recommended!==null&&recommended>0;return `<g class="tyre ${this.severity({colors:block[key.startsWith('front')?'pressure_colors_front':'pressure_colors_rear']??block.pressure_colors},value)}" role="button" tabindex="0" data-entity="${escape(entity)}" aria-label="${escape(this.t(label))}: ${escape(format(value,block.decimals??2,this.lang))} ${unit}"><text x="${x}" y="${y}" class="pressure">${escape(format(value,block.decimals??2,this.lang))}</text><text x="${x}" y="${y+20}" class="unit">${unit}</text>${hasRecommended?`<text x="${x}" y="${y+36}" class="recommended">${escape(this.t('Rec. en frío'))}: ${escape(format(recommended,unit==='kPa'?0:1,this.lang))} ${unit}</text>`:''}${block.show_dates===false?'':`<text x="${x}" y="${y+(hasRecommended?51:38)}" class="date">${escape(this.date(entity))}</text>`}</g>`;}).join('');
    const parts=Object.entries(BODY_PARTS).filter(([key])=>block.body_parts?.[key]?.entity).map(([key,label])=>{const f=block.body_parts[key],status=openingState(this.state[f.entity],f);return {key,f,label:f.name||this.t(label),status,text:this.t(status==='open'?'Abierto':status==='closed'?'Cerrado':'Sin datos')};});
    const shapes=parts.filter(part=>part.status==='open').map(({key,f,label,status,text})=>{let shape='';const left=key.endsWith('left'),x=left?126:234,y=key.startsWith('front')?120:192;
      if(['bonnet','trunk'].includes(key)){const y=key==='bonnet'?55:285;shape=`<rect x="144" y="${y}" width="72" height="32" rx="12"/>`;}
      else shape=`<path d="M${x} ${y} L${x} ${y+52} L${left?x-6:x+6} ${y+48} Z" transform="rotate(${status==='open'?(left?55:-55):0} ${x} ${y})"/>`;
      return `<g class="body-part state-${status}" role="button" tabindex="0" data-entity="${escape(f.entity)}" aria-label="${escape(label+': '+text)}"><title>${escape(label+': '+text)}</title>${shape}</g>`;
    }).join('');
    const gear=block.gear_entity?stateText(this.state[block.gear_entity],{},this.lang):'';
    const gearSvg=block.gear_entity?`<g class="gear-position" role="button" tabindex="0" data-entity="${escape(block.gear_entity)}" aria-label="${escape(this.t('Marcha')+': '+gear)}"><text x="180" y="164" class="unit">${escape(block.gear_name||this.t('Marcha'))}</text><text x="180" y="195" class="gear-value">${escape(gear)}</text></g>`:'';
    return `<svg class="car ${expanded?'vehicle-map':''}" viewBox="0 0 360 350" aria-label="${escape(this.t('Mapa del vehículo'))}"><text x="180" y="20" class="unit">${this.t('DELANTE')}</text><rect x="126" y="35" width="108" height="295" rx="47" class="body"/><path d="M140 100 Q180 80 220 100 L215 130 L145 130 Z M145 235 L215 235 L218 270 Q180 285 142 270 Z" class="glass"/>${[[115,75],[230,75],[115,260],[230,260]].map(([x,y])=>`<rect x="${x}" y="${y}" width="15" height="44" rx="6" class="wheel"/>`).join('')}${shapes}${gearSvg}${values}</svg>`;
  }
  expenses(block){
    const prices=`<div class="expense-prices">${(block.prices??[]).map(f=>`<button class="${this.severity(f)}" data-field="${escape(f.id)}"><strong>${escape(stateText(this.state[f.entity],f,this.lang))}</strong><span>${escape(f.name||this.t('Precio'))}</span>${f.show_date===false?'':`<em>${this.lang==='es'?'Lectura':'Reading'}: ${escape(this.date(f.entity))}</em>`}</button>`).join('')}</div>`;
    return prices+(block.groups??[]).map(g=>`<div class="expense-group ${['solar','diesel'].includes(g.style)?g.style:'cost'}" style="margin:10px 16px"><div class="expense-label"><ha-icon icon="${escape(g.icon||'mdi:cash')}"></ha-icon>${escape(g.name||'Grupo')}</div><div class="expense-values" style="grid-template-columns:repeat(${Math.max(1,Math.min(4,g.fields?.length??0))},minmax(0,1fr))">${(g.fields??[]).map(f=>`<button class="${this.severity(f)}" data-field="${escape(f.id)}"><span>${escape(f.name||this.t('Importe'))}</span><strong>${escape(stateText(this.state[f.entity],f,this.lang))}</strong></button>`).join('')}</div></div>`).join('');
  }
  controls(block){
    const modes=block.type==='modes';
    return `<div class="${modes?'mode-grid compact-modes':'action-grid compact-actions'}">${(block.fields??[]).map(f=>{
      const state=this.state[f.entity],value=state?.state,lock=f.entity?.startsWith('lock.'),active=lock?value==='locked':value==='on',tap=f.tap??'toggle',disabled=!actionFor(f.entity,state,tap);
      const label=f.name||state?.attributes?.friendly_name||f.entity;
      const status=!state||['unknown','unavailable'].includes(value)?this.t('Sin datos'):lock?this.t(active?'Bloqueado':'Desbloqueado'):this.t(active?'Activo':modes?'Inactivo':'Apagado');
      return `<button class="${modes?'mode-button':'action-button'} ${active?(modes?'mode-active':'selected'):''} size-${escape(f.size??'small')}" data-field="${escape(f.id)}" aria-pressed="${active}" ${disabled?'disabled':''}><ha-icon icon="${escape(f.icon||state?.attributes?.icon||'mdi:flash')}"></ha-icon><span>${escape(label)}</span><small>${escape(status)}</small></button>`;
    }).join('')}</div>`;
  }
  power(block){
    const fields=block.fields??[],primary=fields.find(f=>f.display==='bar')??fields[0];
    if(!primary)return this.fields([]);
    const state=this.state[primary.entity],pct=percentage(state?.state,primary.min??0,primary.max??100),details=fields.filter(f=>f!==primary);
    const value=f=>{const s=this.state[f.entity],n=number(s?.state),unit=f.unit??s?.attributes?.unit_of_measurement??'';return n===null||['unknown','unavailable'].includes(s?.state)?escape(stateText(s,f,this.lang)):`${escape(format(n,f.decimals,this.lang))}${unit?` <small>${escape(unit)}</small>`:''}`;};
    const row=(f,index)=>`<button class="power-detail ${this.severity(f)} ${index===0?'power-intensity':index===1?'power-surplus':'power-summary'}" data-field="${escape(f.id)}"><span>${escape(f.name||this.state[f.entity]?.attributes?.friendly_name)}</span><strong>${value(f)}</strong></button>`;
    const unit=primary.unit??state?.attributes?.unit_of_measurement??'';
    return `<div class="power-panel${this.severity(primary)?' '+this.severity(primary):''}"><button class="power-primary" data-field="${escape(primary.id)}"><div class="power-heading"><span>${escape(primary.name||this.t('Potencia de carga'))}</span><strong>${value(primary)}</strong></div></button>${details.slice(0,2).map(row).join('')}${primary.display==='bar'?`<div class="power-track" role="progressbar" aria-label="${escape(primary.name)}" aria-valuemin="${escape(primary.min??0)}" aria-valuemax="${escape(primary.max??100)}" ${number(state?.state)!==null?`aria-valuenow="${escape(Math.max(primary.min??0,Math.min(primary.max??100,Number(state.state))))}"`:''}><div class="power-fill" style="width:${pct??0}%"></div></div><div class="power-labels"><span>${escape(format(primary.min??0,0,this.lang))} ${escape(unit)}</span><span>${escape(format(primary.max??100,0,this.lang))} ${escape(unit)}</span></div>`:''}${details.slice(2).map((f,i)=>row(f,i+2)).join('')}</div>`;
  }
  limits(block){return `<div class="charge-limits">${(block.fields??[]).map(f=>{const state=this.state[f.entity],a=state?.attributes??{},value=number(state?.state),valid=value!==null&&number(a.min)!==null&&number(a.max)!==null&&a.max>a.min;return `<label class="limit-row ${this.severity(f)}"><div class="limit-heading"><span>${escape(f.name||a.friendly_name||this.t('Límite'))}</span><strong data-limit-label="${escape(f.id)}">${escape(stateText(state,f,this.lang))}</strong></div><input type="range" data-limit="${escape(f.id)}" aria-label="${escape(f.name||this.t('Límite'))}" min="${escape(a.min??0)}" max="${escape(a.max??100)}" step="${escape(a.step??1)}" value="${escape(value??0)}" ${!valid?'disabled':''}/></label>`;}).join('')}</div>`;}
  allFields(){return (this.config.blocks??[]).flatMap(b=>[...(b.fields??[]),...(b.prices??[]),...(b.groups??[]).flatMap(g=>g.fields??[])]);}
  showcase(){
    return `<style>${styles}
    .showcase{padding:18px;background:linear-gradient(145deg,var(--ha-card-background,var(--card-background-color)),var(--secondary-background-color));border-radius:16px}.showcase-tag{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--primary-color);font-weight:700}.showcase h3{margin:8px 0 12px;font-size:21px}.showcase-metrics{display:flex;gap:6px;flex-wrap:wrap}.showcase-metrics span{padding:6px 10px;border-radius:20px;background:var(--ha-card-background,var(--card-background-color));font-size:11px;margin:0}.showcase svg{display:block;width:100%;height:150px}.showcase-power{padding:12px;background:var(--ha-card-background,var(--card-background-color));border-radius:12px}.showcase-power>div:first-child{display:flex;justify-content:space-between;font-size:12px}.showcase-bar{height:7px;border-radius:8px;margin-top:10px;background:var(--divider-color)}.showcase-bar:after{content:"";display:block;width:62%;height:100%;border-radius:8px;background:var(--primary-color)}.showcase-features{display:flex;justify-content:space-around;gap:6px;margin-top:14px;font-size:11px;color:var(--secondary-text-color)}.showcase p{font-size:11px;line-height:1.5;margin:12px 0 0;color:var(--secondary-text-color)}
    </style><ha-card><div class="showcase"><div class="showcase-tag">${this.t('Vista de ejemplo')}</div><h3>${this.t('Tu vehículo, a tu manera')}</h3><div class="showcase-metrics"><span>🔋 80 %</span><span>↗ 320 km</span><span>🌡 21 °C</span></div>
    <svg viewBox="0 0 400 160" role="img" aria-label="${escape(this.t('Vista de ejemplo'))}"><ellipse cx="203" cy="131" rx="150" ry="11" fill="var(--divider-color)" opacity=".4"/><path d="M46 111 L58 85 Q66 74 102 69 L136 37 Q148 29 172 29 L241 30 Q260 31 282 64 L327 75 Q351 81 354 105 L352 120 L48 120 Z" fill="var(--secondary-background-color)" stroke="var(--primary-color)" stroke-width="3"/><path d="M118 67 L146 39 L185 38 L185 67 Z M197 38 L237 39 Q253 42 268 67 L197 67 Z" fill="var(--primary-color)" opacity=".3"/><path d="M192 74 L192 113 M279 76 L285 113" stroke="var(--divider-color)" stroke-width="2"/><path d="M59 91 L85 91 M328 88 L344 93" stroke="var(--primary-color)" stroke-width="5" stroke-linecap="round"/><circle cx="113" cy="119" r="24" fill="var(--ha-card-background,var(--card-background-color))" stroke="var(--primary-color)" stroke-width="4"/><circle cx="113" cy="119" r="11" fill="var(--divider-color)"/><circle cx="291" cy="119" r="24" fill="var(--ha-card-background,var(--card-background-color))" stroke="var(--primary-color)" stroke-width="4"/><circle cx="291" cy="119" r="11" fill="var(--divider-color)"/><path d="M24 136 L24 96 Q24 87 34 87 L56 87" fill="none" stroke="var(--primary-color)" stroke-width="3" stroke-linecap="round"/></svg>
    <div class="showcase-power"><div><b>${this.t('Potencia de carga')}</b><b>4,6 kW</b></div><div class="showcase-bar"></div></div><div class="showcase-features"><b>${this.t('Mapa del vehículo')}</b><b>${this.t('Gastos y ahorro')}</b><b>${this.t('Ubicación')}</b></div><p>${this.t('Datos de ejemplo. Abre Editar y elige una plantilla para empezar.')}</p></div></ha-card>`;
  }
  render(){
    if(!this._hass||!this.config)return;
    // HA state objects are immutable: compare only entities used by this card.
    // Avoid serialising every attribute and repainting the sample on unrelated updates.
    if(this._editingSlider)return;
    const states=[...this._entities].map(id=>this.state[id]);
    const unchanged=!this._dirty&&this._renderLanguage===this.lang&&this._renderUser===this._hass.user&&this._renderStates?.length===states.length&&states.every((state,i)=>state===this._renderStates[i]);
    if(unchanged){if(this._mapHosts?.length)this.syncMaps();return;}
    this._dirty=false;this._renderStates=states;this._renderLanguage=this.lang;this._renderUser=this._hass.user;
    const blocks=this.config.blocks??[];if(blocks.length===0||(blocks.length===1&&blocks[0].type==='start'&&!blocks[0].fields?.length&&!blocks[0].image&&!blocks[0].connector_entity&&!blocks[0].charging_entity&&!blocks[0].power_entity)){this._mapHosts=[];this.shadowRoot.innerHTML=this.showcase();return;}
    const body=(this.config.blocks??[]).map(block=>{let content='';switch(block.type){case'start':content=this.start(block);break;case'fields':content=this.fields(block.fields);break;case'power':content=this.power(block);break;case'modes':case'actions':content=this.controls(block);break;case'limits':content=this.limits(block);break;case'tyres':content=this.tyres(block);break;case'expenses':content=this.expenses(block);break;case'map':content=`<div data-map="${escape(block.id)}"></div>`;break;default:content=`<p class="empty">${this.t('Bloque no compatible.')}</p>`;}
      const freshness=this.blockFreshness(block);return `<section class="${freshness.status==='stale'?'data-stale':''}" data-block="${escape(block.id)}">${block.title?`<header>${escape(block.title)}</header>`:''}${this.freshnessBadge(block,freshness)}${content}${block.note?`<footer>${escape(block.note)}</footer>`:''}</section>`;}).join('');
    const alertsOpen=this.shadowRoot.querySelector?.('[data-alert-summary] details')?.open;
    const maps=new Map([...this.shadowRoot.querySelectorAll('[data-map]')].filter(h=>h.card).map(h=>[h.dataset.map,h]));
    this.shadowRoot.innerHTML=`<style>${styles}${compactStyles}${powerLayoutStyles}${vehicleMapStyles}${valueColorStyles}${recommendationStyles}${freshnessStyles}${alertSummaryStyles}.empty{padding:8px 16px;color:var(--secondary-text-color)}.feedback{padding:8px 16px;font-size:12px}.vehicle-badge:disabled{opacity:.5;cursor:default}section+section{margin-top:10px}.card-title{font-size:20px}button{min-height:44px}.car .date{font-size:8px}</style><ha-card>${this.config.title?`<header class="card-title">${escape(this.config.title)}</header>`:''}<div data-alert-summary>${this.alertSummary()}</div>${body||`<p class="empty">${this.t('Abre Editar y añade tu primer bloque.')}</p>`}<div role="status" class="feedback">${escape(this.feedback??'')}</div></ha-card>`;
    for(const host of this.shadowRoot.querySelectorAll('[data-map]')){const old=maps.get(host.dataset.map);const block=this.config.blocks.find(b=>b.id===host.dataset.map);if(old&&old.mapConfig===JSON.stringify(block))host.replaceWith(old);}
    this.bindAlertSummary();if(alertsOpen){const details=this.shadowRoot.querySelector?.('[data-alert-summary] details');if(details)details.open=true;}
    const fields=this.allFields();
    this.shadowRoot.querySelectorAll('[data-field]').forEach(el=>el.addEventListener('click',()=>this.activate(fields.find(f=>f.id===el.dataset.field))));
    this.shadowRoot.querySelectorAll('[data-entity]').forEach(el=>{const open=()=>this.moreInfo(el.dataset.entity);el.addEventListener('click',open);el.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();open();}});});
    this.shadowRoot.querySelectorAll('[data-limit]').forEach(el=>{el.addEventListener('input',()=>{this._editingSlider=true;const f=fields.find(f=>f.id===el.dataset.limit);[...this.shadowRoot.querySelectorAll('[data-limit-label]')].find(label=>label.dataset.limitLabel===el.dataset.limit).textContent=`${format(el.value,f.decimals)} ${f.unit??this.state[f.entity]?.attributes.unit_of_measurement??''}`;});el.addEventListener('change',async()=>{const f=fields.find(f=>f.id===el.dataset.limit);try{await this._hass.callService('input_number','set_value',{entity_id:f.entity,value:Number(el.value)});this.feedback=this.t('Límite enviado.');}catch{this.feedback=this.t('No se pudo guardar el límite.');}finally{this._editingSlider=false;this._dirty=true;this.render();}});el.addEventListener('blur',()=>{if(this._editingSlider){this._editingSlider=false;this.render();}});});
    this._mapHosts=[...this.shadowRoot.querySelectorAll('[data-map]')];
    if(this._mapHosts.length)this.syncMaps();
  }
  async activate(field){
    if(!field||this.pending)return;
    const block=this.config.blocks.find(b=>b.fields?.some(f=>f.id===field.id));
    const tap=field.tap??(['actions','modes'].includes(block?.type)?'toggle':'more-info');
    if(tap==='more-info'){this.moreInfo(field.entity);return;}
    const action=actionFor(field.entity,this.state[field.entity],tap);if(!action)return;
    if((field.confirm??field.entity.startsWith('lock.'))&&!(await this.confirmAction(field.name||field.entity)))return;
    this.pending=true;try{await this._hass.callService(action.domain,action.service,action.data);this.feedback=this.t('Orden enviada. El estado se actualizará al recibir la respuesta.');}catch{this.feedback=this.t('No se pudo enviar la orden.');}finally{this.pending=false;this._dirty=true;this.render();}
  }
  confirmAction(name){return new Promise(resolve=>{const dialog=document.createElement('dialog');dialog.innerHTML=`<p>${this.lang==='es'?'¿Ejecutar':'Run'} ${escape(name)}?</p><button data-yes>${this.t('Confirmar')}</button><button data-no>${this.t('Cancelar')}</button>`;this.shadowRoot.append(dialog);let done=false;const finish=value=>{if(done)return;done=true;dialog.remove();resolve(value);};dialog.querySelector('[data-yes]').onclick=()=>finish(true);dialog.querySelector('[data-no]').onclick=()=>finish(false);dialog.oncancel=()=>finish(false);dialog.showModal();});}
  async syncMaps(){
    if(!this.shadowRoot||!this.config)return;
    for(const host of this._mapHosts??[]){const block=this.config.blocks.find(b=>b.id===host.dataset.map);if(!block?.entity){host.textContent=this.t('Elige la entidad de ubicación en Editar.');continue;}if(host.card){host.card.hass=this._hass;continue;}if(host.loading)continue;host.loading=true;try{const helpers=await window.loadCardHelpers();if(!host.isConnected)continue;const card=helpers.createCardElement({type:'map',entities:[block.entity],default_zoom:Number(block.zoom)||14,hours_to_show:Number(block.hours)||0});card.hass=this._hass;host.replaceChildren(card);host.card=card;host.mapConfig=JSON.stringify(block);}catch{host.textContent=this.t('No se pudo cargar el mapa. Recarga el panel.');}finally{host.loading=false;}}
  }
}
if(!customElements.get('ve-builder-card'))customElements.define('ve-builder-card',VEBuilderCard);
window.customCards=window.customCards||[];
for(let i=window.customCards.length-1;i>=0;i--)if(window.customCards[i].type==='vehicle-builder-card-v1')window.customCards.splice(i,1);
if(!window.customCards.some(c=>c.type==='ve-builder-card'))window.customCards.push({type:'ve-builder-card',name:'VE Builder Card · EV',description:'Visual EV dashboard builder / Constructor visual de paneles VE.',preview:true});
console.info(`VE Builder Card ${VERSION}`);
