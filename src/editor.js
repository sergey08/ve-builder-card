import {language,translate,translateSchema} from './i18n.js';
import {TYPES,POSITIONS,clone,normalize,newBlock,newField,uid,validate,templateBlocks} from './core.js';

const text=name=>({name,selector:{text:{}}});
const select=(name,options)=>({name,selector:{select:{options:Object.entries(options).map(([value,label])=>({value,label}))}}});
const numeric=(name,min,max,step=1)=>({name,selector:{number:{min,max,step,mode:'box'}}});
const entity=(name,domain)=>({name,selector:{entity:domain?{domain}:{}}});
const bool=name=>({name,selector:{boolean:{}}});
const LABELS={language:'Idioma',title:'Título',name:'Nombre visible (opcional)',entity:'Entidad',icon:'Icono',display:'Presentación',size:'Tamaño',style:'Estilo',width:'Anchura',tap:'Al pulsar',confirm:'Pedir confirmación',decimals:'Decimales',unit:'Unidad (opcional; se obtiene del sensor)',format:'Formato del dato',min:'Mínimo',max:'Máximo',image:'Imagen · URL o ruta /local/',image_height:'Altura de la imagen (px)',show_image:'Mostrar imagen',animate:'Animar durante la carga',show_status:'Mostrar estado de carga',show_cable:'Mostrar manguera',connector_entity:'Sensor del conector',charging_entity:'Entidad del estado de carga',charging_value:'Estado que significa cargando',power_entity:'Potencia real · verifica si entra energía',zoom:'Zoom',hours:'Horas de recorrido · 0 para ocultarlo',show_dates:'Mostrar fechas de lectura',note:'Comentario al pie'};
const CSS=`summary.reorder-handle{cursor:grab}summary.reorder-handle:before{content:"⠿";display:inline-block;margin-right:9px;color:var(--secondary-text-color);font-size:20px;vertical-align:middle}summary.reorder-handle:active{cursor:grabbing}details.dragging{opacity:.45}details.drop-target{outline:2px solid var(--primary-color);outline-offset:2px}:host{display:block;color:var(--primary-text-color)}.intro{padding:14px;border-radius:12px;background:var(--secondary-background-color);line-height:1.6}.intro h3{margin:0 0 6px}.intro p{margin:0;color:var(--secondary-text-color);font-size:13px}details{border:1px solid var(--divider-color);border-radius:12px;margin:12px 0;padding:12px}details details{background:var(--secondary-background-color);margin:8px 0}summary{cursor:pointer;line-height:1.6;font-weight:600;padding:4px}details[open]>summary{color:var(--primary-color);margin-bottom:10px}button,select{font:inherit;border:1px solid var(--divider-color);background:var(--secondary-background-color);color:var(--primary-text-color);border-radius:8px;padding:9px 12px;min-height:44px;margin:6px 6px 0 0;cursor:pointer}button:hover{border-color:var(--primary-color)}button:focus-visible,summary:focus-visible{outline:2px solid var(--primary-color);outline-offset:3px}.danger{color:var(--error-color,#db4437)}ha-form{display:block;margin:10px 0}.muted{font-size:12px;color:var(--secondary-text-color);line-height:1.5}.warnings{margin:12px 0;font-size:12px;color:var(--secondary-text-color);line-height:1.5}.add{padding:12px;border:1px dashed var(--divider-color);border-radius:12px}.toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:4px}small{font-size:12px;font-weight:400;color:var(--secondary-text-color)}`;

