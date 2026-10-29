import {STATUS_TYPES,newVehicleStatus,vehicleStatusValues} from './vehicle-status.js';
import {exportCard,inspectCardImport,TRANSFER_LIMIT} from './transfer.js';
import {language,translate,translateSchema,LANGUAGES} from './i18n.js';
import {TYPES,BLOCK_DESCRIPTIONS,POSITIONS,clone,normalize,newBlock,newField,uid,validate,templateBlocks,BODY_PARTS,suggestVehicleEntities,vehicleWizardBlocks,valueSeverity} from './core.js';

const text=name=>({name,selector:{text:{}}});
const select=(name,options)=>({name,selector:{select:{options:Object.entries(options).map(([value,label])=>({value,label}))}}});
const numeric=(name,min,max,step=1)=>({name,selector:{number:{min,max,step,mode:'box'}}});
const entity=(name,domain)=>({name,selector:{entity:domain?{domain}:{}}});
const bool=name=>({name,selector:{boolean:{}}});
const LABELS={max_age_minutes:'Considerar antiguo a partir de · minutos',timestamp_entity:'Sensor con la fecha de lectura (opcional)',recommended_front_bar:'Presión recomendada delante · bar (en frío)',recommended_rear_bar:'Presión recomendada detrás · bar (en frío)',enabled:'Activar colores por valor',direction:'Avisar cuando el valor sea',warning:'Umbral de aviso · ámbar',critical:'Umbral crítico · rojo',kind:'Tipo de vehículo',charging:'Incluir carga',vehicle:'Incluir mapa del vehículo',location:'Incluir ubicación',gear_entity:"Sensor de marcha",gear_name:"Nombre de la marcha",open_value:"Estado que significa abierto",closed_value:"Estado que significa cerrado",device:"Filtrar entidades por dispositivo (opcional)",language:'Idioma',title:'Título',name:'Nombre visible (opcional)',entity:'Entidad',icon:'Icono',display:'Presentación',size:'Tamaño',style:'Estilo',width:'Anchura',tap:'Al pulsar',confirm:'Pedir confirmación',decimals:'Decimales',unit:'Unidad (opcional; se obtiene del sensor)',format:'Formato del dato',min:'Mínimo',max:'Máximo',image:'Imagen · URL o ruta /local/',image_height:'Altura de la imagen (px)',show_image:'Mostrar imagen',animate:'Animar durante la carga',show_status:'Mostrar estado de carga',show_cable:'Mostrar manguera',ota_version_entity:'Sensor de versión OTA (opcional)',ota_status_entity:'Sensor de actualización disponible (opcional)',connector_entity:'Sensor del conector',charging_entity:'Entidad del estado de carga',charging_value:'Estado que significa cargando',power_entity:'Potencia real · verifica si entra energía',zoom:'Zoom',hours:'Horas de recorrido · 0 para ocultarlo',show_dates:'Mostrar fechas de lectura',note:'Comentario al pie'};
const CSS=`textarea{display:block;box-sizing:border-box;width:100%;max-width:100%;padding:10px;margin:8px 0;border:1px solid var(--divider-color);border-radius:8px;background:var(--card-background-color);color:var(--primary-text-color);font:inherit;resize:vertical}.transfer-file{display:block;margin:14px 0}.transfer-file input{display:block;max-width:100%;margin:8px 0}.transfer-preview{padding:12px;margin-top:12px;border:1px solid var(--primary-color);border-radius:10px}.transfer-preview p{overflow-wrap:anywhere}.transfer-preview details p{font-size:12px}summary.reorder-handle{cursor:grab}summary.reorder-handle:before{content:"⠿";display:inline-block;margin-right:9px;color:var(--secondary-text-color);font-size:20px;vertical-align:middle}summary.reorder-handle:active{cursor:grabbing}details.dragging{opacity:.45}details.drop-target{outline:2px solid var(--primary-color);outline-offset:2px}:host{display:block;color:var(--primary-text-color)}.intro{padding:14px;border-radius:12px;background:var(--secondary-background-color);line-height:1.6}.intro h3{margin:0 0 6px}.intro p{margin:0;color:var(--secondary-text-color);font-size:13px}details{border:1px solid var(--divider-color);border-radius:12px;margin:12px 0;padding:12px}details details{background:var(--secondary-background-color);margin:8px 0}summary{cursor:pointer;line-height:1.6;font-weight:600;padding:4px}details[open]>summary{color:var(--primary-color);margin-bottom:10px}button,select{font:inherit;border:1px solid var(--divider-color);background:var(--secondary-background-color);color:var(--primary-text-color);border-radius:8px;padding:9px 12px;min-height:44px;margin:6px 6px 0 0;cursor:pointer}button:hover{border-color:var(--primary-color)}button:focus-visible,summary:focus-visible{outline:2px solid var(--primary-color);outline-offset:3px}.danger{color:var(--error-color,#db4437)}ha-form{display:block;margin:10px 0}.muted{font-size:12px;color:var(--secondary-text-color);line-height:1.5}.warnings{margin:12px 0;font-size:12px;color:var(--secondary-text-color);line-height:1.5}.add{padding:12px;border:1px dashed var(--divider-color);border-radius:12px}.toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:4px}small{font-size:12px;font-weight:400;color:var(--secondary-text-color)}`;

let copiedSection=null;

