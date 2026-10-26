import {language,translate} from './i18n.js';
import {VERSION,TYPES,POSITIONS,escape,format,number,percentage,pressure,imageUrl,stateText,normalize,actionFor,newBlock} from './core.js';
import {styles,compactStyles} from './styles.js';
import './editor.js';

export class VEBuilderCard extends HTMLElement {
  get lang(){return language(this.config,this._hass);}
  t(value){return translate(value,this.lang);}
  static getConfigElement(){return document.createElement('ve-builder-card-editor');}
  static getStubConfig(){return {type:'custom:ve-builder-card',title:'Mi vehículo',blocks:[newBlock('start')]};}
  setConfig(config){this.config=normalize(config);this._dirty=true;this._configSignature=JSON.stringify(this.config);this._entities=new Set(this._configSignature.match(/[a-z_]+\.[a-z0-9_]+/g)??[]);if(!this.shadowRoot)this.attachShadow({mode:'open'});this.render();}
  set hass(hass){this._hass=hass;this.render();}
  getCardSize(){return Math.max(2,(this.config?.blocks.length??1)*2);}
  getGridOptions(){return {columns:12,rows:'auto'};}
  get state(){return this._hass?.states??{};}
  moreInfo(entity){if(entity&&this.state[entity])this.dispatchEvent(new CustomEvent('hass-more-info',{detail:{entityId:entity},bubbles:true,composed:true}));}
  date(entity){const date=Date.parse(this.state[entity]?.last_updated);return Number.isFinite(date)?new Date(date).toLocaleString(this.lang==='es'?'es-ES':'en-US'):this.t('Sin fecha');}
  field(field,forced){
    const state=this.state[field.entity],display=forced??field.display??'info',size=['small','medium','large'].includes(field.size)?field.size:'small',style=['subtle','outline','accent'].includes(field.style)?field.style:'subtle';
    const label=field.name||state?.attributes?.friendly_name||this.t('Elige una entidad'),value=stateText(state,field,this.lang),icon=field.icon||state?.attributes?.icon||'mdi:information-outline';
    const pct=percentage(state?.state,field.min??0,field.max??100),width=field.width==='full'?'field-full':'';
    const controlled=['toggle','press'].includes(field.tap),disabled=controlled&&!actionFor(field.entity,state,field.tap);
    const compact=display==='info'&&size==='small';
    return `<button class="vehicle-badge configurable-field display-${escape(display)} size-${size} style-${style} ${width}" data-field="${escape(field.id)}" ${disabled?'disabled':''}><ha-icon icon="${escape(icon)}"></ha-icon><div class="field-content">${compact?`<span class="compact-value">${escape(label)} · ${escape(value)}</span>`:`<span class="field-name">${escape(label)}</span><strong class="field-value">${escape(value)}</strong>`}${display==='bar'?`<div class="field-track" role="progressbar" aria-label="${escape(label)}" aria-valuemin="${escape(field.min??0)}" aria-valuemax="${escape(field.max??100)}" ${number(state?.state)!==null?`aria-valuenow="${escape(Math.max(Number(field.min??0),Math.min(Number(field.max??100),Number(state.state))))}"`:''}><div class="field-fill" style="width:${pct??0}%"></div></div><div class="field-scale">${pct===null?this.t('Configura un intervalo válido'):`${escape(field.min??0)} — ${escape(field.max??100)}`}</div>`:''}</div></button>`;
  }
  fields(fields=[]){return `<div class="vehicle-badges">${fields.length?fields.map(f=>this.field(f)).join(''):`<p class="empty">${this.t('Añade campos desde el editor visual.')}</p>`}</div>`;}
  start(block){
    const plugged=this.state[block.connector_entity]?.state==='on',charging=this.state[block.charging_entity]?.state===(block.charging_value??'Charging');
    const power=number(this.state[block.power_entity]?.state),active=charging&&(block.power_entity?power!==null&&power>0:true),animated=active&&block.animate!==false;
    const image=imageUrl(block.image),cable=(plugged||active)&&block.show_cable!==false;
    return this.fields(block.fields)+(block.show_image!==false&&image?`<div class="vehicle ${animated?'is-charging':''}" style="--vehicle-height:${Math.max(80,Math.min(600,number(block.image_height)??210))}px"><img src="${escape(image)}" alt="${escape(this.config.title||this.t('Vehículo'))}" style="height:var(--vehicle-height)"/>${cable?`<svg class="charge-cable ${animated?'cable-animated':'cable-static'}" style="height:var(--vehicle-height)" viewBox="0 0 400 230" aria-hidden="true"><path class="cable-base" d="M12 210 L12 164 Q12 149 30 149 L70 149 Q88 149 88 130 L88 112"/><path class="cable-flow" d="M12 210 L12 164 Q12 149 30 149 L70 149 Q88 149 88 130 L88 112"/><rect x="81" y="102" width="14" height="16" rx="3"/></svg>`:''}${animated?'<div class="charge-glow"></div>':''}${block.show_status!==false&&(block.connector_entity||block.charging_entity)?`<div class="charge-status">${this.t(active?'Cargando':plugged?'Conectado · Sin carga':'Desconectado')}</div>`:''}</div>`:'');
  }
  tyres(block){
    const coords={front_left:[65,75],front_right:[295,75],rear_left:[65,240],rear_right:[295,240]},unit=['bar','kPa','psi'].includes(block.unit)?block.unit:'bar';
    const values=Object.entries(POSITIONS).map(([key,label])=>{const [x,y]=coords[key],entity=block.positions?.[key],state=this.state[entity],value=pressure(state?.state,state?.attributes?.unit_of_measurement,unit);return `<g class="tyre" role="button" tabindex="0" data-entity="${escape(entity)}" aria-label="${escape(this.t(label))}: ${escape(format(value,block.decimals??2,this.lang))} ${unit}"><text x="${x}" y="${y}" class="pressure">${escape(format(value,block.decimals??2,this.lang))}</text><text x="${x}" y="${y+20}" class="unit">${unit}</text>${block.show_dates===false?'':`<text x="${x}" y="${y+38}" class="date">${escape(this.date(entity))}</text>`}</g>`;}).join('');
    return `<svg class="car" viewBox="0 0 360 330" aria-label="Presiones; parte delantera arriba"><text x="180" y="20" class="unit">${this.t('DELANTE')}</text><rect x="126" y="35" width="108" height="270" rx="47" class="body"/><path d="M140 111 Q180 86 220 111 L215 145 L145 145 Z M145 212 L215 212 L218 253 Q180 269 142 253 Z" class="glass"/>${[[115,75],[230,75],[115,235],[230,235]].map(([x,y])=>`<rect x="${x}" y="${y}" width="15" height="44" rx="6" class="wheel"/>`).join('')}${values}</svg>`;
  }
  expenses(block){
    const prices=`<div class="expense-prices">${(block.prices??[]).map(f=>`<button data-field="${escape(f.id)}"><strong>${escape(stateText(this.state[f.entity],f,this.lang))}</strong><span>${escape(f.name||this.t('Precio'))}</span>${f.show_date===false?'':`<em>${this.lang==='es'?'Lectura':'Reading'}: ${escape(this.date(f.entity))}</em>`}</button>`).join('')}</div>`;
    return prices+(block.groups??[]).map(g=>`<div class="expense-group ${['solar','diesel'].includes(g.style)?g.style:'cost'}" style="margin:10px 16px"><div class="expense-label"><ha-icon icon="${escape(g.icon||'mdi:cash')}"></ha-icon>${escape(g.name||'Grupo')}</div><div class="expense-values" style="grid-template-columns:repeat(${Math.max(1,Math.min(4,g.fields?.length??0))},minmax(0,1fr))">${(g.fields??[]).map(f=>`<button data-field="${escape(f.id)}"><span>${escape(f.name||this.t('Importe'))}</span><strong>${escape(stateText(this.state[f.entity],f,this.lang))}</strong></button>`).join('')}</div></div>`).join('');
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
    const state=this.state[primary.entity],pct=percentage(state?.state,primary.min??0,primary.max??100);
    return `<div class="power-panel"><button class="power-primary" data-field="${escape(primary.id)}"><div class="power-heading"><span>${escape(primary.name||this.t('Potencia de carga'))}</span><strong>${escape(stateText(state,primary,this.lang))}</strong></div>${primary.display==='bar'?`<div class="power-track" role="progressbar" aria-label="${escape(primary.name)}" aria-valuemin="${escape(primary.min??0)}" aria-valuemax="${escape(primary.max??100)}" ${number(state?.state)!==null?`aria-valuenow="${escape(Math.max(primary.min??0,Math.min(primary.max??100,Number(state.state))))}"`:''}><div class="power-fill" style="width:${pct??0}%"></div></div>`:''}</button>${fields.filter(f=>f!==primary).map(f=>`<button class="power-detail" data-field="${escape(f.id)}"><span>${escape(f.name||this.state[f.entity]?.attributes?.friendly_name)}</span><strong>${escape(stateText(this.state[f.entity],f,this.lang))}</strong></button>`).join('')}</div>`;
  }
  limits(block){return `<div class="charge-limits">${(block.fields??[]).map(f=>{const state=this.state[f.entity],a=state?.attributes??{},value=number(state?.state),valid=value!==null&&number(a.min)!==null&&number(a.max)!==null&&a.max>a.min;return `<label class="limit-row"><div class="limit-heading"><span>${escape(f.name||a.friendly_name||this.t('Límite'))}</span><strong data-limit-label="${escape(f.id)}">${escape(stateText(state,f,this.lang))}</strong></div><input type="range" data-limit="${escape(f.id)}" aria-label="${escape(f.name||this.t('Límite'))}" min="${escape(a.min??0)}" max="${escape(a.max??100)}" step="${escape(a.step??1)}" value="${escape(value??0)}" ${!valid?'disabled':''}/></label>`;}).join('')}</div>`;}
  allFields(){return (this.config.blocks??[]).flatMap(b=>[...(b.fields??[]),...(b.prices??[]),...(b.groups??[]).flatMap(g=>g.fields??[])]);}
  render(){
    if(!this._hass||!this.config)return;
    // Updates do not rebuild a slider while the user is adjusting it.
    if(this._editingSlider)return;
    const signature=JSON.stringify([this.lang,this._configSignature,[...this._entities].map(id=>this.state[id])]);
    if(!this._dirty&&signature===this._signature){this.syncMaps();return;}this._dirty=false;this._signature=signature;
    const body=(this.config.blocks??[]).map(block=>{let content='';switch(block.type){case'start':content=this.start(block);break;case'fields':content=this.fields(block.fields);break;case'power':content=this.power(block);break;case'modes':case'actions':content=this.controls(block);break;case'limits':content=this.limits(block);break;case'tyres':content=this.tyres(block);break;case'expenses':content=this.expenses(block);break;case'map':content=`<div data-map="${escape(block.id)}"></div>`;break;default:content=`<p class="empty">${this.t('Bloque no compatible.')}</p>`;}
      return `<section data-block="${escape(block.id)}">${block.title?`<header>${escape(block.title)}</header>`:''}${content}${block.note?`<footer>${escape(block.note)}</footer>`:''}</section>`;}).join('');
    const maps=new Map([...this.shadowRoot.querySelectorAll('[data-map]')].filter(h=>h.card).map(h=>[h.dataset.map,h]));
    this.shadowRoot.innerHTML=`<style>${styles}${compactStyles}.empty{padding:8px 16px;color:var(--secondary-text-color)}.feedback{padding:8px 16px;font-size:12px}.vehicle-badge:disabled{opacity:.5;cursor:default}section+section{margin-top:10px}.card-title{font-size:20px}button{min-height:44px}.car .date{font-size:8px}</style><ha-card>${this.config.title?`<header class="card-title">${escape(this.config.title)}</header>`:''}${body||`<p class="empty">${this.t('Abre Editar y añade tu primer bloque.')}</p>`}<div role="status" class="feedback">${escape(this.feedback??'')}</div></ha-card>`;
    for(const host of this.shadowRoot.querySelectorAll('[data-map]')){const old=maps.get(host.dataset.map);const block=this.config.blocks.find(b=>b.id===host.dataset.map);if(old&&old.mapConfig===JSON.stringify(block))host.replaceWith(old);}
    const fields=this.allFields();
    this.shadowRoot.querySelectorAll('[data-field]').forEach(el=>el.addEventListener('click',()=>this.activate(fields.find(f=>f.id===el.dataset.field))));
    this.shadowRoot.querySelectorAll('[data-entity]').forEach(el=>{const open=()=>this.moreInfo(el.dataset.entity);el.addEventListener('click',open);el.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();open();}});});
    this.shadowRoot.querySelectorAll('[data-limit]').forEach(el=>{el.addEventListener('input',()=>{this._editingSlider=true;const f=fields.find(f=>f.id===el.dataset.limit);[...this.shadowRoot.querySelectorAll('[data-limit-label]')].find(label=>label.dataset.limitLabel===el.dataset.limit).textContent=`${format(el.value,f.decimals)} ${f.unit??this.state[f.entity]?.attributes.unit_of_measurement??''}`;});el.addEventListener('change',async()=>{const f=fields.find(f=>f.id===el.dataset.limit);try{await this._hass.callService('input_number','set_value',{entity_id:f.entity,value:Number(el.value)});this.feedback=this.t('Límite enviado.');}catch{this.feedback=this.t('No se pudo guardar el límite.');}finally{this._editingSlider=false;this._dirty=true;this.render();}});el.addEventListener('blur',()=>{if(this._editingSlider){this._editingSlider=false;this.render();}});});
    this.syncMaps();
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
    for(const host of this.shadowRoot.querySelectorAll('[data-map]')){const block=this.config.blocks.find(b=>b.id===host.dataset.map);if(!block?.entity){host.textContent=this.t('Elige la entidad de ubicación en Editar.');continue;}if(host.card){host.card.hass=this._hass;continue;}if(host.loading)continue;host.loading=true;try{const helpers=await window.loadCardHelpers();if(!host.isConnected)continue;const card=helpers.createCardElement({type:'map',entities:[block.entity],default_zoom:Number(block.zoom)||14,hours_to_show:Number(block.hours)||0});card.hass=this._hass;host.replaceChildren(card);host.card=card;host.mapConfig=JSON.stringify(block);}catch{host.textContent=this.t('No se pudo cargar el mapa. Recarga el panel.');}finally{host.loading=false;}}
  }
}
if(!customElements.get('ve-builder-card'))customElements.define('ve-builder-card',VEBuilderCard);
window.customCards=window.customCards||[];
if(!window.customCards.some(c=>c.type==='ve-builder-card'))window.customCards.push({type:'ve-builder-card',name:'VE Builder Card',description:'Visual EV dashboard builder / Constructor visual de paneles VE.',preview:true});
console.info(`VE Builder Card ${VERSION}`);