export class VEBuilderEditor extends HTMLElement {
  get lang(){return language(this.config,this._hass);}
  t(value){return translate(value,this.lang);}
  setConfig(config){
    const normalized=normalize(config);
    if(this.config&&JSON.stringify(this.config)===JSON.stringify(normalized))return;
    this.config=normalized;this.render();
  }
  set hass(hass){const previous=this.lang;this._hass=hass;if(this.config&&previous!==this.lang)this.render();this.shadowRoot?.querySelectorAll('ha-form').forEach(form=>form.hass=hass);this.updateWarnings();}
  emit(){this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:clone(this.config)},bubbles:true,composed:true}));this.updateWarnings();}
  updateWarnings(){const container=this.shadowRoot?.querySelector('.warnings');if(!container||!this.config)return;const issues=validate(this.config,this._hass);container.textContent=this.t(issues.length?`${issues.length} ajuste(s) pendiente(s): ${issues.slice(0,5).join(' ')}${issues.length>5?' …':''}`:'Configuración lista. Pulsa Guardar para conservar los cambios.');}
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
  templates(parent){
    const box=this.panel(parent,'templates','Plantillas iniciales',this.config.blocks.length===0);
    const hint=document.createElement('p');hint.className='muted';hint.textContent=this.t('Añade una base y selecciona tus entidades. Los bloques configurados se conservan.');box.append(hint);
    for(const [kind,label]of Object.entries({electric:'Vehículo eléctrico',combustion:'Gasolina / GNC',expenses:'Gastos y ahorro',tyres:'Neumáticos'}))this.button(box,label,()=>this.addTemplate(kind));
    const tip=document.createElement('p');tip.className='muted';tip.textContent=this.t('Arrastra el asa de un campo, grupo o bloque para cambiar su posición. Con teclado: Alt + flechas.');box.append(tip);
  }
  fieldList(parent,fields,key,kind='info'){
    fields.forEach((field,index)=>{
      const row=this.panel(parent,field.id,field.name||this._hass?.states[field.entity]?.attributes?.friendly_name||'Nuevo campo',!field.entity);
      this.reorderHandle(row,fields,index,key);
      const data=this.panel(row,field.id+'-data','Datos',true);
      const domain=kind==='limit'?'input_number':kind==='action'?['switch','input_boolean','lock','button']:kind==='mode'?['switch','input_boolean']:undefined;
      const schema=[entity('entity',domain),text('name')];if(kind!=='limit')schema.push({name:'icon',selector:{icon:{}}});
      if(['info','expense','price','power'].includes(kind))schema.push(...(['expense','price'].includes(kind)?[numeric('decimals',0,6)]:[]),text('unit'));
      if(kind==='info')schema.push(select('format',{auto:'Automático',connection:'Conectado / desconectado',presence:'Presencia'}));
      this.form(data,field,schema,patch=>{const domainChanged=patch.entity!==undefined&&patch.entity.split('.')[0]!==field.entity?.split('.')[0];Object.assign(field,patch);row.querySelector('summary').textContent=field.name||this._hass?.states[field.entity]?.attributes?.friendly_name||'Nuevo campo';this.emit();if(domainChanged)this.render();});
      if(!['limit','expense','price'].includes(kind)){
        if(['info','power'].includes(kind)){const advanced=this.panel(row,field.id+'-advanced','Opciones avanzadas');this.form(advanced,field,[numeric('decimals',0,6)],patch=>{Object.assign(field,patch);this.emit();});}
        const appearance=this.panel(row,field.id+'-appearance','Apariencia');
        const schemas=[select('size',{small:'Pequeño',medium:'Mediano',large:'Grande'}),select('style',{subtle:'Suave',outline:'Contorno',accent:'Destacado'}),select('width',{auto:'Media fila',full:'Fila completa'})];
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
  blockEditor(panel,block){
    this.form(panel,block,[text('title')],patch=>{Object.assign(block,patch);panel.querySelector('summary').textContent=block.title||TYPES[block.type];this.emit();});
    if(block.type==='start'){
      const image=this.panel(panel,block.id+'-image','Imagen del vehículo');
      this.form(image,block,[bool('show_image'),text('image'),numeric('image_height',80,600,10)],patch=>{Object.assign(block,patch);this.emit();});
      const charge=this.panel(panel,block.id+'-charge','Estado y animación de carga');
      this.form(charge,block,[entity('connector_entity','binary_sensor'),entity('charging_entity'),text('charging_value'),entity('power_entity','sensor'),bool('show_status'),bool('show_cable'),bool('animate')],patch=>{Object.assign(block,patch);this.emit();});
      const hint=document.createElement('p');hint.className='muted';hint.textContent=this.t('La manguera queda fija cuando el conector está conectado y no entra energía. La imagen permanece dentro de Home Assistant; usa una URL o una ruta /local/.');charge.append(hint);
      const fields=this.panel(panel,block.id+'-fields','Información sobre el vehículo',true);this.fieldList(fields,block.fields??(block.fields=[]),block.id);
    }else if(['fields','power','modes','actions','limits'].includes(block.type)){
      this.fieldList(panel,block.fields??(block.fields=[]),block.id,({power:'power',modes:'mode',actions:'action',limits:'limit'})[block.type]??'info');
    }else if(block.type==='map'){
      this.form(panel,block,[entity('entity',['person','device_tracker']),numeric('zoom',1,20),numeric('hours',0,168)],patch=>{Object.assign(block,patch);this.emit();});
    }else if(block.type==='tyres'){
      const hint=document.createElement('p');hint.className='muted';hint.textContent=this.t('Parte delantera arriba. Asigna cada sensor a la rueda que corresponde. La unidad de origen se obtiene del sensor.');panel.append(hint);
      block.positions??={};this.form(panel,block.positions,Object.keys(POSITIONS).map(key=>entity(key,'sensor')),patch=>{Object.assign(block.positions,patch);this.emit();});
      this.form(panel,block,[select('unit',{bar:'bar',kPa:'kPa',psi:'psi'}),numeric('decimals',0,3),bool('show_dates')],patch=>{Object.assign(block,patch);this.emit();});
    }else if(block.type==='expenses'){
      this.fieldList(this.panel(panel,block.id+'-prices','Precios de referencia'),block.prices??(block.prices=[]),block.id,'price');
      const groups=block.groups??(block.groups=[]);
      groups.forEach((group,index)=>{const box=this.panel(panel,group.id,group.name||'Grupo');this.reorderHandle(box,groups,index,block.id+'-groups');this.form(box,group,[text('name'),{name:'icon',selector:{icon:{}}},select('style',{cost:'Normal',solar:'Ahorro · verde',diesel:'Destacado'})],patch=>{Object.assign(group,patch);box.querySelector('summary').textContent=group.name||'Grupo';this.emit();});this.fieldList(box,group.fields??(group.fields=[]),group.id,'expense');this.button(box,'Eliminar grupo',()=>{groups.splice(index,1);this.emit();this.render();},true);});
      this.button(panel,'＋ Añadir grupo',()=>{groups.push({id:uid(),name:this.t('Nuevo grupo'),icon:'mdi:cash',fields:[]});this.emit();this.render();});
    }
    this.form(panel,block,[{name:'note',selector:{text:{multiline:true}}}],patch=>{Object.assign(block,patch);this.emit();});
  }
  render(){
    if(!this.config)return;if(!this.shadowRoot)this.attachShadow({mode:'open'});const root=this.shadowRoot;
    const state=new Map([...root.querySelectorAll('details[data-key]')].map(el=>[el.dataset.key,el.open]));
    const scroll=[];for(let node=this;node;node=node.parentElement??node.getRootNode()?.host){scroll.push([node,node.scrollTop]);}
    root.innerHTML=`<style>${CSS}</style><div class="intro"><h3>VE Builder Card</h3><p>${this.t('Añade un bloque, elige sus entidades y personaliza la presentación. La vista previa se actualiza mientras editas.')}</p></div><div class="warnings" role="status"></div>`;
    this.form(root,{language:'auto',...this.config},[text('title'),select('language',{auto:'Automatic / Automático',en:'English',es:'Español'})],patch=>{const changed=patch.language!==undefined&&patch.language!==this.config.language;Object.assign(this.config,patch);this.emit();if(changed)this.render();});
    this.templates(root);
    this.config.blocks.forEach((block,index)=>{
      const panel=this.panel(root,block.id,block.title||TYPES[block.type]||'Bloque');this.reorderHandle(panel,this.config.blocks,index,'blocks');this.blockEditor(panel,block);
      const toolbar=document.createElement('div');toolbar.className='toolbar';panel.append(toolbar);
      this.button(toolbar,'Duplicar bloque',()=>{const copy=clone(block);copy.id=uid();copy.fields?.forEach(f=>f.id=uid());copy.prices?.forEach(f=>f.id=uid());copy.groups?.forEach(g=>{g.id=uid();g.fields?.forEach(f=>f.id=uid());});this.config.blocks.splice(index+1,0,copy);this.emit();this.render();});
      this.button(toolbar,'Eliminar bloque',()=>{this.config.blocks.splice(index,1);this.emit();this.render();},true);
    });
    const add=document.createElement('div');add.className='add';const picker=document.createElement('select');picker.setAttribute('aria-label',this.t('Tipo de bloque'));for(const [type,label]of Object.entries(TYPES)){const option=document.createElement('option');option.value=type;option.textContent=this.t(label);picker.append(option);}add.append(picker);
    this.button(add,'＋ Añadir bloque',()=>{const block=newBlock(picker.value);block.title=this.t(block.title);if(block.note)block.note=this.t(block.note);this.config.blocks.push(block);this.openKey=block.id;this.emit();this.render();});root.append(add);
    root.querySelectorAll('details[data-key]').forEach(el=>{if(state.has(el.dataset.key))el.open=state.get(el.dataset.key);if(el.dataset.key===this.openKey){el.open=true;let parent=el.parentElement?.closest('details');while(parent){parent.open=true;parent=parent.parentElement?.closest('details');}}});this.openKey=null;
    for(const [node,top]of scroll)node.scrollTop=top;this.updateWarnings();
  }
}
if(!customElements.get('ve-builder-card-editor'))customElements.define('ve-builder-card-editor',VEBuilderEditor);