export class VEBuilderEditor extends HTMLElement {
  get lang(){return language(this.config,this._hass);}
  t(value){return translate(value,this.lang);}
  setConfig(config){
    const normalized=normalize(config);
    if(this.config&&JSON.stringify(this.config)===JSON.stringify(normalized))return;
    this._warningConfig=null;this.config=normalized;this.history=[];this.future=[];this.checkpoint=clone(normalized);this.render();
  }
  set hass(hass){const previous=this.lang;this._hass=hass;if(this.config&&previous!==this.lang)this.render();this.shadowRoot?.querySelectorAll('ha-form').forEach(form=>form.hass=hass);this.updateWarnings();}
  emit(){this._warningConfig=null;this.recordHistory();this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:clone(this.config)},bubbles:true,composed:true}));this.updateWarnings();}
  recordHistory(){
    if(!this.checkpoint){this.checkpoint=clone(this.config);return;}
    if(JSON.stringify(this.checkpoint)===JSON.stringify(this.config))return;
    this.history??=[];this.history.push(this.checkpoint);if(this.history.length>50)this.history.shift();this.future=[];this.checkpoint=clone(this.config);this.updateHistoryButtons();
  }
  travelHistory(direction){
    const source=direction==='undo'?this.history:this.future,target=direction==='undo'?this.future:this.history;
    if(!source?.length)return;target.push(clone(this.config));this.config=clone(source.pop());this.checkpoint=clone(this.config);this.emit();this.render();
  }
  updateHistoryButtons(){
    for(const [key,list]of [['undo',this.history],['redo',this.future]]){const button=this.shadowRoot?.querySelector('[data-history="'+key+'"]');if(button)button.disabled=!list?.length;}
  }
  alertsEditor(parent){
    const panel=this.panel(parent,'alerts-summary','Resumen de avisos');const options=this.config.alerts??{};
    const toggle=this.form(panel,{enabled:!!options.enabled},[bool('enabled')],patch=>{this.config.alerts={...this.config.alerts,...patch};this.emit();this.render();});toggle.computeLabel=()=>this.t('Mostrar resumen de avisos');
    if(!options.enabled)return;
    const labels={include_values:'Valores en aviso o crítico',include_tyres:'Presiones en aviso o crítico',include_openings:'Puertas, capó y maletero abiertos',include_stale:'Datos antiguos'};
    const form=this.form(panel,{include_values:true,include_tyres:true,include_openings:true,include_stale:true,...options},Object.keys(labels).map(bool),patch=>{this.config.alerts={...this.config.alerts,...patch};this.emit();});form.computeLabel=field=>this.t(labels[field.name]);
    const hint=document.createElement('p');hint.className='muted';hint.textContent=this.t('Solo resume esta tarjeta y utiliza sus umbrales y entidades configurados. Desaparece cuando no hay avisos. Pulsa un aviso para ver detalles, sin ejecutar acciones.');panel.append(hint);
  }
  copySection(block){copiedSection=clone(block);this.copyFeedback='Apartado copiado. Abre otra tarjeta de este panel y pulsa Pegar apartado.';this.render();}
  pasteSection(){
    if(!copiedSection)return false;
    const copy=clone(copiedSection);copy.id=uid();
    for(const fields of [copy.fields,copy.prices,copy.vehicle_status])fields?.forEach(f=>f.id=uid());
    copy.groups?.forEach(g=>{g.id=uid();g.fields?.forEach(f=>f.id=uid());});
    this.config.blocks.push(copy);this.openKey=copy.id;this.copyFeedback='Apartado pegado. Revisa sus entidades y pulsa Guardar.';this.emit();this.render();return true;
  }
  sectionClipboard(parent){
    const box=this.panel(parent,'section-clipboard','Reutilizar apartados');
    const hint=document.createElement('p');hint.className='muted';hint.textContent=this.t('Copia un apartado desde sus botones y pégalo en otra tarjeta abierta en esta misma página. Conserva entidades, nombres y estilo. La copia temporal se borra al recargar; no usa el portapapeles del sistema.');box.append(hint);
    const paste=this.button(box,'Pegar apartado',()=>this.pasteSection());paste.disabled=!copiedSection;
    if(copiedSection){const label=document.createElement('p');label.className='muted';label.textContent=this.t('Apartado copiado')+': '+(copiedSection.title||this.t(TYPES[copiedSection.type]||'Bloque'));box.append(label);this.button(box,'Borrar copia temporal',()=>{copiedSection=null;this.copyFeedback='';this.render();});}
    if(this.copyFeedback){const feedback=document.createElement('p');feedback.className='muted';feedback.setAttribute('role','status');feedback.textContent=this.t(this.copyFeedback);box.append(feedback);}
  }
  previewImport(){
    try{this.importPreview=inspectCardImport(this.importText??'',this._hass?.states??{});this.transferMessage='';}
    catch(error){this.importPreview=null;this.transferMessage=error.message;}
    this.openKey='card-transfer';this.render();
  }
  applyImport(mode){
    if(!this.importPreview)return false;
    // Revalidate the exact text at apply time, after any edit or state update.
    let result;try{result=inspectCardImport(this.importText??'',this._hass?.states??{});}catch(error){this.importPreview=null;this.transferMessage=error.message;this.render();return false;}
    if(mode==='append')this.config.blocks.push(...result.config.blocks);
    else if(mode==='replace')this.config=result.config;
    else return false;
    this.importPreview=null;this.importText='';this.transferMessage='Importación aplicada. Revisa las entidades y pulsa Guardar. Puedes deshacer este cambio.';
    this.openKey='card-transfer';this.emit();this.render();return true;
  }
  transferPanel(parent){
    const panel=this.panel(parent,'card-transfer','Exportar e importar tarjeta');
    const paragraph=value=>{const p=document.createElement('p');p.className='muted';p.textContent=this.t(value);panel.append(p);return p;};
    paragraph('Guarda una copia JSON o comparte el diseño. Los archivos no incluyen lecturas del coche. Las imágenes conservan su URL; no se adjuntan.');
    const label=document.createElement('label'),checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=this.exportEntities!==false;checkbox.onchange=()=>{this.exportEntities=checkbox.checked;};label.append(checkbox,document.createTextNode(' '+this.t('Incluir entidades en la exportación')));panel.append(label);
    paragraph('Desmarca esta opción para compartir el diseño sin asignaciones de entidades. Revisa también títulos, notas y direcciones de imágenes antes de compartirlo.');
    this.button(panel,'Descargar tarjeta JSON',()=>{
      const blob=new Blob([exportCard(this.config,{includeEntities:this.exportEntities!==false})],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
      link.href=url;link.download='ve-builder-card.json';panel.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    });
    const fileLabel=document.createElement('label');fileLabel.className='transfer-file';fileLabel.textContent=this.t('Abrir archivo JSON');
    const file=document.createElement('input');file.type='file';file.accept='.json,application/json';file.setAttribute('aria-label',this.t('Abrir archivo JSON'));file.onchange=async()=>{
      const selected=file.files?.[0];if(!selected)return;this.importPreview=null;panel.querySelector('[data-import-preview]')?.remove();const request=this._importRequest=(this._importRequest??0)+1;
      if(selected.size>TRANSFER_LIMIT){this.importPreview=null;this.transferMessage='El archivo supera el límite de 512 KB.';this.render();return;}
      try{const source=await selected.text();if(request!==this._importRequest)return;this.importText=source;this.previewImport();}catch{if(request===this._importRequest){this.importPreview=null;this.transferMessage='No se pudo leer el archivo.';this.render();}}
    };fileLabel.append(file);panel.append(fileLabel);
    const areaLabel=document.createElement('label');areaLabel.className='transfer-file';areaLabel.textContent=this.t('O pega aquí la configuración JSON');
    const area=document.createElement('textarea');area.value=this.importText??'';area.rows=6;area.spellcheck=false;area.maxLength=TRANSFER_LIMIT;area.setAttribute('aria-label',this.t('O pega aquí la configuración JSON'));
    area.oninput=()=>{this._importRequest=(this._importRequest??0)+1;this.importText=area.value;this.importPreview=null;panel.querySelector('[data-import-preview]')?.remove();};areaLabel.append(area);panel.append(areaLabel);
    this.button(panel,'Revisar importación',()=>this.previewImport());
    if(this.importPreview){
      const preview=document.createElement('div');preview.dataset.importPreview='';preview.className='transfer-preview';panel.append(preview);
      const heading=document.createElement('strong');heading.textContent=this.importPreview.config.title;preview.append(heading);
      for(const [key,count]of [['Apartados',this.importPreview.blocks],['Campos',this.importPreview.fields],['Entidades',this.importPreview.entities.length],['Entidades no disponibles',this.importPreview.missing.length]]){const line=document.createElement('p');line.textContent=this.t(key)+': '+count;preview.append(line);}
      if(this.importPreview.missing.length){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=this.t('Entidades no disponibles');details.append(summary);for(const id of this.importPreview.missing){const line=document.createElement('p');line.textContent=id;details.append(line);}preview.append(details);}
      const hint=document.createElement('p');hint.className='muted';hint.textContent=this.t('Añadir conserva el título y los ajustes actuales. Reemplazar cambia toda esta tarjeta. No se crean sensores ni se envían órdenes al vehículo.');preview.append(hint);
      this.button(preview,'Añadir solo los apartados',()=>this.applyImport('append'));
      this.button(preview,'Reemplazar esta tarjeta',()=>this.applyImport('replace'),true);
      this.button(preview,'Cancelar',()=>{this.importPreview=null;this.render();});
    }
    if(this.transferMessage){const status=paragraph(this.transferMessage);status.setAttribute('role','status');}
  }
  historyToolbar(parent){
    const bar=document.createElement('div');bar.className='toolbar';
    for(const [key,label]of [['undo','↶ Deshacer'],['redo','↷ Rehacer']]){const button=this.button(bar,label,()=>this.travelHistory(key));button.dataset.history=key;}
    parent.append(bar);this.updateHistoryButtons();
  }
  async filterDevice(id,device){
    this.deviceFilters??={};this.deviceFilters[id]=device||'';this.deviceFilterError=false;
    if(device&&!this.entityRegistry){try{this.entityRegistry=await this._hass.callWS({type:'config/entity_registry/list'});}catch{this.deviceFilters[id]='';this.deviceFilterError=true;}}
    this.render();
  }
  entitySchema(name,domain,device){
    const schema=entity(name,domain);
    if(device&&this.entityRegistry){schema.selector.entity.include_entities=this.entityRegistry.filter(item=>item.device_id===device&&(!domain||(Array.isArray(domain)?domain:[domain]).includes(item.entity_id.split('.')[0]))).map(item=>item.entity_id);}
    return schema;
  }
  updateWarnings(){const container=this.shadowRoot?.querySelector('.warnings');if(!container||!this.config)return;if(this._warningConfig!==this.config){this._warningEntities=[...new Set(JSON.stringify(this.config).match(/[a-z_]+\.[a-z0-9_]+/g)??[])];this._warningConfig=this.config;this._warningStates=null;}const states=this._warningEntities.map(id=>this._hass?.states?.[id]);if(this._warningContainer===container&&this._warningLanguage===this.lang&&this._warningStates?.length===states.length&&states.every((v,i)=>v===this._warningStates[i]))return;this._warningStates=states;this._warningContainer=container;this._warningLanguage=this.lang;const issues=validate(this.config,this._hass);container.textContent=this.t(issues.length?`${issues.length} ajuste(s) pendiente(s): ${issues.slice(0,5).join(' ')}${issues.length>5?' …':''}`:'Configuración lista. Pulsa Guardar para conservar los cambios.');}
  button(parent,label,fn,danger=false){const button=document.createElement('button');button.type='button';button.textContent=this.t(label);if(danger)button.className='danger';button.onclick=fn;parent.append(button);return button;}
  panel(parent,key,title,open=false){const panel=document.createElement('details');panel.dataset.key=key;panel.open=open;const summary=document.createElement('summary');summary.textContent=this.t(title);panel.append(summary);parent.append(panel);return panel;}
  form(parent,data,schema,change){
    const form=document.createElement('ha-form');form.hass=this._hass;form.data=clone(data);form.schema=translateSchema(schema,this.lang);form.computeLabel=field=>this.t(LABELS[field.name]??POSITIONS[field.name]??field.name);
    form.addEventListener('value-changed',event=>{event.stopPropagation();const values=event.detail.value??{};const allowed=new Set(schema.map(s=>s.name));const patch=Object.fromEntries(Object.entries(values).filter(([key])=>allowed.has(key)));change(patch);});parent.append(form);return form;
  }
  moveItem(list,id,target){
    const from=list.findIndex(item=>item.id===id);if(from<0||target<0||target>=list.length||from===target)return false;
    list.splice(target,0,list.splice(from,1)[0]);this.emit();this.render();return true;
  }
  reorderHandle(panel,list,index,key){
    const handle=panel.querySelector('summary');handle.draggable=true;handle.classList.add('reorder-handle');handle.title=this.t('Arrastra para ordenar. Con teclado: Alt + flechas.');
    handle.addEventListener('keydown',event=>{if(event.altKey&&['ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();event.stopPropagation();this.moveItem(list,list[index].id,index+(event.key==='ArrowUp'?-1:1));}});
    handle.addEventListener('dragstart',event=>{event.stopPropagation();this.dragItem={key,id:list[index].id};event.dataTransfer.setData('text/plain',list[index].id);event.dataTransfer.effectAllowed='move';panel.classList.add('dragging');});
    handle.addEventListener('dragover',event=>{if(this.dragItem?.key===key){event.preventDefault();event.stopPropagation();event.dataTransfer.dropEffect='move';panel.classList.add('drop-target');}});
    handle.addEventListener('dragleave',()=>panel.classList.remove('drop-target'));
    handle.addEventListener('drop',event=>{event.preventDefault();event.stopPropagation();panel.classList.remove('drop-target');if(this.dragItem?.key!==key)return;const id=this.dragItem.id;this.dragItem=null;this.moveItem(list,id,index);});
    handle.addEventListener('dragend',()=>{this.dragItem=null;this.shadowRoot.querySelectorAll('.dragging,.drop-target').forEach(el=>el.classList.remove('dragging','drop-target'));});
  }
  addTemplate(kind){
    const blocks=templateBlocks(kind,this.lang);if(!blocks.length)return;
    // The empty starter is a placeholder; configured blocks are always preserved.
    if(this.config.blocks.length===1){const b=this.config.blocks[0];if(b.type==='start'&&!b.fields?.length&&!b.image&&!b.connector_entity&&!b.charging_entity&&!b.power_entity)this.config.blocks=[];}
    this.config.blocks.push(...blocks);this.openKey=blocks[0].id;this.emit();this.render();
  }
  wizardPanel(parent){
    this.wizard??={kind:'electric',device:'',charging:true,vehicle:true,location:false};const w=this.wizard;
    const box=this.panel(parent,'setup-wizard','Asistente inicial',this.config.blocks.length===0||this.config.blocks.length===1&&!this.config.blocks[0].fields?.length);
    const hint=document.createElement('p');hint.className='muted';hint.textContent=this.t('Elige un dispositivo y revisa las sugerencias. No se envían órdenes al vehículo. Los apartados existentes se conservan.');box.append(hint);
    if(!w.review){
      this.form(box,{...w,wizard_device:w.device},[select('kind',{electric:'Vehículo eléctrico',combustion:'Gasolina / GNC'}),{name:'wizard_device',selector:{device:{}}},bool('charging'),bool('vehicle'),bool('location')],patch=>{if('wizard_device' in patch){w.device=patch.wizard_device;delete patch.wizard_device;}Object.assign(w,patch);});
      const button=this.button(box,'Buscar entidades',async()=>{button.disabled=true;try{const registry=await this._hass.callWS({type:'config/entity_registry/list'});this.entityRegistry=registry;w.chosen=suggestVehicleEntities(w.device,registry,this._hass.states);w.review=true;w.error=false;this.openKey='setup-wizard';this.render();}catch{w.error=true;button.disabled=false;const msg=document.createElement('p');msg.textContent=this.t('No se pudo consultar el dispositivo. Inténtalo de nuevo.');box.append(msg);}});
      return;
    }
    const hint2=document.createElement('p');hint2.className='muted';hint2.textContent=this.t('Revisa cada entidad. Las coincidencias ambiguas quedan vacías. Puedes cambiarlas o dejarlas sin asignar.');box.append(hint2);
    const specs=[[w.kind==='combustion'?'fuel':'battery',w.kind==='combustion'?'Combustible':'Batería','sensor'],['range','Autonomía','sensor'],['odometer','Odómetro','sensor']];
    if(w.kind==='electric'&&w.charging)specs.push(['power','Potencia de carga','sensor'],['connector','Sensor del conector','binary_sensor'],['charging','Entidad del estado de carga','binary_sensor']);
    if(w.vehicle){specs.push(['gear','Marcha','sensor'],['bonnet','Capó','binary_sensor'],['trunk','Maletero','binary_sensor']);for(const [pos,label]of Object.entries(POSITIONS)){specs.push(['pressure_'+pos,this.t('Presión')+' · '+this.t(label),'sensor'],['door_'+pos,BODY_PARTS[pos],'binary_sensor']);}}
    if(w.location)specs.push(['location','Ubicación',['person','device_tracker']]);
    for(const [role,label,domain]of specs){const name=document.createElement('p');name.textContent=this.t(label);box.append(name);this.form(box,{entity:w.chosen[role]||''},[entity('entity',domain)],patch=>{w.chosen[role]=patch.entity||'';});}
    this.button(box,'Volver',()=>{w.review=false;this.openKey='setup-wizard';this.render();});
    this.button(box,'Añadir apartados revisados',()=>{const blocks=vehicleWizardBlocks(w.kind,w,w.chosen,this._hass?.states,this.lang);if(this.config.blocks.length===1){const b=this.config.blocks[0];if(b.type==='start'&&!b.fields?.length&&!b.image&&!b.connector_entity&&!b.charging_entity&&!b.power_entity)this.config.blocks=[];}this.config.blocks.push(...blocks);w.review=false;this.openKey=blocks[0].id;this.emit();this.render();});
  }
  templates(parent){
    const box=this.panel(parent,'templates','Plantillas iniciales',this.config.blocks.length===0);
    const hint=document.createElement('p');hint.className='muted';hint.textContent=this.t('Añade una base y selecciona tus entidades. Los bloques configurados se conservan.');box.append(hint);
    for(const [kind,label]of Object.entries({electric:'Vehículo eléctrico',combustion:'Gasolina / GNC',expenses:'Gastos y ahorro',tyres:'Mapa del vehículo'}))this.button(box,label,()=>this.addTemplate(kind));
    const tip=document.createElement('p');tip.className='muted';tip.textContent=this.t('Arrastra el asa de un campo, grupo o bloque para cambiar su posición. Con teclado: Alt + flechas.');box.append(tip);
  }
  colorEditor(parent,owner,key,id,title='Colores según el valor'){
    const panel=this.panel(parent,id+'-colors',title);
    const colors=owner[key]??{};
    this.form(panel,colors,[bool('enabled')],patch=>{owner[key]={...owner[key],...patch};this.emit();this.render();});
    if(!colors.enabled)return;
    const hint=document.createElement('p');hint.className='muted';hint.textContent=this.t('Normal: verde. Aviso: ámbar. Crítico: rojo. Los umbrales incluyen el valor indicado y usan la unidad mostrada. Sin datos no se aplica color.');panel.append(hint);
    this.form(panel,colors,[select('direction',{low:'Bajo · batería o presión',high:'Alto · consumo o temperatura'}),numeric('warning',-1000000,1000000,0.01),numeric('critical',-1000000,1000000,0.01)],patch=>{owner[key]={...owner[key],...patch};this.emit();const current=owner[key];const invalid=current.warning!==undefined&&current.critical!==undefined&&!valueSeverity(0,{...current,enabled:true});message.textContent=this.t(invalid?'Revisa el orden de los umbrales: bajo requiere crítico menor o igual que aviso; alto, mayor o igual.':'Elige dirección y umbrales. Puedes dejar uno sin asignar.');});
    const message=document.createElement('p');message.className='muted';message.textContent=this.t('Elige dirección y umbrales. Puedes dejar uno sin asignar.');panel.append(message);
  }
  fieldList(parent,fields,key,kind='info'){
    fields.forEach((field,index)=>{
      const row=this.panel(parent,field.id,field.name||this._hass?.states[field.entity]?.attributes?.friendly_name||'Nuevo campo',!field.entity);
      this.reorderHandle(row,fields,index,key);
      const data=this.panel(row,field.id+'-data','Datos',true);
      const domain=kind==='limit'?'input_number':kind==='action'?['switch','input_boolean','lock','button']:kind==='mode'?['switch','input_boolean']:undefined;
      this.form(data,{device:this.deviceFilters?.[field.id]??''},[{name:'device',selector:{device:{}}}],patch=>this.filterDevice(field.id,patch.device));
      const schema=[this.entitySchema('entity',domain,this.deviceFilters?.[field.id]),text('name')];if(kind!=='limit')schema.push({name:'icon',selector:{icon:{}}});
      if(['info','expense','price','power'].includes(kind))schema.push(...(['expense','price'].includes(kind)?[numeric('decimals',0,6)]:[]),text('unit'));
      if(kind==='info')schema.push(select('format',{auto:'Automático',connection:'Conectado / desconectado',presence:'Presencia'}));
      this.form(data,field,schema,patch=>{const domainChanged=patch.entity!==undefined&&patch.entity.split('.')[0]!==field.entity?.split('.')[0];Object.assign(field,patch);row.querySelector('summary').textContent=field.name||this._hass?.states[field.entity]?.attributes?.friendly_name||this.t('Nuevo campo');this.emit();if(domainChanged)this.render();});
      if(['info','power','expense','price','limit'].includes(kind))this.colorEditor(row,field,'colors',field.id);
      if(!['limit','expense','price'].includes(kind)){
        if(['info','power'].includes(kind)){const advanced=this.panel(row,field.id+'-advanced','Opciones avanzadas');this.form(advanced,field,[numeric('decimals',0,6)],patch=>{Object.assign(field,patch);this.emit();});}
        const appearance=this.panel(row,field.id+'-appearance','Apariencia');
        const schemas=[select('size',{small:'Pequeño',medium:'Mediano',large:'Grande'}),select('style',{subtle:'Suave',outline:'Contorno',accent:'Destacado',plain:'Sin fondo'}),select('width',{auto:'Media fila',full:'Fila completa'})];
        if(['info','power'].includes(kind))schemas.unshift(select('display',{info:'Información',button:'Botón',bar:'Barra'}));
        if(field.display==='bar')schemas.push(numeric('min',-1000000,1000000),numeric('max',-1000000,1000000));
        this.form(appearance,{display:'info',size:'small',style:'subtle',width:'auto',min:0,max:100,...field},schemas,patch=>{const changed=patch.display!==undefined&&patch.display!==(field.display??'info');Object.assign(field,patch);this.emit();if(changed)this.render();});
      }
      if(!['limit','expense','price'].includes(kind)){
        const behavior=this.panel(row,field.id+'-behavior','Comportamiento');
        const domain=field.entity?.split('.')[0];const options={'more-info':'Ver detalles'};
        if(['switch','input_boolean','lock'].includes(domain))options.toggle='Activar / desactivar';if(domain==='button')options.press='Pulsar botón';
        this.form(behavior,{tap:['action','mode'].includes(kind)?'toggle':'more-info',confirm:domain==='lock',...field},[select('tap',options),bool('confirm')],patch=>{Object.assign(field,patch);this.emit();});
      }
      const toolbar=document.createElement('div');toolbar.className='toolbar';row.append(toolbar);
      this.button(toolbar,'Duplicar',()=>{fields.splice(index+1,0,{...clone(field),id:uid()});this.emit();this.render();});
      this.button(toolbar,'Eliminar',()=>{fields.splice(index,1);this.emit();this.render();},true);
    });
    this.button(parent,'＋ Añadir campo',()=>{const f=newField();if(['action','mode'].includes(kind))f.tap='toggle';if(kind==='expense')Object.assign(f,{decimals:2,unit:'€'});fields.push(f);this.emit();this.openKey=f.id;this.render();});
  }
  freshnessEditor(parent,block){
    const panel=this.panel(parent,block.id+'-freshness','Antigüedad de las lecturas');
    const options=block.freshness??{};
    const toggle=this.form(panel,{enabled:!!options.enabled},[bool('enabled')],patch=>{block.freshness={...block.freshness,...patch};this.emit();this.render();});toggle.computeLabel=()=>this.t('Mostrar antigüedad de las lecturas');
    if(!options.enabled)return;
    this.form(panel,{max_age_minutes:60,...options},[numeric('max_age_minutes',1,10080),entity('timestamp_entity','sensor')],patch=>{block.freshness={...block.freshness,...patch};this.emit();});
    const hint=document.createElement('p');hint.className='muted';hint.textContent=this.t('Elige un sensor cuyo valor sea una fecha de lectura. Sin él se usa el cambio más antiguo de las entidades; un valor estable no demuestra que el coche haya dejado de informar. Los datos antiguos se atenúan sin bloquear controles.');panel.append(hint);
  }
  statusEditor(parent,block){
    const panel=this.panel(parent,block.id+'-statuses','Estados bajo el vehículo'),items=block.vehicle_status??[];
    const hint=document.createElement('p');hint.className='muted';hint.textContent=this.t('Añade cerradura, puertas o ventanillas. Los estados normales son discretos y las aperturas se resaltan. Al pulsar solo se abren los detalles; no se envían órdenes.');panel.append(hint);
    items.forEach((item,index)=>{
      const row=this.panel(panel,item.id,item.name||STATUS_TYPES[item.kind]||'Información');this.reorderHandle(row,items,index,block.id+'-statuses');
      this.form(row,item,[entity('entity',['lock','binary_sensor','cover','sensor','input_boolean'])],patch=>{Object.assign(item,patch);this.emit();this.render();});
      const labels={name:'Nombre visible (opcional)',icon:'Icono',normal_value:'Estado normal',attention_value:'Estado de aviso',normal_text:'Texto normal (opcional)',attention_text:'Texto de aviso (opcional)'};
      const form=this.form(row,{...vehicleStatusValues(item),...item},[text('name'),{name:'icon',selector:{icon:{}}},text('normal_value'),text('attention_value'),text('normal_text'),text('attention_text')],patch=>{Object.assign(item,patch);row.querySelector('summary').textContent=item.name||this.t(STATUS_TYPES[item.kind]||'Información');this.emit();});form.computeLabel=f=>this.t(labels[f.name]);
      this.button(row,'Eliminar',()=>{items.splice(index,1);this.emit();this.render();},true);
    });
    const toolbar=document.createElement('div');toolbar.className='toolbar';const picker=document.createElement('select');picker.setAttribute('aria-label',this.t('Tipo de indicador'));
    for(const [value,label]of Object.entries(STATUS_TYPES)){const option=document.createElement('option');option.value=value;option.textContent=this.t(label);picker.append(option);}toolbar.append(picker);panel.append(toolbar);
    this.button(toolbar,'Añadir indicador',()=>{const item=newVehicleStatus(picker.value);(block.vehicle_status??=[]).push(item);this.openKey=item.id;this.emit();this.render();});
    const note=document.createElement('p');note.className='muted';note.textContent=this.t('Valores predeterminados: locked/unlocked para cerraduras, closed/open para cover y off/on para sensores binarios. Revisa los valores de tu integración. Los estados no reconocidos muestran Sin datos.');panel.append(note);
  }
  rainEditor(parent,block){
    const panel=this.panel(parent,block.id+'-rain','Lluvia sobre el vehículo'),options={enabled:false,source:'weather',animate:true,intensity:'normal',home_value:'home',rain_value:'on',threshold:0,max_age_minutes:180,covered_value:'on',uncovered_value:'off',...block.rain};
    const labels={enabled:'Mostrar lluvia',source:'Origen de la lluvia',entity:'Entidad de lluvia',rain_value:'Estado que significa lluvia',threshold:'Lluvia si el valor es mayor que',animate:'Animar lluvia',intensity:'Intensidad visual',max_age_minutes:'Antigüedad máxima de lluvia · minutos',home_only:'Solo cuando el coche esté en casa',location_entity:'Entidad de ubicación del vehículo',home_value:'Estado que significa en casa',covered:'Coche bajo techo',covered_entity:'Sensor de coche bajo techo (opcional)',covered_value:'Estado que significa bajo techo',uncovered_value:'Estado que significa al aire libre',preview:'Vista previa de lluvia (datos de ejemplo)'};
    const update=patch=>{const changed=('enabled'in patch&&patch.enabled!==options.enabled)||('source'in patch&&patch.source!==options.source)||('home_only'in patch&&patch.home_only!==options.home_only);block.rain={...options,...block.rain,...patch};this.emit();if(changed)this.render();};
    const toggle=this.form(panel,options,[bool('enabled')],update);toggle.computeLabel=f=>this.t(labels[f.name]);if(!options.enabled)return;
    const domain=options.source==='binary'?['binary_sensor','input_boolean']:options.source==='numeric'?['sensor','number','input_number']:'weather';
    const schema=[select('source',{weather:'Entidad meteorológica',binary:'Sensor de lluvia · sí/no',numeric:'Sensor de precipitación actual'}),entity('entity',domain)];
    if(options.source==='binary')schema.push(text('rain_value'));
    if(options.source==='numeric')schema.push(numeric('threshold',0,100000,0.1));
    schema.push(select('intensity',{light:'Ligera',normal:'Normal',heavy:'Intensa'}),bool('animate'),numeric('max_age_minutes',1,1440),bool('home_only'));
    if(options.home_only)schema.push(entity('location_entity',['person','device_tracker','binary_sensor','input_boolean']),text('home_value'));
    schema.push(bool('covered'),entity('covered_entity',['binary_sensor','input_boolean']),text('covered_value'),text('uncovered_value'),bool('preview'));
    const form=this.form(panel,options,schema,update);form.computeLabel=f=>this.t(labels[f.name]);
    for(const message of ['Usa condiciones actuales, no previsiones ni lluvia acumulada. Sin datos recientes no se muestra lluvia. La intensidad es visual y no estima la precipitación real.','Activa solo en casa si el sensor pertenece a tu vivienda. Bajo techo oculta la lluvia; un sensor de techo desconocido también la oculta.','La vista previa ignora sensores, ubicación y techo y muestra una etiqueta de ejemplo. Desactívala después de probar.']){const hint=document.createElement('p');hint.className='muted';hint.textContent=this.t(message);panel.append(hint);}
  }
  blockEditor(panel,block){
    this.form(panel,block,[text('title')],patch=>{Object.assign(block,patch);panel.querySelector('summary').textContent=block.title||this.t(TYPES[block.type]);this.emit();});
    if(['start','fields','power','tyres','expenses','map'].includes(block.type))this.freshnessEditor(panel,block);
    if(block.type==='start'){
      const image=this.panel(panel,block.id+'-image','Imagen del vehículo');
      this.form(image,block,[bool('show_image'),text('image'),numeric('image_height',80,600,10)],patch=>{Object.assign(block,patch);this.emit();});
      const otaPanel=this.panel(panel,block.id+'-ota','Versión del sistema y actualizaciones');
      this.form(otaPanel,block,[entity('ota_version_entity','sensor'),entity('ota_status_entity',['sensor','binary_sensor','update'])],patch=>{Object.assign(block,patch);this.emit();});
      this.rainEditor(panel,block);
      this.statusEditor(panel,block);
      const charge=this.panel(panel,block.id+'-charge','Estado y animación de carga');
      this.form(charge,block,[entity('connector_entity','binary_sensor'),entity('charging_entity'),text('charging_value'),entity('power_entity','sensor'),bool('show_status'),bool('show_cable'),bool('animate')],patch=>{Object.assign(block,patch);this.emit();});
      const hint=document.createElement('p');hint.className='muted';hint.textContent=this.t('La manguera queda fija cuando el conector está conectado y no entra energía. La imagen permanece dentro de Home Assistant; usa una URL o una ruta /local/.');charge.append(hint);
      const fields=this.panel(panel,block.id+'-fields','Información sobre el vehículo',true);this.fieldList(fields,block.fields??(block.fields=[]),block.id);
    }else if(['fields','power','modes','actions','limits'].includes(block.type)){
      this.fieldList(panel,block.fields??(block.fields=[]),block.id,({power:'power',modes:'mode',actions:'action',limits:'limit'})[block.type]??'info');
    }else if(block.type==='map'){
      this.form(panel,block,[entity('entity',['person','device_tracker']),numeric('zoom',1,20),numeric('hours',0,168)],patch=>{Object.assign(block,patch);this.emit();});
    }else if(block.type==='tyres'){
      this.colorEditor(panel,block,'pressure_colors',block.id+'-pressure');
      this.colorEditor(panel,block,'pressure_colors_front',block.id+'-pressure-front','Colores de presión · eje delantero');
      this.colorEditor(panel,block,'pressure_colors_rear',block.id+'-pressure-rear','Colores de presión · eje trasero');
      const hint=document.createElement('p');hint.className='muted';hint.textContent=this.t('Parte delantera arriba. Asigna cada sensor a la rueda que corresponde. La unidad de origen se obtiene del sensor.');panel.append(hint);
      block.positions??={};this.form(panel,block.positions,Object.keys(POSITIONS).map(key=>entity(key,'sensor')),patch=>{Object.assign(block.positions,patch);this.emit();});
      this.form(panel,block,[select('unit',{bar:'bar',kPa:'kPa',psi:'psi'}),numeric('decimals',0,3),bool('show_dates')],patch=>{Object.assign(block,patch);this.emit();});
      const recommendations=this.panel(panel,block.id+'-recommended','Presiones recomendadas');
      this.form(recommendations,block,[numeric('recommended_front_bar',0,10,0.1),numeric('recommended_rear_bar',0,10,0.1)],patch=>{Object.assign(block,patch);this.emit();});
      const recommendationHint=document.createElement('p');recommendationHint.className='muted';recommendationHint.textContent=this.t('Introduce las presiones en frío de la etiqueta del vehículo. Se guardan en bar y se convierten a la unidad mostrada. Vacío o 0 oculta la referencia.');recommendations.append(recommendationHint);
      const advice=this.panel(panel,block.id+'-advice','Consejos y perfiles de presión');
      const options={enabled:false,profile:'normal',max_temperature_age_minutes:30,temperature_mode:'fixed',home_value:'home',...block.pressure_advice};
      const labels={max_temperature_age_minutes:'Antigüedad máxima de temperatura · minutos',temperature_mode:'Origen de la temperatura',location_entity:'Entidad de ubicación del vehículo',home_value:'Estado que significa en casa',away_temperature_entity:'Temperatura exterior del vehículo · fuera de casa',enabled:'Mostrar consejos de presión',profile:'Perfil de carga',full_front_bar:'Plena carga delante · bar (en frío)',full_rear_bar:'Plena carga detrás · bar (en frío)',temperature_entity:'Temperatura exterior (opcional)',trip_end_entity:'Sensor con la fecha de fin del último trayecto (opcional)'};
      const form=this.form(advice,options,[bool('enabled'),select('profile',{normal:'Carga normal',full:'Plena carga'}),numeric('full_front_bar',0,10,0.1),numeric('full_rear_bar',0,10,0.1),select('temperature_mode',{fixed:'Sensor fijo',location:'Según la ubicación'}),entity('location_entity',['person','device_tracker','binary_sensor','input_boolean']),text('home_value'),entity('temperature_entity','sensor'),entity('away_temperature_entity','sensor'),numeric('max_temperature_age_minutes',1,1440),entity('trip_end_entity','sensor')],patch=>{block.pressure_advice={...options,...block.pressure_advice,...patch};this.emit();});form.computeLabel=field=>this.t(labels[field.name]);
      const adviceHint=document.createElement('p');adviceHint.className='muted';adviceHint.textContent=this.t('Usa exclusivamente los valores de la etiqueta para cada carga. El perfil cambia la referencia, no los umbrales de color. Temperatura en °C o °F, con antigüedad máxima configurable (30 minutos por defecto); a partir de 30 °C muestra un consejo. El sensor de trayecto debe contener una fecha ISO o Unix; durante 2 horas indica circulación reciente, sin confirmar que las ruedas estén calientes o frías.');advice.append(adviceHint);
      const locationHint=document.createElement('p');locationHint.className='muted';locationHint.textContent=this.t('Según la ubicación: usa el sensor exterior de casa cuando coincida el estado configurado; fuera usa exclusivamente el sensor del vehículo. Con ubicación desconocida no selecciona temperatura. No reutiliza la temperatura de casa fuera de ella.');advice.append(locationHint);
      block.body_parts??={};
      const body=this.panel(panel,block.id+'-body','Puertas, capó y maletero');
      for(const [key,label]of Object.entries(BODY_PARTS)){
        const box=this.panel(body,block.id+'-body-'+key,label);
        this.form(box,{open_value:'on',closed_value:'off',...block.body_parts[key]},[entity('entity'),text('name'),text('open_value'),text('closed_value')],patch=>{block.body_parts[key]={open_value:'on',closed_value:'off',...block.body_parts[key],...patch};this.emit();});
      }
      const gear=this.panel(panel,block.id+'-gear','Marcha');
      this.form(gear,block,[entity('gear_entity'),text('gear_name')],patch=>{Object.assign(block,patch);this.emit();});

    }else if(block.type==='expenses'){
      this.fieldList(this.panel(panel,block.id+'-prices','Precios de referencia'),block.prices??(block.prices=[]),block.id,'price');
      const groups=block.groups??(block.groups=[]);
      groups.forEach((group,index)=>{const box=this.panel(panel,group.id,group.name||'Grupo');this.reorderHandle(box,groups,index,block.id+'-groups');this.form(box,group,[text('name'),{name:'icon',selector:{icon:{}}},select('style',{cost:'Normal',solar:'Ahorro · verde',diesel:'Destacado'})],patch=>{Object.assign(group,patch);box.querySelector('summary').textContent=group.name||this.t('Grupo');this.emit();});this.fieldList(box,group.fields??(group.fields=[]),group.id,'expense');this.button(box,'Eliminar grupo',()=>{groups.splice(index,1);this.emit();this.render();},true);});
      this.button(panel,'＋ Añadir grupo',()=>{groups.push({id:uid(),name:this.t('Nuevo grupo'),icon:'mdi:cash',fields:[]});this.emit();this.render();});
    }
    this.form(panel,block,[{name:'note',selector:{text:{multiline:true}}}],patch=>{Object.assign(block,patch);this.emit();});
  }
  render(){
    if(!this.config)return;if(!this.shadowRoot)this.attachShadow({mode:'open'});const root=this.shadowRoot;
    const state=new Map([...root.querySelectorAll('details[data-key]')].map(el=>[el.dataset.key,el.open]));
    const scroll=[];for(let node=this;node;node=node.parentElement??node.getRootNode()?.host){scroll.push([node,node.scrollTop]);}
    root.innerHTML=`<style>${CSS}</style><div class="intro"><h3>VE Builder Card</h3><p>${this.t('Añade un bloque, elige sus entidades y personaliza la presentación. La vista previa se actualiza mientras editas.')}</p></div><div class="warnings" role="status"></div>`;
    this.form(root,{language:'auto',...this.config},[text('title'),{name:'language',selector:{select:{mode:'dropdown',options:Object.entries(LANGUAGES).map(([value,label])=>({value,label:value==='auto'?this.t('Automático')+' · Home Assistant':label}))}}}],patch=>{const changed=patch.language!==undefined&&patch.language!==this.config.language;Object.assign(this.config,patch);this.emit();if(changed)this.render();});
    this.historyToolbar(root);
    this.alertsEditor(root);
    this.sectionClipboard(root);
    this.transferPanel(root);
    if(this.deviceFilterError){const warning=document.createElement('p');warning.className='muted';warning.textContent=this.t('No se pudo cargar el filtro. Puedes elegir la entidad sin filtrar.');root.append(warning);}
    this.wizardPanel(root);
    this.templates(root);
    this.config.blocks.forEach((block,index)=>{
      const panel=this.panel(root,block.id,block.title||TYPES[block.type]||'Bloque');this.reorderHandle(panel,this.config.blocks,index,'blocks');this.blockEditor(panel,block);
      const toolbar=document.createElement('div');toolbar.className='toolbar';panel.append(toolbar);
      this.button(toolbar,'Duplicar bloque',()=>{const copy=clone(block);copy.id=uid();copy.fields?.forEach(f=>f.id=uid());copy.prices?.forEach(f=>f.id=uid());copy.vehicle_status?.forEach(f=>f.id=uid());copy.groups?.forEach(g=>{g.id=uid();g.fields?.forEach(f=>f.id=uid());});this.config.blocks.splice(index+1,0,copy);this.emit();this.render();});
      this.button(toolbar,'Copiar apartado',()=>this.copySection(block));
      this.button(toolbar,'Eliminar bloque',()=>{this.config.blocks.splice(index,1);this.emit();this.render();},true);
    });
    const hint=document.createElement('p');hint.className='muted';hint.textContent=this.t('Elige un tipo de bloque genérico. Después configura su título, entidades y presentación. No se copian los datos de otros bloques.');root.append(hint);
    const add=document.createElement('div');add.className='add';const picker=document.createElement('select');picker.setAttribute('aria-label',this.t('Tipo de bloque'));for(const [type,label]of Object.entries(TYPES)){const option=document.createElement('option');option.value=type;option.textContent=this.t(label);picker.append(option);}add.append(picker);
    this.button(add,'＋ Añadir bloque',()=>{const block=newBlock(picker.value);block.title=this.t(block.title);if(block.note)block.note=this.t(block.note);this.config.blocks.push(block);this.openKey=block.id;this.emit();this.render();});root.append(add);
    const description=document.createElement('p');description.className='muted';description.id='block-type-description';description.setAttribute('aria-live','polite');picker.setAttribute('aria-describedby',description.id);const describe=()=>description.textContent=this.t(BLOCK_DESCRIPTIONS[picker.value]);picker.addEventListener('change',describe);describe();root.append(description);
    root.querySelectorAll('details[data-key]').forEach(el=>{if(state.has(el.dataset.key))el.open=state.get(el.dataset.key);if(el.dataset.key===this.openKey){el.open=true;let parent=el.parentElement?.closest('details');while(parent){parent.open=true;parent=parent.parentElement?.closest('details');}}});this.openKey=null;
    for(const [node,top]of scroll)node.scrollTop=top;this.updateWarnings();
  }
}
if(!customElements.get('ve-builder-card-editor'))customElements.define('ve-builder-card-editor',VEBuilderEditor);
