import {STATUS_TYPES,newVehicleStatus,vehicleStatusValues} from './vehicle-status.js';
import {language,translate,translateSchema,standardLabel} from './i18n.js';
import {TYPES,POSITIONS,clone,normalize,newBlock,newField,uid,chargingModeTap,validate,CARD_SECTIONS,cardSectionBlocks,BODY_PARTS,valueSeverity,CHARGING_SOURCES} from './core.js';

const text=name=>({name,selector:{text:{}}});
const select=(name,options)=>({name,selector:{select:{options:Object.entries(options).map(([value,label])=>({value,label}))}}});
const numeric=(name,min,max,step=1)=>({name,selector:{number:{min,max,step,mode:'box'}}});
const entity=(name,domain)=>({name,selector:{entity:domain?{domain}:{}}});
const bool=name=>({name,selector:{boolean:{}}});
const LABELS={active_value:'Estado activo (opcional)',translate_standard_labels:'Traducir nombres estándar',max_age_minutes:'Considerar antiguo a partir de · minutos',timestamp_entity:'Sensor con la fecha de lectura (opcional)',recommended_front_bar:'Presión recomendada delante · bar (en frío)',recommended_rear_bar:'Presión recomendada detrás · bar (en frío)',enabled:'Activar colores por valor',direction:'Avisar cuando el valor sea',warning:'Umbral de aviso · ámbar',critical:'Umbral crítico · rojo',kind:'Tipo de vehículo',charging:'Incluir carga',vehicle:'Incluir mapa del vehículo',location:'Incluir ubicación',gear_entity:"Sensor de marcha",gear_name:"Nombre de la marcha",open_value:"Estado que significa abierto",closed_value:"Estado que significa cerrado",device:"Filtrar entidades por dispositivo (opcional)",language:'Idioma',title:'Título',name:'Nombre visible (opcional)',entity:'Entidad',icon:'Icono',display:'Presentación',size:'Tamaño',style:'Estilo',width:'Anchura',tap:'Al pulsar',confirm:'Pedir confirmación',decimals:'Decimales',unit:'Unidad (opcional; se obtiene del sensor)',format:'Formato del dato',min:'Mínimo',max:'Máximo',image:'Imagen · URL o ruta /local/',image_height:'Altura de la imagen (px)',show_image:'Mostrar imagen',animate:'Animar durante la carga',show_status:'Mostrar estado de carga',show_cable:'Mostrar manguera',ota_version_entity:'Sensor de versión OTA (opcional)',ota_status_entity:'Sensor de actualización disponible (opcional)',connector_entity:'Sensor del conector',charging_entity:'Entidad del estado de carga',charging_value:'Estado que significa cargando',power_entity:'Potencia real · verifica si entra energía',zoom:'Zoom',hours:'Horas de recorrido · 0 para ocultarlo',show_dates:'Mostrar fechas de lectura',note:'Comentario al pie'};
const CSS=`.section-menu{margin:12px 0;padding:12px;min-width:0;border:1px solid var(--divider-color);border-radius:12px}.section-menu legend{padding:0 4px;font-weight:600}.section-options{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:8px}.section-option{display:flex;align-items:center;gap:8px;min-height:48px;padding:8px;border:1px solid var(--divider-color);border-radius:8px;cursor:pointer}.section-option:has(input:checked){border-color:var(--primary-color)}.section-option input{accent-color:var(--primary-color)}.section-option ha-icon{color:var(--primary-color);flex:none}.section-option small{display:block;line-height:1.25}.section-menu button:disabled{opacity:.5;cursor:default}.image-upload{display:block;margin:10px 0}.image-upload input{display:block;margin-top:6px;max-width:100%}summary.reorder-handle{cursor:grab}summary.reorder-handle:before{content:"⠿";display:inline-block;margin-right:9px;color:var(--secondary-text-color);font-size:20px;vertical-align:middle}summary.reorder-handle:active{cursor:grabbing}details.dragging{opacity:.45}details.drop-target{outline:2px solid var(--primary-color);outline-offset:2px}:host{display:block;color:var(--primary-text-color)}details{border:1px solid var(--divider-color);border-radius:12px;margin:12px 0;padding:12px}details details{background:var(--secondary-background-color);margin:8px 0}summary{cursor:pointer;line-height:1.6;font-weight:600;padding:4px}details[open]>summary{color:var(--primary-color);margin-bottom:10px}button,select{font:inherit;border:1px solid var(--divider-color);background:var(--secondary-background-color);color:var(--primary-text-color);border-radius:8px;padding:9px 12px;min-height:44px;margin:6px 6px 0 0;cursor:pointer}button:hover{border-color:var(--primary-color)}button:focus-visible,summary:focus-visible{outline:2px solid var(--primary-color);outline-offset:3px}.danger{color:var(--error-color,#db4437)}ha-form{display:block;margin:10px 0}.muted{font-size:12px;color:var(--secondary-text-color);line-height:1.5}.warnings{margin:12px 0;font-size:12px;color:var(--secondary-text-color);line-height:1.5}.toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:4px}small{font-size:12px;font-weight:400;color:var(--secondary-text-color)}`;

export class VEBuilderEditor extends HTMLElement {
  get lang(){return language(this.config,this._hass);}
  t(value){return translate(value,this.lang);}
  connectedCallback(){
    // Home Assistant can enable Save when it adds layout defaults to a new card.
    let dialog=this;
    while(dialog&&dialog.localName!=='hui-dialog-edit-card'){
      dialog=dialog.parentElement??dialog.getRootNode()?.host;
    }
    if(!dialog)return;
    this.saveGuard=new AbortController();
    const options={capture:true,signal:this.saveGuard.signal};
    const preventEmptySave=event=>{
      if(this.config?.blocks.length!==0)return;
      event.preventDefault();
      event.stopImmediatePropagation();
      this.shadowRoot?.querySelector('.warnings')?.scrollIntoView({block:'nearest'});
    };
    dialog.addEventListener('click',event=>{
      const save=event.composedPath().some(node=>
        node.localName==='ha-button'&&node.getAttribute('slot')==='primaryAction'&&
        node.parentElement?.localName==='ha-dialog-footer'&&node.getRootNode().host===dialog);
      if(save)preventEmptySave(event);
    },options);
    dialog.addEventListener('editor-save',preventEmptySave,options);
  }
  disconnectedCallback(){
    this.saveGuard?.abort();
  }
  setConfig(config){
    const normalized=normalize(config);
    if(!this.config&&normalized.blocks.length===0)this.emptyStarterConfig=clone(config);
    if(this.config&&JSON.stringify(this.config)===JSON.stringify(normalized))return;
    this._warningConfig=null;this.config=normalized;this.history=[];this.future=[];this.checkpoint=clone(normalized);this.render();
  }
  set hass(hass){const previous=this.lang;this._hass=hass;if(this.config&&previous!==this.lang)this.render();this.shadowRoot?.querySelectorAll('ha-form').forEach(form=>form.hass=hass);this.updateWarnings();}
  emit(){
    this._warningConfig=null;
    this.recordHistory();
    const emptyStarter=this.emptyStarterConfig&&this.config.blocks.length===0;
    if(!emptyStarter||this.emittedSections){
      const config=emptyStarter?this.emptyStarterConfig:this.config;
      this.emittedSections=this.config.blocks.length>0;
      this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:clone(config)},bubbles:true,composed:true}));
    }
    this.updateWarnings();
  }
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
  updateWarnings(){const container=this.shadowRoot?.querySelector('.warnings');if(!container||!this.config)return;if(this._warningConfig!==this.config){this._warningEntities=[...new Set(JSON.stringify(this.config).match(/[a-z_]+\.[a-z0-9_]+/g)??[])];this._warningConfig=this.config;this._warningStates=null;}const states=this._warningEntities.map(id=>this._hass?.states?.[id]);if(this._warningContainer===container&&this._warningLanguage===this.lang&&this._warningStates?.length===states.length&&states.every((v,i)=>v===this._warningStates[i]))return;this._warningStates=states;this._warningContainer=container;this._warningLanguage=this.lang;const issues=validate(this.config,this._hass);container.textContent=this.t(!this.config.blocks.length?'Elige y añade al menos un apartado para crear la tarjeta.':issues.length?`${issues.length} ajuste(s) pendiente(s): ${issues.slice(0,5).join(' ')}${issues.length>5?' …':''}`:'Configuración lista. Pulsa Guardar para conservar los cambios.');}
  button(parent,label,fn,danger=false){const button=document.createElement('button');button.type='button';button.textContent=this.t(label);if(danger)button.className='danger';button.onclick=fn;parent.append(button);return button;}
  panel(parent,key,title,open=false){const panel=document.createElement('details');panel.dataset.key=key;panel.open=open;const summary=document.createElement('summary');summary.textContent=standardLabel(this.t(title),this.lang,this.config.translate_standard_labels!==false);panel.append(summary);parent.append(panel);return panel;}
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
  appendSections(blocks){
    if(!blocks.length)return;
    this.config.blocks.push(...blocks);
    this.openKey=blocks[0].id;
    this.revealSection=blocks[0].id;
    this.emit();
    this.render();
  }
  sectionMenu(parent){
    const group=document.createElement('fieldset');
    group.className='section-menu';
    const legend=document.createElement('legend');
    legend.textContent=this.t('Apartados de la tarjeta');
    group.append(legend);
    const grid=document.createElement('div');
    grid.className='section-options';
    const selected=this.selectedSections??=new Set();
    const add=this.button(group,'Añadir apartados seleccionados',()=>{
      const keys=[...grid.querySelectorAll('input:checked')].map(input=>input.value);
      if(!keys.length)return;
      const blocks=cardSectionBlocks(keys,this.lang);
      selected.clear();
      this.appendSections(blocks);
    });
    add.disabled=selected.size===0;
    group.insertBefore(grid,add);
    for(const [key,entry] of Object.entries(CARD_SECTIONS)){
      const option=document.createElement('label');
      option.className='section-option';
      const input=document.createElement('input');
      input.type='checkbox';
      input.value=key;
      input.checked=selected.has(key);
      input.addEventListener('change',()=>{
        if(input.checked)selected.add(key);
        else selected.delete(key);
        add.disabled=selected.size===0;
      });
      const icon=document.createElement('ha-icon');
      icon.setAttribute('icon',entry.icon);
      icon.setAttribute('aria-hidden','true');
      const copy=document.createElement('span');
      const title=document.createElement('strong');
      title.textContent=this.t(entry.label);
      const description=document.createElement('small');
      description.textContent=this.t(entry.description);
      copy.append(title,description);
      option.append(input,icon,copy);
      grid.append(option);
    }
    parent.append(group);
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
      const domain=kind==='limit'?'input_number':kind==='action'?['switch','input_boolean','lock','button']:undefined;
      this.form(data,{device:this.deviceFilters?.[field.id]??''},[{name:'device',selector:{device:{}}}],patch=>this.filterDevice(field.id,patch.device));
      const schema=[this.entitySchema('entity',domain,this.deviceFilters?.[field.id]),text('name')];if(kind!=='limit')schema.push({name:'icon',selector:{icon:{}}});
      if(kind==='mode')schema.push(text('active_value'));
      if(['info','expense','price','power'].includes(kind))schema.push(...(['expense','price'].includes(kind)?[numeric('decimals',0,6)]:[]),text('unit'));
      if(kind==='info')schema.push(select('format',{auto:'Automático',connection:'Conectado / desconectado',presence:'Presencia'}));
      this.form(data,field,schema,patch=>{const domainChanged=patch.entity!==undefined&&patch.entity.split('.')[0]!==field.entity?.split('.')[0];Object.assign(field,patch);if(domainChanged&&kind==='mode')field.tap=chargingModeTap(field.entity);row.querySelector('summary').textContent=standardLabel(field.name,this.lang,this.config.translate_standard_labels!==false)||this._hass?.states[field.entity]?.attributes?.friendly_name||this.t('Nuevo campo');this.emit();if(domainChanged)this.render();});
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
        this.form(behavior,{tap:kind==='mode'?chargingModeTap(field.entity):kind==='action'?'toggle':'more-info',confirm:domain==='lock',...field},[select('tap',options),bool('confirm')],patch=>{Object.assign(field,patch);this.emit();});
      }
      const toolbar=document.createElement('div');toolbar.className='toolbar';row.append(toolbar);
      this.button(toolbar,'Duplicar',()=>{fields.splice(index+1,0,{...clone(field),id:uid()});this.emit();this.render();});
      this.button(toolbar,'Eliminar',()=>{fields.splice(index,1);this.emit();this.render();},true);
    });
    this.button(parent,kind==='mode'?'＋ Añadir modo de carga':'＋ Añadir campo',()=>{const f=newField();if(['action','mode'].includes(kind))f.tap='toggle';if(kind==='expense')Object.assign(f,{decimals:2,unit:'€'});fields.push(f);this.emit();this.openKey=f.id;this.render();});
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
      const form=this.form(row,{...vehicleStatusValues(item),...item},[text('name'),{name:'icon',selector:{icon:{}}},text('normal_value'),text('attention_value'),text('normal_text'),text('attention_text')],patch=>{Object.assign(item,patch);row.querySelector('summary').textContent=standardLabel(item.name,this.lang,this.config.translate_standard_labels!==false)||this.t(STATUS_TYPES[item.kind]||'Información');this.emit();});form.computeLabel=f=>this.t(labels[f.name]);
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
  batteryEditor(panel,block){
    const group=this.panel(panel,block.id+'-battery','Batería');
    const options=block.battery??{};
    const links=kind=>[
      {value:'',label:'Automático'},
      {value:'none',label:'Mantener separado'},
      ...this.config.blocks.filter(item=>item.type===kind).map(item=>({value:item.id,label:item.title||TYPES[item.type]}))
    ];
    const choice=kind=>({name:kind+'_block',selector:{select:{options:links(kind)}}});
    const schema=[
      ...(block.type==='modes'?[{name:'enabled',selector:{select:{options:[
        {value:'auto',label:'Automático'},{value:'yes',label:'Activado'},{value:'no',label:'Desactivado'}
      ]}}}]:[]),
      entity('level_entity','sensor'),entity('range_entity','sensor'),
      entity('connector_entity',['binary_sensor','input_boolean']),entity('charging_entity'),text('charging_value'),
      entity('power_entity','sensor'),entity('intensity_entity',['number','input_number','sensor']),
      entity('vehicle_limit_entity',['number','input_number']),entity('charger_limit_entity'),entity('energy_limit_entity'),
      entity('wait_reason_entity',['sensor','input_text']),
      choice('limits'),choice('power'),bool('show_preheating'),
      entity('preheat_state_entity',['binary_sensor','input_boolean']),
      entity('preheat_target_entity'),text('start_service'),text('stop_service')
    ];
    const labels={
      enabled:'Mostrar como Batería',level_entity:'Batería del vehículo',range_entity:'Autonomía',
      connector_entity:'Sensor del conector',charging_entity:'Entidad del estado de carga',charging_value:'Estado que significa cargando',
      power_entity:'Potencia de carga',intensity_entity:'Intensidad configurada',vehicle_limit_entity:'Máximo en el coche',limits_block:'Límites de carga',power_block:'Bloque de potencia',
      charger_limit_entity:'Límite del cargador',energy_limit_entity:'Tope de energía',wait_reason_entity:'Entidad con el motivo de espera',
      show_preheating:'Mostrar precalentamiento',preheat_state_entity:'Sensor de precalentamiento',
      preheat_target_entity:'Entidad objetivo del vehículo',start_service:'Servicio de inicio',stop_service:'Servicio de parada'
    };
    const form=this.form(group,{
      start_service:'xpeng.start_battery_preheating',stop_service:'xpeng.stop_battery_preheating',
      ...options,enabled:options.enabled===true?'yes':options.enabled===false?'no':'auto'
    },schema,patch=>{
      if('enabled' in patch){
        patch.enabled=patch.enabled==='yes'?true:patch.enabled==='no'?false:undefined;
      }
      block.battery={...block.battery,...patch};
      if(block.battery.enabled===undefined)delete block.battery.enabled;
      this.emit();
    });
    form.computeLabel=field=>this.t(labels[field.name]);
  }
  vehicleImageUpload(panel,block){
    const label=document.createElement('label');
    label.className='image-upload';
    label.textContent=this.t('Subir imagen');
    const input=document.createElement('input');
    input.type='file';
    input.accept='image/png,image/jpeg,image/gif,image/webp';
    label.append(input);
    const status=document.createElement('p');
    status.className='muted';
    status.setAttribute('role','status');
    panel.append(label,status);
    input.addEventListener('change',async()=>{
      const file=input.files?.[0];
      if(!file)return;
      const originalImage=block.image;
      input.disabled=true;
      status.textContent=this.t('Subiendo imagen…');
      try{
        const body=new FormData();
        body.append('file',file);
        const response=await this._hass.fetchWithAuth('/api/image/upload',{method:'POST',body});
        if(!response.ok)throw new Error('Image upload failed');
        const {id}=await response.json();
        if(typeof id!=='string'||!id)throw new Error('Missing image ID');
        if(!this.isConnected||!this.config.blocks.includes(block)||block.image!==originalImage)return;
        block.image='/api/image/serve/'+encodeURIComponent(id)+'/original';
        block.show_image=true;
        this.openKey=panel.dataset.key;
        this.emit();
        this.render();
      }catch{
        status.textContent=this.t('No se pudo subir la imagen.');
      }finally{
        input.value='';
        input.disabled=false;
      }
    });
  }
  blockEditor(panel,block){
    if(block.type==='map'){
      this.form(panel,block,[entity('entity',['person','device_tracker'])],patch=>{Object.assign(block,patch);this.emit();});
    }
    this.form(panel,block,[text('title')],patch=>{Object.assign(block,patch);panel.querySelector('summary').textContent=standardLabel(block.title,this.lang,this.config.translate_standard_labels!==false)||this.t(TYPES[block.type]);this.emit();});
    if(['start','fields','power','tyres','expenses','map'].includes(block.type))this.freshnessEditor(panel,block);
    if(block.type==='start'){
      const otaPanel=this.panel(panel,block.id+'-ota','Versión del sistema y actualizaciones');
      this.form(otaPanel,block,[entity('ota_version_entity','sensor'),entity('ota_status_entity',['sensor','binary_sensor','update'])],patch=>{Object.assign(block,patch);this.emit();});
      const fields=this.panel(panel,block.id+'-fields','Información sobre el vehículo',true);this.fieldList(fields,block.fields??(block.fields=[]),block.id);
      const image=this.panel(panel,block.id+'-image','Imagen del vehículo');
      this.vehicleImageUpload(image,block);
      this.form(image,block,[bool('show_image'),text('image'),numeric('image_height',80,600,10)],patch=>{Object.assign(block,patch);this.emit();});
      const charge=this.panel(panel,block.id+'-charge','Estado y animación de carga');
      this.form(charge,block,[entity('connector_entity','binary_sensor'),entity('charging_entity'),text('charging_value'),entity('power_entity','sensor'),bool('show_status'),bool('show_cable'),bool('animate')],patch=>{Object.assign(block,patch);this.emit();});
      const hint=document.createElement('p');hint.className='muted';hint.textContent=this.t('La manguera queda fija cuando el conector está conectado y no entra energía. La imagen permanece dentro de Home Assistant; usa una URL o una ruta /local/.');charge.append(hint);
      this.rainEditor(panel,block);
      this.statusEditor(panel,block);
    }else if(['modes','battery'].includes(block.type)){
      this.fieldList(panel,block.fields??(block.fields=[]),block.id,'mode');
      this.batteryEditor(panel,block);
    }else if(['fields','power','actions','limits'].includes(block.type)){
      this.fieldList(panel,block.fields??(block.fields=[]),block.id,({power:'power',modes:'mode',actions:'action',limits:'limit'})[block.type]??'info');
    }else if(block.type==='map'){
      this.form(panel,block,[numeric('zoom',1,20),numeric('hours',0,168)],patch=>{Object.assign(block,patch);this.emit();});
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
      const sources=this.panel(panel,block.id+'-charging-sources','Fuentes de carga');
      const sourceLabels={total_entity:'Total (W o kWh)',vehicle_battery_entity:'Batería del vehículo',...Object.fromEntries(Object.entries(CHARGING_SOURCES).map(([key,[label]])=>[key,label]))};
      const sourceForm=this.form(sources,block.charging_sources??{},Object.keys(sourceLabels).map(key=>entity(key)),patch=>{
        block.charging_sources={...block.charging_sources,...patch};
        this.emit();
      });
      sourceForm.computeLabel=field=>this.t(sourceLabels[field.name]);
      this.form(sources,block.charging_sources??{},[select('mode',{'auto':'Automático según unidad','power':'Potencia instantánea (W)','energy':'Energía diaria (kWh)'})],patch=>{block.charging_sources={...block.charging_sources,...patch};this.emit();});
      this.fieldList(this.panel(panel,block.id+'-prices','Precios de referencia'),block.prices??(block.prices=[]),block.id,'price');
      const groups=block.groups??(block.groups=[]);
      groups.forEach((group,index)=>{const box=this.panel(panel,group.id,group.name||'Grupo');this.reorderHandle(box,groups,index,block.id+'-groups');this.form(box,group,[text('name'),{name:'icon',selector:{icon:{}}},select('style',{cost:'Normal',solar:'Ahorro · verde',diesel:'Destacado'})],patch=>{Object.assign(group,patch);box.querySelector('summary').textContent=standardLabel(group.name,this.lang,this.config.translate_standard_labels!==false)||this.t('Grupo');this.emit();});this.fieldList(box,group.fields??(group.fields=[]),group.id,'expense');this.button(box,'Eliminar grupo',()=>{groups.splice(index,1);this.emit();this.render();},true);});
      this.button(panel,'＋ Añadir grupo',()=>{groups.push({id:uid(),name:this.t('Nuevo grupo'),icon:'mdi:cash',fields:[]});this.emit();this.render();});
    }
    this.form(panel,block,[{name:'note',selector:{text:{multiline:true}}}],patch=>{Object.assign(block,patch);this.emit();});
  }
  render(){
    if(!this.config)return;if(!this.shadowRoot)this.attachShadow({mode:'open'});const root=this.shadowRoot;
    const state=new Map([...root.querySelectorAll('details[data-key]')].map(el=>[el.dataset.key,el.open]));
    const scroll=[];for(let node=this;node;node=node.parentElement??node.getRootNode()?.host){scroll.push([node,node.scrollTop]);}
    root.innerHTML=`<style>${CSS}</style><div class="warnings" role="status"></div>`;
    this.sectionMenu(root);
    if(this.deviceFilterError){const warning=document.createElement('p');warning.className='muted';warning.textContent=this.t('No se pudo cargar el filtro. Puedes elegir la entidad sin filtrar.');root.append(warning);}
    if(this.config.blocks.length)this.historyToolbar(root);
    this.config.blocks.forEach((block,index)=>{
      const panel=this.panel(root,block.id,block.title||TYPES[block.type]||'Bloque');this.reorderHandle(panel,this.config.blocks,index,'blocks');this.blockEditor(panel,block);
      const toolbar=document.createElement('div');toolbar.className='toolbar';panel.append(toolbar);
      this.button(toolbar,'Duplicar bloque',()=>{const copy=clone(block);copy.id=uid();copy.fields?.forEach(f=>f.id=uid());copy.prices?.forEach(f=>f.id=uid());copy.vehicle_status?.forEach(f=>f.id=uid());copy.groups?.forEach(g=>{g.id=uid();g.fields?.forEach(f=>f.id=uid());});this.config.blocks.splice(index+1,0,copy);this.emit();this.render();});
      this.button(toolbar,'Eliminar bloque',()=>{this.config.blocks.splice(index,1);this.emit();this.render();},true);
    });
    root.querySelectorAll('details[data-key]').forEach(el=>{if(state.has(el.dataset.key))el.open=state.get(el.dataset.key);if(el.dataset.key===this.openKey){el.open=true;let parent=el.parentElement?.closest('details');while(parent){parent.open=true;parent=parent.parentElement?.closest('details');}}});this.openKey=null;
    for(const [node,top]of scroll)node.scrollTop=top;
    if(this.revealSection){
      const target=[...root.querySelectorAll('details[data-key]')].find(panel=>panel.dataset.key===this.revealSection);
      target?.scrollIntoView?.({block:'nearest'});
      this.revealSection=null;
    }
    this.updateWarnings();
  }
}
if(!customElements.get('ve-builder-card-editor'))customElements.define('ve-builder-card-editor',VEBuilderEditor);
